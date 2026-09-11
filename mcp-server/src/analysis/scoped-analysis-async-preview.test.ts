/**
 * [REQ-TIED_ASYNC_METHODOLOGY] W6 — async diagnostic summary in impact_preview.
 */

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

import { runScopedAnalysis } from "./scoped-analysis.js";
import { clearBasePathCache } from "../yaml-loader.js";

describe("scoped analysis impact_preview async summary [REQ-TIED_ASYNC_METHODOLOGY]", () => {
  let tempDir: string;
  let origCwd: string;
  let repoRootAbs: string;

  beforeEach(() => {
    origCwd = process.cwd();
    repoRootAbs = path.resolve(origCwd, "..");
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-scoped-async-"));
    process.chdir(tempDir);
    process.env.TIED_BASE_PATH = repoRootAbs;
    clearBasePathCache();
    fs.mkdirSync(path.join(tempDir, "src"), { recursive: true });
    fs.writeFileSync(
      path.join(tempDir, "src", "async-feature.ts"),
      "// [REQ-ASYNC_COMPOSITION_INVENTORY] [IMPL-ASYNC_BINDING_VALIDATOR]\n",
      "utf8",
    );
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
    delete process.env.TIED_BASE_PATH;
    clearBasePathCache();
    process.chdir(origCwd);
  });

  it("includes async_diagnostic_summary when async tokens are discovered", () => {
    const res = runScopedAnalysis({ mode: "impact_preview", roots: ["src"] });
    const summary = res.impact_preview?.async_diagnostic_summary;

    assert.equal(res.ok, true);
    assert.ok(summary);
    assert.equal(summary?.async_in_scope_likely, true);
    assert.ok(summary?.matched_async_requirements.includes("REQ-ASYNC_COMPOSITION_INVENTORY"));
    assert.equal(summary?.layer_c_flags.typed_flow.force_on_async_detection_alone, false);
    assert.match(summary?.proof_boundary ?? "", /race-freedom/i);
  });
});
