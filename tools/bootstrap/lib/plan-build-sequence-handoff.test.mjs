/**
 * [REQ-PROMPT_TYPE_REFINE_BUILD_PHASE_GUARD] T-HANDOFF-LINT-01/02
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { lintPlanBuildSequenceHandoff } from "./plan-build-sequence-handoff.mjs";

const VALID = `# Handoff

**plan_phase:** \`pre-implementation\`

## Do next

**@build-plan** for REQ-EXAMPLE
`;

const INVALID_CLOSE_ONLY = `# Handoff

**plan_phase:** \`pre-implementation\`

## Do next

Optional **@close-out** when sponsor wants envelope.
`;

describe("plan-build-sequence handoff lint [REQ-PROMPT_TYPE_REFINE_BUILD_PHASE_GUARD]", () => {
  it("T-HANDOFF-LINT-02 passes when pre-implementation Do next includes @build-plan", () => {
    const result = lintPlanBuildSequenceHandoff(VALID);
    assert.equal(result.ok, true);
  });

  it("T-HANDOFF-LINT-01 fails when pre-implementation Do next omits @build-plan", () => {
    const result = lintPlanBuildSequenceHandoff(INVALID_CLOSE_ONLY);
    assert.equal(result.ok, false);
    assert.equal(result.code, "pre_implementation_requires_build_plan_in_do_next");
  });

  it("skips lint when plan_phase is post-build", () => {
    const md = `# Handoff

**plan_phase:** \`post-build\`

## Do next

Optional **@close-out**.
`;
    assert.equal(lintPlanBuildSequenceHandoff(md).ok, true);
  });
});
