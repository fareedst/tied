/**
 * [REQ-TIED_LAYERED_CLIENT_INSTALL] Composition: linked install materializes gitignored skill tree.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { installTiedLayers } from "./lib/install-layers-core.mjs";
import { readInstallManifest } from "./lib/layers/install-manifest.mjs";
import { TIED_REPO_ROOT } from "./lib/constants.mjs";
import { resolveTiedLayout } from "./lib/layout.mjs";
import { migrateLayout } from "./lib/migrate-layout.mjs";
import { detectLegacyLayout } from "./lib/layout.mjs";

describe("install-layers integration [REQ-TIED_LAYERED_CLIENT_INSTALL]", () => {
  it("linked install writes manifest and gitignored skill stubs", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "tied-install-int-"));
    installTiedLayers(tmp, {
      storeRoot: TIED_REPO_ROOT,
      mode: "linked",
      layers: ["db", "skills"],
      harness: "cursor",
      skipVerify: true,
    });
    const manifest = readInstallManifest(tmp);
    assert.equal(manifest?.mode, "linked");
    assert.ok(fs.existsSync(path.join(tmp, ".cursor", "skills", "tied-yaml", "SKILL.md")));
    const tiedDir = resolveTiedLayout(tmp).tiedDir;
    assert.ok(fs.existsSync(path.join(tiedDir, "requirements.yaml")));
    assert.ok(!fs.existsSync(path.join(tmp, "tied", "methodology", "requirements.yaml")));
    assert.ok(!fs.existsSync(path.join(tmp, "tied-project", "methodology", "requirements.yaml")));
  });

  it("linked methodology layer materializes tied-bundle corpus", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "tied-install-bundle-"));
    installTiedLayers(tmp, {
      storeRoot: TIED_REPO_ROOT,
      mode: "linked",
      layers: ["methodology"],
      harness: "cursor",
      skipVerify: true,
    });
    assert.ok(fs.existsSync(path.join(tmp, "tied-bundle", "requirements.yaml")));
    assert.ok(!fs.existsSync(path.join(tmp, "tied", ".linked-methodology-view")));
  });

  it("migrate-layout is idempotent on legacy fixture [REQ-TIED_TWO_FOLDER_LAYOUT]", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "tied-migrate-int-"));
    fs.mkdirSync(path.join(tmp, "tied"), { recursive: true });
    fs.writeFileSync(path.join(tmp, "tied", "requirements.yaml"), "requirements: []\n");
    fs.mkdirSync(path.join(tmp, "tied", "methodology"), { recursive: true });
    fs.mkdirSync(path.join(tmp, "working", "REQ-MIG-INT"), { recursive: true });
    fs.writeFileSync(path.join(tmp, "working", "REQ-MIG-INT", "PLAN.md"), "# p\n");
    assert.equal(detectLegacyLayout(tmp).detected, true);
    const first = migrateLayout(tmp, { storeRoot: TIED_REPO_ROOT, skipInstall: true });
    assert.equal(first.ok, true);
    assert.equal(detectLegacyLayout(tmp).detected, false);
    const second = migrateLayout(tmp, { storeRoot: TIED_REPO_ROOT, skipInstall: true });
    assert.equal(second.action, "noop");
  });
});
