import { execFile } from "node:child_process";
import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { promisify } from "node:util";
import {
  EXTERNAL_CORPUS_ROOT,
  PRODUCTION_PANEL_IDS,
  STDD_PROJECT_SIDECARS_ROOT,
  STRESS_CLIENT_ID,
  TIER_C_SMOKE_COUNT,
} from "./constants.ts";
import {
  computeInputIdentity,
  entryId,
  tokenFromSidecarPath,
  type ManifestEntry,
  type ManifestTier,
} from "./manifest.ts";

const execFileAsync = promisify(execFile);

const SIDECAR_PATTERN = /^IMPL-.+-pseudocode\.md$/;
const ORCHESTRATION_EXCLUDE = [
  "/working/",
  "/.cursor/",
  "/methodology/implementation-decisions/",
];

type DiscoveredSidecar = {
  client_id: string;
  client_root: string;
  sidecar_path: string;
  token: string;
  byte_length: number;
  input_identity: ReturnType<typeof computeInputIdentity>;
};

type LineageKey = {
  remote: string;
  branch: string;
  tip: string;
  mtimeMs: number;
};

async function listDirs(root: string): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory() && !e.name.startsWith(".")).map((e) => e.name);
}

async function findProjectSidecars(clientRoot: string, clientId: string): Promise<DiscoveredSidecar[]> {
  const implDir = join(clientRoot, "tied/implementation-decisions");
  let files: string[];
  try {
    files = await readdir(implDir);
  } catch {
    return [];
  }

  const out: DiscoveredSidecar[] = [];
  for (const file of files) {
    if (!SIDECAR_PATTERN.test(file)) continue;
    const sidecar_path = join(implDir, file);
    const rel = sidecar_path.replace(/\\/g, "/");
    if (ORCHESTRATION_EXCLUDE.some((p) => rel.includes(p))) continue;

    const source = await readFile(sidecar_path, "utf8");
    out.push({
      client_id: clientId,
      client_root: clientRoot,
      sidecar_path,
      token: tokenFromSidecarPath(sidecar_path),
      byte_length: Buffer.byteLength(source, "utf8"),
      input_identity: computeInputIdentity(source),
    });
  }
  return out;
}

async function readGitLineage(clientRoot: string): Promise<LineageKey | null> {
  const gitDir = join(clientRoot, ".git");
  try {
    const st = await stat(gitDir);
    if (!st.isDirectory()) return null;
  } catch {
    return null;
  }

  try {
    const { stdout: remoteOut } = await execFileAsync(
      "git",
      ["-C", clientRoot, "remote", "get-url", "origin"],
      { timeout: 5000 },
    );
    const { stdout: branchOut } = await execFileAsync(
      "git",
      ["-C", clientRoot, "rev-parse", "--abbrev-ref", "HEAD"],
      { timeout: 5000 },
    );
    const { stdout: tipOut } = await execFileAsync(
      "git",
      ["-C", clientRoot, "rev-parse", "HEAD"],
      { timeout: 5000 },
    );
    const rootStat = await stat(clientRoot);
    return {
      remote: remoteOut.trim(),
      branch: branchOut.trim(),
      tip: tipOut.trim(),
      mtimeMs: rootStat.mtimeMs,
    };
  } catch {
    return null;
  }
}

async function isMethodologyOnlyClient(clientRoot: string): Promise<boolean> {
  const projectReq = join(clientRoot, "tied/requirements.yaml");
  const methodologyReq = join(clientRoot, "tied/methodology/requirements.yaml");
  try {
    const [projectRaw, methodologyRaw] = await Promise.all([
      readFile(projectReq, "utf8"),
      readFile(methodologyReq, "utf8"),
    ]);
    const projectKeys = extractTopLevelKeys(projectRaw);
    const methodologyKeys = new Set(extractTopLevelKeys(methodologyRaw));
    const projectOnly = projectKeys.filter((k) => !methodologyKeys.has(k));
    return projectOnly.length === 0;
  } catch {
    return false;
  }
}

function extractTopLevelKeys(yamlText: string): string[] {
  const keys: string[] = [];
  for (const line of yamlText.split("\n")) {
    const m = line.match(/^([A-Z0-9_-]+):/);
    if (m) keys.push(m[1]);
  }
  return keys;
}

function markLineageDuplicates(
  byClient: Map<string, { lineage: LineageKey | null; sidecars: DiscoveredSidecar[] }>,
): Map<string, "primary" | "lineage_duplicate"> {
  const tags = new Map<string, "primary" | "lineage_duplicate">();
  const groups = new Map<string, Array<{ clientId: string; mtimeMs: number }>>();

  for (const [clientId, { lineage }] of byClient) {
    if (!lineage) {
      tags.set(clientId, "primary");
      continue;
    }
    const key = `${lineage.remote}::${lineage.branch}::${lineage.tip}`;
    const group = groups.get(key) ?? [];
    group.push({ clientId, mtimeMs: lineage.mtimeMs });
    groups.set(key, group);
  }

  for (const group of groups.values()) {
    if (group.length <= 1) {
      tags.set(group[0].clientId, "primary");
      continue;
    }
    group.sort((a, b) => b.mtimeMs - a.mtimeMs);
    const newest = group[0];
    const windowMs = 24 * 60 * 60 * 1000;
    for (const item of group) {
      if (item.clientId === newest.clientId) {
        tags.set(item.clientId, "primary");
      } else if (newest.mtimeMs - item.mtimeMs <= windowMs) {
        tags.set(item.clientId, "lineage_duplicate");
      } else {
        tags.set(item.clientId, "primary");
      }
    }
  }

  return tags;
}

