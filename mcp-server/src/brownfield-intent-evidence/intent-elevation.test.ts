import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  brownfieldChecklistRequiresSubFlow,
  brownfieldIntentEvidenceValidate,
  brownfieldVerificationBlocking,
  computeNormalizeHash,
  normalizedModelsEquivalent,
  parseMarkdownIntentElevationMatrix,
  parseYamlIntentElevationDocument,
  validateNormalizedIntentElevation,
} from "./intent-elevation.js";

const fixtureDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../test/fixtures/brownfield-intent-evidence",
);

describe("intent elevation normalize [IMPL-TIED_BROWNFIELD_VALIDATION] [ARCH-TIED_BROWNFIELD_EVIDENCE_MODEL] [REQ-TIED_BROWNFIELD_INTENT_ELEVATION]", () => {
  it("parses valid Markdown matrix into normalized model", async () => {
    const markdown = await readFile(path.join(fixtureDir, "valid-matrix.md"), "utf8");
    const parsed = parseMarkdownIntentElevationMatrix(markdown);
    assert.equal(parsed.ok, true);
    if (!parsed.ok) {
      return;
    }
    assert.equal(parsed.value.rows.length, 2);
    assert.equal(parsed.value.rows[0]?.disposition, "approved");
    assert.ok(parsed.value.rows[0]?.promotion_target?.includes("REQ-TIED_BROWNFIELD_INTENT_ELEVATION"));
  });

  it("parses equivalent YAML document with matching normalize hash", async () => {
    const markdown = await readFile(path.join(fixtureDir, "valid-matrix.md"), "utf8");
    const yamlText = await readFile(path.join(fixtureDir, "valid-matrix.yaml"), "utf8");
    const fromMd = parseMarkdownIntentElevationMatrix(markdown);
    const fromYaml = parseYamlIntentElevationDocument(yamlText);
    assert.equal(fromMd.ok, true);
    assert.equal(fromYaml.ok, true);
    if (!fromMd.ok || !fromYaml.ok) {
      return;
    }
    assert.equal(normalizedModelsEquivalent(fromMd.value, fromYaml.value), true);
    assert.equal(computeNormalizeHash(fromMd.value), computeNormalizeHash(fromYaml.value));
  });

  it("rejects row missing disposition", () => {
    const parsed = parseMarkdownIntentElevationMatrix(`
**Baseline revision:** \`sha\`
## Matrix
| # | Claim | Source type | Location | Disposition | Confidence | Proof boundary | REQ/ARCH target |
| 1 | Bad row | code | x |  | high | boundary | |
`);
    assert.equal(parsed.ok, true);
    if (!parsed.ok) {
      return;
    }
    const report = validateNormalizedIntentElevation(parsed.value);
    assert.equal(report.ok, false);
    assert.ok(report.diagnostics.some((d) => d.code === "INVALID_ENUM"));
  });

  it("rejects promotion target on non-approved disposition", async () => {
    const markdown = await readFile(path.join(fixtureDir, "valid-matrix.md"), "utf8");
    const mutated = markdown.replace(
      "| observed | medium | Static read only | |",
      "| observed | medium | Static read only | REQ-TIED_BROWNFIELD_INTENT_ELEVATION |",
    );
    const parsed = parseMarkdownIntentElevationMatrix(mutated);
    assert.equal(parsed.ok, true);
    if (!parsed.ok) {
      return;
    }
    const report = validateNormalizedIntentElevation(parsed.value);
    assert.equal(report.ok, false);
    assert.ok(report.diagnostics.some((d) => d.code === "ILLEGAL_PROMOTION_TARGET"));
  });

  it("detects baseline mismatch when expected baseline provided", async () => {
    const markdown = await readFile(path.join(fixtureDir, "valid-matrix.md"), "utf8");
    const parsed = parseMarkdownIntentElevationMatrix(markdown);
    assert.equal(parsed.ok, true);
    if (!parsed.ok) {
      return;
    }
    const report = validateNormalizedIntentElevation(parsed.value, { expectedBaseline: "other" });
    assert.equal(report.ok, false);
    assert.ok(report.diagnostics.some((d) => d.code === "BASELINE_MISMATCH"));
  });

  it("returns receipt in report_only mode without blocking", async () => {
    const markdown = await readFile(path.join(fixtureDir, "valid-matrix.md"), "utf8");
    const receipt = brownfieldIntentEvidenceValidate({
      markdown_text: markdown,
      baseline_revision: "abc123def",
      mode: "report_only",
      scoped_analysis_evidence_id: "scoped-fixture-1",
      claims_review_evidence_id: "claims-fixture-1",
    });
    assert.equal(receipt.ok, true);
    assert.equal(receipt.blocking, false);
    assert.equal(receipt.schema_version, "brownfield-intent-evidence-receipt.v1");
    assert.equal(receipt.evidence_refs?.scoped_analysis_evidence_id, "scoped-fixture-1");
    assert.ok(receipt.matrix_normalize_hash.length > 0);
  });
});

describe("brownfield checklist mode [PROC-BROWNFIELD_INTENT_ELEVATION] [REQ-TIED_BROWNFIELD_INTENT_ELEVATION]", () => {
  it("requires brownfield sub-flow only for pilot and strict", () => {
    assert.equal(brownfieldChecklistRequiresSubFlow("report_only"), false);
    assert.equal(brownfieldChecklistRequiresSubFlow("pilot"), true);
    assert.equal(brownfieldChecklistRequiresSubFlow("strict"), true);
  });

  it("blocks verification only in strict mode when matrix invalid", () => {
    assert.equal(brownfieldVerificationBlocking("report_only", false), false);
    assert.equal(brownfieldVerificationBlocking("pilot", false), false);
    assert.equal(brownfieldVerificationBlocking("strict", false), true);
    assert.equal(brownfieldVerificationBlocking("strict", true), false);
  });
});
