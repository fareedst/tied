/**
 * Unit tests for scoped analysis roots and gitignore-style ignores. [IMPL]
 */

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

import { runScopedAnalysis } from "./scoped-analysis.js";
import { clearBasePathCache } from "../yaml-loader.js";

describe("scoped analysis: roots + ignore patterns", () => {
  let tempDir: string | null = null;
  let origCwd: string;
  let repoRootAbs: string;

  beforeEach(() => {
    origCwd = process.cwd();
    repoRootAbs = path.resolve(origCwd, "..");
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-scoped-analysis-"));

    // The analysis walker uses process.cwd() as the "project root" for config + ignore files.
    process.chdir(tempDir);

    // For gap_report: point yaml-loader at this repo's semantic-tokens.yaml.
    process.env.TIED_BASE_PATH = repoRootAbs;
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

  it("default roots walk project root and ignore file excludes generated/", () => {
    fs.mkdirSync(path.join(tempDir!, "src"), { recursive: true });
    fs.mkdirSync(path.join(tempDir!, "generated"), { recursive: true });

    fs.writeFileSync(path.join(tempDir!, "src", "keep.ts"), "const x = '[REQ-TEST_KEEP]'", "utf8");
    fs.writeFileSync(
      path.join(tempDir!, "generated", "skip.ts"),
      "const x = '[REQ-TEST_SKIP]'",
      "utf8"
    );

    fs.writeFileSync(path.join(tempDir!, ".tiedignore"), "generated/\n", "utf8");

    const res = runScopedAnalysis({ mode: "token_scan" });
    assert.strictEqual(res.ok, true);

    const reqTokens = res.token_scan?.discovered_tokens.REQ ?? [];
    assert.ok(reqTokens.includes("REQ-TEST_KEEP"), "should discover keep token");
    assert.ok(!reqTokens.includes("REQ-TEST_SKIP"), "should not discover token under ignored path");

    assert.ok(res.summary.skipped_paths_count > 0, "should record skipped ignored paths");
  });

  it("explicit roots override defaults and prevent scanning generated/", () => {
    fs.mkdirSync(path.join(tempDir!, "src"), { recursive: true });
    fs.mkdirSync(path.join(tempDir!, "generated"), { recursive: true });

    fs.writeFileSync(path.join(tempDir!, "src", "keep.ts"), "const x = '[REQ-TEST_KEEP]'", "utf8");
    fs.writeFileSync(path.join(tempDir!, "generated", "skip.ts"), "const x = '[REQ-TEST_SKIP]'", "utf8");

    // No ignore file: rely solely on roots scoping.
    const res = runScopedAnalysis({ mode: "token_scan", roots: ["src"] });
    assert.strictEqual(res.ok, true);

    const reqTokens = res.token_scan?.discovered_tokens.REQ ?? [];
    assert.ok(reqTokens.includes("REQ-TEST_KEEP"), "should discover keep token under explicit roots");
    assert.ok(!reqTokens.includes("REQ-TEST_SKIP"), "should not discover token outside explicit roots");
  });

  it("empty roots array falls back to default roots used by config/default_roots", () => {
    fs.mkdirSync(path.join(tempDir!, "src"), { recursive: true });
    fs.mkdirSync(path.join(tempDir!, "generated"), { recursive: true });

    fs.writeFileSync(path.join(tempDir!, "src", "keep.ts"), "const x = '[REQ-TEST_KEEP]'", "utf8");
    fs.writeFileSync(path.join(tempDir!, "generated", "skip.ts"), "const x = '[REQ-TEST_SKIP]'", "utf8");

    fs.writeFileSync(path.join(tempDir!, ".tiedignore"), "generated/\n", "utf8");

    const res = runScopedAnalysis({ mode: "token_scan", roots: [] });
    assert.strictEqual(res.ok, true);

    const reqTokens = res.token_scan?.discovered_tokens.REQ ?? [];
    assert.ok(reqTokens.includes("REQ-TEST_KEEP"));
    assert.ok(!reqTokens.includes("REQ-TEST_SKIP"));
  });

  it("traceability_gap_report: REQ in prod but not in test yields req_without_test gap", () => {
    process.env.TIED_BASE_PATH = path.join(tempDir!, "tied");
    clearBasePathCache();
    const tiedDir = path.join(tempDir!, "tied");
    fs.mkdirSync(tiedDir, { recursive: true });
    fs.mkdirSync(path.join(tempDir!, "src"), { recursive: true });

    fs.writeFileSync(
      path.join(tiedDir, "requirements.yaml"),
      `
REQ-TRACE_GAP:
  name: Trace gap fixture
  status: Active
  description: fixture
`.trim(),
      "utf8"
    );
    fs.writeFileSync(
      path.join(tiedDir, "semantic-tokens.yaml"),
      `
REQ-TRACE_GAP:
  type: REQ
`.trim(),
      "utf8"
    );

    fs.writeFileSync(
      path.join(tempDir!, "src", "app.ts"),
      `export const x = "[REQ-TRACE_GAP]";\n`,
      "utf8"
    );
    fs.writeFileSync(
      path.join(tempDir!, "src", "app.test.ts"),
      `export const t = "no token here";\n`,
      "utf8"
    );

    const res = runScopedAnalysis({ mode: "traceability_gap_report" });
    assert.strictEqual(res.ok, true);
    const gaps = res.traceability_gap_report?.dimensions.req_without_test.gaps ?? [];
    const tokens = gaps.map((g) => g.token);
    assert.ok(tokens.includes("REQ-TRACE_GAP"), "should list REQ without test reference");
    assert.strictEqual(
      res.traceability_gap_report?.dimensions.req_without_implementation.count,
      0,
      "prod file references REQ"
    );
  });

  it("traceability_gap_report: REQ only in test yields req_without_implementation gap", () => {
    process.env.TIED_BASE_PATH = path.join(tempDir!, "tied");
    clearBasePathCache();
    const tiedDir = path.join(tempDir!, "tied");
    fs.mkdirSync(tiedDir, { recursive: true });
    fs.mkdirSync(path.join(tempDir!, "src"), { recursive: true });

    fs.writeFileSync(
      path.join(tiedDir, "requirements.yaml"),
      `
REQ-TRACE_GAP2:
  name: Trace gap fixture 2
  status: Active
  description: fixture
`.trim(),
      "utf8"
    );
    fs.writeFileSync(
      path.join(tiedDir, "semantic-tokens.yaml"),
      `
REQ-TRACE_GAP2:
  type: REQ
`.trim(),
      "utf8"
    );

    fs.writeFileSync(
      path.join(tempDir!, "src", "app.ts"),
      `export const x = "no req token";\n`,
      "utf8"
    );
    fs.writeFileSync(
      path.join(tempDir!, "src", "app.test.ts"),
      `it("x", () => { const _ = "[REQ-TRACE_GAP2]"; });\n`,
      "utf8"
    );

    const res = runScopedAnalysis({ mode: "traceability_gap_report" });
    assert.strictEqual(res.ok, true);
    const implGaps = res.traceability_gap_report?.dimensions.req_without_implementation.gaps ?? [];
    assert.ok(
      implGaps.some((g) => g.token === "REQ-TRACE_GAP2"),
      "REQ not in production files"
    );
    assert.strictEqual(res.traceability_gap_report?.dimensions.req_without_test.count, 0);
  });

  it("gap_report reports missing tokens discovered in scanned sources", () => {
    fs.mkdirSync(path.join(tempDir!, "src"), { recursive: true });
    fs.mkdirSync(path.join(tempDir!, "generated"), { recursive: true });

    fs.writeFileSync(path.join(tempDir!, "src", "keep.ts"), "const x = '[REQ-TEST_KEEP]'", "utf8");
    fs.writeFileSync(path.join(tempDir!, "generated", "skip.ts"), "const x = '[REQ-TEST_SKIP]'", "utf8");

    fs.writeFileSync(path.join(tempDir!, ".tiedignore"), "generated/\n", "utf8");

    const res = runScopedAnalysis({ mode: "gap_report" });
    assert.strictEqual(res.ok, true);

    const missing = res.gap_report?.missing_tokens ?? [];
    assert.ok(missing.includes("REQ-TEST_KEEP"), "keep token should be missing from registry");
    assert.ok(!missing.includes("REQ-TEST_SKIP"), "skip token should be excluded by ignore");
  });

  it("symlink policy: if follow_symlinks=false, a symlinked root is skipped", () => {
    fs.mkdirSync(path.join(tempDir!, "real"), { recursive: true });
    fs.writeFileSync(path.join(tempDir!, "real", "keep.ts"), "const x='[REQ-TEST_KEEP]'", "utf8");

    const linkPath = path.join(tempDir!, "link");
    fs.symlinkSync(path.join(tempDir!, "real"), linkPath, "dir");

    const resSkip = runScopedAnalysis({ mode: "token_scan", roots: ["link"], follow_symlinks: false });
    assert.strictEqual(resSkip.ok, true);
    assert.deepStrictEqual(resSkip.token_scan?.discovered_tokens.REQ ?? [], []);

    const resFollow = runScopedAnalysis({ mode: "token_scan", roots: ["link"], follow_symlinks: true });
    assert.strictEqual(resFollow.ok, true);
    assert.ok((resFollow.token_scan?.discovered_tokens.REQ ?? []).includes("REQ-TEST_KEEP"));
  });
});

