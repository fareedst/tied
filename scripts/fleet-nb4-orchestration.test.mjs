/**
 * [IMPL-PSEUDOCODE_FLEET_MIGRATION_ORCHESTRATION] [REQ-PSEUDOCODE_FLEET_NB4_TRANCHE_FINAL]
 * Unit tests for NB-4 orchestration (plan §2.4).
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import {
  DEFAULT_INVENTORY_MANIFEST_PATH,
  DEFAULT_NB4_ACCEPTANCE_PATH,
  evaluateNb4AcceptanceGate,
  loadInventoryClientsFromManifest,
  NB4_FAILURE_MODES,
  recordNb4Acceptance,
  REPO_ROOT,
  selectNb4WaveFourClients,
} from "./lib/fleet-nb1-orchestration.mjs";

const ACCEPTED_FIXTURE = path.join(
  REPO_ROOT,
  "scripts/fixtures/nb4/od-nb4-acceptance-accepted.fixture.json",
);
const POST_NB3_INVENTORY_FIXTURE = path.join(
  REPO_ROOT,
  "scripts/fixtures/nb4/client-inventory-post-nb3-wave.fixture.yaml",
);
const NB4_TEMPLATE = path.join(
  REPO_ROOT,
  "working/fleet-constraint-v2/od-nb4-acceptance.v1.template.json",
);

describe("RECORD_NB4_ACCEPTANCE [REQ-PSEUDOCODE_FLEET_NB4_TRANCHE_FINAL]", () => {
  it("accepts valid accepted fixture with policy POST conditions", () => {
    const acceptance = JSON.parse(fs.readFileSync(ACCEPTED_FIXTURE, "utf8"));
    const report = recordNb4Acceptance(acceptance);
    assert.equal(report.ok, true);
    assert.deepEqual(report.wave_4_client_ids, ["1787691672", "1787626480"]);
  });

  it("rejects draft status (NB-4-A gate)", () => {
    const draft = JSON.parse(fs.readFileSync(NB4_TEMPLATE, "utf8"));
    const report = recordNb4Acceptance(draft);
    assert.equal(report.ok, false);
    assert.equal(report.error, NB4_FAILURE_MODES.status_not_accepted);
  });

  it("rejects prior_batch_complete batch_id other than NB-3", () => {
    const acceptance = JSON.parse(fs.readFileSync(ACCEPTED_FIXTURE, "utf8"));
    acceptance.prior_batch_complete.batch_id = "NB-2";
    const report = recordNb4Acceptance(acceptance);
    assert.equal(report.ok, false);
    assert.equal(report.error, NB4_FAILURE_MODES.prior_batch_mismatch);
  });

  it("evaluateNb4AcceptanceGate passes for sponsor acceptance on disk", () => {
    if (!fs.existsSync(DEFAULT_NB4_ACCEPTANCE_PATH)) {
      return;
    }
    const gate = evaluateNb4AcceptanceGate({ validateSchema: false });
    assert.equal(gate.allowed, true);
    assert.equal(gate.gate_id, "NB-4-A");
  });
});

describe("SELECT_NB4_WAVE_FOUR_CLIENTS [REQ-PSEUDOCODE_FLEET_NB4_TRANCHE_FINAL]", () => {
  it("auto-selects default two clients excluding tied-win-diff from post-NB-3 fixture", () => {
    const clients = loadInventoryClientsFromManifest(POST_NB3_INVENTORY_FIXTURE);
    const report = selectNb4WaveFourClients(clients, { maxClients: 5 });
    assert.equal(report.ok, true);
    assert.deepEqual(report.client_ids, ["1787691672", "1787626480"]);
  });

  it("rejects NB-3 fleet-migrated client IDs in override (already_migrated)", () => {
    const clients = loadInventoryClientsFromManifest(DEFAULT_INVENTORY_MANIFEST_PATH);
    const report = selectNb4WaveFourClients(clients, {
      overrideClientIds: ["1787495576"],
    });
    assert.equal(report.ok, false);
    assert.equal(report.error, NB4_FAILURE_MODES.already_migrated);
    assert.equal(report.client_id, "1787495576");
  });

  it("honors wave_4 override when rows remain header-only-v2", () => {
    const clients = loadInventoryClientsFromManifest(POST_NB3_INVENTORY_FIXTURE);
    const report = selectNb4WaveFourClients(clients, {
      overrideClientIds: ["1787691672"],
      methodologyPin: "48d1fbb+",
    });
    assert.equal(report.ok, true);
    assert.deepEqual(report.client_ids, ["1787691672"]);
  });
});
