import fs from "node:fs";
import path from "node:path";

export type DefaultSource = "explicit" | "environment" | "local";
export type ResolvedDefault = {
  value: string;
  source: DefaultSource;
  exists: boolean;
  corrective_command: string;
};
export type DefaultReport = {
  mcp_bin: ResolvedDefault;
  base_path: ResolvedDefault;
  constitution: ResolvedDefault;
  feature_directory: ResolvedDefault;
  mutating: false;
};
export type DefaultOptions = {
  mcpBin?: string;
  basePath?: string;
  constitution?: string;
  featureDirectory?: string;
};
export type DefaultResolution =
  | { ok: true; defaults: DefaultReport; report: DefaultReport; mutated_configuration: false }
  | { ok: false; diagnostics: string[]; report: DefaultReport; mutated_configuration: false };

function choose(explicit: string | undefined, environment: string | undefined, local: string): { value: string; source: DefaultSource } {
  if (explicit) return { value: path.resolve(explicit), source: "explicit" };
  if (environment) return { value: path.resolve(environment), source: "environment" };
  return { value: path.resolve(local), source: "local" };
}

function item(value: string, source: DefaultSource, corrective_command: string): ResolvedDefault {
  return { value, source, exists: fs.existsSync(value), corrective_command };
}

// [IMPL-FEAT_LOCAL_DEFAULTS] [ARCH-FEAT_LOCAL_DEFAULT_RESOLUTION] [REQ-FEAT_LOCAL_DEFAULTS] — resolve local defaults deterministically without writing configuration.
export function resolveLocalDefaults(options: DefaultOptions = {}, environment: NodeJS.ProcessEnv = process.env, projectRoot = process.cwd()): DefaultResolution {
  const root = path.resolve(projectRoot);
  const mcp = choose(options.mcpBin, environment.TIED_MCP_BIN, path.join(root, "mcp-server", "dist", "index.js"));
  const base = choose(options.basePath, environment.TIED_BASE_PATH, path.join(root, "tied"));
  const constitution = options.constitution
    ? { value: path.resolve(options.constitution), source: "explicit" as const }
    : { value: path.resolve(path.join(base.value, "constitution.yaml")), source: base.source };
  const featureDirectory = options.featureDirectory
    ? { value: path.resolve(options.featureDirectory), source: "explicit" as const }
    : { value: path.resolve(path.join(base.value, "features")), source: base.source };
  const report: DefaultReport = {
    mcp_bin: item(mcp.value, mcp.source, "npm run build --prefix mcp-server"),
    base_path: item(base.value, base.source, `mkdir -p "${base.value}"`),
    constitution: item(constitution.value, constitution.source, `cp tied/constitution.example.yaml "${constitution.value}"`),
    feature_directory: item(featureDirectory.value, featureDirectory.source, `mkdir -p "${featureDirectory.value}"`),
    mutating: false,
  };
  const diagnostics: string[] = [];
  if (!report.mcp_bin.exists) diagnostics.push(`TIED_MCP_BIN is unavailable at ${report.mcp_bin.value}; corrective command: ${report.mcp_bin.corrective_command}`);
  return diagnostics.length > 0
    ? { ok: false, diagnostics, report, mutated_configuration: false }
    : { ok: true, defaults: report, report, mutated_configuration: false };
}

// [IMPL-FEAT_LOCAL_DEFAULTS] [ARCH-FEAT_LOCAL_DEFAULT_RESOLUTION] [REQ-FEAT_LOCAL_DEFAULTS] — expose source and corrective-command fields.
export function formatDefaultSourceReport(report: DefaultReport): DefaultReport {
  return {
    mcp_bin: { ...report.mcp_bin },
    base_path: { ...report.base_path },
    constitution: { ...report.constitution },
    feature_directory: { ...report.feature_directory },
    mutating: false,
  };
}
