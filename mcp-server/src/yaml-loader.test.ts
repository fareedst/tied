/**
 * Unit tests for yaml-loader path resolution. [IMPL]
 * Verifies resolveIndexPath: prefers basePath/index.yaml, then cwd/index.yaml (template at root).
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import yaml from "js-yaml";
import {
  getBasePath,
  getClientProjectRoot,
  resolveIndexPath,
  clearBasePathCache,
  resolveMethodologyRoot,
  getMethodologyBasePath,
  insertRecord,
  updateRecord,
  upsertRecord,
  loadIndex,
  loadProjectIndex,
} from "./yaml-loader.js";
import { ENV_CLIENT_BUNDLE_PATH, LEGACY_ENV_CLIENT_BUNDLE_PATH } from "./tied-path-env.js";
import {
  bindWritableProjectCorpus,
  restoreClientPathEnv,
  snapshotClientPathEnv,
  useLegacyProjectPathOnly,
} from "./test-helpers/client-path-env.js";

beforeEach(() => {
  clearBasePathCache();
});

describe("getBasePath", () => {
  it("returns path under cwd when TIED_BASE_PATH is default [IMPL]", () => {
    const base = getBasePath();
    assert.ok(["tied-project", "tied"].includes(path.basename(base)));
  });

  it("uses TIED_BASE_PATH when set", () => {
    const saved = snapshotClientPathEnv();
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-loader-"));
    try {
      bindWritableProjectCorpus(dir);
      clearBasePathCache();
      assert.strictEqual(getBasePath(), dir);
    } finally {
      restoreClientPathEnv(saved);
      clearBasePathCache();
      fs.rmSync(dir, { recursive: true });
    }
  });

  it("getClientProjectRoot returns parent of TIED base path", () => {
    const saved = snapshotClientPathEnv();
    const clientRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tied-loader-client-"));
    const tiedDir = path.join(clientRoot, "tied-project");
    fs.mkdirSync(tiedDir, { recursive: true });
    try {
      bindWritableProjectCorpus(tiedDir);
      clearBasePathCache();
      assert.strictEqual(getClientProjectRoot(), clientRoot);
    } finally {
      restoreClientPathEnv(saved);
      clearBasePathCache();
      fs.rmSync(clientRoot, { recursive: true });
    }
  });
});

describe("resolveIndexPath", () => {
  it("returns basePath/file when file exists under base [IMPL]", () => {
    const saved = snapshotClientPathEnv();
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-loader-"));
    const requirementsPath = path.join(dir, "requirements.yaml");
    fs.writeFileSync(requirementsPath, "{}", "utf8");
    try {
      useLegacyProjectPathOnly(dir);
      clearBasePathCache();
      const resolved = resolveIndexPath("requirements");
      assert.strictEqual(resolved, requirementsPath);
    } finally {
      restoreClientPathEnv(saved);
      clearBasePathCache();
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
    const saved = snapshotClientPathEnv();
    try {
      useLegacyProjectPathOnly(baseDir);
      clearBasePathCache();
      process.chdir(cwdDir);
      clearBasePathCache();
      const resolved = resolveIndexPath("requirements");
      assert.ok(fs.existsSync(resolved));
      assert.strictEqual(path.basename(resolved), "requirements.yaml");
      assert.ok(resolved.includes("cwd") && resolved.endsWith("requirements.yaml"));
    } finally {
      process.chdir(origCwd);
      restoreClientPathEnv(saved);
      clearBasePathCache();
      fs.rmSync(dir, { recursive: true });
    }
  });
});

describe("resolveMethodologyRoot [REQ-TIED_TWO_FOLDER_LAYOUT]", () => {
  it("prefers TIED_CLIENT_BUNDLE_PATH env override", () => {
    const clientRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tied-meth-canonical-"));
    const tiedDir = path.join(clientRoot, "tied-project");
    const override = fs.mkdtempSync(path.join(os.tmpdir(), "tied-meth-canonical-override-"));
    fs.mkdirSync(tiedDir, { recursive: true });
    fs.writeFileSync(path.join(override, "requirements.yaml"), "{}\n", "utf8");
    try {
      process.env.TIED_CLIENT_PROJECT_PATH = tiedDir;
      process.env.TIED_CLIENT_BUNDLE_PATH = override;
      clearBasePathCache();
      assert.strictEqual(resolveMethodologyRoot(), override);
    } finally {
      delete process.env.TIED_CLIENT_PROJECT_PATH;
      delete process.env.TIED_CLIENT_BUNDLE_PATH;
      clearBasePathCache();
      fs.rmSync(clientRoot, { recursive: true });
      fs.rmSync(override, { recursive: true });
    }
  });

  it("prefers TIED_METHODOLOGY_BUNDLE_PATH env override", () => {
    const clientRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tied-meth-root-"));
    const tiedDir = path.join(clientRoot, "tied-project");
    const bundleDir = path.join(clientRoot, "tied-bundle");
    fs.mkdirSync(tiedDir, { recursive: true });
    fs.mkdirSync(bundleDir, { recursive: true });
    fs.writeFileSync(path.join(bundleDir, "requirements.yaml"), "{}\n", "utf8");
    const override = fs.mkdtempSync(path.join(os.tmpdir(), "tied-meth-override-"));
    fs.writeFileSync(path.join(override, "requirements.yaml"), "{}\n", "utf8");
    const saved = snapshotClientPathEnv();
    try {
      useLegacyProjectPathOnly(tiedDir);
      delete process.env[ENV_CLIENT_BUNDLE_PATH];
      process.env[LEGACY_ENV_CLIENT_BUNDLE_PATH] = override;
      clearBasePathCache();
      assert.strictEqual(resolveMethodologyRoot(), override);
      assert.strictEqual(getMethodologyBasePath(), override);
    } finally {
      restoreClientPathEnv(saved);
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
    fs.writeFileSync(path.join(tiedDir, "requirements.yaml"), "{}\n", "utf8");
    fs.writeFileSync(path.join(bundleDir, "requirements.yaml"), "{}\n", "utf8");
    fs.writeFileSync(
      path.join(bundleDir, "install.json"),
      JSON.stringify({ schema: "tied-install.v2", bundle_path: bundleDir }),
      "utf8",
    );
    const saved = snapshotClientPathEnv();
    try {
      useLegacyProjectPathOnly(tiedDir);
      delete process.env[ENV_CLIENT_BUNDLE_PATH];
      clearBasePathCache();
      assert.strictEqual(resolveMethodologyRoot(), bundleDir);
    } finally {
      restoreClientPathEnv(saved);
      clearBasePathCache();
      fs.rmSync(clientRoot, { recursive: true });
    }
  });

  function seedTwoFolderClient(): { clientRoot: string; tiedDir: string; bundleDir: string } {
    const clientRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tied-write-iso-"));
    const tiedDir = path.join(clientRoot, "tied-project");
    const bundleDir = path.join(clientRoot, "tied-bundle");
    fs.mkdirSync(tiedDir, { recursive: true });
    fs.mkdirSync(bundleDir, { recursive: true });
    fs.writeFileSync(
      path.join(bundleDir, "implementation-decisions.yaml"),
      yaml.dump({
        "IMPL-METH-A": { name: "Methodology A", status: "Active" },
        "IMPL-METH-B": { name: "Methodology B", status: "Active" },
      }),
      "utf8",
    );
    fs.writeFileSync(path.join(bundleDir, "requirements.yaml"), "{}\n", "utf8");
    fs.writeFileSync(path.join(tiedDir, "requirements.yaml"), "{}\n", "utf8");
    fs.writeFileSync(path.join(tiedDir, "implementation-decisions.yaml"), "{}\n", "utf8");
    useLegacyProjectPathOnly(tiedDir);
    delete process.env[ENV_CLIENT_BUNDLE_PATH];
    clearBasePathCache();
    return { clientRoot, tiedDir, bundleDir };
  }

  function countImplIndexTokens(tiedDir: string): number {
    const raw = fs.readFileSync(path.join(tiedDir, "implementation-decisions.yaml"), "utf8");
    const data = yaml.load(raw) as Record<string, unknown>;
    return Object.keys(data).filter((k) => k.startsWith("IMPL-")).length;
  }

  it("insertRecord writes only the new project token [REQ-TIED_PROJECT_INDEX_WRITE_ISOLATION]", () => {
    const saved = snapshotClientPathEnv();
    const { clientRoot, tiedDir } = seedTwoFolderClient();
    try {
      const result = insertRecord("implementation", "IMPL-CLIENT-NEW", {
        name: "Client only",
        status: "Active",
      });
      assert.strictEqual(result.ok, true);
      assert.strictEqual(countImplIndexTokens(tiedDir), 1);
      const merged = loadIndex("implementation");
      assert.ok(merged && merged["IMPL-CLIENT-NEW"]);
      assert.ok(merged && merged["IMPL-METH-A"]);
    } finally {
      restoreClientPathEnv(saved);
      clearBasePathCache();
      fs.rmSync(clientRoot, { recursive: true });
    }
  });

  it("insertRecord rejects methodology token name collision [REQ-TIED_PROJECT_INDEX_WRITE_ISOLATION]", () => {
    const saved = snapshotClientPathEnv();
    const { clientRoot, tiedDir } = seedTwoFolderClient();
    try {
      const result = insertRecord("implementation", "IMPL-METH-A", {
        name: "Should not insert",
        status: "Active",
      });
      assert.strictEqual(result.ok, false);
      assert.strictEqual(countImplIndexTokens(tiedDir), 0);
    } finally {
      restoreClientPathEnv(saved);
      clearBasePathCache();
      fs.rmSync(clientRoot, { recursive: true });
    }
  });

  it("updateRecord promotes one override row for methodology-only token [REQ-TIED_PROJECT_INDEX_WRITE_ISOLATION]", () => {
    const saved = snapshotClientPathEnv();
    const { clientRoot, tiedDir } = seedTwoFolderClient();
    try {
      const result = updateRecord("implementation", "IMPL-METH-A", { status: "Deprecated" });
      assert.strictEqual(result.ok, true);
      assert.strictEqual(countImplIndexTokens(tiedDir), 1);
      const project = loadProjectIndex("implementation");
      assert.ok(project?.["IMPL-METH-A"]);
      assert.strictEqual((project?.["IMPL-METH-A"] as { status?: string }).status, "Deprecated");
    } finally {
      restoreClientPathEnv(saved);
      clearBasePathCache();
      fs.rmSync(clientRoot, { recursive: true });
    }
  });

  it("upsertRecord does not materialize full methodology index [REQ-TIED_PROJECT_INDEX_WRITE_ISOLATION]", () => {
    const saved = snapshotClientPathEnv();
    const { clientRoot, tiedDir } = seedTwoFolderClient();
    try {
      const result = upsertRecord("implementation", "IMPL-METH-B", { status: "Template" });
      assert.strictEqual(result.ok, true);
      assert.strictEqual(countImplIndexTokens(tiedDir), 1);
    } finally {
      restoreClientPathEnv(saved);
      clearBasePathCache();
      fs.rmSync(clientRoot, { recursive: true });
    }
  });

  it("returns null when .linked-methodology-view is present without bundle indexes", () => {
    const saved = snapshotClientPathEnv();
    const clientRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tied-meth-legacy-view-"));
    const tiedDir = path.join(clientRoot, "tied-project");
    fs.mkdirSync(tiedDir, { recursive: true });
    fs.writeFileSync(path.join(tiedDir, "requirements.yaml"), "{}\n", "utf8");
    fs.mkdirSync(path.join(tiedDir, ".linked-methodology-view"), { recursive: true });
    try {
      useLegacyProjectPathOnly(tiedDir);
      delete process.env[ENV_CLIENT_BUNDLE_PATH];
      clearBasePathCache();
      assert.strictEqual(resolveMethodologyRoot(), null);
    } finally {
      restoreClientPathEnv(saved);
      clearBasePathCache();
      fs.rmSync(clientRoot, { recursive: true });
    }
  });
});
