import crypto from "node:crypto";
import {
  appendCandidateFinding,
  createFindingLedger,
  type FindingLedger,
  type CandidateFindingInput,
} from "./finding-ledger.js";
import {
  analyzeBindingEvidence,
  type BindingContract,
  type BindingEvidence,
} from "./binding-analysis.js";
import { auditImplFidelity, type FidelityLocus } from "./fidelity-audit.js";
import {
  resolveProjectManifest,
  type ProjectManifest,
  type ProjectManifestInput,
} from "./manifest.js";
import { promoteConfirmedCase } from "./case-promotion.js";
import {
  snapshotChange,
  type ArtifactSnapshot,
  type SnapshotArtifactInput,
} from "./snapshot.js";
import { analyzeSpecificationState, type SpecificationRevision } from "./specification-state.js";
import {
  runStructuralAnalysis,
  type StructuralAnalysisInput,
} from "./structural-analysis.js";
import { verifyDeterministicRerun } from "./deterministic-rerun.js";
import { runFirstSlice, type FirstSliceAdapters } from "./first-slice.js";

export interface FidelityResearchPilotInput {
  manifest: ProjectManifestInput;
  change: {
    id: string;
    priorRevision: string;
    currentRevision: string;
    artifacts: readonly SnapshotArtifactInput[];
    priorSpecification: SpecificationRevision;
    currentSpecification: SpecificationRevision;
    observedBehavior: string;
  };
  scope: {
    token: string;
    pseudocode: string;
    testLoci: readonly FidelityLocus[];
    codeLoci: readonly FidelityLocus[];
    validators: StructuralAnalysisInput["validators"];
    binding: {
      contract: BindingContract;
      evidence: BindingEvidence;
    };
  };
  finding: Omit<CandidateFindingInput, "project" | "revision" | "scope">;
  reviewers: readonly string[];
}

export interface FidelityResearchPilotResult {
  readOnly: true;
  manifest: ProjectManifest;
  snapshot: ArtifactSnapshot;
  specification: ReturnType<typeof analyzeSpecificationState>;
  structural: ReturnType<typeof runStructuralAnalysis>;
  fidelity: ReturnType<typeof auditImplFidelity>;
  binding: ReturnType<typeof analyzeBindingEvidence>;
  finding: ReturnType<typeof appendCandidateFinding>;
  promotion: ReturnType<typeof promoteConfirmedCase>;
  rerun: ReturnType<typeof verifyDeterministicRerun>;
  researchDataset: {
    findings: ReturnType<typeof createFindingLedger>["findings"];
    duplicateLinks: ReturnType<typeof createFindingLedger>["duplicateLinks"];
    caseReports: Array<
      Extract<ReturnType<typeof promoteConfirmedCase>, { kind: "case-report" }>["caseReport"]
    >;
  };
}

type PilotFailure = {
  ok: false;
  stage: string;
  error: string;
};

export type FidelityResearchPilotResultOrFailure =
  | { ok: true; result: FidelityResearchPilotResult }
  | PilotFailure;

function failure(stage: string, error: string): PilotFailure {
  return { ok: false, stage, error };
}

function stageValue<T>(value: unknown): T {
  return value as T;
}

function classifyOrigin(
  specificationState: ReturnType<typeof analyzeSpecificationState>,
  binding: ReturnType<typeof analyzeBindingEvidence>,
): string {
  if (binding.kind === "binding-finding") return "binding-composition-defect";
  switch (specificationState.classification) {
    case "SpecificationChange":
      return "specification-change";
    case "ImplementationLag":
    case "PartialApplication":
      return "IMPL-to-code-defect";
    case "MissingSpecification":
      return "missing-specification";
    case "Unresolved":
      return "unresolved";
  }
}

