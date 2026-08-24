import path from "node:path";

import {
  resolveBlockIdentity,
  resolveCriterionIdentity,
} from "./core.js";
import {
  runChecklistInquiry,
  type ChecklistInquiryInput,
  type ChecklistInquiryResult,
  type GatePolicy,
  type HumanStrictApproval,
} from "./checklist-integration.js";
import { parseMinitestAssertions } from "./minitest-adapter.js";
import { parseGoTestEvidence } from "./go-evidence-adapter.js";
import type {
  ArchitectureConstraint,
  EvidenceObservation,
  FidelityStatement,
  ObligationGraphInput,
} from "./types.js";
import {
  loadProjectScope,
  type LoadedProjectScope,
  type ProjectScopeError,
  type ProjectScopeLoaderInput,
} from "./project-scope-loader.js";

type JsonObject = Record<string, unknown>;

export type ModeBInput = {
  mode: "project";
  project_root: string;
  tied_base_path?: string;
  request_token: string;
  impl_token: string;
  criterion_scope?: string[];
  test_path: string;
  production_path: string;
  production_evidence_path?: string;
  production_evidence?: EvidenceObservation[];
  policy?: GatePolicy;
  repository_root?: string;
  eligibility?: Record<string, unknown>;
  human_approval?: Record<string, unknown>;
  provenance?: unknown;
  redact?: string[];
  activation?: ChecklistInquiryInput["activation"];
  [key: string]: unknown;
};

export type ProjectOrchestratorErrorCode =
  | "INVALID_INPUT"
  | "UNSAFE_ARTIFACT_PATH"
  | "MISSING_CRITERION"
  | "MISSING_BLOCK"
  | "INVALID_PRODUCTION_EVIDENCE"
  | "INVALID_CANONICAL_RECORD"
  | "GRAPH_INPUT_INVALID";

export type ProjectOrchestratorError = {
  code: ProjectOrchestratorErrorCode;
  message: string;
  path?: string;
};

export type BuiltProjectInquiry = {
  ok: true;
  mode: "project";
  manifest: LoadedProjectScope["manifest"];
  input: ChecklistInquiryInput;
  diagnostics: string[];
};

export type ProjectOrchestratorFailure = {
  ok: false;
  mode: "project";
  stage: "project-scope-loader" | "project-orchestrator";
  error: ProjectScopeError | ProjectOrchestratorError;
};

export type BuildProjectInquiryResult = BuiltProjectInquiry | ProjectOrchestratorFailure;

export type ProjectInquiryResult =
  | (Extract<ChecklistInquiryResult, { ok: true }> & {
      mode: "project";
      manifest: LoadedProjectScope["manifest"];
      diagnostics: string[];
    })
  | (Extract<ChecklistInquiryResult, { ok: false }> & {
      mode: "project";
      manifest: LoadedProjectScope["manifest"];
    })
  | ProjectOrchestratorFailure;

function failure(
  stage: ProjectOrchestratorFailure["stage"],
  code: ProjectOrchestratorErrorCode,
  message: string,
  filePath?: string,
): ProjectOrchestratorFailure {
  return {
    ok: false,
    mode: "project",
    stage,
    error: { code, message, path: filePath },
  };
}

function isObject(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())).map((item) => item.trim())
    : [];
}

function recordArray(record: JsonObject, key: string): JsonObject[] {
  const value = record[key];
  return Array.isArray(value) ? value.filter(isObject) : [];
}

function implementationInquiry(record: JsonObject): JsonObject {
  return isObject(record.adversarial_inquiry) ? record.adversarial_inquiry : record;
}

function statementFrom(value: unknown, index: number): FidelityStatement | undefined {
  if (!isObject(value)) return undefined;
  const id = stringValue(value.id) ?? stringValue(value.statement_id);
  const kind = stringValue(value.kind);
  const text = stringValue(value.value) ?? stringValue(value.statement);
  const order = typeof value.order === "number" ? value.order : index + 1;
  if (
    !id
    || !text
    || !kind
    || !["precondition", "behavior", "effect", "failure", "transition", "delegation"].includes(kind)
  ) return undefined;
  return {
    id,
    kind: kind as FidelityStatement["kind"],
    value: text,
    order,
  };
}

