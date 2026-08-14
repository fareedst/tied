import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

// [IMPL-TIED_RESEARCH_RECORDS] [ARCH-TIED_RESEARCH_RECORD_BOUNDARY] [REQ-TIED_RESEARCH_RECORDS]
// Defines structured external research records, freshness evaluation, and read-only dataset emission.

export const RESEARCH_RECORD_TYPES = [
  "library_comparison",
  "benchmark",
  "security_finding",
  "organizational_constraint",
  "experiment",
] as const;
export type ResearchRecordType = (typeof RESEARCH_RECORD_TYPES)[number];
export const RESEARCH_CLASSIFICATIONS = [
  "candidate_finding",
  "confirmed_case_report",
  "accepted_uncertainty",
] as const;
export type ResearchClassification = (typeof RESEARCH_CLASSIFICATIONS)[number];

export interface EvidenceProvenance {
  revision: string;
  environment: string;
  command?: string;
  method_identity?: string;
  result: string;
  artifacts: string[];
}

export interface FreshnessPolicy {
  max_age_days?: number;
  review_interval_days?: number;
  unknown_date: "freshness_unknown" | "current" | "stale";
}

export interface ResearchRecordInput {
  record_type: ResearchRecordType;
  source: string;
  source_date?: string;
  method: string;
  conclusion: string;
  uncertainty: string;
  affected_decisions: { architecture: string[]; implementation: string[] };
  evidence_provenance?: EvidenceProvenance;
  freshness_policy: FreshnessPolicy;
  classification: ResearchClassification;
  proof_boundaries?: string[];
}

export interface NormalizedResearchRecord extends ResearchRecordInput {
  id: string;
  proof_boundaries: string[];
}

export type ResearchError =
  | "InvalidRecord"
  | "MissingProvenance"
  | "InvalidDecisionLink"
  | "InvalidFreshnessPolicy";

export type NormalizeResult =
  | { ok: true; record: NormalizedResearchRecord }
  | { ok: false; error: ResearchError; detail?: string };

export interface FreshnessResult {
  status: "current" | "stale" | "freshness_unknown";
  source_date?: string;
  evaluated_at: string;
  policy: FreshnessPolicy;
  diagnostic: string;
  proof_boundary: string;
}

function nonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validToken(token: string, prefix: "ARCH" | "IMPL"): boolean {
  return new RegExp(`^${prefix}-[A-Z0-9_]+$`).test(token);
}

// [IMPL-TIED_RESEARCH_RECORDS] [ARCH-TIED_RESEARCH_RECORD_BOUNDARY] [REQ-TIED_RESEARCH_RECORDS] — Normalizes one typed research record without copying canonical decision bodies.
export function normalizeResearchRecord(input: ResearchRecordInput): NormalizeResult {
  if (
    !RESEARCH_RECORD_TYPES.includes(input.record_type) ||
    !nonEmpty(input.source) ||
    !nonEmpty(input.method) ||
    !nonEmpty(input.conclusion) ||
    !nonEmpty(input.uncertainty) ||
    !input.affected_decisions ||
    !Array.isArray(input.affected_decisions.architecture) ||
    !Array.isArray(input.affected_decisions.implementation) ||
    !RESEARCH_CLASSIFICATIONS.includes(input.classification)
  ) {
    return { ok: false, error: "InvalidRecord" };
  }
  if (
    !input.evidence_provenance ||
    !nonEmpty(input.evidence_provenance.revision) ||
    !nonEmpty(input.evidence_provenance.environment) ||
    !nonEmpty(input.evidence_provenance.result) ||
    !Array.isArray(input.evidence_provenance.artifacts) ||
    input.evidence_provenance.artifacts.some((artifact) => !nonEmpty(artifact))
  ) {
    return { ok: false, error: "MissingProvenance" };
  }
  if (
    input.affected_decisions.architecture.some((token) => !validToken(token, "ARCH")) ||
    input.affected_decisions.implementation.some((token) => !validToken(token, "IMPL"))
  ) {
    return { ok: false, error: "InvalidDecisionLink" };
  }
  const id = crypto
    .createHash("sha256")
    .update(JSON.stringify({ ...input, evidence_provenance: input.evidence_provenance }))
    .digest("hex");
  return {
    ok: true,
    record: {
      ...input,
      id,
      source: input.source.trim(),
      method: input.method.trim(),
      conclusion: input.conclusion.trim(),
      uncertainty: input.uncertainty.trim(),
      proof_boundaries: input.proof_boundaries?.length
        ? [...input.proof_boundaries]
        : ["research evidence is not runtime correctness, security, quality, or canonical-intent proof"],
      affected_decisions: {
        architecture: [...input.affected_decisions.architecture],
        implementation: [...input.affected_decisions.implementation],
      },
      evidence_provenance: { ...input.evidence_provenance, artifacts: [...input.evidence_provenance.artifacts] },
    },
  };
}

