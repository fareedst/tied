/**
 * [IMPL-REQUEST_EVIDENCE_ENVELOPE] [ARCH-REQUEST_EVIDENCE_ENVELOPE] [REQ-REQUEST_EVIDENCE_ENVELOPE]
 * [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] Wave 5 process-adherence gap detection (W5-D1–D3).
 */

import { promises as fs } from "node:fs";
import path from "node:path";

import type { EnvelopeArtifact, EnvelopeGap, GatePhase } from "./types.js";

const NON_PENDING_DISPOSITIONS = new Set(["completed", "not_applicable", "waived"]);

export const PROCESS_ADHERENCE_GAP_CODES = [
  "tracker_dual_write",
  "tracker_sparse",
  "thin_ledger",
] as const;

/** Gap codes that default to warn severity at minimal depth unless fail_on_process_gaps is true. */
export const PROCESS_WARN_GAP_CODES = new Set<string>([
  "tracker_dual_write",
  "tracker_sparse",
  "expected_artifact_missing",
  "evidence_stale",
  "thin_ledger",
]);

const MANIFEST_TRIGGER_SLUGS = new Set([
  "verification-gate",
  "unit-test-green",
  "unit-test-red",
  "composition-integration",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(record: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

function trackerSteps(tracker: Record<string, unknown>): Record<string, unknown>[] {
  const steps = tracker.steps;
  if (Array.isArray(steps)) {
    return steps.filter(isRecord);
  }
  if (isRecord(steps)) {
    return Object.entries(steps).map(([slug, value]) => ({
      ...(isRecord(value) ? value : {}),
      slug,
    }));
  }
  return [];
}

function stepDisposition(step: Record<string, unknown>): string | undefined {
  const tracking = isRecord(step.tracking) ? step.tracking : undefined;
  return getString(step, "disposition", "status")
    ?? (tracking ? getString(tracking, "disposition", "status") : undefined);
}

function stepSlug(step: Record<string, unknown>): string | undefined {
  return getString(step, "slug", "id");
}

export function extractCompletedSlugs(tracker: Record<string, unknown>): string[] {
  const executionEvidence = isRecord(tracker.execution_evidence) ? tracker.execution_evidence : null;
  const completed = executionEvidence?.completed;
  if (!Array.isArray(completed)) return [];
  return completed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

export function hasNonPendingDisposition(tracker: Record<string, unknown>, slug: string): boolean {
  for (const step of trackerSteps(tracker)) {
    if (stepSlug(step) !== slug) continue;
    const disposition = stepDisposition(step);
    return disposition != null && NON_PENDING_DISPOSITIONS.has(disposition);
  }
  return false;
}

function processGap(
  code: string,
  detail: string,
  options: Partial<EnvelopeGap> = {},
): EnvelopeGap {
  return {
    code,
    artifact_kind: options.artifact_kind ?? null,
    phase: options.phase ?? null,
    detail,
    severity: options.severity ?? "warn",
    source: options.source ?? "process-adherence",
  };
}

/** W5-D1: dual-write when execution_evidence.completed lacks matching step dispositions. */
export function detectDualWriteGaps(tracker: Record<string, unknown>): EnvelopeGap[] {
  const gaps: EnvelopeGap[] = [];
  const completed = extractCompletedSlugs(tracker);
  const dualWriteSlugs: string[] = [];

  for (const slug of completed) {
    if (!hasNonPendingDisposition(tracker, slug)) {
      dualWriteSlugs.push(slug);
    }
  }

  if (dualWriteSlugs.length > 0) {
    gaps.push(
      processGap(
        "tracker_dual_write",
        `execution_evidence.completed slugs without matching non-pending step dispositions: ${dualWriteSlugs.join(", ")}`,
        { source: "dual-write-detector" },
      ),
    );
  }

  if (completed.length > 0 && dualWriteSlugs.length === completed.length) {
    gaps.push(
      processGap(
        "tracker_sparse",
        "All execution_evidence.completed slugs lack authoritative step dispositions",
        { source: "dual-write-detector" },
      ),
    );
  }

  return gaps;
}

/** W5-D2: expect verification manifest when test/verification slugs are completed. */
export function detectManifestExpectationGaps(
  tracker: Record<string, unknown>,
  artifacts: EnvelopeArtifact[],
): EnvelopeGap[] {
  const completed = extractCompletedSlugs(tracker);
  const needsManifest = completed.some((slug) => MANIFEST_TRIGGER_SLUGS.has(slug));
  if (!needsManifest) return [];

  const hasManifest = artifacts.some((artifact) => artifact.kind === "verification_evidence_manifest");
  const hasNaReceipt = artifacts.some((artifact) => artifact.kind === "not_applicable_receipt");
  if (hasManifest || hasNaReceipt) return [];

  return [
    processGap(
      "expected_artifact_missing",
      "Completed verification/test slugs require verification-evidence-manifest.v1.json or not-applicable receipt",
      { artifact_kind: "verification_evidence_manifest", source: "manifest-expectation" },
    ),
  ];
}

type GateReceiptSummary = {
  path: string;
  trackerHash: string | null;
  timestamp: string | null;
};

async function readGateReceiptSummaries(
  projectRoot: string,
  requestToken: string,
): Promise<GateReceiptSummary[]> {
  const gatesDir = path.join(projectRoot, "working", requestToken, "gates");
  let names: string[] = [];
  try {
    names = (await fs.readdir(gatesDir)).filter((name) => name.endsWith(".json"));
  } catch {
    return [];
  }

  const summaries: GateReceiptSummary[] = [];
  for (const name of names) {
    const absolute = path.join(gatesDir, name);
    const contents = await fs.readFile(absolute, "utf8");
    try {
      const doc = JSON.parse(contents) as Record<string, unknown>;
      const inputHashes = isRecord(doc.input_hashes) ? doc.input_hashes : null;
      const trackerHash = inputHashes && typeof inputHashes.tracker_hash === "string"
        ? inputHashes.tracker_hash
        : null;
      const timestamp = typeof doc.timestamp === "string" ? doc.timestamp : name;
      summaries.push({ path: absolute, trackerHash, timestamp });
    } catch {
      continue;
    }
  }
  summaries.sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)));
  return summaries;
}

/** W5-D3: envelope tracker hash vs latest gate receipt tracker_hash drift. */
export async function detectGateHashDriftGaps(
  projectRoot: string,
  requestToken: string,
  currentTrackerHash: string | null,
): Promise<EnvelopeGap[]> {
  if (!currentTrackerHash) return [];
  const receipts = await readGateReceiptSummaries(projectRoot, requestToken);
  if (receipts.length === 0) return [];

  const latest = receipts[receipts.length - 1]!;
  if (!latest.trackerHash || latest.trackerHash === currentTrackerHash) return [];

  return [
    processGap(
      "evidence_stale",
      `Envelope tracker_hash ${currentTrackerHash} differs from latest gate receipt ${latest.trackerHash} (${path.basename(latest.path)})`,
      { artifact_kind: "checklist_gate_receipt", source: "gate-hash-drift" },
    ),
  ];
}

async function readOptional(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }
}

