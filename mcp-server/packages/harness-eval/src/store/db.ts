import { DatabaseSync, type EvalDatabase } from "../lib/sqlite.js";
import { MIGRATION_SQL_V1, SCHEMA_VERSION } from "./schema.js";

export function openEvalDatabase(dbPath: string): EvalDatabase {
  const db = new DatabaseSync(dbPath);
  db.exec(MIGRATION_SQL_V1);
  const row = db.prepare("SELECT version FROM schema_version LIMIT 1").get() as
    | { version: number }
    | undefined;
  if (!row || row.version !== SCHEMA_VERSION) {
    throw new Error(`DEBUG: unsupported schema version ${row?.version ?? "none"}`);
  }
  return db;
}
