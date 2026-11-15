/**
 * [IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM] LOAD_LIST_PRICE_CATALOG — SC-HMEP-M2-01
 */
import fs from "node:fs";
import yaml from "js-yaml";
import path from "node:path";

export interface ModelRate {
  model_slug: string;
  input_usd_per_mtok: number | null;
  output_usd_per_mtok: number | null;
}

export interface PricingCatalog {
  schema_version: string;
  catalog_revision: string;
  currency: string;
  pricing_mode?: string;
  models: ModelRate[];
}

import { fileURLToPath } from "node:url";

export function resolveRepoRoot(): string {
  if (process.env.TIED_STORE_ROOT) {
    return process.env.TIED_STORE_ROOT;
  }
  return path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../../../..",
  );
}

export function defaultPricingCatalogPath(): string {
  return path.join(
    resolveRepoRoot(),
    "docs/agent-harness-evaluation/harness-eval/pricing/list-price-v1.yaml",
  );
}

export function loadPricingCatalog(catalogPath = defaultPricingCatalogPath()): PricingCatalog {
  if (!fs.existsSync(catalogPath)) {
    throw new Error(`DEBUG: missing pricing catalog ${catalogPath}`);
  }
  const doc = yaml.load(fs.readFileSync(catalogPath, "utf8")) as PricingCatalog;
  if (doc.schema_version !== "harness-eval-pricing-v1") {
    throw new Error(`DEBUG: unsupported pricing schema ${doc.schema_version}`);
  }
  if (!doc.catalog_revision || !Array.isArray(doc.models)) {
    throw new Error("DEBUG: invalid pricing catalog shape");
  }
  return doc;
}

export function lookupModelRate(
  catalog: PricingCatalog,
  modelSlug: string | null | undefined,
): ModelRate | null {
  if (!modelSlug) {
    return null;
  }
  const hit = catalog.models.find((m) => m.model_slug === modelSlug);
  return hit ?? null;
}
