/**
 * [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
 * Live-run adherence ledger + active-turn marker (Go checklist/adherence_*.go parity).
 */
import { execFileSync } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import type { ResolvedRef } from "./adherence-evidence-resolve.js";

const adherenceEventSchemaVersion = "agent-adherence-event.v1";
const activeTurnMarkerSchemaVersion = "active-turn-marker.v1";

export type InstructionCorrelation = {
  requestToken: string;
  runID: string;
  turnIndex: number;
  stepSlug: string;
  instructionHash: string;
  instructionNonce: string;
  sourceRevision: string;
};

export type ActiveTurnMarker = {
  schema_version?: string;
  request_token: string;
  run_id: string;
  turn_index: number;
  step_slug: string;
  instruction_nonce: string;
  instruction_hash: string;
  adherence_ledger_path: string;
  source_revision: string;
  written_at?: string;
  workspace_root?: string;
};

export function hashRenderedInstructionParts(parts: string[]): string {
  const rendered = parts.join("\n");
  const sum = createHash("sha256").update(rendered).digest("hex");
  return `sha256:${sum}`;
}

export function hashSessionId(sessionId: string): string {
  const sum = createHash("sha256").update(sessionId.trim()).digest("hex");
  return `sha256:${sum}`;
}

function appendLedgerRow(
  ledgerPath: string,
  row: Record<string, unknown>,
): void {
  if (ledgerPath.trim() === "") {
    throw new Error("ledger_path_required");
  }
  fs.mkdirSync(path.dirname(ledgerPath), { recursive: true, mode: 0o755 });
  const body = `${JSON.stringify(row)}\n`;
  fs.appendFileSync(ledgerPath, body, { mode: 0o644 });
}

export function appendInstructionRendered(
  ledgerPath: string,
  fields: InstructionCorrelation,
): void {
  appendLedgerRow(ledgerPath, {
    schema_version: adherenceEventSchemaVersion,
    event_class: "instruction_rendered",
    correlation: {
      request_token: fields.requestToken.trim(),
      run_id: fields.runID.trim(),
      turn_index: fields.turnIndex,
      step_slug: fields.stepSlug.trim(),
      instruction_hash: fields.instructionHash.trim(),
      instruction_nonce: fields.instructionNonce.trim(),
      source_revision: fields.sourceRevision.trim(),
    },
    source: { kind: "agentstream", path: ledgerPath },
  });
}

export function appendAgentAcknowledged(
  ledgerPath: string,
  fields: InstructionCorrelation,
  receiptHash: string,
  sessionIdHash: string,
): void {
  appendLedgerRow(ledgerPath, {
    schema_version: adherenceEventSchemaVersion,
    event_class: "agent_acknowledged",
    correlation: {
      request_token: fields.requestToken.trim(),
      run_id: fields.runID.trim(),
      turn_index: fields.turnIndex,
      step_slug: fields.stepSlug.trim(),
      instruction_hash: fields.instructionHash.trim(),
      instruction_nonce: fields.instructionNonce.trim(),
      receipt_hash: receiptHash.trim(),
      session_id_hash: sessionIdHash.trim(),
    },
    source: { kind: "agentstream", path: ledgerPath },
  });
}

export function appendOutcomeVerified(
  ledgerPath: string,
  fields: InstructionCorrelation,
  resolved: ResolvedRef,
  receiptHash: string,
): void {
  appendLedgerRow(ledgerPath, {
    schema_version: adherenceEventSchemaVersion,
    event_class: "outcome_verified",
    correlation: {
      request_token: fields.requestToken.trim(),
      run_id: fields.runID.trim(),
      turn_index: fields.turnIndex,
      step_slug: fields.stepSlug.trim(),
      instruction_hash: fields.instructionHash.trim(),
      instruction_nonce: fields.instructionNonce.trim(),
      receipt_hash: receiptHash.trim(),
    },
    artifact_ref: resolved.artifactRef.trim(),
    artifact_hash: resolved.artifactHash.trim(),
    ref_kind: resolved.kind.trim(),
    source: { kind: "agentstream", path: ledgerPath },
  });
}

export function activeTurnMarkerPath(
  workspace: string,
  requestToken: string,
): string {
  const token = requestToken.trim();
  return path.join(workspace.trim(), "working", token, "adherence", "active-turn.json");
}

export function writeActiveTurnMarker(
  markerPath: string,
  marker: ActiveTurnMarker,
): void {
  if (markerPath.trim() === "") {
    throw new Error("active_turn_marker_path_required");
  }
  if (marker.request_token.trim() === "") {
    throw new Error("active_turn_marker_request_token_required");
  }
  if (marker.adherence_ledger_path.trim() === "") {
    throw new Error("active_turn_marker_ledger_path_required");
  }
  if (
    marker.instruction_nonce.trim() === "" ||
    marker.instruction_hash.trim() === ""
  ) {
    throw new Error("active_turn_marker_instruction_binding_required");
  }
  const body = {
    ...marker,
    schema_version: activeTurnMarkerSchemaVersion,
    written_at: marker.written_at ?? new Date().toISOString(),
  };
  fs.mkdirSync(path.dirname(markerPath), { recursive: true, mode: 0o755 });
  const tmp = `${markerPath}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(body)}\n`, { mode: 0o644 });
  fs.renameSync(tmp, markerPath);
}

export function clearActiveTurnMarker(markerPath: string): void {
  if (markerPath.trim() === "") {
    return;
  }
  try {
    fs.unlinkSync(markerPath);
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") {
      throw new Error(`active_turn_marker_clear_failure: ${String(err)}`);
    }
  }
}

export function newRunId(): string {
  return `agentstream-${randomBytes(8).toString("hex")}`;
}

export function issueInstructionNonce(runID: string, turnIndex: number): string {
  return `${runID.trim()}:${turnIndex}:${randomBytes(8).toString("hex")}`;
}

export function bindingEnv(issued: {
  nonce: string;
  hash: string;
  requestToken: string;
  runID: string;
}): string[] {
  return [
    `INSTRUCTION_NONCE=${issued.nonce}`,
    `INSTRUCTION_HASH=${issued.hash}`,
    `REQUEST_TOKEN=${issued.requestToken}`,
    `RUN_ID=${issued.runID}`,
  ];
}

export function sourceRevision(workspace: string): string {
  try {
    const rev = execFileSync("git", ["-C", workspace, "rev-parse", "HEAD"], {
      encoding: "utf8",
    }).trim();
    if (rev === "") {
      return "unknown";
    }
    const status = execFileSync("git", ["-C", workspace, "status", "--porcelain"], {
      encoding: "utf8",
    }).trim();
    if (status.length > 0) {
      return `dirty:${rev.slice(0, 12)}`;
    }
    return rev;
  } catch {
    const sum = hashRenderedInstructionParts([workspace]);
    return `dirty:${sum.replace(/^sha256:/, "")}`;
  }
}
