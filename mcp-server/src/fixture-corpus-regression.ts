import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import yaml from "js-yaml";

import {
  derivePhaseAwareSlugs,
  stableHash,
  validateChecklistGate,
  type ActivationExpectedIdentity,
  type ChecklistGateEvidenceInput,
  type GatePhase,
} from "./checklist-validator.js";

const REQUEST_TOKEN = "REQ-TIED_CHECKLIST_GATE_ENFORCEMENT";
const BLOCK_ID = "IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT#VALIDATE_CHECKLIST_GATE#069e46c522c9b57d";

export type CorpusManifest = {
  schema_version: string;
  negative_cases: CorpusCase[];
  positive_case: CorpusCase;
  limitations?: string[];
};

export type CorpusCase = {
  id: string;
  acceptance_row: string;
  input_refs: string[];
  expected_gate_phase: GatePhase;
  expected_allowed: boolean;
  expected_diagnostics: string[];
  proof_boundary?: string;
};

export type CorpusCaseResult = {
  case_id: string;
  acceptance_row: string;
  actual_allowed: boolean;
  actual_diagnostics: string[];
  matches_expected: boolean;
  classification: "stdd_guard_confirmed" | "needs_review" | "fixture_defect";
};

function repoRoot(): string {
  return path.resolve(import.meta.dirname, "../..");
}

export function corpusPaths(root = repoRoot()) {
  const base = path.join(
    root,
    "working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/fixture-1787603099",
  );
  return {
    base,
    manifest: path.join(base, "corpus-manifest.json"),
    snapshots: path.join(base, "snapshots"),
    regressionManifest: path.join(base, "regression-manifest.json"),
  };
}

export function loadCorpusManifest(root = repoRoot()): CorpusManifest {
  const { manifest } = corpusPaths(root);
  return JSON.parse(readFileSync(manifest, "utf8")) as CorpusManifest;
}

