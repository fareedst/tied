/**
 * [REQ-TIED_RUNTIME_DISK_CONFIG] [IMPL-TIED_RUNTIME_DISK_CONFIG] [ARCH-TIED_RUNTIME_DISK_CONFIG]
 * SC-RDC-MCP-INTROSPECTION — disk-aligned runtime paths for tied_config_get_base_path.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export type RuntimeIntrospectionStatus = "ok" | "unavailable" | "error";

export type RuntimeIntrospectionSnapshot = {
  store_root: string | null;
  mcp_dist_path: string | null;
  config_sources: string[];
  runtime_introspection_status: RuntimeIntrospectionStatus;
  runtime_introspection_error?: string;
};

type BootstrapRuntimeRecord = {
  storeRoot: string;
  mcpDistPath: string;
  sources?: string[];
};

function resolveBootstrapModulePath(projectRoot: string, processEnv: NodeJS.ProcessEnv): string | null {
  const candidates: string[] = [];
  // TIED_MCP_TEST_REPO_ROOT: set by run-mcp-tests / fixture tests when store root is a temp dir without tools/bootstrap.
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
    const modulePath = path.join(normalized, "tools/bootstrap/lib/tied-runtime-config.mjs");
    if (fs.existsSync(modulePath)) {
      return modulePath;
    }
  }
  return null;
}

/**
 * Resolve on-disk global paths via bootstrap tied-runtime-config (store repo module).
 */
export function pathsSameResolved(a: string, b: string): boolean {
  const normalize = (p: string) => {
    try {
      return fs.realpathSync.native(p);
    } catch {
      return path.resolve(p);
    }
  };
  const stripPrivate = (p: string) => p.replace(/^\/private(?=\/)/, "");
  return stripPrivate(normalize(a)) === stripPrivate(normalize(b));
}

/**
 * Resolve on-disk global paths via bootstrap tied-runtime-config (store repo module).
 */
export async function resolveRuntimeIntrospection(
  projectRoot: string,
  processEnv: NodeJS.ProcessEnv = process.env,
): Promise<RuntimeIntrospectionSnapshot> {
  const modulePath = resolveBootstrapModulePath(projectRoot, processEnv);
  if (!modulePath) {
    return {
      store_root: null,
      mcp_dist_path: null,
      config_sources: [],
      runtime_introspection_status: "unavailable",
      runtime_introspection_error: "bootstrap tied-runtime-config.mjs not found",
    };
  }
  try {
    const mod = await import(pathToFileURL(modulePath).href);
    const cfg = mod.resolveTiedRuntimeConfig({
      cwd: projectRoot,
      mode: "auto",
      requireDistExists: false,
      processEnv,
    }) as BootstrapRuntimeRecord;
    return {
      store_root: cfg.storeRoot ?? null,
      mcp_dist_path: cfg.mcpDistPath ?? null,
      config_sources: Array.isArray(cfg.sources) ? [...cfg.sources] : [],
      runtime_introspection_status: "ok",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      store_root: null,
      mcp_dist_path: null,
      config_sources: [],
      runtime_introspection_status: "error",
      runtime_introspection_error: message,
    };
  }
}
