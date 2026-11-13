import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { DatabaseSync } from "../lib/sqlite.js";
import { MIGRATION_SQL_V1 } from "../store/schema.js";
import { migrateToV2, migrateToV3 } from "../store/migrate.js";
import { openEvalDatabase } from "../store/db.js";
import { reconcileReportJson } from "./reconcile.js";

describe("reconcile report SC-HMEP-M3-04", () => {
  it("null-safe deltas in JSON output", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hmep-reconcile-"));
    const dbPath = path.join(tmp, "eval.sqlite");
    const raw = new DatabaseSync(dbPath);
    raw.exec(MIGRATION_SQL_V1);
    migrateToV2(raw);
    migrateToV3(raw);
    raw
      .prepare(
        `INSERT INTO trials (trial_id, harness, harness_estimated_cost, provider_reported_cost, actual_charged_cost)
         VALUES ('t1', 'cursor', 1.0, 0.9, NULL)`,
      )
      .run();
    raw.close();

    const db = openEvalDatabase(dbPath);
    const report = JSON.parse(reconcileReportJson(db)) as {
      trials: Array<{
        delta_estimated_vs_provider: number | null;
        delta_estimated_vs_actual: number | null;
      }>;
    };
    assert.equal(report.trials.length, 1);
    assert.ok(
      Math.abs((report.trials[0].delta_estimated_vs_provider ?? 0) - 0.1) < 1e-9,
    );
    assert.equal(report.trials[0].delta_estimated_vs_actual, null);
    db.close();
  });
});
