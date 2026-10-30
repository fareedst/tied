import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ENV_CLIENT_BUNDLE_PATH,
  ENV_CLIENT_PROJECT_PATH,
  LEGACY_ENV_CLIENT_BUNDLE_PATH,
  LEGACY_ENV_CLIENT_PROJECT_PATH,
  pickClientBundlePath,
  pickClientProjectPath,
  stripLegacyClientPathEnv,
} from "./tied-path-env.js";

describe("tied-path-env [REQ-TIED_CLIENT_PATH_ENV_MIGRATION]", () => {
  it("matches bootstrap pick semantics", () => {
    assert.equal(
      pickClientProjectPath({
        [ENV_CLIENT_PROJECT_PATH]: "/canonical",
        [LEGACY_ENV_CLIENT_PROJECT_PATH]: "/legacy",
      }),
      "/canonical",
    );
    assert.equal(pickClientBundlePath({ [LEGACY_ENV_CLIENT_BUNDLE_PATH]: "/b" }), "/b");
    const stripped = stripLegacyClientPathEnv({
      [ENV_CLIENT_PROJECT_PATH]: "/p",
      [LEGACY_ENV_CLIENT_PROJECT_PATH]: "/old",
    });
    assert.equal(stripped[LEGACY_ENV_CLIENT_PROJECT_PATH], undefined);
  });
});
