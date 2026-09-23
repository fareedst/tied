/**
 * [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] Process grade extension for reconcile (Go parity).
 */
import fs from "node:fs";
import path from "node:path";

import type { ReconcileInput, ReconcileReport } from "./adherence-reconcile.js";
import { loadTracker, trackerRequestToken, trackerStepsFromMap, stepDisposition } from "./adherence-reconcile.js";

export type ProcessGradeDimension = {
  name: string;
  score: number;
  weight: number;
  gap_codes?: string[];
};

export type ProcessGrade = {
  score: number;
  band: string;
  dimensions: ProcessGradeDimension[];
  gap_codes: string[];
};

const findingGateWithoutCurrentEvidence = "gate_without_current_evidence";
const findingLegacyNoAdherenceChain = "legacy_no_adherence_chain";
const findingAttemptWithoutVerified = "attempt_without_verified_outcome";
const findingCompletedWithUnresolved = "completed_with_unresolved_evidence";

function processGradeBand(score: number): string {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  return "D";
}

function completedSlugs(tracker: Record<string, unknown>): string[] {
  const ee = tracker.execution_evidence;
  if (typeof ee !== "object" || ee === null) return [];
  const raw = (ee as Record<string, unknown>).completed;
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is string => typeof item === "string" && item.trim() !== "")
    .map((s) => s.trim());
}

function hasNonPendingDisposition(tracker: Record<string, unknown>, slug: string): boolean {
  for (const step of trackerStepsFromMap(tracker)) {
    const stepSlug =
      (typeof step.slug === "string" && step.slug) ||
      (typeof step.id === "string" && step.id) ||
      "";
    if (stepSlug !== slug) continue;
    const disp = stepDisposition(step);
    return disp === "completed" || disp === "not_applicable" || disp === "waived";
  }
  return false;
}

function manifestPresent(workspace: string, requestToken: string): boolean {
  if (!workspace.trim() || !requestToken.trim()) return false;
  const manifest = path.join(
    workspace,
    "working",
    requestToken,
    "evidence",
    "verification-evidence-manifest.v1.json",
  );
  if (fs.existsSync(manifest)) return true;
  const naReceipt = path.join(
    workspace,
    "working",
    requestToken,
    "evidence",
    "not-applicable-receipt.v1.json",
  );
  return fs.existsSync(naReceipt);
}

function needsManifest(completed: string[]): boolean {
  const triggers = new Set([
    "verification-gate",
    "unit-test-green",
    "unit-test-red",
    "composition-integration",
  ]);
  return completed.some((slug) => triggers.has(slug));
}

function findingCodes(report: ReconcileReport): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const finding of report.findings) {
    counts[finding.code] = (counts[finding.code] ?? 0) + 1;
  }
  return counts;
}

function filterGapPrefix(gaps: string[], code: string): string[] {
  return gaps.includes(code) ? [code] : [];
}

function uniqueStrings(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    if (seen.has(item)) continue;
    seen.add(item);
    out.push(item);
  }
  return out;
}

export function computeProcessGrade(
  input: ReconcileInput,
  report: ReconcileReport,
): ProcessGrade {
  const tracker = loadTracker(input);
  const completed = completedSlugs(tracker);
  const codes = findingCodes(report);
  const gapCodes: string[] = [];

  let dualWriteCount = 0;
  for (const slug of completed) {
    if (!hasNonPendingDisposition(tracker, slug)) {
      dualWriteCount++;
      gapCodes.push("tracker_dual_write");
    }
  }
  let trackerScore = 100;
  if (completed.length > 0) {
    trackerScore = (100 * (completed.length - dualWriteCount)) / completed.length;
  }
  if (dualWriteCount === completed.length && completed.length > 0) {
    gapCodes.push("tracker_sparse");
    trackerScore = 0;
  }

  let manifestScore = 100;
  if (needsManifest(completed)) {
    if (!manifestPresent(input.workspace, trackerRequestToken(tracker))) {
      manifestScore = 0;
      gapCodes.push("expected_artifact_missing");
    }
  }

  let hashScore = 100;
  if ((codes[findingGateWithoutCurrentEvidence] ?? 0) > 0) {
    hashScore = 40;
    gapCodes.push("evidence_stale");
  }

  let ledgerScore = 100;
  if ((codes[findingLegacyNoAdherenceChain] ?? 0) > 0) {
    ledgerScore = 20;
    gapCodes.push("thin_ledger");
  } else if ((codes[findingAttemptWithoutVerified] ?? 0) > 0) {
    ledgerScore = 50;
    gapCodes.push("thin_ledger");
  }

  let evidenceScore = 100;
  if ((codes[findingCompletedWithUnresolved] ?? 0) > 0) {
    evidenceScore = 40;
  }

  const dimensions: ProcessGradeDimension[] = [
    {
      name: "tracker_integrity",
      score: trackerScore,
      weight: 0.3,
      gap_codes: uniqueStrings(filterGapPrefix(gapCodes, "tracker_dual_write").concat(
        filterGapPrefix(gapCodes, "tracker_sparse"),
      )),
    },
    {
      name: "verification_manifest",
      score: manifestScore,
      weight: 0.25,
      gap_codes: filterGapPrefix(gapCodes, "expected_artifact_missing"),
    },
    {
      name: "hash_alignment",
      score: hashScore,
      weight: 0.2,
      gap_codes: filterGapPrefix(gapCodes, "evidence_stale"),
    },
    {
      name: "ledger_correlation",
      score: ledgerScore,
      weight: 0.15,
      gap_codes: filterGapPrefix(gapCodes, "thin_ledger"),
    },
    {
      name: "typed_evidence_refs",
      score: evidenceScore,
      weight: 0.1,
    },
  ];

  let weighted = 0;
  for (const dim of dimensions) {
    weighted += dim.score * dim.weight;
  }

  return {
    score: weighted,
    band: processGradeBand(weighted),
    dimensions,
    gap_codes: uniqueStrings(gapCodes),
  };
}
