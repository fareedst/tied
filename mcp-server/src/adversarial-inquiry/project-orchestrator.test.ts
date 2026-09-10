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

  it("produces criterion-scoped report scope for Mode B REQ-TIED_ADVERSARIAL_INQUIRY", async () => {
    const result = await runProjectInquiry(fixtureInput("case-good"));
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.ok(result.report.scope.every((entry) => entry.startsWith("REQ-FIXTURE-ADVERSARIAL#")));
    assert.ok(result.report.scope.length >= 1);
  });

  it("rejects stale block_name when sidecar procedure names changed REQ-TIED_ADVERSARIAL_INQUIRY", async () => {
    const input = {
      ...fixtureInput("case-good"),
      impl_token: "IMPL-FIXTURE-ADVERSARIAL",
    };
    const implPath = path.join(
      projectRoot,
      "tied/implementation-decisions/IMPL-FIXTURE-ADVERSARIAL.yaml",
    );
    const pseudocodePath = path.join(
      projectRoot,
      "tied/implementation-decisions/IMPL-FIXTURE-ADVERSARIAL-pseudocode.md",
    );
    const beforeImpl = fs.readFileSync(implPath, "utf8");
    const beforePseudocode = fs.readFileSync(pseudocodePath, "utf8");
    try {
      fs.writeFileSync(
        implPath,
        beforeImpl.replace("BUILD_PROJECT_INQUIRY_INPUT", "READ_TCC"),
        "utf8",
      );
      fs.writeFileSync(
        pseudocodePath,
        beforePseudocode.replaceAll("BUILD_PROJECT_INQUIRY_INPUT", "OPEN_TCC_READONLY"),
        "utf8",
      );
      const result = await buildProjectInquiryInput(input);
      assert.equal(result.ok, false);
      if (!result.ok) {
        assert.equal(result.stage, "project-orchestrator");
        assert.equal(result.error.code, "STALE_BLOCK_NAME");
        assert.match(result.error.message, /READ_TCC/);
        assert.match(result.error.message, /OPEN_TCC_READONLY/);
      }
    } finally {
      fs.writeFileSync(implPath, beforeImpl, "utf8");
      fs.writeFileSync(pseudocodePath, beforePseudocode, "utf8");
    }
  });
});
