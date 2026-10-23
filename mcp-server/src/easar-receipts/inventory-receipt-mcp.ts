/**
 * [IMPL-TIED_EASAR_RECEIPTS] [ARCH-TIED_EASAR_ARTIFACT_MODEL] [REQ-TIED_EASAR_RECOVERY]
 * MCP handler: build inventory.v1 from scoped analysis walk_summary.
 */

import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { runScopedAnalysis } from "../analysis/scoped-analysis.js";
import { getClientProjectRoot } from "../yaml-loader.js";
import { tryPatchArtifactFile } from "../request-evidence-envelope/hooks.js";
import { safeStringifyJson } from "../storage-dump.js";
import { INVENTORY_V1_SCHEMA, buildInventoryV1FromWalkSummary } from "./inventory-v1.js";

export type BuildEasarInventoryReceiptInput = {
  request_token: string;
  project_root?: string;
  baseline_revision?: string;
  scoped_analysis_run_id?: string;
  roots?: string[];
  output_path?: string;
  matrix_row_placeholders?: string[];
  entry_points?: string[];
};

export type BuildEasarInventoryReceiptResult = {
  ok: true;
  schema_version: typeof INVENTORY_V1_SCHEMA;
  scoped_analysis_run_id: string;
  inventory: ReturnType<typeof buildInventoryV1FromWalkSummary>;
  written_path?: string;
};

// [IMPL-TIED_EASAR_RECEIPTS] [REQ-TIED_EASAR_RECOVERY] — PRE: request_token set; POST: inventory.v1 with stable content_hash.
export async function buildEasarInventoryReceipt(
  input: BuildEasarInventoryReceiptInput,
): Promise<BuildEasarInventoryReceiptResult> {
  const projectRoot = path.resolve(input.project_root ?? getClientProjectRoot());
  const runId = input.scoped_analysis_run_id?.trim() || `scoped-${randomUUID()}`;
  const walk = runScopedAnalysis({
    mode: "walk_summary",
    roots: input.roots?.length ? input.roots : ["mcp-server/src"],
    project_root: projectRoot,
  });
  if (!walk.ok || !Array.isArray(walk.files_scanned)) {
    throw new Error("scoped_walk_failed");
  }
  const baseline =
    input.baseline_revision?.trim()
    || process.env.GIT_SHA?.trim()
    || "unknown-baseline";
  const files = Array.isArray(walk.files_scanned) ? walk.files_scanned : [];
  const inventory = buildInventoryV1FromWalkSummary({
    request_token: input.request_token,
    baseline_revision: baseline,
    scoped_analysis_run_id: runId,
    files_scanned: typeof walk.scanned_files === "number" ? walk.scanned_files : files.length,
    files,
    summary: {
      roots_used: walk.summary.roots_used,
      skipped_paths_count: walk.summary.skipped_paths_count,
      followed_symlinks: walk.summary.followed_symlinks,
    },
    entry_points: input.entry_points,
    matrix_row_placeholders: input.matrix_row_placeholders,
  });

  let written_path: string | undefined;
  if (input.output_path?.trim()) {
    const relative = input.output_path.replace(/\\/g, "/");
    const absolute = path.isAbsolute(relative)
      ? relative
      : path.join(projectRoot, relative);
    fs.mkdirSync(path.dirname(absolute), { recursive: true });
    fs.writeFileSync(absolute, safeStringifyJson(inventory), "utf8");
    written_path = path.relative(projectRoot, absolute).split(path.sep).join("/");
    void tryPatchArtifactFile({
      request_token: input.request_token,
      project_root: projectRoot,
      absolute_path: absolute,
      kind: "unknown",
      phase: "pre_implementation",
      schema_version: INVENTORY_V1_SCHEMA,
      proof_boundaries: ["read-only-tied-yaml", "static-walk-limits"],
    });
  }

  return {
    ok: true,
    schema_version: INVENTORY_V1_SCHEMA,
    scoped_analysis_run_id: runId,
    inventory,
    written_path,
  };
}

export function inventoryContentHashPreview(inventory: { content_hash: string }): string {
  return createHash("sha256").update(inventory.content_hash, "utf8").digest("hex").slice(0, 12);
}
