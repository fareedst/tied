/**
 * [IMPL-TIED_TWO_FOLDER_LAYOUT] [ARCH-TIED_PROJECT_CONFIG_OWNERSHIP] [REQ-TIED_TWO_FOLDER_LAYOUT]
 * How: Resolve and load project config (tied-project/config.yaml) with legacy tied-project/config.yaml fallback.
 */
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { resolveTiedLayout } from "./tied-layout.js";

export const PROJECT_CONFIG_SCHEMA_V1 = "tied-project-config.v1";

const PROJECT_CONFIG_TOP_LEVEL_KEYS = new Set([
  "schema",
  "yaml",
  "jev",
  "dae",
  "bbce",
  "tool_safety",
  "citdp",
  "methodology",
  "install_defaults",
  "working",
]);

const LEGACY_ROOT_PROJECT_KEYS = new Set([
  "scalar_style",
  "client_formatter",
  "jev",
  "dae",
  "bbce",
  "tool_safety",
  "citdp",
  "methodology",
  "install_defaults",
  "working",
]);

export type ProjectConfigSource = "project-config-v1" | "legacy-root-yaml";

export class TiedProjectConfigError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "TiedProjectConfigError";
    this.code = code;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function resolveProjectConfigPath(projectRoot: string): {
  path: string;
  source: ProjectConfigSource;
} | null {
  const root = path.resolve(projectRoot);
  const layout = resolveTiedLayout(root);
  if (fs.existsSync(layout.projectConfigPath)) {
    return { path: layout.projectConfigPath, source: "project-config-v1" };
  }
  const legacyRoot = path.join(root, ".tied-yaml.yaml");
  if (fs.existsSync(legacyRoot)) {
    return { path: legacyRoot, source: "legacy-root-yaml" };
  }
  return null;
}

/** Resolve config path from TIED_BASE_PATH (parent = project root). */
export function resolveProjectConfigPathFromTiedBase(tiedBasePath: string): {
  path: string;
  source: ProjectConfigSource;
} | null {
  return resolveProjectConfigPath(path.dirname(path.resolve(tiedBasePath)));
}

export function normalizeLegacyRootYamlToProjectRecord(raw: Record<string, unknown>): Record<string, unknown> {
  const next: Record<string, unknown> = { schema: PROJECT_CONFIG_SCHEMA_V1, yaml: {} };
  const yamlSection = next.yaml as Record<string, unknown>;
  if (raw.scalar_style !== undefined) {
    yamlSection.scalar_style = raw.scalar_style;
  }
  if (raw.client_formatter !== undefined) {
    yamlSection.client_formatter = raw.client_formatter;
  }
  for (const key of [
    "jev",
    "dae",
    "bbce",
    "tool_safety",
    "citdp",
    "methodology",
    "install_defaults",
    "working",
  ] as const) {
    if (raw[key] !== undefined) {
      next[key] = raw[key];
    }
  }
  return next;
}

function validateProjectConfigRecord(record: Record<string, unknown>, source: ProjectConfigSource): void {
  if (source === "project-config-v1") {
    if (record.schema !== PROJECT_CONFIG_SCHEMA_V1) {
      throw new TiedProjectConfigError("PROJECT_CONFIG_INVALID", "Missing or invalid project config schema.");
    }
    for (const key of Object.keys(record)) {
      if (!PROJECT_CONFIG_TOP_LEVEL_KEYS.has(key)) {
        throw new TiedProjectConfigError("CONFIG_UNKNOWN_KEY", `Unknown project config key: ${key}`);
      }
    }
    return;
  }
  for (const key of Object.keys(record)) {
    if (!LEGACY_ROOT_PROJECT_KEYS.has(key)) {
      throw new TiedProjectConfigError("CONFIG_UNKNOWN_KEY", `Unknown legacy config key: ${key}`);
    }
  }
}

/** Flat record for existing readers (scalar_style at root when present). */
export function projectConfigToLegacyFlatView(normalized: Record<string, unknown>): Record<string, unknown> {
  const yamlSection = isRecord(normalized.yaml) ? normalized.yaml : {};
  const flat: Record<string, unknown> = { ...normalized };
  if (yamlSection.scalar_style !== undefined) {
    flat.scalar_style = yamlSection.scalar_style;
  }
  if (yamlSection.client_formatter !== undefined) {
    flat.client_formatter = yamlSection.client_formatter;
  }
  delete flat.schema;
  delete flat.yaml;
  return flat;
}

export function loadProjectConfig(projectRoot: string): {
  record: Record<string, unknown>;
  flat: Record<string, unknown>;
  configPath: string;
  source: ProjectConfigSource;
} | null {
  const resolved = resolveProjectConfigPath(projectRoot);
  if (!resolved) {
    return null;
  }
  let raw: unknown;
  try {
    raw = yaml.load(fs.readFileSync(resolved.path, "utf8"));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new TiedProjectConfigError(
      "PROJECT_CONFIG_INVALID",
      `Unable to parse project config ${resolved.path}: ${message}`,
    );
  }
  if (!isRecord(raw)) {
    throw new TiedProjectConfigError("PROJECT_CONFIG_INVALID", "Project config must be a mapping.");
  }
  validateProjectConfigRecord(raw, resolved.source);
  const record =
    resolved.source === "legacy-root-yaml" ? normalizeLegacyRootYamlToProjectRecord(raw) : raw;
  return {
    record,
    flat: projectConfigToLegacyFlatView(record),
    configPath: resolved.path,
    source: resolved.source,
  };
}

export function readRepoTiedYaml(projectRoot: string): Record<string, unknown> | undefined {
  const loaded = loadProjectConfig(projectRoot);
  return loaded?.flat;
}

export function assertConfigKeyOwnership(
  project: Record<string, unknown> | null | undefined,
  install: Record<string, unknown> | null | undefined,
): void {
  const installActualKeys = new Set(["mode", "harness", "layers", "methodology_bundle"]);
  if (install) {
    for (const key of Object.keys(install)) {
      if (PROJECT_CONFIG_TOP_LEVEL_KEYS.has(key) && key !== "schema") {
        throw new TiedProjectConfigError(
          "CONFIG_KEY_OWNERSHIP_VIOLATION",
          `Install config must not contain project key: ${key}`,
        );
      }
    }
  }
  if (project) {
    for (const key of Object.keys(project)) {
      if (installActualKeys.has(key)) {
        throw new TiedProjectConfigError(
          "CONFIG_KEY_OWNERSHIP_VIOLATION",
          `Project config must not contain install key: ${key}`,
        );
      }
    }
  }
}
