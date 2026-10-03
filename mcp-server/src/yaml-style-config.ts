import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { resolveProjectConfigPathFromTiedBase } from "./tied-project-config.js";
import { resolveProjectDirName } from "./tied-layout.js";

export const YAML_SCALAR_STYLES = ["unwrapped", "wrapped"] as const;
export type YamlScalarStyle = (typeof YAML_SCALAR_STYLES)[number];
export type YamlStyleSource = "repository" | "environment" | "xdg" | "default";

export type ResolvedYamlStyle = {
  scalar_style: YamlScalarStyle;
  style_source: YamlStyleSource;
  config_path?: string;
};

export type StylingStatus = "configured" | "not_configured";

export type ClientFormatterDeclaration = {
  command: string;
  args: string[];
  version?: string;
};

export type ResolvedClientFormatter = {
  styling_status: StylingStatus;
  scalar_style?: YamlScalarStyle;
  formatter?: ClientFormatterDeclaration;
  config_path?: string;
};

const CLIENT_FORMATTER_ALLOWED_KEYS = new Set(["command", "args", "version"]);

export class YamlStyleConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "YamlStyleConfigurationError";
  }
}

export function getDefaultTiedBasePath(): string {
  const configured = process.env.TIED_BASE_PATH ?? "tied";
  return path.isAbsolute(configured) ? configured : path.resolve(process.cwd(), configured);
}

function isTiedProjectRoot(projectRoot: string): boolean {
  const { dirName } = resolveProjectDirName(projectRoot);
  const tiedDir = path.join(projectRoot, dirName);
  if (!fs.existsSync(tiedDir) || !fs.statSync(tiedDir).isDirectory()) {
    return false;
  }
  return (
    fs.existsSync(path.join(tiedDir, "requirements.yaml")) ||
    fs.existsSync(path.join(tiedDir, "semantic-tokens.yaml"))
  );
}

function isTiedTraceabilityDir(dir: string): boolean {
  return (
    fs.existsSync(path.join(dir, "requirements.yaml")) ||
    fs.existsSync(path.join(dir, "semantic-tokens.yaml"))
  );
}

/** Walk upward from a YAML file path to find the client tied directory under a TIED project. */
export function resolveTiedBasePathForYamlFile(filePath: string): string | undefined {
  let dir = path.dirname(path.resolve(filePath));
  for (;;) {
    if (isTiedTraceabilityDir(dir)) {
      return dir;
    }
    if (isTiedProjectRoot(dir)) {
      return path.join(dir, resolveProjectDirName(dir).dirName);
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      return undefined;
    }
    dir = parent;
  }
}

/** Prefer the TIED project containing the YAML file; otherwise MCP/CLI default. */
export function tiedBasePathForYamlContext(contextFilePath?: string): string {
  if (contextFilePath) {
    const fromFile = resolveTiedBasePathForYamlFile(contextFilePath);
    if (fromFile) {
      return fromFile;
    }
  }
  return getDefaultTiedBasePath();
}

function parseConfigFile(filePath: string): unknown {
  let raw: string;
  try {
    raw = fs.readFileSync(filePath, "utf8");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new YamlStyleConfigurationError(
      `Unable to read YAML style configuration ${filePath}: ${message}`,
    );
  }

  try {
    return yaml.load(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new YamlStyleConfigurationError(
      `Invalid YAML style configuration ${filePath}: ${message}`,
    );
  }
}

function styleFromValue(value: unknown, sourcePath: string): YamlScalarStyle {
  if (typeof value === "string" && YAML_SCALAR_STYLES.includes(value as YamlScalarStyle)) {
    return value as YamlScalarStyle;
  }
  throw new YamlStyleConfigurationError(
    `Invalid scalar_style in ${sourcePath}: expected one of ${YAML_SCALAR_STYLES.join(", ")}.`,
  );
}

function repoConfigRecord(config: unknown, sourcePath: string): Record<string, unknown> {
  if (config === null || typeof config !== "object" || Array.isArray(config)) {
    throw new YamlStyleConfigurationError(
      `Invalid YAML style configuration ${sourcePath}: expected a mapping.`,
    );
  }
  return config as Record<string, unknown>;
}

function scalarStyleFromRepoConfig(record: Record<string, unknown>, sourcePath: string): YamlScalarStyle {
  const yamlSection = record.yaml;
  if (yamlSection !== null && typeof yamlSection === "object" && !Array.isArray(yamlSection)) {
    const nested = (yamlSection as Record<string, unknown>).scalar_style;
    if (nested !== undefined) {
      return styleFromValue(nested, sourcePath);
    }
  }
  const scalarStyle = record.scalar_style;
  if (scalarStyle === undefined) {
    // [REQ-TIED_YAML_STYLE_CONFIGURATION] RISK-STYLE-GATE-006: formatter-only repo config defaults unwrapped.
    if (record.client_formatter !== undefined) {
      return "unwrapped";
    }
    const yamlFormatter =
      yamlSection !== null && typeof yamlSection === "object" && !Array.isArray(yamlSection)
        ? (yamlSection as Record<string, unknown>).client_formatter
        : undefined;
    if (yamlFormatter !== undefined) {
      return "unwrapped";
    }
    throw new YamlStyleConfigurationError(
      `Invalid YAML style configuration ${sourcePath}: missing scalar_style.`,
    );
  }
  return styleFromValue(scalarStyle, sourcePath);
}

function styleFromConfig(config: unknown, sourcePath: string): YamlScalarStyle {
  return scalarStyleFromRepoConfig(repoConfigRecord(config, sourcePath), sourcePath);
}

// [IMPL-TIED_YAML_STYLE_RESOLVER] [ARCH-TIED_YAML_STYLE_RESOLUTION] [REQ-TIED_YAML_STYLE_CONFIGURATION]
// How: Restrict hook config to command plus optional args list and opaque version string.
export function validateFormatterDeclaration(formatter: unknown): ClientFormatterDeclaration {
  if (formatter === null || typeof formatter !== "object" || Array.isArray(formatter)) {
    throw new YamlStyleConfigurationError(
      "Invalid client_formatter: expected a mapping with command.",
    );
  }
  const record = formatter as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (!CLIENT_FORMATTER_ALLOWED_KEYS.has(key)) {
      throw new YamlStyleConfigurationError(
        `Invalid client_formatter: unknown key ${JSON.stringify(key)}.`,
      );
    }
  }
  const command = record.command;
  if (typeof command !== "string" || command.trim().length === 0) {
    throw new YamlStyleConfigurationError(
      "Invalid client_formatter: command must be a non-empty string.",
    );
  }
  let args: string[] = [];
  if (record.args !== undefined) {
    if (!Array.isArray(record.args) || record.args.some((item) => typeof item !== "string")) {
      throw new YamlStyleConfigurationError(
        "Invalid client_formatter: args must be a string list when present.",
      );
    }
    args = record.args as string[];
  }
  const version = record.version;
  if (version !== undefined && typeof version !== "string") {
    throw new YamlStyleConfigurationError(
      "Invalid client_formatter: version must be a string when present.",
    );
  }
  return version === undefined
    ? { command: command.trim(), args }
    : { command: command.trim(), args, version };
}

