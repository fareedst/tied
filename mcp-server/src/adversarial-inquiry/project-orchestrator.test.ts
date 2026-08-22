import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import {
  buildProjectInquiryInput,
  runProjectInquiry,
  type ModeBInput,
} from "./project-orchestrator.js";
import type { ObligationGraphInput } from "./types.js";

const fixtureRoot = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "../../test/fixtures/adversarial-inquiry-mode-b",
);
const projectRoot = path.join(fixtureRoot, "mini-project");

function fixtureInput(caseName: string): ModeBInput {
  const inputPath = path.join(fixtureRoot, "cases", caseName, "mode-b-input.json");
  const source = fs.readFileSync(inputPath, "utf8").replaceAll("__PROJECT_ROOT__", projectRoot);
  return JSON.parse(source) as ModeBInput;
}

describe("BUILD_PROJECT_INQUIRY_INPUT project orchestrator REQ-TIED_ADVERSARIAL_INQUIRY", () => {
  // [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY] How: validate an explicit project boundary, load declared read-only inputs, and normalize one supported Ruby Minitest fixture into the existing inquiry core.
  it("builds a normalized checklist input from the good project case", async () => {
    const result = await buildProjectInquiryInput(fixtureInput("case-good"));

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.mode, "project");
      assert.equal(result.input.graph.criteria.length, 2);
      assert.equal(result.input.fidelity.testEvidence.length, 2);
      assert.equal(result.input.fidelity.productionEvidence.length, 1);
      assert.equal(result.input.repositoryRoot, projectRoot);
      assert.equal(result.manifest.projectRoot, projectRoot);
    }
  });

  it("preserves incomplete evidence instead of upgrading it to PASS", async () => {
    const result = await runProjectInquiry(fixtureInput("case-missing-failure"));

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.verdict, "RELIABLE_INCOMPLETE");
      assert.ok(result.report.findings.some((finding) => finding.direction === "B"));
    }
  });

  it("returns an unresolved result with an unsupported adapter diagnostic", async () => {
    const result = await runProjectInquiry(fixtureInput("case-unsupported-assertion"));

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.verdict, "UNRESOLVED");
      assert.ok(result.diagnostics?.includes("unsupported_adapter"));
    }
  });

  it("rejects mixed Mode A and Mode B required fields with a stable error", async () => {
    const result = await buildProjectInquiryInput({
      ...fixtureInput("case-good"),
      graph: {} as ObligationGraphInput,
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.stage, "project-orchestrator");
      assert.equal(result.error.code, "INVALID_INPUT");
    }
  });
});
