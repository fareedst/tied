import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { openEvalDatabase } from "../store/db.js";
import { MIGRATION_SQL_V1 } from "../store/schema.js";
import { DatabaseSync } from "../lib/sqlite.js";
import { computeSuiteIntegritySha256 } from "../suite/integrity.js";
import { compareTrialToBaselineFile, metricWithinTolerance } from "./compare.js";

function seedTrial(dbPath: string, row: Record<string, unknown>): void {
  const db = new DatabaseSync(dbPath);
  db.exec(MIGRATION_SQL_V1);
  const keys = Object.keys(row);
  const cols = keys.join(", ");
  const placeholders = keys.map(() => "?").join(", ");
  db.prepare(`INSERT INTO trials (${cols}) VALUES (${placeholders})`).run(...keys.map((k) => row[k]));
  db.close();
}

describe("regression compare SC-HMEP-M4-02", () => {
  it("metricWithinTolerance respects pct and abs bands", () => {
    assert.ok(metricWithinTolerance(110, { value: 100, tolerance_pct: 20 }));
    assert.ok(!metricWithinTolerance(130, { value: 100, tolerance_pct: 20 }));
    assert.ok(metricWithinTolerance(105, { value: 100, tolerance_abs: 5 }));
  });

  it("fails when observed exceeds tolerance; skips null baseline metric", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hmep-cmp-"));
    const store = path.join(tmp, "store");
    fs.mkdirSync(store, { recursive: true });
    const dbPath = path.join(store, "eval.sqlite");
    seedTrial(dbPath, {
      trial_id: "t-wall",
      harness: "cursor",
      wf_id: "WF-10",
      wall_clock_ms: 900_000,
      input_tokens: null,
    });

    const exp = [
      {
        bind: { wf_id: "WF-10", harness: "cursor" },
        metrics: {
          wall_clock_ms: { value: 600_000, tolerance_pct: 20 },
          input_tokens: null,
        },
      },
    ];
    const doc = {
      schema_version: "harness-eval-baseline-v1",
      baseline_id: "compare-test",
      expectations: exp,
    };
    const hash = computeSuiteIntegritySha256(doc as Record<string, unknown>);
    const baselinePath = path.join(tmp, "baseline.yaml");
    fs.writeFileSync(
      baselinePath,
      `schema_version: harness-eval-baseline-v1
baseline_id: compare-test
content_integrity_sha256: ${hash}
expectations:
  - bind:
      wf_id: WF-10
      harness: cursor
    metrics:
      wall_clock_ms:
        value: 600000
        tolerance_pct: 20
      input_tokens: null
`,
    );

    const db = openEvalDatabase(dbPath);
    const summary = compareTrialToBaselineFile(db, "t-wall", baselinePath);
    db.close();
    assert.equal(summary.ok, false);
    const wall = summary.expectations[0].metrics.find((m) => m.metric === "wall_clock_ms");
    assert.equal(wall?.status, "fail");
    const skip = summary.expectations[0].metrics.find((m) => m.metric === "input_tokens");
    assert.equal(skip?.status, "skip");
  });
});
