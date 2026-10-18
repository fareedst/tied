/**
 * [IMPL-TIED_BOUNDED_DIVERGENCE_ANALYSIS] [ARCH-TIED_BOUNDED_COMPOSITION] [REQ-TIED_BOUNDED_COMPOSITION]
 * ANALYZE_TRAJECTORY_DIVERGENCE — deterministic read-only contrast engine.
 */

import fs from "node:fs";
import path from "node:path";

import { workingPathRelativeToProject } from "../working-root.js";
import {
  BOUNDED_ENVELOPE_ARTIFACT_SCHEMAS,
  BOUNDED_PROOF_BOUNDARIES,
} from "./constants.js";
import { stableJsonHash } from "./content-hash.js";
import type { TrajectoryManifestV1 } from "./trajectory-manifest.js";

export type DivergenceErrorCode = "StaleManifest" | "RequestScopeViolation" | "MissingProvenance";

export type DivergenceError = {
  code: DivergenceErrorCode;
  detail: string;
};

export type ContrastDimension = "outcome" | "tool_sequence" | "exit_metadata" | "tool_usage";

export type ContrastRow = {
  dimension: ContrastDimension;
  run_id_a: string;
  run_id_b: string;
  status: "identical" | "divergent" | "unknown";
  finding_lifecycle: "observed";
  detail: string;
};

export type TrajectoryDivergenceReportV1 = {
  schema_version: typeof BOUNDED_ENVELOPE_ARTIFACT_SCHEMAS.divergenceReport;
  request_token: string;
  manifest_run_ids: string[];
  contrast_rows: ContrastRow[];
  proof_boundaries: string[];
  content_hash: string;
  generated_at: string;
  truncated_data_present: boolean;
};

export type AnalyzeTrajectoryDivergenceOptions = {
  /** Reject manifests older than this many ms relative to `now`. */
  stale_after_ms?: number;
  now?: string;
};

export type AnalyzeTrajectoryDivergenceResult =
  | { ok: true; report: TrajectoryDivergenceReportV1 }
  | { ok: false; error: DivergenceError };

const DEFAULT_STALE_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

function fail(code: DivergenceErrorCode, detail: string): AnalyzeTrajectoryDivergenceResult {
  return { ok: false, error: { code, detail } };
}

function comparePair(a: TrajectoryManifestV1, b: TrajectoryManifestV1): ContrastRow[] {
  const rows: ContrastRow[] = [];

  const outcomeStatus =
    a.truncated || b.truncated
      ? "unknown"
      : a.outcome_hash === b.outcome_hash
        ? "identical"
        : "divergent";
  rows.push({
    dimension: "outcome",
    run_id_a: a.run_id,
    run_id_b: b.run_id,
    status: outcomeStatus,
    finding_lifecycle: "observed",
    detail:
      outcomeStatus === "unknown"
        ? "truncated manifest summary"
        : `outcome_hash ${a.outcome_hash} vs ${b.outcome_hash}`,
  });

  const seqA = a.tool_sequence_hashes.join("|");
  const seqB = b.tool_sequence_hashes.join("|");
  const orderStatus =
    a.truncated || b.truncated
      ? "unknown"
      : seqA === seqB
        ? "identical"
        : "divergent";
  rows.push({
    dimension: "tool_sequence",
    run_id_a: a.run_id,
    run_id_b: b.run_id,
    status: orderStatus,
    finding_lifecycle: "observed",
    detail: orderStatus === "unknown" ? "truncated tool sequence" : `sequence ${seqA} vs ${seqB}`,
  });

  const exitStatus = a.exit_code === b.exit_code ? "identical" : "divergent";
  rows.push({
    dimension: "exit_metadata",
    run_id_a: a.run_id,
    run_id_b: b.run_id,
    status: exitStatus,
    finding_lifecycle: "observed",
    detail: `exit_code ${a.exit_code} vs ${b.exit_code}`,
  });

  const usageStatus =
    a.tool_sequence_hashes.length === b.tool_sequence_hashes.length ? "identical" : "divergent";
  rows.push({
    dimension: "tool_usage",
    run_id_a: a.run_id,
    run_id_b: b.run_id,
    status: usageStatus,
    finding_lifecycle: "observed",
    detail: `tool_count ${a.tool_sequence_hashes.length} vs ${b.tool_sequence_hashes.length}`,
  });

  return rows;
}

function sortContrastRows(rows: ContrastRow[]): ContrastRow[] {
  return [...rows].sort((left, right) => {
    const key = (row: ContrastRow) =>
      `${row.dimension}\0${row.run_id_a}\0${row.run_id_b}\0${row.status}\0${row.detail}`;
    return key(left).localeCompare(key(right));
  });
}

export function analyzeTrajectoryDivergence(
  manifests: TrajectoryManifestV1[],
  options: AnalyzeTrajectoryDivergenceOptions = {},
): AnalyzeTrajectoryDivergenceResult {
  if (manifests.length === 0) {
    return fail("MissingProvenance", "at least one manifest required");
  }

  const requestToken = manifests[0].request_token;
  for (const manifest of manifests) {
    if (manifest.request_token !== requestToken) {
      return fail("RequestScopeViolation", "manifest request_token mismatch");
    }
    if (!manifest.provenance_refs?.length) {
      return fail("MissingProvenance", `manifest ${manifest.run_id} missing provenance_refs`);
    }
  }

  const nowMs = options.now ? Date.parse(options.now) : Date.now();
  const staleAfter = options.stale_after_ms ?? DEFAULT_STALE_AFTER_MS;
  for (const manifest of manifests) {
    const capturedMs = Date.parse(manifest.captured_at);
    if (!Number.isFinite(capturedMs) || nowMs - capturedMs > staleAfter) {
      return fail("StaleManifest", `manifest ${manifest.run_id} is stale`);
    }
  }

  const contrastRows: ContrastRow[] = [];
  for (let i = 0; i < manifests.length; i += 1) {
    for (let j = i + 1; j < manifests.length; j += 1) {
      contrastRows.push(...comparePair(manifests[i], manifests[j]));
    }
  }

  const truncatedPresent = manifests.some((manifest) => manifest.truncated);
  const generatedAt = options.now ?? new Date().toISOString();
  const reportBody = {
    schema_version: BOUNDED_ENVELOPE_ARTIFACT_SCHEMAS.divergenceReport,
    request_token: requestToken,
    manifest_run_ids: manifests.map((manifest) => manifest.run_id).sort(),
    contrast_rows: sortContrastRows(contrastRows),
    proof_boundaries: [BOUNDED_PROOF_BOUNDARIES.advisoryNotGateAuthority],
    truncated_data_present: truncatedPresent,
    generated_at: generatedAt,
  };

  const report: TrajectoryDivergenceReportV1 = {
    ...reportBody,
    content_hash: stableJsonHash({
      manifest_run_ids: reportBody.manifest_run_ids,
      contrast_rows: reportBody.contrast_rows,
      truncated_data_present: reportBody.truncated_data_present,
    }),
  };

  return { ok: true, report };
}

export function writeTrajectoryDivergenceReport(
  projectRoot: string,
  requestToken: string,
  report: TrajectoryDivergenceReportV1,
): string {
  const filename = `bounded-divergence-report-${report.content_hash.slice(7, 19)}.v1.json`;
  const relative = workingPathRelativeToProject(projectRoot, requestToken, "evidence", filename);
  const absolute = path.join(projectRoot, relative);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return relative;
}
