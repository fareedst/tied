export type ProofBoundary =
  | "traceability_structure"
  | "pseudocode_structure"
  | "semantic_fidelity"
  | "executable_behavior"
  | "human_decision";

export type SourceLocation = {
  location: string;
  line?: number;
  column?: number;
};

export type CriterionIdentity = {
  id: string;
  kind: "criterion";
  derivation: "explicit" | "legacy";
  revision: string;
  sourceRevision: string;
};

export type BlockIdentity = {
  id: string;
  kind: "block";
  name: string;
  derivation: "content" | "legacy";
  revision: string;
  sourceRevision: string;
};

export type CriterionIdentityInput = {
  requirementToken: string;
  criterionId?: string;
  text?: string;
  sourceRevision: string;
};

export type BlockIdentityInput = {
  implementationToken: string;
  blockName: string;
  semanticContent: string;
  sourceRevision: string;
  legacy?: boolean;
};

export type ArchitectureConstraint = {
  id: string;
  implementationBlockIds: string[];
};

export type EvidenceLocus = {
  id: string;
  blockId: string;
  kind: "test" | "production";
  location: string;
  sourceRevision: string;
};

export type Binding = {
  id: string;
  blockId: string;
};

export type AdversarialCase = {
  id: string;
  blockId: string;
};

export type ObligationCriterion = {
  identity: CriterionIdentity;
  architectureConstraintIds: string[];
};

export type ObligationBlock = {
  identity: BlockIdentity;
};

export type ObligationGraphInput = {
  projectId: string;
  criteria: ObligationCriterion[];
  architectureConstraints: ArchitectureConstraint[];
  implementationBlocks: ObligationBlock[];
  evidenceLoci: EvidenceLocus[];
  bindings?: Binding[];
  adversarialCases?: AdversarialCase[];
};

export type ObligationNode = {
  id: string;
  kind: "criterion" | "constraint" | "block" | "evidence" | "binding" | "case";
  revision?: string;
};

export type ObligationEdgeKind =
  | "criterion_constraint"
  | "constraint_block"
  | "block_evidence"
  | "block_binding"
  | "block_case";

export type ObligationEdge = {
  from: string;
  to: string;
  kind: ObligationEdgeKind;
};

export type ObligationGraph = {
  projectId: string;
  nodes: ObligationNode[];
  edges: ObligationEdge[];
};

export type GraphDiagnosticCode =
  | "MALFORMED_REFERENCE"
  | "DUPLICATE_REFERENCE"
  | "STALE_REVISION"
  | "UNRESOLVED_REFERENCE";

export type GraphDiagnostic = {
  code: GraphDiagnosticCode;
  message: string;
  reference?: string;
};

export type GraphBuildResult = {
  graph?: ObligationGraph;
  diagnostics: GraphDiagnostic[];
};

export type FidelityStatement = {
  id: string;
  kind: "precondition" | "behavior" | "effect" | "failure" | "transition" | "delegation";
  value: string;
  order?: number;
  source?: SourceLocation;
};

export type EvidenceDirection = "test" | "production";

export type EvidenceObservation = {
  id: string;
  direction: EvidenceDirection;
  statementId: string;
  kind: FidelityStatement["kind"];
  value: string;
  order?: number;
  reliable: boolean;
  source: SourceLocation;
  provenance: string;
  blockRevision: string;
  unresolvedReason?: string;
};

export type NormalizedFidelityEvidence = {
  blockRevision: string;
  specification: FidelityStatement[];
  testEvidence: EvidenceObservation[];
  productionEvidence: EvidenceObservation[];
};

export type FidelityFindingKind = "reliability" | "completeness";
export type FidelityFindingDirection = "A" | "B";
export type FidelityVerdict =
  | "PASS"
  | "RELIABLE_INCOMPLETE"
  | "UNRELIABLE"
  | "UNRESOLVED";

export type FidelityFinding = {
  id: string;
  kind: FidelityFindingKind;
  direction: FidelityFindingDirection;
  statementId?: string;
  message: string;
  proofBoundary: "semantic_fidelity";
  source?: SourceLocation;
  evidenceRefs?: string[];
};

export type FidelityNormalizationInput = {
  blockRevision: string;
  specification: FidelityStatement[] | string;
  testEvidence: EvidenceObservation[];
  productionEvidence: EvidenceObservation[];
};

export type FidelityClassification = {
  verdict: FidelityVerdict;
  findings: FidelityFinding[];
  confidence: "high" | "medium" | "low";
};

export type ReadOnlyReport = {
  schemaVersion: "adversarial-inquiry-report.v1";
  projectId: string;
  scope: string[];
  graph: ObligationGraph;
  findings: FidelityFinding[];
  proofBoundaries: ProofBoundary[];
  readOnly: true;
  canonicalMutation: false;
};
