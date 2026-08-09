export interface FirstSliceAdapters {
  resolveManifest: (input: unknown) => unknown;
  snapshotChange: (input: unknown) => unknown;
  analyzeSpecificationState: (input: unknown) => unknown;
  runStructuralAnalysis: (input: unknown) => unknown;
  auditImplFidelity: (input: unknown) => unknown;
  analyzeBindingEvidence: (input: unknown) => unknown;
  appendCandidateFinding: (ledger: unknown, input: unknown) => unknown;
  promoteConfirmedCase: (input: unknown) => unknown;
  verifyDeterministicRerun: (input: unknown) => unknown;
}

export interface FirstSliceInput {
  manifestInput: unknown;
  change: unknown;
  scope: readonly string[];
  adapters: FirstSliceAdapters;
}

export type FirstSliceResult =
  | {
      ok: true;
      stages: Record<string, unknown>;
    }
  | {
      ok: false;
      stage: string;
      error: unknown;
    };

function failed(value: unknown): value is { ok: false; error: unknown } {
  return (
    typeof value === "object" &&
    value !== null &&
    "ok" in value &&
    value.ok === false &&
    "error" in value
  );
}

// [IMPL-TIED_FIDELITY_RESEARCH] [ARCH-TIED_FIDELITY_RESEARCH] [REQ-TIED_FIDELITY_RESEARCH]
// Orchestrates validated research modules through one read-only composition seam.
export function runFirstSlice(input: FirstSliceInput): FirstSliceResult {
  const stages: Record<string, unknown> = {};
  const manifest = input.adapters.resolveManifest(input.manifestInput);
  if (failed(manifest)) return { ok: false, stage: "manifest", error: manifest.error };
  stages.manifest = manifest;

  const snapshot = input.adapters.snapshotChange({
    manifest,
    change: input.change,
  });
  if (failed(snapshot)) return { ok: false, stage: "snapshot", error: snapshot.error };
  stages.snapshot = snapshot;

  const specification = input.adapters.analyzeSpecificationState({
    change: input.change,
    snapshot,
  });
  if (failed(specification)) {
    return { ok: false, stage: "specification", error: specification.error };
  }
  stages.specification = specification;

  const structural = input.adapters.runStructuralAnalysis({
    manifest,
    snapshot,
    tokens: input.scope,
  });
  if (failed(structural)) {
    return { ok: false, stage: "structural", error: structural.error };
  }
  stages.structural = structural;

  const fidelity = input.adapters.auditImplFidelity({
    snapshot,
    scope: input.scope,
    structural,
  });
  if (failed(fidelity)) {
    return { ok: false, stage: "fidelity", error: fidelity.error };
  }
  stages.fidelity = fidelity;

  const binding = input.adapters.analyzeBindingEvidence({
    snapshot,
    structural,
    fidelity,
  });
  if (failed(binding)) {
    return { ok: false, stage: "binding", error: binding.error };
  }
  stages.binding = binding;

  const ledger = { findings: [], duplicateLinks: [] };
  const finding = input.adapters.appendCandidateFinding(ledger, {
    manifest,
    change: input.change,
    scope: input.scope,
    specification,
    structural,
    fidelity,
    binding,
  });
  if (failed(finding)) {
    return { ok: false, stage: "finding", error: finding.error };
  }
  stages.finding = finding;

  const promotion = input.adapters.promoteConfirmedCase({
    finding,
    specification,
    evidence: { structural, fidelity, binding },
  });
  if (failed(promotion)) {
    return { ok: false, stage: "promotion", error: promotion.error };
  }
  stages.promotion = promotion;

  const rerun = input.adapters.verifyDeterministicRerun({
    snapshot,
    configuration: input.scope,
    ledger,
  });
  if (failed(rerun)) {
    return { ok: false, stage: "rerun", error: rerun.error };
  }
  stages.rerun = rerun;

  return { ok: true, stages };
}
