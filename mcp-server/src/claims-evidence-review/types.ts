/** [IMPL-TIED_CLAIMS_EVIDENCE_REVIEW] [ARCH-TIED_CLAIMS_EVIDENCE_REVIEW] [REQ-TIED_CLAIMS_EVIDENCE_REVIEW] */

export const CLAIM_SURFACE_SCHEMA = "claim-surface.v1" as const;
export const CLAIM_REVIEW_LEDGER_SCHEMA = "claim-review-ledger.v1" as const;
export const CLAIM_REVIEW_PROVENANCE_SCHEMA = "claim-review-provenance.v1" as const;

export type ClaimDisposition = "shown" | "unsettled" | "not_examined";
export type ExecutionPolicy = "static_only";
export type ProofBoundary =
  | "static_analysis"
  | "out_of_scope_static_slice"
  | "human_decision";

export interface ClaimRecord {
  id: string;
  text: string;
  source: string;
  scope: string;
  materialityHint?: string;
  requiresRuntimeProof?: boolean;
}

export interface ClaimSurface {
  schemaVersion: typeof CLAIM_SURFACE_SCHEMA;
  revision: string;
  sourceRevision: string;
  requestToken: string;
  claims: ClaimRecord[];
}

export interface EvidenceStub {
  claimId: string;
  path?: string;
  pseudoCodeRef?: string;
  validatorCommand?: string;
  proofBoundary: ProofBoundary;
}

export interface CollectedEvidence {
  claimId: string;
  proofBoundary: ProofBoundary;
  path?: string;
  contentHash?: string;
  command?: string;
  exitCode?: number;
  found: boolean;
}

export interface ClaimReviewRow {
  claimId: string;
  disposition: ClaimDisposition;
  reason: string;
  proofBoundary: ProofBoundary;
  demonstratedGap: boolean;
  unresolvedExposure: boolean;
  evidenceRefs: string[];
}

export interface ClaimReviewLedger {
  schemaVersion: typeof CLAIM_REVIEW_LEDGER_SCHEMA;
  rows: ClaimReviewRow[];
}

export interface UnsettledQuestion {
  id: string;
  claimId?: string;
  question: string;
  createdAt: string;
}

export interface IndependentCheck {
  id: string;
  ledgerRowId: string;
  reviewer: string;
  agrees: boolean;
  note: string;
  createdAt: string;
}

export interface OutsideObservation {
  id: string;
  text: string;
  createdAt: string;
}

export interface ClaimReviewProvenance {
  schemaVersion: typeof CLAIM_REVIEW_PROVENANCE_SCHEMA;
  runId: string;
  requestToken: string;
  sourceRevision: string;
  executionPolicy: ExecutionPolicy;
  commands: string[];
  artifactHashes: Record<string, string>;
}

export interface ClaimReviewReport {
  schemaVersion: "claim-review-report.v1";
  summary: {
    shown: number;
    unsettled: number;
    notExamined: number;
  };
  rows: ClaimReviewRow[];
}

export const MAX_FIELD_LENGTH = 16_384;
export const MAX_CLAIMS = 512;
