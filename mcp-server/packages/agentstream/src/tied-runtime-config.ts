/**
 * [IMPL-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_RUNTIME_DISK_CONFIG] [REQ-TIED_JEV_DECISION_COPROCESSOR]
 * TS mirror of tools/bootstrap/lib/tied-runtime-config.mjs for linked-client workspaces.
 * Global paths come from mcp.json / store yaml only — not operator shell env.
 */
import fs from "node:fs";
import path from "node:path";

import yaml from "js-yaml";

const MCP_REL_PATHS = [".cursor/mcp.json", ".mcp.json"] as const;
const ENV_CLIENT_PROJECT_PATH = "TIED_CLIENT_PROJECT_PATH";
const ENV_CLIENT_BUNDLE_PATH = "TIED_CLIENT_BUNDLE_PATH";
const LEGACY_ENV_CLIENT_PROJECT_PATH = "TIED_BASE_PATH";
const LEGACY_ENV_CLIENT_BUNDLE_PATH = "TIED_METHODOLOGY_BUNDLE_PATH";
export const STORE_YAML_REL = ".tied/store.yaml";
export const RUNTIME_DIAGNOSTIC_PREFIX = "DIAGNOSTIC: TIED_RUNTIME_CONFIG";

export type TiedRuntimeConfigFromDisk = {
  projectRoot: string;
  storeRoot: string;
  mcpDistPath: string;
  clientProjectPath?: string;
  clientBundlePath?: string;
  sources: string[];
};

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

export function deriveStoreRootFromMcpDist(mcpDistPath: string): string {
  const resolved = path.resolve(mcpDistPath);
  return path.resolve(path.dirname(resolved), "..", "..");
}

function assertMcpDistUnderStoreRoot(storeRoot: string, mcpDistPath: string): void {
  if (pathsSameResolved(deriveStoreRootFromMcpDist(mcpDistPath), storeRoot)) {
    return;
  }
  const root = (() => {
    try {
      return fs.realpathSync.native(storeRoot);
    } catch {
      return path.resolve(storeRoot);
    }
  })();
  const dist = (() => {
    try {
      return fs.realpathSync.native(mcpDistPath);
    } catch {
      return path.resolve(mcpDistPath);
    }
  })();
  const rel = path.relative(root, dist);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    const err = new Error(
      `${RUNTIME_DIAGNOSTIC_PREFIX}: MCP dist escapes store root (${dist} not under ${root})`,
    );
    (err as NodeJS.ErrnoException).code = "TIED_RUNTIME_CONFIG_PATH_ESCAPE";
    throw err;
  }
}

function pickClientProjectPath(env: Record<string, string | undefined>): string | undefined {
  const canonical = env[ENV_CLIENT_PROJECT_PATH]?.trim();
  if (canonical) return canonical;
  return env[LEGACY_ENV_CLIENT_PROJECT_PATH]?.trim() || undefined;
}

function pickClientBundlePath(env: Record<string, string | undefined>): string | undefined {
  const canonical = env[ENV_CLIENT_BUNDLE_PATH]?.trim();
  if (canonical) return canonical;
  return env[LEGACY_ENV_CLIENT_BUNDLE_PATH]?.trim() || undefined;
}

function mcpEnvHasClientProjectPath(env: Record<string, string | undefined>): boolean {
  return Boolean(pickClientProjectPath(env));
}

function validateTiedProjectLayout(basePath: string): string {
  const resolved = path.resolve(basePath);
  if (!fs.existsSync(path.join(resolved, "requirements.yaml"))) {
    const err = new Error("TIED_CLI_LAYOUT_INVALID");
    (err as Error & { basePath?: string }).basePath = resolved;
    throw err;
  }
  return resolved;
}

type McpEntry = {
  relPath: string;
  entry: Record<string, unknown>;
  env: Record<string, string>;
};

