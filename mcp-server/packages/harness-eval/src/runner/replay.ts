/**
 * [IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM] REPLAY_BATCH_IMPORT — SC-HMEP-M4-03..05; F-16
 */
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { resolveStoreRoot } from "../config/paths.js";
import { importWfClient } from "./import-wf.js";

export interface ReplayManifestEntry {
  client_root: string;
  trial_id?: string;
  jsonl_paths?: string[];
}

export interface ReplayManifestDoc {
  schema_version: string;
  manifest_revision: string;
  entries: ReplayManifestEntry[];
}

export interface ReplayEntryResult {
  client_root: string;
  trial_id?: string;
  status: "imported" | "skipped_missing_client_root";
  observations_inserted?: number;
}

export interface ReplayBatchSummary {
  manifest_revision: string;
  entries: ReplayEntryResult[];
  skipped_missing_client_root: string[];
}

export function parseReplayManifestFile(manifestPath: string): ReplayManifestDoc {
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`DEBUG: missing replay manifest ${manifestPath}`);
  }
  const doc = yaml.load(fs.readFileSync(manifestPath, "utf8")) as ReplayManifestDoc;
  if (doc.schema_version !== "harness-eval-replay-manifest-v1") {
    throw new Error(`DEBUG: unsupported replay manifest schema ${doc.schema_version}`);
  }
  if (!doc.manifest_revision || !Array.isArray(doc.entries)) {
    throw new Error("DEBUG: invalid replay manifest shape");
  }
  for (const entry of doc.entries) {
    if (!entry.client_root || typeof entry.client_root !== "string") {
      throw new Error("DEBUG: replay entry missing client_root");
    }
  }
  return doc;
}

export function validateReplayManifestStructure(manifestPath: string): { ok: boolean; error?: string } {
  try {
    parseReplayManifestFile(manifestPath);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

function resolveJsonlPaths(clientRoot: string, jsonlPaths: string[] | undefined): string[] {
  const list = jsonlPaths ?? [];
  return list.map((p) => (path.isAbsolute(p) ? p : path.join(clientRoot, p)));
}

export function replayBatchFromManifest(input: {
  manifestPath: string;
  storeRoot?: string;
}): ReplayBatchSummary {
  const manifest = parseReplayManifestFile(input.manifestPath);
  const storeRoot = resolveStoreRoot(input.storeRoot);
  const entries: ReplayEntryResult[] = [];
  const skipped: string[] = [];

  for (const entry of manifest.entries) {
    const clientRoot = path.resolve(entry.client_root);
    if (!fs.existsSync(clientRoot)) {
      skipped.push(clientRoot);
      entries.push({
        client_root: clientRoot,
        status: "skipped_missing_client_root",
      });
      continue;
    }
    const trialId = entry.trial_id ?? path.basename(clientRoot);
    const jsonlPaths = resolveJsonlPaths(clientRoot, entry.jsonl_paths);
    const { observationsInserted } = importWfClient({
      clientRoot,
      trialId,
      jsonlPaths,
      storeRoot,
    });
    entries.push({
      client_root: clientRoot,
      trial_id: trialId,
      status: "imported",
      observations_inserted: observationsInserted,
    });
  }

  return {
    manifest_revision: manifest.manifest_revision,
    entries,
    skipped_missing_client_root: skipped,
  };
}
