/**
 * [IMPL-TIED_CLAUDE_LIVE_DRIVER] [ARCH-TIED_CLAUDE_LIVE_DRIVER] [REQ-TIED_CLAUDE_LIVE_DRIVER]
 * PARSE_CLAUDE_STREAM + EXTRACT_CLAUDE_SESSION — oracle-driven Claude NDJSON parsers.
 */

export type ClaudeStreamEvent =
  | { kind: "thinking"; subtype: string; text: string }
  | { kind: "assistant"; text: string }
  | { kind: "session"; sessionId: string }
  | { kind: "error"; code: string; message: string }
  | {
      kind: "result";
      subtype: string;
      isError: boolean;
      exitCode?: number;
      errors?: string[];
    };

export type ClaudeExitMetadata = {
  isError: boolean;
  exitCode: number;
  errorCode?: string;
  errorMessage?: string;
};

export type ParseClaudeStreamOk = {
  events: ClaudeStreamEvent[];
  exitMetadata: ClaudeExitMetadata;
};

export type ParseClaudeStreamError =
  | { error: "STREAM_PARSE_ERROR" }
  | { error: "STREAM_SCHEMA_DRIFT"; line?: number };

function mapClaudeStreamLine(
  obj: Record<string, unknown>,
): ClaudeStreamEvent | "unknown_shape" | "ignore_line" {
  const typ = String(obj.type ?? "");
  if (typ === "system" && obj.subtype === "init") {
    if (typeof obj.session_id === "string" && obj.session_id !== "") {
      return { kind: "session", sessionId: obj.session_id };
    }
    return "ignore_line";
  }
  if (typ === "rate_limit_event") {
    return "ignore_line";
  }
  if (typ === "thinking") {
    return {
      kind: "thinking",
      subtype: String(obj.subtype ?? ""),
      text: typeof obj.text === "string" ? obj.text : "",
    };
  }
  if (typ === "assistant") {
    const msg = obj.message as Record<string, unknown> | undefined;
    let text = "";
    const parts = msg?.content;
    if (Array.isArray(parts)) {
      for (const p of parts) {
        const pm = p as Record<string, unknown>;
        if (pm.type === "text" && typeof pm.text === "string") {
          text += pm.text;
        }
      }
    }
    return { kind: "assistant", text };
  }
  if (typ === "session") {
    if (typeof obj.session_id !== "string" || obj.session_id === "") {
      return "unknown_shape";
    }
    return { kind: "session", sessionId: obj.session_id };
  }
  if (typ === "error") {
    return {
      kind: "error",
      code: String(obj.code ?? ""),
      message: String(obj.message ?? ""),
    };
  }
  if (typ === "result") {
    const exitRaw = obj.exit_code;
    const exitCode =
      typeof exitRaw === "number" && Number.isFinite(exitRaw) ? exitRaw : undefined;
    const errorsRaw = obj.errors;
    const errors = Array.isArray(errorsRaw)
      ? errorsRaw.filter((e): e is string => typeof e === "string")
      : undefined;
    const subtype = String(obj.subtype ?? "");
    const isError =
      obj.is_error === true ||
      subtype.startsWith("error") ||
      subtype === "error_during_execution";
    return {
      kind: "result",
      subtype,
      isError,
      exitCode,
      errors: errors && errors.length > 0 ? errors : undefined,
    };
  }
  return "unknown_shape";
}

export function deriveExitMetadata(events: ClaudeStreamEvent[]): ClaudeExitMetadata {
  let isError = false;
  let exitCode = 0;
  let errorCode: string | undefined;
  let errorMessage: string | undefined;
  for (const ev of events) {
    if (ev.kind === "error") {
      isError = true;
      errorCode = ev.code;
      errorMessage = ev.message;
    }
    if (ev.kind === "result") {
      isError = ev.isError;
      if (ev.isError && ev.subtype !== "") {
        errorCode = ev.subtype;
      }
      if (ev.errors && ev.errors.length > 0) {
        errorMessage = ev.errors[0];
        isError = true;
      }
      if (ev.exitCode !== undefined) {
        exitCode = ev.exitCode;
      } else if (ev.isError) {
        exitCode = 1;
      }
    }
  }
  return { isError, exitCode, errorCode, errorMessage };
}

/** [PARSE_CLAUDE_STREAM] Parse frozen Claude NDJSON oracle bytes. */
export function parseClaudeStream(
  oracleBytes: string,
): ParseClaudeStreamOk | ParseClaudeStreamError {
  const events: ClaudeStreamEvent[] = [];
  const lines = oracleBytes.split(/\r?\n/);
  let lineNo = 0;
  for (const raw of lines) {
    lineNo += 1;
    const line = raw.trim();
    if (line === "") {
      continue;
    }
    let obj: Record<string, unknown>;
    try {
      obj = JSON.parse(line) as Record<string, unknown>;
    } catch {
      return { error: "STREAM_PARSE_ERROR" };
    }
    const mapped = mapClaudeStreamLine(obj);
    if (mapped === "unknown_shape") {
      continue;
    }
    if (mapped === "ignore_line") {
      continue;
    }
    events.push(mapped);
  }
  return { events, exitMetadata: deriveExitMetadata(events) };
}

export type ExtractClaudeSessionError =
  | { error: "SESSION_ID_MISSING" }
  | { error: "SESSION_CHAIN_MISMATCH" };

/** [EXTRACT_CLAUDE_SESSION] Pull session id from parsed Claude events. */
export function extractClaudeSession(
  events: ClaudeStreamEvent[],
): string | ExtractClaudeSessionError {
  for (const ev of events) {
    if (ev.kind === "session") {
      return ev.sessionId;
    }
  }
  for (const ev of events) {
    if (ev.kind === "result" && ev.subtype === "success") {
      continue;
    }
  }
  return { error: "SESSION_ID_MISSING" };
}

export function claudeEventsToRunText(events: ClaudeStreamEvent[]): {
  finalText: string;
  thinkingText: string;
  transcript: string;
} {
  let finalText = "";
  let thinkingText = "";
  let transcript = "";
  for (const ev of events) {
    if (ev.kind === "thinking" && ev.subtype === "delta" && ev.text !== "") {
      thinkingText += ev.text;
      transcript += ev.text;
    }
    if (ev.kind === "assistant" && ev.text !== "") {
      finalText += ev.text;
      transcript += ev.text;
    }
    if (ev.kind === "thinking" && ev.subtype === "completed") {
      transcript += "\n";
    }
  }
  return { finalText, thinkingText, transcript };
}
