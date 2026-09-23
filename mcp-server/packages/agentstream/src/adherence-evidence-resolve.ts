/**
 * [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
 * Evidence ref resolution for reconcile completed_with_unresolved_evidence (Go oracle parity).
 */
import fs from "node:fs";
import path from "node:path";

import yaml from "js-yaml";

import { fileContentHash } from "./adherence-stable-hash.js";

const verificationEvidenceManifestSchema = "verification-evidence-manifest.v1";
const envelopeSchemaVersion = "request-evidence-envelope.v1";
const gateReceiptSchemaVersion = "checklist-gate-receipt.v1";

const genericProseDenylist = ["tests passed", "build ok", "done", "success"];

export type EvidenceRefInput = string | Record<string, unknown>;

export type CompletionReceipt = {
  slug: string;
  disposition: string;
  evidenceRefs: EvidenceRefInput[];
};

export type ResolvedRef = {
  ref: string;
  kind: string;
  artifactRef: string;
  artifactHash: string;
};

function isGenericProse(ref: string): boolean {
  const lower = ref.trim().toLowerCase();
  for (const phrase of genericProseDenylist) {
    if (lower === phrase) return true;
  }
  if (!ref.includes("/") && !ref.includes(".")) return true;
  return false;
}

function schemaVersionFromJSON(data: Buffer): string {
  try {
    const doc = JSON.parse(data.toString("utf8")) as Record<string, unknown>;
    const sv = doc.schema_version;
    return typeof sv === "string" ? sv.trim() : "";
  } catch {
    return "";
  }
}

function schemaVersion(doc: Record<string, unknown> | null): string {
  if (!doc) return "";
  const sv = doc.schema_version;
  return typeof sv === "string" ? sv.trim() : "";
}

function parseVerificationManifest(data: Buffer): Record<string, unknown> | null {
  try {
    const doc = JSON.parse(data.toString("utf8")) as Record<string, unknown>;
    if (schemaVersion(doc) === verificationEvidenceManifestSchema) return doc;
  } catch {
    /* yaml fallback */
  }
  try {
    const doc = yaml.load(data.toString("utf8")) as Record<string, unknown>;
    if (schemaVersion(doc) === verificationEvidenceManifestSchema) return doc;
  } catch {
    return null;
  }
  return null;
}

function validateManifestExitCodes(doc: Record<string, unknown>): void {
  const results = doc.command_results;
  if (!Array.isArray(results) || results.length === 0) {
    throw new Error("manifest_exit_nonzero: missing command_results");
  }
  for (const item of results) {
    if (typeof item !== "object" || item === null) {
      throw new Error("manifest_exit_nonzero: malformed command_results row");
    }
    const row = item as Record<string, unknown>;
    const code = row.exit_code;
    if (typeof code === "number" && code !== 0) {
      throw new Error(`manifest_exit_nonzero: command ${String(row.id)} exit_code=${code}`);
    }
    if (code === undefined) {
      throw new Error("manifest_exit_nonzero: missing exit_code");
    }
  }
}

