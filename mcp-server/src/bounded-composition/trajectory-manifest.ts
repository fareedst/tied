/**
 * [IMPL-TIED_BOUNDED_TRAJECTORY_EVIDENCE] [ARCH-TIED_BOUNDED_COMPOSITION] [REQ-TIED_BOUNDED_COMPOSITION]
 * CAPTURE_TRAJECTORY_MANIFEST — local raw artifacts + compact committed manifest.
 */

import fs from "node:fs";
import path from "node:path";

import { safeStringifyJson } from "../storage-dump.js";
import { isValidWorkingRequestToken } from "../working-request-token.js";
import { workingPathRelativeToProject } from "../working-root.js";
import {
  BOUNDED_ENVELOPE_ARTIFACT_SCHEMAS,
  BOUNDED_PROOF_BOUNDARIES,
} from "./constants.js";
import { contentHashHex } from "./content-hash.js";
import type { PilotBudgetV1 } from "./pilot-budget.js";
import { redactBoundedSecrets } from "./privacy-redaction.js";
import { assertPathSafeSegment } from "./path-safe-id.js";
import {
  assertTiedBasePathMatchesProject,
  resolveLocalTrajectoryPath,
} from "./trajectory-paths.js";

export type TrajectoryManifestErrorCode =
  | "WrongBasePath"
  | "PrivacyRedactionFailure"
  | "MissingProvenance"
  | "InvalidRequestToken"
  | "DuplicateRunId";

export type TrajectoryManifestError = {
  code: TrajectoryManifestErrorCode;
  detail: string;
};

export type RunOutcomeSummary = {
  exit_code: number;
  outcome_hash: string;
  tool_sequence_hashes?: string[];
  truncated_summary?: string;
  truncated?: boolean;
};

export type CaptureTrajectoryManifestInput = {
  project_root: string;
  tied_base_path: string;
  request_token: string;
  pilot_budget: PilotBudgetV1;
  run_id: string;
  adapter_id: string;
  candidate_hash: string;
  provenance_ref: string;
  run_outcome: RunOutcomeSummary;
  /** High-volume payload stored locally only (redacted before write). */
  local_raw_payload: unknown;
  harness_id?: string;
  /** When true (default), write compact manifest under committed working evidence/. */
  promote_committed_manifest?: boolean;
};

export type TrajectoryManifestV1 = {
  schema_version: typeof BOUNDED_ENVELOPE_ARTIFACT_SCHEMAS.trajectoryManifest;
  request_token: string;
  run_id: string;
  run_namespace: string;
  budget_seed: string;
  adapter_id: string;
  harness_id: string | null;
  candidate_hash: string;
  exit_code: number;
  outcome_hash: string;
  tool_sequence_hashes: string[];
  truncated_summary: string | null;
  truncated: boolean;
  provenance_refs: string[];
  local_raw_refs: string[];
  local_raw_content_hash: string;
  privacy_tier: "operator_local";
  proof_boundaries: string[];
  captured_at: string;
};

export type CaptureTrajectoryManifestResult =
  | {
      ok: true;
      manifest: TrajectoryManifestV1;
      manifest_relative_path: string | null;
      local_raw_relative_path: string;
    }
  | { ok: false; error: TrajectoryManifestError };

function fail(code: TrajectoryManifestErrorCode, detail: string): CaptureTrajectoryManifestResult {
  return { ok: false, error: { code, detail } };
}

export function captureTrajectoryManifest(
  input: CaptureTrajectoryManifestInput,
  options: { now?: string } = {},
): CaptureTrajectoryManifestResult {
  if (!isValidWorkingRequestToken(input.request_token)) {
    return fail("InvalidRequestToken", "request_token invalid");
  }
  const baseErr = assertTiedBasePathMatchesProject(input.project_root, input.tied_base_path);
  if (baseErr) return fail("WrongBasePath", baseErr.detail);
  if (assertPathSafeSegment(input.run_id) == null) {
    return fail("WrongBasePath", "run_id must be path-safe");
  }
  if (!input.provenance_ref?.trim()) {
    return fail("MissingProvenance", "provenance_ref is required");
  }

  const outcomeRedacted = redactBoundedSecrets(input.run_outcome);
  if (!outcomeRedacted.ok) {
    return fail("PrivacyRedactionFailure", outcomeRedacted.detail);
  }
  const rawRedacted = redactBoundedSecrets(input.local_raw_payload);
  if (!rawRedacted.ok) {
    return fail("PrivacyRedactionFailure", rawRedacted.detail);
  }

  const outcome = outcomeRedacted.value as RunOutcomeSummary;
  const rawJson = safeStringifyJson(rawRedacted.value);
  const rawHash = contentHashHex(rawJson);

  const localResolved = resolveLocalTrajectoryPath(
    input.project_root,
    input.request_token,
    input.run_id,
    "payload.json",
  );
  if ("code" in localResolved) {
    return fail("WrongBasePath", localResolved.detail);
  }
  if (fs.existsSync(localResolved.absolute)) {
    return fail("DuplicateRunId", `local trajectory already exists for run_id ${input.run_id}`);
  }

  fs.mkdirSync(path.dirname(localResolved.absolute), { recursive: true });
  fs.writeFileSync(localResolved.absolute, rawJson, "utf8");

  const capturedAt = options.now ?? new Date().toISOString();
  const manifest: TrajectoryManifestV1 = {
    schema_version: BOUNDED_ENVELOPE_ARTIFACT_SCHEMAS.trajectoryManifest,
    request_token: input.request_token,
    run_id: input.run_id,
    run_namespace: input.pilot_budget.run_namespace,
    budget_seed: input.pilot_budget.seed,
    adapter_id: input.adapter_id,
    harness_id: input.harness_id ?? null,
    candidate_hash: input.candidate_hash,
    exit_code: outcome.exit_code,
    outcome_hash: outcome.outcome_hash,
    tool_sequence_hashes: outcome.tool_sequence_hashes ?? [],
    truncated_summary: outcome.truncated_summary ?? null,
    truncated: outcome.truncated === true,
    provenance_refs: [input.provenance_ref.trim()],
    local_raw_refs: [localResolved.relative],
    local_raw_content_hash: rawHash,
    privacy_tier: "operator_local",
    proof_boundaries: [
      BOUNDED_PROOF_BOUNDARIES.rawTrajectoriesOperatorLocal,
      BOUNDED_PROOF_BOUNDARIES.defaultOffOptIn,
    ],
    captured_at: capturedAt,
  };

  const promote = input.promote_committed_manifest !== false;
  let manifestRelative: string | null = null;
  if (promote) {
    const filename = `bounded-trajectory-manifest-${input.run_id}.v1.json`;
    const evidenceRel = workingPathRelativeToProject(
      input.project_root,
      input.request_token,
      "evidence",
      filename,
    );
    const evidenceAbs = path.join(input.project_root, evidenceRel);
    fs.mkdirSync(path.dirname(evidenceAbs), { recursive: true });
    fs.writeFileSync(evidenceAbs, safeStringifyJson(manifest), "utf8");
    manifestRelative = evidenceRel;
  }

  return {
    ok: true,
    manifest,
    manifest_relative_path: manifestRelative,
    local_raw_relative_path: localResolved.relative,
  };
}
