/**
 * [REQ-TIED_LAYERED_CLIENT_INSTALL] MIG-UNIT-002 — parseInstallLayersArgs for ordered-key migration.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseInstallLayersArgs } from "./install-layers.mjs";

describe("parseInstallLayersArgs migrate-ordered-list-keys [MIG-UNIT-002]", () => {
  it("parses --migrate-ordered-list-keys with target path", () => {
    const parsed = parseInstallLayersArgs(["--migrate-ordered-list-keys", "/tmp"]);
    assert.equal(parsed.migrateOrderedListKeys, true);
    assert.equal(parsed.migrateFailIfPending, false);
    assert.equal(parsed.targets[0], "/tmp");
  });

  it("parses --fail-if-pending with migrate flag", () => {
    const parsed = parseInstallLayersArgs([
      "--migrate-ordered-list-keys",
      "--fail-if-pending",
      ".",
    ]);
    assert.equal(parsed.migrateOrderedListKeys, true);
    assert.equal(parsed.migrateFailIfPending, true);
    assert.equal(parsed.dryRun, false);
  });

  it("parses --dry-run with migrate flag", () => {
    const parsed = parseInstallLayersArgs(["--migrate-ordered-list-keys", "--dry-run", "."]);
    assert.equal(parsed.migrateOrderedListKeys, true);
    assert.equal(parsed.dryRun, true);
  });

  it("rejects --fail-if-pending without --migrate-ordered-list-keys", () => {
    assert.throws(
      () => parseInstallLayersArgs(["--fail-if-pending", "."]),
      /--fail-if-pending requires --migrate-ordered-list-keys/,
    );
  });
});
