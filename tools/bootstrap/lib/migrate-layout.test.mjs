/**
 * [REQ-TIED_TWO_FOLDER_LAYOUT] MIGRATE_LAYOUT — brownfield fixture, idempotent second run.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import {
  BUNDLE_DIR_NAME,
  PROJECT_DIR_NAME,
  detectLegacyLayout,
} from "./layout.mjs";
import { migrateLayout } from "./migrate-layout.mjs";
import { TIED_REPO_ROOT } from "./constants.mjs";

function mkLegacyFixture(root) {
  fs.mkdirSync(path.join(root, "tied"), { recursive: true });
  fs.writeFileSync(path.join(root, "tied", "requirements.yaml"), "requirements: []\n");
  fs.mkdirSync(path.join(root, "tied", "methodology"), { recursive: true });
  fs.writeFileSync(path.join(root, "tied", "methodology", "requirements.yaml"), "requirements: []\n");
  fs.mkdirSync(path.join(root, "tied", "docs"), { recursive: true });
  fs.writeFileSync(path.join(root, ".tied-yaml.yaml"), "scalar_style: block\n");
  fs.mkdirSync(path.join(root, "templates"), { recursive: true });
  fs.mkdirSync(path.join(root, "working", "REQ-MIGRATE-FIXTURE"), { recursive: true });
  fs.writeFileSync(
    path.join(root, "working", "REQ-MIGRATE-FIXTURE", "PLAN.md"),
    "# fixture plan\n",
  );
  fs.mkdirSync(path.join(root, "working", "REQ-MIGRATE-FIXTURE", "gates"), { recursive: true });
  fs.writeFileSync(
    path.join(root, "working", "REQ-MIGRATE-FIXTURE", "gates", "verification.json"),
    "{}\n",
  );
}

describe("migrateLayout [REQ-TIED_TWO_FOLDER_LAYOUT]", () => {
  it("migrates legacy tied/ + root working/ to two-folder layout", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "tfl-migrate-"));
    mkLegacyFixture(root);
    assert.equal(detectLegacyLayout(root).detected, true);

    const first = migrateLayout(root, {
      storeRoot: TIED_REPO_ROOT,
      skipInstall: true,
      skipGitignore: false,
    });
    assert.equal(first.ok, true);
    assert.notEqual(first.action, "noop");

    assert.ok(!fs.existsSync(path.join(root, "tied")));
    assert.ok(fs.existsSync(path.join(root, PROJECT_DIR_NAME, "requirements.yaml")));
    assert.ok(
      fs.existsSync(
        path.join(root, PROJECT_DIR_NAME, "working", "REQ-MIGRATE-FIXTURE", "PLAN.md"),
      ),
    );
    assert.ok(
      fs.existsSync(
        path.join(
          root,
          BUNDLE_DIR_NAME,
          "working",
          "REQ-MIGRATE-FIXTURE",
          "gates",
          "verification.json",
        ),
      ),
    );
    assert.ok(fs.existsSync(path.join(root, PROJECT_DIR_NAME, "config.yaml")));
    assert.equal(detectLegacyLayout(root).detected, false);

    const second = migrateLayout(root, {
      storeRoot: TIED_REPO_ROOT,
      skipInstall: true,
    });
    assert.equal(second.ok, true);
    assert.equal(second.action, "noop");
  });

  it("store dry-run returns planned commands without mutating", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "tfl-migrate-dry-"));
    mkLegacyFixture(root);
    const before = fs.readFileSync(path.join(root, "tied", "requirements.yaml"), "utf8");
    const result = migrateLayout(root, { store: true, dryRun: true, storeRoot: TIED_REPO_ROOT });
    assert.equal(result.ok, true);
    assert.equal(result.action, "dry_run_store");
    assert.ok(Array.isArray(result.planned_commands));
    assert.ok(result.planned_commands.length > 0);
    assert.equal(fs.readFileSync(path.join(root, "tied", "requirements.yaml"), "utf8"), before);
  });
});
