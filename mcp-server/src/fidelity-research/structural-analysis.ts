export interface StructuralAnalysisInput {
  snapshotId: string;
  tokens: readonly string[];
  validators: {
    tiedConsistency: (tokens: readonly string[]) => { ok: boolean };
    pseudocode: (token: string) => { ok: boolean };
    traceability: () => { ok: boolean };
    cycles: () => { ok: boolean };
    bindingInventory: () => { ok: boolean };
    testAdequacy: () => { ok: boolean };
  };
}

export interface StructuralEvidence {
  validator:
    | "tied_validate_consistency"
    | "pseudocode_validate"
    | "traceability_gap_report"
    | "tied_cycles"
    | "binding_inventory_validate"
    | "test_adequacy_validate";
  ok: boolean;
  snapshotId: string;
  proofBoundary: string;
}

export interface StructuralAnalysisResult {
  evidence: StructuralEvidence[];
  proofBoundary: string;
}

// [IMPL-TIED_FIDELITY_RESEARCH] [ARCH-TIED_FIDELITY_RESEARCH] [REQ-TIED_FIDELITY_RESEARCH]
// Runs structural validators while explicitly limiting their proof claim.
export function runStructuralAnalysis(
  input: StructuralAnalysisInput,
): StructuralAnalysisResult {
  const proofBoundary =
    "Structural artifact consistency only; not runtime correctness.";
  const evidence: StructuralEvidence[] = [];
  const consistency = input.validators.tiedConsistency(input.tokens);
  evidence.push({
    validator: "tied_validate_consistency",
    ok: consistency.ok,
    snapshotId: input.snapshotId,
    proofBoundary,
  });

  for (const token of input.tokens) {
    const pseudocode = input.validators.pseudocode(token);
    evidence.push({
      validator: "pseudocode_validate",
      ok: pseudocode.ok,
      snapshotId: input.snapshotId,
      proofBoundary,
    });
  }

  const additionalValidators: Array<
    ["traceability_gap_report" | "tied_cycles" | "binding_inventory_validate" | "test_adequacy_validate", () => { ok: boolean }]
  > = [
    ["traceability_gap_report", input.validators.traceability],
    ["tied_cycles", input.validators.cycles],
    ["binding_inventory_validate", input.validators.bindingInventory],
    ["test_adequacy_validate", input.validators.testAdequacy],
  ];
  for (const [validator, run] of additionalValidators) {
    const result = run();
    evidence.push({ validator, ok: result.ok, snapshotId: input.snapshotId, proofBoundary });
  }

  return { evidence, proofBoundary };
}
