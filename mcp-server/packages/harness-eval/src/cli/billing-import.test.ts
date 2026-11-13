import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { runCli } from "./main.js";
import { openEvalDatabase } from "../store/db.js";
import { MIGRATION_SQL_V1 } from "../store/schema.js";
import { DatabaseSync } from "../lib/sqlite.js";

describe("billing import CLI SC-HMEP-M3-05", () => {
  it("refuses import without --ledger", () => {
    const code = runCli(["billing", "import"]);
    assert.equal(code, 2);
  });

  it("applies ledger when --ledger provided", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hmep-cli-bill-"));
    const store = path.join(tmp, "store");
    fs.mkdirSync(store, { recursive: true });
    const dbPath = path.join(store, "eval.sqlite");
    const raw = new DatabaseSync(dbPath);
    raw.exec(MIGRATION_SQL_V1);
    raw.prepare(`INSERT INTO trials (trial_id, harness) VALUES ('t-cli', 'claude')`).run();
    raw.close();

    const ledgerPath = path.join(tmp, "ledger.yaml");
    fs.writeFileSync(
      ledgerPath,
      `schema_version: harness-eval-billing-ledger-v1
ledger_revision: cli-test
entries:
  - trial_id: t-cli
    actual_charged_cost: 3.14
`,
    );

    const code = runCli([
      "billing",
      "import",
      "--ledger",
      ledgerPath,
      "--store",
      store,
    ]);
    assert.equal(code, 0);

    const db = openEvalDatabase(dbPath);
    const row = db
      .prepare(`SELECT actual_charged_cost FROM trials WHERE trial_id = 't-cli'`)
      .get() as { actual_charged_cost: number };
    assert.equal(row.actual_charged_cost, 3.14);
    db.close();
  });
});
