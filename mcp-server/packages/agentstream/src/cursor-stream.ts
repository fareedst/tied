/**
 * [IMPL-WF_TRIAL_CURSOR_LIVE_SESSION_ORACLE] [ARCH-WF_TRIAL_CURSOR_LIVE_SESSION_ORACLE]
 * [REQ-WF_TRIAL_CURSOR_LIVE_SESSION_ORACLE]
 * EXTRACT_CURSOR_SESSION — Cursor NDJSON session oracle (SC-CURSOR-SESSION-01).
 */

/** Bounded retries after failed turn (3 attempts total). */
export const CURSOR_TURN_RETRY_MAX = 2;

export function extractCursorSessionFromLine(
  obj: Record<string, unknown>,
): string {
  const typ = String(obj.type ?? "");
  if (typ === "system" && obj.subtype === "init") {
    if (typeof obj.session_id === "string" && obj.session_id !== "") {
      return obj.session_id;
    }
    return "";
  }
  if (typ === "session") {
    if (typeof obj.session_id === "string" && obj.session_id !== "") {
      return obj.session_id;
    }
    return "";
  }
  if (typeof obj.session_id === "string" && obj.session_id !== "") {
    return obj.session_id;
  }
  return "";
}

export function extractCursorSessionFromJsonLine(line: string): string {
  const trimmed = line.trim();
  if (trimmed === "") {
    return "";
  }
  try {
    const obj = JSON.parse(trimmed) as Record<string, unknown>;
    return extractCursorSessionFromLine(obj);
  } catch {
    return "";
  }
}

export function stderrIndicatesWritableIterableClosed(stderr: string): boolean {
  return (
    stderr.includes("WritableIterable") &&
    stderr.includes("closed") &&
    (stderr.includes("RetriableError") || stderr.includes("Retriable"))
  );
}

export function formatCursorLiveSessionOracleDiagnostic(input: {
  exit_code: number;
  session_captured: boolean;
  retriable_stderr_seen: boolean;
  attempt_count: number;
}): string {
  return (
    `DIAGNOSTIC: cursor_live_session_oracle ` +
    `exit_code=${input.exit_code} ` +
    `session_captured=${input.session_captured} ` +
    `retriable_stderr_seen=${input.retriable_stderr_seen} ` +
    `attempt_count=${input.attempt_count}\n`
  );
}
