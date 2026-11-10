/**
 * [REQ-WF_TRIAL_MODEL_COMPOSE]
 */
import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  composeCursorCatalogSlug,
  effortToModelConfigSuffix,
  isAllowedComposeEffort,
} from "./wf-trial-model-compose.mjs";
import { defaultWfTrialModelCatalogPath } from "./wf-trial-model-catalog.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const CATALOG = defaultWfTrialModelCatalogPath(REPO_ROOT);

const lunaFamily = {
  catalog_base: "gpt-5.6-luna",
  model_config_prefix: "luna",
  speed_suffix: "fast",
};

describe("wf-trial-model-compose.mjs", () => {
  it("effortToModelConfigSuffix [SC-COMPOSE-LUNA]", () => {
    assert.equal(effortToModelConfigSuffix("medium"), "med");
    assert.equal(effortToModelConfigSuffix("low"), "low");
  });

  it("compose luna medium [SC-COMPOSE-LUNA]", () => {
    const r = composeCursorCatalogSlug("luna", "medium", lunaFamily, CATALOG);
    assert.equal(r.model_slug, "gpt-5.6-luna-medium-fast");
    assert.equal(r.model_config, "luna-med");
  });

  it("compose grok47 medium [SC-COMPOSE-GROK47]", () => {
    const r = composeCursorCatalogSlug(
      "grok47",
      "medium",
      {
        catalog_base: "grok-4.7",
        model_config_prefix: "grok47",
        speed_suffix: "fast",
      },
      CATALOG,
    );
    assert.equal(r.model_slug, "grok-4.7-medium-fast");
    assert.equal(r.model_config, "grok47-med");
  });

  it("rejects missing effort [SC-COMPOSE-CONFLICT]", () => {
    assert.throws(
      () => composeCursorCatalogSlug("luna", "-", lunaFamily, CATALOG),
      /effort required/,
    );
    assert.equal(isAllowedComposeEffort("-"), false);
  });

  it("composer-2.5 compose ignores tier in slug", () => {
    const r = composeCursorCatalogSlug(
      "composer-2.5",
      "medium",
      {
        catalog_base: "composer-2.5",
        model_config_prefix: "composer-2.5",
        speed_suffix: "fast",
        effort_in_slug: false,
      },
      CATALOG,
    );
    assert.equal(r.model_slug, "composer-2.5-fast");
    assert.equal(r.model_config, "composer-2.5-med");
  });
});
