/**
 * [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
 * Tracker disposition apply + loop-back invalidation (Go checklist/tracker_writer.go parity).
 */
import fs from "node:fs";
import path from "node:path";

import yaml from "js-yaml";

import { findRepoRootFromPath } from "./repo-root.js";
import { atomicWriteYaml } from "./tracker-atomic-write.js";
import type { TrackerCompletionReceipt } from "./tracker-receipt.js";
import { loadTrackerYaml, type TrackerDoc } from "./tracker-yaml.js";

export type TurnIdentity = {
  turnIndex: number;
  stepStub: string;
  sessionId: string;
};

export function turnIdentityString(id: TurnIdentity): string {
  return `turn=${id.turnIndex}:stub=${id.stepStub.trim()}:session=${id.sessionId.trim()}`;
}

type LoopBackDoc = {
  loop_back_clearance?: Record<string, { clear_slugs?: string[] }>;
};

function clearStepEvidence(row: Record<string, unknown>): void {
  for (const key of [
    "evidence_refs",
    "policy",
    "rationale",
    "owner",
    "expiry",
    "approval",
    "residual_risk",
    "gate_receipt",
    "gate_summary",
  ]) {
    delete row[key];
  }
}

function evidenceRefsToInterface(
  refs: TrackerCompletionReceipt["evidence_refs"],
): unknown[] {
  if (!refs) {
    return [];
  }
  return [...refs];
}

function deriveCompletedSlugs(steps: unknown[]): unknown[] {
  const out: unknown[] = [];
  for (const item of steps) {
    if (item === null || typeof item !== "object" || Array.isArray(item)) {
      continue;
    }
    const row = item as Record<string, unknown>;
    if (String(row.disposition ?? "") !== "completed") {
      continue;
    }
    const slug = String(row.slug ?? "").trim();
    if (slug !== "") {
      out.push(slug);
    }
  }
  return out;
}

function findStateHistoryReplay(
  tracker: TrackerDoc,
  turnIdentity: string,
  receiptHash: string,
): { found: boolean; idempotent: boolean } {
  const history = tracker.state_history;
  if (!Array.isArray(history)) {
    return { found: false, idempotent: false };
  }
  for (const item of history) {
    if (item === null || typeof item !== "object" || Array.isArray(item)) {
      continue;
    }
    const row = item as Record<string, unknown>;
    if (String(row.turn_identity ?? "") !== turnIdentity) {
      continue;
    }
    return {
      found: true,
      idempotent: String(row.receipt_hash ?? "") === receiptHash,
    };
  }
  return { found: false, idempotent: false };
}

function appendStateHistory(
  tracker: Record<string, unknown>,
  turnIdentity: string,
  hash: string,
): void {
  const entry = {
    turn_identity: turnIdentity,
    receipt_hash: hash,
    updated_at: new Date().toISOString(),
  };
  const history = Array.isArray(tracker.state_history)
    ? [...tracker.state_history]
    : [];
  history.push(entry);
  tracker.state_history = history;
}

function applyReceiptToRow(
  row: Record<string, unknown>,
  receipt: TrackerCompletionReceipt,
): void {
  clearStepEvidence(row);
  row.disposition = receipt.disposition;
  row.updated_at = new Date().toISOString();
  switch (receipt.disposition) {
    case "completed":
      row.evidence_refs = evidenceRefsToInterface(receipt.evidence_refs);
      break;
    case "not_applicable":
      row.policy = receipt.policy;
      row.rationale = receipt.rationale;
      break;
    case "waived":
      row.owner = receipt.owner;
      row.expiry = receipt.expiry;
      row.approval = receipt.approval;
      row.residual_risk = receipt.residual_risk;
      break;
    default:
      break;
  }
}

function loadChecklistSlugsFromFile(checklistPath: string): Set<string> {
  const raw = fs.readFileSync(checklistPath, "utf8");
  const doc = yaml.load(raw) as {
    steps?: { slug?: string }[];
    sub_procedures?: { slug?: string }[];
  };
  const out = new Set<string>();
  for (const step of doc.steps ?? []) {
    const slug = String(step.slug ?? "").trim();
    if (slug !== "") {
      out.add(slug);
    }
  }
  for (const sub of doc.sub_procedures ?? []) {
    const slug = String(sub.slug ?? "").trim();
    if (slug !== "") {
      out.add(slug);
    }
  }
  return out;
}

let cachedCanonicalRoot = "";
let cachedCanonicalSlugs: Set<string> | null = null;

function slugRegistryForTracker(trackerPath: string): Set<string> {
  try {
    const tracker = loadTrackerYaml(trackerPath);
    const src = String(tracker.source_document ?? "").trim();
    if (src !== "") {
      const slugs = loadChecklistSlugsFromFile(src);
      if (slugs.size > 0) {
        return slugs;
      }
    }
  } catch {
    /* fall through */
  }
  const repoRoot = findRepoRootFromPath(trackerPath);
  if (repoRoot === "") {
    throw new Error("registry_unavailable");
  }
  if (cachedCanonicalSlugs !== null && cachedCanonicalRoot === repoRoot) {
    return cachedCanonicalSlugs;
  }
  const checklistPath = path.join(
    repoRoot,
    "tied",
    "docs",
    "agent-req-implementation-checklist.yaml",
  );
  const slugs = loadChecklistSlugsFromFile(checklistPath);
  cachedCanonicalRoot = repoRoot;
  cachedCanonicalSlugs = slugs;
  return slugs;
}

