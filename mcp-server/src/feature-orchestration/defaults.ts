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

function readMcpProjectPaths(projectRoot: string): { mcpBin?: string; basePath?: string } {
  for (const rel of [".cursor/mcp.json", ".mcp.json"] as const) {
    const mcpPath = path.join(projectRoot, rel);
    if (!fs.existsSync(mcpPath)) continue;
    try {
      const cfg = JSON.parse(fs.readFileSync(mcpPath, "utf8")) as {
        mcpServers?: Record<string, { args?: unknown[]; env?: Record<string, string> }>;
      };
      const entry = cfg.mcpServers?.["tied-yaml"];
      const env = entry?.env;
      if (!env) continue;
      const baseRaw = env.TIED_CLIENT_PROJECT_PATH?.trim() || env.TIED_BASE_PATH?.trim();
      const arg0 = Array.isArray(entry.args) && typeof entry.args[0] === "string" ? entry.args[0].trim() : "";
      const mcpBin = arg0
        ? path.isAbsolute(arg0)
          ? path.resolve(arg0)
          : path.resolve(projectRoot, arg0)
        : undefined;
      const basePath = baseRaw ? path.resolve(baseRaw) : undefined;
      if (mcpBin || basePath) return { mcpBin, basePath };
    } catch {
      continue;
    }
  }
  return {};
}

function choose(explicit: string | undefined, disk: string | undefined, local: string): { value: string; source: DefaultSource } {
  if (explicit) return { value: path.resolve(explicit), source: "explicit" };
  if (disk) return { value: path.resolve(disk), source: "local" };
  return { value: path.resolve(local), source: "local" };
}

function item(value: string, source: DefaultSource, corrective_command: string): ResolvedDefault {
  return { value, source, exists: fs.existsSync(value), corrective_command };
}

// [IMPL-FEAT_LOCAL_DEFAULTS] [ARCH-FEAT_LOCAL_DEFAULT_RESOLUTION] [REQ-FEAT_LOCAL_DEFAULTS] — resolve local defaults deterministically without writing configuration.
export function resolveLocalDefaults(options: DefaultOptions = {}, environment: NodeJS.ProcessEnv = process.env, projectRoot = process.cwd()): DefaultResolution {
  const root = path.resolve(projectRoot);
  const disk = readMcpProjectPaths(root);
  const mcp = choose(options.mcpBin, disk.mcpBin, path.join(root, "mcp-server", "dist", "index.js"));
  const base = choose(options.basePath, disk.basePath, path.join(root, "tied-project"));
  const constitution = options.constitution
    ? { value: path.resolve(options.constitution), source: "explicit" as const }
    : { value: path.resolve(path.join(base.value, "constitution.yaml")), source: base.source };
  const featureDirectory = options.featureDirectory
    ? { value: path.resolve(options.featureDirectory), source: "explicit" as const }
    : { value: path.resolve(path.join(base.value, "features")), source: base.source };
  const report: DefaultReport = {
    mcp_bin: item(mcp.value, mcp.source, "npm run build --prefix mcp-server"),
    base_path: item(base.value, base.source, `mkdir -p "${base.value}"`),
    constitution: item(
      constitution.value,
      constitution.source,
      `cp tied-project/constitution.example.yaml "${constitution.value}"`,
    ),
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
