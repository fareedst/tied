/**
 * [REQ-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT] [REQ-WF_TRIAL_DISPOSABLE_CLOSEOUT_READINESS]
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

  it("SC-DCR-01 resolves slim template from TIED_STORE_ROOT when cwd lacks local copy [REQ-WF_TRIAL_DISPOSABLE_CLOSEOUT_READINESS]", async () => {
    if (!fs.existsSync(SLUG_REGISTRY_DIST)) {
      return;
    }
    const thinRoot = fs.mkdtempSync(
      path.join(path.dirname(fileURLToPath(import.meta.url)), ".thin-client-"),
    );
    try {
      fs.mkdirSync(path.join(thinRoot, "tied-bundle", "templates"), { recursive: true });
      const previousCwd = process.cwd();
      const previousStore = process.env.TIED_STORE_ROOT;
      const previousClient = process.env.TIED_CLIENT_BUNDLE_PATH;
      process.chdir(thinRoot);
      process.env.TIED_STORE_ROOT = REPO_ROOT;
      delete process.env.TIED_CLIENT_BUNDLE_PATH;
      const { resetWfTrialDisposableChecklistSlugCache, loadWfTrialDisposableChecklistSlugs } =
        await import(SLUG_REGISTRY_DIST + `?t=${Date.now()}`);
      resetWfTrialDisposableChecklistSlugCache();
      const slugs = loadWfTrialDisposableChecklistSlugs();
      assert.ok(slugs.size > 0, "expected store_bundle resolution");
      assert.ok(slugs.has("red-tests"));
      process.chdir(previousCwd);
      if (previousStore === undefined) delete process.env.TIED_STORE_ROOT;
      else process.env.TIED_STORE_ROOT = previousStore;
      if (previousClient === undefined) delete process.env.TIED_CLIENT_BUNDLE_PATH;
      else process.env.TIED_CLIENT_BUNDLE_PATH = previousClient;
    } finally {
      fs.rmSync(thinRoot, { recursive: true, force: true });
    }
  });

  it("SC-DCR-02 manifest lists wf-trial-minimal-checklist-tracker for install copy", () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(REPO_ROOT, "tools/bootstrap/manifest.json"), "utf8"),
    );
    assert.ok(
      manifest.METHODOLOGY_TEMPLATES_TO_COPY.includes("wf-trial-minimal-checklist-tracker.yaml"),
    );
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