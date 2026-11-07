/**
 * [REQ-MCP_SERVER_INFO] [IMPL-MCP_SERVER_INFO] Process-wide server_info build inputs from stdio entry.
 */

import type { ServerInfoBuildOptions } from "./types.js";

let context: ServerInfoBuildOptions | null = null;

export function setServerInfoRuntimeContext(options: ServerInfoBuildOptions): void {
  context = { ...options };
}

export function getServerInfoRuntimeContext(): ServerInfoBuildOptions {
  if (!context) {
    throw new Error("server_info runtime context not initialized");
  }
  return context;
}

/** Test hook */
export function resetServerInfoRuntimeContextForTests(): void {
  context = null;
}
