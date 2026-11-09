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
  hasWfTrialModelSpecId,
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

  it("resolves composer-2.5 for claude parity", () => {
    const r = resolveWfTrialModelSpec("claude", "composer-2.5", REGISTRY);
    assert.equal(r.model_config, "composer-2.5");
    assert.equal(r.model_slug, "claude-haiku-5-5");
  });

  it("rejects luna-low on claude [SC-SPEC-HARNESS]", () => {
    assert.throws(
      () => resolveWfTrialModelSpec("claude", "luna-low", REGISTRY),
      /does not support claude harness/,
    );
  });

  it("rejects unknown config id [SC-SPEC-UNKNOWN]", () => {
    assert.throws(() => resolveWfTrialModelSpec("cursor", "no-such-id", REGISTRY), /unknown WF trial config id/);
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
});
