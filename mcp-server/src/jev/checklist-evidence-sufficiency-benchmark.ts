/**
 * [IMPL-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [REQ-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY]
 * W3 labeled fixture replay and checklist-evidence-sufficiency-benchmark.v1 report builder.
 */

import crypto from "node:crypto";
import fs from "node:fs";
import type { GatePhase } from "../checklist-validator.js";
import {
  applySufficiencyThresholds,
  buildEvidenceSufficiencyQuestions,
  evaluatePreGateTargetSlug,
  extractGateEvidenceState,
  runDeterministicEvidencePrechecks,
  SUBSTANTIVE_NOUL_REJECT_BELOW,
  TOKEN_NOUL_REJECT_BELOW,
  COMPLETENESS_SCORE_REJECT_AT_OR_BELOW,
  type JevDecideFn,
} from "./checklist-evidence-sufficiency.js";
import type { JevClientConfig } from "./client.js";
import type { JevDecideResult, JevQuestions } from "./types.js";

export const BENCHMARK_SCHEMA = "checklist-evidence-sufficiency-benchmark.v1" as const;

export type EvidenceLabel = "substantive" | "superficial" | "borderline";

export type ExpectedDisposition =
  | "pass"
  | "reject_deterministic"
  | "reject_jev"
  | "fail_open_to_gate";

export type LabeledEvidenceFixtureRow = {
  id: string;
  label: EvidenceLabel;
  evidence: string;
  required_tokens?: string[];
  gate_phase?: GatePhase;
  step_slug?: string;
  expected_disposition: ExpectedDisposition;
  /** When true, row exists for redaction tests only (excluded from agreement numerator). */
  canary_secret?: boolean;
};

export type BenchmarkArmId =
  | "deterministic_only"
  | "jev_on"
  | "jev_off"
  | "shadow_compare";

export type PredictedOutcome =
  | "pre_gate_pass"
  | "reject_deterministic"
  | "reject_jev"
  | "fail_open_to_gate";

export type FixtureArmResult = {
  fixture_id: string;
  arm: BenchmarkArmId;
  predicted: PredictedOutcome;
  pre_gate_ok: boolean;
  jev_skipped?: boolean;
  jev_latency_ms?: number;
  elapsed_ms: number;
  /** Pre-gate must never assert authoritative gate allowed. */
  authority_gate_allowed_emitted: boolean;
  matches_expected: boolean;
  reasons: string[];
};

export type AgreementMetrics = {
  clear_substantive_superficial_count: number;
  jev_on_agreement_count: number;
  jev_on_agreement_rate: number | null;
  substantive_pass_recall: number | null;
  superficial_reject_precision: number | null;
};

export type ChecklistEvidenceSufficiencyBenchmarkReport = {
  schema: typeof BENCHMARK_SCHEMA;
  meta: {
    fixture_hash: string;
    fixture_path: string;
    git_rev: string;
    JEV_MODEL: string;
    thresholds: {
      substantive_noul_below: number;
      completeness_score_at_or_below: number;
      token_noul_below: number;
    };
    mode: "mocked" | "live";
    timestamp: string;
    fixture_count: number;
    arms: BenchmarkArmId[];
  };
  agreement: AgreementMetrics;
  authority_invariant_ok: boolean;
  arms: Record<
    BenchmarkArmId,
    {
      per_fixture: FixtureArmResult[];
      aggregate: {
        mean_elapsed_ms: number;
        jev_call_count: number;
        jev_skip_count: number;
        expected_match_rate: number;
      };
    }
  >;
  shadow_compare?: {
    per_fixture: Array<{
      fixture_id: string;
      would_block_jev_on: boolean;
      jev_off_passes: boolean;
    }>;
  };
};

const CANARY_PATTERN = /\bjv_live_[a-zA-Z0-9_]+/;

export function loadLabeledEvidenceFixtures(jsonl: string): LabeledEvidenceFixtureRow[] {
  const rows: LabeledEvidenceFixtureRow[] = [];
  for (const line of jsonl.trim().split("\n")) {
    if (!line.trim()) continue;
    const parsed = JSON.parse(line) as LabeledEvidenceFixtureRow;
    if (!parsed.id || !parsed.label || typeof parsed.evidence !== "string") {
      throw new Error(`invalid fixture row: ${line.slice(0, 80)}`);
    }
    if (!parsed.expected_disposition) {
      throw new Error(`fixture ${parsed.id} missing expected_disposition`);
    }
    rows.push(parsed);
  }
  return rows;
}

export function loadLabeledEvidenceFixturesFromFile(fixturePath: string): LabeledEvidenceFixtureRow[] {
  return loadLabeledEvidenceFixtures(fs.readFileSync(fixturePath, "utf8"));
}

