import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeInputIdentity,
  mergeBudgets,
  sortDiagnostics,
} from "./pseudocode-analyze-report.js";

describe("pseudocode-analyze-report helpers [REQ-PSEUDOCODE_STATIC_ANALYSIS]", () => {
  it("computes stable input identity across line endings", () => {
    // [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
    assert.equal(
      computeInputIdentity("a\nb").hash,
      computeInputIdentity("a\r\nb").hash,
    );
  });

  it("sorts diagnostics by line then code", () => {
    // [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
    const sorted = sortDiagnostics([
      { severity: "warning", code: "DEREF_OBLIGATION", message: "z", line: 5 },
      { severity: "error", code: "UNRESOLVED_CALL", message: "a", line: 1 },
    ]);
    assert.equal(sorted[0].line, 1);
  });

  it("mergeBudgets preserves defaults for unspecified keys", () => {
    // [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
    const { effective } = mergeBudgets({});
    assert.ok(effective.max_parse_nodes > 0);
  });
});
