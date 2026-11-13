import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fixtureCoverageReport } from "./diagnostics.js";

describe("diagnostics SC-HMEP-M1-07", () => {
  it("lists fixture ids per harness", () => {
    const report = fixtureCoverageReport();
    assert.ok(report.cursor.includes("cursor-success-with-usage"));
    assert.ok(report.claude.includes("claude-resume-cumulative"));
  });
});
