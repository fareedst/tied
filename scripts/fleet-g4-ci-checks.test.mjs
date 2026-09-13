/**
 * [IMPL-PSEUDOCODE_MIGRATION_TOOLING] [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION]
 * Unit tests for G4 CI composition (P5-E).
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  evaluateEnrolledOdP4Inventory,
  G4_CI_EXPECTATIONS,
  runFleetG4CiChecks,
} from "./lib/fleet-g4-ci-checks.mjs";

describe("fleet G4 CI checks [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION]", () => {
  it("evaluateEnrolledOdP4Inventory passes when all enrolled rows are fleet-migrated-client", () => {
    const clients = [
      { client_id: "stdd", phase_4_enrollment: "enrolled_phase_4", aggregate_migration_state: "fleet-migrated-client" },
      { client_id: "x", phase_4_enrollment: "not_enrolled_phase_4", aggregate_migration_state: "header-only-v2" },
    ];
    const result = evaluateEnrolledOdP4Inventory(clients);
    assert.equal(result.ok, true);
    assert.equal(result.enrolled_count, 1);
    assert.equal(result.failures.length, 0);
  });

  it("evaluateEnrolledOdP4Inventory fails when an enrolled row regresses", () => {
    const clients = [
      { client_id: "stdd", phase_4_enrollment: "enrolled_phase_4", aggregate_migration_state: "constraint-ready-v2" },
    ];
    const result = evaluateEnrolledOdP4Inventory(clients);
    assert.equal(result.ok, false);
    assert.equal(result.failures[0].client_id, "stdd");
  });

  it("G4_CI_EXPECTATIONS matches gate-promotion G4 yaml ids", () => {
    assert.deepEqual(G4_CI_EXPECTATIONS, [
      "header_and_contract_defaults_for_new_clients",
      "stale_waiver_checks",
    ]);
  });

  it("runFleetG4CiChecks integrates live manifest and waiver registry (composition)", () => {
    const report = runFleetG4CiChecks();
    assert.equal(report.schema_version, "fleet-g4-ci-checks.v1");
    assert.equal(report.gate_stage, "G4");
    assert.ok(Array.isArray(report.checks) && report.checks.length >= 3);
    const enrolled = report.checks.find((c) => c.id === "enrolled_track_regression");
    assert.ok(enrolled);
    assert.equal(enrolled.enrolled_count, 5);
    assert.equal(report.ok, true, JSON.stringify(report.checks.filter((c) => !c.ok)));
  });

  it("header_and_contract_defaults uses G4 bootstrap_enforcement [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION]", () => {
    const report = runFleetG4CiChecks();
    const header = report.checks.find((c) => c.id === "header_and_contract_defaults_for_new_clients");
    assert.ok(header);
    assert.equal(header.ok, true, JSON.stringify(header));
    assert.equal(header.dimensions.bootstrap_enforcement, "pass");
    assert.equal(header.dimensions.constraint_flow, true);
    assert.match(header.note ?? "", /P5-F/);
  });
});
