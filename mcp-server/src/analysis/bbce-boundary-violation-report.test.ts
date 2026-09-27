import { describe, it } from "node:test";
import assert from "node:assert";

import { buildBoundaryViolationReport } from "./bbce-boundary-violation-report.js";
import { validateBoundaryViolationReport, type SliceMapV1 } from "./bbce-schemas.js";

const SLICE_MAP: SliceMapV1 = {
  schema_version: "bbce-slice-map.v1",
  change_id: "PLAN-TIED-BBCE-ALIGNMENT",
  shared_mechanism_globs: ["mcp-server/packages/agentstream/src/paths.ts"],
  bindings: [
    {
      binding_id: "Claude live driver (W1 replay anchor)",
      owning_slice_req: "REQ-TIED_CLAUDE_LIVE_DRIVER",
      path_globs: [
        "mcp-server/packages/agentstream/fixtures/claude/**",
        "mcp-server/packages/agentstream/src/claude-driver.ts",
      ],
    },
    {
      binding_id: "control goto → replace remaining",
      owning_slice_req: "REQ-GOAGENT-CHECKLIST-CONTROL",
      path_globs: ["mcp-server/packages/agentstream/src/control.ts"],
    },
  ],
};

describe("bbce boundary violation report (Mechanism C)", () => {
  it("reports shared_mechanism_touch for paths.ts distinct from traceability shape", () => {
    const report = buildBoundaryViolationReport({
      change_id: "PLAN-TIED-BBCE-ALIGNMENT",
      scenario_id: "unit-paths-ts",
      declared_owning_slice_req: "REQ-TIED_CLAUDE_LIVE_DRIVER",
      slice_map: SLICE_MAP,
      slice_map_ref: "tied/analysis/agentstream-slice-map.yaml",
      changed_paths: ["mcp-server/packages/agentstream/src/paths.ts"],
      timestamp: "2026-09-27T12:00:00.000Z",
    });
    assert.strictEqual(report.schema_version, "bbce-boundary-violation.v1");
    assert.strictEqual(report.traceability_gaps_excluded, true);
    assert.ok(!("dimensions" in report), "must not mirror traceability_gap_report");
    const touch = report.crossings.find((c) => c.path.endsWith("paths.ts"));
    assert.ok(touch);
    assert.strictEqual(touch!.kind, "shared_mechanism_touch");
    assert.strictEqual(touch!.classified_as, "shared_mechanism");
  });

  it("reports foreign_slice crossing for control.ts when declared slice is Claude", () => {
    const report = buildBoundaryViolationReport({
      change_id: "PLAN-TIED-BBCE-ALIGNMENT",
      scenario_id: "unit-control-cross",
      declared_owning_slice_req: "REQ-TIED_CLAUDE_LIVE_DRIVER",
      slice_map: SLICE_MAP,
      slice_map_ref: "tied/analysis/agentstream-slice-map.yaml",
      changed_paths: ["mcp-server/packages/agentstream/src/control.ts"],
      timestamp: "2026-09-27T12:00:00.000Z",
    });
    const crossing = report.crossings.find((c) => c.path.endsWith("control.ts"));
    assert.ok(crossing);
    assert.strictEqual(crossing!.kind, "slice_crossing");
    assert.strictEqual(crossing!.classified_as, "foreign_slice");
    assert.strictEqual(crossing!.owning_slice_req, "REQ-GOAGENT-CHECKLIST-CONTROL");
  });

  it("suppresses expected test fixture paths per false-positive policy", () => {
    const report = buildBoundaryViolationReport({
      change_id: "PLAN-TIED-BBCE-ALIGNMENT",
      scenario_id: "unit-fixture",
      declared_owning_slice_req: "REQ-TIED_CLAUDE_LIVE_DRIVER",
      slice_map: SLICE_MAP,
      slice_map_ref: "tied/analysis/agentstream-slice-map.yaml",
      changed_paths: ["mcp-server/packages/agentstream/fixtures/claude/sample.json"],
      timestamp: "2026-09-27T12:00:00.000Z",
    });
    assert.strictEqual(report.crossings.length, 0);
    assert.ok(report.suppressed.length >= 1);
    assert.ok(
      report.suppressed.some((s) => s.suppression_class === "expected_test_surface")
    );
  });

  it("validates against bbce-boundary-violation.v1 schema", () => {
    const report = buildBoundaryViolationReport({
      change_id: "PLAN-TIED-BBCE-ALIGNMENT",
      scenario_id: "schema-check",
      declared_owning_slice_req: "REQ-TIED_CLAUDE_LIVE_DRIVER",
      slice_map: SLICE_MAP,
      slice_map_ref: "tied/analysis/agentstream-slice-map.yaml",
      changed_paths: ["mcp-server/packages/agentstream/src/paths.ts"],
      timestamp: "2026-09-27T12:00:00.000Z",
    });
    const validated = validateBoundaryViolationReport(report);
    assert.strictEqual(validated.ok, true);
  });
});
