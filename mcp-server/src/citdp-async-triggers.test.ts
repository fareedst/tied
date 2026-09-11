/**
 * [REQ-ASYNC_CITDP_TRIGGERS] [ARCH-ASYNC_CITDP_EVIDENCE] [IMPL-ASYNC_CITDP_PROFILE_WIRING]
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import { detectAsyncInScope } from "./checklist-async-dispositions.js";
import {
  ASYNC_CITDP_EVIDENCE_MATRIX,
  ASYNC_INQUIRY_CASES,
  deriveAsyncCitdpTriggers,
  getAsyncEvidenceMatrixRow,
  validateAsyncCitdpActivation,
  type AsyncCitdpActivationDisposition,
  type AsyncInquiryCaseId,
} from "./citdp-async-triggers.js";

const REPO_ROOT = path.resolve(import.meta.dirname, "../..");
const FIXTURES_DIR = path.join(
  REPO_ROOT,
  "working/REQ-TIED_ASYNC_METHODOLOGY/fixtures/citdp-triggers",
);
const PILOT_PSEUDOCODE = fs.readFileSync(
  path.join(
    REPO_ROOT,
    "working/REQ-TIED_ASYNC_METHODOLOGY/pilot/after-t0/IMPL-GOAGENT-EXECUTOR-with-async-rows.md",
  ),
  "utf8",
);

function fullActivationDisposition(
  overrides: Partial<AsyncCitdpActivationDisposition> = {},
): AsyncCitdpActivationDisposition {
  return {
    depth_tier: "integrated",
    research_profile: "baseline-functional",
    assurance_profile: "baseline-functional",
    gate_policy: "advisory",
    matched_triggers: ["async-boundary-catalog", "timeout-cancellation-evidence"],
    selected_cases: ["ASYNC-001", "ASYNC-005"],
    owner: "stdd methodology sponsor",
    expiry: "2026-12-31",
    ...overrides,
  };
}

describe("ASYNC_CITDP_EVIDENCE_MATRIX [ARCH-ASYNC_CITDP_EVIDENCE]", () => {
  it("defines nine async attribute rows with artifact, proof_boundary, and minimum_acceptance", () => {
    assert.equal(ASYNC_CITDP_EVIDENCE_MATRIX.length, 9);
    for (const row of ASYNC_CITDP_EVIDENCE_MATRIX) {
      assert.ok(row.attribute.trim());
      assert.ok(row.evidence_artifact.trim());
      assert.ok(row.proof_boundary.trim());
      assert.ok(row.minimum_acceptance.trim());
    }
  });

  it("looks up matrix rows by attribute id", () => {
    const row = getAsyncEvidenceMatrixRow("async-await-sequencing");
    assert.ok(row);
    assert.match(row!.evidence_artifact, /SEQUENCING|CONTROL/);
  });
});

describe("deriveAsyncCitdpTriggers [REQ-ASYNC_CITDP_TRIGGERS]", () => {
  it("returns no triggers when async is not in scope", () => {
    const triggers = deriveAsyncCitdpTriggers({
      async_in_scope: false,
      matched_semantic_classes: [],
    });
    assert.deepEqual(triggers, []);
  });

  it("recommends async-boundary-catalog for async EFFECTS boundaries", () => {
    const scope = detectAsyncInScope(PILOT_PSEUDOCODE);
    const triggers = deriveAsyncCitdpTriggers({
      async_in_scope: scope.async_in_scope,
      matched_semantic_classes: scope.matched_semantic_classes,
      pseudocode: PILOT_PSEUDOCODE,
    });
    assert.ok(triggers.some((trigger) => trigger.trigger_id === "async-boundary-catalog"));
    assert.ok(
      triggers.find((trigger) => trigger.trigger_id === "async-boundary-catalog")
        ?.profile_recommendation,
    );
  });

  it("adds composition-async-seam when SEND or IPC bindings are present", () => {
    const triggers = deriveAsyncCitdpTriggers({
      async_in_scope: true,
      matched_semantic_classes: ["message_event_delivery"],
      composition_bindings: [{ kind: "SEND", handler: "on_line" }],
    });
    assert.ok(triggers.some((trigger) => trigger.trigger_id === "composition-async-seam"));
  });

  it("recommends idempotency evidence when retry or at-least-once criteria match", () => {
    const triggers = deriveAsyncCitdpTriggers({
      async_in_scope: true,
      matched_semantic_classes: ["retry_idempotency", "message_event_delivery"],
      req_criteria: { retry: true, at_least_once_delivery: true },
    });
    assert.ok(triggers.some((trigger) => trigger.trigger_id === "retry-idempotency-evidence"));
  });

  it("recommends timeout/cancellation evidence when those classes match", () => {
    const triggers = deriveAsyncCitdpTriggers({
      async_in_scope: true,
      matched_semantic_classes: ["timeout", "cancellation"],
      req_criteria: { timeout: true, cancellation: true },
    });
    assert.ok(triggers.some((trigger) => trigger.trigger_id === "timeout-cancellation-evidence"));
  });

  it("recommends stateful-reliability only when shared DATA mutates persistence", () => {
    const withoutPersistence = deriveAsyncCitdpTriggers({
      async_in_scope: true,
      matched_semantic_classes: ["shared_data"],
      mutates_persistence: false,
    });
    assert.ok(!withoutPersistence.some((trigger) => trigger.trigger_id === "stateful-reliability"));

    const withPersistence = deriveAsyncCitdpTriggers({
      async_in_scope: true,
      matched_semantic_classes: ["shared_data"],
      mutates_persistence: true,
    });
    assert.ok(withPersistence.some((trigger) => trigger.trigger_id === "stateful-reliability"));
  });
});

describe("validateAsyncCitdpActivation [IMPL-ASYNC_CITDP_PROFILE_WIRING]", () => {
  it("blocks inquiry when only async_in_scope marker is present", () => {
    const result = validateAsyncCitdpActivation({
      async_in_scope: true,
      inquiry_requested: true,
    });
    assert.equal(result.allowed, false);
    assert.ok(result.diagnostics.includes("async_in_scope_alone_does_not_authorize_inquiry"));
  });

  it("allows inquiry when identity-bound disposition is complete", () => {
    const result = validateAsyncCitdpActivation({
      async_in_scope: true,
      inquiry_requested: true,
      disposition: fullActivationDisposition(),
    });
    assert.equal(result.ok, true);
    assert.equal(result.allowed, true);
  });

  it("blocks inquiry when disposition is missing required activation fields", () => {
    const result = validateAsyncCitdpActivation({
      async_in_scope: true,
      inquiry_requested: true,
      disposition: {
        depth_tier: "integrated",
        gate_policy: "advisory",
        matched_triggers: [],
        selected_cases: [],
      },
    });
    assert.equal(result.allowed, false);
    assert.ok(result.diagnostics.includes("activation_owner_missing"));
    assert.ok(result.diagnostics.includes("activation_expiry_missing"));
    assert.ok(result.diagnostics.includes("activation_selected_cases_missing"));
  });

  it("rejects unknown inquiry case ids", () => {
    const result = validateAsyncCitdpActivation({
      async_in_scope: true,
      inquiry_requested: true,
      disposition: fullActivationDisposition({ selected_cases: ["ASYNC-999" as AsyncInquiryCaseId] }),
    });
    assert.equal(result.allowed, false);
    assert.ok(result.diagnostics.some((code) => code.startsWith("invalid_inquiry_case:")));
  });

  it("does not authorize inquiry from async_in_scope when inquiry is not requested", () => {
    const result = validateAsyncCitdpActivation({
      async_in_scope: true,
      inquiry_requested: false,
    });
    assert.equal(result.ok, true);
    assert.equal(result.allowed, false);
  });
});

describe("ASYNC_INQUIRY_CASES [REQ-ASYNC_CITDP_TRIGGERS]", () => {
  it("documents ASYNC-001 through ASYNC-006", () => {
    assert.deepEqual(
      ASYNC_INQUIRY_CASES.map((entry) => entry.case_id),
      ["ASYNC-001", "ASYNC-002", "ASYNC-003", "ASYNC-004", "ASYNC-005", "ASYNC-006"],
    );
  });
});

describe("citdp-triggers fixtures [REQ-ASYNC_CITDP_TRIGGERS]", () => {
  it("marker-only fixture expects candidate triggers without inquiry activation", () => {
    const fixture = JSON.parse(
      fs.readFileSync(path.join(FIXTURES_DIR, "marker-only-no-inquiry.json"), "utf8"),
    ) as {
      async_in_scope: boolean;
      inquiry_requested: boolean;
      pseudocode?: string;
    };
    const pseudocode = fixture.pseudocode ?? PILOT_PSEUDOCODE;
    const scope = detectAsyncInScope(pseudocode);
    const triggers = deriveAsyncCitdpTriggers({
      async_in_scope: scope.async_in_scope,
      matched_semantic_classes: scope.matched_semantic_classes,
      pseudocode,
    });
    const activation = validateAsyncCitdpActivation({
      async_in_scope: scope.async_in_scope,
      inquiry_requested: fixture.inquiry_requested,
    });
    assert.ok(triggers.length > 0);
    assert.equal(activation.allowed, false);
  });

  it("full-activation fixture allows inquiry with complete disposition", () => {
    const fixture = JSON.parse(
      fs.readFileSync(path.join(FIXTURES_DIR, "full-activation-allowed.json"), "utf8"),
    ) as { disposition: AsyncCitdpActivationDisposition };
    const activation = validateAsyncCitdpActivation({
      async_in_scope: true,
      inquiry_requested: true,
      disposition: fixture.disposition,
    });
    assert.equal(activation.allowed, true);
  });

  it("missing-disposition fixture blocks inquiry", () => {
    const fixture = JSON.parse(
      fs.readFileSync(path.join(FIXTURES_DIR, "missing-disposition-blocked.json"), "utf8"),
    ) as { async_in_scope: boolean };
    const activation = validateAsyncCitdpActivation({
      async_in_scope: fixture.async_in_scope,
      inquiry_requested: true,
    });
    assert.equal(activation.allowed, false);
    assert.ok(activation.diagnostics.length > 0);
  });
});
