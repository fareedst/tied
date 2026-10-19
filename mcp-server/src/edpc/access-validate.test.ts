import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { forbiddenFlagsForTier, validateEdpcAccessMatrix } from "./access-validate.js";

// [IMPL-TIED_EDPC_ACCESS] [REQ-TIED_EDPC_COMPREHENSION]
describe("EDPC access validate [REQ-TIED_EDPC_COMPREHENSION]", () => {
  it("rejects unknown tier", () => {
    const result = validateEdpcAccessMatrix({ evidence_access_tier: "unknown" });
    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.includes("unknown_tier"));
  });

  it("source_static forbids compile and execute flags", () => {
    const result = validateEdpcAccessMatrix({
      evidence_access_tier: "source_static",
      capabilities: { compile: true, execute: false },
    });
    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.some((d) => d.includes("forbidden_capability:compile")));
  });

  it("toolchain_readonly allows compile but not source_write", () => {
    const ok = validateEdpcAccessMatrix({
      evidence_access_tier: "toolchain_readonly",
      capabilities: { compile: true, test: true },
    });
    assert.equal(ok.ok, true);
    const bad = validateEdpcAccessMatrix({
      evidence_access_tier: "toolchain_readonly",
      capabilities: { source_write: true },
    });
    assert.equal(bad.ok, false);
  });

  it("production_touch non-none requires toolchain tier", () => {
    const bad = validateEdpcAccessMatrix({
      evidence_access_tier: "source_static",
      production_touch: "read_only",
    });
    assert.ok(bad.diagnostics.includes("production_touch_requires_toolchain"));
  });

  it("forbiddenFlagsForTier matrix golden", () => {
    assert.deepEqual(forbiddenFlagsForTier("source_change", { source_write: true }), []);
  });
});
