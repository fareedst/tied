import { createHash } from "node:crypto";
import type {
  AdversarialCase,
  BlockIdentity,
  BlockIdentityInput,
  CriterionIdentity,
  CriterionIdentityInput,
  EvidenceObservation,
  FidelityClassification,
  FidelityFinding,
  FidelityNormalizationInput,
  FidelityStatement,
  GraphBuildResult,
  GraphDiagnostic,
  ObligationEdge,
  ObligationGraph,
  ObligationGraphInput,
  ObligationNode,
  NormalizedFidelityEvidence,
  ReadOnlyReport,
} from "./types.js";
import { projectScopedStatus, type ScopedStatus, type StrictEligibilityResult } from "./workflow.js";

const TOKEN_RE = /\[(?:REQ|ARCH|IMPL)-[A-Z0-9_-]+\]/gu;
const EDGE_ORDER: Record<ObligationEdge["kind"], number> = {
  criterion_constraint: 1,
  constraint_block: 2,
  block_evidence: 3,
  block_binding: 4,
  block_case: 5,
};

function normalizeText(value: string): string {
  return value
    .replace(/\r\n?/gu, "\n")
    .split("\n")
    .map((line) => line.trim().replace(/[ \t]+/gu, " "))
    .join("\n")
    .replace(/\n{3,}/gu, "\n\n")
    .trim();
}

function digest(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex").slice(0, 16);
}

function requireNonEmpty(name: string, value: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(`INVALID_IDENTITY: ${name} is required`);
  return normalized;
}

// [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
// How: derive explicit criterion identity and retain semantic revision separately from display text.
export function resolveCriterionIdentity(input: CriterionIdentityInput): CriterionIdentity {
  const requirementToken = requireNonEmpty("requirementToken", input.requirementToken);
  const sourceRevision = requireNonEmpty("sourceRevision", input.sourceRevision);
  const text = normalizeText(input.text ?? "");
  const criterionId = input.criterionId?.trim();
  const derivation = criterionId ? "explicit" : "legacy";
  const stablePart = criterionId ?? `legacy-${digest(text || requirementToken)}`;

  return {
    id: `${requirementToken}#${stablePart}`,
    kind: "criterion",
    derivation,
    revision: digest(text || stablePart),
    sourceRevision,
  };
}

// [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
// How: derive content-based block identity and a separate semantic revision after formatting normalization.
export function resolveBlockIdentity(input: BlockIdentityInput): BlockIdentity {
  const implementationToken = requireNonEmpty("implementationToken", input.implementationToken);
  const name = requireNonEmpty("blockName", input.blockName).replace(/[ \t]+/gu, "_");
  const semanticContent = normalizeText(input.semanticContent);
  const sourceRevision = requireNonEmpty("sourceRevision", input.sourceRevision);
  const contentDigest = digest(`${implementationToken}\0${name}\0${semanticContent}`);

  return {
    id: `${implementationToken}#${name}#${contentDigest}`,
    kind: "block",
    name,
    derivation: input.legacy ? "legacy" : "content",
    revision: digest(semanticContent),
    sourceRevision,
  };
}

function addNode(
  nodes: Map<string, ObligationNode>,
  node: ObligationNode,
  diagnostics: GraphDiagnostic[],
): void {
  const existing = nodes.get(node.id);
  if (existing && JSON.stringify(existing) !== JSON.stringify(node)) {
    diagnostics.push({
      code: "DUPLICATE_REFERENCE",
      message: `Identity ${node.id} resolves to conflicting nodes.`,
      reference: node.id,
    });
    return;
  }
  nodes.set(node.id, { ...node });
}

function addUniqueReference(
  seen: Set<string>,
  value: string,
  diagnostics: GraphDiagnostic[],
  context: string,
): boolean {
  if (!value.trim()) {
    diagnostics.push({
      code: "MALFORMED_REFERENCE",
      message: `${context} contains an empty reference.`,
      reference: value,
    });
    return false;
  }
  if (seen.has(value)) {
    diagnostics.push({
      code: "DUPLICATE_REFERENCE",
      message: `${context} repeats reference ${value}.`,
      reference: value,
    });
    return false;
  }
  seen.add(value);
  return true;
}

function edgeKey(edge: ObligationEdge): string {
  return `${edge.kind}\0${edge.from}\0${edge.to}`;
}

function addEdge(
  edges: Map<string, ObligationEdge>,
  edge: ObligationEdge,
  diagnostics: GraphDiagnostic[],
): void {
  const key = edgeKey(edge);
  if (edges.has(key)) {
    diagnostics.push({
      code: "DUPLICATE_REFERENCE",
      message: `Duplicate graph edge ${edge.kind}: ${edge.from} -> ${edge.to}.`,
      reference: key,
    });
    return;
  }
  edges.set(key, { ...edge });
}

