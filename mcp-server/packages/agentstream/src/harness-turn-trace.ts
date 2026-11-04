/**
 * [IMPL-AGENTSTREAM_CLAUDE_WF_PARITY] [ARCH-AGENTSTREAM_CLAUDE_WF_PARITY] [REQ-AGENTSTREAM_CLAUDE_WF_PARITY]
 * Optional JSONL trace for live agentstream turns (AGENTSTREAM_HARNESS_TRACE=1).
 */
import fs from "node:fs";
import path from "node:path";

export const HARNESS_TURN_TRACE_SCHEMA = "harness-turn-trace.v1";

export type HarnessTurnTraceRecord = {
  schema_version: typeof HARNESS_TURN_TRACE_SCHEMA;
  timestamp: string;
  harness: string;
  model: string;
  workspace: string;
  turn_index: number;
  turn_total: number;
  session_id: string;
  exit_code: number;
  request_token: string;
};

export function harnessTraceEnabled(): boolean {
  const v = process.env.AGENTSTREAM_HARNESS_TRACE?.trim();
  return v === "1" || v === "true";
}

export function defaultHarnessTracePath(
  projectRoot: string,
  requestToken: string,
): string {
  const token = requestToken.trim() || "UNKNOWN_REQ";
  return path.join(
    projectRoot,
    "tied-project",
    "working",
    token,
    "evidence",
    "harness-turn-trace.jsonl",
  );
}

export function resolveHarnessTracePath(
  projectRoot: string,
  requestToken: string,
): string {
  const override = (process.env.AGENTSTREAM_HARNESS_TRACE_PATH ?? "").trim();
  if (override !== "") {
    return path.isAbsolute(override)
      ? override
      : path.join(projectRoot, override);
  }
  return defaultHarnessTracePath(projectRoot, requestToken);
}

export function appendHarnessTurnTrace(
  tracePath: string,
  record: HarnessTurnTraceRecord,
): void {
  fs.mkdirSync(path.dirname(tracePath), { recursive: true });
  fs.appendFileSync(tracePath, `${JSON.stringify(record)}\n`, "utf8");
}

export function buildHarnessTurnTraceRecord(input: {
  harness: string;
  model: string;
  workspace: string;
  turnIndex: number;
  turnTotal: number;
  sessionId: string;
  exitCode: number;
  requestToken: string;
  timestamp?: string;
}): HarnessTurnTraceRecord {
  return {
    schema_version: HARNESS_TURN_TRACE_SCHEMA,
    timestamp: input.timestamp ?? new Date().toISOString(),
    harness: input.harness,
    model: input.model,
    workspace: path.resolve(input.workspace),
    turn_index: input.turnIndex,
    turn_total: input.turnTotal,
    session_id: input.sessionId,
    exit_code: input.exitCode,
    request_token: input.requestToken,
  };
}
