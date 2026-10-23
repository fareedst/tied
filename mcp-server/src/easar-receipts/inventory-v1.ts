/**
 * [IMPL-TIED_EASAR_RECEIPTS] [ARCH-TIED_EASAR_ARTIFACT_MODEL] [REQ-TIED_EASAR_RECOVERY]
 * inventory.v1.json receipt from scoped analysis walk_summary normalization.
 */

import { createHash } from "node:crypto";

import { stableJsonForHash } from "../storage-dump.js";

export const INVENTORY_V1_SCHEMA = "inventory.v1";

export type InventoryV1 = {
  schema_version: typeof INVENTORY_V1_SCHEMA;
  request_token: string;
  baseline_revision: string;
  scoped_analysis_run_id: string;
  files_scanned: number;
  languages: string[];
  entry_points: string[];
  walk_summary: {
    roots_used: string[];
    skipped_paths_count: number;
    followed_symlinks: boolean;
  };
  matrix_row_placeholders: string[];
  content_hash: string;
};

function inferLanguages(files: string[]): string[] {
  const exts = new Set<string>();
  for (const file of files) {
    const match = /\.([a-zA-Z0-9]+)$/.exec(file);
    if (match) exts.add(match[1].toLowerCase());
  }
  return [...exts].sort((a, b) => a.localeCompare(b));
}

function stableHash(value: unknown): string {
  return createHash("sha256").update(stableJsonForHash(value), "utf8").digest("hex");
}

export type WalkSummaryInput = {
  request_token: string;
  baseline_revision: string;
  scoped_analysis_run_id: string;
  files_scanned: number;
  files: string[];
  summary: {
    roots_used: string[];
    skipped_paths_count: number;
    followed_symlinks: boolean;
  };
  entry_points?: string[];
  matrix_row_placeholders?: string[];
};

// [IMPL-TIED_EASAR_RECEIPTS] [REQ-TIED_EASAR_RECOVERY] — PRE: walk_summary fields present; POST: stable content_hash excluding content_hash field.
export function buildInventoryV1FromWalkSummary(input: WalkSummaryInput): InventoryV1 {
  const body: Omit<InventoryV1, "content_hash"> = {
    schema_version: INVENTORY_V1_SCHEMA,
    request_token: input.request_token,
    baseline_revision: input.baseline_revision,
    scoped_analysis_run_id: input.scoped_analysis_run_id,
    files_scanned: input.files_scanned,
    languages: inferLanguages(input.files),
    entry_points: (input.entry_points ?? []).slice().sort((a, b) => a.localeCompare(b)),
    walk_summary: {
      roots_used: input.summary.roots_used.slice().sort((a, b) => a.localeCompare(b)),
      skipped_paths_count: input.summary.skipped_paths_count,
      followed_symlinks: input.summary.followed_symlinks,
    },
    matrix_row_placeholders: (input.matrix_row_placeholders ?? []).slice(),
  };
  const content_hash = stableHash(body);
  return { ...body, content_hash };
}
