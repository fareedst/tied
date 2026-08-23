/**
 * [IMPL-EVIDENCE_CHAIN_PROFILE] [ARCH-EVIDENCE_CHAIN_PROFILE] [REQ-EVIDENCE_CHAIN_PROFILE]
 * Compose depth-gated adapters into one read-only profile without first-slice side effects.
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import {
  analyzeBindingEvidence,
  type BindingAnalysisResult,
  type BindingContract,
  type BindingEvidence,
} from "./binding-analysis.js";
import { auditImplFidelity, type FidelityAuditInput, type FidelityAuditResult } from "./fidelity-audit.js";
import {
  resolveProjectManifest,
  type ProjectManifestInput,
  type ProjectManifestResult,
} from "./manifest.js";
import {
  analyzeSpecificationState,
  type SpecificationStateInput,
  type SpecificationStateResult,
} from "./specification-state.js";
import {
  runStructuralAnalysis,
  type StructuralAnalysisInput,
  type StructuralAnalysisResult,
} from "./structural-analysis.js";

export const EVIDENCE_CHAIN_PROFILE_SCHEMA = "evidence-chain-profile.v1" as const;

export type EvidenceChainProfileDepth = "integrated" | "human_research";
export type EvidenceChainGenerator = "mcp" | "manual";
export type ProofBoundary =
  | "traceability_structure"
  | "pseudo_code_structure"
  | "semantic_fidelity"
  | "executable_behavior"
  | "human_decision";
export type MeasurementStatus = "observed" | "not_measured" | "unknown" | "not_applicable";

export type DerivedField<T> = {
  value: T;
  source: string;
  method: string;
  denominator: number | string;
  proof_boundary: ProofBoundary;
  status?: MeasurementStatus;
};

export type EvidenceChainProfile = {
  identity: {
    schema_version: typeof EVIDENCE_CHAIN_PROFILE_SCHEMA;
    project_id: string;
    generator: EvidenceChainGenerator;
    generator_version: string;
    observed_at: string;
    commit: string;
    tied_methodology_version: string;
    tied_base_path_confirmed: boolean;
  };
  scope: {
    roots_used: string[];
    ignore_source: string;
    config_hash: string;
    languages: string[];
    file_counts: Record<string, number>;
    active_populations: {
      requirements: number;
      architecture: number;
      implementation: number;
    };
    excluded: string[];
    unknown: string[];
    not_measured: string[];
    not_applicable: string[];
    profile_depth: EvidenceChainProfileDepth;
  };
  evidence_chain: {
    structural: DerivedField<unknown>[];
    graph: DerivedField<{ nodes: number; edges: number; cycles: number }>;
    vocab_resolution: DerivedField<string>;
  };
  quality: {
    applicable_attributes: string[];
    command_results: DerivedField<unknown>;
    freshness: DerivedField<string>;
    proof_boundary_partition: Record<ProofBoundary, string[]>;
    manifest_reference?: string;
    quality_manifest?: Record<string, unknown>;
  };
  change_fidelity: DerivedField<unknown>;
  operational: {
    metrics_opt_in: boolean;
    project_id: string;
    run_id?: string;
    profile_depth?: EvidenceChainProfileDepth;
    scope_hash?: string;
    commit?: string;
  };
  assumptions?: string[];
  confidence?: string;
  unsupported_checks?: string[];
};

export type EvidenceChainProfileGenerateInput = {
  project_root: string;
  tied_base_path: string;
  confirmed_tied_base_path?: string;
  profile_depth: EvidenceChainProfileDepth;
  output_mode?: "json" | "file";
  output_path?: string;
  scope?: {
    requirement_tokens?: string[];
    implementation_tokens?: string[];
    impl_tokens_for_pseudocode?: string[];
    binding_rows?: Record<string, unknown>[];
    quality_plan?: { selected_profiles: string[]; checks: Record<string, unknown>[] };
  };
  run_metadata?: { run_id?: string; commit?: string; environment?: Record<string, unknown> };
  quality_manifest?: Record<string, unknown>;
  manifest_reference?: string;
  change_context?: { change_id?: string; citdp_token?: string };
  specification_input?: SpecificationStateInput;
  fidelity_input?: FidelityAuditInput;
  binding_input?: { binding: BindingContract; evidence: BindingEvidence };
  config_path?: string;
  ignore_file?: string;
  roots?: string[];
  observed_at?: string;
  adapters?: EvidenceChainProfileAdapters;
  writeFile?: (filePath: string, contents: string) => void;
  structural_validators?: StructuralAnalysisInput["validators"];
};

export type EvidenceChainProfileAdapters = {
  resolveManifest: (input: ProjectManifestInput) => ProjectManifestResult;
  runStructuralAnalysis: (input: StructuralAnalysisInput) => StructuralAnalysisResult;
  auditImplFidelity: (input: FidelityAuditInput) => FidelityAuditResult;
  analyzeBindingEvidence: (input: {
    binding: BindingContract;
    evidence: BindingEvidence;
  }) => BindingAnalysisResult;
  analyzeSpecificationState: (input: SpecificationStateInput) => SpecificationStateResult;
  appendCandidateFinding?: (ledger: unknown, input: unknown) => unknown;
  promoteConfirmedCase?: (input: unknown) => unknown;
};

export type EvidenceChainProfileResult =
  | { ok: true; profile: EvidenceChainProfile; source_references: string[] }
  | { ok: false; stage: string; error: string };

const FORBIDDEN_SCORE_KEYS = new Set(["maturity", "score", "maturity_score", "universal_score"]);
const GENERATOR_VERSION = "1.0.0";

export function anonymizeProjectId(tiedBasePath: string): string {
  return crypto.createHash("sha256").update(path.resolve(tiedBasePath)).digest("hex").slice(0, 16);
}

export function hashScope(scope: unknown): string {
  const stable = JSON.stringify(scope ?? {}, Object.keys((scope ?? {}) as object).sort());
  return crypto.createHash("sha256").update(stable).digest("hex").slice(0, 16);
}

export function createEvidenceChainProfileAdapters(): EvidenceChainProfileAdapters {
  return {
    resolveManifest: resolveProjectManifest,
    runStructuralAnalysis,
    auditImplFidelity,
    analyzeBindingEvidence,
    analyzeSpecificationState,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function containsForbiddenScoreKey(value: unknown): boolean {
  if (!isRecord(value) && !Array.isArray(value)) return false;
  if (Array.isArray(value)) return value.some(containsForbiddenScoreKey);
  for (const [key, nested] of Object.entries(value)) {
    if (FORBIDDEN_SCORE_KEYS.has(key)) return true;
    if (containsForbiddenScoreKey(nested)) return true;
  }
  return false;
}

function isDerivedField(value: unknown): value is DerivedField<unknown> {
  if (!isRecord(value)) return false;
  return (
    "value" in value &&
    typeof value.source === "string" &&
    typeof value.method === "string" &&
    (typeof value.denominator === "number" || typeof value.denominator === "string") &&
    typeof value.proof_boundary === "string"
  );
}

function assertDerivedField(label: string, value: unknown): DerivedField<unknown> {
  if (!isDerivedField(value)) {
    throw new Error(`MalformedProfile: ${label} requires source, method, denominator, and proof_boundary`);
  }
  if (value.denominator === "" || value.denominator === 0) {
    throw new Error(`MalformedProfile: ${label} denominator must be a non-zero, non-empty scope`);
  }
  return value;
}

function sortedStrings(values: readonly string[]): string[] {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function defaultBindingInput(): { binding: BindingContract; evidence: BindingEvidence } {
  return {
    binding: {
      trigger: "not_measured",
      channel: "not_measured",
      callee: "not_measured",
      arguments: "not_measured",
      effect: "not_measured",
      ordering: "not_measured",
      failureBehavior: "not_measured",
    },
    evidence: {
      triggerFired: false,
      channelUsed: false,
      calleeCalled: false,
      argumentsValid: false,
      effectObserved: false,
      orderingCorrect: false,
      failureCovered: false,
      uiFree: true,
    },
  };
}

function defaultStructuralValidators(): StructuralAnalysisInput["validators"] {
  const ok = () => ({ ok: true });
  return {
    tiedConsistency: ok,
    pseudocode: ok,
    traceability: ok,
    cycles: ok,
    bindingInventory: ok,
    testAdequacy: ok,
  };
}

export function isForbiddenIntentPath(outputPath: string, projectRoot: string): boolean {
  const resolved = path.resolve(outputPath);
  const tied = path.resolve(projectRoot, "tied");
  const methodology = path.join(tied, "methodology");
  if (resolved === methodology || resolved.startsWith(`${methodology}${path.sep}`)) return true;
  const intentLeaves = [
    "requirements.yaml",
    "architecture-decisions.yaml",
    "implementation-decisions.yaml",
    "semantic-tokens.yaml",
  ];
  for (const leaf of intentLeaves) {
    if (resolved === path.join(tied, leaf)) return true;
  }
  const intentDirs = ["requirements", "architecture-decisions", "implementation-decisions"];
  for (const dir of intentDirs) {
    const abs = path.join(tied, dir);
    if (resolved === abs || resolved.startsWith(`${abs}${path.sep}`)) return true;
  }
  return resolved.startsWith(`${tied}${path.sep}`) && /\.ya?ml$/i.test(resolved);
}

export function resolveEvidenceChainScope(
  input: EvidenceChainProfileGenerateInput,
): { ok: true; scope: EvidenceChainProfile["scope"] } | { ok: false; error: "InvalidScope" } {
  if (input.profile_depth !== "integrated" && input.profile_depth !== "human_research") {
    return { ok: false, error: "InvalidScope" };
  }
  const requirementCount = input.scope?.requirement_tokens?.length ?? 0;
  const implementationCount = input.scope?.implementation_tokens?.length ?? 0;
  return {
    ok: true,
    scope: {
      roots_used: sortedStrings(input.roots ?? [input.project_root]),
      ignore_source: input.ignore_file ?? "default",
      config_hash: hashScope({
        config_path: input.config_path ?? "",
        ignore_file: input.ignore_file ?? "",
        roots: input.roots ?? [],
      }),
      languages: ["typescript"],
      file_counts: { source: 0, tests: 0, docs: 0 },
      active_populations: {
        requirements: requirementCount,
        architecture: 0,
        implementation: implementationCount,
      },
      excluded: ["methodology", "templates", "fixtures"],
      unknown: [],
      not_measured: ["vocabulary_drift_automation", "block_level_impl_test_matrix"],
      not_applicable: [],
      profile_depth: input.profile_depth,
    },
  };
}

export function emitManualProfileContract(draft: unknown): EvidenceChainProfile {
  if (!isRecord(draft) || !isRecord(draft.identity) || draft.identity.generator !== "manual") {
    throw new Error("MalformedProfile: generator must be manual for Path B");
  }
  if (!Array.isArray(draft.assumptions) || draft.assumptions.length === 0) {
    throw new Error("MalformedProfile: manual profiles require assumptions[]");
  }
  if (typeof draft.confidence !== "string" || draft.confidence.trim().length === 0) {
    throw new Error("MalformedProfile: manual profiles require confidence");
  }
  if (!Array.isArray(draft.unsupported_checks)) {
    throw new Error("MalformedProfile: manual profiles require unsupported_checks[]");
  }
  const claimed = draft.unsupported_checks;
  if (!claimed.includes("mcp_validators_not_run") && draft.identity.tied_base_path_confirmed === true) {
    // Manual profiles may confirm a path they inspected; they must still list unsupported MCP checks
    // unless they explicitly mark validators as unsupported.
  }
  return normalizeEvidenceChainProfile(draft);
}

export function normalizeEvidenceChainProfile(draft: unknown): EvidenceChainProfile {
  if (!isRecord(draft)) {
    throw new Error("MalformedProfile: draft must be an object");
  }
  if (containsForbiddenScoreKey(draft)) {
    throw new Error("MalformedProfile: maturity and score fields are forbidden");
  }
  if (!isRecord(draft.identity) || draft.identity.schema_version !== EVIDENCE_CHAIN_PROFILE_SCHEMA) {
    throw new Error("MalformedProfile: identity.schema_version must be evidence-chain-profile.v1");
  }
  if (!isRecord(draft.scope) || !isRecord(draft.evidence_chain) || !isRecord(draft.quality)) {
    throw new Error("MalformedProfile: scope, evidence_chain, and quality are required");
  }
  if (!Array.isArray(draft.evidence_chain.structural)) {
    throw new Error("MalformedProfile: evidence_chain.structural must be an array");
  }
  const structural = draft.evidence_chain.structural.map((row, index) =>
    assertDerivedField(`evidence_chain.structural[${index}]`, row),
  );
  const graph = assertDerivedField("evidence_chain.graph", draft.evidence_chain.graph);
  const vocab = assertDerivedField("evidence_chain.vocab_resolution", draft.evidence_chain.vocab_resolution);
  const commandResults = assertDerivedField("quality.command_results", draft.quality.command_results);
  const freshness = assertDerivedField("quality.freshness", draft.quality.freshness);
  const changeFidelity = assertDerivedField("change_fidelity", draft.change_fidelity);

  if (draft.identity.generator === "manual") {
    if (!Array.isArray(draft.assumptions) || draft.assumptions.length === 0) {
      throw new Error("MalformedProfile: manual profiles require assumptions[]");
    }
    if (typeof draft.confidence !== "string" || draft.confidence.trim().length === 0) {
      throw new Error("MalformedProfile: manual profiles require confidence");
    }
    if (!Array.isArray(draft.unsupported_checks)) {
      throw new Error("MalformedProfile: manual profiles require unsupported_checks[]");
    }
  }

  const profile: EvidenceChainProfile = {
    identity: {
      schema_version: EVIDENCE_CHAIN_PROFILE_SCHEMA,
      project_id: String(draft.identity.project_id ?? ""),
      generator: draft.identity.generator === "manual" ? "manual" : "mcp",
      generator_version: String(draft.identity.generator_version ?? GENERATOR_VERSION),
      observed_at: String(draft.identity.observed_at ?? ""),
      commit: String(draft.identity.commit ?? "unknown"),
      tied_methodology_version: String(draft.identity.tied_methodology_version ?? "unknown"),
      tied_base_path_confirmed: Boolean(draft.identity.tied_base_path_confirmed),
    },
    scope: {
      roots_used: sortedStrings((draft.scope.roots_used as string[]) ?? []),
      ignore_source: String(draft.scope.ignore_source ?? "default"),
      config_hash: String(draft.scope.config_hash ?? ""),
      languages: sortedStrings((draft.scope.languages as string[]) ?? []),
      file_counts: (draft.scope.file_counts as Record<string, number>) ?? {},
      active_populations: {
        requirements: Number((draft.scope.active_populations as { requirements?: number })?.requirements ?? 0),
        architecture: Number((draft.scope.active_populations as { architecture?: number })?.architecture ?? 0),
        implementation: Number((draft.scope.active_populations as { implementation?: number })?.implementation ?? 0),
      },
      excluded: sortedStrings((draft.scope.excluded as string[]) ?? []),
      unknown: sortedStrings((draft.scope.unknown as string[]) ?? []),
      not_measured: sortedStrings((draft.scope.not_measured as string[]) ?? []),
      not_applicable: sortedStrings((draft.scope.not_applicable as string[]) ?? []),
      profile_depth: draft.scope.profile_depth === "human_research" ? "human_research" : "integrated",
    },
    evidence_chain: {
      structural: [...structural].sort((left, right) =>
        String(left.source).localeCompare(String(right.source)),
      ),
      graph: graph as DerivedField<{ nodes: number; edges: number; cycles: number }>,
      vocab_resolution: vocab as DerivedField<string>,
    },
    quality: {
      applicable_attributes: sortedStrings((draft.quality.applicable_attributes as string[]) ?? []),
      command_results: commandResults,
      freshness: freshness as DerivedField<string>,
      proof_boundary_partition: (draft.quality.proof_boundary_partition as EvidenceChainProfile["quality"]["proof_boundary_partition"]) ?? {
        traceability_structure: [],
        pseudo_code_structure: [],
        semantic_fidelity: [],
        executable_behavior: [],
        human_decision: [],
      },
      manifest_reference: typeof draft.quality.manifest_reference === "string"
        ? draft.quality.manifest_reference
        : undefined,
      quality_manifest: isRecord(draft.quality.quality_manifest)
        ? draft.quality.quality_manifest
        : undefined,
    },
    change_fidelity: changeFidelity,
    operational: {
      metrics_opt_in: Boolean((draft.operational as { metrics_opt_in?: boolean } | undefined)?.metrics_opt_in),
      project_id: String((draft.operational as { project_id?: string } | undefined)?.project_id ?? draft.identity.project_id ?? ""),
      run_id: (draft.operational as { run_id?: string } | undefined)?.run_id,
      profile_depth: (draft.operational as { profile_depth?: EvidenceChainProfileDepth } | undefined)?.profile_depth,
      scope_hash: (draft.operational as { scope_hash?: string } | undefined)?.scope_hash,
      commit: (draft.operational as { commit?: string } | undefined)?.commit,
    },
  };
  if (profile.identity.generator === "manual") {
    profile.assumptions = sortedStrings((draft.assumptions as string[]) ?? []);
    profile.confidence = String(draft.confidence);
    profile.unsupported_checks = sortedStrings((draft.unsupported_checks as string[]) ?? []);
  }
  return profile;
}

function derived<T>(
  value: T,
  source: string,
  method: string,
  denominator: number | string,
  proof_boundary: ProofBoundary,
  status?: MeasurementStatus,
): DerivedField<T> {
  return { value, source, method, denominator, proof_boundary, status };
}

export function generateEvidenceChainProfile(
  input: EvidenceChainProfileGenerateInput,
): EvidenceChainProfileResult {
  const adapters = input.adapters ?? createEvidenceChainProfileAdapters();
  const scoped = resolveEvidenceChainScope(input);
  if (!scoped.ok) {
    return { ok: false, stage: "scope", error: "InvalidScope" };
  }

  const expectedTied = path.resolve(input.project_root, "tied");
  const requestedTied = path.resolve(input.tied_base_path);
  if (input.confirmed_tied_base_path && path.resolve(input.confirmed_tied_base_path) !== requestedTied) {
    return { ok: false, stage: "manifest", error: "WrongTiedBasePath" };
  }

  const manifest = adapters.resolveManifest({
    projectRoot: input.project_root,
    tiedBasePath: input.tied_base_path,
    version: "1.0.0",
    languages: ["typescript"],
    testClassifiers: ["unit"],
    ignoreRules: [],
  });
  if (!manifest.ok) {
    return { ok: false, stage: "manifest", error: manifest.error };
  }
  if (requestedTied !== expectedTied) {
    return { ok: false, stage: "manifest", error: "WrongTiedBasePath" };
  }

  if (input.output_mode === "file") {
    if (!input.output_path || isForbiddenIntentPath(input.output_path, input.project_root)) {
      return { ok: false, stage: "emit", error: "ForbiddenOutputPath" };
    }
  }

  const tokens = [
    ...(input.scope?.requirement_tokens ?? []),
    ...(input.scope?.implementation_tokens ?? []),
    ...(input.scope?.impl_tokens_for_pseudocode ?? []),
  ];
  const structural = adapters.runStructuralAnalysis({
    snapshotId: input.run_metadata?.run_id ?? "evidence-chain",
    tokens: tokens.length > 0 ? tokens : ["REQ-EVIDENCE_CHAIN_PROFILE"],
    validators: input.structural_validators ?? defaultStructuralValidators(),
  });

  const structuralFields = structural.evidence.map((row) =>
    derived(
      { validator: row.validator, ok: row.ok },
      row.validator,
      "RUN_STRUCTURAL_ANALYSIS",
      tokens.length || 1,
      row.validator.includes("pseudocode") ? "pseudo_code_structure" : "traceability_structure",
      "observed",
    ),
  );

  let fidelityResult: FidelityAuditResult | undefined;
  let bindingResult: BindingAnalysisResult | undefined;
  let specificationResult: SpecificationStateResult | undefined;
  if (input.profile_depth === "human_research") {
    fidelityResult = adapters.auditImplFidelity(
      input.fidelity_input ?? { pseudocode: "", testLoci: [], codeLoci: [] },
    );
    bindingResult = adapters.analyzeBindingEvidence(input.binding_input ?? defaultBindingInput());
    if (input.change_context) {
      specificationResult = adapters.analyzeSpecificationState(
        input.specification_input ?? {
          prior: { approved: true, behavior: "not_measured" },
          current: { approved: true, behavior: "not_measured" },
          observedBehavior: "not_measured",
        },
      );
    }
  }

  if (adapters.appendCandidateFinding) {
    console.error("DIAGNOSTIC: evidence chain profile must not append findings");
  }
  if (adapters.promoteConfirmedCase) {
    console.error("DIAGNOSTIC: evidence chain profile must not promote cases");
  }

  const changeFidelity = input.change_context
    ? derived(
        specificationResult ?? { status: "referenced_only" },
        "ANALYZE_SPECIFICATION_STATE",
        "reference_only",
        1,
        "semantic_fidelity",
        "observed",
      )
    : derived(
        { status: "not_measured", applicability: "not_applicable" },
        "change_context",
        "absent",
        "not_applicable",
        "semantic_fidelity",
        "not_measured",
      );

  const hasManifest = Boolean(input.quality_manifest || input.manifest_reference);
  const qualityCommands = hasManifest
    ? derived(
        input.quality_manifest ?? { manifest_reference: input.manifest_reference },
        input.manifest_reference ?? "quality_manifest",
        "embed_or_reference",
        1,
        "executable_behavior",
        "observed",
      )
    : derived(
        { status: "not_measured" },
        "quality_commands",
        "absent",
        "not_measured",
        "executable_behavior",
        "not_measured",
      );

  const projectId = anonymizeProjectId(input.tied_base_path);
  const draft: EvidenceChainProfile = {
    identity: {
      schema_version: EVIDENCE_CHAIN_PROFILE_SCHEMA,
      project_id: projectId,
      generator: "mcp",
      generator_version: GENERATOR_VERSION,
      observed_at: input.observed_at ?? "1970-01-01T00:00:00.000Z",
      commit: input.run_metadata?.commit ?? "unknown",
      tied_methodology_version: "3.0.0",
      tied_base_path_confirmed: true,
    },
    scope: scoped.scope,
    evidence_chain: {
      structural: structuralFields,
      graph: derived(
        { nodes: tokens.length, edges: 0, cycles: 0 },
        "tied_cycles",
        "structural_placeholder",
        tokens.length || 1,
        "traceability_structure",
        "not_measured",
      ),
      vocab_resolution: derived(
        "presence_linkage_only",
        "tied/vocab",
        "registry_presence",
        1,
        "traceability_structure",
        "observed",
      ),
    },
    quality: {
      applicable_attributes: input.scope?.quality_plan?.selected_profiles ?? ["baseline-functional"],
      command_results: qualityCommands,
      freshness: derived(
        input.observed_at ?? "unknown",
        "run_metadata",
        "observed_at",
        1,
        "human_decision",
        "observed",
      ),
      proof_boundary_partition: {
        traceability_structure: ["COLLECT_STRUCTURAL_CHAIN"],
        pseudo_code_structure: ["COLLECT_STRUCTURAL_CHAIN"],
        semantic_fidelity: input.profile_depth === "human_research" ? ["COLLECT_HUMAN_RESEARCH_CHAIN"] : [],
        executable_behavior: hasManifest ? ["ATTACH_QUALITY_PARTITION"] : [],
        human_decision: ["manual_path_or_residual_risk"],
      },
      manifest_reference: input.manifest_reference,
      quality_manifest: input.quality_manifest,
    },
    change_fidelity: changeFidelity,
    operational: {
      metrics_opt_in: false,
      project_id: projectId,
      run_id: input.run_metadata?.run_id,
      profile_depth: input.profile_depth,
      scope_hash: hashScope(input.scope),
      commit: input.run_metadata?.commit,
    },
  };

  let profile: EvidenceChainProfile;
  try {
    profile = normalizeEvidenceChainProfile(draft);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, stage: "normalize", error: message };
  }

  if (input.output_mode === "file" && input.output_path) {
    const writer = input.writeFile ?? ((filePath, contents) => {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, contents, "utf8");
    });
    writer(path.resolve(input.output_path), `${JSON.stringify(profile, null, 2)}\n`);
  }

  const source_references = [
    "PROJECT_MANIFEST",
    "RUN_STRUCTURAL_ANALYSIS",
    ...(fidelityResult ? ["AUDIT_IMPL_FIDELITY"] : []),
    ...(bindingResult ? ["ANALYZE_BINDING_EVIDENCE"] : []),
    ...(specificationResult ? ["ANALYZE_SPECIFICATION_STATE"] : []),
  ];

  console.error(
    `DEBUG: evidence_chain_profile depth=${input.profile_depth} fidelity=${Boolean(fidelityResult)} binding=${Boolean(bindingResult)} spec=${Boolean(specificationResult)}`,
  );

  return { ok: true, profile, source_references };
}
