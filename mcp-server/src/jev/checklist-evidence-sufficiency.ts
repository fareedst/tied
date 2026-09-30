/**
 * [IMPL-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [ARCH-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [REQ-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY]
 * Blueprint C W1: config, slug scope, evidence extract, Tier-1 deterministic prechecks, pre-gate disposition.
 */

import {
  collectChecklistStepEvidenceStrings,
  derivePhaseAwareSlugs,
  listChecklistTrackerSteps,
  type AdversarialDepth,
  type GatePhase,
} from "../checklist-validator.js";
import {
  appendDeferredJevDecideTrace,
  jevDecide,
  type JevClientConfig,
} from "./client.js";
import { DEFAULT_JEV_MAX_STATE_CHARS } from "./constants.js";
import {
  manifestEnablesChecklistEvidenceSufficiency,
  readRepoTiedYaml,
} from "./repo-tied-yaml.js";
import type { JevDecideResult, JevQuestions } from "./types.js";

export type ChecklistEvidenceSufficiencyEnabledSource = "env" | "tied_yaml" | "default_off";

export type ChecklistEvidenceSufficiencyConfig = {
  enabled: boolean;
  enabled_source: ChecklistEvidenceSufficiencyEnabledSource;
  diagnostics: string[];
};

export type GateEvidenceState = {
  slug: string;
  disposition?: string;
  criterion_text: string;
  evidence_excerpt: string;
  required_tokens: string[];
};

export type DeterministicPrecheckResult = {
  ok: boolean;
  reasons: string[];
  remediation_hints: string[];
};

export type PreGateDisposition = {
  ok: false;
  pre_gate: "jev_evidence_sufficiency";
  allowed: false;
  blocking: true;
  phase: GatePhase;
  failed_step_slugs: string[];
  reasons: string[];
  remediation_hints: string[];
  user_message: string;
  jev_observation: Record<string, unknown>;
  diagnostics: string[];
};

export const SUBSTANTIVE_NOUL_REJECT_BELOW = 0.6;
export const TOKEN_NOUL_REJECT_BELOW = 0.6;
export const COMPLETENESS_SCORE_REJECT_AT_OR_BELOW = 2;

/** 1–5 scale; criteria array length must be 5 (Blueprint C). */
export const SCORE_EVIDENCE_COMPLETENESS_CRITERIA: readonly string[] = [
  "1 — No executable artifacts; vacuous or circular claims only",
  "2 — Generic completion claim without commands, paths, or logs",
  "3 — Partial artifacts (one of command output, path, or token citation)",
  "4 — Solid evidence with command output and paths or logs",
  "5 — Complete gate-quality evidence: command output, paths, and token citations when required",
];

export type ParsedJevSufficiencyAnswers = {
  substantive_noul?: number;
  token_noul?: number;
  completeness_score?: number;
};

export type JevEvidenceSufficiencyFanoutResult = {
  jev_skipped: boolean;
  jev_skip_reason?: string;
  answers?: ParsedJevSufficiencyAnswers;
  observation: Record<string, unknown>;
};

export type SufficiencyThresholdResult = {
  pass: boolean;
  reasons: string[];
  remediation_hints: string[];
};

export type PreGateSlugEvaluation =
  | { ok: true; slug: string; jev_fail_open?: boolean }
  | { ok: false; slug: string; reasons: string[]; remediation_hints: string[] };

export type ChecklistEvidenceSufficiencyPreGateResult =
  | { ok: true; jev_fail_open_slugs: string[] }
  | { ok: false; disposition: PreGateDisposition };

export type JevDecideFn = (
  state: Record<string, unknown>,
  questions: JevQuestions,
  config?: JevClientConfig,
) => Promise<JevDecideResult>;

export const PRE_GATE_USER_MESSAGE =
  "Gate evidence appears superficial. Provide exact terminal output and token citations.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(record: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    if (typeof record[key] === "string" && record[key].trim()) return record[key] as string;
  }
  return undefined;
}

function parseEnvFlag(raw: string): { enabled: boolean; valid: boolean } {
  const v = raw.trim().toLowerCase();
  if (v === "1" || v === "true") return { enabled: true, valid: true };
  if (v === "0" || v === "false") return { enabled: false, valid: true };
  return { enabled: false, valid: false };
}

