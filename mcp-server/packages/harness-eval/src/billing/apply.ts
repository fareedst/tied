/**
 * [IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM] billing ledger apply — SC-HMEP-M3-03
 */
import type { EvalDatabase } from "../lib/sqlite.js";
import type { BillingLedgerEntry } from "./ledger.js";

export interface BillingApplySummary {
  updated: number;
  skipped_unknown_trial: string[];
}

export function applyBillingEntries(
  db: EvalDatabase,
  entries: BillingLedgerEntry[],
): BillingApplySummary {
  const skipped: string[] = [];
  let updated = 0;
  const existsStmt = db.prepare("SELECT 1 FROM trials WHERE trial_id = ?");
  const updateStmt = db.prepare(
    `UPDATE trials SET provider_reported_cost = ?, actual_charged_cost = ?
     WHERE trial_id = ?`,
  );

  for (const entry of entries) {
    const hit = existsStmt.get(entry.trial_id);
    if (!hit) {
      skipped.push(entry.trial_id);
      continue;
    }
    const row = db.prepare(
      `SELECT provider_reported_cost, actual_charged_cost FROM trials WHERE trial_id = ?`,
    ).get(entry.trial_id) as {
      provider_reported_cost: number | null;
      actual_charged_cost: number | null;
    };

    const provider =
      entry.provider_reported_cost !== undefined
        ? entry.provider_reported_cost
        : row.provider_reported_cost;
    const actual =
      entry.actual_charged_cost !== undefined
        ? entry.actual_charged_cost
        : row.actual_charged_cost;

    updateStmt.run(provider, actual, entry.trial_id);
    updated += 1;
  }

  return { updated, skipped_unknown_trial: skipped };
}
