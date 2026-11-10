/**
 * [REQ-WF_TRIAL_MODEL_CATALOG_RESOLVE]
 */
import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  defaultWfTrialModelCatalogPath,
  deriveCursorModelConfig,
  loadWfTrialModelCatalog,
  parseAgentModelsStdout,
  parseClaudeModelsJson,
} from "./wf-trial-model-catalog.mjs";
import { defaultWfTrialModelSpecRegistryPath, loadWfTrialModelSpecRegistry } from "./wf-trial-model-spec.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const CATALOG = defaultWfTrialModelCatalogPath(REPO_ROOT);
const REGISTRY = defaultWfTrialModelSpecRegistryPath(REPO_ROOT);

describe("wf-trial-model-catalog.mjs", () => {
  it("loads catalog v1 schema [SC-CAT-SYNC-CHECK]", () => {
    const cat = loadWfTrialModelCatalog(CATALOG);
    assert.ok(cat.cursorBySlug.size > 50);
    assert.ok(cat.claudeBySlug.size >= 15);
    assert.equal(cat.aliases.claude["haiku-5-5"], "claude-haiku-5-5");
  });

  it("parses agent models fixture lines", () => {
    const text = `composer-2.5-fast - Composer 2.5 Fast
gpt-5.6-luna-low-fast - Luna Low
`;
    const slugs = parseAgentModelsStdout(text);
    assert.deepEqual(slugs, ["composer-2.5-fast", "gpt-5.6-luna-low-fast"]);
  });

  it("deriveCursorModelConfig luna-low [SC-CAT-SLUG]", () => {
    const matrix = loadWfTrialModelSpecRegistry(REGISTRY);
    assert.equal(deriveCursorModelConfig("gpt-5.6-luna-low-fast", matrix), "luna-low");
    assert.equal(deriveCursorModelConfig("grok-4.7-medium-fast", matrix), "grok47-med");
  });

  it("parses Claude JSON fixture", () => {
    const ids = parseClaudeModelsJson({
      data: [{ id: "claude-haiku-5-5" }, { id: "claude-sonnet-5-5" }],
    });
    assert.deepEqual(ids, ["claude-haiku-5-5", "claude-sonnet-5-5"]);
  });
});
