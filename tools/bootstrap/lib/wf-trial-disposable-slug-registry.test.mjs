/**
 * [REQ-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT] [IMPL-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT]
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import yaml from "js-yaml";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const SLUG_REGISTRY_DIST = path.join(REPO_ROOT, "mcp-server/dist/checklist-slug-registry.js");
const SLIM_TEMPLATE = path.join(REPO_ROOT, "tied-bundle/templates/wf-trial-minimal-checklist-tracker.yaml");

describe("wf-trial disposable slug registry [REQ-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT]", () => {
  it("SC-WF-DGA-01 loadWfTrialDisposableChecklistSlugs includes slim tracker slugs", async () => {
    if (!fs.existsSync(SLUG_REGISTRY_DIST)) {
      return;
    }
    const { loadWfTrialDisposableChecklistSlugs } = await import(SLUG_REGISTRY_DIST);
    const slugs = loadWfTrialDisposableChecklistSlugs(SLIM_TEMPLATE);
    assert.ok(slugs.has("red-tests"));
    assert.ok(slugs.has("implement-code"));
    assert.ok(slugs.has("sub-adversarial-inquiry-pass"));
  });

  it("SC-WF-DGA-02 slim template seeds rationale on sub-adversarial-inquiry-pass", () => {
    const doc = yaml.load(fs.readFileSync(SLIM_TEMPLATE, "utf8"));
    const step = doc.steps?.find((s) => s.slug === "sub-adversarial-inquiry-pass");
    assert.ok(step);
    assert.equal(typeof step.rationale, "string");
    assert.ok(step.rationale.trim().length > 8);
    assert.equal(step.policy, "minimal-depth-no-inquiry");
  });
});