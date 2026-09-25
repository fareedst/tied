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
import {
  hashStringContents,
  tryPatchRequestEvidenceEnvelope,
} from "./request-evidence-envelope/hooks.js";
import {
  runOptionalDiffScopedCrapAfterManifest,
  type DiffScopedCrapHookContext,
  type DiffScopedCrapHookOutcome,
} from "./diff-scoped-crap-hook.js";

export type EnvelopePatchContext = {
  request_token: string;
  project_root: string;
  manifest_relative_path: string;
};

export type QualityEvidenceCollectionInput = Omit<VerificationEvidenceInput, "command_results"> & {
  commands: QualityCommandDeclaration[];
  default_timeout_ms?: number;
  default_max_output_bytes?: number;
  envelope_patch?: EnvelopePatchContext;
  /** Explicit W2d hook context; when omitted but envelope_patch is set, hook runs from envelope request_token + project_root. */
  diff_scoped_crap_hook?: DiffScopedCrapHookContext;
};

export type QualityEvidenceCollectionResult = {
  manifest: VerificationEvidenceManifest;
  diff_scoped_crap_hook?: DiffScopedCrapHookOutcome;
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
): Promise<QualityEvidenceCollectionResult> {
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
  const manifest = buildVerificationEvidenceManifest({
    run_id: input.run_id,
    commit: input.commit,
    environment: input.environment,
    command_results,
    quality_rows: input.quality_rows,
    covered_tokens: input.covered_tokens,
    proof_boundaries: input.proof_boundaries,
    decision_references: input.decision_references,
  });
  if (input.envelope_patch) {
    const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
    await tryPatchRequestEvidenceEnvelope({
      request_token: input.envelope_patch.request_token,
      project_root: input.envelope_patch.project_root,
      artifact: {
        kind: "verification_evidence_manifest",
        path: input.envelope_patch.manifest_relative_path,
        content_hash: await hashStringContents(serialized),
        phase: null,
        schema_version: manifest.schema_version,
        proof_boundaries: ["artifact_presence_only"],
      },
      run: {
        run_id: input.run_id,
        phase: "verification",
        started_at: null,
        generator: "quality_evidence_collect_manifest",
      },
    });
  }

  // [IMPL-TIED_DAE_INCORPORATION] [ARCH-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION]
  // How: OPTIONAL_DIFF_SCOPED_CRAP_HOOK after successful manifest when CITDP diff_scoped_crap is true.
  let diff_scoped_crap_hook: DiffScopedCrapHookOutcome | undefined;
  const hookCtx =
    input.diff_scoped_crap_hook ??
    (input.envelope_patch
      ? {
          request_token: input.envelope_patch.request_token,
          project_root: input.envelope_patch.project_root,
        }
      : undefined);
  if (hookCtx) {
    diff_scoped_crap_hook = runOptionalDiffScopedCrapAfterManifest(hookCtx);
  }

  return { manifest, diff_scoped_crap_hook };
}
