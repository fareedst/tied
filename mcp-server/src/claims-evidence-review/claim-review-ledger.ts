import crypto from "node:crypto";

import {
  CLAIM_REVIEW_LEDGER_SCHEMA,
  type ClaimReviewLedger,
  type ClaimReviewRow,
  type IndependentCheck,
  type OutsideObservation,
  type UnsettledQuestion,
} from "./types.js";

export function createClaimReviewLedger(): ClaimReviewLedger {
  return { schemaVersion: CLAIM_REVIEW_LEDGER_SCHEMA, rows: [] };
}

export type AppendLedgerResult =
  | { kind: "appended"; row: ClaimReviewRow }
  | { kind: "duplicate"; claimId: string; existingIndex: number };

// [IMPL-TIED_CLAIMS_EVIDENCE_REVIEW] [ARCH-TIED_CLAIMS_EVIDENCE_REVIEW] [REQ-TIED_CLAIMS_EVIDENCE_REVIEW]
// Append disposition rows; duplicate claim ids link without overwrite.
export function appendClaimReviewRow(
  ledger: ClaimReviewLedger,
  row: ClaimReviewRow,
): AppendLedgerResult {
  const existingIndex = ledger.rows.findIndex((entry) => entry.claimId === row.claimId);
  if (existingIndex >= 0) {
    return { kind: "duplicate", claimId: row.claimId, existingIndex };
  }
  ledger.rows.push({ ...row, evidenceRefs: [...row.evidenceRefs] });
  return { kind: "appended", row };
}

export function appendUnsettledQuestion(
  questions: UnsettledQuestion[],
  input: { claimId?: string; question: string },
): UnsettledQuestion {
  const entry: UnsettledQuestion = {
    id: stableId("unsettled", input.claimId ?? "", input.question),
    claimId: input.claimId,
    question: input.question,
    createdAt: new Date(0).toISOString(),
  };
  questions.push(entry);
  return entry;
}

export function appendIndependentCheck(
  checks: IndependentCheck[],
  input: { ledgerRowId: string; reviewer: string; agrees: boolean; note: string },
): IndependentCheck {
  const entry: IndependentCheck = {
    id: stableId("check", input.ledgerRowId, input.reviewer, input.note),
    ledgerRowId: input.ledgerRowId,
    reviewer: input.reviewer,
    agrees: input.agrees,
    note: input.note,
    createdAt: new Date(0).toISOString(),
  };
  checks.push(entry);
  return entry;
}

export function appendOutsideObservation(
  observations: OutsideObservation[],
  text: string,
): OutsideObservation {
  const entry: OutsideObservation = {
    id: stableId("observation", text),
    text,
    createdAt: new Date(0).toISOString(),
  };
  observations.push(entry);
  return entry;
}

function stableId(...parts: string[]): string {
  return crypto.createHash("sha256").update(parts.join("\0"), "utf8").digest("hex").slice(0, 16);
}
