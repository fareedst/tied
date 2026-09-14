/**
 * [IMPL-PSEUDOCODE_FLEET_MIGRATION_ORCHESTRATION] [REQ-PSEUDOCODE_FLEET_NB3_TRANCHE_TWO]
 * Unit tests for NB-3 orchestration (plan §2.4).
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import {
  DEFAULT_INVENTORY_MANIFEST_PATH,
  DEFAULT_NB3_ACCEPTANCE_PATH,
  evaluateNb3AcceptanceGate,
  loadInventoryClientsFromManifest,
  NB3_FAILURE_MODES,
  recordNb3Acceptance,
  REPO_ROOT,
  selectNb3WaveThreeClients,
} from "./lib/fleet-nb1-orchestration.mjs";

const ACCEPTED_FIXTURE = path.join(
  REPO_ROOT,
  "scripts/fixtures/nb3/od-nb3-acceptance-accepted.fixture.json",
);
const POST_NB2_INVENTORY_FIXTURE = path.join(
  REPO_ROOT,
  "scripts/fixtures/nb3/client-inventory-post-nb2-wave.fixture.yaml",
);
const NB3_TEMPLATE = path.join(
  REPO_ROOT,
  "working/fleet-constraint-v2/od-nb3-acceptance.v1.template.json",
);

describe("RECORD_NB3_ACCEPTANCE [REQ-PSEUDOCODE_FLEET_NB3_TRANCHE_TWO]", () => {
  it("accepts valid accepted fixture with policy POST conditions", () => {
    const acceptance = JSON.parse(fs.readFileSync(ACCEPTED_FIXTURE, "utf8"));
    const report = recordNb3Acceptance(acceptance);
    assert.equal(report.ok, true);
    assert.deepEqual(report.wave_3_client_ids, ["1787495576", "1787603099"]);
  });

  it("rejects draft status (NB-3-A gate)", () => {
    const draft = JSON.parse(fs.readFileSync(NB3_TEMPLATE, "utf8"));
    const report = recordNb3Acceptance(draft);
    assert.equal(report.ok, false);
    assert.equal(report.error, NB3_FAILURE_MODES.status_not_accepted);
  });

  it("rejects prior_batch_complete batch_id other than NB-2", () => {
    const acceptance = JSON.parse(fs.readFileSync(ACCEPTED_FIXTURE, "utf8"));
    acceptance.prior_batch_complete.batch_id = "NB-1";
    const report = recordNb3Acceptance(acceptance);
    assert.equal(report.ok, false);
    assert.equal(report.error, NB3_FAILURE_MODES.prior_batch_mismatch);
  });

  it("evaluateNb3AcceptanceGate passes for sponsor acceptance on disk", () => {
    if (!fs.existsSync(DEFAULT_NB3_ACCEPTANCE_PATH)) {
      return;
    }
    const gate = evaluateNb3AcceptanceGate({ validateSchema: false });
    assert.equal(gate.allowed, true);
    assert.equal(gate.gate_id, "NB-3-A");
  });
});

describe("SELECT_NB3_WAVE_THREE_CLIENTS [REQ-PSEUDOCODE_FLEET_NB3_TRANCHE_TWO]", () => {
  it("auto-selects five lowest-burden header-only clients from post-NB-2 fixture", () => {
    const clients = loadInventoryClientsFromManifest(POST_NB2_INVENTORY_FIXTURE);
    const report = selectNb3WaveThreeClients(clients, { maxClients: 5 });
    assert.equal(report.ok, true);
    assert.deepEqual(report.client_ids, [
      "1787495576",
      "1787603099",
      "1787416567",
      "1787507684",
      "1787638699",
    ]);
  });

  it("rejects NB-2 fleet-migrated client IDs in override (already_migrated)", () => {
    const clients = loadInventoryClientsFromManifest(DEFAULT_INVENTORY_MANIFEST_PATH);
    const report = selectNb3WaveThreeClients(clients, {
      overrideClientIds: ["1786637885"],
    });
    assert.equal(report.ok, false);
    assert.equal(report.error, NB3_FAILURE_MODES.already_migrated);
    assert.equal(report.client_id, "1786637885");
  });

  it("honors wave_3 override when rows remain header-only-v2", () => {
    const clients = loadInventoryClientsFromManifest(POST_NB2_INVENTORY_FIXTURE);
    const report = selectNb3WaveThreeClients(clients, {
      overrideClientIds: ["1787495576"],
      methodologyPin: "48d1fbb+",
    });
    assert.equal(report.ok, true);
    assert.deepEqual(report.client_ids, ["1787495576"]);
  });
});
