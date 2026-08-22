import { createHash } from "node:crypto";
import type { FidelityVerdict, ProofBoundary } from "./types.js";

export type FindingObservation = {
  obligationId: string;
  blockRevision: string;
  dimension: "traceability_structure" | "semantic_fidelity" | "executable_behavior";
  statementId?: string;
  message: string;
  evidenceRefs: string[];
  proofBoundary: ProofBoundary;
};

export type FindingRecord = FindingObservation & {
  id: string;
  lifecycle: "observed";
};

export type FindingLedger = {
  findings: FindingRecord[];
  duplicateLinks: [string, string][];
};

export type AppendFindingResult = {
  finding: FindingRecord;
  created: boolean;
};

function findingId(input: FindingObservation): string {
  return createHash("sha256")
    .update([
      input.obligationId,
      input.blockRevision,
      input.dimension,
      input.statementId ?? "",
      input.message,
    ].join("\0"), "utf8")
    .digest("hex")
    .slice(0, 16);
}

// [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
// How: append observed findings without overwriting pre-remediation evidence or inflating duplicate reruns.
export function appendFinding(
  ledger: FindingLedger,
  input: FindingObservation,
): AppendFindingResult {
  const id = findingId(input);
  const existing = ledger.findings.find((finding) => finding.id === id);
  if (existing) {
    ledger.duplicateLinks.push([id, existing.id]);
    return { finding: { ...existing, evidenceRefs: [...existing.evidenceRefs] }, created: false };
  }
  const finding: FindingRecord = {
    ...input,
    id,
    lifecycle: "observed",
    evidenceRefs: [...input.evidenceRefs],
  };
  ledger.findings.push(finding);
  return { finding: { ...finding, evidenceRefs: [...finding.evidenceRefs] }, created: true };
}

export type StrictEligibilityInput = {
  scope: string[];
  blockingDetectors: string[];
  negativeControls: string[];
  boundedExecution: boolean;
  explicitProofBoundaries: boolean;
  falsePositiveHandling: boolean;
  waiversOwned: boolean;
  representativePilot: boolean;
};

export type EligibilityDiagnostic = {
  code:
    | "missing_negative_control"
    | "unbounded_execution"
    | "missing_scope"
    | "missing_proof_boundary"
    | "missing_false_positive_handling"
    | "missing_waiver_owner"
    | "insufficient_pilot";
  message: string;
};

export type StrictEligibilityResult = {
  eligible: boolean;
  diagnostics: EligibilityDiagnostic[];
  proofBoundary: "human_decision";
};

// [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
// How: gate strict blocking on complete controls, deterministic scope, and representative pilot evidence.
export function validateStrictEligibility(
  input: StrictEligibilityInput,
): StrictEligibilityResult {
  const diagnostics: EligibilityDiagnostic[] = [];
  const controls = new Set(input.negativeControls);
  const missingControls = input.blockingDetectors.filter((detector) => !controls.has(detector));
  if (missingControls.length > 0) {
    diagnostics.push({
      code: "missing_negative_control",
      message: `Missing negative controls: ${missingControls.join(", ")}.`,
    });
  }
  if (input.scope.length === 0) {
    diagnostics.push({ code: "missing_scope", message: "Strict eligibility requires a non-empty scope." });
  }
  if (!input.boundedExecution) {
    diagnostics.push({ code: "unbounded_execution", message: "Execution must be deterministic or bounded." });
  }
  if (!input.explicitProofBoundaries) {
    diagnostics.push({ code: "missing_proof_boundary", message: "Every blocking detector needs a proof boundary." });
  }
  if (!input.falsePositiveHandling) {
    diagnostics.push({ code: "missing_false_positive_handling", message: "False-positive handling must be documented." });
  }
  if (!input.waiversOwned) {
    diagnostics.push({ code: "missing_waiver_owner", message: "Waivers need an owner and expiry." });
  }
  if (!input.representativePilot) {
    diagnostics.push({ code: "insufficient_pilot", message: "Representative pilot evidence is required." });
  }
  return {
    eligible: diagnostics.length === 0,
    diagnostics,
    proofBoundary: "human_decision",
  };
}

export type ScopedStatus = "PASS" | "REVIEW" | "UNRESOLVED" | "INELIGIBLE";

export type ScopedStatusInput = {
  scope: readonly string[];
  obligations: readonly { id: string; verdict: FidelityVerdict }[];
  eligibility: StrictEligibilityResult;
};

// [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
// How: project status only for the declared scope and never demote unrelated obligations.
export function projectScopedStatus(input: ScopedStatusInput): Record<string, ScopedStatus> {
  const scope = new Set(input.scope);
  return Object.fromEntries(
    input.obligations
      .filter((obligation) => scope.has(obligation.id))
      .sort((left, right) => left.id.localeCompare(right.id))
      .map((obligation) => [
        obligation.id,
        input.eligibility.eligible
          ? verdictStatus(obligation.verdict)
          : "INELIGIBLE",
      ]),
  );
}

function verdictStatus(verdict: FidelityVerdict): ScopedStatus {
  if (verdict === "PASS") return "PASS";
  if (verdict === "UNRESOLVED") return "UNRESOLVED";
  return "REVIEW";
}