function extractBlockName(scope: LoadedProjectScope): string | undefined {
  const inquiry = implementationInquiry(scope.implementation);
  const explicit = stringValue(inquiry.block_name) ?? stringValue(inquiry.blockName);
  if (explicit) return explicit;
  const match = scope.implementationPseudocode.match(/^##\s+([A-Z][A-Z0-9_]*)\s*$/mu);
  return match?.[1];
}

function extractSemanticContent(scope: LoadedProjectScope, blockName: string): string {
  const inquiry = implementationInquiry(scope.implementation);
  const explicit = stringValue(inquiry.semantic_content) ?? stringValue(inquiry.semanticContent);
  if (explicit) return explicit;
  const section = scope.implementationPseudocode.match(
    new RegExp(`^##\\s+${blockName}\\s*$([\\s\\S]*?)(?=^##\\s+|$)`, "mu"),
  );
  return section?.[1]?.trim() || scope.implementationPseudocode;
}

function extractSpecification(
  scope: LoadedProjectScope,
): FidelityStatement[] | string {
  const inquiry = implementationInquiry(scope.implementation);
  const values = inquiry.specification;
  if (Array.isArray(values)) {
    const statements = values.map(statementFrom).filter((statement): statement is FidelityStatement => Boolean(statement));
    if (statements.length === values.length && statements.length > 0) return statements;
  }
  if (typeof values === "string" && values.trim()) return values;
  return scope.implementationPseudocode;
}

function extractConstraints(scope: LoadedProjectScope, blockId: string, blockName: string): ArchitectureConstraint[] {
  const constraints = recordArray(scope.architecture, "constraints");
  const source = constraints.length > 0
    ? constraints
    : [{ id: `constraint-${scope.requestToken}`, implementation_block_names: [blockName] }];
  return source
    .map((constraint) => {
      const id = stringValue(constraint.id);
      if (!id) return undefined;
      const linkedIds = stringArray(constraint.implementation_block_ids ?? constraint.implementationBlockIds);
      const linkedNames = stringArray(constraint.implementation_block_names ?? constraint.implementationBlockNames);
      const implementationBlockIds = linkedNames.includes(blockName) || linkedIds.length === 0
        ? [blockId]
        : linkedIds;
      return { id, implementationBlockIds };
    })
    .filter((constraint): constraint is ArchitectureConstraint => Boolean(constraint));
}

function extractCriteria(
  scope: LoadedProjectScope,
  criterionScope: readonly string[] | undefined,
  architectureConstraints: readonly ArchitectureConstraint[],
): Array<{ identity: ReturnType<typeof resolveCriterionIdentity>; architectureConstraintIds: string[] }>
  | { error: ProjectOrchestratorError } {
  const criteria = recordArray(scope.requirement, "satisfaction_criteria");
  if (criteria.length === 0) {
    return { error: { code: "MISSING_CRITERION", message: `Requirement ${scope.requestToken} has no satisfaction criteria.` } };
  }
  const requested = new Set(criterionScope ?? []);
  const all = criteria.map((criterion, index) => {
    const criterionId = stringValue(criterion.criterion_id)
      ?? stringValue(criterion.criterionId)
      ?? stringValue(criterion.id);
    const text = stringValue(criterion.criterion)
      ?? stringValue(criterion.text)
      ?? stringValue(criterion.description);
    if (!criterionId || !text) return undefined;
    const identity = resolveCriterionIdentity({
      requirementToken: scope.requestToken,
      criterionId,
      text,
      sourceRevision: scope.revisions.requirementDetail,
    });
    const configuredConstraints = stringArray(
      criterion.architecture_constraint_ids ?? criterion.architectureConstraintIds,
    );
    return {
      identity,
      architectureConstraintIds: configuredConstraints.length > 0
        ? configuredConstraints
        : architectureConstraints.map((constraint) => constraint.id),
      index,
    };
  }).filter((criterion): criterion is NonNullable<typeof criterion> => Boolean(criterion));
  if (all.length !== criteria.length) {
    return { error: { code: "INVALID_CANONICAL_RECORD", message: "Every satisfaction criterion needs an id and text." } };
  }
  const selected = requested.size > 0
    ? all.filter((criterion) => requested.has(criterion.identity.id) || requested.has(criterion.identity.id.split("#")[1] ?? ""))
    : all;
  if (selected.length === 0) {
    return { error: { code: "MISSING_CRITERION", message: "criterion_scope did not select a known criterion." } };
  }
  return selected.map(({ identity, architectureConstraintIds }) => ({ identity, architectureConstraintIds }));
}

function productionEvidence(
  value: unknown,
  blockRevision: string,
): { ok: true; evidence: EvidenceObservation[] } | { ok: false; error: ProjectOrchestratorError } {
  if (value === undefined) return { ok: true, evidence: [] };
  const raw = Array.isArray(value)
    ? value
    : isObject(value) && Array.isArray(value.observations)
      ? value.observations
      : undefined;
  if (!raw) {
    return { ok: false, error: { code: "INVALID_PRODUCTION_EVIDENCE", message: "Production evidence must be an observation array." } };
  }
  const evidence: EvidenceObservation[] = [];
  for (const [index, candidate] of raw.entries()) {
    if (!isObject(candidate)) {
      return { ok: false, error: { code: "INVALID_PRODUCTION_EVIDENCE", message: `Production observation ${index + 1} is not an object.` } };
    }
    const id = stringValue(candidate.id);
    const statementId = stringValue(candidate.statementId) ?? stringValue(candidate.statement_id);
    const kind = stringValue(candidate.kind);
    const evidenceValue = stringValue(candidate.value);
    const provenance = stringValue(candidate.provenance);
    const source = isObject(candidate.source) && stringValue(candidate.source.location)
      ? {
          location: stringValue(candidate.source.location)!,
          ...(typeof candidate.source.line === "number" ? { line: candidate.source.line } : {}),
          ...(typeof candidate.source.column === "number" ? { column: candidate.source.column } : {}),
        }
      : undefined;
    const order = typeof candidate.order === "number" ? candidate.order : index + 1;
    if (
      !id
      || !statementId
      || !kind
      || !evidenceValue
      || !provenance
      || !source
      || !["precondition", "behavior", "effect", "failure", "transition", "delegation"].includes(kind)
      || candidate.direction !== "production"
      || typeof candidate.reliable !== "boolean"
    ) {
      return {
        ok: false,
        error: { code: "INVALID_PRODUCTION_EVIDENCE", message: `Production observation ${index + 1} has an invalid shape.` },
      };
    }
    const candidateRevision = stringValue(candidate.blockRevision) ?? stringValue(candidate.block_revision);
    evidence.push({
      id,
      direction: "production",
      statementId,
      kind: kind as EvidenceObservation["kind"],
      value: evidenceValue,
      order,
      reliable: candidate.reliable,
      source,
      provenance,
      blockRevision: candidateRevision === "current" ? blockRevision : candidateRevision ?? blockRevision,
      ...(stringValue(candidate.unresolvedReason)
        ? { unresolvedReason: stringValue(candidate.unresolvedReason) }
        : {}),
    });
  }
  return { ok: true, evidence };
}

function humanApproval(value: Record<string, unknown> | undefined): HumanStrictApproval | undefined {
  if (!value) return undefined;
  return {
    reviewer: stringValue(value.reviewer) ?? "",
    approvedScope: stringArray(value.approved_scope ?? value.approvedScope),
    thresholds: isObject(value.thresholds)
      ? Object.fromEntries(
        Object.entries(value.thresholds)
          .filter(([, item]) => typeof item === "string" || typeof item === "number"),
      ) as Record<string, string | number>
      : {},
    waiverOwner: stringValue(value.waiver_owner ?? value.waiverOwner) ?? "",
    waiverExpiry: stringValue(value.waiver_expiry ?? value.waiverExpiry) ?? "",
    rollbackCriteria: stringValue(value.rollback_criteria ?? value.rollbackCriteria) ?? "",
    approvalRevision: stringValue(value.approval_revision ?? value.approvalRevision) ?? "",
    citdpRecord: stringValue(value.citdp_record ?? value.citdpRecord) ?? "",
  };
}

function parseProjectTestEvidence(
  scope: LoadedProjectScope,
  testPath: string,
  blockRevision: string,
): { observations: EvidenceObservation[]; diagnostics: string[]; adapter: string } {
  const classifier = scope.manifest.testClassifiers[0];
  if (classifier === "go-test") {
    const parsed = parseGoTestEvidence({
      source: scope.testSource,
      sourceRevision: scope.revisions.test,
      blockRevision,
      testCaseId: testPath,
    });
    return {
      observations: parsed.observations,
      diagnostics: parsed.diagnostics.map((diagnostic) => diagnostic.code),
      adapter: "go-test",
    };
  }
  const parsed = parseMinitestAssertions({
    source: scope.testSource,
    sourceRevision: scope.revisions.test,
    blockRevision,
    testCaseId: testPath,
  });
  return {
    observations: parsed.observations,
    diagnostics: parsed.diagnostics.map((diagnostic) => diagnostic.code),
    adapter: "ruby-minitest",
  };
}

function projectInput(
  input: ModeBInput,
  scope: LoadedProjectScope,
): ChecklistInquiryInput | ProjectOrchestratorError {
  const blockName = extractBlockName(scope);
  if (!blockName) return { code: "MISSING_BLOCK", message: `Implementation ${scope.implToken} has no pseudo-code block.` };
  const semanticContent = extractSemanticContent(scope, blockName);
  const block = resolveBlockIdentity({
    implementationToken: scope.implToken,
    blockName,
    semanticContent,
    sourceRevision: scope.revisions.implementationPseudocode,
  });
  const constraints = extractConstraints(scope, block.id, blockName);
  const criteria = extractCriteria(scope, input.criterion_scope, constraints);
  if ("error" in criteria) return criteria.error;
  const parsedTest = parseProjectTestEvidence(scope, input.test_path, block.revision);
  const structured = productionEvidence(scope.productionEvidence, block.revision);
  if (!structured.ok) return structured.error;
  const graph: ObligationGraphInput = {
    projectId: scope.manifest.projectRoot,
    criteria,
    architectureConstraints: constraints,
    implementationBlocks: [{ identity: block }],
    evidenceLoci: [
      {
        id: "test-locus",
        blockId: block.id,
        kind: "test",
        location: input.test_path,
        sourceRevision: block.sourceRevision,
      },
      {
        id: "production-locus",
        blockId: block.id,
        kind: "production",
        location: input.production_path,
        sourceRevision: block.sourceRevision,
      },
    ],
  };
  const scopeIds = criteria.map((criterion) => criterion.identity.id);
  return {
    graph,
    fidelity: {
      blockRevision: block.revision,
      specification: extractSpecification(scope),
      testEvidence: parsedTest.observations,
      productionEvidence: structured.evidence,
    },
    scope: scopeIds,
    eligibility: input.eligibility as ChecklistInquiryInput["eligibility"],
    policy: input.policy,
    humanApproval: humanApproval(input.human_approval),
    repositoryRoot: input.repository_root ?? scope.manifest.projectRoot,
    requestToken: input.request_token,
    provenance: input.provenance ?? {
      mode: "project",
      manifest: scope.manifest,
      sourceRevisions: scope.revisions,
      adapter: parsedTest.adapter,
      adapterDiagnostics: parsedTest.diagnostics,
      proofBoundaries: ["traceability_structure", "semantic_fidelity"],
    },
    redact: input.redact,
  };
}

function validateMixedInput(input: ModeBInput): ProjectOrchestratorFailure | undefined {
  if (input.mode !== "project") {
    return failure("project-orchestrator", "INVALID_INPUT", "Mode B requires mode: project.");
  }
  if (Object.prototype.hasOwnProperty.call(input, "graph")
    || Object.prototype.hasOwnProperty.call(input, "fidelity")
    || Object.prototype.hasOwnProperty.call(input, "scope")) {
    return failure("project-orchestrator", "INVALID_INPUT", "Mode A and Mode B required fields cannot be mixed.");
  }
  if (input.production_evidence_path !== undefined && input.production_evidence !== undefined) {
    return failure("project-orchestrator", "INVALID_INPUT", "Use production_evidence_path or production_evidence, not both.");
  }
  if (input.repository_root !== undefined && !path.isAbsolute(input.repository_root)) {
    return failure("project-orchestrator", "UNSAFE_ARTIFACT_PATH", "repository_root must be absolute.");
  }
  return undefined;
}

// [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY] How: validate an explicit project boundary, load declared read-only inputs, and normalize supported Ruby Minitest or Go test fixtures into the existing inquiry core.
export async function buildProjectInquiryInput(input: ModeBInput): Promise<BuildProjectInquiryResult> {
  const mixed = validateMixedInput(input);
  if (mixed) return mixed;
  const loaded = await loadProjectScope({
    projectRoot: input.project_root,
    tiedBasePath: input.tied_base_path,
    requestToken: input.request_token,
    implToken: input.impl_token,
    testPath: input.test_path,
    productionPath: input.production_path,
    productionEvidencePath: input.production_evidence_path,
    productionEvidence: input.production_evidence,
  } satisfies ProjectScopeLoaderInput);
  if (!loaded.ok) {
    return {
      ok: false,
      mode: "project",
      stage: "project-scope-loader",
      error: loaded.error,
    };
  }
  const repositoryRoot = input.repository_root ?? loaded.scope.manifest.projectRoot;
  if (path.resolve(repositoryRoot) !== path.resolve(loaded.scope.manifest.projectRoot)) {
    return failure(
      "project-orchestrator",
      "UNSAFE_ARTIFACT_PATH",
      "repository_root must match the validated project root.",
      repositoryRoot,
    );
  }
  const adapterDiagnostics: string[] = [];
  const normalized = projectInput(input, loaded.scope);
  if ("code" in normalized) {
    return {
      ok: false,
      mode: "project",
      stage: "project-orchestrator",
      error: normalized,
    };
  }
  const parsed = parseProjectTestEvidence(
    loaded.scope,
    input.test_path,
    normalized.fidelity.blockRevision,
  );
  adapterDiagnostics.push(...parsed.diagnostics);
  const withDiagnostics = {
    ...normalized,
    provenance: isObject(normalized.provenance)
      ? {
        ...normalized.provenance,
        adapter: parsed.adapter,
        adapterDiagnostics: [...new Set(adapterDiagnostics)].sort(),
      }
      : normalized.provenance,
  };
  return {
    ok: true,
    mode: "project",
    manifest: loaded.scope.manifest,
    input: withDiagnostics,
    diagnostics: [...new Set(adapterDiagnostics)].sort(),
  };
}

// [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY] How: pass the normalized project input through the existing checklist gate and bounded artifact writer without duplicating core or persistence rules.
export async function runProjectInquiry(input: ModeBInput): Promise<ProjectInquiryResult> {
  const built = await buildProjectInquiryInput(input);
  if (!built.ok) return built;
  const result = await runChecklistInquiry({
    ...built.input,
    activation: input.activation,
  });
  if (result.ok) {
    return {
      ...result,
      mode: "project",
      manifest: built.manifest,
      diagnostics: built.diagnostics,
    };
  }
  return {
    ...result,
    mode: "project",
    manifest: built.manifest,
  };
}
