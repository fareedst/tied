/**
 * [IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM] ESTIMATE_HARNESS_LIST_PRICE — attach to trial row
 */
import type { EvalDatabase } from "../lib/sqlite.js";
import type { PricingCatalog } from "./catalog.js";
import { lookupModelRate } from "./catalog.js";
import { estimateHarnessListPrice } from "./estimate.js";
import type { TokenCompleteness } from "../types.js";

export function applyTrialPricing(
  db: EvalDatabase,
  trialId: string,
  tokens: {
    completeness: TokenCompleteness;
    input_tokens: number | null;
    output_tokens: number | null;
  },
  modelSlug: string | null | undefined,
  catalog: PricingCatalog,
): void {
  const rate = lookupModelRate(catalog, modelSlug ?? null);
  const cost = estimateHarnessListPrice({
    completeness: tokens.completeness,
    input_tokens: tokens.input_tokens,
    output_tokens: tokens.output_tokens,
    rate,
  });
  db.prepare(
    `UPDATE trials SET
      model_slug = COALESCE(?, model_slug),
      pricing_catalog_revision = ?,
      harness_estimated_cost = ?,
      normalized_list_price_cost = ?
    WHERE trial_id = ?`,
  ).run(
    modelSlug ?? null,
    cost !== null ? catalog.catalog_revision : null,
    cost,
    cost,
    trialId,
  );
}