function adversarialSection(citdp: unknown): Record<string, unknown> | undefined {
  if (!isRecord(citdp)) return undefined;
  if (isRecord(citdp.adversarial_inquiry)) return citdp.adversarial_inquiry;
  const risk = isRecord(citdp.risk_analysis) ? citdp.risk_analysis : undefined;
  if (risk && isRecord(risk.adversarial_inquiry)) return risk.adversarial_inquiry;
  return undefined;
}

function readDepthTier(citdp: unknown): AdversarialDepth | undefined {
  const depth = adversarialSection(citdp)?.depth_tier;
  if (depth === "minimal" || depth === "integrated" || depth === "strict_candidate") {
    return depth;
  }
  return undefined;
}

function stepDisposition(step: Record<string, unknown>): string | undefined {
  const tracking = isRecord(step.tracking) ? step.tracking : undefined;
  return getString(step, "disposition", "status")
    ?? (tracking ? getString(tracking, "disposition", "status") : undefined);
}

function readRequiredTokens(step: Record<string, unknown>): string[] {
  if (Array.isArray(step.required_tokens)) {
    return step.required_tokens.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  }
  const contract = step.evidence_contract;
  if (isRecord(contract) && Array.isArray(contract.required_tokens)) {
    return contract.required_tokens.filter(
      (item): item is string => typeof item === "string" && item.trim().length > 0,
    );
  }
  return [];
}

function capExcerpt(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars);
}

// [IMPL-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [ARCH-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [REQ-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY]
export function resolveChecklistEvidenceSufficiencyConfig(
  projectRoot: string,
  env: NodeJS.ProcessEnv = process.env,
): ChecklistEvidenceSufficiencyConfig {
  const diagnostics: string[] = [];
  const envOverride = env.TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY;
  if (envOverride !== undefined && envOverride.trim() !== "") {
    const parsed = parseEnvFlag(envOverride);
    if (!parsed.valid) {
      diagnostics.push("invalid_env_override");
    }
    return {
      enabled: parsed.enabled,
      enabled_source: "env",
      diagnostics,
    };
  }

  if (manifestEnablesChecklistEvidenceSufficiency(projectRoot)) {
    return {
      enabled: true,
      enabled_source: "tied_yaml",
      diagnostics,
    };
  }

  if (env.TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY === undefined) {
    const repo = readRepoTiedYaml(projectRoot);
    const jev = repo?.jev;
    if (
      jev
      && typeof jev === "object"
      && !Array.isArray(jev)
      && "checklist_evidence_sufficiency" in (jev as Record<string, unknown>)
      && (jev as Record<string, unknown>).checklist_evidence_sufficiency !== true
      && (jev as Record<string, unknown>).checklist_evidence_sufficiency !== undefined
      && (jev as Record<string, unknown>).checklist_evidence_sufficiency !== null
    ) {
      diagnostics.push("invalid_checklist_evidence_sufficiency_flag");
    }
  }

  return {
    enabled: false,
    enabled_source: "default_off",
    diagnostics,
  };
}

// [IMPL-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [ARCH-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
export function derivePreGateTargetSlugs(input: {
  citdp?: unknown;
  depthTier?: AdversarialDepth;
  phase: GatePhase;
  requiredStepSlugs?: readonly string[];
}): string[] {
  const depth = input.depthTier ?? readDepthTier(input.citdp);
  const autoSlugs = depth ? derivePhaseAwareSlugs(depth, input.phase) : [];
  return [...new Set([...autoSlugs, ...(input.requiredStepSlugs ?? [])])];
}

// [IMPL-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [ARCH-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
export function extractGateEvidenceState(input: {
  tracker: unknown;
  slug: string;
  maxExcerptChars?: number;
}): GateEvidenceState | undefined {
  const steps = listChecklistTrackerSteps(input.tracker);
  const step = steps.find((candidate) => getString(candidate, "slug", "id") === input.slug);
  if (!step) return undefined;

  const parts = collectChecklistStepEvidenceStrings(step);
  const maxChars = input.maxExcerptChars ?? DEFAULT_JEV_MAX_STATE_CHARS;
  const evidence_excerpt = capExcerpt(parts.join("\n"), maxChars);

  const title = getString(step, "title") ?? input.slug;
  const tasks = Array.isArray(step.tasks)
    ? step.tasks.filter((item): item is string => typeof item === "string").join(" ")
    : "";
  const criterion_text = tasks ? `${title} — ${tasks}` : title;

  return {
    slug: input.slug,
    disposition: stepDisposition(step),
    criterion_text,
    evidence_excerpt,
    required_tokens: readRequiredTokens(step),
  };
}

