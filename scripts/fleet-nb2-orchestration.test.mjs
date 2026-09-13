/**
 * [IMPL-PSEUDOCODE_FLEET_MIGRATION_ORCHESTRATION] [REQ-PSEUDOCODE_FLEET_NB2_TRANCHE_ONE]
 * Unit tests for NB-2 orchestration (plan §2.4).
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import {
  DEFAULT_INVENTORY_MANIFEST_PATH,
  DEFAULT_NB2_ACCEPTANCE_PATH,
  evaluateNb2AcceptanceGate,
  loadInventoryClientsFromManifest,
  NB2_FAILURE_MODES,
  recordNb2Acceptance,
  REPO_ROOT,
  selectNb2WaveTwoClients,
} from "./lib/fleet-nb1-orchestration.mjs";

const ACCEPTED_FIXTURE = path.join(
  REPO_ROOT,
  "scripts/fixtures/nb2/od-nb2-acceptance-accepted.fixture.json",
);
const POST_NB1_INVENTORY_FIXTURE = path.join(
  REPO_ROOT,
  "scripts/fixtures/nb2/client-inventory-post-nb1-wave.fixture.yaml",
);
const NB2_TEMPLATE = path.join(
  REPO_ROOT,
  "working/fleet-constraint-v2/od-nb2-acceptance.v1.template.json",
);

describe("RECORD_NB2_ACCEPTANCE [REQ-PSEUDOCODE_FLEET_NB2_TRANCHE_ONE]", () => {
  it("accepts valid accepted fixture with policy POST conditions", () => {
    const acceptance = JSON.parse(fs.readFileSync(ACCEPTED_FIXTURE, "utf8"));
    const report = recordNb2Acceptance(acceptance);
    assert.equal(report.ok, true);
    assert.deepEqual(report.wave_2_client_ids, ["1786637885", "1786643714"]);
  });

  it("rejects draft status (NB-2-A gate)", () => {
    const draft = JSON.parse(fs.readFileSync(NB2_TEMPLATE, "utf8"));
    const report = recordNb2Acceptance(draft);
    assert.equal(report.ok, false);
    assert.equal(report.error, NB2_FAILURE_MODES.status_not_accepted);
  });

  it("rejects prior_batch_complete batch_id other than NB-1", () => {
    const acceptance = JSON.parse(fs.readFileSync(ACCEPTED_FIXTURE, "utf8"));
    acceptance.prior_batch_complete.batch_id = "NB-0";
    const report = recordNb2Acceptance(acceptance);
    assert.equal(report.ok, false);
    assert.equal(report.error, NB2_FAILURE_MODES.prior_batch_mismatch);
  });

  it("evaluateNb2AcceptanceGate passes for sponsor acceptance on disk", () => {
    if (!fs.existsSync(DEFAULT_NB2_ACCEPTANCE_PATH)) {
      return;
    }
    const gate = evaluateNb2AcceptanceGate({ validateSchema: false });
    assert.equal(gate.allowed, true);
    assert.equal(gate.gate_id, "NB-2-A");
  });
});

describe("SELECT_NB2_WAVE_TWO_CLIENTS [REQ-PSEUDOCODE_FLEET_NB2_TRANCHE_ONE]", () => {
  it("auto-selects five lowest-burden header-only clients from post-NB-1 fixture", () => {
    const clients = loadInventoryClientsFromManifest(POST_NB1_INVENTORY_FIXTURE);
    const report = selectNb2WaveTwoClients(clients, { maxClients: 5 });
    assert.equal(report.ok, true);
    assert.deepEqual(report.client_ids, [
      "1786637885",
      "1786643714",
      "1788547701",
      "1787421852",
      "1787461685",
    ]);
  });

  it("rejects NB-1 fleet-migrated client IDs in override (already_migrated)", () => {
    const clients = loadInventoryClientsFromManifest(DEFAULT_INVENTORY_MANIFEST_PATH);
    const report = selectNb2WaveTwoClients(clients, {
      overrideClientIds: ["1786636023"],
    });
    assert.equal(report.ok, false);
    assert.equal(report.error, NB2_FAILURE_MODES.already_migrated);
    assert.equal(report.client_id, "1786636023");
  });

  it("honors wave_2 override when rows remain header-only-v2", () => {
    const clients = loadInventoryClientsFromManifest(POST_NB1_INVENTORY_FIXTURE);
    const report = selectNb2WaveTwoClients(clients, {
      overrideClientIds: ["1786637885"],
      methodologyPin: "48d1fbb+",
    });
    assert.equal(report.ok, true);
    assert.deepEqual(report.client_ids, ["1786637885"]);
  });
});
