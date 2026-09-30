/**
 * [IMPL-TIED_JEV_DECISION_COPROCESSOR] [ARCH-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR]
 */

import {
  DEFAULT_JEV_API_BASE,
  DEFAULT_JEV_MAX_STATE_CHARS,
  DEFAULT_JEV_MODEL,
} from "./constants.js";
import { resolveJevApiKey } from "./resolve-jev-api-key.js";
import { redactState, stateSerializedLength } from "./redact-state.js";
import type {
  JevDecideRequest,
  JevDecideResponse,
  JevDecideResult,
  JevQuestions,
  JevState,
} from "./types.js";

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
};

export function resolveJevConfig(
  env: NodeJS.ProcessEnv = process.env,
  overrides: JevClientConfig = {},
): Required<Pick<JevClientConfig, "apiBase" | "model" | "maxStateChars">> &
  Pick<JevClientConfig, "apiKey" | "fetchImpl"> {
  const apiKey =
    "apiKey" in overrides
      ? overrides.apiKey
      : resolveJevApiKey(env) ?? env.JEV_API_KEY;
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

export async function jevDecide(
  state: JevState,
  questions: JevQuestions,
  config: JevClientConfig = {},
): Promise<JevDecideResult> {
  const resolved = resolveJevConfig(process.env, config);
  const fetchImpl = resolved.fetchImpl ?? globalThis.fetch;
  if (!resolved.apiKey) {
    return { ok: false, skipped: true, reason: "no_credentials" };
  }
  if (stateSerializedLength(state) > resolved.maxStateChars) {
    return { ok: false, skipped: true, reason: "state_too_large" };
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
    return {
      ok: false,
      skipped: false,
      error: text.slice(0, 500) || response.statusText,
      status: response.status,
    };
  }

  const json = (await response.json()) as JevDecideResponse;
  return { ok: true, response: json };
}
