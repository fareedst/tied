import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { FeatureStore } from "./store.js";

export type MigrationInput = {
  feature_spec_paths?: string[];
  records?: Array<Record<string, unknown>>;
  agentstream_order?: string[];
};
export type MigrationCandidate = {
  identity: string;
  title: string;
  source: string;
  source_index: number;
  order: number;
};
export type MigrationConflict = {
  code: "DUPLICATE_IDENTITY" | "ORDER_AMBIGUITY" | "UNSUPPORTED_RECORD" | "OWNERSHIP_CONFLICT";
  source: string;
  identity: string;
  field: string;
  reason: string;
  corrective_action: string;
};
export type MigrationPreview = {
  candidates: MigrationCandidate[];
  source_order: string[];
  conflicts: MigrationConflict[];
  writes_planned: false;
  preview_hash: string;
};
export type MigrationResult =
  | { ok: true; backup_path: string; published: string[]; source_order: string[] }
  | { ok: false; error: "CONFIRMATION_REQUIRED" | "CONFLICTS_PRESENT" | "BACKUP_FAILURE" | "PUBLISH_FAILURE" | "ROLLBACK_FAILURE"; backup_path?: string; affected_paths?: string[] };

function stable(value: unknown): string {
  return JSON.stringify(value, (_key, entry) =>
    entry && typeof entry === "object" && !Array.isArray(entry)
      ? Object.fromEntries(Object.entries(entry).sort(([left], [right]) => left.localeCompare(right)))
      : entry);
}

function recordsFromFile(file: string): Array<Record<string, unknown>> {
  const parsed = yaml.load(fs.readFileSync(file, "utf8"));
  if (Array.isArray(parsed)) return parsed.filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === "object" && !Array.isArray(entry));
  if (parsed && typeof parsed === "object") {
    const object = parsed as Record<string, unknown>;
    for (const key of ["specs", "features", "records", "batches"]) {
      if (Array.isArray(object[key])) return object[key].filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === "object" && !Array.isArray(entry));
    }
  }
  throw new Error("INVALID_SOURCE");
}

// [IMPL-FEAT_MIGRATION_PREVIEW] [ARCH-FEAT_MIGRATION_PREVIEW] [REQ-FEAT_LEGACY_MIGRATION] — normalize legacy inputs into a deterministic no-write migration preview.
export function buildMigrationPreview(input: MigrationInput): MigrationPreview {
  const records: Array<{ record: Record<string, unknown>; source: string; source_index: number }> = [];
  for (const file of input.feature_spec_paths ?? []) {
    records.push(...recordsFromFile(file).map((record, source_index) => ({ record, source: file, source_index })));
  }
  for (const [source_index, record] of (input.records ?? []).entries()) records.push({ record, source: "inline", source_index });
  const requestedOrder = input.agentstream_order ?? [];
  const orderMap = new Map(requestedOrder.map((identity, index) => [identity, index]));
  const conflicts: MigrationConflict[] = [];
  const seen = new Map<string, MigrationCandidate>();
  const candidates: MigrationCandidate[] = [];
  for (const entry of records) {
    const identityValue = entry.record.id ?? entry.record.identity ?? entry.record.feature_id;
    const titleValue = entry.record.title ?? entry.record.name;
    if (typeof identityValue !== "string" || typeof titleValue !== "string" || !titleValue.trim()) {
      conflicts.push({
        code: "UNSUPPORTED_RECORD", source: entry.source, identity: String(identityValue ?? ""), field: "title",
        reason: "legacy record has no supported identity and title", corrective_action: "add id and title to the source record",
      });
      continue;
    }
    const identity = identityValue.trim();
    const candidate: MigrationCandidate = {
      identity, title: titleValue.trim(), source: entry.source, source_index: entry.source_index,
      order: orderMap.get(identity) ?? requestedOrder.length + entry.source_index,
    };
    const prior = seen.get(identity);
    if (prior) conflicts.push({
      code: "DUPLICATE_IDENTITY", source: entry.source, identity, field: "id",
      reason: `identity already appears in ${prior.source}`, corrective_action: "merge or rename the legacy records before confirmation",
    });
    else seen.set(identity, candidate);
    candidates.push(candidate);
  }
  const missingOrder = candidates.filter((candidate) => requestedOrder.length > 0 && !orderMap.has(candidate.identity));
  for (const candidate of missingOrder) conflicts.push({
    code: "ORDER_AMBIGUITY", source: candidate.source, identity: candidate.identity, field: "order",
    reason: "record is absent from the ordered agentstream input", corrective_action: "add the identity to agentstream_order",
  });
  conflicts.sort((left, right) => left.source.localeCompare(right.source) || left.code.localeCompare(right.code) || left.field.localeCompare(right.field) || left.identity.localeCompare(right.identity));
  candidates.sort((left, right) => left.order - right.order || left.source.localeCompare(right.source) || left.source_index - right.source_index);
  const source_order = candidates.map((candidate) => candidate.identity);
  const body = { candidates, source_order, conflicts };
  return { ...body, writes_planned: false, preview_hash: crypto.createHash("sha256").update(stable(body)).digest("hex") };
}

// [IMPL-FEAT_MIGRATION_APPLY] [ARCH-FEAT_MIGRATION_PREVIEW] [REQ-FEAT_LEGACY_MIGRATION] — apply only an explicitly confirmed clean preview with backup and rollback.
export function applyConfirmedMigration(preview: MigrationPreview, options: { confirm_migration?: boolean; expected_preview_hash?: string } = {}, destination: string): MigrationResult {
  if (options.confirm_migration !== true) return { ok: false, error: "CONFIRMATION_REQUIRED" };
  if (options.expected_preview_hash && options.expected_preview_hash !== preview.preview_hash) return { ok: false, error: "PUBLISH_FAILURE" };
  if (preview.conflicts.length > 0) return { ok: false, error: "CONFLICTS_PRESENT" };
  const featureRoot = path.join(path.resolve(destination), "tied", "features");
  const backupPath = path.join(path.resolve(destination), ".tied-migration-backups", preview.preview_hash);
  const store = new FeatureStore(featureRoot);
  const published: string[] = [];
  try {
    fs.mkdirSync(backupPath, { recursive: true });
    for (const directory of store.listDirectories()) fs.cpSync(store.resolve(directory), path.join(backupPath, directory), { recursive: true });
  } catch {
    return { ok: false, error: "BACKUP_FAILURE", backup_path: backupPath };
  }
  try {
    for (const candidate of preview.candidates) {
      const allocation = store.allocate(candidate.title);
      const manifest = store.createManifest(allocation, candidate.title);
      manifest.mode = "brownfield";
      store.publish(allocation.directory_name, manifest);
      published.push(allocation.directory_name);
    }
    return { ok: true, backup_path: backupPath, published, source_order: preview.source_order };
  } catch {
    try {
      for (const directory of published) fs.rmSync(store.resolve(directory), { recursive: true, force: true });
      for (const directory of fs.readdirSync(backupPath)) fs.cpSync(path.join(backupPath, directory), store.resolve(directory), { recursive: true });
      return { ok: false, error: "PUBLISH_FAILURE", backup_path: backupPath, affected_paths: published.sort() };
    } catch {
      return { ok: false, error: "ROLLBACK_FAILURE", backup_path: backupPath, affected_paths: published.sort() };
    }
  }
}
