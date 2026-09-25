/**
 * [IMPL-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION] — W5b charter compliance table.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import yaml from "js-yaml";

import { validateChecklistGate } from "./checklist-validator.js";
import {
  buildCharterComplianceTable,
  charterComplianceBlocksPseudocodeGate,
  type CharterComplianceInput,
} from "./charter-compliance-table.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const touchFixture = path.join(
  repoRoot,
  "working/REQ-TIED_DAE_INCORPORATION/fixtures/charter/immutable-req-touch.yaml",
);

function loadTouchFixture(): CharterComplianceInput {
  return yaml.load(fs.readFileSync(touchFixture, "utf8")) as CharterComplianceInput;
}

const minimalCitdp = {
  risk_analysis: {
    depth_tier: "minimal",
    gate_policy: "advisory",
    adversarial_inquiry: {
      depth_tier: "minimal",
      gate_policy: "advisory",
      counterexamples: ["x"],
      falsification_questions: ["y?"],
      disconfirming_observations: ["z"],
      evidence_references: ["working/REQ-TIED_DAE_INCORPORATION/PLAN.md"],
    },
  },
};

describe("charter-compliance-table [REQ-TIED_DAE_INCORPORATION]", () => {
  it("blocks when immutable REQ touched without ARCH or approval (fixture)", () => {
    const input = loadTouchFixture();
    const result = charterComplianceBlocksPseudocodeGate(input);
    assert.equal(result.blocked, true);
    assert.equal(result.table.ok, false);
    assert.ok(
      result.diagnostics.includes("charter_compliance_immutable_touch_without_arch_approval"),
    );
  });

  it("passes when new ARCH token recorded for immutable touch", () => {
    const input = loadTouchFixture();
    input.new_arch_tokens = ["ARCH-REMEDIATION-FIXTURE"];
    const table = buildCharterComplianceTable(input);
    assert.equal(table.ok, true);
    assert.equal(table.immutable_touch_without_remediation, false);
  });

  it("blocks pre_implementation gate when charter compliance evidence fails", () => {
    const gate = validateChecklistGate({
      phase: "pre_implementation",
      citdp: minimalCitdp,
      tracker: {
        steps: [
          {
            slug: "sub-adversarial-inquiry-pass",
            disposition: "not_applicable",
            policy: "minimal-depth-no-inquiry",
            rationale: "W5b charter compliance composition test.",
          },
          {
            slug: "risk-assessment",
            disposition: "completed",
            evidence_refs: ["citdp-risk"],
          },
          {
            slug: "gate-pseudocode-validation",
            disposition: "pending",
          },
        ],
      },
      evidence: {
        charterCompliance: loadTouchFixture(),
      },
    });
    assert.equal(gate.allowed, false);
    assert.ok(
      gate.diagnostics.includes("charter_compliance_immutable_touch_without_arch_approval"),
    );
  });
});
