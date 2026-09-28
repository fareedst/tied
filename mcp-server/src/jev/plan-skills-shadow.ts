/**
 * [IMPL-TIED_JEV_DECISION_COPROCESSOR] [ARCH-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR]
 * RUN_PLAN_SKILLS_SHADOW
 */

import { DEFAULT_JEV_API_BASE, DEFAULT_JEV_MODEL } from "./constants.js";
import { jevDecide, resolveJevConfig, type JevClientConfig, type JevFetch } from "./client.js";
import { loadMergedRoutingBaseline } from "./merged-routing-baseline.js";
import { matchKeywordGlossaries } from "./keyword-preload.js";
import { redactString } from "./redact-state.js";
import { resolvePlanSkillsConfig } from "./plan-skills-config.js";
import {
  assessJevServiceReadinessBeforeCall,
  assessJevServiceReadinessFromDecide,
} from "./plan-skills-readiness.js";
import {
  buildGlossaryJevQuestions,
  jevAnswersToGlossaryIds,
  vocabShadowAgrees,
} from "./shadow-vocab-preload.js";
import {
  normalizePlanSkillsRunId,
  writeVocabShadowEvidence,
} from "./plan-skills-evidence.js";
import {
  applyTiebreakAdvisoryDisplay,
  type PlanSkillsShadowMode,
} from "./plan-skills-tiebreak.js";
import {
  isPlanSkillName,
  PLAN_SKILLS_PROOF_BOUNDARY,
  PLAN_SKILLS_VOCAB_SHADOW_SCHEMA,
  type PlanSkillName,
} from "./plan-skills-types.js";
import type { JevDecideResult } from "./types.js";

const PROMPT_MAX = 4000;
const PLAN_EXCERPT_MAX = 8000;

export type PlanSkillsVocabShadowV1 = Record<string, unknown>;

export type RunPlanSkillsShadowInput = {
  projectRoot: string;
  tiedBasePath: string;
  prompt: string;
  skill: string;
  plan_excerpt?: string;
  phase?: string;
  request_token?: string;
  run_id?: string;
  record_evidence?: boolean;
  shadow_mode?: PlanSkillsShadowMode;
  env?: NodeJS.ProcessEnv;
  fetchImpl?: JevFetch;
};

function redactApiBase(apiBase: string): string {
  try {
    const u = new URL(apiBase);
    return `${u.protocol}//${u.host}/…`;
  } catch {
    return "[invalid-base]";
  }
}

function withTimeoutFetch(fetchImpl: JevFetch, timeoutMs: number): JevFetch {
  return async (input, init) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const abortPromise = new Promise<Response>((_, reject) => {
      controller.signal.addEventListener("abort", () => {
        reject(new Error("AbortError"));
      });
    });
    try {
      return await Promise.race([
        fetchImpl(input, { ...init, signal: controller.signal }),
        abortPromise,
      ]);
    } finally {
      clearTimeout(timer);
    }
  };
}

function isAbortError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return err.name === "AbortError" || err.message.toLowerCase().includes("abort");
}