// [IMPL-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [ARCH-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [REQ-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY]
export function runDeterministicEvidencePrechecks(input: {
  featureEnabled: boolean;
  evidenceExcerpt: string;
  requiredTokens?: readonly string[];
}): DeterministicPrecheckResult {
  if (!input.featureEnabled) {
    return { ok: true, reasons: [], remediation_hints: [] };
  }
  if (!input.evidenceExcerpt.trim()) {
    return {
      ok: false,
      reasons: ["empty_evidence_excerpt"],
      remediation_hints: ["command_output"],
    };
  }
  const required = input.requiredTokens ?? [];
  const missing = required.filter((token) => !input.evidenceExcerpt.includes(token));
  if (missing.length > 0) {
    return {
      ok: false,
      reasons: missing.map((token) => `missing_required_token:${token}`),
      remediation_hints: ["token_citations"],
    };
  }
  return { ok: true, reasons: [], remediation_hints: [] };
}

// [IMPL-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [ARCH-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
export function emitPreGateDisposition(input: {
  phase: GatePhase;
  failedSlugs: string[];
  reasons: string[];
  remediation_hints: string[];
  jev_observation?: Record<string, unknown>;
}): PreGateDisposition {
  return {
    ok: false,
    pre_gate: "jev_evidence_sufficiency",
    allowed: false,
    blocking: true,
    phase: input.phase,
    failed_step_slugs: [...input.failedSlugs],
    reasons: [...input.reasons],
    remediation_hints: [...new Set(input.remediation_hints)],
    user_message: PRE_GATE_USER_MESSAGE,
    jev_observation: input.jev_observation ?? {},
    diagnostics: ["pre_gate:jev_evidence_sufficiency"],
  };
}

function dispositionEligible(disposition: string | undefined): boolean {
  if (!disposition) return false;
  const d = disposition.toLowerCase();
  return d === "completed" || d === "waived";
}

// [IMPL-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [ARCH-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [REQ-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY]
export function buildEvidenceSufficiencyQuestions(tokenQuestionRequired: boolean): JevQuestions {
  const questions: JevQuestions = {
    noul_evidence_substantive: {
      type: "noul",
      instructions:
        "Does the evidence excerpt show concrete execution outputs (commands, logs, paths) rather than generic completion claims?",
    },
    score_evidence_completeness: {
      type: "score",
      instructions:
        "Rate how completely the evidence satisfies the gate step criterion on a 1–5 scale (1= vacuous, 5= complete).",
      criteria: [...SCORE_EVIDENCE_COMPLETENESS_CRITERIA],
    },
  };
  if (tokenQuestionRequired) {
    questions.noul_tokens_present = {
      type: "noul",
      instructions:
        "Are the required semantic tokens from the step contract explicitly cited in the evidence excerpt?",
    };
  }
  return questions;
}

function parseFanoutAnswers(
  result: JevDecideResult,
  tokenQuestionRequired: boolean,
): { parsed?: ParsedJevSufficiencyAnswers; observation: Record<string, unknown> } {
  if (!result.ok) {
    return {
      observation: result.skipped
        ? { jev_skipped: true, reason: result.reason }
        : { jev_error: result.error, status: result.status },
    };
  }
  const answers = result.response.answers;
  const substantive = answers.noul_evidence_substantive;
  const scoreAns = answers.score_evidence_completeness;
  const tokenAns = answers.noul_tokens_present;
  const parsed: ParsedJevSufficiencyAnswers = {
    substantive_noul: substantive?.type === "noul" ? substantive.noul : undefined,
    completeness_score: scoreAns?.type === "score" ? scoreAns.score : undefined,
    ...(tokenQuestionRequired
      ? { token_noul: tokenAns?.type === "noul" ? tokenAns.noul : undefined }
      : {}),
  };
  return {
    parsed,
    observation: {
      model: result.response.model,
      answers: parsed,
      usage: result.response.usage ?? null,
    },
  };
}

