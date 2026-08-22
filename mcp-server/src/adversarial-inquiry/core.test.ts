import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildObligationGraph,
  classifyFidelity,
  normalizeFidelityEvidence,
  runAdversarialInquiry,
  projectReadOnlyReport,
  resolveBlockIdentity,
  resolveCriterionIdentity,
} from "./core.js";
import type {
  EvidenceObservation,
  FidelityStatement,
  ObligationGraphInput,
} from "./types.js";

const TOKENS = {
  req: "REQ-TIED_ADVERSARIAL_INQUIRY",
  arch: "ARCH-TIED_ADVERSARIAL_INQUIRY",
  impl: "IMPL-TIED_ADVERSARIAL_INQUIRY",
};

describe("ADVERSARIAL INQUIRY identity resolution REQ-TIED_ADVERSARIAL_INQUIRY", () => {
  it("keeps criterion identity stable across display text changes", () => {
    const first = resolveCriterionIdentity({
      requirementToken: TOKENS.req,
      criterionId: "criterion-1",
      text: "A block has reliable evidence.",
      sourceRevision: "rev-a",
    });
    const changedDisplayText = resolveCriterionIdentity({
      requirementToken: TOKENS.req,
      criterionId: "criterion-1",
      text: "A block has reliable and complete evidence.",
      sourceRevision: "rev-b",
    });

    assert.equal(first.id, changedDisplayText.id);
    assert.equal(changedDisplayText.sourceRevision, "rev-b");
    assert.equal(first.derivation, "explicit");
  });

  it("normalizes block formatting while changing revision for semantic edits", () => {
    const first = resolveBlockIdentity({
      implementationToken: TOKENS.impl,
      blockName: "BUILD_GRAPH",
      semanticContent: "  Link criteria to blocks.\r\n",
      sourceRevision: "rev-a",
    });
    const formatted = resolveBlockIdentity({
      implementationToken: TOKENS.impl,
      blockName: " BUILD_GRAPH ",
      semanticContent: "Link criteria to blocks.\n",
      sourceRevision: "rev-b",
    });
    const semanticEdit = resolveBlockIdentity({
      implementationToken: TOKENS.impl,
      blockName: "BUILD_GRAPH",
      semanticContent: "Link criteria to blocks and bindings.",
      sourceRevision: "rev-c",
    });

    assert.equal(first.id, formatted.id);
    assert.equal(first.revision, formatted.revision);
    assert.notEqual(first.revision, semanticEdit.revision);
    assert.equal(first.sourceRevision, "rev-a");
    assert.equal(semanticEdit.sourceRevision, "rev-c");
  });
});

function graphInput(): ObligationGraphInput {
  const criterion = resolveCriterionIdentity({
    requirementToken: TOKENS.req,
    criterionId: "criterion-1",
    text: "Map every criterion.",
    sourceRevision: "rev-a",
  });
  const block = resolveBlockIdentity({
    implementationToken: TOKENS.impl,
    blockName: "BUILD_GRAPH",
    semanticContent: "Link criteria to blocks.",
    sourceRevision: "rev-a",
  });
  return {
    projectId: "fixture-project",
    criteria: [{ identity: criterion, architectureConstraintIds: ["constraint-1"] }],
    architectureConstraints: [{ id: "constraint-1", implementationBlockIds: [block.id] }],
    implementationBlocks: [{ identity: block }],
    evidenceLoci: [
      {
        id: "test-1",
        blockId: block.id,
        kind: "test",
        location: "fixture.test.ts:10",
        sourceRevision: "rev-a",
      },
      {
        id: "code-1",
        blockId: block.id,
        kind: "production",
        location: "fixture.ts:10",
        sourceRevision: "rev-a",
      },
    ],
    bindings: [{ id: "binding-1", blockId: block.id }],
    adversarialCases: [{ id: "case-1", blockId: block.id }],
  };
}

describe("BUILD_OBLIGATION_GRAPH REQ-TIED_ADVERSARIAL_INQUIRY", () => {
  it("builds stable criterion-to-evidence edges", () => {
    const result = buildObligationGraph(graphInput());

    assert.deepEqual(result.diagnostics, []);
    assert.equal(result.graph?.projectId, "fixture-project");
    assert.deepEqual(
      result.graph?.edges.map((edge) => edge.kind),
      ["criterion_constraint", "constraint_block", "block_evidence", "block_evidence", "block_binding", "block_case"],
    );
  });

  it("reports stale, duplicate, and unresolved references without throwing", () => {
    const input = graphInput();
    input.architectureConstraints[0]!.implementationBlockIds = ["missing-block", "missing-block"];
    input.evidenceLoci[0]!.sourceRevision = "old-revision";

    const result = buildObligationGraph(input);
    const codes = result.diagnostics.map((diagnostic) => diagnostic.code);

    assert.ok(codes.includes("UNRESOLVED_REFERENCE"));
    assert.ok(codes.includes("DUPLICATE_REFERENCE"));
    assert.ok(codes.includes("STALE_REVISION"));
    assert.equal(result.graph, undefined);
  });

  it("does not retain mutable source object references in the projection", () => {
    const input = graphInput();
    const result = buildObligationGraph(input);
    input.criteria[0]!.identity.id = "mutated";

    assert.equal(result.graph?.nodes.some((node) => node.id === "mutated"), false);
  });
});

const statements: FidelityStatement[] = [
  { id: "step-1", kind: "behavior", value: "accept input", order: 1 },
  { id: "step-2", kind: "effect", value: "return normalized output", order: 2 },
];

