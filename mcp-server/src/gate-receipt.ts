// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
// How: PERSIST_GATE_DECISION_RECEIPT — atomic gate JSON write with input Tracker/CITDP hashes.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";

import { appendGateDecided, appendStatusMutated } from "./adherence-ledger.js";
import { stableHash, type GatePhase } from "./checklist-validator.js";

export const GATE_RECEIPT_SCHEMA_VERSION = "checklist-gate-receipt.v1";

export type GateValidationResult = {
  allowed: boolean;
  ok?: boolean;
  blocking?: boolean;
  depth?: string;
  phase?: GatePhase;
  diagnostics: string[];
};

export type InputHashes = {
  tracker_hash: string;
  citdp_hash: string;
};

export type PersistGateDecisionReceiptInput = {
  gateResult: GateValidationResult;
  phase: GatePhase;
  tracker: unknown;
  citdp: unknown;
  gatesDir: string;
  ledgerPath: string;
  requestToken: string;
  runId?: string;
};

export type PersistGateDecisionReceiptResult =
  | { ok: true; path: string; hash: string }
  | { ok: false; error: string; diagnostics: string[] };

function sha256Prefixed(content: string): string {
  return `sha256:${createHash("sha256").update(content, "utf8").digest("hex")}`;
}

/** Compute stable sha256-prefixed hashes for Tracker and CITDP inputs. */
export function computeInputHashes(tracker: unknown, citdp: unknown): InputHashes {
  return {
    tracker_hash: `sha256:${stableHash(tracker)}`,
    citdp_hash: `sha256:${stableHash(citdp)}`,
  };
}

/** Atomic write gate receipt JSON and append gate_decided ledger row. */
export function persistGateDecisionReceipt(
  input: PersistGateDecisionReceiptInput,
): PersistGateDecisionReceiptResult {
  const inputHashes = computeInputHashes(input.tracker, input.citdp);
  if (!inputHashes.tracker_hash || !inputHashes.citdp_hash) {
    return { ok: false, error: "missing_input_hash", diagnostics: ["missing_input_hash"] };
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `${input.phase}-${timestamp}.json`;
  mkdirSync(input.gatesDir, { recursive: true });
  const receiptPath = path.join(input.gatesDir, filename);

  const receiptBody = {
    schema_version: GATE_RECEIPT_SCHEMA_VERSION,
    phase: input.phase,
    timestamp: new Date().toISOString(),
    allowed: input.gateResult.allowed,
    diagnostics: input.gateResult.diagnostics,
    depth: input.gateResult.depth,
    input_hashes: inputHashes,
    gate_result: input.gateResult,
  };

  const serialized = `${JSON.stringify(receiptBody, null, 2)}\n`;
  const tmpPath = `${receiptPath}.tmp`;
  writeFileSync(tmpPath, serialized, "utf8");
  renameSync(tmpPath, receiptPath);

  const hash = sha256Prefixed(serialized);
  appendGateDecided(
    input.ledgerPath,
    {
      request_token: input.requestToken,
      phase: input.phase,
      run_id: input.runId,
    },
    receiptPath,
    hash,
  );

  return { ok: true, path: receiptPath, hash };
}

export type PersistStatusMutationReceiptInput = {
  ledgerPath: string;
  requestToken: string;
  phase?: string;
  runId?: string;
  mutations: Array<{
    index: "requirements" | "implementation";
    token: string;
    previous_status: string | undefined;
    next_status: string;
  }>;
  gateReceiptRef: string;
  gateReceiptHash: string;
  mutationApplied: boolean;
};

export type PersistStatusMutationReceiptResult =
  | { ok: true }
  | { ok: false; error: string; diagnostics: string[] };

/** Append status_mutated ledger row; fail closed when mutation applied without gate receipt ref. */
export function persistStatusMutationReceipt(
  input: PersistStatusMutationReceiptInput,
): PersistStatusMutationReceiptResult {
  if (input.mutations.length === 0) {
    return { ok: false, error: "verify_no_op", diagnostics: ["verify_no_op"] };
  }
  if (input.mutationApplied && (!input.gateReceiptRef.trim() || !input.gateReceiptHash.trim())) {
    return {
      ok: false,
      error: "missing_gate_receipt_ref",
      diagnostics: ["missing_gate_receipt_ref"],
    };
  }
  if (!input.gateReceiptRef.trim() || !input.gateReceiptHash.trim()) {
    return {
      ok: false,
      error: "missing_gate_receipt_ref",
      diagnostics: ["missing_gate_receipt_ref"],
    };
  }

  appendStatusMutated(
    input.ledgerPath,
    {
      request_token: input.requestToken,
      phase: input.phase,
      run_id: input.runId,
    },
    input.mutations,
    input.gateReceiptRef,
    input.gateReceiptHash,
  );
  return { ok: true };
}

/** Read gate receipt file and return its content hash for correlation checks. */
export function hashGateReceiptFile(receiptPath: string): string {
  const content = readFileSync(receiptPath, "utf8");
  return sha256Prefixed(content);
}
