import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { DatabaseSync } from "../lib/sqlite.js";
import { MIGRATION_SQL_V1 } from "../store/schema.js";
import { migrateToV2, migrateToV3 } from "../store/migrate.js";
import { applyBillingEntries } from "./apply.js";

describe("billing apply SC-HMEP-M3-03", () => {
  it("partial ledger row leaves omitted cost null", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hmep-bill-apply-"));
    const dbPath = path.join(tmp, "eval.sqlite");
    const db = new DatabaseSync(dbPath);
    db.exec(MIGRATION_SQL_V1);
    migrateToV2(db);
    migrateToV3(db);
    db
      .prepare(
        `INSERT INTO trials (trial_id, harness, provider_reported_cost, actual_charged_cost)
         VALUES ('t1', 'cursor', NULL, NULL)`,
      )
      .run();

    applyBillingEntries(db, [
      { trial_id: "t1", provider_reported_cost: 0.5 },
    ]);

    const row = db
      .prepare(
        `SELECT provider_reported_cost, actual_charged_cost FROM trials WHERE trial_id = 't1'`,
      )
      .get() as { provider_reported_cost: number | null; actual_charged_cost: number | null };
    assert.equal(row.provider_reported_cost, 0.5);
    assert.equal(row.actual_charged_cost, null);
    db.close();
  });
});