function buildTrackerFromFixture(row: LabeledEvidenceFixtureRow): unknown {
  const slug = row.step_slug ?? "traceable-commit";
  const step: Record<string, unknown> = {
    slug,
    disposition: "completed",
    title: `Fixture step ${slug}`,
    evidence_refs: [row.evidence],
  };
  if (row.required_tokens?.length) {
    step.required_tokens = row.required_tokens;
  }
  return { steps: [step] };
}

function mapEvaluationToPredicted(input: {
  ok: boolean;
  jev_fail_open?: boolean;
  reasons?: string[];
  arm: BenchmarkArmId;
}): PredictedOutcome {
  if (input.ok && input.jev_fail_open) return "fail_open_to_gate";
  if (input.ok) return "pre_gate_pass";
  const reasons = input.reasons ?? [];
  const tier1 = reasons.some(
    (r) =>
      r.startsWith("empty_evidence") ||
      r.startsWith("missing_required_token:"),
  );
  if (tier1 || input.arm === "deterministic_only") {
    return "reject_deterministic";
  }
  return "reject_jev";
}

function expectedMatchesPredicted(
  expected: ExpectedDisposition,
  predicted: PredictedOutcome,
): boolean {
  if (expected === "pass") return predicted === "pre_gate_pass";
  if (expected === "reject_deterministic") return predicted === "reject_deterministic";
  if (expected === "reject_jev") return predicted === "reject_jev";
  if (expected === "fail_open_to_gate") return predicted === "fail_open_to_gate";
  return false;
}

function mockAnswersForLabel(
  label: EvidenceLabel,
  tokenRequired: boolean,
): { substantive: number; score: number; token: number } {
  switch (label) {
    case "substantive":
      return { substantive: 0.92, score: 5, token: 0.95 };
    case "superficial":
      return { substantive: 0.15, score: 1, token: 0.1 };
    case "borderline":
      return { substantive: 0.62, score: 3, token: 0.55 };
    default:
      return { substantive: 0.5, score: 3, token: 0.5 };
  }
}

export function createLabelMockDecideFn(label: EvidenceLabel): JevDecideFn {
  return async (_state, questions: JevQuestions): Promise<JevDecideResult> => {
    const tokenRequired = "noul_tokens_present" in questions;
    const mock = mockAnswersForLabel(label, tokenRequired);
    return {
      ok: true,
      response: {
        model: "mock-jev",
        answers: {
          noul_evidence_substantive: { type: "noul", noul: mock.substantive },
          score_evidence_completeness: {
            type: "score",
            score: mock.score,
            confidence: 0.9,
            probabilities: {},
          },
          ...(tokenRequired
            ? { noul_tokens_present: { type: "noul", noul: mock.token } }
            : {}),
        },
        usage: { input_tokens: 100, cost_usd: 0 },
      },
    };
  };
}

const skipDecideFn: JevDecideFn = async () => ({
  ok: false,
  skipped: true,
  reason: "no_credentials",
});

