/**
 * [IMPL-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL] [REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL]
 * [REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE] — L2 live Claude session capacity stderr highlight.
 */
import fs from "node:fs";

export const WF_TRIAL_SESSION_LIMIT_HEADLINE =
  "ERROR: WF trial stopped: Claude session capacity limit";

const SESSION_LIMIT_LINE_RE = /session\s+limit/i;

/** First stdout line containing the provider session-limit message, or null. */
export function detectClaudeSessionLimitLine(text: string): string | null {
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (line === "") {
      continue;
    }
    if (SESSION_LIMIT_LINE_RE.test(line)) {
      return line;
    }
  }
  return null;
}

export function formatSessionLimitHighlightBlock(humanLine: string | null): string {
  const parts = [WF_TRIAL_SESSION_LIMIT_HEADLINE];
  if (humanLine !== null && humanLine.trim() !== "") {
    parts.push(`  ${humanLine.trim()}`);
  }
  parts.push(
    "Hint: retry after the limit resets, try another model, or run with harness=cursor.",
    "",
  );
  return `${parts.join("\n")}\n`;
}

export type SessionLimitHighlightState = { emitted: boolean };

/**
 * Emits at most one highlight block per run when aggregate stdout matches session limit.
 */
export function appendSessionLimitHighlightOnce(
  aggregateStdout: string,
  state: SessionLimitHighlightState,
  writeStderr: (block: string) => void,
): boolean {
  if (state.emitted) {
    return false;
  }
  const humanLine = detectClaudeSessionLimitLine(aggregateStdout);
  if (humanLine === null) {
    return false;
  }
  writeStderr(formatSessionLimitHighlightBlock(humanLine));
  state.emitted = true;
  return true;
}

/** Live path: write highlight directly to fd 2. */
export function writeSessionLimitHighlightToFd2(
  aggregateStdout: string,
  state: SessionLimitHighlightState,
  writeSync: typeof fs.writeSync = fs.writeSync,
): boolean {
  return appendSessionLimitHighlightOnce(aggregateStdout, state, (block) => {
    writeSync(2, block);
  });
}
