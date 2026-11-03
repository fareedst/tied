/**
 * [REQ-TIED_CONFIG_REPORT] [IMPL-TIED_CONFIG_REPORT] [ARCH-TIED_CONFIG_REPORT]
 * Central read-only TIED configuration report with provenance.
 */
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { jsonSafeAbsolute } from "./paths.mjs";
import {
  loadMergedOperatorConfig,
  mapOperatorConfigToMcpEnv,
  OPERATOR_BOOL_MCP_FIELDS,
  OPERATOR_STRING_MCP_FIELDS,
  OPERATOR_TOGGLE_ENV_KEYS,
  readOperatorBooleanField,
  readOperatorStringField,
  readTiedYamlServerEntryFromProject,
  resolveTiedRuntimeConfig,
  STORE_YAML_REL,
} from "./tied-runtime-config.mjs";

export const REPORT_SCHEMA = "tied-config-report.v1";

/** @type {readonly string[]} Explicit secret env keys (no wildcards). */
export const SECRET_ENV_KEYS = ["JEV_API_KEY"];

const IGNORED_GLOBAL_SHELL_KEYS = ["TIED_MCP_BIN", "TIED_REPO_ROOT", "TIED_STORE_ROOT"];

const MCP_SPAWN_ENV_KEYS = [
  "TIED_CLIENT_PROJECT_PATH",
  "TIED_CLIENT_BUNDLE_PATH",
  "TIED_BASE_PATH",
  "TIED_METHODOLOGY_BUNDLE_PATH",
  "TIED_STORE_ROOT",
  "TIED_MCP_TOOL_PROFILE",
];

const CLI_SESSION_ENV_KEYS = [
  "TIED_CLI_IMPL_ESSENCE_FILE",
  "TIED_CLI_IMPL_ESSENCE_STDIN",
  "TIED_CLI_QUIET_MCP_STDERR",
  "TIED_MCP_METRICS_PATH",
  "TIED_MCP_METRICS_CLIENT",
];

const OPERATOR_CONFIGURE_VIA =
  "Edit operator section in .tied/store.yaml or .tied/operator.local.yaml; run ./tied-install.sh --refresh on clients";

/**
 * @param {unknown} value
 */
