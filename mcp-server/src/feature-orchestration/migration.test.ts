import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { applyConfirmedMigration, buildMigrationPreview } from "./migration.js";

describe("MIGRATION_PREVIEW REQ-FEAT_LEGACY_MIGRATION", () => {
  it("produces a no-write deterministic preview retaining source order and conflicts", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "batch6-migration-"));
    const source = path.join(root, "initial-specs.yaml");
    fs.writeFileSync(source, "specs:\n  - title: First feature\n    id: first\n  - title: First feature\n    id: first\n");
    const before = fs.readFileSync(source, "utf8");
    const preview = buildMigrationPreview({ feature_spec_paths: [source], agentstream_order: ["first", "first"] });
    assert.equal(preview.writes_planned, false);
    assert.equal(preview.source_order.join(","), "first,first");
    assert.ok(preview.conflicts.length > 0);
    assert.equal(fs.readFileSync(source, "utf8"), before);
  });
});

describe("MIGRATION_APPLY REQ-FEAT_LEGACY_MIGRATION", () => {
  it("requires confirmation and creates a recoverable backup on apply", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "batch6-migration-"));
    const preview = buildMigrationPreview({ records: [{ id: "first", title: "First feature" }] });
    const denied = applyConfirmedMigration(preview, {}, root);
    assert.equal(denied.ok, false);
    if (denied.ok) return;
    assert.equal(denied.error, "CONFIRMATION_REQUIRED");
    const applied = applyConfirmedMigration(preview, { confirm_migration: true }, root);
    assert.equal(applied.ok, true);
    if (!applied.ok) return;
    assert.ok(fs.existsSync(applied.backup_path));
    assert.equal(fs.existsSync(path.join(root, "tied", "requirements.yaml")), false);
  });
});
