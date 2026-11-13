import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { parseBillingLedgerFile } from "./ledger.js";
import { applyBillingEntries } from "./apply.js";
import { openEvalDatabase } from "../store/db.js";
import { MIGRATION_SQL_V1 } from "../store/schema.js";
import { DatabaseSync } from "../lib/sqlite.js";
describe("billing ledger SC-HMEP-M3-01", () => {
  it("unknown trial_id lines recorded as skips without throwing", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hmep-bill-"));
    const dbPath = path.join(tmp, "eval.sqlite");
    const ldbPath = path.join(tmp, "ledger.yaml");
    const raw = new DatabaseSync(dbPath);
    raw.exec(MIGRATION_SQL_V1);
    raw
      .prepare(
        `INSERT INTO trials (trial_id, harness) VALUES ('known-trial', 'cursor')`,
      )
      .run();
    raw.close();
    const db = openEvalDatabase(dbPath);
    fs.writeFileSync(
      ldbPath,
      `schema_version: harness-eval-billing-ledger-v1
ledger_revision: t1
entries:
  - trial_id: known-trial
    provider_reported_cost: 1.0
  - trial_id: missing-trial
    actual_charged_cost: 2.0
`,
    );
    const ledger = parseBillingLedgerFile(ldbPath);
    const summary = applyBillingEntries(db, ledger.entries);
    assert.equal(summary.updated, 1);
    assert.deepEqual(summary.skipped_unknown_trial, ["missing-trial"]);
    db.close();
  });
});
