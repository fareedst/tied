// [IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
// How: integrate inquiry into existing checklist slugs with bounded working artifacts and human-approved scoped strict status.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import {
  evaluateScopedGate,
  persistWorkingArtifacts,
  resolveArtifactPaths,
  type HumanStrictApproval,
} from "./checklist-integration.js";
import { appendFinding, validateStrictEligibility, type FindingLedger } from "./workflow.js";

const TOKENS = {
  req: "REQ-TIED_ADVERSARIAL_INQUIRY",
  arch: "ARCH-TIED_ADVERSARIAL_INQUIRY",
  impl: "IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST",
};

const approval: HumanStrictApproval = {
  reviewer: "reviewer@example.test",
  approvedScope: ["obligation-1"],
  thresholds: { precision: 0.9, reviewerAgreement: 0.8 },
  waiverOwner: "owner@example.test",
  waiverExpiry: "2026-12-31",
  rollbackCriteria: "Disable strict policy when two budget breaches occur.",
  approvalRevision: "citdp-rev-1",
  citdpRecord: "CITDP-REQ-TIED_ADVERSARIAL_INQUIRY_CHECKLIST",
};

function eligible() {
  return validateStrictEligibility({
    scope: ["obligation-1"],
    blockingDetectors: ["fidelity"],
    negativeControls: ["fidelity"],
    boundedExecution: true,
    explicitProofBoundaries: true,
    falsePositiveHandling: true,
    waiversOwned: true,
    representativePilot: true,
  });
}

describe("CHECKLIST_INQUIRY_INTEGRATION [REQ-TIED_ADVERSARIAL_INQUIRY]", () => {
  it("keeps the artifact directory confined to working/{REQ}/adversarial-inquiry", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "adversarial-inquiry-"));
    const paths = resolveArtifactPaths({
      repositoryRoot: root,
      requestToken: TOKENS.req,
    });

    assert.equal(
      paths.directory,
      path.join(root, "working", TOKENS.req, "adversarial-inquiry"),
    );
    assert.throws(
      () => resolveArtifactPaths({
        repositoryRoot: root,
        requestToken: "../outside",
      }),
      /invalid request token|unsafe artifact path/,
    );
  });

  it("advisory and strict-candidate policies never block regardless of verdict", () => {
    for (const policy of ["advisory", "strict-candidate"] as const) {
      const result = evaluateScopedGate({
        policy,
        scope: ["obligation-1"],
        verdict: "UNRESOLVED",
        eligibility: eligible(),
      });
      assert.equal(result.blocking, false);
      assert.equal(result.status, "warn");
    }
  });

  it("requires explicit human approval before strict blocking", () => {
    const ineligible = evaluateScopedGate({
      policy: "strict-approved",
      scope: ["obligation-1"],
      verdict: "UNRESOLVED",
      eligibility: eligible(),
    });
    assert.equal(ineligible.blocking, false);
    assert.equal(ineligible.status, "warn");
    assert.ok(ineligible.diagnostics.includes("missing_human_approval"));

    const approved = evaluateScopedGate({
      policy: "strict-approved",
      scope: ["obligation-1"],
      verdict: "UNRESOLVED",
      eligibility: eligible(),
      humanApproval: approval,
    });
    assert.equal(approved.blocking, true);
    assert.equal(approved.status, "blocked");
    assert.equal(approved.approvalRevision, "citdp-rev-1");
  });

  it("persists deterministic snapshots, redacts evidence, and preserves canonical input", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "adversarial-inquiry-artifacts-"));
    const canonical = path.join(root, "tied", "requirements.yaml");
    fs.mkdirSync(path.dirname(canonical), { recursive: true });
    fs.writeFileSync(canonical, "REQ-X:\n  status: Active\n", "utf8");
    const before = fs.readFileSync(canonical, "utf8");
    const ledger: FindingLedger = { findings: [], duplicateLinks: [] };
    appendFinding(ledger, {
      obligationId: "obligation-1",
      blockRevision: "block-rev-1",
      dimension: "semantic_fidelity",
      message: "secret-token observed",
      evidenceRefs: ["test-1"],
      proofBoundary: "semantic_fidelity",
    });

    const input = {
      repositoryRoot: root,
      requestToken: TOKENS.req,
      report: {
        schemaVersion: "adversarial-inquiry-report.v1" as const,
        projectId: "project-1",
        scope: ["obligation-1"],
        graph: { projectId: "project-1", nodes: [], edges: [] },
        findings: [],
        proofBoundaries: ["semantic_fidelity" as const],
        readOnly: true as const,
        canonicalMutation: false as const,
      },
      ledger,
      gate: evaluateScopedGate({
        policy: "advisory",
        scope: ["obligation-1"],
        verdict: "UNRESOLVED",
        eligibility: eligible(),
      }),
      provenance: {
        schemaVersion: "adversarial-inquiry-provenance.v1",
        observations: [{ id: "test-1", secret: "secret-token" }],
      },
      redact: ["secret-token"],
    };

    const first = await persistWorkingArtifacts(input);
    const second = await persistWorkingArtifacts(input);
    assert.deepEqual(first, second);
    assert.equal(fs.readFileSync(canonical, "utf8"), before);
    assert.match(fs.readFileSync(first.obligationReport, "utf8"), /adversarial-inquiry-report\.v1/);
    assert.doesNotMatch(fs.readFileSync(first.evidenceProvenance, "utf8"), /secret-token/);
    assert.equal(
      fs.readFileSync(first.findingLedger, "utf8").trim().split("\n").length,
      1,
    );
  });
});
