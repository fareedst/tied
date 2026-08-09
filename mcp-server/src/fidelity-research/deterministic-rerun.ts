export interface DeterministicRerunInput {
  snapshotHash: string;
  configurationHash: string;
  previousFindingIds: readonly string[];
  rerunFindingIds: readonly string[];
}

export interface DeterministicRerunResult {
  deterministic: boolean;
  duplicateLinks: Array<{ originalId: string; duplicateId: string }>;
  defectCountDelta: number;
}

// [IMPL-TIED_FIDELITY_RESEARCH] [ARCH-TIED_FIDELITY_RESEARCH] [REQ-TIED_FIDELITY_RESEARCH]
// Verifies reproducibility and duplicate linking for the same revisioned input.
export function verifyDeterministicRerun(
  input: DeterministicRerunInput,
): DeterministicRerunResult {
  const sameInputs =
    input.snapshotHash.length > 0 &&
    input.configurationHash.length > 0 &&
    input.previousFindingIds.length === input.rerunFindingIds.length;
  const sameFindings =
    sameInputs &&
    input.previousFindingIds.every(
      (findingId, index) => findingId === input.rerunFindingIds[index],
    );

  if (!sameFindings) {
    return { deterministic: false, duplicateLinks: [], defectCountDelta: 0 };
  }

  return {
    deterministic: true,
    duplicateLinks: input.previousFindingIds.map((findingId) => ({
      originalId: findingId,
      duplicateId: findingId,
    })),
    defectCountDelta: 0,
  };
}
