/**
 * [IMPL-TIED_CLAUDE_ADHERENCE_HOOKS] [ARCH-TIED_CLAUDE_ADHERENCE_HOOKS] [REQ-TIED_CLAUDE_ADHERENCE_HOOKS]
 * Map Claude Code PostToolUse stdin JSON to the Cursor-shaped HookRecord for adherence-append.
 */
import type { HookRecord } from "./adherence-append-action-attempted.js";

export function normalizeClaudeHookStdin(raw: unknown): HookRecord {
  if (raw === null || typeof raw !== "object") {
    return { hook_event_name: "postToolUse", workspace_roots: [], adherence_source: "claude_hook" };
  }

  const input = raw as Record<string, unknown>;
  const cwd = String(input.cwd ?? "").trim();
  const toolName = String(input.tool_name ?? "").trim();
  const workspace_roots = cwd ? [cwd] : [];

  if (toolName === "Bash") {
    const toolInput = (input.tool_input ?? {}) as Record<string, unknown>;
    return {
      hook_event_name: "afterShellExecution",
      workspace_roots,
      normalized: {
        details: {
          command: String(toolInput.command ?? ""),
        },
      },
      adherence_source: "claude_hook",
    };
  }

  if (toolName.startsWith("mcp__")) {
    const parts = toolName.split("__").filter(Boolean);
    const server = parts.length >= 2 ? parts[1]! : "";
    const mcpTool = parts.length >= 3 ? parts.slice(2).join("__") : toolName;
    return {
      hook_event_name: "afterMCPExecution",
      workspace_roots,
      normalized: {
        details: {
          tool_name: mcpTool,
        },
      },
      original: {
        mcp_server: server,
        server,
      },
      adherence_source: "claude_hook",
    };
  }

  return {
    hook_event_name: "postToolUse",
    workspace_roots,
    normalized: {
      details: {
        tool_name: toolName,
      },
    },
    adherence_source: "claude_hook",
  };
}