export async function evaluateFixtureArm(input: {
  row: LabeledEvidenceFixtureRow;
  arm: BenchmarkArmId;
  decideFn?: JevDecideFn;
  jevConfig?: JevClientConfig;
}): Promise<FixtureArmResult> {
  const { row, arm } = input;
  const phase = row.gate_phase ?? "verification";
  const slug = row.step_slug ?? "traceable-commit";
  const tracker = buildTrackerFromFixture(row);
  const t0 = performance.now();

  if (arm === "deterministic_only") {
    const state = extractGateEvidenceState({ tracker, slug });
    if (!state) {
      const elapsed_ms = performance.now() - t0;
      return {
        fixture_id: row.id,
        arm,
        predicted: "pre_gate_pass",
        pre_gate_ok: true,
        elapsed_ms,
        authority_gate_allowed_emitted: false,
        matches_expected: expectedMatchesPredicted(row.expected_disposition, "pre_gate_pass"),
        reasons: [],
      };
    }
    const tier1 = runDeterministicEvidencePrechecks({
      featureEnabled: true,
      evidenceExcerpt: state.evidence_excerpt,
      requiredTokens: state.required_tokens,
    });
    const elapsed_ms = performance.now() - t0;
    const predicted: PredictedOutcome = tier1.ok ? "pre_gate_pass" : "reject_deterministic";
    return {
      fixture_id: row.id,
      arm,
      predicted,
      pre_gate_ok: tier1.ok,
      elapsed_ms,
      authority_gate_allowed_emitted: false,
      matches_expected: expectedMatchesPredicted(row.expected_disposition, predicted),
      reasons: tier1.reasons,
    };
  }

  if (arm === "shadow_compare") {
    const jevOn = await evaluateFixtureArm({
      row,
      arm: "jev_on",
      decideFn: input.decideFn ?? createLabelMockDecideFn(row.label),
      jevConfig: input.jevConfig,
    });
    const jevOff = await evaluateFixtureArm({
      row,
      arm: "jev_off",
      decideFn: skipDecideFn,
    });
    const elapsed_ms = performance.now() - t0;
    return {
      fixture_id: row.id,
      arm,
      predicted: jevOn.predicted,
      pre_gate_ok: jevOn.pre_gate_ok,
      elapsed_ms,
      authority_gate_allowed_emitted: false,
      matches_expected: jevOn.matches_expected,
      reasons: [`shadow:would_block_jev_on=${!jevOn.pre_gate_ok}`, `jev_off_pass=${jevOff.pre_gate_ok}`],
    };
  }

  const decideFn =
    arm === "jev_off"
      ? skipDecideFn
      : (input.decideFn ?? createLabelMockDecideFn(row.label));

  const evalResult = await evaluatePreGateTargetSlug({
    featureEnabled: true,
    phase,
    tracker,
    slug,
    jevConfig: input.jevConfig,
    decideFn,
  });

  const elapsed_ms = performance.now() - t0;
  const predicted = mapEvaluationToPredicted({
    ok: evalResult.ok,
    jev_fail_open: evalResult.ok ? evalResult.jev_fail_open : undefined,
    reasons: !evalResult.ok ? evalResult.reasons : [],
    arm,
  });

  return {
    fixture_id: row.id,
    arm,
    predicted,
    pre_gate_ok: evalResult.ok,
    jev_skipped: evalResult.ok ? evalResult.jev_fail_open : undefined,
    elapsed_ms,
    authority_gate_allowed_emitted: false,
    matches_expected: expectedMatchesPredicted(row.expected_disposition, predicted),
    reasons: !evalResult.ok ? evalResult.reasons : [],
  };
}

function computeAgreement(
  fixtures: LabeledEvidenceFixtureRow[],
  jevOnResults: FixtureArmResult[],
): AgreementMetrics {
  const byId = new Map(jevOnResults.map((r) => [r.fixture_id, r]));
  const clear = fixtures.filter(
    (f) =>
      !f.canary_secret &&
      (f.label === "substantive" || f.label === "superficial"),
  );
  let agreement = 0;
  let substantiveTotal = 0;
  let substantivePass = 0;
  let superficialTotal = 0;
  let superficialReject = 0;

  for (const row of clear) {
    const result = byId.get(row.id);
    if (!result) continue;
    if (result.matches_expected) agreement += 1;
    if (row.label === "substantive") {
      substantiveTotal += 1;
      if (result.predicted === "pre_gate_pass") substantivePass += 1;
    }
    if (row.label === "superficial") {
      superficialTotal += 1;
      if (result.predicted === "reject_jev" || result.predicted === "reject_deterministic") {
        superficialReject += 1;
      }
    }
  }

  const n = clear.length;
  return {
    clear_substantive_superficial_count: n,
    jev_on_agreement_count: agreement,
    jev_on_agreement_rate: n > 0 ? agreement / n : null,
    substantive_pass_recall:
      substantiveTotal > 0 ? substantivePass / substantiveTotal : null,
    superficial_reject_precision:
      superficialTotal > 0 ? superficialReject / superficialTotal : null,
  };
}

