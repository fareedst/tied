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
  resolveIndexPath,
  clearBasePathCache,
} from "./yaml-loader.js";

beforeEach(() => {
  clearBasePathCache();
});

describe("getBasePath", () => {
  it("returns path under cwd when TIED_BASE_PATH is default [IMPL]", () => {
    const base = getBasePath();
    assert.ok(base.endsWith("tied") || path.basename(base) === "tied");
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
