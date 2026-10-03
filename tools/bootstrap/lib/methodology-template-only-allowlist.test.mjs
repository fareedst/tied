/**
 * [REQ-TIED_CLIENT_REFRESH_PARITY] [IMPL-TIED_CLIENT_REFRESH_PARITY]
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  METHODOLOGY_TEMPLATE_ONLY_PATHS,
  isMethodologyTemplateOnlyPath,
} from "./methodology-template-only-allowlist.mjs";

describe("methodology-template-only-allowlist", () => {
  it("documents the four template-only paths from ARCH/PLAN", () => {
    assert.deepEqual([...METHODOLOGY_TEMPLATE_ONLY_PATHS].sort(), [
      "tied-project/config.yaml",
      "agent-req-checklist-feat-spawned-phase5.v1.yaml",
      "impl-essence-pseudocode-template.md",
      "processes.md",
    ].sort());
  });

  it("matches allowlisted relative paths", () => {
    assert.equal(isMethodologyTemplateOnlyPath("processes.md"), true);
    assert.equal(isMethodologyTemplateOnlyPath("requirements/REQ-TIED_SETUP.yaml"), false);
  });
});