function stringField(doc: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const v = doc[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

function tryParseCommandEvidence(ref: string): Record<string, unknown> | null {
  let trimmed = ref.trim();
  if (trimmed.startsWith("command_evidence:")) {
    trimmed = trimmed.slice("command_evidence:".length).trim();
  }
  if (!trimmed.startsWith("{")) return null;
  try {
    return JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function requireSchemaVersion(ref: string, workspace: string, expected: string): void {
  const absPath = path.isAbsolute(ref) ? ref : path.join(workspace, ref);
  const data = fs.readFileSync(path.normalize(absPath));
  if (schemaVersionFromJSON(data) !== expected) {
    throw new Error(`unresolved_evidence_ref: ${JSON.stringify(ref)} schema_version must be ${expected}`);
  }
}

async function resolveOneEvidenceRef(ref: string, workspace: string): Promise<ResolvedRef> {
  if (!ref) throw new Error("unresolved_evidence_ref: empty ref");
  const cmdDoc = tryParseCommandEvidence(ref);
  if (cmdDoc) return resolveCommandEvidenceRef(ref, cmdDoc, workspace);
  if (isGenericProse(ref)) {
    throw new Error(`unresolved_evidence_ref: generic prose ${JSON.stringify(ref)}`);
  }
  let absPath = ref;
  if (!path.isAbsolute(ref)) absPath = path.join(workspace, ref);
  absPath = path.normalize(absPath);
  const rel = path.relative(workspace, absPath);
  if (rel.startsWith("..")) {
    throw new Error(`unresolved_evidence_ref: path outside workspace ${JSON.stringify(ref)}`);
  }
  let data: Buffer;
  try {
    data = fs.readFileSync(absPath);
  } catch (err) {
    throw new Error(`missing_artifact: ${JSON.stringify(ref)}`);
  }
  const hash = fileContentHash(data);
  const manifestDoc = parseVerificationManifest(data);
  if (manifestDoc) {
    validateManifestExitCodes(manifestDoc);
    return { ref, kind: "manifest_ref", artifactRef: ref, artifactHash: hash };
  }
  const sv = schemaVersionFromJSON(data);
  if (sv === gateReceiptSchemaVersion) {
    return { ref, kind: "gate_receipt", artifactRef: ref, artifactHash: hash };
  }
  if (sv === envelopeSchemaVersion) {
    return { ref, kind: "envelope_ref", artifactRef: ref, artifactHash: hash };
  }
  return { ref, kind: "file_path", artifactRef: ref, artifactHash: hash };
}

async function resolveCommandEvidenceRef(
  ref: string,
  doc: Record<string, unknown>,
  workspace: string,
): Promise<ResolvedRef> {
  const claimed = doc.claimed_success;
  if (claimed !== true) {
    return {
      ref,
      kind: "command_evidence",
      artifactRef: ref,
      artifactHash: fileContentHash(ref),
    };
  }
  const manifestRef = stringField(doc, "manifest_ref", "manifest_reference");
  if (!manifestRef) throw new Error("command_success_unproven: missing manifest_ref");
  const outputRef = stringField(doc, "stdout_ref", "stderr_ref", "output_path");
  if (!outputRef) throw new Error("command_success_unproven: missing output ref");
  if (doc.exit_code === undefined) throw new Error("command_success_unproven: missing exit_code");
  const manifestResolved = await resolveOneEvidenceRef(manifestRef, workspace);
  if (manifestResolved.kind !== "manifest_ref") {
    throw new Error(`command_success_unproven: manifest_ref ${JSON.stringify(manifestRef)} is not a valid manifest`);
  }
  const outputResolved = await resolveOneEvidenceRef(outputRef, workspace);
  if (outputResolved.kind !== "file_path") {
    throw new Error(`command_success_unproven: output ref ${JSON.stringify(outputRef)} is not a readable file`);
  }
  const combined = `${manifestResolved.artifactHash}|${outputResolved.artifactHash}`;
  return {
    ref,
    kind: "command_evidence",
    artifactRef: manifestRef,
    artifactHash: fileContentHash(combined),
  };
}

function evidenceRefResolutionInput(ref: EvidenceRefInput): {
  text: string;
  doc: Record<string, unknown> | null;
} {
  if (typeof ref === "string") {
    return { text: ref, doc: null };
  }
  const kind = typeof ref.kind === "string" ? ref.kind.trim() : "";
  if (kind === "command_evidence" || ref.claimed_success !== undefined) {
    return { text: JSON.stringify(ref), doc: ref };
  }
  const p = typeof ref.path === "string" ? ref.path.trim() : "";
  if (!p) throw new Error("unresolved_evidence_ref: typed ref missing path");
  return { text: p, doc: ref };
}

async function resolveOneEvidenceRefEntry(
  ref: EvidenceRefInput,
  workspace: string,
): Promise<ResolvedRef> {
  const { text, doc } = evidenceRefResolutionInput(ref);
  if (doc) {
    const kind = typeof doc.kind === "string" ? doc.kind.trim() : "";
    if (kind === "command_evidence" || doc.claimed_success !== undefined) {
      return resolveCommandEvidenceRef(text, doc, workspace);
    }
    if (kind) {
      const resolved = await resolveOneEvidenceRef(text, workspace);
      switch (kind) {
        case "manifest_ref":
          if (resolved.kind !== "manifest_ref") {
            throw new Error(`unresolved_evidence_ref: manifest_ref ${JSON.stringify(text)} is not a valid manifest`);
          }
          return { ...resolved, kind: "manifest_ref" };
        case "gate_receipt":
          requireSchemaVersion(text, workspace, gateReceiptSchemaVersion);
          return { ...resolved, kind: "gate_receipt" };
        case "envelope_ref":
          requireSchemaVersion(text, workspace, envelopeSchemaVersion);
          return { ...resolved, kind: "envelope_ref" };
        case "file_path":
          if (resolved.kind !== "file_path" && resolved.kind !== "manifest_ref") {
            throw new Error(`unresolved_evidence_ref: file_path ${JSON.stringify(text)} is not readable`);
          }
          return { ...resolved, kind: "file_path" };
        default:
          throw new Error(`unresolved_evidence_ref: unknown kind ${JSON.stringify(kind)}`);
      }
    }
  }
  return resolveOneEvidenceRef(text, workspace);
}

export function evidenceRefsFromTrackerStep(step: Record<string, unknown>): EvidenceRefInput[] {
  const raw = step.evidence_refs;
  if (!Array.isArray(raw)) return [];
  const out: EvidenceRefInput[] = [];
  for (const item of raw) {
    if (typeof item === "string" && item.trim()) out.push(item.trim());
    else if (typeof item === "object" && item !== null) {
      out.push(item as Record<string, unknown>);
    }
  }
  return out;
}

export async function resolveEvidenceRefs(
  receipt: CompletionReceipt,
  workspace: string,
): Promise<ResolvedRef[]> {
  if (receipt.disposition.trim() !== "completed") {
    throw new Error(`evidence_resolution_skipped: disposition ${JSON.stringify(receipt.disposition)}`);
  }
  if (receipt.evidenceRefs.length === 0) {
    throw new Error("missing_disposition_evidence: completed requires evidence_refs");
  }
  const ws = path.normalize(workspace);
  const resolved: ResolvedRef[] = [];
  for (const ref of receipt.evidenceRefs) {
    resolved.push(await resolveOneEvidenceRefEntry(ref, ws));
  }
  return resolved;
}

/** Sync wrapper for reconcile (no async I/O beyond fs sync already used). */
export function resolveEvidenceRefsSync(
  receipt: CompletionReceipt,
  workspace: string,
): ResolvedRef[] {
  if (receipt.disposition.trim() !== "completed") {
    throw new Error(`evidence_resolution_skipped: disposition ${JSON.stringify(receipt.disposition)}`);
  }
  if (receipt.evidenceRefs.length === 0) {
    throw new Error("missing_disposition_evidence: completed requires evidence_refs");
  }
  const ws = path.normalize(workspace);
  const resolved: ResolvedRef[] = [];
  for (const ref of receipt.evidenceRefs) {
    const { text, doc } = evidenceRefResolutionInput(ref);
    if (doc) {
      const kind = typeof doc.kind === "string" ? doc.kind.trim() : "";
      if (kind === "command_evidence" || doc.claimed_success !== undefined) {
        // sync command evidence — use blocking read paths inline
        const claimed = doc.claimed_success;
        if (claimed !== true) {
          resolved.push({
            ref: text,
            kind: "command_evidence",
            artifactRef: text,
            artifactHash: fileContentHash(text),
          });
          continue;
        }
      }
    }
    // Fall back to sync file path resolution
    let absPath = text;
    if (!path.isAbsolute(text)) absPath = path.join(ws, text);
    absPath = path.normalize(absPath);
    const rel = path.relative(ws, absPath);
    if (rel.startsWith("..")) {
      throw new Error(`unresolved_evidence_ref: path outside workspace ${JSON.stringify(text)}`);
    }
    let data: Buffer;
    try {
      data = fs.readFileSync(absPath);
    } catch {
      throw new Error(`missing_artifact: ${JSON.stringify(text)}`);
    }
    const hash = fileContentHash(data);
    const manifestDoc = parseVerificationManifest(data);
    if (manifestDoc) {
      validateManifestExitCodes(manifestDoc);
      resolved.push({ ref: text, kind: "manifest_ref", artifactRef: text, artifactHash: hash });
      continue;
    }
    const sv = schemaVersionFromJSON(data);
    if (sv === gateReceiptSchemaVersion) {
      resolved.push({ ref: text, kind: "gate_receipt", artifactRef: text, artifactHash: hash });
      continue;
    }
    if (sv === envelopeSchemaVersion) {
      resolved.push({ ref: text, kind: "envelope_ref", artifactRef: text, artifactHash: hash });
      continue;
    }
    resolved.push({ ref: text, kind: "file_path", artifactRef: text, artifactHash: hash });
  }
  return resolved;
}
