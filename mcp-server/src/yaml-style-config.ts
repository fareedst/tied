import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

export const YAML_SCALAR_STYLES = ["unwrapped", "wrapped"] as const;
export type YamlScalarStyle = (typeof YAML_SCALAR_STYLES)[number];
export type YamlStyleSource = "repository" | "environment" | "xdg" | "default";

export type ResolvedYamlStyle = {
  scalar_style: YamlScalarStyle;
  style_source: YamlStyleSource;
  config_path?: string;
};

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

function styleFromConfig(config: unknown, sourcePath: string): YamlScalarStyle {
  if (config === null || typeof config !== "object" || Array.isArray(config)) {
    throw new YamlStyleConfigurationError(
      `Invalid YAML style configuration ${sourcePath}: expected a mapping with scalar_style.`,
    );
  }
  const scalarStyle = (config as Record<string, unknown>).scalar_style;
  if (scalarStyle === undefined) {
    throw new YamlStyleConfigurationError(
      `Invalid YAML style configuration ${sourcePath}: missing scalar_style.`,
    );
  }
  return styleFromValue(scalarStyle, sourcePath);
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
 * Precedence is repository `.tied-yaml.yaml`, `TIED_YAML_STYLE`, the optional
 * XDG config file, then the unwrapped default. An explicit invalid setting is
 * an error and never falls through to a lower-priority source.
 */
export function resolveYamlStyle(
  tiedBasePath: string = getDefaultTiedBasePath(),
  environment: NodeJS.ProcessEnv = process.env,
): ResolvedYamlStyle {
  const repoConfigPath = path.join(path.dirname(tiedBasePath), ".tied-yaml.yaml");
  if (fs.existsSync(repoConfigPath)) {
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
