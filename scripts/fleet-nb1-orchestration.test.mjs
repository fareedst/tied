/**
 * [IMPL-PSEUDOCODE_FLEET_MIGRATION_ORCHESTRATION] [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION]
 * RED→GREEN unit/composition tests for NB-1 orchestration (plan §2.4).
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import {
  DEFAULT_ACCEPTANCE_PATH,
  DEFAULT_INVENTORY_MANIFEST_PATH,
  evaluateNb1AcceptanceGate,
  loadInventoryClientsFromManifest,
  NB1_FAILURE_MODES,
  recordOdP52Acceptance,
  REPO_ROOT,
  selectNb1WaveOneClients,
} from "./lib/fleet-nb1-orchestration.mjs";

const ACCEPTED_FIXTURE = path.join(
  REPO_ROOT,
  "scripts/fixtures/nb1/od-p5-2-acceptance-accepted.fixture.json",
);
const PRE_NB1_INVENTORY_FIXTURE = path.join(
  REPO_ROOT,
  "scripts/fixtures/nb1/client-inventory-pre-nb1-wave.fixture.yaml",
);
const TEMPLATE_PATH = path.join(
  REPO_ROOT,
  "working/fleet-constraint-v2/od-p5-2-acceptance.v1.template.json",
);

describe("RECORD_OD_P5_2_ACCEPTANCE [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION]", () => {
  it("accepts valid accepted fixture with policy POST conditions", () => {
    const acceptance = JSON.parse(fs.readFileSync(ACCEPTED_FIXTURE, "utf8"));
    const report = recordOdP52Acceptance(acceptance);
    assert.equal(report.ok, true);
    assert.deepEqual(report.wave_1_client_ids, ["1786636023", "1786637086"]);
  });

  it("rejects draft status (NB-1-A gate)", () => {
    const draft = JSON.parse(fs.readFileSync(TEMPLATE_PATH, "utf8"));
    const report = recordOdP52Acceptance(draft);
    assert.equal(report.ok, false);
    assert.equal(report.error, NB1_FAILURE_MODES.status_not_accepted);
  });

  it("rejects orchestrator_reverify true", () => {
    const acceptance = JSON.parse(fs.readFileSync(ACCEPTED_FIXTURE, "utf8"));
    acceptance.orchestrator_reverify = true;
    const report = recordOdP52Acceptance(acceptance);
    assert.equal(report.ok, false);
    assert.equal(report.error, NB1_FAILURE_MODES.orchestrator_reverify_true);
  });

  it("rejects wave list over tranche cap", () => {
    const acceptance = JSON.parse(fs.readFileSync(ACCEPTED_FIXTURE, "utf8"));
    acceptance.wave_1_client_ids = ["a", "b", "c", "d", "e", "f"];
    acceptance.tranche_scope.max_clients = 5;
    const report = recordOdP52Acceptance(acceptance);
    assert.equal(report.ok, false);
    assert.equal(report.error, NB1_FAILURE_MODES.tranche_over_cap);
  });

  it("evaluateNb1AcceptanceGate fails when signed acceptance file absent", () => {
    if (fs.existsSync(DEFAULT_ACCEPTANCE_PATH)) {
      return;
    }
    const gate = evaluateNb1AcceptanceGate();
    assert.equal(gate.allowed, false);
    assert.equal(gate.report.error, NB1_FAILURE_MODES.acceptance_missing);
    assert.match(gate.sponsor_unblock, /od-p5-2-acceptance\.v1\.json/);
  });
});

describe("SELECT_NB1_WAVE_ONE_CLIENTS [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION]", () => {
  it("auto-selects five low-burden not_enrolled header-only clients from live manifest", () => {
    const clients = loadInventoryClientsFromManifest(PRE_NB1_INVENTORY_FIXTURE);
    const report = selectNb1WaveOneClients(clients, { maxClients: 5 });
    assert.equal(report.ok, true);
    assert.deepEqual(report.client_ids, [
      "1786636023",
      "1786637086",
      "1786666674",
      "1787503424",
      "1789087315",
    ]);
  });

  it("honors override_client_ids with enrollment filter", () => {
    const clients = loadInventoryClientsFromManifest(PRE_NB1_INVENTORY_FIXTURE);
    const ok = selectNb1WaveOneClients(clients, {
      overrideClientIds: ["1786636023"],
      methodologyPin: "48d1fbb+",
    });
    assert.equal(ok.ok, true);
    assert.deepEqual(ok.client_ids, ["1786636023"]);

    const bad = selectNb1WaveOneClients(clients, {
      overrideClientIds: ["stdd"],
    });
    assert.equal(bad.ok, false);
    assert.equal(bad.error, NB1_FAILURE_MODES.enrollment_mismatch);
    assert.equal(bad.client_id, "stdd");
  });

  it("rejects override client not in manifest", () => {
    const clients = loadInventoryClientsFromManifest(DEFAULT_INVENTORY_MANIFEST_PATH);
    const report = selectNb1WaveOneClients(clients, {
      overrideClientIds: ["missing-client-id"],
    });
    assert.equal(report.ok, false);
    assert.equal(report.error, NB1_FAILURE_MODES.client_not_in_manifest);
  });
});

describe("fleet-g3-wave harness contract (composition, dry-run)", () => {
  it("run-harness.sh fleet-g3-wave forwards --wave-id and --dry-run", () => {
    const harness = path.join(
      REPO_ROOT,
      "working/PSEUDOCODE-CONSTRAINT-STUDY/qualification/scripts/run-harness.sh",
    );
    const out = execFileSync(
      "bash",
      [harness, "fleet-g3-wave", "--wave-id", "W-stdd-2", "--dry-run"],
      { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 },
    );
    assert.match(out, /TRACE: fleet-g3-wave W-stdd-2/);
    assert.match(out, /dry_run=true/);
  });
});
