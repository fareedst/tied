/**
 * [IMPL-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_JEV_DECISION_COPROCESSOR]
 * W4 pilot — Jev fan-out nouls for criterion triage; observations only (no finding-ledger writes).
 */

import type { JevClientConfig } from "./client.js";
import { jevDecide } from "./client.js";
import type { JevQuestions } from "./types.js";

export const TRIAGE_NOUL_KEYS = [
  "criterion_met",
  "spec_gap",
  "test_supports_claim",
  "implementation_drift",
] as const;

export type TriageNoulKey = (typeof TRIAGE_NOUL_KEYS)[number];

export type AdversarialTriageLabels = Record<TriageNoulKey, boolean>;

export type AdversarialTriageCase = {
  id: string;
  criterion_text: string;
  pseudocode_excerpt: string;
  test_excerpt?: string;
  labels?: AdversarialTriageLabels;
};

export type AdversarialTriageClass =
  | "aligned"
  | "spec_gap"
  | "test_gap"
  | "drift"
  | "unknown";

export type AdversarialTriageObservation = {
  case_id: string;
  nouls: Partial<Record<TriageNoulKey, number>>;
  triage_class: AdversarialTriageClass;
  jev_skipped: boolean;
  jev_skip_reason?: string;
  matches_labels: boolean | null;
  label_mismatches: TriageNoulKey[];
};

export type AdversarialTriagePilotReport = {
  schema: "adversarial-triage-pilot.v1";
  jev_invoked: boolean;
  cases: AdversarialTriageObservation[];
  agreement_rate: number | null;
  note: string;
};

const THRESHOLD = 0.55;

export function buildAdversarialTriageQuestions(): JevQuestions {
  return {
    criterion_met: {
      type: "noul",
      instructions:
        "Does the pseudocode excerpt implement the requirement stated in criterion_text?",
    },
    spec_gap: {
      type: "noul",
      instructions:
        "Is there a specification gap — criterion requires behavior not reflected in pseudocode?",
    },
    test_supports_claim: {
      type: "noul",
      instructions:
        "Does the test excerpt (if any) substantiate the criterion relative to pseudocode?",
      criteria: {
        true: "Test clearly exercises the criterion behavior",
        false: "Test missing, unrelated, or does not exercise the criterion",
      },
    },
    implementation_drift: {
      type: "noul",
      instructions:
        "Does pseudocode appear to drift from criterion intent (wrong behavior)?",
    },
  };
}

export function buildTriageState(caseInput: AdversarialTriageCase): Record<string, string> {
  return {
    criterion_text: caseInput.criterion_text.slice(0, 1500),
    pseudocode_excerpt: caseInput.pseudocode_excerpt.slice(0, 1500),
    test_excerpt: (caseInput.test_excerpt ?? "not provided").slice(0, 1500),
  };
}

export function noulsFromAnswers(
  answers: Record<string, { type: string; noul?: number }>,
): Partial<Record<TriageNoulKey, number>> {
  const out: Partial<Record<TriageNoulKey, number>> = {};
  for (const key of TRIAGE_NOUL_KEYS) {
    const ans = answers[key];
    if (ans?.type === "noul" && typeof ans.noul === "number") {
      out[key] = ans.noul;
    }
  }
  return out;
}

export function classifyTriage(nouls: Partial<Record<TriageNoulKey, number>>): AdversarialTriageClass {
  const met = nouls.criterion_met ?? 0;
  const specGap = nouls.spec_gap ?? 0;
  const testSupports = nouls.test_supports_claim ?? 0;
  const drift = nouls.implementation_drift ?? 0;

  if (specGap >= THRESHOLD || met < 0.45) return "spec_gap";
  if (drift >= THRESHOLD) return "drift";
  if (met >= THRESHOLD && testSupports < THRESHOLD) return "test_gap";
  if (met >= THRESHOLD && testSupports >= THRESHOLD) return "aligned";
  return "unknown";
}

export function compareObservationToLabels(
  nouls: Partial<Record<TriageNoulKey, number>>,
  labels: AdversarialTriageLabels,
): { matches: boolean; mismatches: TriageNoulKey[] } {
  const mismatches: TriageNoulKey[] = [];
  for (const key of TRIAGE_NOUL_KEYS) {
    const value = nouls[key];
    if (value === undefined) {
      mismatches.push(key);
      continue;
    }
    const predicted = value >= THRESHOLD;
    if (predicted !== labels[key]) mismatches.push(key);
  }
  return { matches: mismatches.length === 0, mismatches };
}

export async function observeAdversarialTriageCase(
  caseInput: AdversarialTriageCase,
  config: JevClientConfig = {},
): Promise<AdversarialTriageObservation> {
  const decideResult = await jevDecide(
    buildTriageState(caseInput),
    buildAdversarialTriageQuestions(),
    config,
  );

  if (!decideResult.ok) {
    return {
      case_id: caseInput.id,
      nouls: {},
      triage_class: "unknown",
      jev_skipped: decideResult.skipped,
      jev_skip_reason: decideResult.skipped ? decideResult.reason : decideResult.error,
      matches_labels: null,
      label_mismatches: [],
    };
  }

  const nouls = noulsFromAnswers(
    decideResult.response.answers as Record<string, { type: string; noul?: number }>,
  );
  const triage_class = classifyTriage(nouls);
  let matches_labels: boolean | null = null;
  let label_mismatches: TriageNoulKey[] = [];
  if (caseInput.labels) {
    const cmp = compareObservationToLabels(nouls, caseInput.labels);
    matches_labels = cmp.matches;
    label_mismatches = cmp.mismatches;
  }

  return {
    case_id: caseInput.id,
    nouls,
    triage_class,
    jev_skipped: false,
    matches_labels,
    label_mismatches,
  };
}

export async function runAdversarialTriagePilot(
  cases: AdversarialTriageCase[],
  config: JevClientConfig = {},
): Promise<AdversarialTriagePilotReport> {
  const observations: AdversarialTriageObservation[] = [];
  let jev_invoked = false;
  for (const c of cases) {
    const obs = await observeAdversarialTriageCase(c, config);
    if (!obs.jev_skipped && Object.keys(obs.nouls).length > 0) jev_invoked = true;
    observations.push(obs);
  }

  const labeled = observations.filter((o) => o.matches_labels !== null);
  const correct = labeled.filter((o) => o.matches_labels === true);
  const agreement_rate =
    labeled.length === 0 ? null : correct.length / labeled.length;

  return {
    schema: "adversarial-triage-pilot.v1",
    jev_invoked,
    cases: observations,
    agreement_rate,
    note: jev_invoked
      ? "Live Jev nouls compared to labeled fixture; not a substitute for tied_adversarial_inquiry_run."
      : "Jev skipped; observations empty — run with JEV_API_KEY and --live for labeled agreement.",
  };
}

export function loadLabeledTriageFixture(json: {
  cases: AdversarialTriageCase[];
}): AdversarialTriageCase[] {
  return json.cases;
}
