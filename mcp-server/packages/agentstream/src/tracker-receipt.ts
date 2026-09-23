/**
 * [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
 * Tracker completion receipt parse/validate (Go checklist/tracker_receipt.go parity).
 */
import { createHash } from "node:crypto";

export const TRACKER_RECEIPT_SCHEMA_VERSION = 1;

export type TrackerEvidenceRef = string | Record<string, unknown>;

export type TrackerCompletionReceipt = {
  schema_version: number;
  slug: string;
  disposition: string;
  evidence_refs?: TrackerEvidenceRef[];
  policy?: string;
  rationale?: string;
  owner?: string;
  expiry?: string;
  approval?: string;
  residual_risk?: string;
  instruction_nonce?: string;
  instruction_hash?: string;
  request_token?: string;
  run_id?: string;
};

export type IssuedInstruction = {
  nonce: string;
  hash: string;
  requestToken: string;
  runID: string;
};

const allowedReceiptFields = new Set([
  "schema_version",
  "slug",
  "disposition",
  "evidence_refs",
  "policy",
  "rationale",
  "owner",
  "expiry",
  "approval",
  "residual_risk",
  "instruction_nonce",
  "instruction_hash",
  "request_token",
  "run_id",
]);

const allowedDispositions = new Set(["completed", "not_applicable", "waived"]);

function fencedJsonBlocks(text: string): string[] {
  const lines = text.split("\n");
  const blocks: string[] = [];
  let inFence = false;
  let current: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!inFence) {
      if (trimmed === "```json") {
        inFence = true;
        current = [];
      }
      continue;
    }
    if (trimmed.startsWith("```")) {
      blocks.push(current.join("\n"));
      inFence = false;
      current = [];
      continue;
    }
    current.push(line);
  }
  return blocks;
}

function nonEmptyEvidenceRefs(refs: TrackerEvidenceRef[] | undefined): boolean {
  if (!refs || refs.length === 0) {
    return false;
  }
  for (const ref of refs) {
    if (typeof ref === "string" && ref.trim() !== "") {
      return true;
    }
    if (typeof ref === "object" && ref !== null && Object.keys(ref).length > 0) {
      return true;
    }
  }
  return false;
}

function rejectUnknownReceiptFields(body: Record<string, unknown>): void {
  for (const key of Object.keys(body)) {
    if (!allowedReceiptFields.has(key)) {
      throw new Error(`unknown_field: ${JSON.stringify(key)}`);
    }
  }
}

export function validateCompletionReceipt(
  receipt: TrackerCompletionReceipt,
  expectedSlug: string,
): void {
  if (receipt.schema_version !== TRACKER_RECEIPT_SCHEMA_VERSION) {
    throw new Error(
      `unsupported_schema: schema_version must be ${TRACKER_RECEIPT_SCHEMA_VERSION}`,
    );
  }
  const slug = String(receipt.slug ?? "").trim();
  if (slug === "") {
    throw new Error("malformed_receipt: slug required");
  }
  if (slug !== String(expectedSlug).trim()) {
    throw new Error(
      `wrong_slug: receipt slug ${JSON.stringify(slug)} does not match expected ${JSON.stringify(expectedSlug)}`,
    );
  }
  const disp = String(receipt.disposition ?? "").trim();
  if (disp === "skipped") {
    throw new Error("skipped_disposition_rejected");
  }
  if (!allowedDispositions.has(disp)) {
    throw new Error(`invalid_disposition: ${JSON.stringify(disp)}`);
  }
  switch (disp) {
    case "completed":
      if (!nonEmptyEvidenceRefs(receipt.evidence_refs)) {
        throw new Error(
          "missing_disposition_evidence: completed requires evidence_refs",
        );
      }
      break;
    case "not_applicable":
      if (
        String(receipt.policy ?? "").trim() === "" ||
        String(receipt.rationale ?? "").trim() === ""
      ) {
        throw new Error(
          "missing_disposition_evidence: not_applicable requires policy and rationale",
        );
      }
      break;
    case "waived":
      for (const field of [
        "owner",
        "expiry",
        "approval",
        "residual_risk",
      ] as const) {
        if (String(receipt[field] ?? "").trim() === "") {
          throw new Error(
            `missing_disposition_evidence: waived requires ${field}`,
          );
        }
      }
      break;
    default:
      break;
  }
}

export function parseTrackerCompletionReceipt(
  transcript: string,
  expectedSlug: string,
): { receipt: TrackerCompletionReceipt; ok: true } | { ok: false; error: Error } {
  const blocks = fencedJsonBlocks(transcript);
  for (let i = blocks.length - 1; i >= 0; i--) {
    const block = blocks[i]!;
    let raw: Record<string, unknown>;
    try {
      raw = JSON.parse(block) as Record<string, unknown>;
    } catch (err) {
      if (block.includes("agentstream_tracker")) {
        return { ok: false, error: new Error(`malformed_receipt: ${String(err)}`) };
      }
      continue;
    }
    if (!Object.prototype.hasOwnProperty.call(raw, "agentstream_tracker")) {
      continue;
    }
    const body = raw.agentstream_tracker;
    if (body === null || typeof body !== "object" || Array.isArray(body)) {
      return { ok: false, error: new Error("malformed_receipt") };
    }
    try {
      rejectUnknownReceiptFields(body as Record<string, unknown>);
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err : new Error(String(err)) };
    }
    const receipt = body as TrackerCompletionReceipt;
    try {
      validateCompletionReceipt(receipt, expectedSlug);
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err : new Error(String(err)) };
    }
    return { receipt, ok: true };
  }
  return { ok: false, error: new Error("missing_receipt") };
}

export function validateReceiptBinding(
  receipt: TrackerCompletionReceipt,
  issued: IssuedInstruction,
): void {
  if (
    String(receipt.instruction_nonce ?? "").trim() === "" ||
    String(receipt.instruction_hash ?? "").trim() === ""
  ) {
    throw new Error("missing_binding_fields");
  }
  if (
    String(receipt.instruction_nonce ?? "").trim() !== issued.nonce.trim()
  ) {
    throw new Error("stale_instruction_nonce");
  }
  if (String(receipt.instruction_hash ?? "").trim() !== issued.hash.trim()) {
    throw new Error("instruction_hash_mismatch");
  }
  if (
    String(receipt.request_token ?? "").trim() !== issued.requestToken.trim()
  ) {
    throw new Error("request_token_mismatch");
  }
  if (String(receipt.run_id ?? "").trim() !== issued.runID.trim()) {
    throw new Error("run_id_mismatch");
  }
}

export function receiptHash(receipt: TrackerCompletionReceipt): string {
  const body = JSON.stringify(receipt);
  return createHash("sha256").update(body).digest("hex");
}

/** Map receipt to adherence-evidence-resolve CompletionReceipt shape. */
export function receiptForEvidenceResolve(
  receipt: TrackerCompletionReceipt,
): { slug: string; disposition: string; evidenceRefs: (string | Record<string, unknown>)[] } {
  return {
    slug: receipt.slug,
    disposition: receipt.disposition,
    evidenceRefs: receipt.evidence_refs ?? [],
  };
}
