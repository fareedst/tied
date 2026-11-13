import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { runCli } from "./main.js";
import { openEvalDatabase } from "../store/db.js";
import { MIGRATION_SQL_V1 } from "../store/schema.js";
import { DatabaseSync } from "../lib/sqlite.js";
import { computeSuiteIntegritySha256 } from "../suite/integrity.js";

describe("regression compare CLI SC-HMEP-M4-02", () => {
  it("exits 1 on tolerance breach under default strict", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hmep-rc-"));
    const store = path.join(tmp, "store");
    fs.mkdirSync(store, { recursive: true });
    const dbPath = path.join(store, "eval.sqlite");
    const raw = new DatabaseSync(dbPath);
    raw.exec(MIGRATION_SQL_V1);
    raw
      .prepare(
        `INSERT INTO trials (trial_id, harness, wf_id, wall_clock_ms) VALUES ('t1', 'cursor', 'WF-10', 500000)`,
      )
      .run();
    raw.close();

    const doc = {
      schema_version: "harness-eval-baseline-v1",
      baseline_id: "cli-cmp",
      expectations: [
        {
          bind: { wf_id: "WF-10", harness: "cursor" },
          metrics: { wall_clock_ms: { value: 100000, tolerance_abs: 1000 } },
        },
      ],
    };
    const hash = computeSuiteIntegritySha256(doc as Record<string, unknown>);
    const baselinePath = path.join(tmp, "baseline.yaml");
    fs.writeFileSync(
      baselinePath,
      `schema_version: harness-eval-baseline-v1
baseline_id: cli-cmp
content_integrity_sha256: ${hash}
expectations:
  - bind:
      wf_id: WF-10
      harness: cursor
    metrics:
      wall_clock_ms:
        value: 100000
        tolerance_abs: 1000
`,
    );

    const code = runCli([
      "regression",
      "compare",
      "--baseline",
      baselinePath,
      "--trial-id",
      "t1",
      "--store",
      store,
    ]);
    assert.equal(code, 1);

    const codeRelaxed = runCli([
      "regression",
      "compare",
      "--baseline",
      baselinePath,
      "--trial-id",
      "t1",
      "--store",
      store,
      "--no-strict",
    ]);
    assert.equal(codeRelaxed, 0);
    const db = openEvalDatabase(dbPath);
    db.close();
  });
});
