export interface SpecificationRevision {
  approved: boolean;
  behavior: string;
}

export interface SpecificationStateInput {
  prior: SpecificationRevision;
  current: SpecificationRevision;
  observedBehavior: string;
}

export type SpecificationStateClassification =
  | "SpecificationChange"
  | "ImplementationLag"
  | "MissingSpecification"
  | "PartialApplication"
  | "Unresolved";

export interface SpecificationStateResult {
  classification: SpecificationStateClassification;
  currentBehavior?: string;
  desiredBehavior?: string;
}

// [IMPL-TIED_FIDELITY_RESEARCH] [ARCH-TIED_FIDELITY_RESEARCH] [REQ-TIED_FIDELITY_RESEARCH]
// Establishes approved prior/current behavior before classifying evidence as a defect.
export function analyzeSpecificationState(
  input: SpecificationStateInput,
): SpecificationStateResult {
  if (!input.prior.approved || !input.current.approved) {
    return { classification: "Unresolved" };
  }

  if (input.prior.behavior === input.current.behavior) {
    if (input.observedBehavior === input.current.behavior) {
      return {
        classification: "SpecificationChange",
        currentBehavior: input.observedBehavior,
        desiredBehavior: input.current.behavior,
      };
    }
    return { classification: "MissingSpecification" };
  }

  if (input.observedBehavior === input.current.behavior) {
    return {
      classification: "SpecificationChange",
      currentBehavior: input.observedBehavior,
      desiredBehavior: input.current.behavior,
    };
  }

  if (input.observedBehavior === input.prior.behavior) {
    return {
      classification: "ImplementationLag",
      currentBehavior: input.observedBehavior,
      desiredBehavior: input.current.behavior,
    };
  }

  return {
    classification: "PartialApplication",
    currentBehavior: input.observedBehavior,
    desiredBehavior: input.current.behavior,
  };
}
