import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { validateManifest, type FeatureManifest } from "./manifest.js";

export type Allocation = {
  feature_identifier: string;
  slug: string;
  directory_name: string;
};

export type CreateResult =
  | { ok: true; outcome: "created" | "existing"; manifest: FeatureManifest }
  | { ok: false; error: "REQUEST_KEY_REQUIRED" | "REQUEST_KEY_COLLISION" | "ALLOCATION_FAILED" | "PUBLISH_FAILED" };

export type MutationResult =
  | { ok: true; manifest: FeatureManifest; next_permitted_phase: string | null }
  | { ok: false; error: "FEATURE_NOT_FOUND" | "STALE_REVISION" | "VALIDATION_FAILED" | "PUBLISH_FAILED" };

type RequestRecord = { fingerprint: string; directory_name: string };

export type LockRecord = { expires_at_ms: number; holder_id?: string; acquired_at_ms?: number; lock_epoch?: number; fencing_token?: string };

export type LockTtlResult =
  | { ok: true; action: "existing_feature"; directory_name: string }
  | { ok: true; action: "eligible_for_allocation" }
  | { ok: false; error: "LOCK_HELD_VALID" };

const DEFAULT_REQUEST_LOCK_TTL_MS = 60_000;

// [IMPL-FEAT_IDEMPOTENT_CREATE] [ARCH-FEAT_IDEMPOTENT_CREATION] [REQ-FEAT_IDEMPOTENT_CREATION] — How: expired locks release; metadata read before blocking; new allocation proceeds when prior lock invalid (S-T18).
export function handleLockTtl(
  records: Record<string, RequestRecord> | undefined,
  requestKey: string,
  lockRecord: LockRecord | null,
  nowMs: number,
): LockTtlResult {
  const prior = records?.[requestKey];
  if (prior) return { ok: true, action: "existing_feature", directory_name: prior.directory_name };
  if (!lockRecord) return { ok: true, action: "eligible_for_allocation" };
  if (lockRecord.expires_at_ms <= nowMs) return { ok: true, action: "eligible_for_allocation" };
  return { ok: false, error: "LOCK_HELD_VALID" };
}

// [IMPL-FEAT_IDEMPOTENT_CREATE] [ARCH-FEAT_IDEMPOTENT_CREATION] [REQ-FEAT_IDEMPOTENT_CREATION] — How: reject rollout skew with deterministic version error (S-T09).
export function validateRequestSchemaVersion(
  requestVersion: number,
  expectedVersion: number,
): { ok: true } | { ok: false; error: "SCHEMA_VERSION_MISMATCH" } {
  if (requestVersion !== expectedVersion) return { ok: false, error: "SCHEMA_VERSION_MISMATCH" };
  return { ok: true };
}

// [IMPL-FEAT_IDEMPOTENT_CREATE] [ARCH-FEAT_IDEMPOTENT_CREATION] [REQ-FEAT_IDEMPOTENT_CREATION] — How: fencing after coordinator recovery (S-T10).
export function enforceLockFencing(
  coordinatorEpoch: number,
  lockEpoch: number,
  fencingToken: string | undefined,
  coordinatorAvailable: boolean,
): { ok: true } | { ok: false; error: "LOCK_COORDINATOR_UNAVAILABLE" | "FENCING_TOKEN_STALE" } {
  if (!coordinatorAvailable) return { ok: false, error: "LOCK_COORDINATOR_UNAVAILABLE" };
  if (coordinatorEpoch > lockEpoch && !fencingToken?.trim()) return { ok: false, error: "FENCING_TOKEN_STALE" };
  if (coordinatorEpoch > lockEpoch && fencingToken === "stale") return { ok: false, error: "FENCING_TOKEN_STALE" };
  return { ok: true };
}

// [IMPL-FEAT_IDEMPOTENT_CREATE] [ARCH-FEAT_IDEMPOTENT_CREATION] [REQ-FEAT_IDEMPOTENT_CREATION] — How: create-path backpressure under retry storm (S-T11).
export function applyCreatePathBackpressure(
  queueDepth: number,
  maxQueueDepth: number,
  inflightLocks: number,
  maxInflightLocks: number,
): "proceed" | "throttle_retryable" {
  if (queueDepth >= maxQueueDepth || inflightLocks >= maxInflightLocks) return "throttle_retryable";
  return "proceed";
}

