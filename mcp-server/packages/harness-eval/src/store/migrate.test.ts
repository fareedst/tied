import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "../lib/sqlite.js";
import { describe, it } from "node:test";
import { MIGRATION_SQL_V1 } from "./schema.js";
import { openEvalDatabase } from "./db.js";

describe("schema migrate SC-HMEP-M2-02", () => {
  it("v1 database migrates to v2 preserving trial row", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hmep-migrate-"));
    const dbPath = path.join(tmp, "eval.sqlite");
    const legacy = new DatabaseSync(dbPath);
    legacy.exec(MIGRATION_SQL_V1);
    legacy
      .prepare(
        `INSERT INTO trials (trial_id, harness, wf_id, input_tokens, output_tokens, completeness)
         VALUES ('t1', 'claude', 'WF-01', 10, 5, 'complete')`,
      )
      .run();
    legacy.close();

    const db = openEvalDatabase(dbPath);
    const cols = db.prepare("PRAGMA table_info(trials)").all() as { name: string }[];
    assert.ok(cols.some((c) => c.name === "harness_estimated_cost"));
    const row = db.prepare("SELECT trial_id, input_tokens FROM trials WHERE trial_id = 't1'").get() as {
      trial_id: string;
      input_tokens: number;
    };
    assert.equal(row.input_tokens, 10);
    const ver = db.prepare("SELECT version FROM schema_version").get() as { version: number };
    assert.equal(ver.version, 2);
    db.close();
  });
});
