/**
 * [REQ-CITDP_ORDERED_LIST_KEYS] [REQ-TIED_LAYERED_CLIENT_INSTALL] MIG-UNIT-001 / MIG-INT-001
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { PROJECT_DIR_NAME } from "./layout.mjs";
import { migrateOrderedListKeys } from "./migrate-ordered-list-keys.mjs";
import { TIED_REPO_ROOT } from "./constants.mjs";

function writeLegacyTracker(root) {
  const working = path.join(root, PROJECT_DIR_NAME, "working", "FIXTURE-ORDERED-KEYS");
  fs.mkdirSync(working, { recursive: true });
  fs.writeFileSync(
    path.join(working, "sample_tracker.yaml"),
    `evidence:
  commands:
    - "npm test --prefix mcp-server"
execution_evidence:
  operator_evidence:
    commands:
      - "tied_validate_consistency"
`,
  );
}

describe("migrateOrderedListKeys [REQ-CITDP_ORDERED_LIST_KEYS]", () => {
  it("MIG-UNIT-001 migrates legacy commands to command_seq in tracker fixture", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "mig-ordered-"));
    writeLegacyTracker(root);
    const trackerPath = path.join(
      root,
      PROJECT_DIR_NAME,
      "working",
      "FIXTURE-ORDERED-KEYS",
      "sample_tracker.yaml",
    );

    const dry = await migrateOrderedListKeys(root, {
      storeRoot: TIED_REPO_ROOT,
      dryRun: true,
      failIfPending: false,
      logRelativeTo: root,
    });
    assert.equal(dry.ok, true);
    assert.equal(dry.changed, 1);
    assert.match(fs.readFileSync(trackerPath, "utf8"), /commands:/);

    const applied = await migrateOrderedListKeys(root, {
      storeRoot: TIED_REPO_ROOT,
      dryRun: false,
      failIfPending: false,
      logRelativeTo: root,
    });
    assert.equal(applied.ok, true);
    assert.equal(applied.changed, 1);
    const text = fs.readFileSync(trackerPath, "utf8");
    assert.match(text, /command_seq:/);
    assert.doesNotMatch(text, /^\s+commands:/m);
  });

  it("MIG-INT-002 failIfPending exits pending when legacy keys remain", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "mig-pending-"));
    writeLegacyTracker(root);
    const pending = await migrateOrderedListKeys(root, {
      storeRoot: TIED_REPO_ROOT,
      dryRun: true,
      failIfPending: true,
      logRelativeTo: root,
    });
    assert.equal(pending.ok, true);
    assert.equal(pending.changed, 1);
    assert.equal(pending.pending, true);

    await migrateOrderedListKeys(root, {
      storeRoot: TIED_REPO_ROOT,
      dryRun: false,
      failIfPending: false,
      logRelativeTo: root,
    });
    const clean = await migrateOrderedListKeys(root, {
      storeRoot: TIED_REPO_ROOT,
      dryRun: true,
      failIfPending: true,
      logRelativeTo: root,
    });
    assert.equal(clean.changed, 0);
    assert.notEqual(clean.pending, true);
  });

  it("returns nothing to migrate when tied-project scan roots are absent", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "mig-empty-"));
    fs.mkdirSync(path.join(root, PROJECT_DIR_NAME), { recursive: true });
    const result = await migrateOrderedListKeys(root, {
      storeRoot: TIED_REPO_ROOT,
      logRelativeTo: root,
    });
    assert.equal(result.ok, true);
    assert.equal(result.message, "nothing to migrate");
  });
});
