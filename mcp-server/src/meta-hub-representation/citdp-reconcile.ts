/**
 * [IMPL-TIED_CITDP_RECONCILE] [ARCH-TIED_META_HUB_REPRESENTATION_BOUNDARY] [REQ-TIED_META_HUB_REPRESENTATION]
 * How: classify divergent working CITDP drafts vs tied-project/citdp/ and apply with fail-closed conflicts.
 */

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

import { writeCitdpRecord } from "../citdp-writer.js";
import { getBasePath } from "../yaml-loader.js";
import { loadDefaultDivergentPaths } from "./dedupe-log-paths.js";

export type ReconcileClassification =
  | "identical"
  | "working_newer"
  | "canonical_newer"
  | "structural_conflict"
  | "working_only"
  | "keep_working_no_citdp";

export type ForceDisposition = "keep_canonical" | "take_working" | "skip";

export type ReconcileRow = {
  working_path: string;
  basename: string;
  canonical_path: string | null;
  classification: ReconcileClassification;
  action: string;
  sha256_working?: string;
  sha256_canonical?: string;
  mtime_working_ms?: number;
  mtime_canonical_ms?: number;
  force_disposition?: ForceDisposition;
  error?: string;
};

export type ReconcileLedger = {
  schema_version: "citdp-reconcile-ledger.v1";
  dry_run: boolean;
  row_count: number;
  unresolved_conflicts: number;
  rows: ReconcileRow[];
};

const SKIP_CITDP_PERSIST_BASENAMES = new Set(["CITDP-DOC-JEV-COMPARISON.yaml"]);

function sha256File(absPath: string): string {
  return createHash("sha256").update(fs.readFileSync(absPath)).digest("hex");
}

function readCitdpInnerRecord(absPath: string): { topKey: string; record: Record<string, unknown> } {
  const raw = yaml.load(fs.readFileSync(absPath, "utf8")) as Record<string, unknown>;
  const keys = Object.keys(raw);
  if (keys.length !== 1) {
    throw new Error(`expected single top-level CITDP key in ${absPath}`);
  }
  const topKey = keys[0]!;
  const inner = raw[topKey];
  if (typeof inner !== "object" || inner === null || Array.isArray(inner)) {
    throw new Error(`invalid CITDP record body in ${absPath}`);
  }
  return { topKey, record: inner as Record<string, unknown> };
}

function classifyPair(input: {
  workingAbs: string;
  canonicalAbs: string | null;
  basename: string;
}): ReconcileRow {
  const working_path = input.workingAbs;
  const basename = input.basename;

  if (SKIP_CITDP_PERSIST_BASENAMES.has(basename)) {
    return {
      working_path,
      basename,
      canonical_path: input.canonicalAbs,
      classification: "keep_working_no_citdp",
      action: "keep_working",
    };
  }

  if (!input.canonicalAbs || !fs.existsSync(input.canonicalAbs)) {
    return {
      working_path,
      basename,
      canonical_path: input.canonicalAbs,
      classification: "working_only",
      action: "persist_working_to_citdp",
      sha256_working: sha256File(input.workingAbs),
      mtime_working_ms: fs.statSync(input.workingAbs).mtimeMs,
    };
  }

  const shaW = sha256File(input.workingAbs);
  const shaC = sha256File(input.canonicalAbs);
  const mtimeW = fs.statSync(input.workingAbs).mtimeMs;
  const mtimeC = fs.statSync(input.canonicalAbs).mtimeMs;
  const base: ReconcileRow = {
    working_path,
    basename,
    canonical_path: input.canonicalAbs,
    sha256_working: shaW,
    sha256_canonical: shaC,
    mtime_working_ms: mtimeW,
    mtime_canonical_ms: mtimeC,
    classification: "identical",
    action: "delete_working",
  };

  if (shaW === shaC) return base;

  if (mtimeW > mtimeC) {
    return {
      ...base,
      classification: "working_newer",
      action: "persist_working_to_citdp_then_delete_working",
    };
  }
  if (mtimeC > mtimeW) {
    return {
      ...base,
      classification: "canonical_newer",
      action: "delete_working",
    };
  }
  return {
    ...base,
    classification: "structural_conflict",
    action: "requires_force_disposition",
  };
}

