import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ENV_CLIENT_BUNDLE_PATH,
  ENV_CLIENT_PROJECT_PATH,
  LEGACY_ENV_CLIENT_BUNDLE_PATH,
  LEGACY_ENV_CLIENT_PROJECT_PATH,
  buildCanonicalPathEnv,
  mcpEnvHasClientProjectPath,
  pickClientBundlePath,
  pickClientProjectPath,
  stripLegacyClientPathEnv,
} from "./tied-path-env.mjs";

describe("tied-path-env [REQ-TIED_CLIENT_PATH_ENV_MIGRATION]", () => {
  it("pickClientProjectPath prefers canonical over legacy", () => {
    assert.equal(
      pickClientProjectPath({
        [ENV_CLIENT_PROJECT_PATH]: "/a/tied-project",
        [LEGACY_ENV_CLIENT_PROJECT_PATH]: "/b/tied-project",
      }),
      "/a/tied-project",
    );
  });

  it("pickClientProjectPath falls back to legacy", () => {
    assert.equal(
      pickClientProjectPath({ [LEGACY_ENV_CLIENT_PROJECT_PATH]: "/legacy/tied-project" }),
      "/legacy/tied-project",
    );
  });

  it("pickClientBundlePath prefers canonical over legacy", () => {
    assert.equal(
      pickClientBundlePath({
        [ENV_CLIENT_BUNDLE_PATH]: "/a/bundle",
        [LEGACY_ENV_CLIENT_BUNDLE_PATH]: "/b/bundle",
      }),
      "/a/bundle",
    );
  });

  it("stripLegacyClientPathEnv removes legacy keys only", () => {
    const out = stripLegacyClientPathEnv({
      [ENV_CLIENT_PROJECT_PATH]: "/p",
      [LEGACY_ENV_CLIENT_PROJECT_PATH]: "/old",
      TIED_STORE_ROOT: "/store",
    });
    assert.equal(out[ENV_CLIENT_PROJECT_PATH], "/p");
    assert.equal(out.TIED_STORE_ROOT, "/store");
    assert.equal(out[LEGACY_ENV_CLIENT_PROJECT_PATH], undefined);
  });

  it("buildCanonicalPathEnv omits unset optional paths", () => {
    assert.deepEqual(buildCanonicalPathEnv({ projectPath: "/p" }), {
      [ENV_CLIENT_PROJECT_PATH]: "/p",
    });
  });

  it("mcpEnvHasClientProjectPath accepts canonical or legacy", () => {
    assert.equal(mcpEnvHasClientProjectPath({ [ENV_CLIENT_PROJECT_PATH]: "/p" }), true);
    assert.equal(mcpEnvHasClientProjectPath({ [LEGACY_ENV_CLIENT_PROJECT_PATH]: "/p" }), true);
    assert.equal(mcpEnvHasClientProjectPath({}), false);
  });
});
