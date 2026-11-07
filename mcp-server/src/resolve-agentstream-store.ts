/**
 * [IMPL-TIED_CLIENT_OPERATOR_TOOLING] [ARCH-TIED_CLIENT_OPERATOR_TOOLING] [REQ-TIED_CLIENT_OPERATOR_TOOLING]
 * Resolve TIED store root for @tied/agentstream CLI spawn (linked clients).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { resolveRuntimeIntrospection } from "./tied-runtime-introspection.js";

export function agentstreamCliEntry(storeRoot: string): string {
  return path.join(storeRoot, "mcp-server", "packages", "agentstream", "dist", "index.js");
}

export function storeRootHasAgentstreamDist(storeRoot: string): boolean {
  return fs.existsSync(agentstreamCliEntry(storeRoot));
}

/** Walk parents from MCP runner module until store has built agentstream dist. */
export function packageAnchorStoreRootForAgentstream(
  moduleUrl: string | URL = import.meta.url,
): string {
  const filePath = typeof moduleUrl === "string" ? fileURLToPath(moduleUrl) : fileURLToPath(moduleUrl);
  let dir = path.dirname(filePath);
  for (let depth = 0; depth < 16; depth += 1) {
    if (storeRootHasAgentstreamDist(dir)) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }
  return "";
}

export function findMonolithicRepoRoot(start: string): string {
  let dir = path.resolve(start);
  for (;;) {
    if (
      fs.existsSync(path.join(dir, "AGENTS.md")) &&
      fs.existsSync(path.join(dir, "mcp-server", "package.json")) &&
      storeRootHasAgentstreamDist(dir)
    ) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error("repo root not found");
    }
    dir = parent;
  }
}

const MISSING_DIST_MESSAGE =
  "adherence-reconcile: build @tied/agentstream (mcp-server/packages/agentstream/dist/index.js) not found — " +
  "run ./build-workspace.sh from the TIED store, then tied-install.sh --refresh on linked clients";

export type ResolveAgentstreamStoreOptions = {
  workspace?: string;
  moduleUrl?: string | URL;
  env?: NodeJS.ProcessEnv;
};

/**
 * [REQ-TIED_CLIENT_OPERATOR_TOOLING] criterion linked-reconcile-store-resolve
 * How: self-anchor, TIED_STORE_ROOT (MCP child env), client mcp.json introspection, monolithic walk.
 */
export async function resolveAgentstreamStoreRoot(
  options: ResolveAgentstreamStoreOptions = {},
): Promise<string> {
  const env = options.env ?? process.env;
  const moduleUrl = options.moduleUrl ?? import.meta.url;

  const fromAnchor = packageAnchorStoreRootForAgentstream(moduleUrl);
  if (fromAnchor !== "") {
    return fromAnchor;
  }

  const storeFromEnv = env.TIED_STORE_ROOT?.trim();
  if (storeFromEnv && storeRootHasAgentstreamDist(storeFromEnv)) {
    return path.resolve(storeFromEnv);
  }

  const workspace = options.workspace?.trim();
  if (workspace) {
    const intro = await resolveRuntimeIntrospection(workspace, env);
    if (intro.store_root && storeRootHasAgentstreamDist(intro.store_root)) {
      return path.resolve(intro.store_root);
    }
    try {
      return findMonolithicRepoRoot(workspace);
    } catch {
      /* try cwd below */
    }
  }

  try {
    return findMonolithicRepoRoot(process.cwd());
  } catch {
    throw new Error(MISSING_DIST_MESSAGE);
  }
}
