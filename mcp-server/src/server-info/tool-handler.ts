/**
 * [REQ-MCP_SERVER_INFO] [IMPL-MCP_SERVER_INFO] MCP adapter for server_info.
 */

import { structuredToolResult } from "../types.js";
import { buildServerInfoSnapshot } from "./build.js";
import { getServerInfoRuntimeContext } from "./runtime-context.js";

export type ServerInfoHandlerExtra = {
  negotiatedProtocolVersion?: string | null;
};

export async function handleServerInfoTool(extra: ServerInfoHandlerExtra = {}) {
  const base = getServerInfoRuntimeContext();
  const snapshot = await buildServerInfoSnapshot({
    ...base,
    negotiatedProtocolVersion: extra.negotiatedProtocolVersion ?? null,
  });
  return structuredToolResult(snapshot);
}
