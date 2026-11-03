/**
 * [REQ-TIED_CONFIG_REPORT] [IMPL-TIED_CONFIG_REPORT] [ARCH-TIED_CONFIG_REPORT]
 * Dynamic import of bootstrap buildTiedConfigReport for MCP tied_config_report.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export type ConfigReportStatus = "ok" | "unavailable" | "error";

export type ConfigReportResult =
  | { status: "ok"; report: Record<string, unknown> }
  | { status: "unavailable" | "error"; error: string };

function resolveBootstrapReportModulePath(
  projectRoot: string,
  processEnv: NodeJS.ProcessEnv,
): string | null {
  const candidates: string[] = [];
  for (const key of ["TIED_STORE_ROOT", "TIED_MCP_TEST_REPO_ROOT"] as const) {
    const raw = processEnv[key]?.trim();
    if (raw) candidates.push(path.resolve(raw));
  }
  candidates.push(path.resolve(projectRoot));
  let dir = path.resolve(projectRoot);
  for (let depth = 0; depth < 8; depth += 1) {
    candidates.push(dir);
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  const seen = new Set<string>();
  for (const root of candidates) {
    const normalized = path.resolve(root);
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    const modulePath = path.join(normalized, "tools/bootstrap/lib/tied-config-report.mjs");
    if (fs.existsSync(modulePath)) {
      return modulePath;
    }
  }
  return null;
}

async function loadBootstrapReportModule(projectRoot: string, processEnv: NodeJS.ProcessEnv) {
  const modulePath = resolveBootstrapReportModulePath(projectRoot, processEnv);
  if (!modulePath) {
    return null;
  }
  return import(pathToFileURL(modulePath).href) as Promise<{
    buildTiedConfigReport: (params: {
      cwd: string;
      processEnv: NodeJS.ProcessEnv;
      includeSecrets?: boolean;
    }) => Record<string, unknown>;
    formatTiedConfigReportText: (report: Record<string, unknown>) => string;
  }>;
}

export async function resolveTiedConfigReport(
  projectRoot: string,
  processEnv: NodeJS.ProcessEnv,
  options: { includeSecrets?: boolean } = {},
): Promise<ConfigReportResult> {
  try {
    const mod = await loadBootstrapReportModule(projectRoot, processEnv);
    if (!mod) {
      return {
        status: "unavailable",
        error: "bootstrap tied-config-report.mjs not found",
      };
    }
    const report = mod.buildTiedConfigReport({
      cwd: projectRoot,
      processEnv,
      includeSecrets: options.includeSecrets === true,
    });
    return { status: "ok", report };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { status: "error", error: message };
  }
}

export async function formatTiedConfigReportForProject(
  projectRoot: string,
  processEnv: NodeJS.ProcessEnv,
  options: { includeSecrets?: boolean } = {},
): Promise<ConfigReportResult & { text?: string }> {
  const built = await resolveTiedConfigReport(projectRoot, processEnv, options);
  if (built.status !== "ok") {
    return built;
  }
  const mod = await loadBootstrapReportModule(projectRoot, processEnv);
  if (!mod) {
    return { status: "unavailable", error: "bootstrap tied-config-report.mjs not found" };
  }
  return { status: "ok", report: built.report, text: mod.formatTiedConfigReportText(built.report) };
}
