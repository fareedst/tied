/**
 * [IMPL-AGENTSTREAM_CLAUDE_WF_PARITY] [ARCH-AGENTSTREAM_CLAUDE_WF_PARITY] [REQ-AGENTSTREAM_CLAUDE_WF_PARITY]
 * [IMPL-TIED_CLAUDE_LIVE_DRIVER] [ARCH-TIED_CLAUDE_LIVE_DRIVER] [REQ-TIED_CLAUDE_LIVE_DRIVER]
 * Claude Code CLI flags for non-interactive agentstream (permissions + linked-client dirs + MCP config).
 */
import fs from "node:fs";
import path from "node:path";

import { resolveTiedRuntimeConfigFromWorkspace } from "./tied-runtime-config.js";

const MCP_REL_CANDIDATES = [".cursor/mcp.json", ".mcp.json"] as const;

/** Resolve first existing MCP JSON under workspace (Cursor then Claude root). */
export function resolveClientMcpConfigPath(workspace: string): string {
  const ws = path.resolve(workspace.trim());
  for (const rel of MCP_REL_CANDIDATES) {
    const candidate = path.join(ws, rel);
    try {
      const st = fs.statSync(candidate);
      if (st.isFile()) {
        return path.resolve(candidate);
      }
    } catch {
      /* missing */
    }
  }
  return "";
}

/** MCP argv aligned with tools/bootstrap/lib/claude-client-validation.mjs interactive smoke. */
export function claudeMcpConfigArgs(workspace: string): string[] {
  const mcpPath = resolveClientMcpConfigPath(workspace);
  if (mcpPath === "") {
    return [];
  }
  const strict =
    process.env.AGENTSTREAM_CLAUDE_STRICT_MCP !== "0" &&
    process.env.AGENTSTREAM_CLAUDE_STRICT_MCP !== "false";
  if (strict) {
    return ["--strict-mcp-config", "--mcp-config", mcpPath];
  }
  return ["--mcp-config", mcpPath];
}

/** Cursor agentstream uses --trust --force; Claude --print needs skip-permissions when operator-gated. */
export function claudeSkipPermissionsArgs(): string[] {
  if (process.env.AGENTSTREAM_CLAUDE_KEEP_PERMISSIONS === "1") {
    return [];
  }
  if (process.env.AGENTSTREAM_CLAUDE_LIVE_OK === "1") {
    return ["--dangerously-skip-permissions"];
  }
  return [];
}

function normalizeExistingDir(p: string): string {
  try {
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      return path.resolve(p);
    }
    if (st.isSymbolicLink()) {
      return path.resolve(fs.realpathSync(p));
    }
  } catch {
    /* missing */
  }
  return "";
}

/** Linked disposable clients reference TIED_STORE_ROOT paths in skills; allow store root for tools. */
export function claudeAddDirArgs(workspace: string): string[] {
  const ws = path.resolve(workspace.trim());
  const dirs = new Set<string>();
  const runtime = resolveTiedRuntimeConfigFromWorkspace(ws, {
    requireDistExists: false,
  });
  if (runtime?.storeRoot) {
    const store = normalizeExistingDir(runtime.storeRoot);
    if (store !== "" && store !== ws && !store.startsWith(`${ws}${path.sep}`)) {
      dirs.add(store);
    }
  }
  if (dirs.size === 0) {
    return [];
  }
  return ["--add-dir", ...dirs];
}
