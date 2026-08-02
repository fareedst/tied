/**
 * [IMPL-QUALITY_EVIDENCE_COMMAND_RUNNER] [IMPL-QUALITY_EVIDENCE_MANIFEST] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
 * Summary: Connect declared command execution to deterministic verification manifest generation.
 */

import {
  buildVerificationEvidenceManifest,
  type VerificationEvidenceInput,
  type VerificationEvidenceManifest,
} from "./quality-evidence.js";
import {
  runDeclaredQualityCommands,
  type QualityCommandDeclaration,
} from "./quality-command-runner.js";

export type QualityEvidenceCollectionInput = Omit<VerificationEvidenceInput, "command_results"> & {
  commands: QualityCommandDeclaration[];
  default_timeout_ms?: number;
  default_max_output_bytes?: number;
};

// [IMPL-QUALITY_EVIDENCE_COLLECTION] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
// How: Validate non-empty declarations, run metadata, quality rows, proof boundaries, limits, and artifact policy.
function validateCollectionInput(input: QualityEvidenceCollectionInput): void {
  if (
    typeof input.run_id !== "string" ||
    !input.run_id.trim() ||
    typeof input.commit !== "string" ||
    !input.commit.trim() ||
    !input.environment ||
    typeof input.environment !== "object" ||
    Array.isArray(input.environment) ||
    !Array.isArray(input.commands) ||
    input.commands.length === 0 ||
    !Array.isArray(input.quality_rows) ||
    !Array.isArray(input.covered_tokens) ||
    !Array.isArray(input.proof_boundaries) ||
    input.proof_boundaries.length === 0
  ) {
    throw new Error(
      "INVALID_COLLECTION_INPUT: run metadata, declarations, quality rows, tokens, and proof boundaries are required",
    );
  }
}

/**
 * [IMPL-QUALITY_EVIDENCE_COLLECTION] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
 * How: Validate collection context, run declarations upstream, and pass observed results to manifest generation.
 */
export async function collectVerificationEvidence(
  input: QualityEvidenceCollectionInput,
): Promise<VerificationEvidenceManifest> {
  validateCollectionInput(input);
  // [IMPL-QUALITY_EVIDENCE_COLLECTION] [IMPL-QUALITY_EVIDENCE_COMMAND_RUNNER] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
  // How: Delegate validated command declarations and execution limits to the bounded command runner.
  // [IMPL-QUALITY_EVIDENCE_COLLECTION] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
  // How: Run the upstream command runner, then build a manifest from observed results.
  const command_results = await runDeclaredQualityCommands({
    commands: input.commands,
    default_timeout_ms: input.default_timeout_ms,
    default_max_output_bytes: input.default_max_output_bytes,
  });
  // [IMPL-QUALITY_EVIDENCE_COLLECTION] [IMPL-QUALITY_EVIDENCE_MANIFEST] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
  // How: Delegate normalized command results and collection metadata to deterministic manifest generation.
  return buildVerificationEvidenceManifest({
    run_id: input.run_id,
    commit: input.commit,
    environment: input.environment,
    command_results,
    quality_rows: input.quality_rows,
    covered_tokens: input.covered_tokens,
    proof_boundaries: input.proof_boundaries,
    decision_references: input.decision_references,
  });
}
