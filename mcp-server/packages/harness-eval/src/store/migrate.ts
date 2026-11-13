/**
 * [IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM] MIGRATE_EVAL_SCHEMA_V2 — SC-HMEP-M2-02
 */
import type { EvalDatabase } from "../lib/sqlite.js";
import { V2_TRIAL_COLUMNS, V3_TRIAL_COLUMNS } from "./schema.js";

function tableHasColumn(db: EvalDatabase, table: string, column: string): boolean {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  return rows.some((r) => r.name === column);
}

export function migrateToV2(db: EvalDatabase): void {
  for (const col of V2_TRIAL_COLUMNS) {
    if (!tableHasColumn(db, "trials", col.name)) {
      db.exec(col.ddl);
    }
  }
  const row = db.prepare("SELECT version FROM schema_version LIMIT 1").get() as
    | { version: number }
    | undefined;
  const current = row?.version ?? 0;
  if (current < 2) {
    db.prepare("DELETE FROM schema_version").run();
    db.prepare("INSERT INTO schema_version (version) VALUES (?)").run(2);
  }
}

/** [IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM] MIGRATE_EVAL_SCHEMA_V3 — SC-HMEP-M3-02 */
export function migrateToV3(db: EvalDatabase): void {
  for (const col of V3_TRIAL_COLUMNS) {
    if (!tableHasColumn(db, "trials", col.name)) {
      db.exec(col.ddl);
    }
  }
  const row = db.prepare("SELECT version FROM schema_version LIMIT 1").get() as
    | { version: number }
    | undefined;
  const current = row?.version ?? 0;
  if (current < 3) {
    db.prepare("DELETE FROM schema_version").run();
    db.prepare("INSERT INTO schema_version (version) VALUES (?)").run(3);
  }
}