export type LockObservabilityView = {
  holder_id: string;
  age_ms: number;
  expires_at_ms: number;
  stale_lock: boolean;
};

// [IMPL-FEAT_IDEMPOTENT_CREATE] [ARCH-FEAT_IDEMPOTENT_CREATION] [REQ-FEAT_IDEMPOTENT_CREATION] — How: operator lock holder visibility (S-O07).
export function exposeLockHolderObservability(lockRecord: LockRecord, nowMs: number): LockObservabilityView {
  const acquired = lockRecord.acquired_at_ms ?? nowMs;
  const holder = lockRecord.holder_id ?? "unknown";
  const expires = lockRecord.expires_at_ms;
  return {
    holder_id: holder,
    age_ms: Math.max(0, nowMs - acquired),
    expires_at_ms: expires,
    stale_lock: expires <= nowMs,
  };
}

function readLockRecord(lockPath: string): LockRecord | null {
  const metaPath = path.join(lockPath, "lock-meta.json");
  if (!fs.existsSync(metaPath)) return null;
  try {
    const parsed = JSON.parse(fs.readFileSync(metaPath, "utf8")) as LockRecord;
    if (typeof parsed.expires_at_ms === "number") return parsed;
  } catch { /* ignore */ }
  return null;
}

function writeLockRecord(lockPath: string, expiresAtMs: number): void {
  fs.writeFileSync(path.join(lockPath, "lock-meta.json"), JSON.stringify({ expires_at_ms: expiresAtMs }), "utf8");
}

function stableJson(value: unknown): string {
  return JSON.stringify(value, (_key, item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return item;
    return Object.fromEntries(Object.entries(item).sort(([left], [right]) => left.localeCompare(right)));
  });
}

// [IMPL-FEAT_STORE] [ARCH-FEAT_STORE_PERSISTENCE] [REQ-FEAT_STORE_PERSISTENCE] — How: persist and load one feature manifest beneath the feature store root without copying canonical TIED records.
export class FeatureStore {
  readonly root: string;

  constructor(root: string) {
    this.root = path.resolve(root);
    fs.mkdirSync(this.root, { recursive: true });
  }

  listDirectories(): string[] {
    return fs.readdirSync(this.root, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && /^FEAT-\d{3,}-/.test(entry.name))
      .map((entry) => entry.name)
      .sort();
  }

  // [IMPL-FEAT_STORE] [ARCH-FEAT_STORE_PERSISTENCE] [REQ-FEAT_STORE_PERSISTENCE] — How: constrain feature paths to the configured feature store root.
  resolve(featureDirectory: string): string {
    if (!featureDirectory || path.isAbsolute(featureDirectory) || featureDirectory.includes("\0")) {
      throw new Error("INVALID_PATH");
    }
    const resolved = path.resolve(this.root, featureDirectory);
    if (resolved !== this.root && !resolved.startsWith(`${this.root}${path.sep}`)) {
      throw new Error("INVALID_PATH");
    }
    return resolved;
  }