export function validateCanonicalSlug(trackerPath: string, slug: string): void {
  const s = slug.trim();
  if (s === "") {
    throw new Error("invalid_slug:empty");
  }
  let slugs: Set<string>;
  try {
    slugs = slugRegistryForTracker(trackerPath);
  } catch {
    throw new Error("invalid_slug:registry_unavailable");
  }
  if (!slugs.has(s)) {
    throw new Error(`invalid_slug:${s}`);
  }
}

export function applyTrackerDisposition(
  trackerPath: string,
  receipt: TrackerCompletionReceipt,
  identity: TurnIdentity,
  receiptHashHex: string,
): void {
  validateCanonicalSlug(trackerPath, receipt.slug);
  const tracker = loadTrackerYaml(trackerPath) as Record<string, unknown>;
  const turnId = turnIdentityString(identity);
  const replay = findStateHistoryReplay(
    tracker as TrackerDoc,
    turnId,
    receiptHashHex,
  );
  if (replay.found) {
    if (replay.idempotent) {
      return;
    }
    throw new Error("conflicting_replay");
  }
  const stepsRaw = tracker.steps;
  if (!Array.isArray(stepsRaw)) {
    throw new Error("malformed_tracker: missing steps");
  }
  let updated = false;
  for (let i = 0; i < stepsRaw.length; i++) {
    const item = stepsRaw[i];
    if (item === null || typeof item !== "object" || Array.isArray(item)) {
      continue;
    }
    const row = item as Record<string, unknown>;
    if (String(row.slug ?? "").trim() !== String(receipt.slug).trim()) {
      continue;
    }
    applyReceiptToRow(row, receipt);
    stepsRaw[i] = row;
    updated = true;
    break;
  }
  if (!updated) {
    throw new Error(`step_not_found: ${JSON.stringify(receipt.slug)}`);
  }
  tracker.steps = stepsRaw;
  const ee =
    tracker.execution_evidence !== null &&
    typeof tracker.execution_evidence === "object" &&
    !Array.isArray(tracker.execution_evidence)
      ? (tracker.execution_evidence as Record<string, unknown>)
      : {};
  ee.completed = deriveCompletedSlugs(stepsRaw);
  tracker.execution_evidence = ee;
  appendStateHistory(tracker, turnId, receiptHashHex);
  atomicWriteYaml(trackerPath, tracker);
}

function clearCloseOutGateSummaries(
  ee: Record<string, unknown>,
  slugs: string[],
): void {
  const closeOut = ee.close_out_evidence;
  if (closeOut === null || typeof closeOut !== "object" || Array.isArray(closeOut)) {
    return;
  }
  const gates = (closeOut as Record<string, unknown>).gates;
  if (gates === null || typeof gates !== "object" || Array.isArray(gates)) {
    return;
  }
  const gateMap = gates as Record<string, unknown>;
  for (const slug of slugs) {
    delete gateMap[slug];
  }
}

export function invalidateTrackerDownstream(
  trackerPath: string,
  definitionPath: string,
  gotoTarget: string,
): string[] {
  const data = fs.readFileSync(definitionPath, "utf8");
  const doc = yaml.load(data) as LoopBackDoc;
  const lb = doc.loop_back_clearance?.[gotoTarget.trim()];
  if (!lb?.clear_slugs || lb.clear_slugs.length === 0) {
    throw new Error(`missing_clear_target: ${JSON.stringify(gotoTarget)}`);
  }
  const tracker = loadTrackerYaml(trackerPath) as Record<string, unknown>;
  const stepsRaw = tracker.steps;
  if (!Array.isArray(stepsRaw)) {
    throw new Error("malformed_tracker: missing steps");
  }
  const indexBySlug = new Map<string, number>();
  for (let i = 0; i < stepsRaw.length; i++) {
    const item = stepsRaw[i];
    if (item === null || typeof item !== "object" || Array.isArray(item)) {
      continue;
    }
    const slug = String((item as Record<string, unknown>).slug ?? "").trim();
    if (slug !== "") {
      indexBySlug.set(slug, i);
    }
  }
  for (const slug of lb.clear_slugs) {
    const s = slug.trim();
    const idx = indexBySlug.get(s);
    if (idx === undefined) {
      throw new Error(`missing_state_row: ${JSON.stringify(s)}`);
    }
    const row = stepsRaw[idx] as Record<string, unknown>;
    clearStepEvidence(row);
    row.disposition = "pending";
    delete row.updated_at;
    stepsRaw[idx] = row;
  }
  tracker.steps = stepsRaw;
  const ee =
    tracker.execution_evidence !== null &&
    typeof tracker.execution_evidence === "object" &&
    !Array.isArray(tracker.execution_evidence)
      ? (tracker.execution_evidence as Record<string, unknown>)
      : undefined;
  if (ee) {
    ee.completed = deriveCompletedSlugs(stepsRaw);
    clearCloseOutGateSummaries(ee, lb.clear_slugs);
  }
  atomicWriteYaml(trackerPath, tracker);
  return [...lb.clear_slugs];
}