function evidence(
  direction: EvidenceObservation["direction"],
  values = statements,
): EvidenceObservation[] {
  return values.map((statement) => ({
    id: `${direction}-${statement.id}`,
    direction,
    statementId: statement.id,
    kind: statement.kind,
    value: statement.value,
    order: statement.order,
    reliable: true,
    source: { location: `${direction}.ts:${statement.order}` },
    provenance: `${direction}-fixture`,
    blockRevision: "block-rev-1",
  }));
}

describe("CLASSIFY_FIDELITY REQ-TIED_ADVERSARIAL_INQUIRY", () => {
  it("returns PASS only when both evidence directions are reliable and complete", () => {
    const normalized = normalizeFidelityEvidence({
      blockRevision: "block-rev-1",
      specification: statements,
      testEvidence: evidence("test"),
      productionEvidence: evidence("production"),
    });

    const result = classifyFidelity(normalized);

    assert.equal(result.verdict, "PASS");
    assert.deepEqual(result.findings, []);
  });

  it("does not turn loci into PASS when behavior is missing", () => {
    const normalized = normalizeFidelityEvidence({
      blockRevision: "block-rev-1",
      specification: statements,
      testEvidence: evidence("test", [statements[0]!]),
      productionEvidence: evidence("production"),
    });

    const result = classifyFidelity(normalized);

    assert.equal(result.verdict, "RELIABLE_INCOMPLETE");
    assert.ok(result.findings.some((finding) => finding.kind === "completeness"));
  });

  it("reports false, reordered, and unrepresented behavior as unreliable", () => {
    const falseAndReordered: EvidenceObservation[] = [
      {
        ...evidence("test")[1]!,
        order: 1,
        value: "unexpected side effect",
      },
      {
        ...evidence("test")[0]!,
        order: 2,
      },
      {
        id: "test-extra",
        direction: "test",
        statementId: "extra",
        kind: "behavior",
        value: "unrepresented behavior",
        order: 3,
        reliable: true,
        source: { location: "test.ts:30" },
        provenance: "test-fixture",
        blockRevision: "block-rev-1",
      },
    ];
    const normalized = normalizeFidelityEvidence({
      blockRevision: "block-rev-1",
      specification: statements,
      testEvidence: falseAndReordered,
      productionEvidence: evidence("production"),
    });

    const result = classifyFidelity(normalized);

    assert.equal(result.verdict, "UNRELIABLE");
    assert.ok(result.findings.some((finding) => finding.kind === "reliability"));
    assert.ok(result.findings.some((finding) => finding.direction === "A"));
  });

  it("returns UNRESOLVED when adapter evidence is unsupported", () => {
    const normalized = normalizeFidelityEvidence({
      blockRevision: "block-rev-1",
      specification: statements,
      testEvidence: [
        {
          ...evidence("test")[0]!,
          unresolvedReason: "unsupported_adapter",
        },
      ],
      productionEvidence: evidence("production"),
    });

    assert.equal(classifyFidelity(normalized).verdict, "UNRESOLVED");
  });
});

describe("PROJECT_READ_ONLY_REPORT REQ-TIED_ADVERSARIAL_INQUIRY", () => {
  it("projects stable references and explicit proof boundaries without canonical mutation", () => {
    const report = projectReadOnlyReport({
      projectId: "fixture-project",
      scope: ["block-1"],
      graph: { projectId: "fixture-project", nodes: [{ id: "block-1", kind: "block" }], edges: [] },
      findings: [
        {
          id: "finding-2",
          kind: "reliability",
          direction: "A",
          message: "second",
          proofBoundary: "semantic_fidelity",
        },
        {
          id: "finding-1",
          kind: "completeness",
          direction: "B",
          message: "first",
          proofBoundary: "semantic_fidelity",
        },
      ],
    });

    assert.deepEqual(report.findings.map((finding) => finding.id), ["finding-1", "finding-2"]);
    assert.equal(report.readOnly, true);
    assert.equal(report.canonicalMutation, false);
    assert.deepEqual(report.proofBoundaries, ["semantic_fidelity"]);
  });
});

describe("RUN_ADVERSARIAL_INQUIRY REQ-TIED_ADVERSARIAL_INQUIRY", () => {
  it("composes graph and fidelity stages into a read-only result", () => {
    const input = graphInput();
    const blockId = input.implementationBlocks[0]!.identity.id;
    const result = runAdversarialInquiry({
      graph: input,
      fidelity: {
        blockRevision: input.implementationBlocks[0]!.identity.revision,
        specification: [{ id: "step-1", kind: "behavior", value: "accept input", order: 1 }],
        testEvidence: [{
          id: "test-step-1",
          direction: "test",
          statementId: "step-1",
          kind: "behavior",
          value: "accept input",
          order: 1,
          reliable: true,
          source: { location: "test.ts:1" },
          provenance: "fixture",
          blockRevision: input.implementationBlocks[0]!.identity.revision,
        }],
        productionEvidence: [{
          id: "production-step-1",
          direction: "production",
          statementId: "step-1",
          kind: "behavior",
          value: "accept input",
          order: 1,
          reliable: true,
          source: { location: "production.ts:1" },
          provenance: "fixture",
          blockRevision: input.implementationBlocks[0]!.identity.revision,
        }],
      },
      scope: [blockId],
    });

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.report.readOnly, true);
      assert.equal(result.verdict, "PASS");
      assert.deepEqual(result.status, { [blockId]: "PASS" });
    }
  });
});