  // [IMPL-FEAT_IDENTIFIER_ALLOCATOR] [ARCH-FEAT_IDENTIFIER_ALLOCATION] [REQ-FEAT_IDENTIFIER_ALLOCATION] — How: apply one stable normalization pipeline to equivalent titles.
  generateSlug(title: string): string {
    const slug = title
      .normalize("NFKC")
      .trim()
      .toLocaleLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "");
    if (!slug) throw new Error("EMPTY_SLUG");
    return slug;
  }

  // [IMPL-FEAT_IDENTIFIER_ALLOCATOR] [ARCH-FEAT_IDENTIFIER_ALLOCATION] [REQ-FEAT_IDENTIFIER_ALLOCATION] — How: scan existing directories and choose the lowest unused FEAT number.
  allocate(title: string): Allocation {
    if (!title.trim()) throw new Error("EMPTY_TITLE");
    const slug = this.generateSlug(title);
    const used = new Set(
      fs.readdirSync(this.root, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => /^FEAT-(\d{3,})(?:-|$)/.exec(entry.name)?.[1])
        .filter((number): number is string => number !== undefined)
        .map(Number),
    );
    let number = 1;
    while (used.has(number)) number += 1;
    const feature_identifier = `FEAT-${String(number).padStart(3, "0")}`;
    return { feature_identifier, slug, directory_name: `${feature_identifier}-${slug}` };
  }

  createManifest(allocation: Allocation, title = allocation.slug.replace(/-/g, " ")): FeatureManifest {
    const now = new Date().toISOString();
    return {
      schema_version: "feature-manifest.v1",
      feature_id: allocation.feature_identifier,
      slug: allocation.slug,
      title,
      mode: "greenfield",
      status: "draft",
      revision: 1,
      created_at: now,
      updated_at: now,
      canonical_tokens: { requirements: [], architecture: [], implementations: [] },
      artifacts: [],
      open_questions: [],
      dependencies: [],
      tasks: [],
      history: [],
    };
  }

  // [IMPL-FEAT_STORE] [ARCH-FEAT_STORE_PERSISTENCE] [REQ-FEAT_STORE_PERSISTENCE] — How: read and parse the feature-local manifest as the orchestration source.
  read(featureDirectory: string): FeatureManifest {
    const directory = this.resolve(featureDirectory);
    try {
      const parsed = yaml.load(fs.readFileSync(path.join(directory, "feature.yaml"), "utf8"));
      const result = validateManifest(parsed);
      if (!result.ok) throw new Error("READ_FAILED");
      return result.manifest;
    } catch (error) {
      if (error instanceof Error && error.message === "READ_FAILED") throw error;
      throw new Error("READ_FAILED");
    }
  }

  // [IMPL-FEAT_STORE] [ARCH-FEAT_STORE_PERSISTENCE] [REQ-FEAT_STORE_PERSISTENCE] — How: publish a complete serialized manifest through the atomic mutation implementation.
  publish(featureDirectory: string, manifest: FeatureManifest): FeatureManifest {
    const directory = this.resolve(featureDirectory);
    const validation = validateManifest(manifest);
    if (!validation.ok) throw new Error("PUBLISH_FAILED");
    const temporary = path.join(directory, `.feature.yaml.${process.pid}.${crypto.randomUUID()}.tmp`);
    try {
      fs.mkdirSync(directory, { recursive: true });
      fs.writeFileSync(temporary, yaml.dump(validation.manifest, { sortKeys: true, lineWidth: -1 }), "utf8");
      fs.renameSync(temporary, path.join(directory, "feature.yaml"));
      return validation.manifest;
    } catch {
      try { fs.rmSync(temporary, { force: true }); } catch { /* preserve original error */ }
      throw new Error("PUBLISH_FAILED");
    }
  }

  // [IMPL-FEAT_IDEMPOTENT_CREATE] [ARCH-FEAT_IDEMPOTENT_CREATION] [REQ-FEAT_IDEMPOTENT_CREATION] — How: lock the request key before lookup, allocation, and complete publication.
  createIdempotently(
    requestKey: string,
    title: string,
    options: {
      mode?: "greenfield" | "brownfield";
      canonical_tokens?: FeatureManifest["canonical_tokens"];
      lock_ttl_ms?: number;
      now_ms?: number;
    } = {},
  ): CreateResult {
    if (!requestKey.trim()) return { ok: false, error: "REQUEST_KEY_REQUIRED" };
    const metadataPath = path.join(this.root, "request-keys.yaml");
    const lockPath = path.join(this.root, `.request-${crypto.createHash("sha256").update(requestKey).digest("hex")}.lock`);
    const nowMs = options.now_ms ?? Date.now();
    const lockTtlMs = options.lock_ttl_ms ?? DEFAULT_REQUEST_LOCK_TTL_MS;
    let publishedDirectory: string | undefined;
    const records = fs.existsSync(metadataPath) ? (yaml.load(fs.readFileSync(metadataPath, "utf8")) as Record<string, RequestRecord>) ?? {} : {};
    try {
      fs.mkdirSync(lockPath);
      writeLockRecord(lockPath, nowMs + lockTtlMs);
    } catch {
      const ttl = handleLockTtl(records, requestKey, readLockRecord(lockPath), nowMs);
      if (ttl.ok && ttl.action === "existing_feature") {
        return { ok: true, outcome: "existing", manifest: this.read(ttl.directory_name) };
      }
      if (ttl.ok && ttl.action === "eligible_for_allocation") {
        fs.rmSync(lockPath, { recursive: true, force: true });
        try {
          fs.mkdirSync(lockPath);
          writeLockRecord(lockPath, nowMs + lockTtlMs);
        } catch {
          return { ok: false, error: "REQUEST_KEY_COLLISION" };
        }
      } else {
        const refreshed = fs.existsSync(metadataPath)
          ? (yaml.load(fs.readFileSync(metadataPath, "utf8")) as Record<string, RequestRecord>) ?? {}
          : {};
        const fingerprint = crypto.createHash("sha256").update(stableJson({ title: title.trim(), options })).digest("hex");
        const inFlight = refreshed[requestKey];
        if (inFlight && inFlight.fingerprint === fingerprint) {
          return { ok: true, outcome: "existing", manifest: this.read(inFlight.directory_name) };
        }
        return { ok: false, error: "REQUEST_KEY_COLLISION" };
      }
    }
    try {
      const fingerprint = crypto.createHash("sha256").update(stableJson({ title: title.trim(), options })).digest("hex");
      const prior = records[requestKey];
      if (prior && prior.fingerprint !== fingerprint) return { ok: false, error: "REQUEST_KEY_COLLISION" };
      if (prior) return { ok: true, outcome: "existing", manifest: this.read(prior.directory_name) };
      const allocation = this.allocate(title);
      const manifest = this.createManifest(allocation, title.trim());
      manifest.mode = options.mode ?? "greenfield";
      if (options.canonical_tokens) manifest.canonical_tokens = options.canonical_tokens;
      this.publish(allocation.directory_name, manifest);
      publishedDirectory = allocation.directory_name;
      records[requestKey] = { fingerprint, directory_name: allocation.directory_name };
      const temporary = `${metadataPath}.${process.pid}.${crypto.randomUUID()}.tmp`;
      fs.writeFileSync(temporary, yaml.dump(records, { sortKeys: true, lineWidth: -1 }), "utf8");
      fs.renameSync(temporary, metadataPath);
      return { ok: true, outcome: "created", manifest };
    } catch {
      if (publishedDirectory) fs.rmSync(this.resolve(publishedDirectory), { recursive: true, force: true });
      return { ok: false, error: "PUBLISH_FAILED" };
    } finally {
      fs.rmSync(lockPath, { recursive: true, force: true });
    }
  }

  // [IMPL-FEAT_ATOMIC_MUTATION] [ARCH-FEAT_REVISION_SAFE_MUTATION] [REQ-FEAT_REVISION_SAFE_MUTATION] — How: serialize mutation, compare revision, and publish with a same-directory atomic replacement.
  mutate(featureIdentifier: string, expectedRevision: number, candidate: FeatureManifest): MutationResult {
    const directory = fs.readdirSync(this.root).find((entry) => entry.startsWith(`${featureIdentifier}-`));
    if (!directory) return { ok: false, error: "FEATURE_NOT_FOUND" };
    const lockPath = path.join(this.root, `.${featureIdentifier}.mutation.lock`);
    try { fs.mkdirSync(lockPath); } catch { return { ok: false, error: "STALE_REVISION" }; }
    try {
      let current: FeatureManifest;
      try { current = this.read(directory); } catch { return { ok: false, error: "FEATURE_NOT_FOUND" }; }
      if (current.revision !== expectedRevision) return { ok: false, error: "STALE_REVISION" };
      if (candidate.feature_id !== current.feature_id || candidate.slug !== current.slug) return { ok: false, error: "VALIDATION_FAILED" };
      const next = { ...candidate, revision: current.revision + 1, updated_at: new Date().toISOString() };
      const updated = this.publish(directory, next);
      const phaseOrder = ["draft", "refining", "specified", "planned", "tasked", "verifying", "closed"];
      const index = phaseOrder.indexOf(updated.status);
      return { ok: true, manifest: updated, next_permitted_phase: index >= 0 && index < phaseOrder.length - 1 ? phaseOrder[index + 1] : null };
    } catch {
      return { ok: false, error: "PUBLISH_FAILED" };
    } finally {
      fs.rmSync(lockPath, { recursive: true, force: true });
    }
  }
}