// [IMPL-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [ARCH-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY]
export async function runJevEvidenceSufficiencyFanout(input: {
  gatePhase: GatePhase;
  evidenceState: GateEvidenceState;
  jevConfig?: JevClientConfig;
  decideFn?: JevDecideFn;
}): Promise<JevEvidenceSufficiencyFanoutResult> {
  const tokenRequired = input.evidenceState.required_tokens.length > 0;
  const questions = buildEvidenceSufficiencyQuestions(tokenRequired);
  const compactState = {
    gate_criterion: input.evidenceState.criterion_text,
    evidence_excerpt: input.evidenceState.evidence_excerpt,
    required_tokens: input.evidenceState.required_tokens,
    step_slug: input.evidenceState.slug,
  };

  const baseContextMeta: Record<string, unknown> = {
    feature: "checklist_evidence_sufficiency",
    gate_phase: input.gatePhase,
    step_slug: input.evidenceState.slug,
    evidence_contract_summary: input.evidenceState.required_tokens,
    deterministic_precheck: "passed",
    thresholds_applied: {
      substantive_noul_below: SUBSTANTIVE_NOUL_REJECT_BELOW,
      completeness_score_at_or_below: COMPLETENESS_SCORE_REJECT_AT_OR_BELOW,
      token_noul_below: tokenRequired ? TOKEN_NOUL_REJECT_BELOW : null,
    },
  };

  const clientConfig: JevClientConfig = {
    ...input.jevConfig,
    callSite: input.jevConfig?.callSite ?? "checklist_evidence_sufficiency",
    contextMeta: { ...baseContextMeta, ...input.jevConfig?.contextMeta },
    deferDecideTrace: true,
  };

  const decide = input.decideFn ?? jevDecide;
  const t0 = performance.now();
  let decideResult: JevDecideResult;
  try {
    decideResult = await decide(compactState, questions, clientConfig);
  } catch (err) {
    return {
      jev_skipped: true,
      jev_skip_reason: "exception",
      observation: { jev_skipped: true, reason: String(err) },
    };
  }
  const latencyMs = performance.now() - t0;

  if (!decideResult.ok) {
    if (decideResult.skipped) {
      appendDeferredJevDecideTrace({
        rawState: compactState,
        questions,
        result: decideResult,
        latencyMs,
        config: {
          ...clientConfig,
          contextMeta: {
            ...clientConfig.contextMeta,
            pre_gate_disposition: "fail_open",
          },
        },
      });
      return {
        jev_skipped: true,
        jev_skip_reason: decideResult.reason,
        observation: { jev_skipped: true, reason: decideResult.reason },
      };
    }
    appendDeferredJevDecideTrace({
      rawState: compactState,
      questions,
      result: decideResult,
      latencyMs,
      config: {
        ...clientConfig,
        contextMeta: {
          ...clientConfig.contextMeta,
          pre_gate_disposition: "fail_open",
        },
      },
    });
    return {
      jev_skipped: true,
      jev_skip_reason: "http_error",
      observation: { jev_error: decideResult.error, status: decideResult.status },
    };
  }

  const { parsed, observation } = parseFanoutAnswers(decideResult, tokenRequired);
  const threshold = applySufficiencyThresholds({
    answers: parsed ?? {},
    tokenQuestionRequired: tokenRequired,
    stepSlug: input.evidenceState.slug,
  });

  appendDeferredJevDecideTrace({
    rawState: compactState,
    questions,
    result: decideResult,
    latencyMs,
    config: {
      ...clientConfig,
      contextMeta: {
        ...clientConfig.contextMeta,
        pre_gate_disposition: threshold.pass ? "pass" : "reject_jev",
      },
    },
  });

  return {
    jev_skipped: false,
    answers: parsed,
    observation: {
      ...observation,
      threshold,
    },
  };
}

// [IMPL-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [ARCH-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [REQ-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY]
export function applySufficiencyThresholds(input: {
  answers: ParsedJevSufficiencyAnswers;
  tokenQuestionRequired: boolean;
  stepSlug: string;
}): SufficiencyThresholdResult {
  const reasons: string[] = [];
  const remediation_hints: string[] = [];

  const substantive = input.answers.substantive_noul;
  if (substantive !== undefined && substantive < SUBSTANTIVE_NOUL_REJECT_BELOW) {
    reasons.push(
      `noul_evidence_substantive below threshold for step ${input.stepSlug}`,
    );
    remediation_hints.push("command_output", "file_paths");
  }

  const score = input.answers.completeness_score;
  if (score !== undefined && score <= COMPLETENESS_SCORE_REJECT_AT_OR_BELOW) {
    reasons.push(
      `score_evidence_completeness at or below ${COMPLETENESS_SCORE_REJECT_AT_OR_BELOW} for step ${input.stepSlug}`,
    );
    remediation_hints.push("command_output");
  }

  if (input.tokenQuestionRequired) {
    const tokenNoul = input.answers.token_noul;
    if (tokenNoul !== undefined && tokenNoul < TOKEN_NOUL_REJECT_BELOW) {
      reasons.push(`noul_tokens_present below threshold for step ${input.stepSlug}`);
      remediation_hints.push("token_citations");
    }
  }

  return {
    pass: reasons.length === 0,
    reasons,
    remediation_hints,
  };
}

