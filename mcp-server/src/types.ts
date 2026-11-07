/**
 * Shared types for TIED MCP server.
 */

export type TextContentBlock = { type: "text"; text: string };

export type McpToolResult = {
  content: TextContentBlock[];
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
};

export function textContent(text: string): McpToolResult {
  return { content: [{ type: "text", text }] };
}

/** [REQ-MCP_SERVER_INFO] Dual structuredContent + canonical JSON text. */
export function structuredToolResult(payload: Record<string, unknown>, text?: string): McpToolResult {
  const json =
    text ??
    JSON.stringify(payload, (_key, value) => (value === undefined ? null : value), 2);
  return {
    content: [{ type: "text", text: json }],
    structuredContent: payload,
  };
}
