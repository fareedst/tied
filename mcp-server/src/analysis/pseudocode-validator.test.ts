import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { validateEssencePseudocode } from "./pseudocode-validator.js";

describe("Layer B pseudo-code validator [IMPL-QUALITY_PSEUDOCODE_VALIDATOR] [PROC-PSEUDOCODE_VALIDATION]", () => {
  it("reports blocks, contracts, dependencies, and source locations", () => {
    // [IMPL-QUALITY_PSEUDOCODE_VALIDATOR] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
    // Summary: Report structural pseudo-code findings without claiming behavioral coverage.
    const report = validateEssencePseudocode({
      token: "IMPL-QUALITY_EVIDENCE_MANIFEST",
      known_tokens: [
        "REQ-QUALITY_ASSURANCE_EVIDENCE",
        "ARCH-QUALITY_ASSURANCE_PROFILES",
        "IMPL-QUALITY_EVIDENCE_MANIFEST",
      ],
      pseudocode: `# [IMPL-QUALITY_EVIDENCE_MANIFEST] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
# Summary: Normalize evidence.
procedure BUILD_MANIFEST:
  # [IMPL-QUALITY_EVIDENCE_MANIFEST] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
  Contract:
    INPUT: command_results
    OUTPUT: manifest
    PRE: command_results are present
    POST: manifest is stable
    EFFECTS: pure
    FAILURE_MODES: INVALID_COMMAND_RESULT
    TERMINATION: total
  IF command_results are empty:
    RETURN error INVALID_COMMAND_RESULT
  CALL NORMALIZE_RESULTS(command_results)

procedure NORMALIZE_RESULTS(input):
  # [IMPL-QUALITY_EVIDENCE_MANIFEST] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
  Contract:
    INPUT: input
    OUTPUT: normalized
    PRE: input is present
    POST: normalized is sorted
    EFFECTS: pure
    TERMINATION: total`,
    });

    assert.equal(report.ok, true);
    assert.deepEqual(report.blocks.map((block) => block.name), [
      "BUILD_MANIFEST",
      "NORMALIZE_RESULTS",
    ]);
    assert.deepEqual(report.dependencies, [
      { caller: "BUILD_MANIFEST", callee: "NORMALIZE_RESULTS", line: 15 },
    ]);
    assert.equal(report.diagnostics.length, 0);
  });

  it("preserves mixed-case registered token links", () => {
    const report = validateEssencePseudocode({
      token: "IMPL-UIManager_SCOPED_ROOT",
      known_tokens: [
        "REQ-SIDE_PANEL_POPUP_EQUIVALENT",
        "ARCH-SIDE_PANEL_TABS",
        "IMPL-UIManager_SCOPED_ROOT",
      ],
      pseudocode: `# [IMPL-UIManager_SCOPED_ROOT] [ARCH-SIDE_PANEL_TABS] [REQ-SIDE_PANEL_POPUP_EQUIVALENT]
# Summary: Keep popup elements scoped to the supplied root.
procedure CREATE_SCOPED_POPUP:
  # [IMPL-UIManager_SCOPED_ROOT] [ARCH-SIDE_PANEL_TABS] [REQ-SIDE_PANEL_POPUP_EQUIVALENT]
  Contract:
    INPUT: container
    OUTPUT: scoped_popup
    PRE: container is present
    POST: scoped_popup resolves elements within container
    EFFECTS: pure
    TERMINATION: total`,
    });

    assert.equal(report.ok, true);
    assert.ok(report.blocks[0]?.token_refs.includes("IMPL-UIManager_SCOPED_ROOT"));
    assert.equal(report.diagnostics.length, 0);
  });

  it("diagnoses missing token linkage, contracts, and unresolved calls", () => {
    const report = validateEssencePseudocode({
      token: "ARCH-QUALITY_ASSURANCE_PROFILES",
      known_tokens: ["IMPL-QUALITY_EVIDENCE_MANIFEST"],
      pseudocode: `# [IMPL-QUALITY_EVIDENCE_MANIFEST]
procedure BUILD_MANIFEST:
  IF input is empty:
    CALL UNKNOWN_STEP(input)`,
    });

    assert.equal(report.ok, false);
    assert.ok(report.diagnostics.some((diagnostic) => diagnostic.code === "MISSING_TOKEN_LINK"));
    assert.ok(report.diagnostics.some((diagnostic) => diagnostic.code === "MISSING_CONTRACT"));
    assert.ok(report.diagnostics.some((diagnostic) => diagnostic.code === "UNRESOLVED_SYMBOL"));
    assert.ok(report.diagnostics.every((diagnostic) => diagnostic.line >= 1));
  });
});