export async function runPlanSkillsShadow(
  input: RunPlanSkillsShadowInput,
): Promise<PlanSkillsVocabShadowV1> {
  const env = input.env ?? process.env;
  const cfg = resolvePlanSkillsConfig(input.projectRoot, env);
  const jevCfg = resolveJevConfig(env);
  const keyPresent = (jevCfg.apiKey?.trim() ?? "").length > 0;

  const promptRaw = input.prompt ?? "";
  const prompt_truncated = promptRaw.length > PROMPT_MAX;
  const prompt = promptRaw.slice(0, PROMPT_MAX);

  const excerptRaw = input.plan_excerpt ?? "";
  const plan_excerpt_truncated = excerptRaw.length > PLAN_EXCERPT_MAX;
  const planExcerpt = excerptRaw.slice(0, PLAN_EXCERPT_MAX);

  if (!isPlanSkillName(input.skill)) {
    return {
      schema: PLAN_SKILLS_VOCAB_SHADOW_SCHEMA,
      error: "invalid_skill",
      proof_boundary: PLAN_SKILLS_PROOF_BOUNDARY,
    };
  }

  const skill: PlanSkillName = input.skill;
  const merged = loadMergedRoutingBaseline({ tiedBasePath: input.tiedBasePath });
  const keyword_glossaries = matchKeywordGlossaries(prompt, merged.rows);

  const basePayload: PlanSkillsVocabShadowV1 = {
    schema: PLAN_SKILLS_VOCAB_SHADOW_SCHEMA,
    skill,
    phase: input.phase ?? "refine",
    enabled: cfg.enabled,
    key_present: keyPresent,
    keyword_glossaries,
    jev_glossaries: [] as string[],
    agrees: true,
    confidence: null,
    model: jevCfg.model ?? DEFAULT_JEV_MODEL,
    prompt_truncated,
    plan_excerpt_truncated,
    proof_boundary: PLAN_SKILLS_PROOF_BOUNDARY,
  };

  const preCall = assessJevServiceReadinessBeforeCall(cfg.enabled, keyPresent);
  if (preCall.readiness === "disabled" || preCall.readiness === "configured_no_credentials") {
    return {
      ...basePayload,
      readiness: preCall.readiness,
      service_reachable: false,
    };
  }

  const clientConfig: JevClientConfig = {
    apiKey: jevCfg.apiKey,
    apiBase: jevCfg.apiBase,
    model: jevCfg.model,
    maxStateChars: jevCfg.maxStateChars,
    fetchImpl: withTimeoutFetch(input.fetchImpl ?? globalThis.fetch, cfg.timeout_ms),
  };

  const state = { prompt, plan_excerpt: planExcerpt || undefined, skill };
  let decideResult: JevDecideResult | undefined;
  let timedOut = false;
  let transportError: string | undefined;

  try {
    decideResult = await jevDecide(state, buildGlossaryJevQuestions(merged.rows), clientConfig);
  } catch (err) {
    if (isAbortError(err)) {
      timedOut = true;
    } else {
      transportError = redactString(err instanceof Error ? err.message : String(err));
    }
  }

  let jev_glossaries: string[] = [];
  let confidence: number | null = null;
  let agrees = true;
  let answersUsable = true;

  if (decideResult?.ok) {
    try {
      const parsed = jevAnswersToGlossaryIds(
        merged.rows,
        decideResult.response.answers as Record<
          string,
          { type: string; choice?: string; noul?: number; confidence?: number }
        >,
      );
      jev_glossaries = parsed.glossaries;
      confidence = parsed.confidence;
      agrees = vocabShadowAgrees(keyword_glossaries, jev_glossaries);
    } catch {
      answersUsable = false;
    }
  } else if (decideResult && !decideResult.ok && !decideResult.skipped) {
    agrees = true;
  }

  const assessment = assessJevServiceReadinessFromDecide(cfg.enabled, keyPresent, decideResult, {
    timedOut,
    transportError,
    answersUsable,
  });

  const shadowMode: PlanSkillsShadowMode = input.shadow_mode ?? "advisory";
  const tiebreakFields = applyTiebreakAdvisoryDisplay({
    shadow_mode: shadowMode,
    readiness: assessment.readiness,
    keyword_glossaries,
    jev_glossaries,
    confidence,
  });

  const result: PlanSkillsVocabShadowV1 = {
    ...basePayload,
    readiness: assessment.readiness,
    service_reachable: assessment.service_reachable,
    jev_glossaries,
    agrees,
    confidence,
    api_base_redacted: redactApiBase(jevCfg.apiBase ?? DEFAULT_JEV_API_BASE),
    ...(assessment.failure_class ? { failure_class: assessment.failure_class } : {}),
    ...(assessment.skip_reason ? { skip_reason: assessment.skip_reason } : {}),
    ...(assessment.failure_excerpt_redacted
      ? { failure_excerpt_redacted: assessment.failure_excerpt_redacted }
      : {}),
    ...(shadowMode === "tiebreak" ? tiebreakFields : {}),
  };

  if (input.record_evidence && input.request_token) {
    const runNorm = normalizePlanSkillsRunId(input.run_id);
    if (typeof runNorm !== "string") {
      return { ...result, error: runNorm.error };
    }
    const written = writeVocabShadowEvidence(
      input.projectRoot,
      input.request_token,
      runNorm,
      result,
    );
    if ("error" in written) {
      return { ...result, error: written.error };
    }
    return {
      ...result,
      request_token: input.request_token,
      run_id: runNorm,
      artifact_relpath: written.artifact_relpath,
    };
  }

  return result;
}
