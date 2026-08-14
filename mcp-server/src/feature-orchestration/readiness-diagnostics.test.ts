import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildReadinessReport, formatReadinessDiagnostic } from "./diagnostics.js";

describe("READINESS_DIAGNOSTIC REQ-FEAT_READINESS_DIAGNOSTICS", () => {
  it("names each unmet prerequisite and exact corrective command deterministically", () => {
    const report = buildReadinessReport(
      { feature_id: "FEAT-001", phase: "draft" },
      { node: false, mcp: false },
      { missing: [
        { code: "MCP_BINARY_MISSING", prerequisite: "TIED_MCP_BIN", phase: "init", evidence: "not found", corrective_command: "npm run build --prefix mcp-server" },
        { code: "CONSTITUTION_MISSING", prerequisite: "project constitution", phase: "build", evidence: "tied/constitution.yaml absent", corrective_command: "cp tied/constitution.example.yaml tied/constitution.yaml" },
      ] },
    );
    assert.equal(report.ready, false);
    assert.deepEqual(report.diagnostics.map((item) => item.code), ["MCP_BINARY_MISSING", "CONSTITUTION_MISSING"]);
    assert.equal(formatReadinessDiagnostic(report.diagnostics[0]).mutating, false);
  });
});
