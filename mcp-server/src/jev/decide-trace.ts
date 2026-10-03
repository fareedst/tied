/**
 * [IMPL-TIED_JEV_DECISION_COPROCESSOR] [IMPL-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY]
 * [ARCH-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY]
 * system-one-decide-trace.v1 JSONL writer (opt-in via JEV_DECIDE_TRACE).
 */

import fs from "node:fs";
import path from "node:path";

import { resolveGlobalLocalWorkingPath } from "../working-root.js";
import { redactState, stateSerializedLength } from "./redact-state.js";
import type { JevDecideResult, JevQuestions, JevState } from "./types.js";

export const SYSTEM_ONE_DECIDE_TRACE_SCHEMA = "system-one-decide-trace.v1" as const;

export type SystemOneDecideTraceRecord = {
  schema: typeof SYSTEM_ONE_DECIDE_TRACE_SCHEMA;
  ts: string;
  call_site: string;
  model: string;
  request: { state: JevState; questions: JevQuestions };
  context_meta: Record<string, unknown>;
  state_metrics: {
    pre_redaction_chars: number;
    post_redaction_chars: number;
    skipped_reason?: string;
  };
  response: Record<string, unknown>;
  latency_ms: number;
  usage: Record<string, unknown> | null;
};

export function isDecideTraceEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  const raw = env.JEV_DECIDE_TRACE?.trim().toLowerCase();
  return raw === "1" || raw === "true";
}

export function resolveDecideTracePath(env: NodeJS.ProcessEnv = process.env): string {
  const configured = env.JEV_DECIDE_TRACE_PATH?.trim();
  const tiedBase = env.TIED_BASE_PATH?.trim();
  const repoRoot = tiedBase
    ? path.basename(tiedBase) === "tied"
      ? path.dirname(tiedBase)
      : tiedBase
    : process.cwd();
  if (configured) {
    return path.isAbsolute(configured) ? configured : path.join(repoRoot, configured);
  }
  return resolveGlobalLocalWorkingPath(
    repoRoot,
    "jev-decide-trace",
    "system-one-decide.v1.jsonl",
  );
}

export function buildSystemOneDecideTraceRecord(input: {
  callSite: string;
  model: string;
  rawState: JevState;
  questions: JevQuestions;
  contextMeta?: Record<string, unknown>;
  result: JevDecideResult;
  latencyMs: number;
}): SystemOneDecideTraceRecord {
  const redactedState = redactState(input.rawState);
  const postChars =
    typeof redactedState === "string"
      ? redactedState.length
      : JSON.stringify(redactedState).length;

  let response: Record<string, unknown>;
  let skippedReason: string | undefined;
  let usage: Record<string, unknown> | null = null;

  if (input.result.ok) {
    response = { ...input.result.response } as Record<string, unknown>;
    if (input.result.response.usage) {
      usage = { ...input.result.response.usage };
    }
  } else if (input.result.skipped) {
    skippedReason = input.result.reason;
    response = { skipped: true, reason: input.result.reason };
  } else {
    response = {
      error: input.result.error,
      ...(input.result.status !== undefined ? { status: input.result.status } : {}),
    };
  }

  return {
    schema: SYSTEM_ONE_DECIDE_TRACE_SCHEMA,
    ts: new Date().toISOString(),
    call_site: input.callSite,
    model: input.model,
    request: { state: redactedState, questions: input.questions },
    context_meta: input.contextMeta ?? {},
    state_metrics: {
      pre_redaction_chars: stateSerializedLength(input.rawState),
      post_redaction_chars: postChars,
      ...(skippedReason ? { skipped_reason: skippedReason } : {}),
    },
    response,
    latency_ms: Math.round(input.latencyMs * 100) / 100,
    usage,
  };
}

export function appendSystemOneDecideTrace(
  record: SystemOneDecideTraceRecord,
  env: NodeJS.ProcessEnv = process.env,
): void {
  if (!isDecideTraceEnabled(env)) return;

  const tracePath = resolveDecideTracePath(env);
  try {
    fs.mkdirSync(path.dirname(tracePath), { recursive: true });
    fs.appendFileSync(tracePath, `${JSON.stringify(record)}\n`, "utf8");
  } catch {
    // best-effort; tracing must not change decide outcomes
  }

  const stderrFlag = env.JEV_DECIDE_TRACE_STDERR?.trim().toLowerCase();
  if (stderrFlag === "1" || stderrFlag === "true") {
    const summary = record.state_metrics.skipped_reason
      ? `skipped=${record.state_metrics.skipped_reason}`
      : record.response.skipped
        ? "skipped"
        : "ok";
    console.error(
      `DEBUG: jev-decide-trace call_site=${record.call_site} latency_ms=${record.latency_ms} ${summary}`,
    );
  }
}
