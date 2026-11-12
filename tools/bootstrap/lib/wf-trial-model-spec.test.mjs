/**
 * [REQ-WF_TRIAL_MODEL_SPEC_CLI] [SC-SPEC-REGISTRY]
 */
import assert from "node:assert/strict";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  defaultWfTrialModelSpecRegistryPath,
  hasWfTrialModelRef,
  hasWfTrialModelSpecId,
  resolveWfTrialModelRef,
  resolveWfTrialModelSpec,
} from "./wf-trial-model-spec.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const REGISTRY = defaultWfTrialModelSpecRegistryPath(REPO_ROOT);
const CLI = path.join(REPO_ROOT, "tools/bootstrap/lib/wf-trial-model-spec.mjs");

describe("wf-trial-model-spec.mjs", () => {
  it("resolves luna-low for cursor [SC-SPEC-RESOLVE]", () => {
    const r = resolveWfTrialModelSpec("cursor", "luna-low", REGISTRY);
    assert.equal(r.model_config, "luna-low");
    assert.equal(r.model_slug, "gpt-5.6-luna-low-fast");
  });

  it("rejects composer-2.5 on claude harness [SC-CAT-COMPOSER-CLAUDE-FAIL]", () => {
    assert.throws(
      () => resolveWfTrialModelSpec("claude", "composer-2.5", REGISTRY),
      /does not support claude harness/,
    );
    assert.throws(
      () => resolveWfTrialModelRef("claude", "composer-2.5", REGISTRY),
      /does not support claude harness/,
    );
  });

  it("resolves haiku-5-5 alias on claude [SC-CAT-ALIAS]", () => {
    const r = resolveWfTrialModelRef("claude", "haiku-5-5", REGISTRY);
    assert.equal(r.model_slug, "claude-haiku-5-5");
    assert.equal(r.model_config, "claude-haiku-5-5");
    assert.equal(r.resolution, "alias");
  });

  it("resolves sonnet-4-6 alias on claude [SC-CAT-ALIAS]", () => {
    const r = resolveWfTrialModelRef("claude", "sonnet-4-6", REGISTRY);
    assert.equal(r.model_slug, "claude-sonnet-4-6");
    assert.equal(r.model_config, "claude-sonnet-4-6");
    assert.equal(r.resolution, "alias");
  });

  it("resolves cursor catalog slug luna-low-fast [SC-CAT-SLUG]", () => {
    const r = resolveWfTrialModelRef("cursor", "gpt-5.6-luna-low-fast", REGISTRY);
    assert.equal(r.model_config, "luna-low");
    assert.equal(r.model_slug, "gpt-5.6-luna-low-fast");
  });

  it("rejects luna-low on claude [SC-SPEC-HARNESS]", () => {
    assert.throws(
      () => resolveWfTrialModelSpec("claude", "luna-low", REGISTRY),
      /does not support claude harness/,
    );
  });

  it("rejects unknown config id [SC-SPEC-UNKNOWN]", () => {
    assert.throws(() => resolveWfTrialModelSpec("cursor", "no-such-id", REGISTRY), /unknown WF trial config id/);
    assert.throws(() => resolveWfTrialModelRef("cursor", "no-such-id-xyz", REGISTRY), /unknown model ref/);
    assert.equal(hasWfTrialModelRef("cursor", "no-such-id-xyz", REGISTRY), false);
  });

  it("has registry ids", () => {
    assert.equal(hasWfTrialModelSpecId("luna-med", REGISTRY), true);
    assert.equal(hasWfTrialModelSpecId("missing", REGISTRY), false);
  });

  it("CLI resolve prints JSON", () => {
    const r = spawnSync(process.execPath, [CLI, "resolve", "cursor", "luna-med"], {
      cwd: REPO_ROOT,
      encoding: "utf8",
    });
    assert.equal(r.status, 0, r.stderr);
    const parsed = JSON.parse(r.stdout.trim());
    assert.equal(parsed.model_config, "luna-med");
    assert.equal(parsed.model_slug, "gpt-5.6-luna-med-fast");
  });

  it("CLI resolve fails on harness gap", () => {
    const r = spawnSync(process.execPath, [CLI, "resolve", "claude", "grok47-med"], {
      cwd: REPO_ROOT,
      encoding: "utf8",
    });
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /does not support claude harness/);
  });

  it("composes luna with effort [SC-COMPOSE-LUNA]", () => {
    const r = resolveWfTrialModelRef("cursor", "luna", REGISTRY, undefined, "medium");
    assert.equal(r.resolution, "compose");
    assert.equal(r.model_slug, "gpt-5.6-luna-medium-fast");
    assert.equal(r.model_config, "luna-med");
  });

  it("requires effort for compose family [SC-COMPOSE-EFFORT]", () => {
    assert.throws(
      () => resolveWfTrialModelRef("cursor", "luna", REGISTRY, undefined, "-"),
      /effort required for compose family/,
    );
  });

  it("rejects tier mismatch on legacy id [SC-COMPOSE-TIER]", () => {
    assert.throws(
      () => resolveWfTrialModelRef("cursor", "luna-low", REGISTRY, undefined, "medium"),
      /tier mismatch/,
    );
    const legacy = resolveWfTrialModelRef("cursor", "luna-low", REGISTRY, undefined, "-");
    assert.equal(legacy.model_config, "luna-low");
  });

  it("CLI resolve-ref with effort", () => {
    const r = spawnSync(process.execPath, [CLI, "resolve-ref", "cursor", "luna", "medium"], {
      cwd: REPO_ROOT,
      encoding: "utf8",
    });
    assert.equal(r.status, 0, r.stderr);
    const parsed = JSON.parse(r.stdout.trim());
    assert.equal(parsed.resolution, "compose");
    assert.equal(parsed.model_slug, "gpt-5.6-luna-medium-fast");
  });
});
