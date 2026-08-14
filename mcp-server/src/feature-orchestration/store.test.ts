import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { FeatureStore } from "./store.js";

describe("FEATURE_STORE REQ-FEAT_STORE_PERSISTENCE", () => {
  it("allocates deterministic identifiers and persists a complete manifest", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "feature-store-"));
    const store = new FeatureStore(root);

    // [IMPL-FEAT_IDENTIFIER_ALLOCATOR] [ARCH-FEAT_IDENTIFIER_ALLOCATION] [REQ-FEAT_IDENTIFIER_ALLOCATION] — How: scan existing directories and choose the lowest unused FEAT number.
    const allocation = store.allocate("Real-time chat system");
    assert.deepEqual(allocation, {
      feature_identifier: "FEAT-001",
      slug: "real-time-chat-system",
      directory_name: "FEAT-001-real-time-chat-system",
    });

    // [IMPL-FEAT_STORE] [ARCH-FEAT_STORE_PERSISTENCE] [REQ-FEAT_STORE_PERSISTENCE] — How: publish a complete serialized manifest through the atomic mutation implementation.
    const manifest = store.createManifest(allocation);
    store.publish(allocation.directory_name, manifest);
    assert.deepEqual(store.read(allocation.directory_name), manifest);
    assert.match(fs.readFileSync(path.join(root, allocation.directory_name, "feature.yaml"), "utf8"), /feature_id: FEAT-001/);
  });

  it("rejects traversal and preserves the old file when publication fails", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "feature-store-"));
    const store = new FeatureStore(root);
    assert.throws(() => store.resolve("../escape"), /INVALID_PATH/);

    const allocation = store.allocate("Safe feature");
    const manifest = store.createManifest(allocation);
    store.publish(allocation.directory_name, manifest);
    const manifestPath = path.join(root, allocation.directory_name, "feature.yaml");
    const before = fs.readFileSync(manifestPath, "utf8");
    assert.throws(() => store.publish(allocation.directory_name, { ...manifest, title: "" }), /PUBLISH_FAILED/);
    assert.equal(fs.readFileSync(manifestPath, "utf8"), before);
  });
});

describe("IDEMPOTENT_CREATE REQ-FEAT_IDEMPOTENT_CREATION", () => {
  it("returns the original feature for a matching request key and rejects collisions", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "feature-store-"));
    const store = new FeatureStore(root);
    const first = store.createIdempotently("request-1", "Chat", { mode: "greenfield" });
    const retry = store.createIdempotently("request-1", "Chat", { mode: "greenfield" });
    assert.equal(first.ok, true);
    assert.deepEqual(retry, { ok: true, outcome: "existing", manifest: first.manifest });

    const collision = store.createIdempotently("request-1", "Different", { mode: "greenfield" });
    assert.deepEqual(collision, { ok: false, error: "REQUEST_KEY_COLLISION" });
  });
});

describe("ATOMIC_MUTATION REQ-FEAT_REVISION_SAFE_MUTATION", () => {
  it("uses compare-and-swap revisions and rejects stale writers", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "feature-store-"));
    const store = new FeatureStore(root);
    const created = store.createIdempotently("request-1", "Chat", { mode: "greenfield" });
    assert.equal(created.ok, true);
    if (!created.ok) return;
    const updated = store.mutate(created.manifest.feature_id, 1, { ...created.manifest, status: "refining" });
    assert.equal(updated.ok, true);
    const stale = store.mutate(created.manifest.feature_id, 1, { ...created.manifest, status: "specified" });
    assert.equal(stale.ok, false);
    if (!stale.ok) assert.equal(stale.error, "STALE_REVISION");
  });
});
