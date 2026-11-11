import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import {
  COMPOSITION_EVIDENCE_SUBCHECK_SCHEMA_VERSION,
  renderLabelHistogramMarkdown,
  runCompositionEvidenceSubcheck,
} from "./wf-composition-evidence-subcheck.js";

const passFixture = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../test/fixtures/project-size/mini-client",
);
const failFixture = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../test/fixtures/project-size/wf-09-unit-only",
);

describe("wf-composition-evidence-subcheck [REQ-WF_TRIAL_COMPOSITION_EVIDENCE_SUBCHECK]", () => {
  it("schema version constant [SC-SUB-01]", () => {
    assert.equal(COMPOSITION_EVIDENCE_SUBCHECK_SCHEMA_VERSION, "wf-composition-evidence-subcheck.v2");
  });

  it("histogram markdown [SC-SUB-03]", () => {
    const md = renderLabelHistogramMarkdown({ "unit.default": 7, "composition.wiring": 1 });
    assert.match(md, /unit\.default/);
    assert.match(md, /\| 7 \|/);
  });

  it("WF-09 unit-only cohort fails [SC-SUB-02]", async () => {
    const result = await runCompositionEvidenceSubcheck({
      repo_root: failFixture,
      prompt_id: "PROMPT-WF-09",
    });
    assert.equal(result.schema_version, COMPOSITION_EVIDENCE_SUBCHECK_SCHEMA_VERSION);
    assert.equal(result.composition_evidence_subcheck, "fail");
    assert.equal(result.binding_test_present, false);
    assert.equal(result.receipt_composition_declared, 0);
    assert.ok(result.label_histogram_markdown.includes("unit.default"));
  });

  it("WF-10 medium pass fixture (mini-client) [SC-SUB-02]", async () => {
    const result = await runCompositionEvidenceSubcheck({
      repo_root: passFixture,
      prompt_id: "PROMPT-WF-10",
    });
    assert.equal(result.composition_evidence_subcheck, "pass");
    assert.equal(result.binding_test_present, true);
    assert.ok(result.receipt_composition_declared >= 1);
    assert.ok(result.label_case_counts["composition.wiring"] >= 1 || result.receipt_composition_inferred >= 1);
  });

  it("non-composition prompt returns n_a", async () => {
    const result = await runCompositionEvidenceSubcheck({
      repo_root: passFixture,
      prompt_id: "PROMPT-WF-03",
    });
    assert.equal(result.composition_evidence_subcheck, "n_a");
  });
});
