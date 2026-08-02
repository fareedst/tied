/**
 * [IMPL-QUALITY_ASSURANCE_PILOT_WEBHOOK] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
 * Summary: Persist webhook inbox state through the sqlite3 CLI with idempotent transitions.
 */

import { spawnSync } from "node:child_process";

function sqlText(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function runSqlite(dbPath, sql, json = false) {
  const args = json ? ["-json", dbPath, sql] : [dbPath, sql];
  const result = spawnSync("sqlite3", args, {
    encoding: "utf8",
    maxBuffer: 1_000_000,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`sqlite3 failed: ${result.stderr.trim()}`);
  }
  return result.stdout;
}

function parseRows(output) {
  const trimmed = output.trim();
  return trimmed ? JSON.parse(trimmed) : [];
}

export function createInboxStore(dbPath) {
  function init() {
    // [IMPL-QUALITY_ASSURANCE_PILOT_WEBHOOK] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
    // How: Initialize a unique idempotency key and explicit retry state machine.
    runSqlite(
      dbPath,
      `CREATE TABLE IF NOT EXISTS inbox_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id TEXT NOT NULL,
        idempotency_key TEXT NOT NULL UNIQUE,
        payload TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'processed', 'retry', 'dead')),
        attempts INTEGER NOT NULL DEFAULT 0,
        next_attempt_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        processed_at INTEGER,
        last_error TEXT
      );
      CREATE INDEX IF NOT EXISTS inbox_events_due ON inbox_events(status, next_attempt_at);`,
    );
  }

  function insertEvent({ eventId, idempotencyKey, payload, now = Date.now() }) {
    const inserted = runSqlite(
      dbPath,
      `INSERT OR IGNORE INTO inbox_events
        (event_id, idempotency_key, payload, status, attempts, next_attempt_at, created_at)
       VALUES (${sqlText(eventId)}, ${sqlText(idempotencyKey)}, ${sqlText(JSON.stringify(payload))},
               'pending', 0, ${Math.floor(now / 1000)}, ${Math.floor(now / 1000)});
       SELECT changes() AS inserted;`,
      true,
    );
    return parseRows(inserted)[0]?.inserted === 1;
  }

  function listDue({ now = Date.now(), limit = 10 } = {}) {
    const rows = runSqlite(
      dbPath,
      `SELECT id, event_id, idempotency_key, payload, status, attempts, next_attempt_at
       FROM inbox_events
       WHERE status IN ('pending', 'retry') AND next_attempt_at <= ${Math.floor(now / 1000)}
       ORDER BY id LIMIT ${Math.max(1, Math.floor(limit))};`,
      true,
    );
    return parseRows(rows).map((row) => ({ ...row, payload: JSON.parse(row.payload) }));
  }

  function claim(id) {
    // [IMPL-QUALITY_ASSURANCE_PILOT_WEBHOOK] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
    // How: Atomically claim one due row and return no row when another worker owns it.
    const output = runSqlite(
      dbPath,
      `UPDATE inbox_events SET status = 'processing', attempts = attempts + 1
       WHERE id = ${Number(id)} AND status IN ('pending', 'retry')
       RETURNING id, event_id, idempotency_key, payload, status, attempts;`,
      true,
    );
    const row = parseRows(output)[0];
    return row ? { ...row, payload: JSON.parse(row.payload) } : null;
  }

  function markProcessed(id, now = Date.now()) {
    runSqlite(
      dbPath,
      `UPDATE inbox_events SET status = 'processed', processed_at = ${Math.floor(now / 1000)}
       WHERE id = ${Number(id)} AND status = 'processing';`,
    );
  }

  function markRetry(id, error, nextAttemptAt) {
    runSqlite(
      dbPath,
      `UPDATE inbox_events SET status = 'retry', next_attempt_at = ${Math.floor(nextAttemptAt / 1000)},
       last_error = ${sqlText(error)}
       WHERE id = ${Number(id)} AND status = 'processing';`,
    );
  }

  function markDead(id, error) {
    runSqlite(
      dbPath,
      `UPDATE inbox_events SET status = 'dead', last_error = ${sqlText(error)}
       WHERE id = ${Number(id)} AND status = 'processing';`,
    );
  }

  function getByKey(idempotencyKey) {
    const output = runSqlite(
      dbPath,
      `SELECT id, event_id, idempotency_key, status, attempts
       FROM inbox_events WHERE idempotency_key = ${sqlText(idempotencyKey)};`,
      true,
    );
    return parseRows(output)[0] ?? null;
  }

  return { init, insertEvent, listDue, claim, markProcessed, markRetry, markDead, getByKey };
}
