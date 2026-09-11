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

  it("accepts external-only block-leads for token linkage on the following procedure", () => {
    // [IMPL-QUALITY_PSEUDOCODE_VALIDATOR] [REQ-PSEUDOCODE_STATIC_ANALYSIS] — How: tokenScanStart includes external block-leads.
    const report = validateEssencePseudocode({
      token: "IMPL-TRACK-C",
      known_tokens: ["REQ-TRACK-C", "ARCH-TRACK-C", "IMPL-TRACK-C"],
      pseudocode: `# [IMPL-TRACK-C] [ARCH-TRACK-C] [REQ-TRACK-C]
procedure FIRST:
  Contract:
    INPUT: x
    OUTPUT: y
    PRE: x
    POST: y
    EFFECTS: pure
    TERMINATION: total
  RETURN y
# [IMPL-TRACK-C] [ARCH-TRACK-C] [REQ-TRACK-C]
procedure SECOND:
  Contract:
    INPUT: x
    OUTPUT: y
    PRE: x
    POST: y
    EFFECTS: pure
    TERMINATION: total
  RETURN y`,
    });

    assert.equal(report.ok, true);
    assert.ok(report.blocks[1]?.token_refs.includes("IMPL-TRACK-C"));
    assert.equal(
      report.diagnostics.filter((diagnostic) => diagnostic.code === "MISSING_BLOCK_TOKEN_LINK").length,
      0,
    );
  });

  it("does not flag MISSING_DATA_TRANSITION for negated mutation prose", () => {
    // [IMPL-QUALITY_PSEUDOCODE_VALIDATOR] [REQ-PSEUDOCODE_STATIC_ANALYSIS] — How: ignore never/does not/do not before mutat.
    const report = validateEssencePseudocode({
      token: "IMPL-TRACK-C",
      known_tokens: ["REQ-TRACK-C", "ARCH-TRACK-C", "IMPL-TRACK-C"],
      pseudocode: `# [IMPL-TRACK-C] [ARCH-TRACK-C] [REQ-TRACK-C]
procedure READ_ONLY:
  # [IMPL-TRACK-C] [ARCH-TRACK-C] [REQ-TRACK-C]
  Contract:
    INPUT: source
    OUTPUT: report
    PRE: source is present
    POST: report is observational only and never mutates inputs
    EFFECTS: pure
    TERMINATION: total
  RETURN report`,
    });

    assert.equal(report.ok, true);
    assert.equal(
      report.diagnostics.filter((diagnostic) => diagnostic.code === "MISSING_DATA_TRANSITION").length,
      0,
    );
  });

  it("still flags MISSING_DATA_TRANSITION for affirmative mutation without DATA_TRANSITION", () => {
    // [IMPL-QUALITY_PSEUDOCODE_VALIDATOR] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
    const report = validateEssencePseudocode({
      token: "IMPL-TRACK-C",
      known_tokens: ["REQ-TRACK-C", "ARCH-TRACK-C", "IMPL-TRACK-C"],
      pseudocode: `# [IMPL-TRACK-C] [ARCH-TRACK-C] [REQ-TRACK-C]
procedure WRITER:
  # [IMPL-TRACK-C] [ARCH-TRACK-C] [REQ-TRACK-C]
  Contract:
    INPUT: target
    OUTPUT: target
    PRE: target is present
    POST: target is updated
    EFFECTS: State
    TERMINATION: total
  mutates target`,
    });

    assert.equal(report.ok, false);
    assert.ok(report.diagnostics.some((diagnostic) => diagnostic.code === "MISSING_DATA_TRANSITION"));
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