// [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
// How: construct stable graph nodes and edges while reporting malformed, duplicate, stale, and unresolved references.
export function buildObligationGraph(input: ObligationGraphInput): GraphBuildResult {
  const diagnostics: GraphDiagnostic[] = [];
  const nodes = new Map<string, ObligationNode>();
  const edges = new Map<string, ObligationEdge>();
  const constraints = new Map(input.architectureConstraints.map((constraint) => [constraint.id, constraint]));
  const blocks = new Map(input.implementationBlocks.map((block) => [block.identity.id, block.identity]));
  const expectedRevision = new Map([...blocks].map(([id, block]) => [id, block.sourceRevision]));

  for (const criterion of input.criteria) {
    addNode(nodes, {
      id: criterion.identity.id,
      kind: "criterion",
      revision: criterion.identity.revision,
    }, diagnostics);
    const seen = new Set<string>();
    for (const constraintId of criterion.architectureConstraintIds) {
      if (!addUniqueReference(seen, constraintId, diagnostics, criterion.identity.id)) continue;
      if (!constraints.has(constraintId)) {
        diagnostics.push({
          code: "UNRESOLVED_REFERENCE",
          message: `Criterion ${criterion.identity.id} references missing constraint ${constraintId}.`,
          reference: constraintId,
        });
        continue;
      }
      const constraintNodeId = `constraint:${constraintId}`;
      addNode(nodes, { id: constraintNodeId, kind: "constraint" }, diagnostics);
      addEdge(edges, {
        from: criterion.identity.id,
        to: constraintNodeId,
        kind: "criterion_constraint",
      }, diagnostics);
    }
  }

  for (const constraint of input.architectureConstraints) {
    addNode(nodes, { id: `constraint:${constraint.id}`, kind: "constraint" }, diagnostics);
    const seen = new Set<string>();
    for (const blockId of constraint.implementationBlockIds) {
      if (!addUniqueReference(seen, blockId, diagnostics, constraint.id)) continue;
      const block = blocks.get(blockId);
      if (!block) {
        diagnostics.push({
          code: "UNRESOLVED_REFERENCE",
          message: `Constraint ${constraint.id} references missing block ${blockId}.`,
          reference: blockId,
        });
        continue;
      }
      addNode(nodes, { id: block.id, kind: "block", revision: block.revision }, diagnostics);
      addEdge(edges, {
        from: `constraint:${constraint.id}`,
        to: block.id,
        kind: "constraint_block",
      }, diagnostics);
    }
  }

  for (const block of input.implementationBlocks) {
    addNode(nodes, { id: block.identity.id, kind: "block", revision: block.identity.revision }, diagnostics);
  }

  for (const locus of input.evidenceLoci) {
    const block = blocks.get(locus.blockId);
    if (!block) {
      diagnostics.push({
        code: "UNRESOLVED_REFERENCE",
        message: `Evidence ${locus.id} references missing block ${locus.blockId}.`,
        reference: locus.blockId,
      });
      continue;
    }
    addNode(nodes, { id: `evidence:${locus.id}`, kind: "evidence", revision: locus.sourceRevision }, diagnostics);
    addEdge(edges, {
      from: block.id,
      to: `evidence:${locus.id}`,
      kind: "block_evidence",
    }, diagnostics);
    if (locus.sourceRevision !== expectedRevision.get(block.id)) {
      diagnostics.push({
        code: "STALE_REVISION",
        message: `Evidence ${locus.id} is stale for block ${block.id}.`,
        reference: locus.id,
      });
    }
  }

  for (const binding of input.bindings ?? []) {
    if (!blocks.has(binding.blockId)) {
      diagnostics.push({
        code: "UNRESOLVED_REFERENCE",
        message: `Binding ${binding.id} references missing block ${binding.blockId}.`,
        reference: binding.blockId,
      });
      continue;
    }
    addNode(nodes, { id: `binding:${binding.id}`, kind: "binding" }, diagnostics);
    addEdge(edges, {
      from: binding.blockId,
      to: `binding:${binding.id}`,
      kind: "block_binding",
    }, diagnostics);
  }

  for (const adversarialCase of input.adversarialCases ?? []) {
    addCase(adversarialCase, blocks, nodes, edges, diagnostics);
  }

  if (diagnostics.length > 0) return { diagnostics };
  return {
    graph: {
      projectId: input.projectId,
      nodes: [...nodes.values()].sort((left, right) => left.id.localeCompare(right.id)),
      edges: [...edges.values()].sort((left, right) =>
        EDGE_ORDER[left.kind] - EDGE_ORDER[right.kind]
        || left.from.localeCompare(right.from)
        || left.to.localeCompare(right.to)),
    },
    diagnostics: [],
  };
}