// [IMPL-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [ARCH-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
export async function evaluatePreGateTargetSlug(input: {
  featureEnabled: boolean;
  phase: GatePhase;
  tracker: unknown;
  slug: string;
  jevConfig?: JevClientConfig;
  decideFn?: JevDecideFn;
}): Promise<PreGateSlugEvaluation> {
  if (!input.featureEnabled) {
    return { ok: true, slug: input.slug };
  }

  const evidenceState = extractGateEvidenceState({ tracker: input.tracker, slug: input.slug });
  if (!evidenceState) {
    return { ok: true, slug: input.slug };
  }
  if (!dispositionEligible(evidenceState.disposition)) {
    return { ok: true, slug: input.slug };
  }

  const tier1 = runDeterministicEvidencePrechecks({
    featureEnabled: true,
    evidenceExcerpt: evidenceState.evidence_excerpt,
    requiredTokens: evidenceState.required_tokens,
  });
  if (!tier1.ok) {
    return {
      ok: false,
      slug: input.slug,
      reasons: tier1.reasons,
      remediation_hints: tier1.remediation_hints,
    };
  }

  const fanout = await runJevEvidenceSufficiencyFanout({
    gatePhase: input.phase,
    evidenceState,
    jevConfig: input.jevConfig,
    decideFn: input.decideFn,
  });

  if (fanout.jev_skipped) {
    return { ok: true, slug: input.slug, jev_fail_open: true };
  }

  const threshold = applySufficiencyThresholds({
    answers: fanout.answers ?? {},
    tokenQuestionRequired: evidenceState.required_tokens.length > 0,
    stepSlug: input.slug,
  });
  if (!threshold.pass) {
    return {
      ok: false,
      slug: input.slug,
      reasons: threshold.reasons,
      remediation_hints: threshold.remediation_hints,
    };
  }

  return { ok: true, slug: input.slug };
}

// [IMPL-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [ARCH-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
export async function runChecklistEvidenceSufficiencyPreGate(input: {
  projectRoot: string;
  phase: GatePhase;
  tracker: unknown;
  citdp?: unknown;
  depthTier?: AdversarialDepth;
  requiredStepSlugs?: readonly string[];
  env?: NodeJS.ProcessEnv;
  jevConfig?: JevClientConfig;
  decideFn?: JevDecideFn;
}): Promise<ChecklistEvidenceSufficiencyPreGateResult> {
  const env = input.env ?? process.env;
  const config = resolveChecklistEvidenceSufficiencyConfig(input.projectRoot, env);
  if (!config.enabled) {
    return { ok: true, jev_fail_open_slugs: [] };
  }

  const slugs = derivePreGateTargetSlugs({
    citdp: input.citdp,
    depthTier: input.depthTier,
    phase: input.phase,
    requiredStepSlugs: input.requiredStepSlugs,
  });

  const failedSlugs: string[] = [];
  const allReasons: string[] = [];
  const allHints: string[] = [];
  const jevFailOpenSlugs: string[] = [];
  const jevObservations: Record<string, unknown> = {};

  for (const slug of slugs) {
    const result = await evaluatePreGateTargetSlug({
      featureEnabled: true,
      phase: input.phase,
      tracker: input.tracker,
      slug,
      jevConfig: input.jevConfig,
      decideFn: input.decideFn,
    });
    if (!result.ok) {
      failedSlugs.push(result.slug);
      allReasons.push(...result.reasons);
      allHints.push(...result.remediation_hints);
    } else if (result.jev_fail_open) {
      jevFailOpenSlugs.push(result.slug);
      jevObservations[result.slug] = { jev_fail_open: true };
    }
  }

  if (failedSlugs.length > 0) {
    return {
      ok: false,
      disposition: emitPreGateDisposition({
        phase: input.phase,
        failedSlugs,
        reasons: allReasons,
        remediation_hints: allHints,
        jev_observation: jevObservations,
      }),
    };
  }

  return { ok: true, jev_fail_open_slugs: jevFailOpenSlugs };
}
