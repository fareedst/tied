import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { validateEdpcFailureState } from "./failure-state-validate.js";

const fixtureDir = join(dirname(fileURLToPath(import.meta.url)), "../../test/fixtures/edpc/ofsm");

function loadJson(name: string): unknown {
  return JSON.parse(readFileSync(join(fixtureDir, name), "utf8"));
}

// [IMPL-TIED_EDPC_FAILURE_OPS] [REQ-TIED_EDPC_COMPREHENSION]
describe("EDPC failure state validate [REQ-TIED_EDPC_COMPREHENSION]", () => {
  const charter = loadJson("charter-minimal.json") as { critical_outcomes: string[] };
  const validBundle = loadJson("bundle-valid.json") as Record<string, unknown>;
  const access = { evidence_access_tier: "toolchain_readonly" as const, production_touch: "none" as const };

  it("accepts well-formed OFSM bundle", () => {
    const result = validateEdpcFailureState({
      charter,
      access_matrix: access,
      ofsm_bundle: validBundle,
    });
    assert.equal(result.ok, true);
    assert.equal(result.coverage_gaps.length, 0);
  });

  it("rejects invalid classification enum", () => {
    const bundle = structuredClone(validBundle) as Record<string, unknown>;
    const snapshot = bundle.health_snapshot as { rows: Array<Record<string, unknown>> };
    snapshot.rows[0].classification = "all_green";
    const result = validateEdpcFailureState({ charter, access_matrix: access, ofsm_bundle: bundle });
    assert.ok(result.diagnostics.includes("invalid_classification"));
  });

  it("rejects healthy_within_observed_scope without evidence_ids", () => {
    const bundle = structuredClone(validBundle) as Record<string, unknown>;
    const snapshot = bundle.health_snapshot as { rows: Array<Record<string, unknown>> };
    snapshot.rows[0].evidence_ids = [];
    const result = validateEdpcFailureState({ charter, access_matrix: access, ofsm_bundle: bundle });
    assert.ok(result.diagnostics.includes("health_evidence_required"));
  });

  it("rejects Observed production health when production_touch is none", () => {
    const bundle = structuredClone(validBundle) as Record<string, unknown>;
    const snapshot = bundle.health_snapshot as { rows: Array<Record<string, unknown>> };
    snapshot.rows[0].evidence_source = "production";
    snapshot.rows[0].claim_class = "Observed";
    const result = validateEdpcFailureState({ charter, access_matrix: access, ofsm_bundle: bundle });
    assert.ok(result.diagnostics.includes("forbidden_prod_observed"));
  });

  it("requires observation window fields", () => {
    const bundle = structuredClone(validBundle) as Record<string, unknown>;
    bundle.observation_window = { start: "2026-10-19" };
    const result = validateEdpcFailureState({ charter, access_matrix: access, ofsm_bundle: bundle });
    assert.ok(result.diagnostics.some((d) => d.startsWith("missing_observation_window_field:")));
  });

  it("rejects blanket summary_healthy without row evidence", () => {
    const bundle = structuredClone(validBundle) as Record<string, unknown>;
    bundle.summary_healthy = true;
    const snapshot = bundle.health_snapshot as { rows: Array<Record<string, unknown>> };
    snapshot.rows = snapshot.rows.map((row) => ({
      ...row,
      classification: "degraded",
      evidence_ids: ["some-id"],
    }));
    const result = validateEdpcFailureState({ charter, access_matrix: access, ofsm_bundle: bundle });
    assert.ok(result.diagnostics.includes("blanket_health"));
  });
});
