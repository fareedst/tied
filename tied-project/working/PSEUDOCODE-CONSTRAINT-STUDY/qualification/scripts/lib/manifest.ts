import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import {
  BASELINE_ANCHOR_COMMIT,
  EXTERNAL_CORPUS_ROOT,
  MANIFEST_SCHEMA_VERSION,
} from "./constants.ts";
import { yaml } from "./yaml-io.ts";

export type ManifestTier = "A" | "B" | "C" | "D";

export type InputIdentity = {
  algorithm: "sha256";
  hash: string;
  byte_length: number;
};

export type ManifestEntry = {
  id: string;
  tier: ManifestTier;
  client_id: string;
  client_root: string;
  sidecar_path: string;
  token: string;
  input_identity: InputIdentity;
  lineage_tag: "primary" | "lineage_duplicate" | "excluded";
  exclusion_reason: string | null;
  included: boolean;
};

export type QualificationManifest = {
  schema_version: typeof MANIFEST_SCHEMA_VERSION;
  generated_at: string;
  baseline_anchor_commit: typeof BASELINE_ANCHOR_COMMIT;
  corpus_root: string;
  stdd_sidecars_root: string;
  entries: ManifestEntry[];
  stats: {
    total_discovered: number;
    included: number;
    excluded: number;
    by_tier: Record<ManifestTier, number>;
  };
};

export function computeInputIdentity(source: string): InputIdentity {
  const normalized = source.replace(/\r\n/g, "\n");
  const hash = createHash("sha256").update(normalized, "utf8").digest("hex");
  return {
    algorithm: "sha256",
    hash,
    byte_length: Buffer.byteLength(normalized, "utf8"),
  };
}

export function tokenFromSidecarPath(sidecarPath: string): string {
  const base = sidecarPath.split("/").pop() ?? sidecarPath;
  return base.replace(/-pseudocode\.md$/, "");
}

export function entryId(tier: ManifestTier, clientId: string, token: string): string {
  return `tier-${tier.toLowerCase()}-${clientId}-${token}`.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function readManifest(path: string): Promise<QualificationManifest> {
  const raw = await readFile(path, "utf8");
  return yaml.load(raw) as QualificationManifest;
}

export async function writeManifest(
  path: string,
  manifest: QualificationManifest,
): Promise<void> {
  const body = yaml.dump(manifest, {
    lineWidth: 120,
    noRefs: true,
    sortKeys: false,
  });
  await writeFile(path, body, "utf8");
}

export function emptyManifest(stddSidecarsRoot: string): QualificationManifest {
  return {
    schema_version: MANIFEST_SCHEMA_VERSION,
    generated_at: new Date().toISOString(),
    baseline_anchor_commit: BASELINE_ANCHOR_COMMIT,
    corpus_root: EXTERNAL_CORPUS_ROOT,
    stdd_sidecars_root: stddSidecarsRoot,
    entries: [],
    stats: {
      total_discovered: 0,
      included: 0,
      excluded: 0,
      by_tier: { A: 0, B: 0, C: 0, D: 0 },
    },
  };
}

export function recomputeStats(manifest: QualificationManifest): void {
  const included = manifest.entries.filter((e) => e.included);
  manifest.stats = {
    total_discovered: manifest.entries.length,
    included: included.length,
    excluded: manifest.entries.length - included.length,
    by_tier: {
      A: included.filter((e) => e.tier === "A").length,
      B: included.filter((e) => e.tier === "B").length,
      C: included.filter((e) => e.tier === "C").length,
      D: included.filter((e) => e.tier === "D").length,
    },
  };
}