export function buildReconcileLedger(input: {
  projectRoot: string;
  workingPaths?: string[];
  dryRun: boolean;
  forceDispositions?: Record<string, ForceDisposition>;
}): ReconcileLedger {
  const repoRoot = path.resolve(input.projectRoot);
  const citdpDir = path.join(repoRoot, "tied-project", "citdp");
  const workingPaths =
    input.workingPaths?.length ? input.workingPaths : loadDefaultDivergentPaths(repoRoot);

  const rows: ReconcileRow[] = [];
  for (const relWorking of workingPaths) {
    const workingAbs = path.isAbsolute(relWorking)
      ? relWorking
      : path.join(repoRoot, relWorking);
    if (!fs.existsSync(workingAbs)) {
      rows.push({
        working_path: relWorking,
        basename: path.basename(workingAbs),
        canonical_path: null,
        classification: "working_only",
        action: "skip_missing_working",
        error: "working file not found",
      });
      continue;
    }
    const basename = path.basename(workingAbs);
    const canonicalAbs = path.join(citdpDir, basename);
    const row = classifyPair({
      workingAbs,
      canonicalAbs: fs.existsSync(canonicalAbs) ? canonicalAbs : null,
      basename,
    });
    const force = input.forceDispositions?.[relWorking] ?? input.forceDispositions?.[basename];
    if (force) row.force_disposition = force;
    if (row.classification === "structural_conflict" && force === "take_working") {
      row.action = "persist_working_to_citdp_then_delete_working";
    } else if (row.classification === "structural_conflict" && force === "keep_canonical") {
      row.action = "delete_working";
    } else if (row.classification === "structural_conflict" && force === "skip") {
      row.action = "keep_working";
    }
    rows.push(row);
  }

  const unresolved = rows.filter(
    (r) => r.classification === "structural_conflict" && r.action === "requires_force_disposition",
  ).length;

  return {
    schema_version: "citdp-reconcile-ledger.v1",
    dry_run: input.dryRun,
    row_count: rows.length,
    unresolved_conflicts: unresolved,
    rows,
  };
}

export function applyReconcileLedger(ledger: ReconcileLedger): {
  ok: boolean;
  applied: number;
  errors: string[];
} {
  if (ledger.dry_run) {
    return { ok: false, applied: 0, errors: ["dry_run: apply refused"] };
  }
  if (ledger.unresolved_conflicts > 0) {
    return {
      ok: false,
      applied: 0,
      errors: [`unresolved_conflicts:${ledger.unresolved_conflicts}`],
    };
  }

  const repoRoot = path.resolve(getBasePath(), "..");
  const errors: string[] = [];
  let applied = 0;

  for (const row of ledger.rows) {
    if (row.error) continue;
    const workingAbs = path.isAbsolute(row.working_path)
      ? row.working_path
      : path.join(repoRoot, row.working_path);

    try {
      if (row.action === "keep_working" || row.action === "skip_missing_working") {
        continue;
      }
      if (row.action === "delete_working") {
        if (fs.existsSync(workingAbs)) {
          fs.unlinkSync(workingAbs);
          applied += 1;
        }
        continue;
      }
      if (
        row.action === "persist_working_to_citdp"
        || row.action === "persist_working_to_citdp_then_delete_working"
      ) {
        const { topKey, record } = readCitdpInnerRecord(workingAbs);
        const write = writeCitdpRecord({
          filename: row.basename,
          record,
          top_level_key: topKey,
        });
        if (!write.ok) {
          errors.push(`${row.basename}: ${write.error}`);
          continue;
        }
        applied += 1;
        if (row.action === "persist_working_to_citdp_then_delete_working" && fs.existsSync(workingAbs)) {
          fs.unlinkSync(workingAbs);
        }
      }
    } catch (e) {
      errors.push(`${row.basename}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return { ok: errors.length === 0, applied, errors };
}