// [IMPL-TIED_RESEARCH_RECORDS] [ARCH-TIED_RESEARCH_RECORD_BOUNDARY] [REQ-TIED_RESEARCH_RECORDS] — Applies an explicit freshness policy without presenting freshness as correctness proof.
export function evaluateResearchFreshness(
  record: Pick<NormalizedResearchRecord, "source_date" | "freshness_policy">,
  evaluatedAt: string,
): FreshnessResult {
  const policy = record.freshness_policy;
  const interval = policy.max_age_days ?? policy.review_interval_days;
  const evaluated = new Date(evaluatedAt);
  if (
    !Number.isFinite(evaluated.getTime()) ||
    !Number.isInteger(interval) ||
    interval === undefined ||
    interval < 0 ||
    !["freshness_unknown", "current", "stale"].includes(policy.unknown_date)
  ) {
    return {
      status: "freshness_unknown",
      source_date: record.source_date,
      evaluated_at: evaluatedAt,
      policy,
      diagnostic: "InvalidFreshnessPolicy",
      proof_boundary: "Freshness does not establish runtime correctness or canonical intent.",
    };
  }
  if (!record.source_date) {
    return {
      status: policy.unknown_date,
      evaluated_at: evaluatedAt,
      policy,
      diagnostic: "Source date is unavailable; freshness follows unknown-date policy.",
      proof_boundary: "Freshness does not establish runtime correctness or canonical intent.",
    };
  }
  const source = new Date(record.source_date);
  if (!Number.isFinite(source.getTime())) {
    return {
      status: policy.unknown_date,
      source_date: record.source_date,
      evaluated_at: evaluatedAt,
      policy,
      diagnostic: "Source date is unparseable; freshness follows unknown-date policy.",
      proof_boundary: "Freshness does not establish runtime correctness or canonical intent.",
    };
  }
  const ageDays = (evaluated.getTime() - source.getTime()) / 86_400_000;
  const status = ageDays > interval ? "stale" : "current";
  return {
    status,
    source_date: record.source_date,
    evaluated_at: evaluatedAt,
    policy,
    diagnostic: `Source age ${ageDays} days evaluated against ${interval}-day policy.`,
    proof_boundary: "Freshness does not establish runtime correctness or canonical intent.",
  };
}

// [IMPL-TIED_RESEARCH_RECORDS] [ARCH-TIED_RESEARCH_RECORD_BOUNDARY] [REQ-TIED_RESEARCH_RECORDS] — Emits external evidence while enforcing the read-only fidelity boundary.
export function emitResearchDatasetRecord(
  record: NormalizedResearchRecord,
  freshness: FreshnessResult,
  boundary: { auditedProjectRoot: string; datasetPath: string },
): { ok: true; record: NormalizedResearchRecord & { freshness: FreshnessResult } } | { ok: false; error: "AuditedProjectWrite" | "DatasetWriteFailure" } {
  const auditedRoot = path.resolve(boundary.auditedProjectRoot);
  const dataset = path.resolve(boundary.datasetPath);
  const tiedRoot = path.join(auditedRoot, "tied") + path.sep;
  if (dataset === path.join(auditedRoot, "tied") || dataset.startsWith(tiedRoot)) {
    console.error("DIAGNOSTIC: research dataset write rejected inside audited project TIED boundary.");
    return { ok: false, error: "AuditedProjectWrite" };
  }
  try {
    fs.mkdirSync(path.dirname(dataset), { recursive: true });
    const emitted = { ...record, freshness };
    fs.appendFileSync(dataset, `${JSON.stringify(emitted)}\n`, "utf8");
    return { ok: true, record: emitted };
  } catch (error) {
    console.error("DIAGNOSTIC: research dataset append failed.", error);
    return { ok: false, error: "DatasetWriteFailure" };
  }
}
