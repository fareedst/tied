/**
 * Unit tests for yaml-loader path resolution. [IMPL]
 * Verifies resolveIndexPath: prefers basePath/index.yaml, then cwd/index.yaml (template at root).
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  getBasePath,
  getClientProjectRoot,
  resolveIndexPath,
  clearBasePathCache,
  resolveMethodologyRoot,
  getMethodologyBasePath,
} from "./yaml-loader.js";

beforeEach(() => {
  clearBasePathCache();
});

describe("getBasePath", () => {
  it("returns path under cwd when TIED_BASE_PATH is default [IMPL]", () => {
    const base = getBasePath();
    assert.ok(["tied-project", "tied"].includes(path.basename(base)));
  });

  it("uses TIED_BASE_PATH when set", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-loader-"));
    try {
      process.env.TIED_BASE_PATH = dir;
      clearBasePathCache();
      assert.strictEqual(getBasePath(), dir);
    } finally {
      delete process.env.TIED_BASE_PATH;
      fs.rmSync(dir, { recursive: true });
    }
  });

  it("getClientProjectRoot returns parent of TIED base path", () => {
    const clientRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tied-loader-client-"));
    const tiedDir = path.join(clientRoot, "tied-project");
    fs.mkdirSync(tiedDir, { recursive: true });
    try {
      process.env.TIED_BASE_PATH = tiedDir;
      clearBasePathCache();
      assert.strictEqual(getClientProjectRoot(), clientRoot);
    } finally {
      delete process.env.TIED_BASE_PATH;
      fs.rmSync(clientRoot, { recursive: true });
    }
  });
});

describe("resolveIndexPath", () => {
  it("returns basePath/file when file exists under base [IMPL]", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-loader-"));
    const requirementsPath = path.join(dir, "requirements.yaml");
    fs.writeFileSync(requirementsPath, "{}", "utf8");
    try {
      process.env.TIED_BASE_PATH = dir;
      clearBasePathCache();
      const resolved = resolveIndexPath("requirements");
      assert.strictEqual(resolved, requirementsPath);
    } finally {
      delete process.env.TIED_BASE_PATH;
      fs.rmSync(dir, { recursive: true });
    }
  });

  it("returns cwd/file when file exists in cwd and not under base (template at root)", () => {
    const origCwd = process.cwd();
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-loader-"));
    const baseDir = path.join(dir, "base");
    fs.mkdirSync(baseDir, { recursive: true });
    const cwdDir = path.join(dir, "cwd");
    fs.mkdirSync(cwdDir, { recursive: true });
    const cwdFile = path.join(cwdDir, "requirements.yaml");
    fs.writeFileSync(cwdFile, "{}", "utf8");
    try {
      process.env.TIED_BASE_PATH = baseDir;
      clearBasePathCache();
      process.chdir(cwdDir);
      clearBasePathCache();
      const resolved = resolveIndexPath("requirements");
      assert.ok(fs.existsSync(resolved));
      assert.strictEqual(path.basename(resolved), "requirements.yaml");
      assert.ok(resolved.includes("cwd") && resolved.endsWith("requirements.yaml"));
    } finally {
      process.chdir(origCwd);
      delete process.env.TIED_BASE_PATH;
      fs.rmSync(dir, { recursive: true });
    }
  });
});

describe("resolveMethodologyRoot [REQ-TIED_TWO_FOLDER_LAYOUT]", () => {
  it("prefers TIED_METHODOLOGY_BUNDLE_PATH env override", () => {
    const clientRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tied-meth-root-"));
    const tiedDir = path.join(clientRoot, "tied-project");
    const bundleDir = path.join(clientRoot, "tied-bundle");
    fs.mkdirSync(tiedDir, { recursive: true });
    fs.mkdirSync(bundleDir, { recursive: true });
    fs.writeFileSync(path.join(bundleDir, "requirements.yaml"), "{}\n", "utf8");
    const override = fs.mkdtempSync(path.join(os.tmpdir(), "tied-meth-override-"));
    fs.writeFileSync(path.join(override, "requirements.yaml"), "{}\n", "utf8");
    try {
      process.env.TIED_BASE_PATH = tiedDir;
      process.env.TIED_METHODOLOGY_BUNDLE_PATH = override;
      clearBasePathCache();
      assert.strictEqual(resolveMethodologyRoot(), override);
      assert.strictEqual(getMethodologyBasePath(), override);
    } finally {
      delete process.env.TIED_BASE_PATH;
      delete process.env.TIED_METHODOLOGY_BUNDLE_PATH;
      clearBasePathCache();
      fs.rmSync(clientRoot, { recursive: true });
      fs.rmSync(override, { recursive: true });
    }
  });

  it("resolves flattened tied-bundle when install.json and indexes exist", () => {
    const clientRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tied-meth-install-"));
    const tiedDir = path.join(clientRoot, "tied-project");
    const bundleDir = path.join(clientRoot, "tied-bundle");
    fs.mkdirSync(tiedDir, { recursive: true });
    fs.mkdirSync(bundleDir, { recursive: true });
    fs.writeFileSync(path.join(bundleDir, "requirements.yaml"), "{}\n", "utf8");
    fs.writeFileSync(
      path.join(bundleDir, "install.json"),
      JSON.stringify({ schema: "tied-install.v2", bundle_path: bundleDir }),
      "utf8",
    );
    try {
      process.env.TIED_BASE_PATH = tiedDir;
      clearBasePathCache();
      assert.strictEqual(resolveMethodologyRoot(), bundleDir);
    } finally {
      delete process.env.TIED_BASE_PATH;
      clearBasePathCache();
      fs.rmSync(clientRoot, { recursive: true });
    }
  });

  it("returns null when .linked-methodology-view is present without bundle indexes", () => {
    const clientRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tied-meth-legacy-view-"));
    const tiedDir = path.join(clientRoot, "tied-project");
    fs.mkdirSync(path.join(tiedDir, ".linked-methodology-view"), { recursive: true });
    try {
      process.env.TIED_BASE_PATH = tiedDir;
      clearBasePathCache();
      assert.strictEqual(resolveMethodologyRoot(), null);
    } finally {
      delete process.env.TIED_BASE_PATH;
      clearBasePathCache();
      fs.rmSync(clientRoot, { recursive: true });
    }
  });
});
