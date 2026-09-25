/**
 * [IMPL-TIED_DAE_VERIFICATION_CHARTER] [ARCH-TIED_DAE_VERIFICATION_CHARTER] [REQ-TIED_DAE_VERIFICATION_CHARTER]
 * How: W4a diff-scoped mutation cache score + manifest (charter opt-in; default off).
 */

import fs from "node:fs";
import path from "node:path";

import { readCharterPolicy } from "./charter-policy.js";

export type MutationCacheInput = {
  request_token: string;
  project_root: string;
  citdp: unknown;
  diff_paths: string[];
  cache_dir: string;
  hook_slug: "verification-gate";
  timestamp?: string;
};

export type MutationCacheManifestEntry = {
  path: string;
  cached: boolean;
  mutants_killed: number;
  mutants_total: number;
};

export type MutationCacheReport = {
  schema_version: "mutation-cache.v1";
  request_token: string;
  hook_slug: MutationCacheInput["hook_slug"];
  enabled: boolean;
  threshold: number;
  generated_at: string;
  score: number;
  entries: MutationCacheManifestEntry[];
  action: "skipped" | "pass" | "fail";
  proof_boundary: string;
};

function scoreFromEntries(entries: MutationCacheManifestEntry[]): number {
  let killed = 0;
  let total = 0;
  for (const entry of entries) {
    killed += entry.mutants_killed;
    total += entry.mutants_total;
  }
  if (total === 0) return 0;
  return killed / total;
}

function readCacheSidecar(cacheDir: string, filePath: string): MutationCacheManifestEntry | null {
  const safeName = filePath.replace(/\//g, "__");
  const sidecar = path.join(cacheDir, `${safeName}.json`);
  if (!fs.existsSync(sidecar)) {
    return {
      path: filePath,
      cached: false,
      mutants_killed: 0,
      mutants_total: 1,
    };
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(sidecar, "utf8")) as Record<string, unknown>;
    const killed = typeof parsed.mutants_killed === "number" ? parsed.mutants_killed : 0;
    const total = typeof parsed.mutants_total === "number" ? parsed.mutants_total : 1;
    return {
      path: filePath,
      cached: true,
      mutants_killed: killed,
      mutants_total: total,
    };
  } catch {
    return {
      path: filePath,
      cached: false,
      mutants_killed: 0,
      mutants_total: 1,
    };
  }
}

export function buildMutationCacheReport(input: MutationCacheInput): MutationCacheReport {
  const policy = readCharterPolicy(input.citdp);
  const timestamp = input.timestamp ?? new Date().toISOString().replace(/[:.]/g, "-");
  const threshold = policy.mutationCacheThreshold;

  if (!policy.verificationCharter || !policy.mutationCache) {
    return {
      schema_version: "mutation-cache.v1",
      request_token: input.request_token,
      hook_slug: input.hook_slug,
      enabled: false,
      threshold,
      generated_at: timestamp,
      score: 1,
      entries: [],
      action: "skipped",
      proof_boundary:
        "Mutation cache runs only when CITDP record_identity sets verification_charter and mutation_cache true.",
    };
  }

  const cacheDir = path.isAbsolute(input.cache_dir)
    ? input.cache_dir
    : path.join(input.project_root, input.cache_dir);

  const entries = input.diff_paths.map((filePath) =>
    readCacheSidecar(cacheDir, filePath) ?? {
      path: filePath,
      cached: false,
      mutants_killed: 0,
      mutants_total: 1,
    },
  );
  const score = scoreFromEntries(entries);
  const action = score >= threshold ? "pass" : "fail";

  return {
    schema_version: "mutation-cache.v1",
    request_token: input.request_token,
    hook_slug: input.hook_slug,
    enabled: true,
    threshold,
    generated_at: timestamp,
    score,
    entries,
    action,
    proof_boundary:
      "Mutation cache reads per-path sidecars only; does not execute tests or mutate source.",
  };
}

export function mutationCacheBlocksVerification(report: MutationCacheReport): boolean {
  return report.enabled && report.action === "fail";
}
