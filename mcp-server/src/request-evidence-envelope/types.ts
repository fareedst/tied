/**
 * [IMPL-REQUEST_EVIDENCE_ENVELOPE] [ARCH-REQUEST_EVIDENCE_ENVELOPE] [REQ-REQUEST_EVIDENCE_ENVELOPE]
 */

export const ENVELOPE_SCHEMA_VERSION = "request-evidence-envelope.v1";

export type GatePhase = "pre_implementation" | "verification" | "close_out";

export type DepthTier = "minimal" | "integrated" | "strict_candidate";

export type ArtifactKind =
  | "checklist_gate_receipt"
  | "adversarial_inquiry_provenance"
  | "adversarial_inquiry_obligation"
  | "adversarial_inquiry_gate"
  | "adversarial_inquiry_ledger"
  | "verification_evidence_manifest"
  | "evidence_chain_profile"
  | "checklist_tracker"
  | "citdp_record"
  | "not_applicable_receipt"
  | "request_evidence_envelope"
  | "unknown";

export type ArtifactStatus = "present" | "not_applicable" | "expected_missing" | "stale_projection";

export type EnvelopeArtifact = {
  kind: ArtifactKind;
  schema_version: string | null;
  path: string;
  content_hash: string;
  phase: GatePhase | null;
  status: ArtifactStatus;
  proof_boundaries: string[];
};

export type EnvelopeGap = {
  code: string;
  artifact_kind: ArtifactKind | null;
  phase: GatePhase | null;
  detail: string;
  severity: "error" | "warn" | "info";
  source?: string;
};

export type EnvelopeRun = {
  run_id: string;
  phase: GatePhase;
  started_at: string | null;
  generator: string;
};

export type EnvelopeIdentity = {
  request_token: string;
  project_id: string;
  depth_tier: DepthTier;
  gate_policy: string;
  methodology_snapshot_id: string;
};

export type EnvelopeCrossLinks = {
  tracker_path: string | null;
  tracker_hash: string | null;
  citdp_path: string | null;
  evidence_chain_profile_path: string | null;
};

export type RequestEvidenceEnvelope = {
  schema_version: typeof ENVELOPE_SCHEMA_VERSION;
  envelope_meta: {
    generated_at: string;
    generator: string;
    revision: number;
  };
  identity: EnvelopeIdentity;
  runs: EnvelopeRun[];
  artifacts: EnvelopeArtifact[];
  cross_links: EnvelopeCrossLinks;
  gaps: EnvelopeGap[];
};

export type BuildRequestEvidenceEnvelopeInput = {
  request_token: string;
  project_root: string;
  tied_base_path: string;
  confirmed_tied_base_path: string;
  depth_tier?: DepthTier;
  gate_policy?: string;
  output_mode?: "json" | "file";
  generated_at?: string;
  corpus_inventory?: string[];
};

export type BuildRequestEvidenceEnvelopeResult =
  | { ok: true; envelope: RequestEvidenceEnvelope; envelope_path?: string }
  | { ok: false; stage: string; error: string };

export type ValidateRequestEvidenceEnvelopeInput = {
  envelope?: RequestEvidenceEnvelope;
  envelope_path?: string;
  project_root?: string;
};

export type ValidateRequestEvidenceEnvelopeResult = {
  ok: boolean;
  envelope?: RequestEvidenceEnvelope;
  diagnostics: string[];
};

export type PatchArtifactEntry = {
  kind: ArtifactKind;
  path: string;
  content_hash: string;
  phase?: GatePhase | null;
  schema_version?: string | null;
  status?: ArtifactStatus;
  proof_boundaries?: string[];
};

export type PatchRequestEvidenceEnvelopeInput = {
  request_token: string;
  project_root: string;
  tied_base_path: string;
  confirmed_tied_base_path: string;
  artifact: PatchArtifactEntry;
  run?: EnvelopeRun;
  expected_revision?: number;
  generated_at?: string;
  depth_tier?: DepthTier;
  gate_policy?: string;
};

export type PatchRequestEvidenceEnvelopeResult =
  | { ok: true; envelope: RequestEvidenceEnvelope; revision: number; envelope_path: string }
  | { ok: false; gaps: EnvelopeGap[]; error?: string };

export type BackfillRequestEvidenceEnvelopeInput = {
  request_token: string;
  project_root: string;
  tied_base_path: string;
  confirmed_tied_base_path: string;
  depth_tier?: DepthTier;
  gate_policy?: string;
  write_not_applicable_receipts?: boolean;
  generated_at?: string;
};

export type BackfillRequestEvidenceEnvelopeResult =
  | {
      ok: true;
      envelope: RequestEvidenceEnvelope;
      envelope_path: string;
      not_applicable_receipt_path: string | null;
      not_applicable_receipt_hash: string | null;
      depth_tier: DepthTier;
      gaps_summary: Record<string, number>;
      gap_codes: string[];
      legacy_json_in_json_wrapper: boolean;
    }
  | { ok: false; stage: string; error: string };
