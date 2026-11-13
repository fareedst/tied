import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { loadPricingCatalog, lookupModelRate } from "./catalog.js";
import { estimateHarnessListPrice } from "./estimate.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../..");

describe("pricing SC-HMEP-M2-01", () => {
  it("unknown model_slug yields null estimated cost", () => {
    const catalog = loadPricingCatalog(
      path.join(repoRoot, "docs/demos/harness-eval/pricing/list-price-v1.yaml"),
    );
    const rate = lookupModelRate(catalog, "nonexistent-model-xyz");
    assert.equal(rate, null);
    const cost = estimateHarnessListPrice({
      completeness: "complete",
      input_tokens: 1000,
      output_tokens: 500,
      rate,
    });
    assert.equal(cost, null);
  });

  it("known model with complete tokens yields non-null cost", () => {
    const catalog = loadPricingCatalog(
      path.join(repoRoot, "docs/demos/harness-eval/pricing/list-price-v1.yaml"),
    );
    const rate = lookupModelRate(catalog, "claude-sonnet-5-5");
    assert.ok(rate);
    const cost = estimateHarnessListPrice({
      completeness: "complete",
      input_tokens: 1_000_000,
      output_tokens: 0,
      rate,
    });
    assert.equal(cost, 3.0);
  });
});
