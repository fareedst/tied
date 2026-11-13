/**
 * [IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM] billing import orchestration — SC-HMEP-M3-01
 */
import type { EvalDatabase } from "../lib/sqlite.js";
import { applyBillingEntries } from "./apply.js";
import { parseBillingLedgerFile } from "./ledger.js";

export interface BillingImportResult extends ReturnType<typeof applyBillingEntries> {
  ledger_revision: string;
}

export function importBillingLedger(db: EvalDatabase, ledgerPath: string): BillingImportResult {
  const ledger = parseBillingLedgerFile(ledgerPath);
  const summary = applyBillingEntries(db, ledger.entries);
  return { ledger_revision: ledger.ledger_revision, ...summary };
}
