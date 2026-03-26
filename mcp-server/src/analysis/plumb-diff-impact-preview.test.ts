import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import child_process from "node:child_process";

import { runPlumbDiffImpactPreview } from "./plumb-diff-impact-preview.js";
import { clearBasePathCache } from "../yaml-loader.js";

describe("plumb diff impact preview (deterministic)", () => {
  let tempDir: string | null = null;
  let origCwd: string;
  let repoRootAbs: string;
  let realTiedBasePathAbs: string;

  beforeEach(() => {
    origCwd = process.cwd();
    // Tests run from `mcp-server/`, but the real `tied/` folder lives one level up.
    repoRootAbs = path.resolve(origCwd, "..");
    realTiedBasePathAbs = path.join(repoRootAbs, "tied");

    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-plumb-diff-impact-"));
    process.chdir(tempDir);

    child_process.execFileSync("git", ["init", "-q"], { stdio: ["ignore", "ignore", "ignore"] });
    child_process.execFileSync("git", ["config", "user.email", "tied@example.com"], { stdio: ["ignore", "ignore", "ignore"] });
    child_process.execFileSync("git", ["config", "user.name", "tied"], { stdio: ["ignore", "ignore", "ignore"] });

    // Seed base content and commit so staged diffs have a HEAD.
    fs.mkdirSync("src", { recursive: true });
    fs.writeFileSync("src/a.ts", "export const x = 1;\n", "utf8");
    child_process.execFileSync("git", ["add", "."], { stdio: ["ignore", "ignore", "ignore"] });
    child_process.execFileSync("git", ["commit", "-m", "init", "-q"], { stdio: ["ignore", "ignore", "ignore"] });

    // Point yaml-loader at the real tied/ folder in this repo.
    process.env.TIED_BASE_PATH = realTiedBasePathAbs;
    clearBasePathCache();
  });

  afterEach(() => {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    delete process.env.TIED_BASE_PATH;
    clearBasePathCache();
    process.chdir(origCwd);
  });

  it("flags unregistered token + suggests missing detail file", () => {
    const token = "REQ-IMPACT_PREVIEW_TEST_UNREGISTERED";
    fs.writeFileSync("src/a.ts", `export const x = 1; // [${token}]\n`, "utf8");
    child_process.execFileSync("git", ["add", "src/a.ts"], { stdio: ["ignore", "ignore", "ignore"] });

    const report = runPlumbDiffImpactPreview({
      selection: "staged",
      include_removed: true,
      max_files: 50,
    });

    assert.strictEqual(report.schema_version, "impact-preview.v1");
    assert.ok(report.tokens_detected.added.REQ.includes(token), "should detect added REQ token from diff");
    assert.ok(
      report.token_registry_checks.semantic_tokens_missing.includes(token),
      "should report token missing from semantic-tokens.yaml"
    );

    const suggestion = report.suggested_detail_files_to_open.find((s) => s.token === token);
    assert.ok(suggestion, "should include suggestion entry for the token");
    assert.strictEqual(suggestion?.exists, false, "missing token should have non-existent suggested detail file");
  });

  it("detects registered token and marks existing detail file", () => {
    const token = "REQ-TIED_SETUP";
    fs.writeFileSync("src/a.ts", `export const x = 1; // [${token}]\n`, "utf8");
    child_process.execFileSync("git", ["add", "src/a.ts"], { stdio: ["ignore", "ignore", "ignore"] });

    const report = runPlumbDiffImpactPreview({
      selection: "staged",
      include_removed: true,
      max_files: 50,
    });

    assert.ok(report.tokens_detected.added.REQ.includes(token));
    assert.ok(!report.token_registry_checks.semantic_tokens_missing.includes(token));
    assert.ok(!report.token_registry_checks.missing_index_records.REQ.includes(token));

    const suggestion = report.suggested_detail_files_to_open.find((s) => s.token === token);
    assert.ok(suggestion, "should include suggestion entry for the token");
    assert.strictEqual(suggestion?.exists, true, "REQ-TIED_SETUP should have an existing detail YAML file");
  });
});

