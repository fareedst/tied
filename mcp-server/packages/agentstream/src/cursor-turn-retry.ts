/**
 * [IMPL-WF_TRIAL_CURSOR_LIVE_SESSION_ORACLE] [ARCH-WF_TRIAL_CURSOR_LIVE_SESSION_ORACLE]
 * [REQ-WF_TRIAL_CURSOR_LIVE_SESSION_ORACLE]
 * RUN_CURSOR_TURN_WITH_RETRY — bounded live turn attempts (SC-CURSOR-SESSION-02).
 */
import type { RunResult } from "./executor-run.js";
import {
  CURSOR_TURN_RETRY_MAX,
  stderrIndicatesWritableIterableClosed,
} from "./cursor-stream.js";

export type RunCursorAgentOnce = (
  argv: string[],
  extraEnv: string[],
) => Promise<{
  result: RunResult;
  exitCode: number;
  agentStderr?: string;
  gateStderr?: string;
}>;

export type CursorTurnWithRetryOutcome = {
  result: RunResult;
  exitCode: number;
  attemptCount: number;
  retriableStderrSeen: boolean;
  gateStderr?: string;
};

export async function runCursorTurnWithRetry(
  runOnce: RunCursorAgentOnce,
  argv: string[],
  extraEnv: string[],
  maxRetries: number = CURSOR_TURN_RETRY_MAX,
): Promise<CursorTurnWithRetryOutcome> {
  let agentStderrAcc = "";
  let last: CursorTurnWithRetryOutcome = {
    result: {
      sessionId: "",
      finalText: "",
      thinkingText: "",
      transcript: "",
    },
    exitCode: 1,
    attemptCount: 0,
    retriableStderrSeen: false,
  };

  const attempts = Math.max(0, maxRetries) + 1;
  for (let attempt = 0; attempt < attempts; attempt++) {
    const once = await runOnce(argv, extraEnv);
    if (once.agentStderr) {
      agentStderrAcc += once.agentStderr;
    }
    const retriable = stderrIndicatesWritableIterableClosed(agentStderrAcc);
    last = {
      result: once.result,
      exitCode: once.exitCode,
      attemptCount: attempt + 1,
      retriableStderrSeen: retriable,
      gateStderr: once.gateStderr,
    };
    const hasSession = once.result.sessionId.trim() !== "";
    if (hasSession && once.exitCode === 0) {
      return last;
    }
    const shouldRetry =
      attempt < maxRetries &&
      !hasSession &&
      (once.exitCode !== 0 || retriable);
    if (!shouldRetry) {
      break;
    }
  }
  return last;
}
