/**
 * [REQ-TIED_TWO_FOLDER_LAYOUT] Unit tests for store corpus resolution and bundle materialization.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import {
  resolveStoreMethodologyIndexRoot,
  materializeLinkedMethodologyBundle,
} from "./methodology-bundle.mjs";
import { TIED_REPO_ROOT } from "./constants.mjs";

describe("methodology-bundle [REQ-TIED_TWO_FOLDER_LAYOUT]", () => {
  it("resolveStoreMethodologyIndexRoot finds templates corpus in TIED store", () => {
    const root = resolveStoreMethodologyIndexRoot(TIED_REPO_ROOT);
    assert.ok(fs.existsSync(path.join(root, "requirements.yaml")));
  });

  it("materializeLinkedMethodologyBundle writes under tied-bundle only", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "tied-bundle-mat-"));
    try {
      const bundleRoot = materializeLinkedMethodologyBundle(tmp, TIED_REPO_ROOT, "live");
      assert.match(bundleRoot, /tied-bundle$/);
      assert.ok(fs.existsSync(path.join(bundleRoot, "requirements.yaml")));
      assert.ok(
        fs.existsSync(path.join(bundleRoot, "requirements", "REQ-TIED_FIDELITY_RESEARCH.yaml")),
      );
      assert.ok(!fs.existsSync(path.join(tmp, "tied", ".linked-methodology-view")));
      assert.ok(!fs.existsSync(path.join(tmp, "tied", "methodology", "requirements.yaml")));
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("resolveStoreMethodologyIndexRoot prefers templates over empty tied/methodology", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "tied-store-corpus-"));
    try {
      fs.mkdirSync(path.join(tmp, "tied", "methodology", "requirements"), { recursive: true });
      fs.writeFileSync(path.join(tmp, "tied", "methodology", "requirements.yaml"), "{}\n");
      fs.mkdirSync(path.join(tmp, "templates", "requirements"), { recursive: true });
      fs.writeFileSync(path.join(tmp, "templates", "requirements.yaml"), "{}\n");
      fs.writeFileSync(
        path.join(tmp, "templates", "requirements", "REQ-TIED_FIDELITY_RESEARCH.yaml"),
        "token: REQ-TIED_FIDELITY_RESEARCH\n",
      );
      const root = resolveStoreMethodologyIndexRoot(tmp);
      assert.ok(root.endsWith(`${path.sep}templates`));
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
