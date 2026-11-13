/**
 * [IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM] IMPORT_BILLING_LEDGER — SC-HMEP-M3-01; F-10
 */
import fs from "node:fs";
import yaml from "js-yaml";

export interface BillingLedgerEntry {
  trial_id: string;
  provider_reported_cost?: number | null;
  actual_charged_cost?: number | null;
}

export interface BillingLedger {
  schema_version: string;
  ledger_revision: string;
  entries: BillingLedgerEntry[];
}

export function parseBillingLedgerFile(ledgerPath: string): BillingLedger {
  if (!fs.existsSync(ledgerPath)) {
    throw new Error(`DEBUG: missing billing ledger ${ledgerPath}`);
  }
  const doc = yaml.load(fs.readFileSync(ledgerPath, "utf8")) as BillingLedger;
  if (doc.schema_version !== "harness-eval-billing-ledger-v1") {
    throw new Error(`DEBUG: unsupported billing ledger schema ${doc.schema_version}`);
  }
  if (!doc.ledger_revision || !Array.isArray(doc.entries)) {
    throw new Error("DEBUG: invalid billing ledger shape");
  }
  for (const entry of doc.entries) {
    if (!entry.trial_id || typeof entry.trial_id !== "string") {
      throw new Error("DEBUG: billing entry missing trial_id");
    }
  }
  return doc;
}
