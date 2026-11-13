/**
 * [IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM] INGEST_TRIAL_EVENTS — SC-HMEP-M1-03
 */
import fs from "node:fs";
import type { EvalDatabase } from "../lib/sqlite.js";
import type { TokenObservation, TrialTokenSummary } from "../types.js";

export function insertObservations(
  db: EvalDatabase,
  trialId: string,
  observations: TokenObservation[],
): number {
  const stmt = db.prepare(
    `INSERT OR IGNORE INTO token_observations (
      origin_id, trial_id, harness, source_path, line_no, event_type,
      input_tokens, output_tokens, reasoning_tokens,
      cache_read_input_tokens, cache_creation_input_tokens, completeness
    ) VALUES (
      @origin_id, @trial_id, @harness, @source_path, @line_no, @event_type,
      @input_tokens, @output_tokens, @reasoning_tokens,
      @cache_read_input_tokens, @cache_creation_input_tokens, @completeness
    )`,
  );
  let inserted = 0;
  for (const obs of observations) {
    const info = stmt.run({
      ...obs,
      trial_id: trialId,
    });
    if (info.changes > 0) {
      inserted += 1;
    }
  }
  return inserted;
}

export function upsertTrialSummary(
  db: EvalDatabase,
  summary: TrialTokenSummary,
  meta: {
    harness: string;
    wf_id?: string;
    config_fingerprint?: string;
    started_at?: string;
    finished_at?: string;
    wall_clock_ms?: number | null;
    exit_code?: number | null;
  },
): void {
  db.prepare(
    `INSERT INTO trials (
      trial_id, harness, wf_id, config_fingerprint, started_at, finished_at, wall_clock_ms,
      exit_code, input_tokens, output_tokens, reasoning_tokens, completeness
    ) VALUES (
      @trial_id, @harness, @wf_id, @config_fingerprint, @started_at, @finished_at, @wall_clock_ms,
      @exit_code, @input_tokens, @output_tokens, @reasoning_tokens, @completeness
    )
    ON CONFLICT(trial_id) DO UPDATE SET
      harness = excluded.harness,
      wf_id = COALESCE(excluded.wf_id, trials.wf_id),
      config_fingerprint = COALESCE(excluded.config_fingerprint, trials.config_fingerprint),
      started_at = COALESCE(excluded.started_at, trials.started_at),
      finished_at = COALESCE(excluded.finished_at, trials.finished_at),
      wall_clock_ms = COALESCE(excluded.wall_clock_ms, trials.wall_clock_ms),
      exit_code = COALESCE(excluded.exit_code, trials.exit_code),
      input_tokens = COALESCE(excluded.input_tokens, trials.input_tokens),
      output_tokens = COALESCE(excluded.output_tokens, trials.output_tokens),
      reasoning_tokens = COALESCE(excluded.reasoning_tokens, trials.reasoning_tokens),
      completeness = COALESCE(excluded.completeness, trials.completeness)`,
  ).run({
    trial_id: summary.trial_id,
    harness: meta.harness,
    wf_id: meta.wf_id ?? null,
    config_fingerprint: meta.config_fingerprint ?? null,
    started_at: meta.started_at ?? null,
    finished_at: meta.finished_at ?? null,
    wall_clock_ms: meta.wall_clock_ms ?? null,
    exit_code: meta.exit_code ?? null,
    input_tokens: summary.input_tokens,
    output_tokens: summary.output_tokens,
    reasoning_tokens: summary.reasoning_tokens,
    completeness: summary.completeness,
  });
}

export function appendImportReceipt(importsLog: string, record: Record<string, unknown>): void {
  fs.appendFileSync(importsLog, `${JSON.stringify(record)}\n`, "utf8");
}

export function countObservationsForTrial(db: EvalDatabase, trialId: string): number {
  const row = db
    .prepare(`SELECT COUNT(*) as c FROM token_observations WHERE trial_id = ?`)
    .get(trialId) as { c: number };
  return row.c;
}
