/**
 * [IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM] IMPORT_WF_CLIENT_MANIFEST — SC-HMEP-M1-06
 */
import fs from "node:fs";
import path from "node:path";
import type { EvalDatabase } from "../lib/sqlite.js";
import { parseClaudeStreamJsonFile } from "../adapters/claude/parse-stream.js";
import { parseCursorStreamJsonFile } from "../adapters/cursor/parse-stream.js";
import { configurationFingerprint } from "../config/fingerprint.js";
import { ensureStoreLayout, resolveStoreRoot } from "../config/paths.js";
import { openEvalDatabase } from "../store/db.js";
import type { HarnessLabel, TokenObservation, WfManifestV1 } from "../types.js";
import {
  mergeClaudeCumulativeSnapshots,
  mergeCursorObservations,
} from "../tokens/accounting.js";
import {
  appendImportReceipt,
  insertObservations,
  upsertTrialSummary,
} from "../normalize/ingest.js";

const MANIFEST_REL = path.join(
  "tied-project",
  "working",
  "wf-trial-orchestrator-run",
  "evidence",
  "wf-trial-orchestrator-run.v1.json",
);

export function resolveManifestPath(clientRoot: string): string {
  return path.join(clientRoot, MANIFEST_REL);
}

export function readWfManifest(clientRoot: string): WfManifestV1 {
  const manifestPath = resolveManifestPath(clientRoot);
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`DEBUG: missing WF manifest ${manifestPath}`);
  }
  return JSON.parse(fs.readFileSync(manifestPath, "utf8")) as WfManifestV1;
}

export function normalizeHarnessLabel(raw: string | undefined): HarnessLabel {
  const h = (raw ?? "").toLowerCase();
  if (h.includes("claude")) {
    return "claude";
  }
  if (h.includes("cursor")) {
    return "cursor";
  }
  return "unknown";
}

export function wallClockMs(manifest: WfManifestV1): number | null {
  if (!manifest.started_at || !manifest.finished_at) {
    return null;
  }
  const start = Date.parse(manifest.started_at);
  const end = Date.parse(manifest.finished_at);
  if (Number.isNaN(start) || Number.isNaN(end)) {
    return null;
  }
  return Math.max(0, end - start);
}

export function parseJsonlForHarness(
  harness: HarnessLabel,
  jsonlPaths: string[],
  seenOrigin = new Set<string>(),
): TokenObservation[] {
  const parseOne =
    harness === "claude" ? parseClaudeStreamJsonFile : parseCursorStreamJsonFile;
  return jsonlPaths.flatMap((p) => (fs.existsSync(p) ? parseOne(p, seenOrigin) : []));
}

export function importWfClient(input: {
  clientRoot: string;
  trialId: string;
  jsonlPaths?: string[];
  storeRoot?: string;
}): { observationsInserted: number; db: EvalDatabase; storeRoot: string } {
  const storeRoot = resolveStoreRoot(input.storeRoot);
  const { dbPath, importsLog } = ensureStoreLayout(storeRoot);
  const manifest = readWfManifest(input.clientRoot);
  const harness = normalizeHarnessLabel(manifest.harness);
  const fingerprint = configurationFingerprint({
    harness: manifest.harness,
    model_slug: manifest.model_slug,
    model_config: manifest.model_config,
    model_effort: manifest.model_effort,
  });
  const db = openEvalDatabase(dbPath);
  const seenOrigin = new Set<string>();
  const jsonlPaths = input.jsonlPaths ?? [];
  const observations = parseJsonlForHarness(harness, jsonlPaths, seenOrigin);

  const inserted = insertObservations(db, input.trialId, observations);

  let summary =
    harness === "claude"
      ? mergeClaudeCumulativeSnapshots(
          input.trialId,
          observations.map((o) => ({
            input_tokens: o.input_tokens,
            output_tokens: o.output_tokens,
            reasoning_tokens: o.reasoning_tokens,
            cache_read_input_tokens: o.cache_read_input_tokens,
            cache_creation_input_tokens: o.cache_creation_input_tokens,
          })),
        )
      : mergeCursorObservations(input.trialId, observations);

  if (observations.length === 0) {
    summary = {
      trial_id: input.trialId,
      input_tokens: null,
      output_tokens: null,
      reasoning_tokens: null,
      cache_read_input_tokens: null,
      cache_creation_input_tokens: null,
      completeness: "absent",
      observation_count: 0,
    };
  }

  upsertTrialSummary(db, summary, {
    harness,
    wf_id: manifest.wf_id,
    config_fingerprint: fingerprint,
    started_at: manifest.started_at,
    finished_at: manifest.finished_at,
    wall_clock_ms: wallClockMs(manifest),
    exit_code: manifest.exit_code ?? null,
  });

  appendImportReceipt(importsLog, {
    at: new Date().toISOString(),
    trial_id: input.trialId,
    client_root: input.clientRoot,
    observations_inserted: inserted,
    manifest_schema: manifest.schema,
  });

  return { observationsInserted: inserted, db, storeRoot };
}
