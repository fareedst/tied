/**
 * [IMPL-FLEET_G4_MAINTENANCE] [REQ-PSEUDOCODE_FLEET_G4_MAINTENANCE]
 * Unit tests for G4 maintenance wrapper (OD-G4M-1).
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import {
  applyProgramStatusAfterMaintenanceRun,
  applyProgramStatusG4Fields,
  buildMaintenanceRunEnvelope,
  runFleetG4Maintenance,
  writeMaintenanceReceipt,
  writeProgramStatusYaml,
} from "./lib/fleet-g4-maintenance.mjs";

describe("fleet G4 maintenance [REQ-PSEUDOCODE_FLEET_G4_MAINTENANCE]", () => {
  it("applyProgramStatusG4Fields sets last_g4_ci_ok from g4 report only", () => {
    const at = "2026-09-13T22:00:00.000Z";
    const next = applyProgramStatusG4Fields(
      { last_g4_ci_ok: true, gate_stage: "G4" },
      { g4Report: { ok: false }, generatedAt: at },
    );
    assert.equal(next.last_g4_ci_ok, false);
    assert.equal(next.last_g4_ci_at, at);
    assert.equal(next.updated_at, at);
  });

  it("applyProgramStatusAfterMaintenanceRun requires testsOk for overall success", () => {
    const at = "2026-09-13T22:00:00.000Z";
    const failTests = applyProgramStatusAfterMaintenanceRun(
      { last_g4_ci_ok: true },
      { g4Report: { ok: true }, testsOk: false, generatedAt: at },
    );
    assert.equal(failTests.last_g4_ci_ok, false);

    const pass = applyProgramStatusAfterMaintenanceRun(
      { last_g4_ci_ok: false },
      { g4Report: { ok: true }, testsOk: true, generatedAt: at },
    );
    assert.equal(pass.last_g4_ci_ok, true);
  });

  it("buildMaintenanceRunEnvelope ok false when g4_report ok false", () => {
    const env = buildMaintenanceRunEnvelope(
      { ok: false, schema_version: "fleet-g4-ci-checks.v1" },
      {
        maintenanceCommand: "node scripts/run-fleet-g4-maintenance.mjs",
        skipTests: false,
        programStatusPath: "working/fleet-constraint-v2/program-status.v1.yaml",
        testsOk: true,
        generatedAt: "2026-09-13T22:00:00.000Z",
      },
    );
    assert.equal(env.ok, false);
    assert.equal(env.schema_version, "fleet-g4-maintenance-run.v1");
  });

  it("runFleetG4Maintenance writes receipt and updates program-status on mocked success", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "g4-maint-"));
    const statusPath = path.join(tmp, "program-status.v1.yaml");
    fs.writeFileSync(
      statusPath,
      "gate_stage: G4\nlast_g4_ci_ok: false\nlast_g4_ci_at: '2020-01-01T00:00:00.000Z'\nupdated_at: '2020-01-01T00:00:00.000Z'\n",
      "utf8",
    );
    const receiptPath = path.join(tmp, "last-run.v1.json");
    const fakeReport = {
      ok: true,
      schema_version: "fleet-g4-ci-checks.v1",
      gate_stage: "G4",
      checks: [],
      generated_at: "2026-09-13T22:05:00.000Z",
    };

    const result = runFleetG4Maintenance({
      repoRoot: tmp,
      programStatusPath: statusPath,
      receiptPath,
      skipTests: true,
      maintenanceCommand: "node scripts/run-fleet-g4-maintenance.mjs --skip-tests",
      runG4Checks: () => fakeReport,
    });

    assert.equal(result.ok, true);
    assert.ok(fs.existsSync(receiptPath));
    const receipt = JSON.parse(fs.readFileSync(receiptPath, "utf8"));
    assert.equal(receipt.ok, true);
    assert.equal(receipt.g4_report.ok, true);
    assert.match(fs.readFileSync(statusPath, "utf8"), /last_g4_ci_ok: true/);
  });

  it("runFleetG4Maintenance sets last_g4_ci_ok false when g4 checks fail", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "g4-maint-fail-"));
    const statusPath = path.join(tmp, "program-status.v1.yaml");
    fs.writeFileSync(
      statusPath,
      "last_g4_ci_ok: true\nlast_g4_ci_at: '2026-09-13T21:00:00.000Z'\nupdated_at: '2026-09-13T21:00:00.000Z'\n",
      "utf8",
    );
    const receiptPath = path.join(tmp, "fail-run.v1.json");

    const result = runFleetG4Maintenance({
      repoRoot: tmp,
      programStatusPath: statusPath,
      receiptPath,
      skipTests: true,
      runG4Checks: () => ({
        ok: false,
        schema_version: "fleet-g4-ci-checks.v1",
        checks: [{ id: "enrolled_track_regression", ok: false }],
        generated_at: "2026-09-13T22:06:00.000Z",
      }),
    });

    assert.equal(result.ok, false);
    const receipt = JSON.parse(fs.readFileSync(receiptPath, "utf8"));
    assert.equal(receipt.ok, false);
    assert.match(fs.readFileSync(statusPath, "utf8"), /last_g4_ci_ok: false/);
  });

  it("writeMaintenanceReceipt persists generated_at and ok", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "g4-receipt-"));
    const p = path.join(tmp, "nested", "last-run.v1.json");
    writeMaintenanceReceipt(p, {
      schema_version: "fleet-g4-maintenance-run.v1",
      generated_at: "2026-09-13T22:00:00.000Z",
      ok: true,
    });
    const doc = JSON.parse(fs.readFileSync(p, "utf8"));
    assert.equal(doc.ok, true);
  });
});
