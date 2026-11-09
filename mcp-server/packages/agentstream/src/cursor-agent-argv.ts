/**
 * [IMPL-WF_TRIAL_MODEL_EFFORT] [ARCH-WF_TRIAL_MODEL_EFFORT] [REQ-WF_TRIAL_MODEL_EFFORT]
 * Cursor agent CLI flags for non-interactive agentstream batch runs.
 */
import { claudeAddDirArgs } from "./claude-agent-argv.js";

function envTruthy(name: string): boolean {
  const v = process.env[name]?.trim();
  return v === "1" || v === "true";
}

/** [REQ-WF_TRIAL_MODEL_EFFORT] Default approve MCP for --print batch; opt-out AGENTSTREAM_CURSOR_KEEP_MCPS=1 */
export function cursorApproveMcpsArgs(): string[] {
  if (
    process.env.AGENTSTREAM_CURSOR_KEEP_MCPS === "1" ||
    process.env.AGENTSTREAM_CURSOR_KEEP_MCPS === "true"
  ) {
    return [];
  }
  return ["--approve-mcps"];
}

/** [REQ-WF_TRIAL_MODEL_EFFORT] Reuse linked-client store root resolution from Claude parity. */
export function cursorAddDirArgs(workspace: string): string[] {
  return claudeAddDirArgs(workspace);
}

/** Extras inserted after stream-json and before --model in cursor agentArgv. */
export function cursorLiveArgvExtras(workspace: string): string[] {
  const out: string[] = [];
  out.push(...cursorApproveMcpsArgs());
  out.push(...cursorAddDirArgs(workspace));
  if (envTruthy("AGENTSTREAM_CURSOR_AUTO_REVIEW")) {
    out.push("--auto-review");
  }
  if (envTruthy("AGENTSTREAM_CURSOR_STREAM_PARTIAL")) {
    out.push("--stream-partial-output");
  }
  return out;
}