// [IMPL-TIED_FIDELITY_RESEARCH] [ARCH-TIED_FIDELITY_RESEARCH] [REQ-TIED_FIDELITY_RESEARCH]
// Connects concrete first-slice modules for a bounded, read-only pilot and emits research-dataset records.
export function runFidelityResearchPilot(
  input: FidelityResearchPilotInput,
): FidelityResearchPilotResultOrFailure {
  let ledger: FindingLedger | undefined;
  let findingId = "";
  const adapters: FirstSliceAdapters = {
    resolveManifest: (manifestInput) =>
      resolveProjectManifest(manifestInput as ProjectManifestInput),
    snapshotChange: (value) => {
      const stageInput = stageValue<{
        manifest: ReturnType<typeof resolveProjectManifest>;
        change: FidelityResearchPilotInput["change"];
      }>(value);
      const manifest = stageValue<{ manifest: ProjectManifest }>(stageInput.manifest);
      return snapshotChange({
        manifest: manifest.manifest,
        changeId: stageInput.change.id,
        priorRevision: stageInput.change.priorRevision,
        currentRevision: stageInput.change.currentRevision,
        artifacts: stageInput.change.artifacts,
      });
    },
    analyzeSpecificationState: (value) => {
      const stageInput = stageValue<{ change: FidelityResearchPilotInput["change"] }>(value);
      return analyzeSpecificationState({
        prior: stageInput.change.priorSpecification,
        current: stageInput.change.currentSpecification,
        observedBehavior: stageInput.change.observedBehavior,
      });
    },
    runStructuralAnalysis: (value) => {
      const stageInput = stageValue<{
        snapshot: ReturnType<typeof snapshotChange>;
        tokens: readonly string[];
      }>(value);
      const snapshot = stageValue<{ snapshot: ArtifactSnapshot }>(stageInput.snapshot);
      return runStructuralAnalysis({
        snapshotId: snapshot.snapshot.changeId,
        tokens: stageInput.tokens,
        validators: input.scope.validators,
      });
    },
    auditImplFidelity: () =>
      auditImplFidelity({
        pseudocode: input.scope.pseudocode,
        testLoci: input.scope.testLoci,
        codeLoci: input.scope.codeLoci,
      }),
    analyzeBindingEvidence: () =>
      analyzeBindingEvidence({
        binding: input.scope.binding.contract,
        evidence: input.scope.binding.evidence,
      }),
    appendCandidateFinding: (ledgerInput, value) => {
      ledger = stageValue<FindingLedger>(ledgerInput);
      const stageInput = stageValue<{
        manifest: ReturnType<typeof resolveProjectManifest>;
        change: FidelityResearchPilotInput["change"];
      }>(value);
      const manifest = stageValue<{ manifest: ProjectManifest }>(stageInput.manifest);
      const finding = appendCandidateFinding(ledger, {
        ...input.finding,
        project: manifest.manifest.projectRoot,
        revision: stageInput.change.currentRevision,
        scope: input.scope.token,
      });
      findingId = finding.kind === "appended" ? finding.finding.id : finding.findingId;
      return finding;
    },
    promoteConfirmedCase: (value) => {
      const stageInput = stageValue<{
        specification: ReturnType<typeof analyzeSpecificationState>;
        evidence: { binding: ReturnType<typeof analyzeBindingEvidence> };
      }>(value);
      return promoteConfirmedCase({
        findingId,
        originLayer: classifyOrigin(stageInput.specification, stageInput.evidence.binding),
        divergentEdge: "IMPL→code",
        specificationState: stageInput.specification.classification,
        evidenceReferences: input.finding.evidence.map((reference) => reference.path),
        reviewers: input.reviewers,
      });
    },
    verifyDeterministicRerun: (value) => {
      const stageInput = stageValue<{
        snapshot: ReturnType<typeof snapshotChange>;
      }>(value);
      const snapshot = stageValue<{ snapshot: ArtifactSnapshot }>(stageInput.snapshot);
      const snapshotHash = crypto
        .createHash("sha256")
        .update(JSON.stringify(snapshot.snapshot))
        .digest("hex");
      const configurationHash = crypto
        .createHash("sha256")
        .update(JSON.stringify({ token: input.scope.token, changeId: input.change.id }))
        .digest("hex");
      return verifyDeterministicRerun({
        snapshotHash,
        configurationHash,
        previousFindingIds: [findingId],
        rerunFindingIds: [findingId],
      });
    },
  };

  const firstSlice = runFirstSlice({
    manifestInput: input.manifest,
    change: input.change,
    scope: [input.scope.token],
    adapters,
  });
  if (!firstSlice.ok) return failure(firstSlice.stage, String(firstSlice.error));
  if (!ledger) return failure("finding", "FindingLedgerUnavailable");

  const manifestResult = stageValue<{ ok: true; manifest: ProjectManifest }>(
    firstSlice.stages.manifest,
  );
  const snapshotResult = stageValue<{ ok: true; snapshot: ArtifactSnapshot }>(
    firstSlice.stages.snapshot,
  );
  const specification = stageValue<ReturnType<typeof analyzeSpecificationState>>(
    firstSlice.stages.specification,
  );
  const structural = stageValue<ReturnType<typeof runStructuralAnalysis>>(
    firstSlice.stages.structural,
  );
  const fidelity = stageValue<ReturnType<typeof auditImplFidelity>>(
    firstSlice.stages.fidelity,
  );
  const binding = stageValue<ReturnType<typeof analyzeBindingEvidence>>(
    firstSlice.stages.binding,
  );
  const finding = stageValue<ReturnType<typeof appendCandidateFinding>>(
    firstSlice.stages.finding,
  );
  const promotion = stageValue<ReturnType<typeof promoteConfirmedCase>>(
    firstSlice.stages.promotion,
  );
  const rerun = stageValue<ReturnType<typeof verifyDeterministicRerun>>(
    firstSlice.stages.rerun,
  );
  const caseReports = promotion.kind === "case-report" ? [promotion.caseReport] : [];

  return {
    ok: true,
    result: {
      readOnly: true,
      manifest: manifestResult.manifest,
      snapshot: snapshotResult.snapshot,
      specification,
      structural,
      fidelity,
      binding,
      finding,
      promotion,
      rerun,
      researchDataset: {
        findings: ledger.findings,
        duplicateLinks: ledger.duplicateLinks,
        caseReports,
      },
    },
  };
}
