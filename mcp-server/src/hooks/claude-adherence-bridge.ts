/**
 * [IMPL-TIED_CLAUDE_ADHERENCE_HOOKS] [ARCH-TIED_CLAUDE_ADHERENCE_HOOKS] [REQ-TIED_CLAUDE_ADHERENCE_HOOKS]
 * Claude PostToolUse hook CLI: normalize stdin, append hook log line, call adherence-append bridge.
 */
import fs from "node:fs";
import path from "node:path";

import { callAdherenceAppendActionAttempted } from "./adherence-append-action-attempted.js";
import { normalizeClaudeHookStdin } from "./claude-adherence-normalize.js";

export function appendHookLogLine(logPath: string, summary: Record<string, unknown>): number {
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  const line = `${JSON.stringify(summary)}\n`;
  fs.appendFileSync(logPath, line, "utf8");
  const content = fs.readFileSync(logPath, "utf8");
  return content.trim().split("\n").length;
}

export function runClaudeAdherenceBridgeFromStdin(payloadText: string, argv: string[]): number {
  try {
    let projectDir = process.env.CLAUDE_PROJECT_DIR?.trim() ?? "";
    const args = [...argv];
    while (args.length > 0) {
      const arg = args.shift();
      if (arg === "--project-dir") {
        projectDir = String(args.shift() ?? "").trim();
        continue;
      }
    }

    if (!projectDir) {
      projectDir = process.cwd();
    }

    const raw = JSON.parse(payloadText) as unknown;
    const record = normalizeClaudeHookStdin(raw);

    const logPath = path.join(projectDir, ".claude", "adherence-bridge.log");
    const hookLogLine = appendHookLogLine(logPath, {
      at: new Date().toISOString(),
      hook_event_name: record["hook_event_name"],
      tool_name: (record["normalized"] as Record<string, unknown> | undefined)?.["details"],
    });

    callAdherenceAppendActionAttempted(record, { hookLogPath: logPath, hookLogLine });
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`DIAGNOSTIC: claude_adherence_bridge fail-silent: ${message}`);
    return 0;
  }
}

export function runClaudeAdherenceBridgeCli(argv: string[]): number {
  const payloadText = fs.readFileSync(0, "utf8");
  return runClaudeAdherenceBridgeFromStdin(payloadText, argv);
}
