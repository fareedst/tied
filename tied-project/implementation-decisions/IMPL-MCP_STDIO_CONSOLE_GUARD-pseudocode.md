# [IMPL-MCP_STDIO_CONSOLE_GUARD] [ARCH-MCP_STDIO_CONSOLE_GUARD] [REQ-MCP_STDIO_CONSOLE_GUARD]
# Summary: MCP stdio JSON-RPC owns stdout; guard console.log/debug/info (stderr-only when diagnostics env enabled).

Grammar-Version: v2

## Summary contract

- [IMPL-MCP_STDIO_CONSOLE_GUARD] [ARCH-MCP_STDIO_CONSOLE_GUARD] [REQ-MCP_STDIO_CONSOLE_GUARD] How: Patch console methods at MCP entry so tool code cannot corrupt JSON-RPC stdout.
- Contract:
  - INPUT: native console.log, console.debug, console.info; process.env TIED_MCP_DIAGNOSTICS.
  - OUTPUT: patched console methods; optional formatted stderr lines when diagnostics enabled.
  - DATA: saved originals for test reset.
  - CONTROL: Idempotent install; diagnostics off unless TIED_MCP_DIAGNOSTICS is 1, true, or yes.

## Diagnostics env gate

- [IMPL-MCP_STDIO_CONSOLE_GUARD] [ARCH-MCP_STDIO_CONSOLE_GUARD] [REQ-MCP_STDIO_CONSOLE_GUARD] How: Enable stderr diagnostics only when env opt-in matches metrics-style truthy strings.
- function mcpDiagnosticsEnabled():
  - RETURN true when TIED_MCP_DIAGNOSTICS is 1, true, or yes (case-insensitive).
  - ELSE RETURN false.

## Console guard install

- [IMPL-MCP_STDIO_CONSOLE_GUARD] [ARCH-MCP_STDIO_CONSOLE_GUARD] [REQ-MCP_STDIO_CONSOLE_GUARD] How: Replace log/debug/info writers; never patch console.error; format object args with depth null to stderr when enabled.
- procedure installMcpStdioConsoleGuard():
  - IF already installed: RETURN.
  - SAVE originals of console.log, console.debug, console.info.
  - REPLACE each with writer:
    - IF NOT mcpDiagnosticsEnabled(): RETURN (no stdout, no stderr).
    - ELSE write util.formatWithOptions({ colors: false, depth: null }, ...args) + newline to process.stderr only.
  - POST: guarded methods never write process.stdout.

## MCP entry wiring

- [IMPL-MCP_STDIO_CONSOLE_GUARD] [ARCH-MCP_STDIO_CONSOLE_GUARD] [REQ-MCP_STDIO_CONSOLE_GUARD] How: Side-effect module calls install on load; index.ts lists that module as first static import.
- module mcp-stdio-console-guard-side-effect:
  - EFFECTS: CALL installMcpStdioConsoleGuard on module evaluation.

- module mcp-server index (stdio entry):
  - DATA: first static dependency is side-effect module.
  - THEN register MCP tools and StdioServerTransport.
