/**
 * [IMPL-TIED_FILES] [REQ-TIED_SETUP]
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { tiedBaselineCommitMessage } from "./tied-baseline-commit-message.mjs";
import { TIED_REPO_ROOT } from "./constants.mjs";

describe("tiedBaselineCommitMessage [REQ-TIED_SETUP]", () => {
  it("includes methodology version from AGENTS.md", () => {
    const message = tiedBaselineCommitMessage(TIED_REPO_ROOT);
    assert.match(message, /^TIED 3\.0\.0$/);
  });
});
