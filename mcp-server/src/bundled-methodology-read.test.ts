/**
 * [IMPL-TIED_METHODOLOGY_CLIENT_BOUNDARY] [REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY]
 * Phase B RED: bundled read parity fixture vs copied-tree methodology reads.
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { clearBasePathCache, getMethodologyBasePath, resolveBundledMethodologyPath } from "./yaml-loader.js";
import {
  compareDiskAndBundledParity,
  captureMethodologyReadProbe,
  writeCopiedTreeFixture,
} from "./bundled-methodology-read.js";
import { loadDetail } from "./detail-loader.js";

beforeEach(() => {
  delete process.env.TIED_BASE_PATH;
  delete process.env.TIED_METHODOLOGY_BUNDLE_PATH;
  clearBasePathCache();
});

describe("bundled methodology read spike [REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY]", () => {
  it("resolveBundledMethodologyPath returns null when env unset or missing dir", () => {
    assert.strictEqual(resolveBundledMethodologyPath(), null);
    process.env.TIED_METHODOLOGY_BUNDLE_PATH = "/nonexistent/bundle/path";
    assert.strictEqual(resolveBundledMethodologyPath(), null);
  });

  it("getMethodologyBasePath prefers bundled corpus over local tied/methodology", () => {
    const client = fs.mkdtempSync(path.join(os.tmpdir(), "tied-mcb-bundle-"));
    const bundle = fs.mkdtempSync(path.join(os.tmpdir(), "tied-mcb-corpus-"));
    try {
      fs.mkdirSync(path.join(client, "methodology"), { recursive: true });
      fs.writeFileSync(path.join(client, "methodology", "marker-local.txt"), "local", "utf8");
      fs.writeFileSync(path.join(bundle, "marker-bundle.txt"), "bundle", "utf8");
      process.env.TIED_BASE_PATH = client;
      process.env.TIED_METHODOLOGY_BUNDLE_PATH = bundle;
      clearBasePathCache();
      assert.strictEqual(getMethodologyBasePath(), bundle);
    } finally {
      fs.rmSync(client, { recursive: true });
      fs.rmSync(bundle, { recursive: true });
    }
  });

  it("parity: bundled corpus matches copied-tree for methodology-first, sentinel, and project fallback", () => {
    const tiedBase = fs.mkdtempSync(path.join(os.tmpdir(), "tied-mcb-fixture-"));
    const bundleDir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-mcb-bundle-fix-"));
    try {
      const tokens = writeCopiedTreeFixture(tiedBase, bundleDir);
      const result = compareDiskAndBundledParity(tiedBase, bundleDir, tokens);
      assert.strictEqual(result.ok, true, JSON.stringify(result.gaps, null, 2));

      // Bundled-only client: remove local methodology tree; reads still resolve via bundle.
      fs.rmSync(path.join(tiedBase, "methodology"), { recursive: true });
      process.env.TIED_BASE_PATH = tiedBase;
      process.env.TIED_METHODOLOGY_BUNDLE_PATH = bundleDir;
      clearBasePathCache();
      const meth = loadDetail("REQ-METH-ONLY") as Record<string, unknown>;
      assert.strictEqual(meth.name, "Methodology detail");
      const fallback = loadDetail("REQ-FALLBACK") as Record<string, unknown>;
      assert.strictEqual(fallback.name, "Methodology copy");
      fs.unlinkSync(path.join(bundleDir, "requirements", "REQ-FALLBACK.yaml"));
      clearBasePathCache();
      const projectFallback = loadDetail("REQ-FALLBACK") as Record<string, unknown>;
      assert.strictEqual(projectFallback.name, "Project copy");

      const probe = captureMethodologyReadProbe(["REQ-SENTINEL-ONLY"]);
      assert.ok(!probe.list_detail_tokens.requirement.includes("REQ-SENTINEL-ONLY"));
    } finally {
      fs.rmSync(tiedBase, { recursive: true });
      fs.rmSync(bundleDir, { recursive: true });
    }
  });
});