export async function runChecklistEvidenceSufficiencyBenchmark(input: {
  fixtures: LabeledEvidenceFixtureRow[];
  fixturePath: string;
  fixtureBody: string;
  gitRev: string;
  mode: "mocked" | "live";
  arms?: BenchmarkArmId[];
  liveDecideFn?: JevDecideFn;
  jevConfig?: JevClientConfig;
}): Promise<ChecklistEvidenceSufficiencyBenchmarkReport> {
  const arms: BenchmarkArmId[] = input.arms ?? [
    "deterministic_only",
    "jev_on",
    "jev_off",
    "shadow_compare",
  ];
  const fixture_hash = crypto.createHash("sha256").update(input.fixtureBody).digest("hex");

  const reportArms = {} as ChecklistEvidenceSufficiencyBenchmarkReport["arms"];
  let authorityOk = true;
  const shadowRows: NonNullable<ChecklistEvidenceSufficiencyBenchmarkReport["shadow_compare"]>["per_fixture"] =
    [];

  for (const arm of arms) {
    const per_fixture: FixtureArmResult[] = [];
    let jevCalls = 0;
    let jevSkips = 0;
    for (const row of input.fixtures) {
      const decideFn =
        input.mode === "live" && input.liveDecideFn
          ? input.liveDecideFn
          : createLabelMockDecideFn(row.label);
      const result = await evaluateFixtureArm({
        row,
        arm: arm === "shadow_compare" ? "shadow_compare" : arm,
        decideFn: arm === "jev_on" && input.mode === "live" ? input.liveDecideFn : decideFn,
        jevConfig: input.jevConfig,
      });
      if (result.authority_gate_allowed_emitted) authorityOk = false;
      if (arm === "jev_on" && !result.jev_skipped) jevCalls += 1;
      if (arm === "jev_off" && result.jev_skipped) jevSkips += 1;
      if (arm === "shadow_compare") {
        const wouldBlock = result.reasons.some((r) => r.startsWith("shadow:would_block_jev_on=true"));
        const jevOffPass = result.reasons.some((r) => r.endsWith("jev_off_pass=true"));
        shadowRows.push({
          fixture_id: row.id,
          would_block_jev_on: wouldBlock,
          jev_off_passes: jevOffPass,
        });
      }
      per_fixture.push(result);
    }
    const matchCount = per_fixture.filter((r) => r.matches_expected).length;
    reportArms[arm] = {
      per_fixture,
      aggregate: {
        mean_elapsed_ms:
          per_fixture.reduce((a, r) => a + r.elapsed_ms, 0) / (per_fixture.length || 1),
        jev_call_count: jevCalls,
        jev_skip_count: jevSkips,
        expected_match_rate: per_fixture.length ? matchCount / per_fixture.length : 0,
      },
    };
  }

  const jevOn = reportArms.jev_on?.per_fixture ?? [];
  const agreement = computeAgreement(input.fixtures, jevOn);

  return {
    schema: BENCHMARK_SCHEMA,
    meta: {
      fixture_hash,
      fixture_path: input.fixturePath,
      git_rev: input.gitRev,
      JEV_MODEL: process.env.JEV_MODEL ?? "jev-1.13.0",
      thresholds: {
        substantive_noul_below: SUBSTANTIVE_NOUL_REJECT_BELOW,
        completeness_score_at_or_below: COMPLETENESS_SCORE_REJECT_AT_OR_BELOW,
        token_noul_below: TOKEN_NOUL_REJECT_BELOW,
      },
      mode: input.mode,
      timestamp: new Date().toISOString(),
      fixture_count: input.fixtures.length,
      arms,
    },
    agreement,
    authority_invariant_ok: authorityOk,
    arms: reportArms,
    ...(arms.includes("shadow_compare") ? { shadow_compare: { per_fixture: shadowRows } } : {}),
  };
}

/** Returns true when fixture row is a canary-secret probe (must not commit real secrets). */
export function isCanarySecretFixture(row: LabeledEvidenceFixtureRow): boolean {
  return Boolean(row.canary_secret && CANARY_PATTERN.test(row.evidence));
}

/** Exported for contract tests — validates fixture row shape without running Jev. */
export function validateFixtureRowShape(row: unknown): row is LabeledEvidenceFixtureRow {
  if (typeof row !== "object" || row === null) return false;
  const r = row as LabeledEvidenceFixtureRow;
  const labels: EvidenceLabel[] = ["substantive", "superficial", "borderline"];
  const dispositions: ExpectedDisposition[] = [
    "pass",
    "reject_deterministic",
    "reject_jev",
    "fail_open_to_gate",
  ];
  return (
    typeof r.id === "string"
    && labels.includes(r.label)
    && typeof r.evidence === "string"
    && dispositions.includes(r.expected_disposition)
  );
}

/** Tier-1 + threshold smoke for benchmark contract tests (no async Jev). */
export function deterministicDispositionFromExcerpt(input: {
  evidence: string;
  required_tokens?: string[];
}): PredictedOutcome {
  const tier1 = runDeterministicEvidencePrechecks({
    featureEnabled: true,
    evidenceExcerpt: input.evidence,
    requiredTokens: input.required_tokens,
  });
  if (!tier1.ok) return "reject_deterministic";
  const threshold = applySufficiencyThresholds({
    answers: { substantive_noul: 0.9, completeness_score: 5 },
    tokenQuestionRequired: (input.required_tokens?.length ?? 0) > 0,
    stepSlug: "fixture",
  });
  return threshold.pass ? "pre_gate_pass" : "reject_jev";
}

export function buildEvidenceSufficiencyQuestionsForFixture(
  required_tokens?: string[],
): JevQuestions {
  return buildEvidenceSufficiencyQuestions((required_tokens?.length ?? 0) > 0);
}
