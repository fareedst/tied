/**
 * [IMPL-METHODOLOGY-LEARNING-COHORT-EXPORT] [IMPL-REQUEST_EVIDENCE_ENVELOPE_BATCH]
 * [REQ-METHODOLOGY-LEARNING-COHORT-EXPORT] [REQ-REQUEST_EVIDENCE_ENVELOPE]
 */

import { createHash } from "node:crypto";
import path from "node:path";

import type { EvidenceChainStatisticsReport } from "../fidelity-research/evidence-chain-report.js";

const FORBIDDEN_SCORE_KEYS = new Set(["maturity", "score", "maturity_score", "universal_score", "ranking", "client_rank"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function hashProjectIdentity(projectId: string): string {
  return createHash("sha256").update(`methodology-cohort-export:v1:${projectId}`).digest("hex").slice(0, 16);
}

function containsForbiddenScoreKey(value: unknown): boolean {
  if (!isRecord(value) && !Array.isArray(value)) return false;
  if (Array.isArray(value)) {
    return value.some((entry) => containsForbiddenScoreKey(entry));
  }
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_SCORE_KEYS.has(key)) return true;
    if (containsForbiddenScoreKey(child)) return true;
  }
  return false;
}

function basenameRef(artifactRef: string): string {
  if (artifactRef.includes("/") || artifactRef.includes("\\")) {
    return path.basename(artifactRef);
  }
  return artifactRef;
}

function redactReportRow(row: Record<string, unknown>): Record<string, unknown> {
  const next: Record<string, unknown> = { ...row };
  if (typeof next.project_id === "string") {
    next.project_id = hashProjectIdentity(next.project_id);
  }
  if (typeof next.artifact_ref === "string") {
    next.artifact_ref = basenameRef(next.artifact_ref);
  }
  return next;
}

export function redactEvidenceChainReportForShareable(
  report: EvidenceChainStatisticsReport,
): { ok: true; report: EvidenceChainStatisticsReport } | { ok: false; code: "forbidden_field"; message: string } {
  if (containsForbiddenScoreKey(report)) {
    return { ok: false, code: "forbidden_field", message: "Report contains forbidden score or ranking fields" };
  }
  const clone = structuredClone(report) as EvidenceChainStatisticsReport;
  if (Array.isArray(clone.inputs)) {
    clone.inputs = clone.inputs.map((row) => redactReportRow(row as Record<string, unknown>)) as typeof clone.inputs;
  }
  for (const cohort of clone.cohorts) {
    if ("clients" in cohort && Array.isArray(cohort.clients)) {
      cohort.clients = cohort.clients.map((row) =>
        redactReportRow(row as Record<string, unknown>),
      ) as typeof cohort.clients;
    }
    if ("sub_cohorts" in cohort && Array.isArray(cohort.sub_cohorts)) {
      for (const sub of cohort.sub_cohorts) {
        sub.clients = sub.clients.map((row) =>
          redactReportRow(row as Record<string, unknown>),
        ) as typeof sub.clients;
      }
    }
  }
  return { ok: true, report: clone };
}
