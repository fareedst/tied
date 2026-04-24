/**
 * E2E test: bootstrap a project with copy_files.sh then load indexes via yaml-loader.
 * [IMPL] Verifies the full flow: core methodology (inherited LEAP R+A+I) copy → TIED_BASE_PATH → loader reads from tied/.
 * Clients receive inherited tokens (e.g. REQ-TIED_SETUP, REQ-MODULE_VALIDATION) so TIED/LEAP behaviors exist in every project.
 */

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execSync } from "node:child_process";
import {
  clearBasePathCache,
  loadIndex,
  getRecord,
  resolveIndexPath,
} from "../yaml-loader.js";

describe("e2e: bootstrap and load", () => {
  let tempDir: string;
  let repoRoot: string;

  beforeEach(() => {
    clearBasePathCache();
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-e2e-"));
    // When run from mcp-server (npm test), cwd is mcp-server; repo root is parent.
    repoRoot = path.resolve(process.cwd(), "..");
  });

  afterEach(() => {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
  });

  it("copy_files.sh populates tied/ and loader reads requirements index from it [IMPL]", () => {
    const copyScript = path.join(repoRoot, "copy_files.sh");
    assert.ok(fs.existsSync(copyScript), `copy_files.sh not found at ${copyScript}`);
    execSync(`bash "${copyScript}" "${tempDir}"`, {
      stdio: "pipe",
      cwd: repoRoot,
    });
    const tiedDir = path.join(tempDir, "tied");
    assert.ok(fs.existsSync(tiedDir), "tied/ should exist after copy_files.sh");
    const requirementsPath = path.join(tiedDir, "requirements.yaml");
    assert.ok(fs.existsSync(requirementsPath), "tied/requirements.yaml should exist");

    process.env.TIED_BASE_PATH = tiedDir;
    clearBasePathCache();

    const resolved = resolveIndexPath("requirements");
    assert.ok(
      resolved.includes("tied") && resolved.endsWith("requirements.yaml"),
      `resolveIndexPath should point into tied/; got ${resolved}`
    );

    const data = loadIndex("requirements");
    assert.ok(data !== null && typeof data === "object", "loadIndex(requirements) should return an object");
    assert.ok(
      "REQ-TIED_SETUP" in data,
      "Copied index should contain inherited token REQ-TIED_SETUP"
    );
    assert.ok(
      "REQ-MODULE_VALIDATION" in data,
      "Copied index should contain inherited token REQ-MODULE_VALIDATION"
    );

    const rec = getRecord("requirements", "REQ-TIED_SETUP");
    assert.ok(rec !== null && typeof rec === "object", "getRecord should return REQ-TIED_SETUP");
    const recObj = rec as Record<string, unknown>;
    assert.strictEqual(recObj.name, "TIED Methodology Setup");

    const tiedCli = path.join(tempDir, ".cursor", "skills", "tied-yaml", "scripts", "tied-cli.sh");
    assert.ok(
      fs.existsSync(tiedCli),
      "copy_files.sh should install the canonical tied-cli at .cursor/skills/tied-yaml/scripts/tied-cli.sh [IMPL-TIED_FILES]"
    );
    const rootScriptsTiedCli = path.join(tempDir, "scripts", "tied-cli.sh");
    assert.ok(
      !fs.existsSync(rootScriptsTiedCli),
      "copy_files.sh should not create scripts/tied-cli.sh (single CLI path is under .cursor/skills/) [IMPL-TIED_FILES]"
    );

    delete process.env.TIED_BASE_PATH;
  });

  it("loader reads semantic-tokens index from bootstrapped tied/ [IMPL]", () => {
    const copyScript = path.join(repoRoot, "copy_files.sh");
    execSync(`bash "${copyScript}" "${tempDir}"`, {
      stdio: "pipe",
      cwd: repoRoot,
    });
    const tiedDir = path.join(tempDir, "tied");
    process.env.TIED_BASE_PATH = tiedDir;
    clearBasePathCache();

    const data = loadIndex("semantic-tokens");
    assert.ok(data !== null && typeof data === "object", "loadIndex(semantic-tokens) should return an object");
    assert.ok(
      Object.keys(data).some((k) => k.startsWith("REQ-") || k.startsWith("ARCH-") || k.startsWith("IMPL-") || k.startsWith("PROC-")),
      "semantic-tokens index should contain token keys"
    );

    delete process.env.TIED_BASE_PATH;
  });
});
