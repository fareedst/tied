import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import child_process from "node:child_process";
import { fileURLToPath } from "node:url";

import { runPlumbDiffImpactPreview } from "./plumb-diff-impact-preview.js";
import { clearBasePathCache } from "../yaml-loader.js";

const REPO_ROOT_ABS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

describe("plumb diff impact preview (deterministic)", () => {
  let tempDir: string | null = null;
  let origCwd: string;
  let repoRootAbs: string;
  let realTiedBasePathAbs: string;

  beforeEach(() => {
    origCwd = process.cwd();
    repoRootAbs = REPO_ROOT_ABS;
    realTiedBasePathAbs = path.join(repoRootAbs, "tied-project");

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
    process.chdir(origCwd);
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    delete process.env.TIED_BASE_PATH;
    clearBasePathCache();
  });

  it("flags unregistered token + suggests missing detail file", () => {
    const token = "REQ-IMPACT_PREVIEW_TEST_UNREGISTERED";
    fs.writeFileSync("src/a.ts", `export const x = 1; // [${token}]\n`, "utf8");
    child_process.execFileSync("git", ["add", "src/a.ts"], { stdio: ["ignore", "ignore", "ignore"] });

    const report = runPlumbDiffImpactPreview({
      selection: "staged",
      include_removed: true,
      max_files: 50,
      tied_base_path: realTiedBasePathAbs,
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
      tied_base_path: realTiedBasePathAbs,
    });

    assert.ok(report.tokens_detected.added.REQ.includes(token));
    assert.ok(!report.token_registry_checks.semantic_tokens_missing.includes(token));
    assert.ok(!report.token_registry_checks.missing_index_records.REQ.includes(token));

    const suggestion = report.suggested_detail_files_to_open.find((s) => s.token === token);
    assert.ok(suggestion, "should include suggestion entry for the token");
    assert.strictEqual(suggestion?.exists, true, "REQ-TIED_SETUP should have an existing detail YAML file");
  });

  it("v2_without_profile_opt_in_stays_v1", () => {
    fs.writeFileSync("src/b.ts", "export const y = 2;\n", "utf8");
    child_process.execFileSync("git", ["add", "src/b.ts"], { stdio: ["ignore", "ignore", "ignore"] });

    const report = runPlumbDiffImpactPreview({
      selection: "staged",
      tied_base_path: realTiedBasePathAbs,
    });
    assert.strictEqual(report.schema_version, "impact-preview.v1");
  });

  it("v2_with_profile_emits_legs", () => {
    fs.mkdirSync("tied-project", { recursive: true });
    fs.writeFileSync(
      "tied-project/change-impact-profile.v1.yaml",
      [
        "schema_version: change-impact-profile.v1",
        'proof_boundary: "path/glob touch only"',
        "legs:",
        "  - leg_id: src_code",
        '    label: "Source"',
        "    path_globs:",
        '      - "src/**"',
        "",
      ].join("\n"),
      "utf8"
    );
    fs.writeFileSync("src/b.ts", "export const y = 2;\n", "utf8");
    child_process.execFileSync("git", ["add", "src/b.ts", "tied-project/change-impact-profile.v1.yaml"], {
      stdio: ["ignore", "ignore", "ignore"],
    });

    const report = runPlumbDiffImpactPreview({
      selection: "staged",
      use_default_profile: true,
      tied_base_path: realTiedBasePathAbs,
    });

    assert.strictEqual(report.schema_version, "impact-preview.v2");
    if (report.schema_version !== "impact-preview.v2") return;
    assert.strictEqual(report.profile.load_ok, true);
    const leg = report.impact_legs.find((l) => l.leg_id === "src_code");
    assert.ok(leg);
    assert.ok(leg!.matched_touched_paths.includes("src/b.ts"));
  });

  it("v2_missing_profile_file", () => {
    const report = runPlumbDiffImpactPreview({
      selection: "staged",
      use_default_profile: true,
      tied_base_path: realTiedBasePathAbs,
    });
    assert.strictEqual(report.schema_version, "impact-preview.v2");
    if (report.schema_version !== "impact-preview.v2") return;
    assert.strictEqual(report.profile.load_ok, false);
    assert.ok(report.profile.diagnostics && report.profile.diagnostics.length > 0);
    assert.deepStrictEqual(report.impact_legs, []);
  });

  it("v2_includes_path_touch_summary", () => {
    fs.mkdirSync("tied-project", { recursive: true });
    fs.writeFileSync(
      "tied-project/change-impact-profile.v1.yaml",
      [
        "schema_version: change-impact-profile.v1",
        'proof_boundary: "explicit boundary text from profile"',
        "legs:",
        "  - leg_id: src_code",
        '    label: "Source"',
        "    path_globs:",
        '      - "src/**"',
        "",
      ].join("\n"),
      "utf8"
    );
    fs.writeFileSync("src/c.ts", "export const z = 3;\n", "utf8");
    child_process.execFileSync("git", ["add", "src/c.ts"], { stdio: ["ignore", "ignore", "ignore"] });

    const report = runPlumbDiffImpactPreview({
      selection: "staged",
      use_default_profile: true,
      tied_base_path: realTiedBasePathAbs,
    });
    assert.strictEqual(report.schema_version, "impact-preview.v2");
    if (report.schema_version !== "impact-preview.v2") return;
    assert.strictEqual(report.path_touch_summary.proof_boundary, "explicit boundary text from profile");
  });
});

