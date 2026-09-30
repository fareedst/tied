/**
 * [IMPL-TIED_JEV_DECISION_COPROCESSOR] [ARCH-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR]
 */

import {
  DEFAULT_JEV_API_BASE,
  DEFAULT_JEV_MAX_STATE_CHARS,
  DEFAULT_JEV_MODEL,
} from "./constants.js";
import {
  appendSystemOneDecideTrace,
  buildSystemOneDecideTraceRecord,
} from "./decide-trace.js";
import { resolveJevApiKey } from "./resolve-jev-api-key.js";
import { redactState, stateSerializedLength } from "./redact-state.js";
import type {
  JevDecideRequest,
  JevDecideResponse,
  JevDecideResult,
  JevQuestions,
  JevState,
} from "./types.js";

export type JevDecideTraceContext = Record<string, unknown>;

export type JevFetch = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export type JevClientConfig = {
  apiKey?: string;
  apiBase?: string;
  model?: string;
  maxStateChars?: number;
  fetchImpl?: JevFetch;
  /** Educational context for system-one-decide-trace.v1 (not sent to vendor). */
  contextMeta?: JevDecideTraceContext;
  callSite?: string;
  /** When true, caller writes trace after enriching context_meta (Blueprint C thresholds). */
  deferDecideTrace?: boolean;
  traceEnv?: NodeJS.ProcessEnv;
};

export function resolveJevConfig(
  env: NodeJS.ProcessEnv = process.env,
  overrides: JevClientConfig = {},
): Required<Pick<JevClientConfig, "apiBase" | "model" | "maxStateChars">> &
  Pick<JevClientConfig, "apiKey" | "fetchImpl"> {
  const apiKey =
    "apiKey" in overrides ? overrides.apiKey : resolveJevApiKey(env);
  return {
    apiKey,
    apiBase: overrides.apiBase ?? env.JEV_API_BASE ?? DEFAULT_JEV_API_BASE,
    model: overrides.model ?? env.JEV_MODEL ?? DEFAULT_JEV_MODEL,
    maxStateChars: overrides.maxStateChars ?? DEFAULT_JEV_MAX_STATE_CHARS,
    fetchImpl: overrides.fetchImpl,
  };
}

async function postDecide(
  url: string,
  apiKey: string,
  body: JevDecideRequest,
  fetchImpl: JevFetch,
): Promise<Response> {
  return fetchImpl(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

function writeDecideTraceIfEnabled(
  input: {
    rawState: JevState;
    questions: JevQuestions;
    result: JevDecideResult;
    latencyMs: number;
    config: JevClientConfig;
    model: string;
  },
): void {
  if (input.config.deferDecideTrace) return;
  const traceEnv = input.config.traceEnv ?? process.env;
  const record = buildSystemOneDecideTraceRecord({
    callSite: input.config.callSite ?? "jevDecide",
    model: input.model,
    rawState: input.rawState,
    questions: input.questions,
    contextMeta: input.config.contextMeta,
    result: input.result,
    latencyMs: input.latencyMs,
  });
  appendSystemOneDecideTrace(record, traceEnv);
}

export async function jevDecide(
  state: JevState,
  questions: JevQuestions,
  config: JevClientConfig = {},
): Promise<JevDecideResult> {
  const resolved = resolveJevConfig(process.env, config);
  const fetchImpl = resolved.fetchImpl ?? globalThis.fetch;
  const t0 = performance.now();
  const callSite = config.callSite ?? "jevDecide";

  if (!resolved.apiKey) {
    const result: JevDecideResult = { ok: false, skipped: true, reason: "no_credentials" };
    writeDecideTraceIfEnabled({
      rawState: state,
      questions,
      result,
      latencyMs: performance.now() - t0,
      config: { ...config, callSite },
      model: resolved.model,
    });
    return result;
  }
  if (stateSerializedLength(state) > resolved.maxStateChars) {
    const result: JevDecideResult = { ok: false, skipped: true, reason: "state_too_large" };
    writeDecideTraceIfEnabled({
      rawState: state,
      questions,
      result,
      latencyMs: performance.now() - t0,
      config: { ...config, callSite },
      model: resolved.model,
    });
    return result;
  }

  const redactedState = redactState(state);
  const payload: JevDecideRequest = {
    model: resolved.model,
    state: redactedState,
    questions,
  };
  const url = `${resolved.apiBase.replace(/\/$/, "")}/v1/decide`;

  let response = await postDecide(url, resolved.apiKey, payload, fetchImpl);
  if (response.status === 502) {
    await new Promise((r) => setTimeout(r, 50));
    response = await postDecide(url, resolved.apiKey, payload, fetchImpl);
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    const result: JevDecideResult = {
      ok: false,
      skipped: false,
      error: text.slice(0, 500) || response.statusText,
      status: response.status,
    };
    writeDecideTraceIfEnabled({
      rawState: state,
      questions,
      result,
      latencyMs: performance.now() - t0,
      config: { ...config, callSite },
      model: resolved.model,
    });
    return result;
  }

  const json = (await response.json()) as JevDecideResponse;
  const result: JevDecideResult = { ok: true, response: json };
  writeDecideTraceIfEnabled({
    rawState: state,
    questions,
    result,
    latencyMs: performance.now() - t0,
    config: { ...config, callSite },
    model: resolved.model,
  });
  return result;
}

/** [IMPL-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] Post-threshold trace with enriched context_meta. */
export function appendDeferredJevDecideTrace(input: {
  rawState: JevState;
  questions: JevQuestions;
  result: JevDecideResult;
  latencyMs: number;
  config: JevClientConfig;
}): void {
  const resolved = resolveJevConfig(process.env, input.config);
  const record = buildSystemOneDecideTraceRecord({
    callSite: input.config.callSite ?? "checklist_evidence_sufficiency",
    model: resolved.model,
    rawState: input.rawState,
    questions: input.questions,
    contextMeta: input.config.contextMeta,
    result: input.result,
    latencyMs: input.latencyMs,
  });
  appendSystemOneDecideTrace(record, input.config.traceEnv ?? process.env);
}