function readTiedYamlServerEntryFromProject(projectRoot: string): McpEntry | null {
  const root = path.resolve(projectRoot);
  for (const rel of MCP_REL_PATHS) {
    const mcpPath = path.join(root, rel);
    if (!fs.existsSync(mcpPath)) {
      continue;
    }
    let cfg: unknown;
    try {
      cfg = JSON.parse(fs.readFileSync(mcpPath, "utf8"));
    } catch {
      continue;
    }
    const servers =
      cfg && typeof cfg === "object" && !Array.isArray(cfg)
        ? (cfg as { mcpServers?: Record<string, unknown> }).mcpServers
        : undefined;
    const entry = servers?.["tied-yaml"];
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      continue;
    }
    const envRaw = (entry as { env?: unknown }).env;
    if (!envRaw || typeof envRaw !== "object" || Array.isArray(envRaw)) {
      continue;
    }
    const envRecord = envRaw as Record<string, unknown>;
    /** @type {Record<string, string>} */
    const env: Record<string, string> = {};
    for (const [key, value] of Object.entries(envRecord)) {
      if (typeof value === "string" && value.trim()) {
        env[key] = value.trim();
      }
    }
    if (!mcpEnvHasClientProjectPath(env)) {
      continue;
    }
    return {
      relPath: rel,
      entry: entry as Record<string, unknown>,
      env,
    };
  }
  return null;
}