/** Thin ledger: completed slugs without outcome_verified rows (warn-level process gap). */
export async function detectThinLedgerGaps(
  projectRoot: string,
  requestToken: string,
  tracker: Record<string, unknown>,
): Promise<EnvelopeGap[]> {
  const completed = extractCompletedSlugs(tracker);
  if (completed.length === 0) return [];

  const ledgerCandidates = [
    path.join(projectRoot, "working", requestToken, "gates", "ledger.jsonl"),
    path.join(projectRoot, "working", requestToken, "adherence", "events.jsonl"),
  ];
  let ledgerContents: string | null = null;
  for (const candidate of ledgerCandidates) {
    ledgerContents = await readOptional(candidate);
    if (ledgerContents) break;
  }
  if (!ledgerContents) {
    return [
      processGap("thin_ledger", "No adherence ledger with outcome_verified rows for completed slugs", {
        source: "ledger-correlation",
      }),
    ];
  }

  const verifiedSlugs = new Set<string>();
  for (const line of ledgerContents.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const row = JSON.parse(trimmed) as Record<string, unknown>;
      if (row.event_class !== "outcome_verified") continue;
      const correlation = isRecord(row.correlation) ? row.correlation : null;
      const slug = correlation ? getString(correlation, "step_slug") : undefined;
      if (slug) verifiedSlugs.add(slug);
    } catch {
      continue;
    }
  }

  const missing = completed.filter((slug) => !verifiedSlugs.has(slug));
  if (missing.length === 0) return [];

  return [
    processGap(
      "thin_ledger",
      `Completed slugs without outcome_verified ledger rows: ${missing.join(", ")}`,
      { source: "ledger-correlation" },
    ),
  ];
}

export type DetectProcessAdherenceInput = {
  projectRoot: string;
  requestToken: string;
  tracker: Record<string, unknown> | null;
  artifacts: EnvelopeArtifact[];
  currentTrackerHash: string | null;
  depthTier: string;
};

/** Aggregate Wave 5 process-adherence gaps (warn by default at minimal depth). */
export async function detectProcessAdherenceGaps(
  input: DetectProcessAdherenceInput,
): Promise<EnvelopeGap[]> {
  if (!input.tracker) return [];
  const gaps: EnvelopeGap[] = [
    ...detectDualWriteGaps(input.tracker),
    ...detectManifestExpectationGaps(input.tracker, input.artifacts),
    ...(await detectGateHashDriftGaps(input.projectRoot, input.requestToken, input.currentTrackerHash)),
    ...(await detectThinLedgerGaps(input.projectRoot, input.requestToken, input.tracker)),
  ];

  return gaps.map((gap) => ({
    ...gap,
    severity: gap.severity ?? "warn",
    phase: gap.phase as GatePhase | null,
  }));
}
