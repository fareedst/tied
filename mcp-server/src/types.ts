/**
 * Shared types for TIED MCP server.
 */

export function textContent(text: string): { content: Array<{ type: "text"; text: string }> } {
  return { content: [{ type: "text", text }] };
}