function loadYaml(relativePath: string, root = repoRoot()): unknown {
  const filePath = path.join(corpusPaths(root).snapshots, relativePath.replace(/^snapshots\//, ""));
  return yaml.load(readFileSync(filePath, "utf8"));
}

function loadJson(relativePath: string, root = repoRoot()): unknown {
  const filePath = path.join(corpusPaths(root).snapshots, relativePath.replace(/^snapshots\//, ""));
  return JSON.parse(readFileSync(filePath, "utf8"));
}

export function buildActivation(phase: GatePhase, runId: string) {
  const scope = [BLOCK_ID];
  const scopeHash = stableHash(scope);
  const base: ActivationExpectedIdentity = {
    request_token: REQUEST_TOKEN,
    project_id: "stdd-project",
    run_id: runId,
    phase,
    scope,
    scope_hash: scopeHash,
  };
  const artifacts = Object.fromEntries([
    "obligation-report.json",
    "finding-ledger.jsonl",
    "gate-result.json",
    "evidence-provenance.json",
  ].map((name) => [name, {
    valid: true,
    ...base,
    hash: `${name}-${runId}`,
    path: `working/${REQUEST_TOKEN}/adversarial-inquiry/phase-${phase}/${name}`,
  }]));
  const receipt = {
    ...base,
    success: true,
    tool: "tied_adversarial_inquiry_run",
    artifact_hashes: Object.fromEntries(
      Object.entries(artifacts).map(([name, artifact]) => [name, (artifact as { hash: string }).hash]),
    ),
  };
  return { receipt, artifacts, expected: base };
}

function integratedCitdp(overrides: Record<string, unknown> = {}) {
  return {
    risk_analysis: {
      adversarial_inquiry: {
        depth_tier: "integrated",
        gate_policy: "advisory",
        ...overrides,
      },
    },
    completion_criteria: {
      activation: {
        run_id: "verification-run-remediation",
        phase: "verification",
        request_token: REQUEST_TOKEN,
      },
    },
  };
}

function integratedTracker(phase: GatePhase) {
  return {
    steps: derivePhaseAwareSlugs("integrated", phase).map((slug) => ({
      slug,
      disposition: "completed",
      evidence_refs: ["fixture-corpus-regression.ts"],
    })),
  };
}

function fixtureCitdp(root = repoRoot()) {
  return loadYaml("citdp/citdp.yaml", root) as Record<string, unknown>;
}

function matchesExpectedDiagnostics(actual: readonly string[], expected: readonly string[]): boolean {
  if (expected.length === 0) return actual.length === 0;
  return expected.every((exp) => actual.some((act) => act === exp || act.startsWith(`${exp}:`) || act.startsWith(exp)));
}

export function buildGateInputForCase(testCase: CorpusCase, root = repoRoot()) {
  const phase = testCase.expected_gate_phase;
  const evidence: ChecklistGateEvidenceInput = {};
  let tracker: unknown = integratedTracker(phase);
  let citdp: unknown = integratedCitdp();
  let activation: ReturnType<typeof buildActivation> | undefined;

  if (testCase.input_refs.some((ref) => ref.startsWith("synthetic:"))) {
    const synthetic = testCase.input_refs.find((ref) => ref.startsWith("synthetic:")) ?? "";
    switch (synthetic) {
      case "synthetic:integrated_waiver_tilde":
        citdp = integratedCitdp({
          close_out_inquiry_waiver: {
            owner: "~",
            expiry: "~",
            rationale: "~",
            approval: "~",
            referenced_verification_run_id: "~",
          },
        });
        tracker = integratedTracker("close_out");
        break;
      case "synthetic:integrated_pending_sub_stub":
        tracker = {
          steps: [
            { slug: "risk-assessment", disposition: "completed", evidence_refs: ["x"] },
            { slug: "sub-adversarial-inquiry-pass", disposition: "pending" },
          ],
        };
        activation = buildActivation("pre_implementation", "pre-impl-remediation");
        break;
      case "synthetic:parent_completed_sub_pending":
        tracker = {
          steps: [
            { slug: "gate-pseudocode-validation", disposition: "completed", evidence_refs: ["x"] },
            { slug: "sub-adversarial-inquiry-pass", disposition: "pending" },
          ],
        };
        activation = buildActivation("pre_implementation", "pre-impl-remediation");
        break;
      case "synthetic:verification_receipt_at_close_out":
        tracker = integratedTracker("close_out");
        activation = buildActivation("verification", "verification-run-remediation");
        break;
      default:
        break;
    }
  } else if (testCase.id === "A1-sparse-tracker") {
    tracker = loadYaml("tracker/authoritative-tracker.yaml", root);
    citdp = fixtureCitdp(root);
  } else if (testCase.id === "A2-root-projection") {
    tracker = integratedTracker(phase);
    activation = buildActivation(phase, "root-projection-run");
    activation.artifacts["obligation-report.json"] = {
      ...activation.expected,
      valid: true,
      hash: "root-projection-hash",
      path: `working/${REQUEST_TOKEN}/adversarial-inquiry/obligation-report.json`,
    };
  } else if (testCase.id === "A3-incomplete-provenance") {
    tracker = integratedTracker(phase);
    evidence.provenance = loadJson("adversarial-inquiry-phase-verification/evidence-provenance.json", root);
  } else if (testCase.id === "A4-missing-pairing") {
    tracker = integratedTracker(phase);
    citdp = integratedCitdp();
  } else if (testCase.id === "A5-unresolved-findings") {
    tracker = integratedTracker(phase);
    evidence.gateResult = loadJson("adversarial-inquiry-phase-verification/gate-result.json", root);
    evidence.findingLedger = readFileSync(
      path.join(corpusPaths(root).snapshots, "adversarial-inquiry-phase-verification/finding-ledger.jsonl"),
      "utf8",
    );
  } else if (testCase.id === "A6-unproven-command") {
    tracker = loadYaml("tracker/authoritative-tracker.yaml", root);
    citdp = fixtureCitdp(root);
    evidence.commandEvidence = { claimed_success: true, status: "not_run" };
  } else if (testCase.id === "A7-stale-phase-copy") {
    tracker = integratedTracker(phase);
    activation = buildActivation(phase, "stale-phase-run");
    evidence.declaredArtifactHashes = { "gate-result.json": "abc" };
    evidence.computedArtifactHashes = { "gate-result.json": "def" };
  } else if (testCase.id === "A16-depth-downgrade") {
    tracker = {
      steps: [{
        slug: "sub-adversarial-inquiry-pass",
        disposition: "not_applicable",
        policy: "minimal",
        rationale: "Synthetic downgrade case.",
      }],
    };
    citdp = {
      risk_analysis: {
        adversarial_inquiry: {
          depth_tier: "minimal",
          prior_depth_tier: "integrated",
          counterexamples: ["x"],
          falsification_questions: ["y"],
          disconfirming_observations: ["z"],
          evidence_references: ["fixture-corpus-regression.ts"],
        },
      },
    };
  } else if (testCase.id === "A18-advisory-missing-activation") {
    tracker = integratedTracker(phase);
    citdp = fixtureCitdp(root);
  } else if (testCase.id === "A11-valid-integrated-verification") {
    tracker = integratedTracker("verification");
    activation = buildActivation("verification", "verification-run-remediation");
  }

  return {
    phase,
    tracker,
    citdp,
    activation,
    evidence: Object.keys(evidence).length > 0 ? evidence : undefined,
  };
}

export function runCorpusCase(testCase: CorpusCase, root = repoRoot()): CorpusCaseResult {
  const input = buildGateInputForCase(testCase, root);
  const result = validateChecklistGate(input);
  const matches = result.allowed === testCase.expected_allowed
    && matchesExpectedDiagnostics(result.diagnostics, testCase.expected_diagnostics);
  return {
    case_id: testCase.id,
    acceptance_row: testCase.acceptance_row,
    actual_allowed: result.allowed,
    actual_diagnostics: result.diagnostics,
    matches_expected: matches,
    classification: matches ? "stdd_guard_confirmed" : "needs_review",
  };
}

export function runAllCorpusCases(root = repoRoot()): CorpusCaseResult[] {
  const manifest = loadCorpusManifest(root);
  const cases = [...manifest.negative_cases, manifest.positive_case];
  return cases.map((testCase) => runCorpusCase(testCase, root));
}

function sha256File(filePath: string): string {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

export function writeRegressionManifest(
  results: CorpusCaseResult[],
  root = repoRoot(),
  extra: {
    gateReceipts?: Array<{ phase: string; path: string; hash: string }>;
    adversarialInquiryRuns?: Array<Record<string, unknown>>;
    stddRevision?: string;
  } = {},
): void {
  const paths = corpusPaths(root);
  const manifest = loadCorpusManifest(root);
  const corpusHash = sha256File(paths.manifest);
  const confirmed = results.filter((item) => item.classification === "stdd_guard_confirmed").length;
  const payload = {
    schema_version: "regression-manifest.v1",
    stdd_revision: extra.stddRevision ?? "unknown",
    corpus_manifest_ref: corpusHash,
    gate_receipts: extra.gateReceipts ?? [],
    case_results: results,
    adversarial_inquiry_runs: extra.adversarialInquiryRuns ?? [],
    classification_summary: {
      stdd_guard_confirmed: confirmed,
      needs_review: results.length - confirmed,
    },
    residual_risks: manifest.limitations ?? [],
  };
  writeFileSync(paths.regressionManifest, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}