function addCase(
  adversarialCase: AdversarialCase,
  blocks: Map<string, BlockIdentity>,
  nodes: Map<string, ObligationNode>,
  edges: Map<string, ObligationEdge>,
  diagnostics: GraphDiagnostic[],
): void {
  if (!blocks.has(adversarialCase.blockId)) {
    diagnostics.push({
      code: "UNRESOLVED_REFERENCE",
      message: `Case ${adversarialCase.id} references missing block ${adversarialCase.blockId}.`,
      reference: adversarialCase.blockId,
    });
    return;
  }
  addNode(nodes, { id: `case:${adversarialCase.id}`, kind: "case" }, diagnostics);
  addEdge(edges, {
    from: adversarialCase.blockId,
    to: `case:${adversarialCase.id}`,
    kind: "block_case",
  }, diagnostics);
}

function normalizeStatement(statement: FidelityStatement, index: number): FidelityStatement {
  return {
    ...statement,
    id: requireNonEmpty("statement.id", statement.id),
    value: normalizeText(statement.value),
    order: statement.order ?? index + 1,
    source: statement.source ? { ...statement.source } : undefined,
  };
}

function parseSpecification(specification: string): FidelityStatement[] {
  return specification
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((value, index) => ({
      id: `statement-${index + 1}`,
      kind: "behavior" as const,
      value: value.replace(/^(?:\d+[.)]|[-*])\s*/u, ""),
      order: index + 1,
    }));
}

function stableEvidence(observations: EvidenceObservation[]): EvidenceObservation[] {
  return observations
    .map((observation, index) => ({
      ...observation,
      id: requireNonEmpty("evidence.id", observation.id),
      statementId: requireNonEmpty("evidence.statementId", observation.statementId),
      value: normalizeText(observation.value),
      order: observation.order ?? index + 1,
      source: { ...observation.source },
    }))
    .sort((left, right) =>
      (left.order ?? 0) - (right.order ?? 0) || left.id.localeCompare(right.id));
}

// [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
// How: normalize specification and adapter evidence without guessing through unsupported or unproven observations.
export function normalizeFidelityEvidence(
  input: FidelityNormalizationInput,
): NormalizedFidelityEvidence {
  return {
    blockRevision: requireNonEmpty("blockRevision", input.blockRevision),
    specification: (typeof input.specification === "string"
      ? parseSpecification(input.specification)
      : input.specification.map(normalizeStatement)).sort((left, right) =>
      (left.order ?? 0) - (right.order ?? 0) || left.id.localeCompare(right.id)),
    testEvidence: stableEvidence(input.testEvidence),
    productionEvidence: stableEvidence(input.productionEvidence),
  };
}

function finding(
  kind: FidelityFinding["kind"],
  direction: FidelityFinding["direction"],
  statementId: string | undefined,
  message: string,
  source?: EvidenceObservation["source"],
  evidenceRefs?: string[],
): FidelityFinding {
  return {
    id: digest(`${kind}\0${direction}\0${statementId ?? ""}\0${message}\0${source?.location ?? ""}`),
    kind,
    direction,
    statementId,
    message,
    proofBoundary: "semantic_fidelity",
    source,
    evidenceRefs,
  };
}

function compareDirection(
  specification: FidelityStatement[],
  observations: EvidenceObservation[],
  direction: FidelityFinding["direction"],
  expectedRevision: string,
): FidelityFinding[] {
  const findings: FidelityFinding[] = [];
  const specificationById = new Map(specification.map((statement) => [statement.id, statement]));
  const observationsById = new Map<string, EvidenceObservation[]>();

  for (const observation of observations) {
    if (observation.blockRevision !== expectedRevision) {
      findings.push(finding(
        "reliability",
        direction,
        observation.statementId,
        "Evidence belongs to a different block revision.",
        observation.source,
        [observation.id],
      ));
    }
    const current = observationsById.get(observation.statementId) ?? [];
    current.push(observation);
    observationsById.set(observation.statementId, current);
    if (!specificationById.has(observation.statementId)) {
      findings.push(finding(
        "reliability",
        direction,
        observation.statementId,
        "Evidence describes behavior not represented in the specification.",
        observation.source,
        [observation.id],
      ));
    }
  }

  for (const statement of specification) {
    const matches = observationsById.get(statement.id) ?? [];
    if (matches.length === 0) {
      findings.push(finding(
        "completeness",
        direction,
        statement.id,
        "Specification statement has no corresponding evidence.",
        statement.source,
      ));
      continue;
    }
    for (const observation of matches) {
      if (observation.unresolvedReason || !observation.reliable) {
        findings.push(finding(
          "reliability",
          direction,
          statement.id,
          observation.unresolvedReason
            ? `Evidence is unresolved: ${observation.unresolvedReason}.`
            : "Evidence is marked unreliable.",
          observation.source,
          [observation.id],
        ));
      } else if (observation.kind !== statement.kind || observation.value !== statement.value) {
        findings.push(finding(
          "reliability",
          direction,
          statement.id,
          "Evidence does not match the specified statement.",
          observation.source,
          [observation.id],
        ));
      }
      if (observation.order !== statement.order) {
        findings.push(finding(
          "reliability",
          direction,
          statement.id,
          "Evidence order differs from the specified order.",
          observation.source,
          [observation.id],
        ));
      }
    }
  }
  return findings;
}