function resolveRepositoryConfigPath(tiedBasePath: string): string | undefined {
  const resolved = resolveProjectConfigPathFromTiedBase(tiedBasePath);
  return resolved?.path;
}

// [IMPL-TIED_TWO_FOLDER_LAYOUT] [IMPL-TIED_YAML_STYLE_RESOLVER] [REQ-TIED_YAML_STYLE_CONFIGURATION]
// How: Parse client_formatter from project config (tied-project/config.yaml or legacy tied-project/config.yaml).
export function resolveClientFormatter(
  tiedBasePath: string = getDefaultTiedBasePath(),
): ResolvedClientFormatter {
  const repoConfigPath = resolveRepositoryConfigPath(tiedBasePath);
  if (!repoConfigPath) {
    return { styling_status: "not_configured" };
  }
  const record = repoConfigRecord(parseConfigFile(repoConfigPath), repoConfigPath);
  const scalarStyle = scalarStyleFromRepoConfig(record, repoConfigPath);
  const yamlSection =
    record.yaml !== null && typeof record.yaml === "object" && !Array.isArray(record.yaml)
      ? (record.yaml as Record<string, unknown>)
      : undefined;
  const formatterValue = record.client_formatter ?? yamlSection?.client_formatter;
  if (formatterValue === undefined) {
    return { styling_status: "not_configured", scalar_style: scalarStyle, config_path: repoConfigPath };
  }
  const formatter = validateFormatterDeclaration(formatterValue);
  if (formatter.command.length === 0) {
    return { styling_status: "not_configured", scalar_style: scalarStyle, config_path: repoConfigPath };
  }
  return {
    styling_status: "configured",
    scalar_style: scalarStyle,
    formatter,
    config_path: repoConfigPath,
  };
}

function globalConfigPath(environment: NodeJS.ProcessEnv): string {
  const xdgHome = environment.XDG_CONFIG_HOME;
  if (xdgHome) {
    return path.join(path.isAbsolute(xdgHome) ? xdgHome : path.resolve(xdgHome), "tied", "yaml-format.yaml");
  }
  const home = environment.HOME;
  if (!home) return path.join(".config", "tied", "yaml-format.yaml");
  return path.join(home, ".config", "tied", "yaml-format.yaml");
}

/**
 * Resolve the repository-wide scalar style.
 *
 * Precedence is repository project config (`tied-project/config.yaml` or legacy
 * `tied-project/config.yaml`), `TIED_YAML_STYLE`, the optional XDG config file, then the
 * unwrapped default. An explicit invalid setting is an error and never falls
 * through to a lower-priority source.
 */
export function resolveYamlStyle(
  tiedBasePath: string = getDefaultTiedBasePath(),
  environment: NodeJS.ProcessEnv = process.env,
): ResolvedYamlStyle {
  const repoConfigPath = resolveRepositoryConfigPath(tiedBasePath);
  if (repoConfigPath && fs.existsSync(repoConfigPath)) {
    return {
      scalar_style: styleFromConfig(parseConfigFile(repoConfigPath), repoConfigPath),
      style_source: "repository",
      config_path: repoConfigPath,
    };
  }

  if (environment.TIED_YAML_STYLE !== undefined) {
    return {
      scalar_style: styleFromValue(environment.TIED_YAML_STYLE, "TIED_YAML_STYLE"),
      style_source: "environment",
      config_path: "TIED_YAML_STYLE",
    };
  }

  const xdgPath = globalConfigPath(environment);
  if (fs.existsSync(xdgPath)) {
    return {
      scalar_style: styleFromConfig(parseConfigFile(xdgPath), xdgPath),
      style_source: "xdg",
      config_path: xdgPath,
    };
  }

  return { scalar_style: "unwrapped", style_source: "default" };
}

export function yamlDumpOptionsForStyle(style: YamlScalarStyle): yaml.DumpOptions {
  return style === "wrapped"
    ? {
        forceQuotes: true,
        quotingType: '"',
        noCompatMode: true,
      }
    : {
        forceQuotes: false,
        noCompatMode: true,
      };
}
