import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { DatabaseSync } from "../lib/sqlite.js";
import { MIGRATION_SQL_V1 } from "./schema.js";
import { openEvalDatabase } from "./db.js";
import { migrateToV2 } from "./migrate.js";

describe("schema migrate SC-HMEP-M3-02", () => {
  it("v2 database migrates to v3 preserving trial row", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hmep-migrate-v3-"));
    const dbPath = path.join(tmp, "eval.sqlite");
    const legacy = new DatabaseSync(dbPath);
    legacy.exec(MIGRATION_SQL_V1);
    migrateToV2(legacy);
    legacy
      .prepare(
        `INSERT INTO trials (trial_id, harness, wf_id, harness_estimated_cost)
         VALUES ('t1', 'claude', 'WF-10', 0.12)`,
      )
      .run();
    legacy.close();

    const db = openEvalDatabase(dbPath);
    const cols = db.prepare("PRAGMA table_info(trials)").all() as { name: string }[];
    assert.ok(cols.some((c) => c.name === "provider_reported_cost"));
    assert.ok(cols.some((c) => c.name === "actual_charged_cost"));
    const row = db
      .prepare(`SELECT harness_estimated_cost FROM trials WHERE trial_id = 't1'`)
      .get() as { harness_estimated_cost: number };
    assert.equal(row.harness_estimated_cost, 0.12);
    const ver = db.prepare("SELECT version FROM schema_version").get() as { version: number };
    assert.equal(ver.version, 3);
    db.close();
  });
});
