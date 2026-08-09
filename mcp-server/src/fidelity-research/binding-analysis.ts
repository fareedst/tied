export interface BindingContract {
  trigger: string;
  channel: string;
  callee: string;
  arguments: string;
  effect: string;
  ordering: string;
  failureBehavior: string;
}

export interface BindingEvidence {
  triggerFired: boolean;
  channelUsed: boolean;
  calleeCalled: boolean;
  argumentsValid: boolean;
  effectObserved: boolean;
  orderingCorrect: boolean;
  failureCovered: boolean;
  uiFree: boolean;
}

export type BindingAnalysisResult =
  | {
      kind: "composition-evidence";
      proofBoundary: "UI-free binding evidence only; not unit behavior proof.";
    }
  | { kind: "binding-finding"; missing: string[] };

// [IMPL-TIED_FIDELITY_RESEARCH] [ARCH-TIED_FIDELITY_RESEARCH] [REQ-TIED_FIDELITY_RESEARCH]
// Separates binding/composition behavior from isolated unit behavior.
export function analyzeBindingEvidence(input: {
  binding: BindingContract;
  evidence: BindingEvidence;
}): BindingAnalysisResult {
  const missing = Object.entries(input.evidence)
    .filter(([, observed]) => !observed)
    .map(([field]) => field);

  if (missing.length > 0) {
    return { kind: "binding-finding", missing };
  }

  return {
    kind: "composition-evidence",
    proofBoundary: "UI-free binding evidence only; not unit behavior proof.",
  };
}
