import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { promoteConfirmedCase } from "../fidelity-research/case-promotion.js";
import { freezeClaimSurface } from "./claim-surface.js";
import {
  appendClaimReviewRow,
  appendIndependentCheck,
  appendOutsideObservation,
  appendUnsettledQuestion,
  createClaimReviewLedger,
} from "./claim-review-ledger.js";
import { classifyAllClaims } from "./classify-claim-status.js";
import { collectAllEvidence } from "./collect-claim-evidence.js";
import type {
  ClaimReviewProvenance,
  ClaimReviewReport,
  EvidenceStub,
  ExecutionPolicy,
  IndependentCheck,
  OutsideObservation,
  UnsettledQuestion,
} from "./types.js";
import { CLAIM_REVIEW_PROVENANCE_SCHEMA } from "./types.js";

const AUDITED_DENY = ["tied/methodology", "tied/requirements", "tied/architecture-decisions", "tied/implementation-decisions"];

function isAuditedIntentWrite(outputDir: string, projectRoot: string): boolean {
  const resolved = path.resolve(outputDir);
  const root = path.resolve(projectRoot);
  for (const segment of AUDITED_DENY) {
    const audited = path.join(root, segment);
    if (resolved === audited || resolved.startsWith(`${audited}${path.sep}`)) {
      return true;
    }
  }
  return false;
}

function writeJsonl(filePath: string, rows: unknown[]): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true, mode: 0o700 });
  const body = rows.length > 0 ? `${rows.map((row) => JSON.stringify(row)).join("\n")}\n` : "";
  fs.writeFileSync(filePath, body, { encoding: "utf8", mode: 0o600 });
}

function writeJson(filePath: string, value: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true, mode: 0o700 });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
}

function hashContent(value: unknown): string {
  return crypto.createHash("sha256").update(JSON.stringify(value), "utf8").digest("hex");
}

export type RunClaimsEvidenceReviewInput = {
  projectRoot: string;
  claimSurfacePath: string;
  inputBoundaryRoot: string;
  outputDir: string;
  evidenceStubs: EvidenceStub[];
  executionPolicy: ExecutionPolicy;
  requestToken: string;
  runId: string;
  includePilotSamples?: boolean;
};

export type RunClaimsEvidenceReviewResult =
  | {
      ok: true;
      report: ClaimReviewReport;
      provenance: ClaimReviewProvenance;
      outputPaths: Record<string, string>;
    }
  | { ok: false; error: string };

// [IMPL-TIED_CLAIMS_EVIDENCE_REVIEW] [ARCH-TIED_CLAIMS_EVIDENCE_REVIEW] [REQ-TIED_CLAIMS_EVIDENCE_REVIEW]
// Orchestrate freeze → collect → classify → append ledger under working scope only.
export function runClaimsEvidenceReview(
  input: RunClaimsEvidenceReviewInput,
): RunClaimsEvidenceReviewResult {
  if (isAuditedIntentWrite(input.outputDir, input.projectRoot)) {
    return { ok: false, error: "AuditedProjectWriteRejected" };
  }

  const frozen = freezeClaimSurface({
    claimSurfacePath: input.claimSurfacePath,
    inputBoundaryRoot: input.inputBoundaryRoot,
  });
  if (!frozen.ok) {
    return { ok: false, error: frozen.error.kind };
  }

  const collection = collectAllEvidence({
    stubs: input.evidenceStubs,
    projectRoot: input.projectRoot,
  });
  if (collection.rejected) {
    return { ok: false, error: "PathTraversalRejected" };
  }

  const evidenceByClaimId = new Map(collection.evidence.map((row) => [row.claimId, row]));
  const classified = classifyAllClaims({
    claims: frozen.frozen.surface.claims,
    evidenceByClaimId,
    executionPolicy: input.executionPolicy,
  });

  const ledger = createClaimReviewLedger();
  for (const row of classified) {
    appendClaimReviewRow(ledger, row);
  }

  const unsettledQuestions: UnsettledQuestion[] = [];
  const independentChecks: IndependentCheck[] = [];
  const outsideObservations: OutsideObservation[] = [];

  if (input.includePilotSamples) {
    for (const row of classified.filter((entry) => entry.disposition === "unsettled")) {
      appendUnsettledQuestion(unsettledQuestions, {
        claimId: row.claimId,
        question: `Follow up on unsettled claim ${row.claimId}: ${row.reason}`,
      });
    }
    appendOutsideObservation(outsideObservations, "Pilot sample observation outside frozen claim surface.");
    const shownRow = classified.find((entry) => entry.disposition === "shown");
    if (shownRow) {
      appendIndependentCheck(independentChecks, {
        ledgerRowId: shownRow.claimId,
        reviewer: "reviewer-b",
        agrees: false,
        note: "Independent check disagreement for pilot acceptance.",
      });
    }
  }

  const report: ClaimReviewReport = {
    schemaVersion: "claim-review-report.v1",
    summary: {
      shown: classified.filter((row) => row.disposition === "shown").length,
      unsettled: classified.filter((row) => row.disposition === "unsettled").length,
      notExamined: classified.filter((row) => row.disposition === "not_examined").length,
    },
    rows: classified,
  };

  const provenance: ClaimReviewProvenance = {
    schemaVersion: CLAIM_REVIEW_PROVENANCE_SCHEMA,
    runId: input.runId,
    requestToken: input.requestToken,
    sourceRevision: frozen.frozen.surface.sourceRevision,
    executionPolicy: input.executionPolicy,
    commands: ["runClaimsEvidenceReview"],
    artifactHashes: {},
  };

  const outputPaths = {
    ledger: path.join(input.outputDir, "claim-review-ledger.v1.jsonl"),
    unsettled: path.join(input.outputDir, "unsettled-questions.v1.jsonl"),
    independent: path.join(input.outputDir, "independent-checks.v1.jsonl"),
    outside: path.join(input.outputDir, "outside-observations.v1.jsonl"),
    provenance: path.join(input.outputDir, "claim-review-provenance.v1.json"),
    report: path.join(input.outputDir, "claim-review-report.v1.json"),
  };

  writeJsonl(outputPaths.ledger, ledger.rows);
  writeJsonl(outputPaths.unsettled, unsettledQuestions);
  writeJsonl(outputPaths.independent, independentChecks);
  writeJsonl(outputPaths.outside, outsideObservations);
  writeJson(outputPaths.report, report);
  writeJson(outputPaths.provenance, provenance);

  provenance.artifactHashes = {
    ledger: hashContent(ledger.rows),
    report: hashContent(report),
    frozenSurface: frozen.frozen.contentHash,
  };
  writeJson(outputPaths.provenance, provenance);

  return { ok: true, report, provenance, outputPaths };
}

export function tryPromoteConfirmedCase(input: {
  findingId: string;
  reviewers: readonly string[];
}) {
  return promoteConfirmedCase({
    findingId: input.findingId,
    originLayer: "claim-review",
    divergentEdge: "claim-to-evidence",
    specificationState: "frozen-claim-surface",
    evidenceReferences: [],
    reviewers: input.reviewers,
  });
}
