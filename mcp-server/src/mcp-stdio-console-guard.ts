/**
 * [REQ-MCP_STDIO_CONSOLE_GUARD] [ARCH-MCP_STDIO_CONSOLE_GUARD] [IMPL-MCP_STDIO_CONSOLE_GUARD]
 * MCP stdio JSON-RPC owns stdout exclusively; route console.log/debug/info away from stdout.
 */

import util from "node:util";

let installed = false;
let originalLog: typeof console.log | undefined;
let originalDebug: typeof console.debug | undefined;
let originalInfo: typeof console.info | undefined;

/** PRE: none. POST: true when TIED_MCP_DIAGNOSTICS enables stderr diagnostic lines. */
export function mcpDiagnosticsEnabled(): boolean {
  const v = process.env.TIED_MCP_DIAGNOSTICS?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

function writeDiagnosticsToStderr(args: unknown[]): void {
  if (!mcpDiagnosticsEnabled()) return;
  const line = util.formatWithOptions({ colors: false, depth: null }, ...args);
  process.stderr.write(`${line}\n`);
}

/**
 * PRE: MCP server process (stdio transport). POST: console.log/debug/info never write stdout.
 * EFFECTS: When diagnostics env is set, matching lines go to stderr only.
 */
export function installMcpStdioConsoleGuard(): void {
  if (installed) return;
  installed = true;
  originalLog = console.log;
  originalDebug = console.debug;
  originalInfo = console.info;

  console.log = (...args: unknown[]) => writeDiagnosticsToStderr(args);
  console.debug = (...args: unknown[]) => writeDiagnosticsToStderr(args);
  console.info = (...args: unknown[]) => writeDiagnosticsToStderr(args);
}

/** Test-only: restore native console and allow re-install. */
export function resetMcpStdioConsoleGuardForTests(): void {
  if (originalLog) console.log = originalLog;
  if (originalDebug) console.debug = originalDebug;
  if (originalInfo) console.info = originalInfo;
  installed = false;
  originalLog = undefined;
  originalDebug = undefined;
  originalInfo = undefined;
}
