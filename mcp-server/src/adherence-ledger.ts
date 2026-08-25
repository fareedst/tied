// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
// How: append-only agent-adherence-event.v1 rows for gate_decided and status_mutated.
import { appendFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

export const ADHERENCE_EVENT_SCHEMA_VERSION = "agent-adherence-event.v1";

export type GateDecidedCorrelation = {
  request_token: string;
  phase: string;
  run_id?: string;
};

export type StatusMutatedCorrelation = {
  request_token: string;
  phase?: string;
  run_id?: string;
};

export type StatusMutationEntry = {
  index: "requirements" | "implementation";
  token: string;
  previous_status: string | undefined;
  next_status: string;
};

function appendLedgerRow(ledgerPath: string, row: Record<string, unknown>): void {
  if (!ledgerPath.trim()) {
    throw new Error("ledger_path_required");
  }
  mkdirSync(dirname(ledgerPath), { recursive: true });
  appendFileSync(ledgerPath, `${JSON.stringify(row)}\n`, "utf8");
}

/** Append gate_decided after atomic gate receipt write. */
export function appendGateDecided(
  ledgerPath: string,
  correlation: GateDecidedCorrelation,
  artifactRef: string,
  artifactHash: string,
): void {
  appendLedgerRow(ledgerPath, {
    schema_version: ADHERENCE_EVENT_SCHEMA_VERSION,
    event_class: "gate_decided",
    correlation: {
      request_token: correlation.request_token.trim(),
      phase: correlation.phase.trim(),
      ...(correlation.run_id?.trim() ? { run_id: correlation.run_id.trim() } : {}),
    },
    artifact_ref: artifactRef.trim(),
    artifact_hash: artifactHash.trim(),
    source: {
      kind: "mcp_gate",
      path: ledgerPath,
    },
  });
}

/** Append status_mutated after tied_verify dry_run or apply with non-empty would_update. */
export function appendStatusMutated(
  ledgerPath: string,
  correlation: StatusMutatedCorrelation,
  mutations: StatusMutationEntry[],
  gateReceiptRef: string,
  gateReceiptHash: string,
): void {
  appendLedgerRow(ledgerPath, {
    schema_version: ADHERENCE_EVENT_SCHEMA_VERSION,
    event_class: "status_mutated",
    correlation: {
      request_token: correlation.request_token.trim(),
      ...(correlation.phase?.trim() ? { phase: correlation.phase.trim() } : {}),
      ...(correlation.run_id?.trim() ? { run_id: correlation.run_id.trim() } : {}),
    },
    status_mutations: mutations,
    gate_receipt_ref: gateReceiptRef.trim(),
    gate_receipt_hash: gateReceiptHash.trim(),
    source: {
      kind: "tied_verify",
      path: ledgerPath,
    },
  });
}
