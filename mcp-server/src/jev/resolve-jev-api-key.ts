/**
 * [IMPL-TIED_JEV_CONTEXT_LOG_PRUNING] [IMPL-TIED_JEV_DECISION_COPROCESSOR]
 * [ARCH-TIED_JEV_CONTEXT_LOG_PRUNING] [REQ-TIED_JEV_CONTEXT_LOG_PRUNING]
 * Resolve JEV_API_KEY: process.env first, then local .cursor/mcp.json tied-yaml env (never logged).
 */
import fs from "node:fs";
import path from "node:path";

type McpFile = {
  mcpServers?: Record<string, { env?: Record<string, string> }>;
};

export function readJevApiKeyFromMcpJsonFile(mcpJsonPath: string): string | undefined {
  try {
    const raw = JSON.parse(fs.readFileSync(mcpJsonPath, "utf8")) as McpFile;
    const key = raw.mcpServers?.["tied-yaml"]?.env?.JEV_API_KEY?.trim();
    return key !== "" ? key : undefined;
  } catch {
    return undefined;
  }
}

/** Walk upward from startDir for repo root containing tied/docs/agent-req-implementation-checklist.yaml */
export function findRepoRootFromCwd(startDir: string = process.cwd()): string {
  let dir = path.resolve(startDir);
  for (;;) {
    const marker = path.join(dir, "tied", "docs", "agent-req-implementation-checklist.yaml");
    try {
      if (fs.statSync(marker).isFile()) {
        return dir;
      }
    } catch {
      /* continue */
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      return "";
    }
    dir = parent;
  }
}

export function defaultMcpJsonPath(repoRoot: string): string {
  return path.join(repoRoot, ".cursor", "mcp.json");
}

/**
 * PRE: env may be empty; mcp.json may exist locally and is gitignored.
 * POST: trimmed key or undefined; when JEV_API_KEY is present in env (even blank), mcp.json is not consulted.
 */
export function resolveJevApiKey(
  env: NodeJS.ProcessEnv = process.env,
  options?: { repoRoot?: string; mcpJsonPath?: string },
): string | undefined {
  if (Object.prototype.hasOwnProperty.call(env, "JEV_API_KEY")) {
    const fromEnv = env.JEV_API_KEY?.trim();
    return fromEnv !== "" ? fromEnv : undefined;
  }
  const mcpPath =
    options?.mcpJsonPath ??
    (() => {
      const root = options?.repoRoot ?? findRepoRootFromCwd();
      return root !== "" ? defaultMcpJsonPath(root) : "";
    })();
  if (mcpPath === "") {
    return undefined;
  }
  return readJevApiKeyFromMcpJsonFile(mcpPath);
}