function findStoreRootWithTiedConfig(startDir: string): string | null {
  let dir = path.resolve(startDir);
  for (;;) {
    if (fs.existsSync(path.join(dir, STORE_YAML_REL))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }
  return null;
}

function loadMergedStoreYaml(storeRoot: string): Record<string, unknown> {
  const root = path.resolve(storeRoot);
  const tiedDir = path.join(root, ".tied");
  let merged: Record<string, unknown> = {};
  const basePath = path.join(tiedDir, "store.yaml");
  const localPath = path.join(tiedDir, "store.local.yaml");
  if (fs.existsSync(basePath)) {
    merged = { ...merged, ...(yaml.load(fs.readFileSync(basePath, "utf8")) as Record<string, unknown>) };
  }
  if (fs.existsSync(localPath)) {
    merged = { ...merged, ...(yaml.load(fs.readFileSync(localPath, "utf8")) as Record<string, unknown>) };
  }
  return merged;
}

function resolveMcpDistFromStoreYaml(doc: Record<string, unknown>, storeRoot: string): string | null {
  const rootFromDoc =
    typeof doc.store_root === "string" && doc.store_root.trim()
      ? path.resolve(doc.store_root.trim())
      : path.resolve(storeRoot);
  const mcpServer = doc.mcp_server;
  if (!mcpServer || typeof mcpServer !== "object" || Array.isArray(mcpServer)) {
    return null;
  }
  const distRel = (mcpServer as { dist?: string }).dist?.trim();
  if (!distRel) {
    return null;
  }
  const distPath = path.isAbsolute(distRel) ? distRel : path.join(rootFromDoc, distRel);
  return path.resolve(distPath);
}

function resolveRuntimeFromMcpEntry(
  projectRoot: string,
  mcp: McpEntry,
  opts: { requireDistExists?: boolean },
): TiedRuntimeConfigFromDisk {
  const args = mcp.entry.args;
  const arg0 = Array.isArray(args) && typeof args[0] === "string" ? args[0].trim() : "";
  if (!arg0) {
    throw new Error(
      `${RUNTIME_DIAGNOSTIC_PREFIX}: tied-yaml mcp.json missing args[0] (path to mcp-server/dist/index.js). Run ./tied-install.sh`,
    );
  }
  const mcpDistPath = path.isAbsolute(arg0) ? path.resolve(arg0) : path.resolve(projectRoot, arg0);
  if (opts.requireDistExists && !fs.existsSync(mcpDistPath)) {
    throw new Error(
      `${RUNTIME_DIAGNOSTIC_PREFIX}: MCP server binary missing at ${mcpDistPath}. Build mcp-server and run ./tied-install.sh --refresh`,
    );
  }
  const derivedStore = deriveStoreRootFromMcpDist(mcpDistPath);
  const explicitStore = mcp.env.TIED_STORE_ROOT?.trim();
  const storeRoot = explicitStore ? path.resolve(explicitStore) : derivedStore;
  if (explicitStore && !pathsSameResolved(explicitStore, derivedStore)) {
    throw new Error(
      `${RUNTIME_DIAGNOSTIC_PREFIX}_MISMATCH: TIED_STORE_ROOT in mcp.json (${explicitStore}) disagrees with dist-derived store root (${derivedStore})`,
    );
  }
  assertMcpDistUnderStoreRoot(storeRoot, mcpDistPath);
  const clientRaw = pickClientProjectPath(mcp.env);
  if (!clientRaw?.trim()) {
    throw new Error(`${RUNTIME_DIAGNOSTIC_PREFIX}: missing client project path in ${mcp.relPath}`);
  }
  const clientProjectPath = validateTiedProjectLayout(path.resolve(clientRaw.trim()));
  const sources: string[] = [`mcp:${mcp.relPath}`];
  const storeYamlRoot = findStoreRootWithTiedConfig(storeRoot);
  if (storeYamlRoot && fs.existsSync(path.join(storeYamlRoot, STORE_YAML_REL))) {
    sources.push(`store:${STORE_YAML_REL}`);
  }
  const bundle = pickClientBundlePath(mcp.env);
  return {
    projectRoot: path.resolve(projectRoot),
    storeRoot: path.resolve(storeRoot),
    mcpDistPath,
    clientProjectPath,
    clientBundlePath: bundle ? path.resolve(bundle) : undefined,
    sources,
  };
}

function resolveRuntimeFromStoreYaml(
  storeRoot: string,
  opts: { requireDistExists?: boolean },
): TiedRuntimeConfigFromDisk {
  const root = path.resolve(storeRoot);
  if (!fs.existsSync(path.join(root, STORE_YAML_REL))) {
    throw new Error(
      `${RUNTIME_DIAGNOSTIC_PREFIX}_MISSING: missing ${STORE_YAML_REL} under ${root}. Run ./tied-install.sh`,
    );
  }
  const doc = loadMergedStoreYaml(root);
  const mcpDistPath = resolveMcpDistFromStoreYaml(doc, root);
  if (!mcpDistPath) {
    throw new Error(
      `${RUNTIME_DIAGNOSTIC_PREFIX}: invalid ${STORE_YAML_REL} (mcp_server.dist required)`,
    );
  }
  if (opts.requireDistExists && !fs.existsSync(mcpDistPath)) {
    throw new Error(
      `${RUNTIME_DIAGNOSTIC_PREFIX}: MCP server binary missing at ${mcpDistPath}. Build mcp-server.`,
    );
  }
  const resolvedStore =
    typeof doc.store_root === "string" && doc.store_root.trim()
      ? path.resolve(doc.store_root.trim())
      : root;
  assertMcpDistUnderStoreRoot(resolvedStore, mcpDistPath);
  return {
    projectRoot: root,
    storeRoot: resolvedStore,
    mcpDistPath,
    sources: [`store:${STORE_YAML_REL}`],
  };
}

/**
 * Resolve store/MCP paths from workspace disk (mcp.json or store yaml).
 * Returns null when config is absent or invalid — callers may fall back to package anchor.
 * [REQ-TIED_RUNTIME_DISK_CONFIG] SC-RDC-CONSUMERS
 */
export function resolveTiedRuntimeConfigFromWorkspace(
  workspaceRoot: string,
  opts: { requireDistExists?: boolean } = {},
): TiedRuntimeConfigFromDisk | null {
  const projectRoot = path.resolve(workspaceRoot);
  const requireDistExists = opts.requireDistExists ?? false;
  try {
    const mcp = readTiedYamlServerEntryFromProject(projectRoot);
    if (mcp) {
      return resolveRuntimeFromMcpEntry(projectRoot, mcp, { requireDistExists });
    }
    const storeRoot = findStoreRootWithTiedConfig(projectRoot);
    if (storeRoot) {
      return resolveRuntimeFromStoreYaml(storeRoot, { requireDistExists });
    }
    return null;
  } catch {
    return null;
  }
}
