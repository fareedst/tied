import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runProjectLint, resolveImplDetailPath } from "./project-lint.js";

// [IMPL-TIED_PROJECT_LINT] [ARCH-TIED_PROJECT_LINT_BOUNDARY] [REQ-TIED_PROJECT_LINT] — How: unit tests for read-only lint aggregation.
describe("runProjectLint [REQ-TIED_PROJECT_LINT]", () => {
  it("aggregates index and consistency without mutation", () => {
    const before = resolveImplDetailPath("IMPL-TIED_PROJECT_LINT");
    const result = runProjectLint();
    assert.equal(typeof result.ok, "boolean");
    assert.ok(result.sections.indexes.requirements);
    assert.ok(result.sections.consistency);
    assert.equal(resolveImplDetailPath("IMPL-TIED_PROJECT_LINT"), before);
  });

  it("validates citdp DAE fields when citdp provided", () => {
    const result = runProjectLint({
      citdp: { size: "NOT_A_SIZE" },
    });
    assert.equal(result.sections.citdp_dae?.ok, false);
  });
});