// [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
// How: classify bidirectional evidence so locus presence alone cannot produce PASS.
export function classifyFidelity(
  input: NormalizedFidelityEvidence,
): FidelityClassification {
  const findings = [
    ...compareDirection(input.specification, input.testEvidence, "A", input.blockRevision),
    ...compareDirection(input.specification, input.productionEvidence, "B", input.blockRevision),
  ].sort((left, right) => left.id.localeCompare(right.id));
  const unresolved = [...input.testEvidence, ...input.productionEvidence]
    .some((observation) => Boolean(observation.unresolvedReason));
  const hasReliability = findings.some((item) => item.kind === "reliability");
  const hasCompleteness = findings.some((item) => item.kind === "completeness");
  const noEvidence = input.testEvidence.length === 0 || input.productionEvidence.length === 0;

  return {
    verdict: unresolved || noEvidence
      ? "UNRESOLVED"
      : hasReliability
        ? "UNRELIABLE"
        : hasCompleteness
          ? "RELIABLE_INCOMPLETE"
          : "PASS",
    findings,
    confidence: unresolved || noEvidence ? "low" : hasReliability || hasCompleteness ? "medium" : "high",
  };
}

// [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
// How: expose a stable, generated report and mark canonical mutation as impossible for this pure projection.
export function projectReadOnlyReport(input: {
  projectId: string;
  scope: readonly string[];
  graph: ObligationGraph;
  findings: readonly FidelityFinding[];
}): ReadOnlyReport {
  const proofBoundaries = [...new Set(input.findings.map((item) => item.proofBoundary))]
    .sort() as ReadOnlyReport["proofBoundaries"];
  return {
    schemaVersion: "adversarial-inquiry-report.v1",
    projectId: input.projectId,
    scope: [...input.scope].sort(),
    graph: {
      projectId: input.graph.projectId,
      nodes: input.graph.nodes.map((node) => ({ ...node })),
      edges: input.graph.edges.map((edge) => ({ ...edge })),
    },
    findings: input.findings
      .map((item) => ({ ...item, evidenceRefs: item.evidenceRefs ? [...item.evidenceRefs] : undefined }))
      .sort((left, right) => left.id.localeCompare(right.id)),
    proofBoundaries,
    readOnly: true,
    canonicalMutation: false,
  };
}

export type AdversarialInquiryInput = {
  graph: ObligationGraphInput;
  fidelity: FidelityNormalizationInput;
  scope: readonly string[];
  eligibility?: StrictEligibilityResult;
};

export type AdversarialInquiryResult =
  | {
      ok: true;
      report: ReadOnlyReport;
      verdict: FidelityClassification["verdict"];
      status: Record<string, ScopedStatus>;
    }
  | {
      ok: false;
      stage: "graph";
      diagnostics: GraphDiagnostic[];
    };

// [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
// How: compose pure graph, normalization, fidelity, and scoped projection stages without canonical writes.
export function runAdversarialInquiry(input: AdversarialInquiryInput): AdversarialInquiryResult {
  const graphResult = buildObligationGraph(input.graph);
  if (!graphResult.graph) {
    return { ok: false, stage: "graph", diagnostics: graphResult.diagnostics };
  }
  const normalized = normalizeFidelityEvidence(input.fidelity);
  const fidelity = classifyFidelity(normalized);
  const report = projectReadOnlyReport({
    projectId: input.graph.projectId,
    scope: input.scope,
    graph: graphResult.graph,
    findings: fidelity.findings,
  });
  const eligibility = input.eligibility ?? {
    eligible: true,
    diagnostics: [],
    proofBoundary: "human_decision",
  };
  const status = projectScopedStatus({
    scope: input.scope,
    obligations: input.scope.map((id) => ({ id, verdict: fidelity.verdict })),
    eligibility,
  });
  return { ok: true, report, verdict: fidelity.verdict, status };
}

export const referencedTokens = (value: string): string[] =>
  [...new Set(value.match(TOKEN_RE) ?? [])].sort();