function toManifestEntry(
  sidecar: DiscoveredSidecar,
  tier: ManifestTier,
  lineage_tag: ManifestEntry["lineage_tag"],
  exclusion_reason: string | null,
  included: boolean,
): ManifestEntry {
  return {
    id: entryId(tier, sidecar.client_id, sidecar.token),
    tier,
    client_id: sidecar.client_id,
    client_root: sidecar.client_root,
    sidecar_path: sidecar.sidecar_path,
    token: sidecar.token,
    input_identity: sidecar.input_identity,
    lineage_tag,
    exclusion_reason,
    included,
  };
}

export async function scanCorpus(): Promise<ManifestEntry[]> {
  const entries: ManifestEntry[] = [];
  const clientIds = await listDirs(EXTERNAL_CORPUS_ROOT);
  const byClient = new Map<
    string,
    { lineage: LineageKey | null; sidecars: DiscoveredSidecar[] }
  >();

  for (const clientId of clientIds) {
    const clientRoot = join(EXTERNAL_CORPUS_ROOT, clientId);
    const sidecars = await findProjectSidecars(clientRoot, clientId);
    if (sidecars.length === 0) continue;
    const lineage = await readGitLineage(clientRoot);
    byClient.set(clientId, { lineage, sidecars });
  }

  const lineageTags = markLineageDuplicates(byClient);
  const panelSet = new Set<string>(PRODUCTION_PANEL_IDS);

  for (const clientId of PRODUCTION_PANEL_IDS) {
    const bucket = byClient.get(clientId);
    if (!bucket) continue;
    for (const sidecar of bucket.sidecars) {
      entries.push(
        toManifestEntry(sidecar, "A", lineageTags.get(clientId) ?? "primary", null, true),
      );
    }
  }

  let stddFiles: string[];
  try {
    stddFiles = await readdir(STDD_PROJECT_SIDECARS_ROOT);
  } catch {
    stddFiles = [];
  }
  for (const file of stddFiles) {
    if (!SIDECAR_PATTERN.test(file)) continue;
    const sidecar_path = join(STDD_PROJECT_SIDECARS_ROOT, file);
    const source = await readFile(sidecar_path, "utf8");
    const sidecar: DiscoveredSidecar = {
      client_id: "stdd",
      client_root: join(STDD_PROJECT_SIDECARS_ROOT, ".."),
      sidecar_path,
      token: tokenFromSidecarPath(sidecar_path),
      byte_length: Buffer.byteLength(source, "utf8"),
      input_identity: computeInputIdentity(source),
    };
    entries.push(toManifestEntry(sidecar, "B", "primary", null, true));
  }

  const smokeCandidates: DiscoveredSidecar[] = [];
  for (const [clientId, bucket] of byClient) {
    if (panelSet.has(clientId)) continue;
    if (lineageTags.get(clientId) === "lineage_duplicate") continue;
    if (await isMethodologyOnlyClient(bucket.sidecars[0].client_root)) continue;
    smokeCandidates.push(...bucket.sidecars);
  }
  smokeCandidates.sort(
    (a, b) => a.client_id.localeCompare(b.client_id) || a.token.localeCompare(b.token),
  );

  const smokeClients = [...new Set(smokeCandidates.map((s) => s.client_id))].slice(
    0,
    TIER_C_SMOKE_COUNT,
  );
  const smokeSet = new Set(smokeClients);
  for (const sidecar of smokeCandidates) {
    if (!smokeSet.has(sidecar.client_id)) continue;
    entries.push(
      toManifestEntry(
        sidecar,
        "C",
        lineageTags.get(sidecar.client_id) ?? "primary",
        null,
        true,
      ),
    );
  }

  const stressBucket = byClient.get(STRESS_CLIENT_ID);
  if (stressBucket) {
    for (const sidecar of stressBucket.sidecars) {
      entries.push(
        toManifestEntry(
          sidecar,
          "D",
          lineageTags.get(STRESS_CLIENT_ID) ?? "primary",
          null,
          true,
        ),
      );
    }
  }

  for (const [clientId, bucket] of byClient) {
    if (panelSet.has(clientId) || smokeSet.has(clientId) || clientId === STRESS_CLIENT_ID) {
      continue;
    }
    const lineage = lineageTags.get(clientId) ?? "primary";
    for (const sidecar of bucket.sidecars) {
      let exclusion_reason: string | null = null;
      let included = false;
      if (lineage === "lineage_duplicate") {
        exclusion_reason = "lineage_duplicate";
      } else if (await isMethodologyOnlyClient(sidecar.client_root)) {
        exclusion_reason = "methodology_only_client";
      } else {
        exclusion_reason = "not_selected_for_tier_abc";
      }
      entries.push(
        toManifestEntry(sidecar, "C", lineage, exclusion_reason, included),
      );
    }
  }

  entries.sort(
    (a, b) =>
      a.tier.localeCompare(b.tier) ||
      a.client_id.localeCompare(b.client_id) ||
      a.token.localeCompare(b.token),
  );

  return entries;
}

export function summarizeScan(entries: ManifestEntry[]): string {
  const included = entries.filter((e) => e.included);
  const lines = [
    `DEBUG: scan complete — ${included.length} included / ${entries.length} discovered`,
    `DEBUG: tier A=${included.filter((e) => e.tier === "A").length}`,
    `DEBUG: tier B=${included.filter((e) => e.tier === "B").length}`,
    `DEBUG: tier C=${included.filter((e) => e.tier === "C").length}`,
    `DEBUG: tier D=${included.filter((e) => e.tier === "D").length}`,
  ];
  return lines.join("\n");
}
