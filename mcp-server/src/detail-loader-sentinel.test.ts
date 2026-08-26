/**
 * [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_BOOTSTRAP_DETAIL_INTEGRITY] [REQ-TIED_SETUP]
 * Sentinel handling, methodology-first reads, project fallback, and project-only writes.
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { clearBasePathCache, insertRecord } from "./yaml-loader.js";
import {
  getDetailPath,
  getProjectDetailPath,
  listDetailTokens,
  loadDetail,
  updateDetail,
} from "./detail-loader.js";
import { validateConsistency } from "./consistency-validator.js";

beforeEach(() => {
  clearBasePathCache();
});

describe("detail-loader sentinel and resolution", () => {
  it("listDetailTokens ignores sentinel detail_file index values", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-sentinel-"));
    try {
      process.env.TIED_BASE_PATH = dir;
      clearBasePathCache();
      insertRecord("requirements", "REQ-SENTINEL-ONLY", {
        name: "Sentinel only",
        status: "Draft",
        detail_file: "null",
      });
      const tokens = listDetailTokens("requirement");
      assert.ok(!tokens.includes("REQ-SENTINEL-ONLY"));
    } finally {
      delete process.env.TIED_BASE_PATH;
      clearBasePathCache();
      fs.rmSync(dir, { recursive: true });
    }
  });

  it("reads methodology detail first and falls back to project detail", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-methodology-"));
    try {
      process.env.TIED_BASE_PATH = dir;
      clearBasePathCache();
      const methodologyDir = path.join(dir, "methodology", "requirements");
      const projectDir = path.join(dir, "requirements");
      fs.mkdirSync(methodologyDir, { recursive: true });
      fs.mkdirSync(projectDir, { recursive: true });
      fs.writeFileSync(
        path.join(dir, "methodology", "requirements.yaml"),
        'REQ-FALLBACK:\n  name: "Methodology index"\n  detail_file: "null"\n',
        "utf8"
      );
      fs.writeFileSync(
        path.join(dir, "requirements.yaml"),
        'REQ-FALLBACK:\n  name: "Project index"\n  detail_file: "requirements/REQ-FALLBACK.yaml"\n',
        "utf8"
      );
      fs.writeFileSync(
        path.join(methodologyDir, "REQ-FALLBACK.yaml"),
        "REQ-FALLBACK:\n  name: Methodology copy\n",
        "utf8"
      );
      fs.writeFileSync(
        path.join(projectDir, "REQ-FALLBACK.yaml"),
        "REQ-FALLBACK:\n  name: Project copy\n",
        "utf8"
      );
      clearBasePathCache();
      const loaded = loadDetail("REQ-FALLBACK") as Record<string, unknown> | null;
      assert.ok(loaded);
      assert.strictEqual(loaded.name, "Methodology copy");
      fs.unlinkSync(path.join(methodologyDir, "REQ-FALLBACK.yaml"));
      clearBasePathCache();
      const fallback = loadDetail("REQ-FALLBACK") as Record<string, unknown> | null;
      assert.ok(fallback);
      assert.strictEqual(fallback.name, "Project copy");
    } finally {
      delete process.env.TIED_BASE_PATH;
      clearBasePathCache();
      fs.rmSync(dir, { recursive: true });
    }
  });

  it("rejects writes to methodology-owned detail files", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-write-protect-"));
    try {
      process.env.TIED_BASE_PATH = dir;
      clearBasePathCache();
      const methodologyDir = path.join(dir, "methodology", "requirements");
      fs.mkdirSync(methodologyDir, { recursive: true });
      fs.writeFileSync(
        path.join(dir, "methodology", "requirements.yaml"),
        'REQ-READONLY:\n  name: "Methodology"\n  detail_file: "requirements/REQ-READONLY.yaml"\n',
        "utf8"
      );
      fs.writeFileSync(
        path.join(dir, "requirements.yaml"),
        'REQ-READONLY:\n  name: "Methodology"\n  detail_file: "requirements/REQ-READONLY.yaml"\n',
        "utf8"
      );
      fs.writeFileSync(
        path.join(methodologyDir, "REQ-READONLY.yaml"),
        "REQ-READONLY:\n  name: Methodology\n",
        "utf8"
      );
      clearBasePathCache();
      const projectPath = getProjectDetailPath("REQ-READONLY");
      assert.ok(projectPath?.includes(path.join("requirements", "REQ-READONLY.yaml")));
      const result = updateDetail("REQ-READONLY", { name: "Mutated" });
      assert.strictEqual(result.ok, false);
      if (!result.ok) {
        assert.match(result.error, /methodology-owned \(read-only\)/);
      }
    } finally {
      delete process.env.TIED_BASE_PATH;
      clearBasePathCache();
      fs.rmSync(dir, { recursive: true });
    }
  });
});

describe("validateConsistency sentinel index reporting", () => {
  it("does not count detail_file null as with_detail_file", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-validator-sentinel-"));
    try {
      process.env.TIED_BASE_PATH = dir;
      clearBasePathCache();
      fs.mkdirSync(path.join(dir, "requirements"), { recursive: true });
      fs.writeFileSync(
        path.join(dir, "requirements.yaml"),
        'REQ-SENTINEL:\n  name: "Sentinel"\n  detail_file: "null"\n',
        "utf8"
      );
      fs.writeFileSync(path.join(dir, "architecture-decisions.yaml"), "{}\n", "utf8");
      fs.writeFileSync(path.join(dir, "implementation-decisions.yaml"), "{}\n", "utf8");
      fs.writeFileSync(path.join(dir, "semantic-tokens.yaml"), "{}\n", "utf8");
      clearBasePathCache();
      const report = validateConsistency({ require_detail_record: false });
      assert.ok(!report.index_tokens.requirements.with_detail_file.includes("REQ-SENTINEL"));
    } finally {
      delete process.env.TIED_BASE_PATH;
      clearBasePathCache();
      fs.rmSync(dir, { recursive: true });
    }
  });
});