function envString(value) {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

/**
 * @param {string} storeRoot
 * @param {string} section
 * @param {string} field
 */
function operatorSourceRef(storeRoot, section, field) {
  const hasLocal = fs.existsSync(path.join(storeRoot, ".tied", "operator.local.yaml"));
  const base = hasLocal ? ".tied/operator.local.yaml" : STORE_YAML_REL;
  return `${base}#operator.${section}.${field}`;
}

/**
 * @param {Record<string, unknown>} operator
 * @param {{ section: string; field: string; envKey: string }} spec
 * @param {Record<string, string>} mcpEnv
 */
function buildOperatorToggleEntry(storeRoot, operator, spec, mcpEnv) {
  const diskBool = readOperatorBooleanField(operator, spec.section, spec.field);
  const diskStr = readOperatorStringField(operator, spec.section, spec.field);
  const sec = operator[spec.section];
  const diskDefined =
    diskBool !== null ||
    (diskStr !== null && sec && typeof sec === "object" && spec.field in sec);
  const mcpVal = mcpEnv[spec.envKey];
  let effective = mcpVal ?? null;
  let source_kind = "unset";
  let source_ref = "";
  if (diskDefined) {
    source_kind = "store_yaml";
    source_ref = operatorSourceRef(storeRoot, spec.section, spec.field);
    if (diskBool === true) {
      effective = "1";
    } else if (diskBool === false) {
      effective = null;
    } else if (diskStr !== null) {
      effective = diskStr === "" ? null : diskStr;
    }
  } else if (mcpVal !== undefined) {
    source_kind = "mcp_json";
    source_ref = `.cursor/mcp.json:mcpServers.tied-yaml.env.${spec.envKey}`;
  }
  return {
    key: spec.envKey,
    effective,
    source_kind,
    source_ref,
    configure_via: OPERATOR_CONFIGURE_VIA,
    redacted: false,
  };
}

/**
 * @param {string} clientProjectPath
 */
function readIdentityMarkerDisplay(clientProjectPath) {
  if (!clientProjectPath) {
    return null;
  }
  const markerPath = path.join(clientProjectPath, "project-identity.v1.yaml");
  if (!fs.existsSync(markerPath)) {
    return null;
  }
  try {
    const doc = yaml.load(fs.readFileSync(markerPath, "utf8"));
    if (!doc || typeof doc !== "object" || Array.isArray(doc)) {
      return null;
    }
    const identity = /** @type {Record<string, unknown>} */ (doc).identity;
    if (!identity || typeof identity !== "object" || Array.isArray(identity)) {
      return { marker_path: markerPath };
    }
    const id = /** @type {Record<string, unknown>} */ (identity);
    const projectId = typeof id.project_id === "string" ? id.project_id : undefined;
    return {
      marker_path: markerPath,
      routing: typeof id.routing === "string" ? id.routing : undefined,
      writable_root: typeof id.writable_root === "string" ? id.writable_root : undefined,
      project_id_prefix: projectId ? projectId.slice(0, 8) : undefined,
    };
  } catch {
    return { marker_path: markerPath, parse_error: true };
  }
}

/**
 * @param {string} clientProjectPath
 */
function readProjectConfigDisplay(clientProjectPath) {
  if (!clientProjectPath) {
    return null;
  }
  const configPath = path.join(clientProjectPath, "config.yaml");
  if (!fs.existsSync(configPath)) {
    return null;
  }
  try {
    const doc = yaml.load(fs.readFileSync(configPath, "utf8"));
    const yamlSection =
      doc && typeof doc === "object" && !Array.isArray(doc)
        ? /** @type {Record<string, unknown>} */ (doc).yaml
        : undefined;
    const scalarStyle =
      yamlSection &&
      typeof yamlSection === "object" &&
      !Array.isArray(yamlSection) &&
      typeof /** @type {Record<string, unknown>} */ (yamlSection).scalar_style === "string"
        ? /** @type {Record<string, unknown>} */ (yamlSection).scalar_style
        : undefined;
    return { path: configPath, scalar_style: scalarStyle ?? null };
  } catch {
    return { path: configPath, parse_error: true };
  }
}

/**
 * @param {Record<string, string>} processEnv
 * @param {string} key
 * @param {string | null | undefined} effectiveFromDisk
 * @param {string} effectiveFromLabel
 * @returns {{ key: string; shell_value: string; effective_from: string } | null}
 */
function shellIgnoredEntry(processEnv, key, effectiveFromDisk, effectiveFromLabel) {
  const shellVal = envString(processEnv[key]);
  if (!shellVal) {
    return null;
  }
  if (IGNORED_GLOBAL_SHELL_KEYS.includes(key)) {
    return { key, shell_value: shellVal, effective_from: effectiveFromLabel };
  }
  if (OPERATOR_TOGGLE_ENV_KEYS.includes(key) && effectiveFromDisk !== shellVal) {
    return { key, shell_value: shellVal, effective_from: effectiveFromLabel };
  }
  return null;
}

/**
 * @param {{ cwd?: string; processEnv?: NodeJS.ProcessEnv; includeSecrets?: boolean }} params
 */
export function buildTiedConfigReport(params = {}) {
  const cwd = params.cwd ?? process.cwd();
  const processEnv = params.processEnv ?? process.env;
  const includeSecrets = params.includeSecrets === true;

  const runtime = resolveTiedRuntimeConfig({
    cwd,
    processEnv,
    requireDistExists: false,
  });

  const mcpEntry = readTiedYamlServerEntryFromProject(runtime.projectRoot);
  const mcpEnv = mcpEntry?.env ?? {};
  const mcpRel = mcpEntry?.relPath ?? ".cursor/mcp.json";

  const operator = loadMergedOperatorConfig(runtime.storeRoot);
  const mapped = mapOperatorConfigToMcpEnv(operator, mcpEnv);

  /** @type {import("./tied-config-report.mjs").ReportSection[]} */
  const sections = [];

  sections.push({
    id: "paths",
    title: "Paths",
    entries: [
      entryPath("store_root", runtime.storeRoot, runtime.sources, "store"),
      entryPath("mcp_dist_path", runtime.mcpDistPath, runtime.sources, "mcp"),
      entryPath(
        "client_project_path",
        runtime.clientProjectPath ?? null,
        runtime.sources,
        "mcp",
      ),
      entryPath(
        "client_bundle_path",
        runtime.clientBundlePath ?? null,
        runtime.sources,
        "mcp",
      ),
      entryPath("project_root", runtime.projectRoot, runtime.sources, "derived"),
    ].filter(Boolean),
  });

  /** @type {Record<string, unknown>[]} */
  const operatorEntries = [];
  for (const spec of OPERATOR_BOOL_MCP_FIELDS) {
    operatorEntries.push(
      buildOperatorToggleEntry(runtime.storeRoot, operator, spec, { ...mcpEnv, ...mapped.set }),
    );
  }
  for (const spec of OPERATOR_STRING_MCP_FIELDS) {
    operatorEntries.push(
      buildOperatorToggleEntry(runtime.storeRoot, operator, spec, { ...mcpEnv, ...mapped.set }),
    );
  }
  sections.push({
    id: "operator_toggles",
    title: "Operator toggles",
    entries: operatorEntries,
  });

  /** @type {Record<string, unknown>[]} */
  const mcpSpawnEntries = [];
  for (const key of MCP_SPAWN_ENV_KEYS) {
    const val = mcpEnv[key];
    if (val === undefined) {
      continue;
    }
    mcpSpawnEntries.push({
      key,
      effective: val,
      source_kind: "mcp_json",
      source_ref: `${mcpRel}:mcpServers.tied-yaml.env.${key}`,
      configure_via: "Run ./tied-install.sh --refresh; edit .cursor/mcp.json only for brownfield overrides",
      redacted: false,
    });
  }
  sections.push({
    id: "mcp_spawn_env",
    title: "MCP spawn env (tied-yaml)",
    entries: mcpSpawnEntries,
  });

  /** @type {Record<string, unknown>[]} */
  const cliEntries = [];
  for (const key of CLI_SESSION_ENV_KEYS) {
    const val = envString(processEnv[key]);
    if (!val) {
      continue;
    }
    cliEntries.push({
      key,
      effective: val,
      source_kind: "env",
      source_ref: `process.env.${key}`,
      configure_via: "Shell session only (CLI transport); not written by tied-install",
      redacted: false,
    });
  }
  sections.push({
    id: "cli_session",
    title: "CLI session transport",
    entries: cliEntries,
  });

  /** @type {Record<string, unknown>[]} */
  const secretEntries = [];
  for (const key of SECRET_ENV_KEYS) {
    const val = envString(processEnv[key]);
    const present = Boolean(val);
    secretEntries.push({
      key,
      effective: includeSecrets && present ? val : null,
      present,
      source_kind: "env",
      source_ref: `process.env.${key}`,
      configure_via: "Cursor MCP env or shell export (never commit)",
      redacted: !includeSecrets,
    });
  }
  sections.push({
    id: "secrets",
    title: "Secrets catalog",
    entries: secretEntries,
  });

  const effectiveFromLabel = runtime.sources?.length
    ? runtime.sources[0]
    : `mcp:${mcpRel}`;
  /** @type {{ key: string; shell_value: string; effective_from: string }[]} */
  const shellIgnored = [];
  for (const key of [...IGNORED_GLOBAL_SHELL_KEYS, ...OPERATOR_TOGGLE_ENV_KEYS]) {
    const effectiveToggle = mapped.set[key] ?? mcpEnv[key];
    const ignored = shellIgnoredEntry(processEnv, key, effectiveToggle, effectiveFromLabel);
    if (ignored) {
      shellIgnored.push(ignored);
    }
  }

  const layout_mode = runtime.clientProjectPath ? "client" : "store";
  const mcp_dist_missing = !fs.existsSync(runtime.mcpDistPath);

  return {
    schema: REPORT_SCHEMA,
    generated_at: new Date().toISOString(),
    cwd: path.resolve(cwd),
    layout_mode,
    mcp_dist_missing,
    paths: {
      store_root: jsonSafeAbsolute(runtime.storeRoot),
      mcp_dist_path: jsonSafeAbsolute(runtime.mcpDistPath),
      client_project_path: runtime.clientProjectPath
        ? jsonSafeAbsolute(runtime.clientProjectPath)
        : null,
      client_bundle_path: runtime.clientBundlePath
        ? jsonSafeAbsolute(runtime.clientBundlePath)
        : null,
      project_root: jsonSafeAbsolute(runtime.projectRoot),
      config_sources: [...(runtime.sources ?? [])],
    },
    sections,
    shell_ignored: shellIgnored,
    identity_marker: readIdentityMarkerDisplay(runtime.clientProjectPath ?? ""),
    project_config: readProjectConfigDisplay(runtime.clientProjectPath ?? ""),
    notes: [
      "Live corpus routing (marker_only vs env_dual_read): tied-cli.sh tied_config_get_base_path",
      "Full path authority introspection: tied_config_get_base_path (unchanged JSON shape)",
    ],
  };
}

/**
 * @param {string} key
 * @param {string | null} effective
 * @param {string[]} sources
 * @param {"store" | "mcp" | "derived"} kind
 */
function entryPath(key, effective, sources, kind) {
  if (effective == null) {
    return null;
  }
  const source_kind =
    kind === "store" ? "store_yaml" : kind === "mcp" ? "mcp_json" : "derived";
  const source_ref =
    kind === "store"
      ? STORE_YAML_REL
      : kind === "mcp"
        ? sources.find((s) => s.startsWith("mcp:")) ?? "mcp:.cursor/mcp.json"
        : "resolveTiedRuntimeConfig";
  return {
    key,
    effective: jsonSafeAbsolute(effective),
    source_kind,
    source_ref,
    configure_via:
      kind === "mcp"
        ? "Run ./tied-install.sh --refresh; client .cursor/mcp.json tied-yaml env"
        : kind === "store"
          ? "Edit .tied/store.yaml and store.local.yaml on the methodology store"
          : "Derived from install layout and cwd",
    redacted: false,
  };
}

/**
 * @param {ReturnType<typeof buildTiedConfigReport>} report
 */
export function formatTiedConfigReportText(report) {
  const lines = [];
  lines.push(`TIED config report (${report.schema})`);
  lines.push(`cwd: ${report.cwd}`);
  lines.push(`layout: ${report.layout_mode}`);
  if (report.mcp_dist_missing) {
    lines.push("WARNING: mcp_dist_path missing on disk");
  }
  lines.push("");
  lines.push("[paths]");
  for (const [k, v] of Object.entries(report.paths)) {
    if (k === "config_sources") {
      lines.push(`  config_sources: ${(v ?? []).join(", ")}`);
    } else {
      lines.push(`  ${k}: ${v ?? "(unset)"}`);
    }
  }
  for (const section of report.sections) {
    lines.push("");
    lines.push(`[${section.id}] ${section.title}`);
    for (const entry of section.entries) {
      const eff =
        entry.redacted && !entry.effective
          ? entry.present
            ? "[REDACTED present]"
            : "(unset)"
          : String(entry.effective ?? "(unset)");
      lines.push(`  ${entry.key}: ${eff}`);
      lines.push(`    source: ${entry.source_kind} ${entry.source_ref}`);
    }
  }
  if (report.shell_ignored.length) {
    lines.push("");
    lines.push("[shell_ignored]");
    for (const row of report.shell_ignored) {
      lines.push(`  ${row.key}: shell=${row.shell_value} effective_from=${row.effective_from}`);
    }
  }
  return `${lines.join("\n")}\n`;
}
