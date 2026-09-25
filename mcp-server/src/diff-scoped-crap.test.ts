import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "node:test";

import {
  buildDiffScopedCrapReport,
  resolveCrapThreshold,
  writeDiffScopedCrapReport,
} from "./diff-scoped-crap.js";

// [IMPL-TIED_DAE_INCORPORATION] [ARCH-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION] — How: W2d diff-scoped CRAP threshold tests.

describe("diff-scoped change-risk report [REQ-TIED_DAE_INCORPORATION]", () => {
  let tempRoot: string;

  afterEach(() => {
    if (tempRoot) {
      fs.rmSync(tempRoot, { recursive: true, force: true });
      tempRoot = "";
    }
  });

  it("fails verification-gate when above threshold and crap_block true", () => {
    const report = buildDiffScopedCrapReport({
      request_token: "REQ-FIXTURE",
      project_root: "/tmp",
      diff_paths: ["src/a.ts"],
      coverage_by_path: { "src/a.ts": 0 },
      complexity_by_path: { "src/a.ts": 10 },
      threshold: 5,
      enabled: true,
      diff_scoped_crap: true,
      crap_block: true,
      hook_slug: "verification-gate",
      timestamp: "2026-09-24T120000Z",
    });
    assert.equal(report.action, "fail");
    assert.ok(report.files[0].above_threshold);
  });

  it("warns at traceable-commit when crap_block false", () => {
    const report = buildDiffScopedCrapReport({
      request_token: "REQ-FIXTURE",
      project_root: "/tmp",
      diff_paths: ["src/a.ts"],
      coverage_by_path: { "src/a.ts": 0 },
      complexity_by_path: { "src/a.ts": 10 },
      threshold: 5,
      enabled: true,
      diff_scoped_crap: true,
      crap_block: false,
      hook_slug: "traceable-commit",
      timestamp: "2026-09-24T120000Z",
    });
    assert.equal(report.action, "warn");
  });

  it("writes report under working/{REQ}/evidence when enabled", () => {
    tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "diff-crap-"));
    const result = writeDiffScopedCrapReport({
      request_token: "REQ-FIXTURE",
      project_root: tempRoot,
      diff_paths: ["src/a.ts"],
      coverage_by_path: { "src/a.ts": 100 },
      threshold: 30,
      enabled: true,
      diff_scoped_crap: true,
      crap_block: true,
      hook_slug: "verification-gate",
      timestamp: "2026-09-24T120000Z",
    });
    assert.equal(result.ok, true);
    assert.ok(result.report_path?.includes("working/REQ-FIXTURE/evidence/diff-scoped-crap-"));
    assert.ok(fs.existsSync(result.report_path!));
  });

  it("defaults threshold from CITDP crap_threshold", () => {
    assert.equal(resolveCrapThreshold({ crap_threshold: 12 }), 12);
    assert.equal(resolveCrapThreshold({}), 30);
  });
});
