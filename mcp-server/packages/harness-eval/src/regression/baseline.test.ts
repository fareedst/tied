import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { computeSuiteIntegritySha256 } from "../suite/integrity.js";
import { validateRegressionBaselineIntegrity } from "./baseline.js";
import { runCli } from "../cli/main.js";

describe("regression baseline SC-HMEP-M4-01", () => {
  it("rejects tampered content_integrity_sha256", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hmep-base-"));
    const body = {
      schema_version: "harness-eval-baseline-v1",
      baseline_id: "test-baseline",
      suite_ref: "suites/engineering-suite-v1.yaml",
      content_integrity_sha256: "deadbeef",
      expectations: [
        {
          bind: { wf_id: "WF-10", harness: "cursor" },
          metrics: { wall_clock_ms: { value: 1000, tolerance_pct: 10 } },
        },
      ],
    };
    const p = path.join(tmp, "baseline.yaml");
    fs.writeFileSync(
      p,
      `schema_version: harness-eval-baseline-v1
baseline_id: test-baseline
suite_ref: suites/engineering-suite-v1.yaml
content_integrity_sha256: deadbeef
expectations:
  - bind:
      wf_id: WF-10
      harness: cursor
    metrics:
      wall_clock_ms:
        value: 1000
        tolerance_pct: 10
`,
    );
    assert.equal(validateRegressionBaselineIntegrity(p).ok, false);
    assert.equal(runCli(["regression", "baseline", "validate", p]), 1);
    const hash = computeSuiteIntegritySha256(body as Record<string, unknown>);
    fs.writeFileSync(
      p,
      `schema_version: harness-eval-baseline-v1
baseline_id: test-baseline
suite_ref: suites/engineering-suite-v1.yaml
content_integrity_sha256: ${hash}
expectations:
  - bind:
      wf_id: WF-10
      harness: cursor
    metrics:
      wall_clock_ms:
        value: 1000
        tolerance_pct: 10
`,
    );
    assert.equal(validateRegressionBaselineIntegrity(p).ok, true);
    assert.equal(runCli(["regression", "baseline", "validate", p]), 0);
  });
});
