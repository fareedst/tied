/**
 * MCP tool handlers for TIED YAML index operations.
 */

import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import yaml from "js-yaml";
import { textContent } from "../types.js";
import { prettyCanonicalJson, safeStringifyJson } from "../storage-dump.js";
import {
  loadIndex,
  getRecord,
  listTokens,
  filterByField,
  validateIndex,
  getDecisionsForRequirement,
  getRequirementsForDecision,
  insertRecord,
  updateRecord,
  upsertRecord,
  getBasePath,
  getClientProjectRoot,
  getMethodologyBasePath,
  type IndexName,
} from "../yaml-loader.js";
import { resolveTiedLayout } from "../tied-layout.js";
import {
  ENV_CLIENT_PROJECT_PATH,
  LEGACY_ENV_CLIENT_PROJECT_PATH,
} from "../tied-path-env.js";
import {
  getDetailPath,
  loadDetail,
  listDetailTokens,
  writeDetail,
  updateDetail,
  deleteDetail,
  appendImplementationApproachDetails,
} from "../detail-loader.js";
import { writeCitdpRecord } from "../citdp-writer.js";
import { validateConsistency } from "../consistency-validator.js";
import {
  loadFeedback,
  appendEntry,
  exportMarkdown,
  exportJson,
  buildReportSnippet,
  type FeedbackType,
} from "../feedback.js";
import {
  captureOperationalObservation,
  normalizeCaptureInput,
} from "../feedback-capture.js";
import {
  handleTiedFeedbackAnalysisDigest,
  handleTiedFeedbackOutcomeRecord,
  handleTiedFeedbackPilotRun,
  handleTiedFeedbackReviewBridge,
} from "../kaizen-feedback-mcp-handlers.js";
import { renameSemanticToken } from "../token-rename.js";
import { normalizeRecordPayload, recordInputSchema } from "../parse-content.js";
import {
  buildRequirementGraph,
  buildImplementationGraph,
  findCycles,
  topologicalSort,
  getBacklogView,
  getRequirementStatusAndPriority,
} from "../dependency-graph.js";
import { updateStatusFromPassedTokens, type VerifyUpdateOptions } from "../verify.js";
import { applyYamlUpdates, parseYamlUpdateSteps } from "../yaml-updates-apply.js";
import { formatYamlMetadata } from "../yaml-canonicalizer.js";
import {
  reportStylingEvidence,
  runClientFormatterHook,
} from "../yaml-client-formatter.js";
import { resolveRequirementListStateGuide } from "./requirement-list-state-guide.js";
import { runScopedAnalysis } from "../analysis/scoped-analysis.js";
import { runVocabularyExplorer } from "../vocabulary-explorer/pipeline.js";
import { runPlumbDiffImpactPreview } from "../analysis/plumb-diff-impact-preview.js";
import { validateBindingInventory } from "../analysis/binding-inventory.js";
import { brownfieldIntentEvidenceValidate } from "../brownfield-intent-evidence/intent-elevation.js";
import { buildEasarInventoryReceipt } from "../easar-receipts/inventory-receipt-mcp.js";
import { buildEasarCodeGraphMatrixReceipt } from "../easar-receipts/graph-matrix-receipt-mcp.js";
import { buildEasarClaimMatrixMap } from "../easar-receipts/claim-matrix-map-mcp.js";
import { buildEasarReflexionReport } from "../easar-receipts/reflexion-report-mcp.js";
import { runEasarValidationSuiteMcp } from "../easar-receipts/validation-results-mcp.js";
import { buildEasarRecoveryExport } from "../easar-receipts/recovery-export-mcp.js";
import { validateEdpcAccessMatrix } from "../edpc/access-validate.js";
import { validateEdpcEngagementFacet } from "../edpc/edpc-engagement-facet.js";
import { buildEdpcFailureState } from "../edpc/failure-state-build.js";
import { validateEdpcFailureState } from "../edpc/failure-state-validate.js";
import { composeEdpcClientAssessment } from "../edpc/client-assessment-compose.js";
import { renderEdpcClientAssessmentMarkdown } from "../edpc/client-assessment-render.js";
import { validateEdpcClientAssessment } from "../edpc/client-assessment-validate.js";
import { buildEdpcPublishManifest } from "../edpc/publish-build.js";
import { routeEdpcWorkflow } from "../edpc/workflow-route.js";
import { EVIDENCE_ACCESS_TIERS } from "../edpc/types.js";
import {
  tiedSourceGraphFreshness,
  tiedSourceGraphMap,
  tiedSourceGraphRefresh,
  tiedSourceGraphTrace,
} from "../source-graph/mcp-handlers.js";
import { validateStressorResidueRecord } from "../residuality/stressor-residue-validate.js";
import { validateMethodologyLearningExperiment } from "../methodology-learning-experiment/validate.js";
import { validateProductionSystemEnrollment } from "../methodology-production-system-enrollment/validate.js";
import { pairFromExperimentId } from "../methodology-conformance-effectiveness-pairing/resolve.js";
import { pairConformanceEffectiveness } from "../methodology-conformance-effectiveness-pairing/pair.js";
import { runMethodologyKaizenExperimentBridge } from "../methodology-kaizen-experiment-bridge/bridge.js";
import {
  listMethodologyLearningExperiments,
  upsertMethodologyLearningExperiment,
} from "../methodology-learning-experiment/store.js";
import { runMethodologyLearningCohortExport } from "../methodology-learning-cohort-export/run.js";
import { validateEssencePseudocode } from "../analysis/pseudocode-validator.js";
import { analyzeEssencePseudocode } from "../analysis/pseudocode-analyzer.js";
import { buildClosureJoinReportAsync } from "../analysis/closure-join-report.js";
import { ALL_ANALYSIS_PASSES } from "../analysis/pseudocode-ir.js";
import { validateTestAdequacyPlan } from "../quality-adequacy.js";
import { readTextFromPseudocodePath, resolvePseudocodePathUnderTiedBase } from "../impl-pseudocode-input.js";
import { resolveEssencePseudocodeSource } from "../resolve-essence-pseudocode-source.js";
import {
  buildVerificationEvidenceManifest,
  type VerificationEvidenceInput,
} from "../quality-evidence.js";
import {
  runDeclaredQualityCommands,
  type QualityCommandRunnerInput,
} from "../quality-command-runner.js";
import {
  collectVerificationEvidence,
  type QualityEvidenceCollectionInput,
} from "../quality-evidence-collection.js";
import { validateSecurityProfile, type SecurityProfileInput } from "../quality-security.js";
import {
  addProposal,
  approveProposal,
  extractDiffProposalCandidates,
  listProposals,
  loadQueue,
  markApplied,
  parseSessionExportSegments,
  proposalsFromSessionSegments,
  rejectProposal,
  updatePendingProposal,
} from "../analysis/leap-proposal-queue.js";
import { FeatureStore } from "../feature-orchestration/store.js";
import { handleOrchestrationTool } from "../feature-orchestration/mcp.js";
import {
  emitResearchDatasetRecord,
  evaluateResearchFreshness,
  normalizeResearchRecord,
  type ResearchRecordInput,
} from "../research-records.js";
import {
  createReviewedLeapProposal,
  groupDuplicateFeedback,
  normalizeOperationalSource,
  reportPromotionStatus,
  type OperationalSource,
} from "../feedback-promotion.js";
import {
  normalizeInquiryActivation,
  runChecklistInquiry,
  type ChecklistInquiryInput,
  type GatePolicy,
  type HumanStrictApproval,
  type InquiryActivation,
} from "../adversarial-inquiry/checklist-integration.js";
import {
  runProjectInquiry,
  type ModeBInput,
} from "../adversarial-inquiry/project-orchestrator.js";
import { generateEvidenceChainProfile } from "../fidelity-research/evidence-chain-profile.js";
import { createLiveStructuralValidators } from "../fidelity-research/live-structural-validators.js";
import { hydrateGateEvidenceFromActivation } from "../checklist-gate-evidence-hydration.js";
import { validateChecklistGate } from "../checklist-validator.js";
import {
  defaultPathsForRequest,
  runGateCheckComposition,
} from "../dae/gate-check-composition.js";
import { createMcpGateValidateFn } from "../dae/gate-check-mcp.js";
import { persistGateDecisionReceipt } from "../gate-receipt.js";
import { runClaimsEvidenceReviewMcp } from "../claims-evidence-review/mcp-handler.js";
import { collectChecklistActivation } from "../checklist-activation-collect.js";
import { collectEnvelopeGapReport } from "../request-evidence-envelope/batch-collect.js";
import { backfillRequestEvidenceEnvelope } from "../request-evidence-envelope/backfill.js";
import { jevPlanSkillsTools } from "./jev-plan-skills-tools.js";
import { contextAdaptiveMcpTools } from "./context-adaptive-mcp-tools.js";
import { processCertificationMcpTools } from "./process-certification-mcp-tools.js";
import {
  checklistEvidenceSufficiencyTools,
  hookChecklistGateEvidenceSufficiencyPreGate,
} from "./checklist-evidence-sufficiency-mcp.js";
import { toolSafetyMcpTools } from "./tool-safety-mcp.js";
import { projectOperationsMcpTools } from "./project-operations-mcp.js";
import { buildRequestEvidenceEnvelope } from "../request-evidence-envelope/build.js";
import { patchIndependentProof } from "../request-evidence-envelope/independent-proofs.js";
import { patchRequestEvidenceEnvelope } from "../request-evidence-envelope/patch.js";
import { validateRequestEvidenceEnvelope } from "../request-evidence-envelope/validate.js";
import { runAdherenceReconcile } from "./adherence-reconcile-runner.js";

/** LEAP proposal MCP tools: JSON envelope; catch sync throws from fs/git. [REQ-LEAP_PROPOSAL_QUEUE] */
function leapMcpJson(payload: unknown) {
  return textContent(prettyCanonicalJson(payload));
}

function safeLeapCall<T>(fn: () => T) {
  try {
    return leapMcpJson(fn());
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return leapMcpJson({ ok: false, error: msg });
  }
}

const INDEX_ENUM = z.enum([
  "requirements",
  "architecture",
  "implementation",
  "semantic-tokens",
]);
const TOKEN_TYPE_ENUM = z.enum(["REQ", "ARCH", "IMPL", "PROC"]);
const DETAIL_TYPE_ENUM = z.enum(["requirement", "architecture", "implementation"]);

export const allTools = [
  {
    name: "yaml_index_read",
    config: {
      description:
        "Read an entire YAML index or a specific record by token. Use index to choose which file (requirements, architecture, implementation, semantic-tokens). Optionally pass token to get a single record. Index rows do not include IMPL essence_pseudocode (detail-only field); use yaml_detail_read for pseudo-code bodies. Use with MCP write tools to update TIED data instead of editing YAML files by hand.",
      inputSchema: z.object({
        index: INDEX_ENUM.describe(
          "Which YAML index: requirements, architecture, implementation, or semantic-tokens"
        ),
        token: z
          .string()
          .optional()
          .describe("Optional token ID (e.g. REQ-TIED_SETUP) to fetch a single record"),
      }),
    },
    handler: async ({
      index,
      token,
    }: {
      index: string;
      token?: string;
    }) => {
      const idx = index as IndexName;
      if (token) {
        const record = getRecord(idx, token);
        if (record == null) return textContent(`No record found for token: ${token}`);
        return textContent(prettyCanonicalJson(record));
      }
      const data = loadIndex(idx);
      if (!data) return textContent(`Could not load index: ${index}`);
      return textContent(prettyCanonicalJson(data));
    },
  },
  {
    name: "yaml_index_list_tokens",
    config: {
      description:
        "List all tokens in a YAML index. For semantic-tokens index, optionally filter by type (REQ, ARCH, IMPL, PROC).",
      inputSchema: z.object({
        index: INDEX_ENUM.describe("Which YAML index to list tokens from"),
        type: TOKEN_TYPE_ENUM.optional().describe(
          "For semantic-tokens only: filter by token type (REQ, ARCH, IMPL, PROC)"
        ),
      }),
    },
    handler: async ({
      index,
      type,
    }: {
      index: string;
      type?: string;
    }) => {
      const idx = index as IndexName;
      let tokens = listTokens(idx);
      if (idx === "semantic-tokens" && type) {
        const data = loadIndex("semantic-tokens");
        if (data)
          tokens = Object.entries(data)
            .filter(
              ([, r]) =>
                typeof r === "object" &&
                r !== null &&
                (r as Record<string, unknown>).type === type
            )
            .map(([k]) => k);
      }
      return textContent(prettyCanonicalJson(tokens));
    },
  },
  {
    name: "yaml_index_filter",
    config: {
      description:
        "Filter records in a YAML index by a top-level field value (e.g. status, type).",
      inputSchema: z.object({
        index: INDEX_ENUM.describe("Which YAML index to filter"),
        field: z.string().describe("Field name (e.g. status, type)"),
        value: z.string().describe("Value to match (e.g. Active, Implemented)"),
      }),
    },
    handler: async ({
      index,
      field,
      value,
    }: { index: string; field: string; value: string }) => {
      const idx = index as IndexName;
      const filtered = filterByField(idx, field, value);
      return textContent(prettyCanonicalJson(filtered));
    },
  },
  {
    name: "yaml_index_validate",
    config: {
      description:
        "Validate YAML syntax of TIED index files. Returns valid/invalid per file.",
      inputSchema: z.object({}),
    },
    handler: async () => {
      const results: Record<string, { valid: boolean; error?: string }> = {};
      for (const name of [
        "requirements",
        "architecture",
        "implementation",
        "semantic-tokens",
      ] as const) {
        results[name] = validateIndex(name);
      }
      return textContent(prettyCanonicalJson(results));
    },
  },
  {
    name: "tied_validate_consistency",
    config: {
      description:
        "Validate TIED index and detail YAML consistency: token existence, REQ→ARCH→IMPL traceability, detail file content, and IMPL essence_pseudocode token refs. When include_pseudocode is true, non-empty essence_pseudocode without any [REQ-], [ARCH-], or [IMPL-] token comments is reported as missing_token_comments and fails the report ([PROC-IMPL_PSEUDOCODE_TOKENS]). Returns a structured report with index syntax, index_tokens, token_references, traceability, detail_files, and pseudocode sections. Use before marking work complete to ensure every referenced token has an existing record and IMPL pseudo-code has token comments.",
      inputSchema: z.object({
        include_detail_files: z
          .boolean()
          .optional()
          .default(true)
          .describe("Validate detail YAML existence and content (token refs)"),
        include_pseudocode: z
          .boolean()
          .optional()
          .default(true)
          .describe("Validate IMPL essence_pseudocode presence and token refs inside it"),
        require_detail_record: z
          .boolean()
          .optional()
          .default(true)
          .describe("Treat referenced tokens as invalid when they lack an index record (and optionally a detail file)"),
        ontology_rules: z
          .boolean()
          .optional()
          .default(false)
          .describe("[REQ-TIED_DAE_INCORPORATION] W5a: Tarjan cycle detection, one-detail-per-token, inverse depends_on advisories, disjoint ledger when provided"),
        adherence_ledger: z
          .unknown()
          .optional()
          .describe("Optional adherence ledger for ontology disjoint session check"),
        verifier_session_id: z
          .string()
          .optional()
          .describe("Optional verifier session id paired with adherence_ledger"),
      }),
    },
    handler: async ({
      include_detail_files,
      include_pseudocode,
      require_detail_record,
      ontology_rules,
      adherence_ledger,
      verifier_session_id,
    }: {
      include_detail_files?: boolean;
      include_pseudocode?: boolean;
      require_detail_record?: boolean;
      ontology_rules?: boolean;
      adherence_ledger?: unknown;
      verifier_session_id?: string;
    }) => {
      const report = validateConsistency({
        include_detail_files,
        include_pseudocode,
        require_detail_record,
        ontology_rules,
        adherence_ledger,
        verifier_session_id,
      });
      return textContent(prettyCanonicalJson(report));
    },
  },
  {
    name: "tied_config_get_base_path",
    config: {
      description:
        "Return the effective TIED project corpus path (writable tied-project/). Resolution order: TIED_CLIENT_PROJECT_PATH (canonical), then legacy TIED_BASE_PATH, then cwd discovery. Legacy env values may appear in env_* fields without affecting base_path when canonical is set.",
      inputSchema: z.object({}),
    },
    handler: async () => {
      const base_path = getBasePath();
      const { bindingStatus: resolveBindingStatus } = await import("../project-identity-write-binding.js");
      const binding_status = resolveBindingStatus(base_path, process.env);
      const env_TIED_CLIENT_PROJECT_PATH =
        process.env.TIED_CLIENT_PROJECT_PATH?.trim() || null;
      const env_TIED_CLIENT_BUNDLE_PATH =
        process.env.TIED_CLIENT_BUNDLE_PATH?.trim() || null;
      const env_TIED_BASE_PATH = process.env.TIED_BASE_PATH?.trim() || null;
      const project_path_resolved_from = env_TIED_CLIENT_PROJECT_PATH
        ? ENV_CLIENT_PROJECT_PATH
        : env_TIED_BASE_PATH
          ? LEGACY_ENV_CLIENT_PROJECT_PATH
          : "discovery";
      const legacy_project_path_env_ignored =
        env_TIED_CLIENT_PROJECT_PATH !== null &&
        env_TIED_BASE_PATH !== null &&
        path.resolve(env_TIED_CLIENT_PROJECT_PATH) !== path.resolve(env_TIED_BASE_PATH);
      const project_root = getClientProjectRoot();
      const layout = resolveTiedLayout(project_root);
      const bundle_root = getMethodologyBasePath();
      const installConfigExists = fs.existsSync(layout.installConfigPath);
      return textContent(
        prettyCanonicalJson(
          {
            base_path,
            binding_status,
            env_TIED_CLIENT_PROJECT_PATH,
            env_TIED_CLIENT_BUNDLE_PATH,
            env_TIED_BASE_PATH,
            project_path_resolved_from,
            legacy_project_path_env_ignored,
            project_root,
            bundle_root,
            store_root: process.env.TIED_STORE_ROOT ?? null,
            mode: installConfigExists ? "client" : "store",
            legacy_project_dir: layout.legacyProjectDir,
          }
        ),
      );
    },
  },
  {
    name: "get_decisions_for_requirement",
    config: {
      description:
        "Get all architecture and implementation decisions that reference a requirement token (e.g. REQ-TIED_SETUP). Returns ARCH and IMPL records.",
      inputSchema: z.object({
        requirement_token: z
          .string()
          .describe("Requirement token (e.g. REQ-TIED_SETUP)"),
      }),
    },
    handler: async ({
      requirement_token,
    }: { requirement_token: string }) => {
      const result = getDecisionsForRequirement(requirement_token);
      return textContent(prettyCanonicalJson(result));
    },
  },
  {
    name: "get_requirements_for_decision",
    config: {
      description:
        "Get all requirement tokens and full requirement records that an architecture or implementation decision references (e.g. ARCH-TIED_STRUCTURE or IMPL-MODULE_VALIDATION).",
      inputSchema: z.object({
        decision_token: z
          .string()
          .describe(
            "Architecture or implementation token (e.g. ARCH-TIED_STRUCTURE, IMPL-MODULE_VALIDATION)"
          ),
      }),
    },
    handler: async ({ decision_token }: { decision_token: string }) => {
      const result = getRequirementsForDecision(decision_token);
      return textContent(prettyCanonicalJson(result));
    },
  },
  {
    name: "yaml_index_insert",
    config: {
      description:
        "Insert a new record into a YAML index. Fails if the token already exists. Record must be a JSON object (nested allowed). Writes to the index file (e.g. tied-project/requirements.yaml). Prefer this over editing tied-project/*.yaml directly (merged read, project write); the server emits valid YAML (e.g. quoting values with colons).",
      inputSchema: z.object({
        index: INDEX_ENUM.describe(
          "Which YAML index: requirements, architecture, implementation, or semantic-tokens"
        ),
        token: z.string().describe("Token ID for the new record (e.g. REQ-NEW_FEATURE)"),
        record: recordInputSchema.describe(
          "Record object (recommended) or JSON/YAML string of the record (e.g. {\"name\": \"...\", \"status\": \"Planned\"})",
        ),
      }),
    },
    handler: async ({
      index,
      token,
      record: recordRaw,
    }: {
      index: string;
      token: string;
      record: unknown;
    }) => {
      const parsed = normalizeRecordPayload(recordRaw);
      if (!parsed.ok) return textContent(prettyCanonicalJson({ ok: false, error: parsed.error }));
      const result = insertRecord(index as IndexName, token, parsed.value);
      return textContent(prettyCanonicalJson(result));
    },
  },
  {
    name: "yaml_index_update",
    config: {
      description:
        "Update an existing record in a YAML index by merging the given fields into the token row. Top-level keys replace scalars/arrays as usual; nested objects metadata, traceability, related_requirements, related_decisions, rationale, and implementation_approach are merged one level with the existing row (partial metadata preserves metadata.created; when metadata.last_updated is an object on both sides, its sub-keys merge one level). Fails if the token does not exist. Prefer this over editing tied-project/*.yaml directly (merged read, project write); the server emits valid YAML (e.g. quoting values with colons).",
      inputSchema: z.object({
        index: INDEX_ENUM.describe(
          "Which YAML index: requirements, architecture, implementation, or semantic-tokens"
        ),
        token: z.string().describe("Token ID of the record to update"),
        updates: recordInputSchema.describe(
          "Updates object (recommended) or JSON/YAML string of key-value pairs to merge (e.g. {\"status\": \"Implemented\"})",
        ),
      }),
    },
    handler: async ({
      index,
      token,
      updates: updatesRaw,
    }: {
      index: string;
      token: string;
      updates: unknown;
    }) => {
      const parsed = normalizeRecordPayload(updatesRaw);
      if (!parsed.ok) return textContent(prettyCanonicalJson({ ok: false, error: parsed.error }));
      const result = updateRecord(index as IndexName, token, parsed.value);
      return textContent(prettyCanonicalJson(result));
    },
  },
  {
    name: "tied_yaml_format",
    config: {
      description:
        "Return the resolved tied-yaml-canonical-v1 profile, scalar style, and configuration source used by successful TIED YAML writes.",
      inputSchema: z.object({}),
    },
    handler: async () => textContent(prettyCanonicalJson({ yaml_format: formatYamlMetadata() })),
  },
  {
    name: "tied_client_yaml_styling_apply",
    config: {
      description:
        "Run the optional repository client_formatter hook on one project-owned ./tied/ YAML path after baseline canonical bytes exist. Does not auto-run during MCP writers. Returns styling_status configured or not_configured; fail-closed on path escape, methodology paths, spawn failures, invalid post-hook YAML, semantic drift, or non-idempotent second passes.",
      inputSchema: z.object({
        file_path: z
          .string()
          .min(1)
          .describe("Absolute or cwd-relative path to one project-owned YAML file under TIED_BASE_PATH"),
      }),
    },
    handler: async ({ file_path }: { file_path: string }) => {
      const absolutePath = path.isAbsolute(file_path)
        ? file_path
        : path.resolve(process.cwd(), file_path);
      const hookResult = await runClientFormatterHook(absolutePath);
      if (!hookResult.ok) {
        return textContent(
          prettyCanonicalJson(
            {
              ok: false,
              error: hookResult.error,
              code: hookResult.code,
              styling: reportStylingEvidence(hookResult),
            }
          ),
        );
      }
      return textContent(
        prettyCanonicalJson(
          {
            ok: true,
            path: absolutePath,
            styling_status: hookResult.styling_status,
            ...(hookResult.styling_status === "configured"
              ? {
                  command: hookResult.command,
                  version: hookResult.version,
                  semantic_compare_ok: hookResult.semantic_compare_ok,
                  idempotent: hookResult.idempotent,
                }
              : {}),
            styling: reportStylingEvidence(hookResult),
          }
        ),
      );
    },
  },
  {
    name: "yaml_updates_apply",
    config: {
      description:
        "Apply an ordered list of index/detail merges in one Node process using the same merge rules as yaml_index_update and yaml_detail_update. Each step is { kind: \"detail\", token, updates } or { kind: \"index\", index, token, updates } (updates are objects, not JSON strings). Use dry_run: true to get merged_preview per step without writing. On write path, snapshots unique touched files before the first write; on step failure or post-batch tied_validate_consistency rejection, restores pre-batch bytes (rolled_back: true). When dry_run is false, run_validate_consistency defaults true. Prefer small step lists and impl_detail_set_essence_pseudocode for large IMPL pseudo-code only.",
      inputSchema: z.object({
        steps: z
          .array(z.record(z.string(), z.unknown()))
          .describe(
            "Ordered steps: { kind: \"detail\", token: \"REQ-X\", updates: { ... } } or { kind: \"index\", index: \"requirements\", token: \"REQ-X\", updates: { ... } }"
          ),
        dry_run: z
          .boolean()
          .optional()
          .default(false)
          .describe("If true, compute merged_preview per step only; no file writes"),
        run_validate_consistency: z
          .boolean()
          .optional()
          .default(true)
          .describe("If true and dry_run is false, run tied_validate_consistency after all steps (default true)"),
      }),
    },
    handler: async (args: {
      steps: Record<string, unknown>[];
      dry_run?: boolean;
      run_validate_consistency?: boolean;
    }) => {
      const parsed = parseYamlUpdateSteps(args.steps);
      if (!parsed.ok) return textContent(prettyCanonicalJson({ ok: false, error: parsed.error }));
      const result = applyYamlUpdates({
        steps: parsed.steps,
        dry_run: args.dry_run ?? false,
        run_validate_consistency: args.run_validate_consistency ?? true,
      });
      return textContent(prettyCanonicalJson(result));
    },
  },
  {
    name: "yaml_detail_read",
    config: {
      description:
        "Read a single detail YAML file by token (REQ-*, ARCH-*, or IMPL-*). Returns the detail record (the content under the token key). For IMPL-*, essence_pseudocode is null only when absent. Fails if token format is invalid or no detail file exists. Use with MCP write tools to update TIED data instead of editing YAML files by hand.",
      inputSchema: z.object({
        token: z.string().min(1).describe("Token ID (e.g. REQ-TIED_SETUP, ARCH-MODULE_VALIDATION, IMPL-MODULE_VALIDATION)"),
      }),
    },
    handler: async ({ token }: { token: string }) => {
      const record = loadDetail(token);
      if (record == null) {
        const path = getDetailPath(token);
        if (path === null)
          return textContent(prettyCanonicalJson({ error: `Invalid token: ${token}. Must be REQ-*, ARCH-*, or IMPL-*` }));
        return textContent(prettyCanonicalJson({ error: `No detail file found for token: ${token}` }));
      }
      return textContent(prettyCanonicalJson(record));
    },
  },
  {
    name: "yaml_detail_read_many",
    config: {
      description:
        "Read detail YAML for multiple tokens or all tokens of a type. Pass tokens (array of REQ-*, ARCH-*, IMPL-*) and/or type (requirement | architecture | implementation). If only type is passed, returns details for all tokens that have a detail file for that type. Output is keyed by token: each value is either the detail record or { error: string }.",
      inputSchema: z.object({
        tokens: z
          .array(z.string())
          .optional()
          .describe("Optional list of token IDs to load. If omitted, type must be provided."),
        type: DETAIL_TYPE_ENUM.optional().describe(
          "If tokens omitted, load all detail files for this type (requirement, architecture, or implementation)."
        ),
      }),
    },
    handler: async ({
      tokens: tokensParam,
      type,
    }: {
      tokens?: string[];
      type?: string;
    }) => {
      let tokens: string[];
      if (tokensParam != null && tokensParam.length > 0) {
        tokens = tokensParam;
      } else if (type) {
        tokens = listDetailTokens(type as "requirement" | "architecture" | "implementation");
      } else {
        return textContent(
          prettyCanonicalJson({ error: "Provide tokens (array) or type (requirement | architecture | implementation)." })
        );
      }
      const result: Record<string, Record<string, unknown> | { error: string }> = {};
      for (const token of tokens) {
        const record = loadDetail(token);
        if (record != null) {
          result[token] = record;
        } else {
          const path = getDetailPath(token);
          if (path === null) {
            result[token] = { error: `Invalid token: ${token}. Must be REQ-*, ARCH-*, or IMPL-*` };
          } else {
            result[token] = { error: `No detail file found for token: ${token}` };
          }
        }
      }
      return textContent(prettyCanonicalJson(result));
    },
  },
  {
    name: "yaml_detail_list",
    config: {
      description:
        "List tokens that have a detail YAML file for the given type (requirement, architecture, or implementation).",
      inputSchema: z.object({
        type: DETAIL_TYPE_ENUM.describe("Which detail type: requirement (REQ-*), architecture (ARCH-*), or implementation (IMPL-*)"),
      }),
    },
    handler: async ({ type }: { type: string }) => {
      const tokens = listDetailTokens(type as "requirement" | "architecture" | "implementation");
      return textContent(prettyCanonicalJson(tokens));
    },
  },
  {
    name: "yaml_detail_create",
    config: {
      description:
        "Create a new detail YAML file. Token must be REQ-*, ARCH-*, or IMPL-*. Record is the JSON object for the single top-level key. Fails if file already exists or token invalid. Optionally syncs index detail_file (sync_index: true). Prefer this over editing tied-project/*.yaml directly (merged read, project write); the server emits valid YAML (e.g. quoting values with colons).",
      inputSchema: z.object({
        token: z.string().min(1).describe("Token ID (e.g. REQ-NEW_FEATURE)"),
        record: recordInputSchema.describe(
          "Detail record object (recommended) or JSON/YAML string of the detail record",
        ),
        sync_index: z.boolean().optional().describe("If true, set detail_file on the corresponding index record (default: true)"),
      }),
    },
    handler: async ({
      token,
      record: recordRaw,
      sync_index,
    }: {
      token: string;
      record: unknown;
      sync_index?: boolean;
    }) => {
      const parsed = normalizeRecordPayload(recordRaw);
      if (!parsed.ok) return textContent(prettyCanonicalJson({ ok: false, error: parsed.error }));
      const result = writeDetail(token, parsed.value, { syncIndex: sync_index !== false });
      return textContent(prettyCanonicalJson(result));
    },
  },
  {
    name: "yaml_detail_update",
    config: {
      description:
        "Update an existing REQ/ARCH/IMPL detail YAML by merging updates into the record under the token key. Top-level keys replace scalars/arrays as usual; nested objects metadata, traceability, related_requirements, related_decisions, rationale, and implementation_approach are merged one level with existing values (partial metadata preserves metadata.created; when metadata.last_updated is an object on both sides, its sub-keys merge one level). Fails if no detail file exists. Prefer this over editing tied-project/*.yaml directly (merged read, project write); the server emits valid YAML (e.g. quoting values with colons). For IMPL-only essence_pseudocode churn, consider impl_detail_set_essence_pseudocode.",
      inputSchema: z.object({
        token: z.string().min(1).describe("Token ID of the detail file to update"),
        updates: recordInputSchema.describe(
          "Updates object (recommended) or JSON/YAML string of key-value pairs to merge into the detail record",
        ),
      }),
    },
    handler: async ({
      token,
      updates: updatesRaw,
    }: {
      token: string;
      updates: unknown;
    }) => {
      const parsed = normalizeRecordPayload(updatesRaw);
      if (!parsed.ok) return textContent(prettyCanonicalJson({ ok: false, error: parsed.error }));
      const result = updateDetail(token, parsed.value);
      return textContent(prettyCanonicalJson(result));
    },
  },
  {
    name: "impl_detail_set_essence_pseudocode",
    config: {
      description:
        "Update only IMPL-* detail essence_pseudocode (plus optional metadata.last_updated). The pseudo-code body is written to `tied-project/implementation-decisions/IMPL-{TOKEN}-pseudocode.md` (not embedded in the detail YAML). Safer than a broad yaml_detail_update for large blobs. Rejects non-IMPL tokens. Provide exactly one of: `essence_pseudocode` (inline string) or `essence_pseudocode_path` (UTF-8 file under TIED_BASE_PATH). Nested metadata follows the same rules as yaml_detail_update (metadata.created preserved; when existing and new metadata.last_updated are both objects, date/author/reason fields merge without clobbering siblings).",
      inputSchema: z.object({
        token: z
          .string()
          .min(1)
          .describe("IMPL-* token whose detail file will be updated"),
        essence_pseudocode: z
          .string()
          .optional()
          .describe("Full essence_pseudocode string (persists to IMPL-TOKEN-pseudocode.md)"),
        essence_pseudocode_path: z
          .string()
          .min(1)
          .optional()
          .describe("Path to a UTF-8 file under TIED_BASE_PATH; file contents are used as essence_pseudocode. Mutually exclusive with essence_pseudocode (provide exactly one)."),
        metadata_last_updated: z
          .object({
            date: z.string().optional(),
            author: z.string().optional(),
            reason: z.string().optional(),
          })
          .optional()
          .describe("If set, merged under metadata.last_updated without dropping other metadata keys"),
      }),
    },
    handler: async (args: {
      token: string;
      essence_pseudocode?: string;
      essence_pseudocode_path?: string;
      metadata_last_updated?: { date?: string; author?: string; reason?: string };
    }) => {
      const { token, essence_pseudocode, essence_pseudocode_path, metadata_last_updated } = args;
      const hasPath = typeof essence_pseudocode_path === "string" && essence_pseudocode_path.length > 0;
      const hasInline = typeof essence_pseudocode === "string";
      if (!hasPath && !hasInline) {
        return textContent(
          prettyCanonicalJson(
            { ok: false, error: "Provide exactly one of essence_pseudocode (string) or essence_pseudocode_path" },
          )
        );
      }
      if (hasPath && hasInline) {
        return textContent(
          prettyCanonicalJson(
            { ok: false, error: "Provide exactly one of essence_pseudocode or essence_pseudocode_path, not both" },
          )
        );
      }
      if (!token.startsWith("IMPL-")) {
        return textContent(
          prettyCanonicalJson({ ok: false, error: `Token must be IMPL-* (got ${token})` })
        );
      }
      let body: string;
      if (hasPath) {
        const base = getBasePath();
        const resolved = resolvePseudocodePathUnderTiedBase(essence_pseudocode_path!, base);
        if (!resolved.ok) {
          return textContent(prettyCanonicalJson({ ok: false, error: resolved.error }));
        }
        const read = readTextFromPseudocodePath(resolved.absolutePath);
        if (!read.ok) {
          return textContent(prettyCanonicalJson({ ok: false, error: read.error }));
        }
        body = read.content;
      } else {
        body = essence_pseudocode as string;
      }
      const updates: Record<string, unknown> = { essence_pseudocode: body };
      if (metadata_last_updated && Object.keys(metadata_last_updated).length > 0) {
        updates.metadata = { last_updated: metadata_last_updated };
      }
      const result = updateDetail(token, updates);
      return textContent(prettyCanonicalJson(result));
    },
  },
  {
    name: "yaml_detail_append_implementation_approach_details",
    config: {
      description:
        "Append one or more bullet strings to implementation_approach.details on an existing REQ, ARCH, or IMPL detail file without replacing prior lines. Safer than yaml_detail_update when you only want to add notes (e.g. Phase G/H). Fails if detail is missing or markdown.",
      inputSchema: z.object({
        token: z
          .string()
          .min(1)
          .describe("REQ-*, ARCH-*, or IMPL-* token whose detail YAML will be updated"),
        details_lines: z
          .array(z.string())
          .min(1)
          .describe("Non-empty lines to append (trimmed; empty strings skipped)"),
      }),
    },
    handler: async ({
      token,
      details_lines,
    }: {
      token: string;
      details_lines: string[];
    }) => {
      const result = appendImplementationApproachDetails(token, details_lines);
      return textContent(prettyCanonicalJson(result));
    },
  },
  {
    name: "citdp_record_write",
    config: {
      description:
        "Write a CITDP record YAML file under tied-project/citdp/ (basename CITDP-*.yaml only). record is the inner object (value under the top-level key). Use for persist-citdp-record without direct-editing tied-project/citdp/.",
      inputSchema: z.object({
        filename: z
          .string()
          .min(1)
          .describe("Basename only, e.g. CITDP-REQ-MY_FEATURE.yaml"),
        record: recordInputSchema.describe(
          "CITDP body object (recommended) or JSON/YAML string of the document body (fields under the top-level key)",
        ),
        top_level_key: z
          .string()
          .optional()
          .describe("YAML map key (default: filename stem without .yaml)"),
      }),
    },
    handler: async ({
      filename,
      record: recordRaw,
      top_level_key,
    }: {
      filename: string;
      record: unknown;
      top_level_key?: string;
    }) => {
      const parsed = normalizeRecordPayload(recordRaw);
      if (!parsed.ok) return textContent(prettyCanonicalJson({ ok: false, error: parsed.error }));
      const rec = parsed.value as Record<string, unknown>;
      const result = writeCitdpRecord({
        filename,
        record: rec,
        top_level_key,
      });
      return textContent(prettyCanonicalJson(result));
    },
  },
  {
    name: "yaml_detail_delete",
    config: {
      description:
        "Delete a detail YAML file. Optionally clear detail_file on the corresponding index record (sync_index: true).",
      inputSchema: z.object({
        token: z.string().min(1).describe("Token ID of the detail file to delete"),
        sync_index: z.boolean().optional().describe("If true, set detail_file to null in the index (default: true)"),
      }),
    },
    handler: async ({
      token,
      sync_index,
    }: {
      token: string;
      sync_index?: boolean;
    }) => {
      const result = deleteDetail(token, { syncIndex: sync_index !== false });
      return textContent(prettyCanonicalJson(result));
    },
  },
  {
    name: "tied_token_create_with_detail",
    config: {
      description:
        "Create a new REQ, ARCH, or IMPL token with both index record and detail YAML in one step. Writes the index (requirements, architecture-decisions, or implementation-decisions) and the corresponding detail file. Fails if detail file already exists. Set upsert_index true to merge into existing index record. For IMPL tokens, detail_record should follow the TIED v3.0.0 canonical schema (see implementation-decisions.md). Prefer this over editing tied-project/*.yaml directly (merged read, project write); the server emits valid YAML (e.g. quoting values with colons).",
      inputSchema: z.object({
        token: z.string().min(1).describe("Token ID (REQ-*, ARCH-*, or IMPL-*)"),
        index_record: recordInputSchema.describe(
          "Index record object (recommended) or JSON/YAML string (e.g. name, status, cross_references). detail_file is set automatically.",
        ),
        detail_record: recordInputSchema.describe(
          "Detail record object (recommended) or JSON/YAML string (per detail-files-schema.md; for IMPL use TIED v3.0.0 schema from implementation-decisions.md).",
        ),
        upsert_index: z.boolean().optional().describe("If true, merge index_record into existing index entry; if false, fail when token already exists (default: false)"),
      }),
    },
    handler: async ({
      token,
      index_record: indexRecordRaw,
      detail_record: detailRecordRaw,
      upsert_index,
    }: {
      token: string;
      index_record: unknown;
      detail_record: unknown;
      upsert_index?: boolean;
    }) => {
      const indexName: IndexName | null =
        token.startsWith("REQ-") ? "requirements"
        : token.startsWith("ARCH-") ? "architecture"
        : token.startsWith("IMPL-") ? "implementation"
        : null;
      if (indexName === null) {
        return textContent(
          prettyCanonicalJson({ ok: false, error: `Invalid token: ${token}. Must be REQ-*, ARCH-*, or IMPL-*` })
        );
      }
      const detailFile =
        indexName === "requirements" ? `requirements/${token}.yaml`
        : indexName === "architecture" ? `architecture-decisions/${token}.yaml`
        : `implementation-decisions/${token}.yaml`;

      const indexParsed = normalizeRecordPayload(indexRecordRaw);
      if (!indexParsed.ok)
        return textContent(prettyCanonicalJson({ ok: false, error: indexParsed.error }));
      const indexRecord = { ...indexParsed.value, detail_file: detailFile };

      const detailParsed = normalizeRecordPayload(detailRecordRaw);
      if (!detailParsed.ok)
        return textContent(prettyCanonicalJson({ ok: false, error: detailParsed.error }));
      const detailRecord = detailParsed.value;

      if (upsert_index) {
        const res = upsertRecord(indexName, token, indexRecord);
        if (!res.ok) return textContent(prettyCanonicalJson(res));
      } else {
        const res = insertRecord(indexName, token, indexRecord);
        if (!res.ok) return textContent(prettyCanonicalJson(res));
      }

      const writeRes = writeDetail(token, detailRecord, { syncIndex: false });
      if (!writeRes.ok) return textContent(prettyCanonicalJson(writeRes));

      return textContent(
        prettyCanonicalJson(
          { ok: true, index: indexName, token, detail_path: detailFile, yaml_format: writeRes.yaml_format }
        )
      );
    },
  },
  {
    name: "tied_token_rename",
    config: {
      description:
        "Rename a single semantic token across the TIED tree (default TIED rename scope: project YAML indexes, detail files, pseudo-code sidecars, detail filename renames) and optional extra substitution targets under the client project root (parent of TIED base path). Replaces exact old_token string with new_token; modified YAML uses tied-yaml-canonical-v1 atomically. Params: old_token, new_token; optional dry_run, include_markdown (tied-bundle/docs/processes.md only), extra_globs (path globs from client project root), extra_extensions (e.g. swift -> **/*.swift). Successful writes report yaml_format metadata. Skips common build/vendor dirs and binary files for extra targets.",
      inputSchema: z.object({
        old_token: z.string().min(1).describe("Current token ID (e.g. REQ-TIED_SETUP)"),
        new_token: z.string().min(1).describe("New token ID; must not already exist; must have same prefix (REQ-/ARCH-/IMPL-/PROC-)"),
        dry_run: z.boolean().optional().describe("If true, return files_modified and file_renamed that would be changed without writing"),
        include_markdown: z.boolean().optional().describe("If true, also replace token in tied-bundle/docs/processes.md"),
        extra_globs: z
          .array(z.string())
          .optional()
          .describe(
            "Path globs relative to client project root (parent of TIED base path), e.g. ./*.md, tied-project/vocab/**/*.md"
          ),
        extra_extensions: z
          .array(z.string())
          .optional()
          .describe(
            "File extensions (with or without leading dot); each expands to **/*.{ext} under client project root, e.g. swift"
          ),
      }),
    },
    handler: async ({
      old_token,
      new_token,
      dry_run,
      include_markdown,
      extra_globs,
      extra_extensions,
    }: {
      old_token: string;
      new_token: string;
      dry_run?: boolean;
      include_markdown?: boolean;
      extra_globs?: string[];
      extra_extensions?: string[];
    }) => {
      const result = renameSemanticToken(old_token, new_token, {
        dryRun: dry_run,
        includeMarkdown: include_markdown,
        extraGlobs: extra_globs,
        extraExtensions: extra_extensions,
      });
      return textContent(prettyCanonicalJson(result));
    },
  },
  {
    name: "tied_import_summary",
    config: {
      description:
        "Import/inspect an existing TIED directory: read YAML indexes and report tokens plus detail file presence (hybrid .md and .yaml). Use to validate a reference TIED layout or list what would be loaded from base_path.",
      inputSchema: z.object({
        base_path: z
          .string()
          .optional()
          .describe("Path to tied/ directory (cwd-relative unless absolute). Default: TIED_BASE_PATH or tied"),
      }),
    },
    handler: async (args: { base_path?: string }) => {
      const base = args.base_path
        ? path.isAbsolute(args.base_path)
          ? args.base_path
          : path.resolve(process.cwd(), args.base_path)
        : getBasePath();
      const indexFiles: Array<{ name: IndexName; file: string }> = [
        { name: "requirements", file: "requirements.yaml" },
        { name: "architecture", file: "architecture-decisions.yaml" },
        { name: "implementation", file: "implementation-decisions.yaml" },
      ];
      const summary: Record<string, unknown> = { base_path: base, indexes: {} as Record<string, unknown> };
      for (const { name, file } of indexFiles) {
        const indexPath = path.join(base, file);
        let tokenCount = 0;
        const details: Array<{ token: string; detail_file: string; exists: boolean }> = [];
        if (fs.existsSync(indexPath)) {
          try {
            const raw = fs.readFileSync(indexPath, "utf8");
            const data = yaml.load(raw) as Record<string, unknown> | null;
            if (data && typeof data === "object" && !Array.isArray(data)) {
              for (const [token, record] of Object.entries(data)) {
                if (token.startsWith("#") || typeof record !== "object" || record === null) continue;
                tokenCount++;
                const detailFile = (record as Record<string, unknown>).detail_file;
                if (typeof detailFile === "string" && detailFile.trim()) {
                  const resolved = path.join(base, detailFile);
                  details.push({ token, detail_file: detailFile, exists: fs.existsSync(resolved) });
                }
              }
            }
          } catch {
            // ignore parse errors
          }
        }
        (summary.indexes as Record<string, unknown>)[name] = { token_count: tokenCount, details };
      }
      return textContent(prettyCanonicalJson(summary));
    },
  },
  {
    name: "tied_feedback_add",
    config: {
      description:
        "Add a feedback entry (feature request, bug report, or methodology improvement). Creates or appends to feedback.yaml under the project traceability root (TIED_BASE_PATH). Returns ok, id, created_at, and optionally a copy-paste-ready markdown snippet for reporting to the TIED project.",
      inputSchema: z.object({
        type: z
          .enum(["feature_request", "bug_report", "methodology_improvement"])
          .describe("Type of feedback"),
        title: z.string().min(1).describe("Short title for the feedback"),
        description: z.string().min(1).describe("Description or body of the feedback"),
        context: z
          .string()
          .optional()
          .describe("Optional JSON string of context (e.g. project_id, tied_version)"),
        include_report_snippet: z
          .boolean()
          .optional()
          .default(true)
          .describe("If true, include report_snippet (markdown) for pasting into TIED issue"),
        base_path: z.string().optional().describe("Override TIED base path (default: TIED_BASE_PATH or tied)"),
      }),
    },
    handler: async (args: {
      type: FeedbackType;
      title: string;
      description: string;
      context?: string;
      include_report_snippet?: boolean;
      base_path?: string;
    }) => {
      let contextObj: Record<string, unknown> | undefined;
      if (args.context) {
        try {
          const parsed = JSON.parse(args.context) as unknown;
          if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
            contextObj = parsed as Record<string, unknown>;
          }
        } catch {
          return textContent(
            prettyCanonicalJson({ ok: false, error: "context must be valid JSON object" })
          );
        }
      }
      const result = appendEntry(
        {
          type: args.type,
          title: args.title,
          description: args.description,
          context: contextObj,
        },
        args.base_path
      );
      if (!result.ok) {
        return textContent(prettyCanonicalJson(result));
      }
      const out: Record<string, unknown> = { ok: true, id: result.id, created_at: result.created_at };
      if (args.include_report_snippet !== false) {
        const data = loadFeedback(args.base_path);
        const entry = data.entries.find((e) => e.id === result.id);
        if (entry) out.report_snippet = buildReportSnippet(entry);
      }
      return textContent(prettyCanonicalJson(out));
    },
  },
  {
    name: "tied_feedback_export",
    config: {
      description:
        "Export all feedback entries in a format suitable for reporting to the TIED project. Returns markdown or JSON string for copy-paste into an issue or report.",
      inputSchema: z.object({
        format: z.enum(["markdown", "json"]).describe("Output format: markdown or json"),
        base_path: z.string().optional().describe("Override TIED base path (default: TIED_BASE_PATH or tied)"),
      }),
    },
    handler: async (args: { format: "markdown" | "json"; base_path?: string }) => {
      const data = loadFeedback(args.base_path);
      const output =
        args.format === "json" ? exportJson(data.entries) : exportMarkdown(data.entries);
      return textContent(output);
    },
  },
  {
    name: "tied_feedback_capture_observation",
    config: {
      description:
        "Point-of-work capture for Kaizen Phase 1: operator_local privacy, idempotent append, structured receipt. Does not replace tied_feedback_add.",
      inputSchema: z.object({
        event: z
          .record(z.string(), z.unknown())
          .optional()
          .describe("feedback-event.v1-shaped object (client, observation, evidence, delivery)"),
        privacy_tier: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        idempotency_key: z.string().optional(),
        occurred_at: z.string().optional(),
        observation_kind: z.string().optional(),
        entry_type: z
          .enum(["feature_request", "bug_report", "methodology_improvement"])
          .optional(),
        evidence_refs: z.array(z.string()).optional(),
        base_path: z.string().optional(),
      }),
    },
    handler: async (args: {
      event?: Record<string, unknown>;
      privacy_tier?: string;
      title?: string;
      description?: string;
      idempotency_key?: string;
      occurred_at?: string;
      observation_kind?: string;
      entry_type?: FeedbackType;
      evidence_refs?: string[];
      base_path?: string;
    }) => {
      const raw: Record<string, unknown> = args.event ?? {
        privacy_tier: args.privacy_tier,
        title: args.title,
        description: args.description,
        idempotency_key: args.idempotency_key,
        occurred_at: args.occurred_at,
        observation_kind: args.observation_kind,
        entry_type: args.entry_type,
        evidence_refs: args.evidence_refs,
      };
      const normalized = normalizeCaptureInput(raw);
      if ("error" in normalized) {
        return textContent(prettyCanonicalJson({ ok: false, error: normalized.error }));
      }
      const result = captureOperationalObservation(normalized, args.base_path);
      return textContent(prettyCanonicalJson(result));
    },
  },
  {
    name: "tied_research_record_add",
    config: {
      description:
        "Normalize and append one external research record with provenance and freshness; rejects writes inside the audited project's tied/ boundary.",
      inputSchema: z.object({
        record: z.record(z.string(), z.unknown()),
        audited_project_root: z.string().min(1),
        dataset_path: z.string().min(1),
        evaluated_at: z.string().min(1),
      }),
    },
    handler: async (args: {
      record: Record<string, unknown>;
      audited_project_root: string;
      dataset_path: string;
      evaluated_at: string;
    }) => {
      const normalized = normalizeResearchRecord(args.record as unknown as ResearchRecordInput);
      if (!normalized.ok) return textContent(prettyCanonicalJson(normalized));
      const freshness = evaluateResearchFreshness(normalized.record, args.evaluated_at);
      return textContent(prettyCanonicalJson(
        emitResearchDatasetRecord(normalized.record, freshness, {
          auditedProjectRoot: args.audited_project_root,
          datasetPath: args.dataset_path,
        })
      ));
    },
  },
  {
    name: "tied_feedback_operational_add",
    config: {
      description:
        "Normalize an incident, metric, test-failure, or user-report source and append additive metadata to the existing feedback store.",
      inputSchema: z.object({
        source: z.record(z.string(), z.unknown()),
        base_path: z.string().optional(),
      }),
    },
    handler: async (args: { source: Record<string, unknown>; base_path?: string }) => {
      const normalized = normalizeOperationalSource(args.source as unknown as OperationalSource);
      if (!normalized.ok) return textContent(prettyCanonicalJson(normalized));
      const duplicate = groupDuplicateFeedback(
        normalized.entry,
        loadFeedback(args.base_path).entries.filter(
          (entry): entry is typeof normalized.entry => Boolean(entry.duplicate_group && entry.source_type),
        ),
      );
      const entry = duplicate.entry;
      const result = appendEntry({
        type: entry.type,
        title: entry.title,
        description: entry.description,
        context: entry.context,
        source_type: entry.source_type,
        source_id: entry.source_id,
        affected_feature: entry.affected_feature,
        severity: entry.severity,
        evidence_links: entry.evidence_links,
        duplicate_group: entry.duplicate_group,
        proposed_req: entry.proposed_req,
        promotion_status: entry.promotion_status,
      }, args.base_path);
      return textContent(prettyCanonicalJson({ ...result, duplicate_of: duplicate.kind === "duplicate" ? duplicate.duplicate_of : undefined }));
    },
  },
  {
    name: "tied_feedback_promote",
    config: {
      description:
        "Create a reviewed non-canonical LEAP proposal from an operational feedback entry; never writes canonical REQ, ARCH, or IMPL YAML.",
      inputSchema: z.object({
        entry: z.record(z.string(), z.unknown()),
        project_root: z.string().min(1),
        review: z.record(z.string(), z.unknown()).optional(),
        canonical_write: z.boolean().optional(),
      }),
    },
    handler: async (args: {
      entry: Record<string, unknown>;
      project_root: string;
      review?: Record<string, unknown>;
      canonical_write?: boolean;
    }) => {
      const entry = args.entry as unknown as Parameters<typeof createReviewedLeapProposal>[0];
      const result = createReviewedLeapProposal(entry, {
        projectRoot: args.project_root,
        canonicalWrite: args.canonical_write,
        review: args.review as Parameters<typeof createReviewedLeapProposal>[1]["review"],
      });
      return textContent(prettyCanonicalJson({
        ...result,
        promotion_status: reportPromotionStatus(entry, result.ok ? result.proposal : undefined),
      }));
    },
  },
  {
    name: "tied_feedback_analysis_digest",
    config: {
      description:
        "Kaizen Phase 4: build a read-only feedback-analysis.v1 digest from local feedback.yaml (delegates to buildFeedbackDigest).",
      inputSchema: z.object({
        cohort: z.record(z.string(), z.unknown()).describe("CohortSelector — requires compatibility_key"),
        window: z.record(z.string(), z.unknown()).optional(),
        denominator_manifest: z.record(z.string(), z.unknown()).optional(),
        require_manifest_ref: z.boolean().optional(),
        include_markdown: z.boolean().optional().default(true),
        base_path: z.string().optional(),
      }),
    },
    handler: async (args: {
      cohort: Record<string, unknown>;
      window?: Record<string, unknown>;
      denominator_manifest?: Record<string, unknown>;
      require_manifest_ref?: boolean;
      include_markdown?: boolean;
      base_path?: string;
    }) => textContent(prettyCanonicalJson(handleTiedFeedbackAnalysisDigest(args))),
  },
  {
    name: "tied_feedback_review_bridge",
    config: {
      description:
        "Kaizen Phase 5: resolve a digest observation_group to feedback entries and apply reviewed LEAP handoff (delegates to runDigestReviewBridge).",
      inputSchema: z.object({
        digest: z.record(z.string(), z.unknown()).describe("feedback-analysis.v1 digest object"),
        observation_group: z.string().min(1),
        review: z.record(z.string(), z.unknown()).optional(),
        review_context: z.record(z.string(), z.unknown()).optional(),
        base_path: z.string().optional(),
      }),
    },
    handler: async (args: {
      digest: Record<string, unknown>;
      observation_group: string;
      review?: Record<string, unknown>;
      review_context?: Record<string, unknown>;
      base_path?: string;
    }) => textContent(prettyCanonicalJson(handleTiedFeedbackReviewBridge(args))),
  },
  {
    name: "tied_feedback_outcome_record",
    config: {
      description:
        "Kaizen Phase 6: record an outcome observation against baseline and follow-up window (delegates to runOutcomeLoop).",
      inputSchema: z.object({
        payload: z.record(z.string(), z.unknown()).describe("OutcomeObservationPayload — entry_id required"),
        follow_up_window: z.record(z.string(), z.unknown()),
        base_path: z.string().optional(),
      }),
    },
    handler: async (args: {
      payload: Record<string, unknown>;
      follow_up_window: Record<string, unknown>;
      base_path?: string;
    }) => textContent(prettyCanonicalJson(handleTiedFeedbackOutcomeRecord(args))),
  },
  {
    name: "tied_feedback_pilot_run",
    config: {
      description:
        "Kaizen Phase 7: run a bounded feedback pilot cohort and return feedback-pilot.v1 metrics (delegates to runKaizenFeedbackPilot).",
      inputSchema: z.object({
        spec: z.record(z.string(), z.unknown()).describe("PilotSpec object"),
        pilot_incident_signals: z.array(z.string()).optional(),
        report_out_path: z.string().optional(),
        base_path: z.string().optional(),
      }),
    },
    handler: async (args: {
      spec: Record<string, unknown>;
      pilot_incident_signals?: string[];
      report_out_path?: string;
      base_path?: string;
    }) => textContent(prettyCanonicalJson(handleTiedFeedbackPilotRun(args))),
  },
  {
    name: "tied_verify",
    config: {
      description:
        "Update requirement and optionally implementation index status from test results (verification-gated, [PROC-TIED_VERIFICATION_GATED]). Pass REQ/IMPL tokens that have passing tests; their status is set to Implemented / Active. Safe default: set_unpassed_reqs_to_planned and set_unpassed_impl_to_planned are false, so other tokens are not demoted. Set dry_run true to return would_update (planned index changes) without writing: would_update lists only rows whose status would change—tokens already at the target status are omitted (empty would_update means a no-op write path). Run after the test suite; use with tied_validate_consistency in CI.",
      inputSchema: z.object({
        passed_requirement_tokens: z
          .array(z.string())
          .optional()
          .default([])
          .describe("REQ tokens that have passing tests; status set to Implemented"),
        passed_impl_tokens: z
          .array(z.string())
          .optional()
          .default([])
          .describe("IMPL tokens that have passing tests; status set to Active"),
        set_unpassed_reqs_to_planned: z
          .boolean()
          .optional()
          .default(false)
          .describe("If true, REQs not in passed_requirement_tokens set to Planned (default false — safe)"),
        set_unpassed_impl_to_planned: z
          .boolean()
          .optional()
          .default(false)
          .describe("If true, IMPLs not in passed_impl_tokens set to Planned (default false — safe)"),
        dry_run: z
          .boolean()
          .optional()
          .default(false)
          .describe("If true, no writes; returns would_update with index/token/previous_status/next_status for each row that would change"),
        checklist_gate: z.object({
          phase: z.enum(["pre_implementation", "verification", "close_out"]),
          tracker: z.record(z.string(), z.unknown()).optional(),
          tracker_path: z.string().optional().describe(
            "Authoritative Tracker YAML path; when set, loads tracker and hydrates gate evidence like tied_checklist_gate_validate.",
          ),
          citdp: z.record(z.string(), z.unknown()),
          required_step_slugs: z.array(z.string()).optional(),
          activation: z.record(z.string(), z.unknown()).optional(),
          evidence: z.record(z.string(), z.unknown()).optional(),
        }).optional().describe("Validated shared Tracker/CITDP/activation gate; required for every workflow status update."),
        require_checklist_gate: z
          .boolean()
          .optional()
          .default(true)
          .describe("Deprecated compatibility field; checklist_gate is always required for status updates."),
        envelope_path: z.string().optional().describe(
          "Optional request-evidence-envelope.v1.json path for close-out blocking consult.",
        ),
        consult_envelope_blocking: z.boolean().optional().default(false).describe(
          "When true with envelope_path, reject verify when envelope has severity:error gaps.",
        ),
        project_root: z.string().optional().describe("Project root for envelope_path resolution."),
        receipt_persistence: z.object({
          request_token: z.string(),
          gates_dir: z.string(),
          ledger_path: z.string(),
          run_id: z.string().optional(),
          gate_receipt_ref: z.string().optional(),
          gate_receipt_hash: z.string().optional(),
          persist_gate: z.boolean().optional(),
        }).optional().describe("Persist gate decision and status mutation receipts (Stage J)."),
      }),
    },
    handler: async (args: {
      passed_requirement_tokens?: string[];
      passed_impl_tokens?: string[];
      set_unpassed_reqs_to_planned?: boolean;
      set_unpassed_impl_to_planned?: boolean;
      dry_run?: boolean;
      checklist_gate?: {
        phase: "pre_implementation" | "verification" | "close_out";
        tracker?: unknown;
        tracker_path?: string;
        citdp: unknown;
        required_step_slugs?: string[];
        activation?: unknown;
        evidence?: Record<string, unknown>;
      };
      require_checklist_gate?: boolean;
      envelope_path?: string;
      consult_envelope_blocking?: boolean;
      project_root?: string;
      receipt_persistence?: {
        request_token: string;
        gates_dir: string;
        ledger_path: string;
        run_id?: string;
        gate_receipt_ref?: string;
        gate_receipt_hash?: string;
        persist_gate?: boolean;
      };
    }) => {
      let resolvedChecklistGate: VerifyUpdateOptions["checklist_gate"];
      if (args.checklist_gate) {
        const projectRoot = args.project_root
          ? path.resolve(args.project_root)
          : path.resolve(getBasePath(), "..");
        let evidence = (args.checklist_gate.evidence ?? {}) as Record<string, unknown>;
        let tracker: Record<string, unknown>;
        if (args.checklist_gate.tracker_path) {
          const trackerAbsolute = path.isAbsolute(args.checklist_gate.tracker_path)
            ? args.checklist_gate.tracker_path
            : path.join(projectRoot, args.checklist_gate.tracker_path);
          tracker = yaml.load(fs.readFileSync(trackerAbsolute, "utf8")) as Record<string, unknown>;
          evidence = { ...evidence, trackerSource: "authoritative_file" };
        } else if (args.checklist_gate.tracker && typeof args.checklist_gate.tracker === "object") {
          tracker = args.checklist_gate.tracker as Record<string, unknown>;
        } else {
          return textContent(prettyCanonicalJson({
            ok: false,
            error: "CHECKLIST_GATE_BLOCKED: missing tracker or tracker_path",
            diagnostics: ["missing_checklist_gate"],
          }));
        }
        if (!evidence.requestToken) {
          const ee = tracker.execution_evidence;
          if (ee && typeof ee === "object" && !Array.isArray(ee)) {
            const token = (ee as Record<string, unknown>).request;
            if (typeof token === "string" && token.trim()) {
              evidence.requestToken = token.trim();
            }
          }
        }
        const hydration = await hydrateGateEvidenceFromActivation({
          phase: args.checklist_gate.phase,
          activation: args.checklist_gate.activation as never,
          evidence: evidence as never,
          projectRoot,
        });
        resolvedChecklistGate = {
          phase: args.checklist_gate.phase,
          tracker,
          citdp: args.checklist_gate.citdp,
          requiredStepSlugs: args.checklist_gate.required_step_slugs,
          activation: args.checklist_gate.activation as never,
          evidence: hydration.evidence,
        };
      }
      const result = await updateStatusFromPassedTokens({
        passed_requirement_tokens: args.passed_requirement_tokens ?? [],
        passed_impl_tokens: args.passed_impl_tokens ?? [],
        set_unpassed_reqs_to_planned: args.set_unpassed_reqs_to_planned ?? false,
        set_unpassed_impl_to_planned: args.set_unpassed_impl_to_planned ?? false,
        dry_run: args.dry_run ?? false,
        checklist_gate: resolvedChecklistGate,
        require_checklist_gate: args.require_checklist_gate ?? true,
        envelope_path: args.envelope_path,
        consult_envelope_blocking: args.consult_envelope_blocking ?? false,
        project_root: args.project_root,
        receipt_persistence: args.receipt_persistence,
      });
      return textContent(prettyCanonicalJson(result));
    },
  },
  {
    name: "tied_cycles",
    config: {
      description:
        "Detect cycles in the requirement dependency graph (related_requirements.depends_on). Returns list of cycles; resolve before using dependency order for planning ([PROC-TIED_DEPENDENCY_GRAPH]).",
      inputSchema: z.object({
        graph: z
          .enum(["requirements", "implementation"])
          .optional()
          .default("requirements")
          .describe("Which index to build the graph from"),
      }),
    },
    handler: async (args: { graph?: "requirements" | "implementation" }) => {
      const g =
        args.graph === "implementation"
          ? buildImplementationGraph()
          : buildRequirementGraph();
      const cycles = findCycles(g);
      const has_cycles = cycles.length > 0;
      return textContent(
        prettyCanonicalJson({ cycles, has_cycles, ok: !has_cycles })
      );
    },
  },
  {
    name: "tied_backlog",
    config: {
      description:
        "Backlog views from requirement dependency graph: topological order, quick-wins (roots), blockers (unmet deps), or critical (high priority) ([PROC-TIED_DEPENDENCY_GRAPH]).",
      inputSchema: z.object({
        view: z
          .enum(["order", "quick-wins", "blockers", "critical"])
          .describe("View: order = topological order (roots first), quick-wins = roots, blockers = have unmet deps, critical = P0/P1 in order"),
      }),
    },
    handler: async (args: { view: "order" | "quick-wins" | "blockers" | "critical" }) => {
      const g = buildRequirementGraph();
      const { statusByToken, priorityByToken } = getRequirementStatusAndPriority();
      if (args.view === "order") {
        const order = topologicalSort(g);
        return textContent(prettyCanonicalJson({ order, has_cycles: order.length === 0 && g.size > 0 }));
      }
      const kind =
        args.view === "quick-wins"
          ? "quick-wins"
          : args.view === "blockers"
            ? "blockers"
            : "critical";
      const tokens = getBacklogView(g, kind, { statusByToken, priorityByToken });
      return textContent(prettyCanonicalJson({ view: args.view, tokens }));
    },
  },
  {
    name: "requirement_list_state_guide",
    config: {
      description:
        "Client-supplied requirement list in array order. First call MUST pass non-empty requirements; omit current_state. Later calls: current_state = continuation_state from prior response only. Presents one requirement record per step until id end_requirement_list (is_end) or error. For each item, follow the agent REQ checklist in documentation (e.g. agent-req-implementation-checklist.md, session-bootstrap–traceable-commit) and strict TDD. Terminal: id end_requirement_list. Error: empty list, bad token, validation failure.",
      inputSchema: z.object({
        requirements: z
          .array(z.unknown())
          .optional()
          .describe(
            "Requirement objects in walk order. Required on first call when current_state is omitted or empty."
          ),
        current_state: z
          .string()
          .optional()
          .describe(
            "Opaque continuation from the previous response (continuation_state). When set, requirements is ignored."
          ),
      }),
    },
    handler: async (args: { requirements?: unknown[]; current_state?: string }) => {
      const next = resolveRequirementListStateGuide(args);
      return textContent(prettyCanonicalJson(next));
    },
  },
  {
    name: "tied_scoped_analysis_run",
    config: {
      description:
        "Run scoped TIED analysis over explicit roots while excluding ignored paths via gitignore-style patterns. Returns an effective summary (roots used, ignore source, skipped paths count) plus optional token discovery, registry gap report, traceability gap report (REQ↔tests, REQ↔production markers, optional IMPL↔tests), or impact preview.",
      inputSchema: z.object({
        mode: z
          .enum([
            "walk_summary",
            "token_scan",
            "gap_report",
            "impact_preview",
            "traceability_gap_report",
          ])
          .optional()
          .describe(
            "What to compute: walk_summary, token_scan, gap_report (tokens in scan but not in semantic-tokens), impact_preview, or traceability_gap_report (index REQ/IMPL vs scoped tests/production markers; see .tiedanalysis.yaml traceability_gap)."
          ),
        roots: z
          .array(z.string())
          .optional()
          .describe("Explicit analysis roots. If omitted, uses config/default roots. If provided as an empty array, falls back to default roots."),
        config_path: z
          .string()
          .optional()
          .describe("Path to .tiedanalysis.yaml (cwd-relative unless absolute). Default: .tiedanalysis.yaml"),
        ignore_file: z
          .string()
          .optional()
          .describe("Path to .tiedignore (cwd-relative unless absolute). Default: .tiedignore"),
        ignore_patterns: z
          .array(z.string())
          .optional()
          .describe("Inline gitignore-style patterns appended to ignore file patterns."),
        follow_symlinks: z
          .boolean()
          .optional()
          .describe("If false, skip symlinked roots/entries; if true, follow symlinks."),
        include_extensions: z
          .array(z.string())
          .optional()
          .describe("Token scan file extensions to include, e.g. [.ts, .md]."),
        max_file_bytes: z
          .number()
          .optional()
          .describe("Max bytes per file to scan for tokens."),
        max_files: z
          .number()
          .optional()
          .describe("Max number of eligible files to scan for tokens."),
        traceability_strict: z
          .boolean()
          .optional()
          .describe(
            "When mode is traceability_gap_report: if true, exit_policy.suggested_exit_code is 1 when any traceability dimension reports gaps (overrides traceability_gap.strict from config)."
          ),
        traceability_requirement_tokens: z
          .array(z.string())
          .optional()
          .describe(
            "Optional explicit REQ-* token list to evaluate (traceability_gap_report only). When set and non-empty, only these tokens are checked for traceability dimensions."
          ),
        traceability_implementation_tokens: z
          .array(z.string())
          .optional()
          .describe(
            "Optional explicit IMPL-* token list to evaluate (traceability_gap_report only). When set and non-empty, only these tokens are checked for traceability dimensions."
          ),
      }),
    },
    handler: async (args: any) => {
      try {
        const result = runScopedAnalysis(args);
        return textContent(prettyCanonicalJson(result));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return textContent(prettyCanonicalJson({ ok: false, error: msg }));
      }
    },
  },
  {
    name: "tied_vocabulary_explorer_run",
    config: {
      description:
        "Run read-only vocabulary explorer over scoped roots and merged TIED indexes. Returns vocabulary-explorer.v1 envelope JSON and optional offline HTML. Does not mutate TIED YAML or invoke write tools.",
      inputSchema: z.object({
        roots: z
          .array(z.string())
          .optional()
          .describe("Explicit analysis roots. If omitted, uses .tiedanalysis.yaml defaults."),
        config_path: z
          .string()
          .optional()
          .describe("Path to .tiedanalysis.yaml (cwd-relative unless absolute). Default: .tiedanalysis.yaml"),
        min_frequency: z
          .number()
          .optional()
          .describe("Minimum distinct files/scopes for source identifiers (default 2). TIED tokens bypass."),
        max_terms: z.number().optional().describe("Maximum terms after deterministic truncation (default 10000)."),
        include_extensions: z
          .array(z.string())
          .optional()
          .describe("File extensions to include, e.g. [.ts, .md]."),
        identifier_mode: z
          .enum(["ast", "lexical"])
          .optional()
          .describe("Source identifier extraction: ast (JS/TS compiler API) or lexical heuristic (default ast)."),
        include_html: z
          .boolean()
          .optional()
          .describe("Include rendered offline HTML string in the JSON response (default false)."),
        out_html_path: z
          .string()
          .optional()
          .describe("Optional path to write the HTML artifact (cwd-relative unless absolute)."),
        emit_json_path: z
          .string()
          .optional()
          .describe("Optional path to write the envelope JSON (cwd-relative unless absolute)."),
      }),
    },
    handler: async (args: {
      roots?: string[];
      config_path?: string;
      min_frequency?: number;
      max_terms?: number;
      include_extensions?: string[];
      identifier_mode?: "ast" | "lexical";
      include_html?: boolean;
      out_html_path?: string;
      emit_json_path?: string;
    }) => {
      try {
        const result = runVocabularyExplorer({
          config_path: args.config_path,
          roots: args.roots,
          min_frequency: args.min_frequency,
          max_terms: args.max_terms,
          include_extensions: args.include_extensions,
          identifier_mode: args.identifier_mode,
        });
        if (!result.ok) {
          return textContent(prettyCanonicalJson({ ok: false, error: result.error ?? "unknown" }));
        }
        const payload: Record<string, unknown> = {
          ok: true,
          envelope: result.envelope,
        };
        if (args.include_html) payload.html = result.html;
        if (args.out_html_path && result.html) {
          const outAbs = path.isAbsolute(args.out_html_path)
            ? args.out_html_path
            : path.resolve(process.cwd(), args.out_html_path);
          fs.writeFileSync(outAbs, result.html, "utf8");
          payload.out_html_path = outAbs;
        }
        if (args.emit_json_path && result.envelope) {
          const jsonAbs = path.isAbsolute(args.emit_json_path)
            ? args.emit_json_path
            : path.resolve(process.cwd(), args.emit_json_path);
          fs.writeFileSync(jsonAbs, safeStringifyJson(result.envelope), "utf8");
          payload.emit_json_path = jsonAbs;
        }
        return textContent(prettyCanonicalJson(payload));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return textContent(prettyCanonicalJson({ ok: false, error: msg }));
      }
    },
  },
  {
    name: "tied_adversarial_inquiry_run",
    config: {
      description:
        "Run [REQ-TIED_ADVERSARIAL_INQUIRY] read-only obligation, bidirectional fidelity, and scoped status analysis. Generated reports never mutate canonical TIED YAML; unresolved evidence cannot become PASS.",
      inputSchema: z.object({
        mode: z.enum(["project"]).optional().describe("When project, dispatch Mode B project-input inquiry through the validated orchestrator."),
        project_root: z.string().optional().describe("Absolute project root for Mode B."),
        tied_base_path: z.string().optional().describe("Optional tied/ directory override for Mode B; must remain under project_root."),
        impl_token: z.string().optional().describe("IMPL token for Mode B scope selection."),
        test_path: z.string().optional().describe("Repository-relative Ruby Minitest (.rb) or Go (_test.go) path for Mode B."),
        production_path: z.string().optional().describe("Repository-relative Ruby or Go production source path for Mode B."),
        production_evidence_path: z.string().optional().describe("Relative production evidence JSON path for Mode B."),
        production_evidence: z.array(z.record(z.string(), z.unknown())).optional().describe("Inline production evidence observations for Mode B."),
        criterion_scope: z.array(z.string()).optional().describe("Optional criterion token subset for Mode B."),
        block_scope: z.array(z.string()).optional().describe("Optional procedure names for Mode B multi-block close_out; supports #closeout tag suffix."),
        graph: z.record(z.string(), z.unknown()).optional().describe("Language-neutral obligation graph input with criteria, constraints, blocks, loci, and bindings."),
        fidelity: z.record(z.string(), z.unknown()).optional().describe("Normalized fidelity input with block revision, specification, test evidence, and production evidence."),
        scope: z.array(z.string()).optional().describe("Explicit obligation IDs to project."),
        eligibility: z.record(z.string(), z.unknown()).optional().describe("Optional strict eligibility result; omit for non-strict research projection."),
        policy: z.enum(["advisory", "strict-candidate", "strict-approved"]).optional().describe("Explicit gate policy; advisory is the default."),
        human_approval: z.record(z.string(), z.unknown()).optional().describe("Human CITDP approval required for strict-approved blocking."),
        repository_root: z.string().optional().describe("Repository root for bounded working artifact persistence."),
        request_token: z.string().optional().describe("REQ token selecting working/{REQ-TOKEN}/adversarial-inquiry."),
        run_id: z.string().optional().describe("Identity-bound inquiry run identifier for activation pairing."),
        phase: z.enum(["pre_implementation", "verification", "close_out", "post_test"]).optional().describe("Checklist gate phase or mid-TDD post_test for activation pairing."),
        provenance: z.unknown().optional().describe("Evidence provenance to persist outside canonical TIED YAML."),
        redact: z.array(z.string()).optional().describe("Sensitive values to redact from generated artifacts."),
      }),
    },
    handler: async (args: {
      mode?: "project";
      project_root?: string;
      tied_base_path?: string;
      impl_token?: string;
      test_path?: string;
      production_path?: string;
      production_evidence_path?: string;
      production_evidence?: Record<string, unknown>[];
      criterion_scope?: string[];
      block_scope?: string[];
      graph?: Record<string, unknown>;
      fidelity?: Record<string, unknown>;
      scope?: string[];
      eligibility?: Record<string, unknown>;
      policy?: GatePolicy;
      human_approval?: Record<string, unknown>;
      repository_root?: string;
      request_token?: string;
      run_id?: string;
      phase?: InquiryActivation["phase"];
      provenance?: unknown;
      redact?: string[];
    }) => {
      try {
        if (args.mode === "project") {
          const projectArgs = args as ModeBInput & {
            run_id?: string;
            phase?: InquiryActivation["phase"];
          };
          const activation = projectArgs.activation
            ?? normalizeInquiryActivation(projectArgs.run_id, projectArgs.phase);
          const result = await runProjectInquiry({
            ...projectArgs,
            activation,
          });
          return textContent(prettyCanonicalJson(result));
        }
        if (!args.graph || !args.fidelity || !args.scope?.length) {
          throw new Error("graph, fidelity, and non-empty scope are required unless mode is project.");
        }
        const result = await runChecklistInquiry({
          graph: args.graph as ChecklistInquiryInput["graph"],
          fidelity: args.fidelity as ChecklistInquiryInput["fidelity"],
          scope: args.scope,
          eligibility: args.eligibility as ChecklistInquiryInput["eligibility"],
          policy: args.policy,
          humanApproval: args.human_approval as unknown as HumanStrictApproval | undefined,
          repositoryRoot: args.repository_root,
          requestToken: args.request_token,
          activation: normalizeInquiryActivation(args.run_id, args.phase),
          provenance: args.provenance,
          redact: args.redact,
        });
        return textContent(prettyCanonicalJson(result));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return textContent(prettyCanonicalJson({ ok: false, error: msg }));
      }
    },
  },
  {
    name: "tied_claims_evidence_review_run",
    config: {
      description:
        "Run [REQ-TIED_CLAIMS_EVIDENCE_REVIEW] read-only claims and evidence review on a frozen claim surface with static_only execution policy. Never mutates audited project YAML.",
      inputSchema: z.object({
        tied_base_path: z.string().describe("Absolute path to tied/ directory."),
        project_root: z.string().optional().describe("Audited project root; defaults to parent of tied_base_path."),
        request_token: z.string().optional().describe("REQ scope token; defaults to REQ-TIED_CLAIMS_EVIDENCE_REVIEW."),
        claim_surface_path: z.string().optional().describe("Optional frozen claim-surface.v1.json path within fixture boundary."),
        fixture_root: z.string().optional().describe("Fixture root containing claim-surface.v1.json and evidence-stubs.json."),
        output_dir: z.string().describe("Output directory under working/.../claims-evidence-review/."),
        execution_policy: z.enum(["static_only"]).optional().describe("Execution policy; slice 1 supports static_only only."),
        run_id: z.string().optional().describe("Run identifier for provenance."),
      }),
    },
    handler: async (args: {
      tied_base_path: string;
      project_root?: string;
      request_token?: string;
      claim_surface_path?: string;
      fixture_root?: string;
      output_dir: string;
      execution_policy?: "static_only";
      run_id?: string;
    }) => {
      try {
        const result = await runClaimsEvidenceReviewMcp(args);
        return textContent(prettyCanonicalJson(result));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return textContent(prettyCanonicalJson({ ok: false, error: msg }));
      }
    },
  },
  {
    name: "tied_checklist_gate_validate",
    config: {
      description:
        "Validate [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] Tracker, CITDP adversarial depth, and optional identity-bound activation evidence before workflow progression. This is read-only and fails closed on missing or stale evidence.",
      inputSchema: z.object({
        phase: z.enum(["pre_implementation", "verification", "close_out"]),
        tracker: z.record(z.string(), z.unknown()).optional(),
        citdp: z.record(z.string(), z.unknown()),
        required_step_slugs: z.array(z.string()).optional(),
        activation: z.record(z.string(), z.unknown()).optional(),
        evidence: z.record(z.string(), z.unknown()).optional(),
        tracker_path: z.string().optional().describe(
          "Authoritative Tracker YAML path; when set, loads tracker and marks trackerSource authoritative_file.",
        ),
        project_root: z.string().optional().describe("Project root for tracker_path and evidence hydration."),
        receipt_persistence: z.object({
          request_token: z.string(),
          gates_dir: z.string(),
          ledger_path: z.string(),
          run_id: z.string().optional(),
        }).optional().describe("Persist gate decision receipt with input Tracker/CITDP hashes (Stage J)."),
      }),
    },
    handler: async (args: {
      phase: "pre_implementation" | "verification" | "close_out";
      tracker?: Record<string, unknown>;
      citdp: Record<string, unknown>;
      required_step_slugs?: string[];
      activation?: Record<string, unknown>;
      evidence?: Record<string, unknown>;
      tracker_path?: string;
      project_root?: string;
      receipt_persistence?: {
        request_token: string;
        gates_dir: string;
        ledger_path: string;
        run_id?: string;
      };
    }) => {
      try {
        const projectRoot = args.project_root
          ? path.resolve(args.project_root)
          : path.resolve(getBasePath(), "..");
        let evidence = (args.evidence ?? {}) as Record<string, unknown>;
        let tracker: Record<string, unknown>;
        if (args.tracker_path) {
          const trackerAbsolute = path.isAbsolute(args.tracker_path)
            ? args.tracker_path
            : path.join(projectRoot, args.tracker_path);
          tracker = yaml.load(fs.readFileSync(trackerAbsolute, "utf8")) as Record<string, unknown>;
          evidence = { ...evidence, trackerSource: "authoritative_file" };
        } else if (args.tracker) {
          tracker = args.tracker;
        } else {
          return textContent(prettyCanonicalJson({ ok: false, error: "missing tracker or tracker_path" }));
        }
        if (!evidence.requestToken) {
          const ee = tracker.execution_evidence;
          if (ee && typeof ee === "object" && !Array.isArray(ee)) {
            const token = (ee as Record<string, unknown>).request;
            if (typeof token === "string" && token.trim()) {
              evidence.requestToken = token.trim();
            }
          }
        }
        const hydration = await hydrateGateEvidenceFromActivation({
          phase: args.phase,
          activation: args.activation as never,
          evidence: evidence as never,
          projectRoot,
        });
        const preGateReject = await hookChecklistGateEvidenceSufficiencyPreGate({
          projectRoot,
          phase: args.phase,
          tracker,
          citdp: args.citdp,
          requiredStepSlugs: args.required_step_slugs,
        });
        if (preGateReject) {
          return textContent(prettyCanonicalJson({
            ...preGateReject,
            ...(hydration.hydrated.length > 0 ? { evidence_hydrated: hydration.hydrated } : {}),
            ...(hydration.diagnostics.length > 0 ? { hydration_diagnostics: hydration.diagnostics } : {}),
          }));
        }
        const result = validateChecklistGate({
          phase: args.phase,
          tracker,
          citdp: args.citdp,
          requiredStepSlugs: args.required_step_slugs,
          activation: args.activation as never,
          evidence: hydration.evidence,
        });
        let gateReceipt: { path: string; hash: string } | undefined;
        if (args.receipt_persistence) {
          const persisted = persistGateDecisionReceipt({
            gateResult: result,
            phase: args.phase,
            tracker,
            citdp: args.citdp,
            gatesDir: args.receipt_persistence.gates_dir,
            ledgerPath: args.receipt_persistence.ledger_path,
            requestToken: args.receipt_persistence.request_token,
            projectRoot,
            runId: args.receipt_persistence.run_id,
          });
          if (!persisted.ok) {
            return textContent(prettyCanonicalJson({
              ...result,
              gate_receipt_error: persisted.error,
              diagnostics: [...result.diagnostics, ...persisted.diagnostics],
            }));
          }
          gateReceipt = { path: persisted.path, hash: persisted.hash };
        }
        return textContent(prettyCanonicalJson({
          ...result,
          ...(hydration.hydrated.length > 0 ? { evidence_hydrated: hydration.hydrated } : {}),
          ...(hydration.diagnostics.length > 0 ? { hydration_diagnostics: hydration.diagnostics } : {}),
          ...(gateReceipt ? { gate_receipt: gateReceipt } : {}),
        }));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return textContent(prettyCanonicalJson({ ok: false, error: msg }));
      }
    },
  },
  {
    name: "tied_gate_check",
    config: {
      description:
        "[REQ-TIED_DAE_INCORPORATION] Compose tied_checklist_gate_validate with Tracker/CITDP paths (same algorithm as `tied gate check` CLI). Returns allowed, exit_code, receipt_path, and reasons.",
      inputSchema: z.object({
        request_token: z.string().describe("REQ token for default working/ and tied-project/citdp/ paths."),
        phase: z.enum(["pre_implementation", "verification", "close_out"]),
        slug: z.string().optional().describe("When set, prior tracker steps must be terminal."),
        tracker_path: z.string().optional(),
        citdp_path: z.string().optional(),
        project_root: z.string().optional().describe("Client repo root; defaults to parent of TIED_BASE_PATH."),
        check_branch: z.boolean().optional().describe("Hard-fail when git branch mismatches CITDP/Tracker (W2a)."),
      }),
    },
    handler: async (args: {
      request_token: string;
      phase: "pre_implementation" | "verification" | "close_out";
      slug?: string;
      tracker_path?: string;
      citdp_path?: string;
      project_root?: string;
      check_branch?: boolean;
    }) => {
      try {
        const projectRoot = args.project_root
          ? path.resolve(args.project_root)
          : path.resolve(getBasePath(), "..");
        const requestToken = args.request_token.trim();
        if (!requestToken) {
          return textContent(
            prettyCanonicalJson({
              allowed: false,
              exit_code: 2,
              receipt_path: null,
              reasons: ["missing_request_token"],
            }),
          );
        }
        const defaults = defaultPathsForRequest(
          projectRoot,
          requestToken,
          args.tracker_path,
          args.citdp_path,
        );
        let callGateValidate;
        try {
          callGateValidate = createMcpGateValidateFn();
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          return textContent(
            prettyCanonicalJson({
              allowed: false,
              exit_code: 2,
              receipt_path: null,
              reasons: [msg],
            }),
          );
        }
        const summary = await runGateCheckComposition({
          requestToken,
          phase: args.phase,
          slug: args.slug,
          trackerPath: defaults.trackerPath,
          citdpPath: defaults.citdpPath,
          projectRoot,
          checkBranch: args.check_branch === true,
          callGateValidate,
        });
        return textContent(
          prettyCanonicalJson({
            allowed: summary.allowed,
            exit_code: summary.exit_code,
            receipt_path: summary.receipt_path ?? null,
            reasons: summary.reasons,
          }),
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return textContent(
          prettyCanonicalJson({
            allowed: false,
            exit_code: 2,
            receipt_path: null,
            reasons: [msg],
          }),
        );
      }
    },
  },
  {
    name: "tied_adherence_reconcile_run",
    config: {
      description:
        "Run read-only [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] adherence chain reconciliation via Go subprocess. Returns ReconcileReport JSON; never mutates Tracker or TIED YAML.",
      inputSchema: z.object({
        ledger_path: z.string().describe("Path to agent-adherence-event.v1 JSONL ledger."),
        tracker_path: z.string().describe("Path to Authoritative Tracker YAML."),
        gates_dir: z.string().describe("Directory containing checklist-gate-receipt.v1 JSON files."),
        workspace: z.string().optional().describe("Repository workspace root; defaults to process.cwd()."),
        citdp_path: z.string().optional().describe("Optional CITDP YAML path for gate hash correlation."),
        requirements_index: z.string().optional().describe("Optional requirements.yaml path; defaults from TIED_BASE_PATH."),
        implementation_index: z.string().optional().describe("Optional implementation-decisions.yaml path."),
        include_process_grade: z.boolean().optional().describe(
          "When true, attach process_grade summary (Wave 5 W5-D11) to ReconcileReport.",
        ),
      }),
    },
    handler: async (args: {
      ledger_path: string;
      tracker_path: string;
      gates_dir: string;
      workspace?: string;
      citdp_path?: string;
      requirements_index?: string;
      implementation_index?: string;
      include_process_grade?: boolean;
    }) => {
      try {
        const workspace = args.workspace?.trim() || process.cwd();
        const result = await runAdherenceReconcile({
          ledger_path: args.ledger_path,
          tracker_path: args.tracker_path,
          gates_dir: args.gates_dir,
          workspace,
          citdp_path: args.citdp_path,
          include_process_grade: args.include_process_grade,
          requirements_index: args.requirements_index?.trim() || undefined,
          implementation_index: args.implementation_index?.trim() || undefined,
        });
        return textContent(prettyCanonicalJson(result));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return textContent(prettyCanonicalJson({ ok: false, error: msg }));
      }
    },
  },
  {
    name: "tied_checklist_activation_collect",
    config: {
      description:
        "Assemble [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] activation evidence from persisted phase artifacts under working/{REQ-TOKEN}/adversarial-inquiry/phase-{phase}/. Read-only; fails closed on missing files, hash or run_id mismatch, or wrong phase directory.",
      inputSchema: z.object({
        request_token: z.string().describe("REQ token whose working adversarial-inquiry artifacts to read."),
        phase: z.enum(["pre_implementation", "verification", "close_out"]),
        run_id: z.string().describe("Identity-bound inquiry run identifier that must match on-disk provenance."),
        project_root: z.string().optional().describe("Repository root containing working/{REQ-TOKEN}/; defaults to client project root."),
        metrics_path: z.string().optional().describe("Optional MCP metrics JSONL for supporting tied_adversarial_inquiry_run provenance lookup."),
      }),
    },
    handler: async (args: {
      request_token: string;
      phase: InquiryActivation["phase"];
      run_id: string;
      project_root?: string;
      metrics_path?: string;
    }) => {
      try {
        const result = await collectChecklistActivation({
          requestToken: args.request_token,
          phase: args.phase,
          runId: args.run_id,
          projectRoot: args.project_root,
          metricsPath: args.metrics_path,
        });
        return textContent(prettyCanonicalJson(result));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return textContent(prettyCanonicalJson({ ok: false, error: msg }));
      }
    },
  },
  {
    name: "test_adequacy_validate",
    config: {
      description:
        "Validate risk-triggered advanced test adequacy and external-call cost controls. Requires selected profiles and explicit replay, flakiness, timeout, retry, and resource behavior fields when applicable; does not run the checks.",
      inputSchema: z.object({
        selected_profiles: z.array(z.string()),
        checks: z.array(z.record(z.string(), z.unknown())),
      }),
    },
    handler: async (args: Parameters<typeof validateTestAdequacyPlan>[0]) => {
      return textContent(prettyCanonicalJson(validateTestAdequacyPlan(args)));
    },
  },
  {
    name: "quality_evidence_manifest_build",
    config: {
      description:
        "Build a deterministic machine-derived verification evidence manifest. Records command results, quality-matrix outcomes, covered tokens, and proof boundaries; human waiver and residual-risk decisions remain separate.",
      inputSchema: z.object({
        run_id: z.string(),
        commit: z.string(),
        environment: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])),
        command_results: z.array(
          z.object({
            id: z.string(),
            command: z.union([z.string(), z.array(z.string())]),
            cwd: z.string(),
            exit_code: z.number().int(),
            result: z.enum(["passed", "failed"]),
            duration_ms: z.number().optional(),
            threshold: z.string().optional(),
            artifacts: z.array(z.string()).optional(),
            diagnostics: z.array(z.string()).optional(),
            tool_versions: z.record(z.string(), z.string()).optional(),
          }),
        ),
        quality_rows: z.array(
          z.object({
            id: z.string(),
            attribute: z.string(),
            applicability: z.enum(["applicable", "not_applicable", "accepted_risk"]),
            rationale: z.string(),
            risk: z.string().optional(),
            evidence_method: z.string(),
            command_or_test: z.string().optional(),
            threshold: z.string().optional(),
            result: z.enum(["passed", "failed", "skipped", "pending", "not_applicable"]),
            owner: z.string().optional(),
            limitation: z.string().optional(),
            waiver: z
              .object({
                required: z.boolean(),
                reason: z.string().optional(),
                owner: z.string().optional(),
                expiry: z.string().optional(),
              })
              .optional(),
          }),
        ),
        covered_tokens: z.array(z.string()),
        proof_boundaries: z.array(z.string()),
        decision_references: z.array(z.string()).optional(),
      }),
    },
    handler: async (args: Record<string, unknown>) => {
      try {
        const manifest = buildVerificationEvidenceManifest(args as unknown as VerificationEvidenceInput);
        return textContent(prettyCanonicalJson(manifest));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return textContent(prettyCanonicalJson({ ok: false, error: msg }));
      }
    },
  },
  {
    name: "quality_evidence_collect",
    config: {
      description:
        "Execute declared argv-only quality commands with timeout and output limits, write stdout/stderr artifacts, and return normalized command results for quality_evidence_manifest_build.",
      inputSchema: z.object({
        commands: z.array(
          z.object({
            id: z.string().min(1),
            argv: z.array(z.string()).min(1),
            cwd: z.string().min(1),
            environment: z.record(z.string(), z.string()).optional(),
            timeout_ms: z.number().int().positive().optional(),
            max_output_bytes: z.number().int().positive().optional(),
            artifact_dir: z.string().min(1),
            threshold: z.string().optional(),
            tool_version_argv: z.array(z.string()).min(1).optional(),
            tool_version_name: z.string().optional(),
          }),
        ),
        default_timeout_ms: z.number().int().positive().optional(),
        default_max_output_bytes: z.number().int().positive().optional(),
      }),
    },
    handler: async (args: QualityCommandRunnerInput) => {
      try {
        const results = await runDeclaredQualityCommands(args);
        return textContent(prettyCanonicalJson({ ok: true, command_results: results }));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return textContent(prettyCanonicalJson({ ok: false, error: msg }));
      }
    },
  },
  {
    name: "quality_security_profile_validate",
    config: {
      description:
        "Validate executable evidence or rationale-owner-expiry waivers for external-input security abuse cases. This checks plan completeness only.",
      inputSchema: z.object({
        selected_profiles: z.array(z.string()),
        evidence_rows: z.array(
          z.object({
            abuse_case: z.string(),
            command_or_test: z.string().optional(),
            result: z.enum(["passed", "waived"]).optional(),
            waiver: z
              .object({
                reason: z.string().optional(),
                owner: z.string().optional(),
                expiry: z.string().optional(),
              })
              .optional(),
          }),
        ),
      }),
    },
    handler: async (args: SecurityProfileInput) => {
      return textContent(prettyCanonicalJson(validateSecurityProfile(args)));
    },
  },
  {
    name: "quality_evidence_collect_manifest",
    config: {
      description:
        "Execute declared argv-only quality commands and build verification-evidence-manifest.v1 from observed results. Human decisions remain separate.",
      inputSchema: z.object({
        run_id: z.string(),
        commit: z.string(),
        environment: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])),
        commands: z.array(
          z.object({
            id: z.string().min(1),
            argv: z.array(z.string()).min(1),
            cwd: z.string().min(1),
            environment: z.record(z.string(), z.string()).optional(),
            timeout_ms: z.number().int().positive().optional(),
            max_output_bytes: z.number().int().positive().optional(),
            artifact_dir: z.string().min(1),
            threshold: z.string().optional(),
            tool_version_argv: z.array(z.string()).min(1).optional(),
            tool_version_name: z.string().optional(),
          }),
        ),
        default_timeout_ms: z.number().int().positive().optional(),
        default_max_output_bytes: z.number().int().positive().optional(),
        quality_rows: z.array(
          z.object({
            id: z.string(),
            attribute: z.string(),
            applicability: z.enum(["applicable", "not_applicable", "accepted_risk"]),
            rationale: z.string(),
            risk: z.string().optional(),
            evidence_method: z.string(),
            command_or_test: z.string().optional(),
            threshold: z.string().optional(),
            result: z.enum(["passed", "failed", "skipped", "pending", "not_applicable"]),
            owner: z.string().optional(),
            limitation: z.string().optional(),
            waiver: z
              .object({
                required: z.boolean(),
                reason: z.string().optional(),
                owner: z.string().optional(),
                expiry: z.string().optional(),
              })
              .optional(),
          }),
        ),
        covered_tokens: z.array(z.string()),
        proof_boundaries: z.array(z.string()),
        decision_references: z.array(z.string()).optional(),
        envelope_patch: z
          .object({
            request_token: z.string(),
            project_root: z.string(),
            manifest_relative_path: z.string(),
          })
          .optional(),
        diff_scoped_crap_hook: z
          .object({
            request_token: z.string(),
            project_root: z.string(),
            citdp_path: z.string().optional(),
            diff_paths: z.array(z.string()).optional(),
            coverage_by_path: z.record(z.string(), z.number()).optional(),
            diff_selection: z.enum(["staged", "unstaged", "both"]).optional(),
          })
          .optional(),
      }),
    },
    handler: async (args: QualityEvidenceCollectionInput) => {
      try {
        const { manifest, diff_scoped_crap_hook } = await collectVerificationEvidence(args);
        const payload = diff_scoped_crap_hook
          ? { ...manifest, diff_scoped_crap_hook }
          : manifest;
        return textContent(prettyCanonicalJson(payload));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return textContent(prettyCanonicalJson({ ok: false, error: msg }));
      }
    },
  },
  {
    name: "evidence_chain_profile_generate",
    config: {
      description:
        "Generate a read-only evidence-chain-profile.v1 for one TIED client. Depth-gated: integrated collects structural and quality partitions only; human_research also composes fidelity and binding adapters. Never mutates project YAML, never appends findings, and never promotes cases.",
      inputSchema: z.object({
        project_root: z.string().optional(),
        tied_base_path: z.string().optional(),
        profile_depth: z.enum(["integrated", "human_research"]),
        output_mode: z.enum(["json", "file"]).optional(),
        output_path: z.string().optional(),
        scope: z
          .object({
            requirement_tokens: z.array(z.string()).optional(),
            architecture_tokens: z.array(z.string()).optional(),
            implementation_tokens: z.array(z.string()).optional(),
            impl_tokens_for_pseudocode: z.array(z.string()).optional(),
            binding_rows: z.array(z.record(z.string(), z.unknown())).optional(),
            quality_plan: z
              .object({
                selected_profiles: z.array(z.string()),
                checks: z.array(z.record(z.string(), z.unknown())),
              })
              .optional(),
          })
          .optional(),
        run_metadata: z
          .object({
            run_id: z.string().optional(),
            commit: z.string().optional(),
            environment: z.record(z.string(), z.unknown()).optional(),
          })
          .optional(),
        change_context: z
          .object({
            change_id: z.string().optional(),
            citdp_token: z.string().optional(),
          })
          .optional(),
        config_path: z.string().optional(),
        ignore_file: z.string().optional(),
        roots: z.array(z.string()).optional(),
        manifest_reference: z.string().optional(),
        invoke_structural_validators: z
          .boolean()
          .optional()
          .describe(
            "When true, run live structural validators internally and attach results so structural rows become observed. Default false preserves backward-compatible not_measured structural rows.",
          ),
        invoke_pseudocode_analyze: z
          .boolean()
          .optional()
          .describe(
            "When true with invoke_structural_validators, attach pseudocode_analyze structural rows for scoped IMPL tokens. Default false preserves backward-compatible structural output.",
          ),
      }),
    },
    handler: async (args: {
      project_root?: string;
      tied_base_path?: string;
      profile_depth: "integrated" | "human_research";
      output_mode?: "json" | "file";
      output_path?: string;
      scope?: {
        requirement_tokens?: string[];
        architecture_tokens?: string[];
        implementation_tokens?: string[];
        impl_tokens_for_pseudocode?: string[];
        binding_rows?: Record<string, unknown>[];
        quality_plan?: { selected_profiles: string[]; checks: Record<string, unknown>[] };
      };
      run_metadata?: { run_id?: string; commit?: string; environment?: Record<string, unknown> };
      change_context?: { change_id?: string; citdp_token?: string };
      config_path?: string;
      ignore_file?: string;
      roots?: string[];
      manifest_reference?: string;
      invoke_structural_validators?: boolean;
      invoke_pseudocode_analyze?: boolean;
    }) => {
      try {
        const confirmed = getBasePath();
        const projectRoot = args.project_root ?? path.resolve(confirmed, "..");
        const tiedBasePath = args.tied_base_path ?? confirmed;
        const structuralValidators = args.invoke_structural_validators
          ? (() => {
              const validators = createLiveStructuralValidators({
                requirement_tokens: args.scope?.requirement_tokens,
                architecture_tokens: args.scope?.architecture_tokens,
                implementation_tokens: args.scope?.implementation_tokens,
                impl_tokens_for_pseudocode: args.scope?.impl_tokens_for_pseudocode,
                binding_rows: args.scope?.binding_rows,
                quality_plan: args.scope?.quality_plan,
                config_path: args.config_path,
                ignore_file: args.ignore_file,
                roots: args.roots,
              });
              if (!args.invoke_pseudocode_analyze) {
                const { pseudocodeAnalyze: _omit, ...withoutAnalyze } = validators;
                return withoutAnalyze;
              }
              return validators;
            })()
          : undefined;
        const result = generateEvidenceChainProfile({
          project_root: projectRoot,
          tied_base_path: tiedBasePath,
          confirmed_tied_base_path: confirmed,
          profile_depth: args.profile_depth,
          output_mode: args.output_mode,
          output_path: args.output_path,
          scope: args.scope,
          run_metadata: args.run_metadata,
          change_context: args.change_context,
          config_path: args.config_path,
          ignore_file: args.ignore_file,
          roots: args.roots,
          manifest_reference: args.manifest_reference,
          structural_validators: structuralValidators,
        });
        return textContent(prettyCanonicalJson(result));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return textContent(prettyCanonicalJson({ ok: false, stage: "handler", error: msg }));
      }
    },
  },
  {
    name: "pseudocode_validate",
    config: {
      description:
        "Run Layer B structural pseudo-code validation: source-located diagnostics, contract shape, symbol closure, dependency graph, token linkage, and optional behavioral coverage references. Does not claim runtime behavior coverage.",
      inputSchema: z.object({
        token: z.string(),
        pseudocode: z.string().optional(),
        essence_pseudocode_path: z.string().optional(),
        pseudocode_path: z
          .string()
          .optional()
          .describe("Ergonomic alias for essence_pseudocode_path on pseudocode_validate only."),
        known_tokens: z.array(z.string()).optional(),
        require_contracts: z.boolean().optional(),
        require_behavioral_coverage: z.boolean().optional(),
        coverage_references: z.record(z.string(), z.array(z.string())).optional(),
        leakage_lint: z.boolean().optional(),
        gate_mode: z.boolean().optional(),
      }),
    },
    handler: async (args: Parameters<typeof validateEssencePseudocode>[0] & {
      essence_pseudocode_path?: string;
      pseudocode_path?: string;
    }) => {
      const resolved = resolveEssencePseudocodeSource(getBasePath(), args);
      if (!resolved.ok) {
        return textContent(
          prettyCanonicalJson({ ok: false, stage: "input", error: resolved.error }),
        );
      }
      return textContent(
        prettyCanonicalJson(validateEssencePseudocode({ ...args, pseudocode: resolved.content })),
      );
    },
  },
  {
    name: "pseudocode_analyze",
    config: {
      description:
        "Run contract-aware static analysis on essence_pseudocode: parser/IR, symbols, CFG, call graph, bounded abstract analysis, obligations, and traceability projections. Read-only; does not mutate TIED YAML. Schema: pseudocode-analysis-report.v1.",
      inputSchema: z.object({
        token: z.string(),
        pseudocode: z.string().optional(),
        essence_pseudocode_path: z.string().optional(),
        known_tokens: z.array(z.string()).optional(),
        analyses: z
          .array(
            z.enum([
              "parse",
              "symbols",
              "cfg",
              "call_graph",
              "abstract",
              "obligations",
              "traceability",
            ]),
          )
          .optional(),
        budgets: z
          .object({
            max_parse_nodes: z.number().optional(),
            max_procedures: z.number().optional(),
            max_cfg_blocks_per_procedure: z.number().optional(),
            max_call_graph_edges: z.number().optional(),
            max_fixed_point_iterations: z.number().optional(),
            max_path_conditions: z.number().optional(),
            max_report_diagnostics: z.number().optional(),
            max_source_bytes: z.number().optional(),
            max_cfg_join_iterations: z.number().optional(),
          })
          .optional(),
        include_structural_compat: z.boolean().optional(),
        strict_paths: z.boolean().optional(),
        gate_mode: z
          .boolean()
          .optional()
          .describe(
            "When true, report ok is false on any error-severity diagnostic or truncated parse/analysis.",
          ),
        typed_flow: z
          .boolean()
          .optional()
          .describe(
            "When true, run typed-flow analysis after abstract pass and emit sections.typed_flow. Default false preserves legacy report shape.",
          ),
        typed_gate_errors: z
          .boolean()
          .optional()
          .describe(
            "When gate_mode and typed_flow are true, promote proven typed violations on annotated procedures to error-severity gate diagnostics. Defaults to true; set false for warnings-only typed diagnostics.",
          ),
        constraint_flow: z
          .boolean()
          .optional()
          .describe(
            "When true, run constraint-language analysis after typed-flow and emit sections.constraint_language. Requires typed_flow (coerced when omitted). Default false preserves legacy report shape.",
          ),
        constraint_gate_errors: z
          .boolean()
          .optional()
          .describe(
            "When gate_mode, typed_flow, and constraint_flow are true, promote proven constraint violations on constraint-annotated procedures to error-severity gate diagnostics. Defaults to false (sub-phase 3a warnings-only).",
          ),
        async_boundary: z
          .boolean()
          .optional()
          .describe(
            "When true, run async_boundary analysis after typed-flow and emit sections.async_boundary. Default false preserves legacy report shape.",
          ),
        async_gate_errors: z
          .boolean()
          .optional()
          .describe(
            "When gate_mode and async_boundary are true, promote ASYNC_EFFECTS_WITHOUT_BOUNDARY to error-severity gate diagnostics. Defaults to false; set true to fail gate on missing async boundary rationale.",
          ),
        closure_join_report: z
          .boolean()
          .optional()
          .describe(
            "When true, run four-way closure join (REQ criterion ↔ IMPL block ↔ test ↔ code) via shared closure-join-report lib. Requires req_token and impl_tokens.",
          ),
        req_token: z
          .string()
          .optional()
          .describe("REQ token for closure join satisfaction_criteria ids (required when closure_join_report is true)."),
        impl_tokens: z
          .array(z.string())
          .optional()
          .describe("IMPL tokens whose sidecars participate in closure join (required when closure_join_report is true)."),
        project_root: z
          .string()
          .optional()
          .describe("Workspace root for test/code globs and working/{REQ}/evidence persistence; defaults to parent of TIED_BASE_PATH."),
        test_globs: z.array(z.string()).optional(),
        code_globs: z.array(z.string()).optional(),
        persist_closure_report: z
          .boolean()
          .optional()
          .describe("When true with closure_join_report, write closure-join-{timestamp}.json under working/{REQ}/evidence/."),
      }),
    },
    handler: async (args: {
      token: string;
      pseudocode?: string;
      essence_pseudocode_path?: string;
      known_tokens?: string[];
      analyses?: typeof ALL_ANALYSIS_PASSES;
      budgets?: Record<string, number>;
      include_structural_compat?: boolean;
      strict_paths?: boolean;
      gate_mode?: boolean;
      typed_flow?: boolean;
      typed_gate_errors?: boolean;
      constraint_flow?: boolean;
      constraint_gate_errors?: boolean;
      async_boundary?: boolean;
      async_gate_errors?: boolean;
      closure_join_report?: boolean;
      req_token?: string;
      impl_tokens?: string[];
      project_root?: string;
      test_globs?: string[];
      code_globs?: string[];
      persist_closure_report?: boolean;
    }) => {
      const hasInline = typeof args.pseudocode === "string" && args.pseudocode.length > 0;
      const hasPath = typeof args.essence_pseudocode_path === "string" && args.essence_pseudocode_path.length > 0;
      if (hasInline && hasPath) {
        return textContent(
          prettyCanonicalJson({ ok: false, stage: "input", error: "AMBIGUOUS_INPUT" }),
        );
      }
      if (!hasInline && !hasPath) {
        return textContent(
          prettyCanonicalJson({ ok: false, stage: "input", error: "MISSING_INPUT" }),
        );
      }

      let source = args.pseudocode ?? "";
      if (hasPath) {
        const resolved = resolvePseudocodePathUnderTiedBase(args.essence_pseudocode_path!, getBasePath());
        if (!resolved.ok) {
          return textContent(
            prettyCanonicalJson(
              {
                ok: false,
                stage: "input",
                error: resolved.error.includes("TIED_BASE_PATH") ? "PATH_NOT_UNDER_TIED_BASE" : resolved.error,
              }
            ),
          );
        }
        const read = readTextFromPseudocodePath(resolved.absolutePath);
        if (!read.ok) {
          return textContent(prettyCanonicalJson({ ok: false, stage: "input", error: read.error }));
        }
        source = read.content;
      }

      const report = analyzeEssencePseudocode({
        token: args.token,
        pseudocode: source,
        known_tokens: args.known_tokens,
        analyses: args.analyses,
        budgets: args.budgets,
        include_structural_compat: args.include_structural_compat,
        strict_paths: args.strict_paths,
        gate_mode: args.gate_mode,
        typed_flow: args.typed_flow,
        typed_gate_errors: args.typed_gate_errors,
        constraint_flow: args.constraint_flow,
        constraint_gate_errors: args.constraint_gate_errors,
        async_boundary: args.async_boundary,
        async_gate_errors: args.async_gate_errors,
      }) as Record<string, unknown>;

      if (args.closure_join_report) {
        const reqToken = args.req_token;
        const implTokens = args.impl_tokens;
        if (!reqToken || !implTokens || implTokens.length === 0) {
          return textContent(
            prettyCanonicalJson(
              { ok: false, stage: "input", error: "CLOSURE_JOIN_MISSING_REQ_OR_IMPL" }
            ),
          );
        }
        const projectRoot = args.project_root ?? path.dirname(getBasePath());
        const closure = await buildClosureJoinReportAsync({
          req_token: reqToken,
          impl_tokens: implTokens,
          project_root: projectRoot,
          test_globs: args.test_globs,
          code_globs: args.code_globs,
          gate_mode: args.gate_mode,
          persist: args.persist_closure_report ?? true,
        });
        const sections = (report.sections as Record<string, unknown> | undefined) ?? {};
        sections.closure_join = closure;
        report.sections = sections;
        if (args.gate_mode && !closure.ok) {
          report.ok = false;
        }
      }

      return textContent(prettyCanonicalJson(report));
    },
  },
  {
    name: "binding_inventory_validate",
    config: {
      description:
        "Validate binding inventory rows for trigger, callee, arguments, effect, ordering, failure behavior, optional async_semantics/cancellation/idempotency_evidence (W5 async seams), UI-free composition evidence, and named E2E platform constraints. Reports missing fields only; does not certify runtime ordering or race-freedom.",
      inputSchema: z.object({
        rows: z.array(z.record(z.string(), z.unknown())),
      }),
    },
    handler: async (args: { rows: unknown[] }) => {
      return textContent(
        prettyCanonicalJson(validateBindingInventory(args.rows as Parameters<typeof validateBindingInventory>[0])),
      );
    },
  },
  {
    name: "tied_easar_inventory_receipt_build",
    config: {
      description:
        "Build [REQ-TIED_EASAR_RECOVERY] inventory.v1 receipt from scoped analysis walk_summary. Optional write under tied-project/working/{REQ}/evidence/; envelope patch when TIED_ENVELOPE_HOOKS=1.",
      inputSchema: z.object({
        request_token: z.string().describe("REQ token (e.g. REQ-TIED_EASAR_RECOVERY)."),
        project_root: z.string().optional().describe("Client project root; defaults from TIED layout."),
        baseline_revision: z.string().optional().describe("Git SHA or baseline lock revision."),
        scoped_analysis_run_id: z.string().optional().describe("Stable run id for receipt cross-refs."),
        roots: z.array(z.string()).optional().describe("Scoped analysis roots; default mcp-server/src."),
        output_path: z.string().optional().describe("Repo-relative or absolute path to write inventory.v1.json."),
        matrix_row_placeholders: z.array(z.string()).optional(),
        entry_points: z.array(z.string()).optional(),
      }),
    },
    handler: async (args: {
      request_token: string;
      project_root?: string;
      baseline_revision?: string;
      scoped_analysis_run_id?: string;
      roots?: string[];
      output_path?: string;
      matrix_row_placeholders?: string[];
      entry_points?: string[];
    }) => {
      try {
        const result = await buildEasarInventoryReceipt(args);
        return textContent(prettyCanonicalJson(result));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return textContent(prettyCanonicalJson({ ok: false, error: message }));
      }
    },
  },
  {
    name: "tied_easar_code_graph_matrix_receipt_build",
    config: {
      description:
        "Build [REQ-TIED_EASAR_RECOVERY] code-graph-matrix-receipt.v1 from tied_source_graph_freshness + matrix code_graph row. Optional write under tied-project/working/{REQ}/evidence/; envelope patch when TIED_ENVELOPE_HOOKS=1.",
      inputSchema: z.object({
        request_token: z.string().describe("REQ token (e.g. REQ-TIED_EASAR_RECOVERY)."),
        matrix_row_number: z.number().int().min(1).describe("Intent elevation matrix row number."),
        row: z
          .object({
            source_type: z.string(),
            location: z.string(),
            disposition: z.string(),
          })
          .describe("Matrix row fields (source_type must be code_graph)."),
        repo_root: z.string().optional().describe("Repository root for source graph; defaults to project root."),
        project_root: z.string().optional().describe("Client project root; defaults from TIED layout."),
        index_rel_path: z.string().optional().describe("Relative path to source-graph index JSON."),
        graph_freshness_run_id: z.string().optional().describe("Operator correlation id; derived from freshness when omitted."),
        graph_trace_id: z.string().optional().describe("Optional trace symbol id or composition-only marker."),
        output_path: z.string().optional().describe("Repo-relative or absolute path to write receipt JSON."),
      }),
    },
    handler: async (args: {
      request_token: string;
      matrix_row_number: number;
      row: { source_type: string; location: string; disposition: string };
      repo_root?: string;
      project_root?: string;
      index_rel_path?: string;
      graph_freshness_run_id?: string;
      graph_trace_id?: string;
      output_path?: string;
    }) => {
      try {
        const result = await buildEasarCodeGraphMatrixReceipt(args);
        return textContent(prettyCanonicalJson(result));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return textContent(prettyCanonicalJson({ ok: false, error: message }));
      }
    },
  },
  {
    name: "tied_easar_claim_matrix_map_build",
    config: {
      description:
        "Build [REQ-TIED_EASAR_RECOVERY] claim-matrix-map.v1 from claim_id ↔ matrix row pairs. Optional write under tied-project/working/{REQ}/evidence/; envelope patch when TIED_ENVELOPE_HOOKS=1.",
      inputSchema: z.object({
        request_token: z.string().describe("REQ token (e.g. REQ-TIED_EASAR_RECOVERY)."),
        entries: z
          .array(
            z.object({
              claim_id: z.string(),
              matrix_row_number: z.number().int().min(1),
            }),
          )
          .min(1)
          .describe("claim.id ↔ intent elevation matrix row numbers."),
        project_root: z.string().optional().describe("Client project root; defaults from TIED layout."),
        output_path: z.string().optional().describe("Repo-relative or absolute path to write claim-matrix-map.v1.json."),
      }),
    },
    handler: async (args: {
      request_token: string;
      entries: { claim_id: string; matrix_row_number: number }[];
      project_root?: string;
      output_path?: string;
    }) => {
      const result = buildEasarClaimMatrixMap(args);
      return textContent(prettyCanonicalJson(result));
    },
  },
  {
    name: "tied_easar_reflexion_report_build",
    config: {
      description:
        "Build [REQ-TIED_EASAR_RECOVERY] reflexion-report.v1 export-only synthesis from inquiry obligation ref + gate_allowed. Optional write under tied-project/working/{REQ}/evidence/; envelope patch when TIED_ENVELOPE_HOOKS=1.",
      inputSchema: z.object({
        request_token: z.string().describe("REQ token (e.g. REQ-TIED_EASAR_RECOVERY)."),
        inquiry_run_id: z.string().describe("Distinct adversarial inquiry run_id for this slice verification."),
        gate_allowed: z.boolean().describe("Whether verification gate allowed progression."),
        obligation_report_ref: z.string().describe("Relative path to obligation-report.json (pointer only)."),
        adversarial_ledger_ref: z
          .string()
          .optional()
          .describe("Optional pointer to finding-ledger.jsonl; body is never merged."),
        divergences: z
          .array(
            z.object({
              arch_token: z.string(),
              summary: z.string(),
              graph_evidence_ref: z.string().optional(),
              severity: z.enum(["info", "warn", "block"]),
            }),
          )
          .optional()
          .describe("Optional ARCH ↔ graph divergence rows."),
        project_root: z.string().optional().describe("Client project root; defaults from TIED layout."),
        output_path: z
          .string()
          .optional()
          .describe("Repo-relative or absolute path to write reflexion-report.v1.json."),
      }),
    },
    handler: async (args: {
      request_token: string;
      inquiry_run_id: string;
      gate_allowed: boolean;
      obligation_report_ref: string;
      adversarial_ledger_ref?: string;
      divergences?: {
        arch_token: string;
        summary: string;
        graph_evidence_ref?: string;
        severity: "info" | "warn" | "block";
      }[];
      project_root?: string;
      output_path?: string;
    }) => {
      const result = buildEasarReflexionReport(args);
      return textContent(prettyCanonicalJson(result));
    },
  },
  {
    name: "tied_easar_validation_suite_run",
    config: {
      description:
        "Run [REQ-TIED_EASAR_RECOVERY] Stage 7 validation-cases.v1 graders (deterministic, read-only) and emit validation-results.v1.json. Optional write under tied-project/working/{REQ}/evidence/.",
      inputSchema: z.object({
        request_token: z.string().describe("REQ token (e.g. REQ-TIED_EASAR_RECOVERY)."),
        cases_path: z.string().describe("Repo-relative path to validation-cases.v1.yaml."),
        project_root: z.string().optional().describe("Client project root; defaults from TIED layout."),
        git_rev: z.string().optional().describe("Pin git revision in results; defaults to HEAD."),
        evidence_refs: z
          .array(z.string())
          .optional()
          .describe("Optional committed receipt paths cross-linked in results."),
        output_path: z
          .string()
          .optional()
          .describe("Repo-relative or absolute path to write validation-results.v1.json."),
        min_cases: z.number().int().min(1).optional().describe("Minimum case count (default 8)."),
      }),
    },
    handler: async (args: {
      request_token: string;
      cases_path: string;
      project_root?: string;
      git_rev?: string;
      evidence_refs?: string[];
      output_path?: string;
      min_cases?: number;
    }) => {
      const result = runEasarValidationSuiteMcp(args);
      return textContent(prettyCanonicalJson(result));
    },
  },
  {
    name: "tied_easar_recovery_export_build",
    config: {
      description:
        "Build [REQ-TIED_EASAR_RECOVERY] Stage 9 recovery-export-manifest.v1.json from recovery-portable-map.v1.yaml (read-only portable adapter). Optional gitignored output_dir for materialized recovery/ tree.",
      inputSchema: z.object({
        request_token: z.string().describe("REQ token (e.g. REQ-TIED_EASAR_RECOVERY)."),
        map_path: z.string().describe("Repo-relative path to recovery-portable-map.v1.yaml."),
        project_root: z.string().optional().describe("Client project root; defaults from TIED layout."),
        working_root: z
          .string()
          .optional()
          .describe("Repo-relative working folder; defaults to tied-project/working/{request_token}."),
        git_rev: z.string().optional().describe("Pin git revision in manifest."),
        output_dir: z
          .string()
          .optional()
          .describe("Optional gitignored directory for portable recovery/ tree materialization."),
        manifest_output_path: z
          .string()
          .optional()
          .describe("Repo-relative or absolute path to write recovery-export-manifest.v1.json."),
      }),
    },
    handler: async (args: {
      request_token: string;
      map_path: string;
      project_root?: string;
      working_root?: string;
      git_rev?: string;
      output_dir?: string;
      manifest_output_path?: string;
    }) => {
      const result = buildEasarRecoveryExport(args);
      return textContent(prettyCanonicalJson(result));
    },
  },
  {
    name: "tied_edpc_access_validate",
    config: {
      description:
        "Validate [REQ-TIED_EDPC_COMPREHENSION] evidence-access matrix and tier capability flags (fail-closed).",
      inputSchema: z.object({
        access_matrix: z.record(z.string(), z.unknown()).describe("Parsed evidence-access-matrix.v1 body."),
        tracker: z.record(z.string(), z.unknown()).optional().describe("Optional Tracker snippet with edpc_engagement paths."),
      }),
    },
    handler: async (args: { access_matrix: Record<string, unknown>; tracker?: Record<string, unknown> }) => {
      const engagement =
        args.tracker && typeof args.tracker === "object"
          ? (args.tracker as { edpc_engagement?: Record<string, unknown> }).edpc_engagement
          : undefined;
      const result = validateEdpcAccessMatrix(args.access_matrix, engagement as Parameters<typeof validateEdpcAccessMatrix>[1]);
      return textContent(prettyCanonicalJson(result));
    },
  },
  {
    name: "tied_edpc_engagement_validate",
    config: {
      description:
        "Validate [REQ-TIED_EDPC_COMPREHENSION] brownfield engagement edpc_full (easar_full deprecated alias).",
      inputSchema: z.object({
        tracker: z.record(z.string(), z.unknown()).describe("Checklist Tracker or gate tracker object."),
      }),
    },
    handler: async (args: { tracker: Record<string, unknown> }) => {
      const result = validateEdpcEngagementFacet(args.tracker);
      return textContent(prettyCanonicalJson(result));
    },
  },
  {
    name: "tied_edpc_workflow_route",
    config: {
      description: "Deterministic [REQ-TIED_EDPC_COMPREHENSION] EDPC workflow A–G route from question class and tier.",
      inputSchema: z.object({
        question_class: z.string(),
        evidence_access_tier: z.enum(EVIDENCE_ACCESS_TIERS as unknown as [string, ...string[]]),
      }),
    },
    handler: async (args: { question_class: string; evidence_access_tier: (typeof EVIDENCE_ACCESS_TIERS)[number] }) => {
      const result = routeEdpcWorkflow(args.question_class, args.evidence_access_tier);
      return textContent(prettyCanonicalJson(result));
    },
  },
  {
    name: "tied_edpc_publish_build",
    config: {
      description: "Build [REQ-TIED_EDPC_COMPREHENSION] edpc-publish-manifest.v1 with gaps[] and receipt refs.",
      inputSchema: z.object({
        scm_shell: z.record(z.string(), z.unknown()),
        claims_ledger: z.array(z.record(z.string(), z.unknown())),
        access_matrix: z.object({
          evidence_access_tier: z.enum(EVIDENCE_ACCESS_TIERS as unknown as [string, ...string[]]),
        }),
        receipt_exists_map: z.record(z.string(), z.boolean()).optional(),
        charter: z.record(z.string(), z.unknown()).optional(),
        ofsm_bundle: z.record(z.string(), z.unknown()).optional().nullable(),
      }),
    },
    handler: async (args: {
      scm_shell: Record<string, unknown>;
      claims_ledger: Array<Record<string, unknown>>;
      access_matrix: { evidence_access_tier: (typeof EVIDENCE_ACCESS_TIERS)[number] };
      receipt_exists_map?: Record<string, boolean>;
      charter?: Record<string, unknown>;
      ofsm_bundle?: Record<string, unknown> | null;
    }) => {
      const existsMap = args.receipt_exists_map ?? {};
      const result = buildEdpcPublishManifest({
        scm_shell: args.scm_shell,
        claims_ledger: args.claims_ledger as Parameters<typeof buildEdpcPublishManifest>[0]["claims_ledger"],
        access_matrix: args.access_matrix,
        receipt_exists: (path) => existsMap[path] ?? false,
        charter: args.charter as Parameters<typeof buildEdpcPublishManifest>[0]["charter"],
        ofsm_bundle: args.ofsm_bundle as Parameters<typeof buildEdpcPublishManifest>[0]["ofsm_bundle"],
      });
      return textContent(prettyCanonicalJson(result));
    },
  },
  {
    name: "tied_edpc_failure_state_validate",
    config: {
      description:
        "Validate [REQ-TIED_EDPC_COMPREHENSION] Workflow D Operational Failure State Model (OFSM v1) fail-closed.",
      inputSchema: z.object({
        charter: z.record(z.string(), z.unknown()),
        access_matrix: z.object({
          evidence_access_tier: z.enum(EVIDENCE_ACCESS_TIERS as unknown as [string, ...string[]]),
          production_touch: z.enum(["none", "read_only", "approved_execute"]).optional(),
        }),
        ofsm_bundle: z.record(z.string(), z.unknown()),
      }),
    },
    handler: async (args: {
      charter: Record<string, unknown>;
      access_matrix: Parameters<typeof validateEdpcFailureState>[0]["access_matrix"];
      ofsm_bundle: Record<string, unknown>;
    }) => {
      const result = validateEdpcFailureState({
        charter: args.charter,
        access_matrix: args.access_matrix,
        ofsm_bundle: args.ofsm_bundle,
      });
      return textContent(prettyCanonicalJson(result));
    },
  },
  {
    name: "tied_edpc_failure_state_build",
    config: {
      description:
        "Build [REQ-TIED_EDPC_COMPREHENSION] OFSM attachment JSON and merge operational_failure_state SCM receipt ref.",
      inputSchema: z.object({
        charter: z.record(z.string(), z.unknown()),
        access_matrix: z.object({
          evidence_access_tier: z.enum(EVIDENCE_ACCESS_TIERS as unknown as [string, ...string[]]),
          production_touch: z.enum(["none", "read_only", "approved_execute"]).optional(),
        }),
        ofsm_bundle: z.record(z.string(), z.unknown()),
        scm_shell: z.record(z.string(), z.unknown()),
      }),
    },
    handler: async (args: {
      charter: Record<string, unknown>;
      access_matrix: Parameters<typeof buildEdpcFailureState>[0]["access_matrix"];
      ofsm_bundle: Record<string, unknown>;
      scm_shell: Record<string, unknown>;
    }) => {
      const result = buildEdpcFailureState({
        charter: args.charter,
        access_matrix: args.access_matrix,
        ofsm_bundle: args.ofsm_bundle,
        scm_shell: args.scm_shell,
      });
      return textContent(prettyCanonicalJson(result));
    },
  },
  {
    name: "tied_edpc_client_assessment_validate",
    config: {
      description:
        "Validate [REQ-TIED_EDPC_CLIENT_ASSESSMENT] Workflow H charter, overlay tier legality, and publish manifest freshness.",
      inputSchema: z.object({
        charter: z.record(z.string(), z.unknown()),
        assessment_context: z.record(z.string(), z.unknown()).optional(),
        publish_manifest: z.record(z.string(), z.unknown()),
        receipt_exists_map: z.record(z.string(), z.boolean()).optional(),
      }),
    },
    handler: async (args: {
      charter: Record<string, unknown>;
      assessment_context?: Record<string, unknown>;
      publish_manifest: Record<string, unknown>;
      receipt_exists_map?: Record<string, boolean>;
    }) => {
      const existsMap = args.receipt_exists_map ?? {};
      const result = validateEdpcClientAssessment({
        charter: args.charter as Parameters<typeof validateEdpcClientAssessment>[0]["charter"],
        assessment_context: args.assessment_context as Parameters<
          typeof validateEdpcClientAssessment
        >[0]["assessment_context"],
        publish_manifest: args.publish_manifest as Parameters<
          typeof validateEdpcClientAssessment
        >[0]["publish_manifest"],
        receipt_exists: (path) => existsMap[path] ?? false,
      });
      return textContent(prettyCanonicalJson(result));
    },
  },
  {
    name: "tied_edpc_client_assessment_compose",
    config: {
      description:
        "Compose [REQ-TIED_EDPC_CLIENT_ASSESSMENT] client-assessment-model.v1 from EDPC inputs (pure JSON).",
      inputSchema: z.object({
        charter: z.record(z.string(), z.unknown()),
        assessment_context: z.record(z.string(), z.unknown()).optional(),
        publish_manifest: z.record(z.string(), z.unknown()),
        claims_ledger: z.array(z.record(z.string(), z.unknown())),
        receipt_exists_map: z.record(z.string(), z.boolean()).optional(),
      }),
    },
    handler: async (args: {
      charter: Record<string, unknown>;
      assessment_context?: Record<string, unknown>;
      publish_manifest: Record<string, unknown>;
      claims_ledger: Array<Record<string, unknown>>;
      receipt_exists_map?: Record<string, boolean>;
    }) => {
      const existsMap = args.receipt_exists_map ?? {};
      const result = composeEdpcClientAssessment({
        charter: args.charter as Parameters<typeof composeEdpcClientAssessment>[0]["charter"],
        assessment_context: args.assessment_context as Parameters<
          typeof composeEdpcClientAssessment
        >[0]["assessment_context"],
        publish_manifest: args.publish_manifest as Parameters<
          typeof composeEdpcClientAssessment
        >[0]["publish_manifest"],
        claims_ledger: args.claims_ledger as Parameters<
          typeof composeEdpcClientAssessment
        >[0]["claims_ledger"],
        receipt_exists: (path) => existsMap[path] ?? false,
      });
      return textContent(prettyCanonicalJson(result));
    },
  },
  {
    name: "tied_edpc_client_assessment_render",
    config: {
      description:
        "Render [REQ-TIED_EDPC_CLIENT_ASSESSMENT] deterministic Markdown from CAM v1.",
      inputSchema: z.object({
        cam: z.record(z.string(), z.unknown()),
      }),
    },
    handler: async (args: { cam: Record<string, unknown> }) => {
      const result = renderEdpcClientAssessmentMarkdown(
        args.cam as Parameters<typeof renderEdpcClientAssessmentMarkdown>[0],
      );
      return textContent(prettyCanonicalJson(result));
    },
  },
  {
    name: "brownfield_intent_evidence_validate",
    config: {
      description:
        "Validate brownfield intent-elevation matrices (Markdown table or intent-elevation.v1 YAML) with disposition and promotion rules. Report-only by default; emits diagnostics and a validation receipt without mutating project TIED YAML.",
      inputSchema: z.object({
        markdown_text: z.string().optional(),
        yaml_text: z.string().optional(),
        matrix_path: z.string().optional(),
        baseline_revision: z.string().optional(),
        scope_tokens: z.array(z.string()).optional(),
        mode: z.enum(["report_only", "pilot", "strict"]).optional(),
        scoped_analysis_evidence_id: z.string().optional(),
        claims_review_evidence_id: z.string().optional(),
      }),
    },
    handler: async (args: {
      markdown_text?: string;
      yaml_text?: string;
      matrix_path?: string;
      baseline_revision?: string;
      scope_tokens?: string[];
      mode?: "report_only" | "pilot" | "strict";
      scoped_analysis_evidence_id?: string;
      claims_review_evidence_id?: string;
    }) => {
      let markdown_text = args.markdown_text;
      let yaml_text = args.yaml_text;
      if (args.matrix_path && !markdown_text && !yaml_text) {
        const { readFile } = await import("node:fs/promises");
        const raw = await readFile(args.matrix_path, "utf8");
        if (args.matrix_path.endsWith(".yaml") || args.matrix_path.endsWith(".yml")) {
          yaml_text = raw;
        } else {
          markdown_text = raw;
        }
      }
      return textContent(
        prettyCanonicalJson(
          brownfieldIntentEvidenceValidate({
            markdown_text,
            yaml_text,
            matrix_path: args.matrix_path,
            baseline_revision: args.baseline_revision,
            scope_tokens: args.scope_tokens,
            mode: args.mode,
            scoped_analysis_evidence_id: args.scoped_analysis_evidence_id,
            claims_review_evidence_id: args.claims_review_evidence_id,
          })
        ),
      );
    },
  },
  {
    name: "tied_source_graph_refresh",
    config: {
      description:
        "Build or refresh a local source-graph index (TypeScript/JavaScript static analysis) and return a receipt with map summary. Does not mutate project TIED YAML.",
      inputSchema: z.object({
        repo_root: z.string(),
        index_rel_path: z.string().optional(),
      }),
    },
    handler: async (args: { repo_root: string; index_rel_path?: string }) => {
      return textContent(prettyCanonicalJson(await tiedSourceGraphRefresh(args)));
    },
  },
  {
    name: "tied_source_graph_map",
    config: {
      description:
        "Return repository map clusters from the source-graph index (refresh implied). Evidence-only; does not mutate project TIED YAML.",
      inputSchema: z.object({
        repo_root: z.string(),
        index_rel_path: z.string().optional(),
      }),
    },
    handler: async (args: { repo_root: string; index_rel_path?: string }) => {
      return textContent(prettyCanonicalJson(await tiedSourceGraphMap(args)));
    },
  },
  {
    name: "tied_source_graph_trace",
    config: {
      description:
        "Trace caller/callee symbol edges for a symbol_id within the source-graph index. Evidence-only; does not mutate project TIED YAML.",
      inputSchema: z.object({
        repo_root: z.string(),
        symbol_id: z.string(),
        depth: z.number().int().min(1).max(4).optional(),
        index_rel_path: z.string().optional(),
      }),
    },
    handler: async (args: {
      repo_root: string;
      symbol_id: string;
      depth?: number;
      index_rel_path?: string;
    }) => {
      return textContent(prettyCanonicalJson(await tiedSourceGraphTrace(args)));
    },
  },
  {
    name: "tied_source_graph_freshness",
    config: {
      description:
        "Compare live repo content hash to the source-graph index (advisory stale diagnostics). Does not mutate project TIED YAML.",
      inputSchema: z.object({
        repo_root: z.string(),
        index_rel_path: z.string().optional(),
      }),
    },
    handler: async (args: { repo_root: string; index_rel_path?: string }) => {
      return textContent(prettyCanonicalJson(await tiedSourceGraphFreshness(args)));
    },
  },
  {
    name: "stressor_residue_record_validate",
    config: {
      description:
        "Validate stressor-residue.v1 YAML discovery records for required fields, enums, and proof_boundary. Structural check only; does not prove runtime resilience or promote residues to REQ authority.",
      inputSchema: z.object({
        record: z.record(z.string(), z.unknown()).optional(),
        yaml_text: z.string().optional(),
      }),
    },
    handler: async (args: { record?: Record<string, unknown>; yaml_text?: string }) => {
      return textContent(prettyCanonicalJson(validateStressorResidueRecord(args)));
    },
  },
  {
    name: "tied_methodology_learning_experiment_validate",
    config: {
      description:
        "Validate methodology-learning-experiment.v1 YAML records for Loop 3 PDSA shape (hypothesis, baseline, outcome, proof_boundary). Structural check only; does not prove effectiveness.",
      inputSchema: z.object({
        record: z.record(z.string(), z.unknown()).optional(),
        yaml_text: z.string().optional(),
      }),
    },
    handler: async (args: { record?: Record<string, unknown>; yaml_text?: string }) => {
      return textContent(prettyCanonicalJson(validateMethodologyLearningExperiment(args)));
    },
  },
  {
    name: "tied_methodology_production_system_enrollment_validate",
    config: {
      description:
        "Validate methodology learning experiment enrollment for non-checklist_step production surfaces (surface_ref rules for prompt_type_workflow, assurance_profile, gate_policy). Composes W1 structural validation; read-only.",
      inputSchema: z.object({
        record: z.record(z.string(), z.unknown()).optional(),
        yaml_text: z.string().optional(),
      }),
    },
    handler: async (args: { record?: Record<string, unknown>; yaml_text?: string }) => {
      return textContent(prettyCanonicalJson(validateProductionSystemEnrollment(args)));
    },
  },
  {
    name: "tied_methodology_learning_experiment_upsert",
    config: {
      description:
        "Validate and upsert a methodology learning experiment record into tied-project/methodology-experiments.yaml under the TIED base path.",
      inputSchema: z.object({
        record: z.record(z.string(), z.unknown()),
        base_path: z.string().optional(),
      }),
    },
    handler: async (args: { record: Record<string, unknown>; base_path?: string }) => {
      const result = upsertMethodologyLearningExperiment(args.record, args.base_path);
      return textContent(prettyCanonicalJson(result));
    },
  },
  {
    name: "tied_methodology_learning_experiment_list",
    config: {
      description:
        "List methodology learning experiment records from tied-project/methodology-experiments.yaml.",
      inputSchema: z.object({
        base_path: z.string().optional(),
      }),
    },
    handler: async (args: { base_path?: string }) => {
      const data = listMethodologyLearningExperiments(args.base_path);
      return textContent(prettyCanonicalJson(data));
    },
  },
  {
    name: "tied_methodology_learning_cohort_export_run",
    config: {
      description:
        "Run methodology learning cohort export: validate manifest, resolve W1 experiments, compose W4 report, emit shareable_hashed export YAML.",
      inputSchema: z.object({
        manifest_path: z.string().optional(),
        manifest: z.record(z.string(), z.unknown()).optional(),
        yaml_out: z.string(),
        base_path: z.string().optional(),
        cwd: z.string().optional(),
        project_root: z.string().optional(),
      }),
    },
    handler: async (args: {
      manifest_path?: string;
      manifest?: Record<string, unknown>;
      yaml_out: string;
      base_path?: string;
      cwd?: string;
      project_root?: string;
    }) => {
      const result = runMethodologyLearningCohortExport({
        manifestPath: args.manifest_path,
        manifest: args.manifest,
        yamlOut: args.yaml_out,
        basePath: args.base_path,
        cwd: args.cwd,
        projectRoot: args.project_root,
      });
      return textContent(prettyCanonicalJson(result));
    },
  },
  {
    name: "tied_methodology_conformance_effectiveness_pair",
    config: {
      description:
        "Read-only conformance–effectiveness pairing report for a methodology learning experiment (trap, paired, not_measured, waived). Does not mutate stores.",
      inputSchema: z.object({
        experiment_id: z.string().optional(),
        record: z.record(z.string(), z.unknown()).optional(),
        conformance_evidence_refs: z.array(z.unknown()).optional(),
        process_grade_gap_documented: z.boolean().optional(),
        waiver: z
          .object({
            owner: z.string().optional(),
            expiry: z.string().optional(),
            rationale: z.string().optional(),
          })
          .optional(),
        base_path: z.string().optional(),
      }),
    },
    handler: async (args: {
      experiment_id?: string;
      record?: Record<string, unknown>;
      conformance_evidence_refs?: unknown[];
      process_grade_gap_documented?: boolean;
      waiver?: { owner?: string; expiry?: string; rationale?: string };
      base_path?: string;
    }) => {
      if (args.experiment_id) {
        return textContent(prettyCanonicalJson(pairFromExperimentId({
          experiment_id: args.experiment_id,
          conformance_evidence_refs: args.conformance_evidence_refs,
          process_grade_gap_documented: args.process_grade_gap_documented,
          waiver: args.waiver,
          base_path: args.base_path,
        })));
      }
      if (args.record) {
        const outcome = args.record.methodology_outcome_observation;
        return textContent(prettyCanonicalJson(pairConformanceEffectiveness({
          conformance_evidence_refs: args.conformance_evidence_refs,
          methodology_outcome_observation: outcome as Record<string, unknown> | null | undefined,
          experiment_proof_boundary:
            typeof args.record.proof_boundary === "string" ? args.record.proof_boundary : undefined,
          process_grade_gap_documented: args.process_grade_gap_documented,
          waiver: args.waiver,
        })));
      }
      return textContent(prettyCanonicalJson({
        ok: false,
        diagnostics: [{ code: "INVALID_INPUT", message: "Provide experiment_id or record" }],
      }));
    },
  },
  {
    name: "tied_methodology_kaizen_experiment_bridge",
    config: {
      description:
        "Explicit Kaizen → methodology bridge: validate bridge-eligible feedback and return a draft methodology-learning-experiment.v1 without writing methodology-experiments.yaml.",
      inputSchema: z.object({
        feedback_ids: z.array(z.string()).optional(),
        observation_group: z.string().optional(),
        digest: z.record(z.string(), z.unknown()).optional(),
        digest_projection_hash: z.string().optional(),
        production_system_surface: z.string().optional(),
        base_path: z.string().optional(),
      }),
    },
    handler: async (args: {
      feedback_ids?: string[];
      observation_group?: string;
      digest?: Record<string, unknown>;
      digest_projection_hash?: string;
      production_system_surface?: string;
      base_path?: string;
    }) => {
      const report = runMethodologyKaizenExperimentBridge({
        feedback_ids: args.feedback_ids,
        observation_group: args.observation_group,
        digest: args.digest as Parameters<typeof runMethodologyKaizenExperimentBridge>[0]["digest"],
        digest_projection_hash: args.digest_projection_hash,
        production_system_surface: args.production_system_surface,
        base_path: args.base_path,
      });
      return textContent(prettyCanonicalJson(report));
    },
  },
  {
    name: "tied_plumb_diff_impact_preview",
    config: {
      description:
        "Deterministic plumb diff-style impact preview over git diffs. Scans staged/unstaged diff hunks for [REQ-*]/[ARCH-*]/[IMPL-*] tokens, maps impacted tokens to TIED decisions, and returns impact-preview.v1 (default) or impact-preview.v2 when profile_path or use_default_profile is explicitly set. No network/LLM calls.",
      inputSchema: z.object({
        selection: z
          .enum(["staged", "unstaged", "both"])
          .optional()
          .describe("Which git diff to scan."),
        paths: z
          .array(z.string())
          .optional()
          .describe(
            "Optional explicit file path list to restrict scanning (cwd-relative or absolute)."
          ),
        include_removed: z
          .boolean()
          .optional()
          .default(true)
          .describe("Include tokens found on removed (-) diff lines."),
        max_files: z
          .number()
          .optional()
          .default(200)
          .describe(
            "Max candidate files scanned before deterministic truncation."
          ),
        max_patch_bytes: z
          .number()
          .optional()
          .default(250000)
          .describe(
            "Max patch bytes per file before token extraction truncates for that file."
          ),
        max_total_patch_bytes: z
          .number()
          .optional()
          .default(2000000)
          .describe(
            "Max total patch bytes scanned across all files."
          ),
        profile_path: z
          .string()
          .optional()
          .describe(
            "Opt-in change-impact-profile.v1.yaml path (cwd-relative or absolute). Emits impact-preview.v2 when set."
          ),
        use_default_profile: z
          .boolean()
          .optional()
          .default(false)
          .describe(
            "When true, load tied-project/change-impact-profile.v1.yaml under the git root."
          ),
      }),
    },
    handler: async (args: {
      selection?: "staged" | "unstaged" | "both";
      paths?: string[];
      include_removed?: boolean;
      max_files?: number;
      max_patch_bytes?: number;
      max_total_patch_bytes?: number;
      profile_path?: string;
      use_default_profile?: boolean;
    }) => {
      const report = runPlumbDiffImpactPreview({
        selection: args.selection ?? "both",
        paths: args.paths,
        include_removed: args.include_removed ?? true,
        max_files: args.max_files ?? 200,
        max_patch_bytes: args.max_patch_bytes ?? 250000,
        max_total_patch_bytes: args.max_total_patch_bytes ?? 2000000,
        profile_path: args.profile_path,
        use_default_profile: args.use_default_profile ?? false,
      });
      return textContent(prettyCanonicalJson(report));
    },
  },
  {
    name: "tied_leap_proposal_list",
    config: {
      description:
        "List optional LEAP documentation proposals (non-canonical; not REQ/ARCH/IMPL). Stored under project_root/leap-proposals/queue.json. Use after approval to drive IMPL→ARCH→REQ updates via yaml MCP tools; this tool never writes TIED YAML.",
      inputSchema: z.object({
        project_root: z
          .string()
          .optional()
          .describe("Repo root containing leap-proposals/ (default: process.cwd())"),
        status: z
          .enum(["pending", "rejected", "approved", "applied"])
          .optional()
          .describe("Filter by proposal status"),
      }),
    },
    handler: async (args: { project_root?: string; status?: string }) => {
      return safeLeapCall(() => {
        const root = args.project_root ?? process.cwd();
        const list = listProposals(
          root,
          args.status ? { status: args.status as "pending" | "rejected" | "approved" | "applied" } : undefined
        );
        return { ok: true, count: list.length, proposals: list };
      });
    },
  },
  {
    name: "tied_leap_proposal_add",
    config: {
      description:
        "Add a manual LEAP documentation proposal (pending). Proposals are non-canonical until you apply changes through yaml MCP tools after explicit approval.",
      inputSchema: z.object({
        project_root: z.string().optional().describe("Repo root (default: process.cwd())"),
        title: z.string().min(1).describe("Short title"),
        summary: z.string().min(1).describe("Proposal body (markdown/plain)"),
        suggested_leap_order: z.enum(["impl", "arch", "req", "mixed"]).optional(),
        leap_hints: z.record(z.string(), z.unknown()).optional().describe("Optional structured hints for the approver"),
      }),
    },
    handler: async (args: {
      project_root?: string;
      title: string;
      summary: string;
      suggested_leap_order?: "impl" | "arch" | "req" | "mixed";
      leap_hints?: Record<string, unknown>;
    }) => {
      return safeLeapCall(() => {
        const p = addProposal(args.project_root ?? process.cwd(), {
          kind: "manual",
          title: args.title,
          summary: args.summary,
          source: { type: "manual" },
          suggested_leap_order: args.suggested_leap_order,
          leap_hints: args.leap_hints,
        });
        return { ok: true, proposal: p };
      });
    },
  },
  {
    name: "tied_leap_proposal_extract_diff",
    config: {
      description:
        "OPT-IN deterministic extraction from git diffs: suggests documentation hints from added (+) lines. No LLM/network. Requires explicit_opt_in=true. Appends proposals to the queue (pending). Does not write TIED YAML.",
      inputSchema: z.object({
        explicit_opt_in: z
          .boolean()
          .describe("Must be true to run extraction (off by default at the tool boundary)."),
        project_root: z.string().optional(),
        selection: z.enum(["staged", "unstaged", "both"]).optional(),
        paths: z.array(z.string()).optional(),
        max_proposals: z.number().optional(),
      }),
    },
    handler: async (args: {
      explicit_opt_in: boolean;
      project_root?: string;
      selection?: "staged" | "unstaged" | "both";
      paths?: string[];
      max_proposals?: number;
    }) => {
      return safeLeapCall(() => {
        if (!args.explicit_opt_in) {
          return {
            ok: false,
            error: "explicit_opt_in must be true to run diff extraction (optional feature; off by default).",
          };
        }
        const root = args.project_root ?? process.cwd();
        const extracted = extractDiffProposalCandidates({
          projectRoot: root,
          selection: args.selection ?? "staged",
          paths: args.paths,
          max_proposals: args.max_proposals ?? 40,
        });
        if (extracted.error) {
          return { ok: false, error: extracted.error, extraction: extracted };
        }
        const created: unknown[] = [];
        for (const c of extracted.candidates) {
          created.push(
            addProposal(root, {
              kind: "inferred_diff",
              title: c.title,
              summary: c.summary,
              source: {
                type: "git_diff",
                selection: args.selection ?? "staged",
                paths: args.paths,
              },
              suggested_leap_order: "impl",
              leap_hints: { file: c.file, line_text: c.line_text },
            })
          );
        }
        return {
          ok: true,
          created_count: created.length,
          created,
          extraction: extracted,
        };
      });
    },
  },
  {
    name: "tied_leap_proposal_import_session",
    config: {
      description:
        "OPT-IN: split session export text (or JSON array of {content}) into pending proposals. No LLM. Requires explicit_opt_in=true. Does not write TIED YAML.",
      inputSchema: z.object({
        explicit_opt_in: z.boolean().describe("Must be true to import."),
        project_root: z.string().optional(),
        raw_text: z.string().describe("Session export or transcript text"),
        label: z.string().optional().describe("Optional label for proposal titles"),
        max_segments: z.number().optional().default(25),
      }),
    },
    handler: async (args: {
      explicit_opt_in: boolean;
      project_root?: string;
      raw_text: string;
      label?: string;
      max_segments?: number;
    }) => {
      return safeLeapCall(() => {
        if (!args.explicit_opt_in) {
          return { ok: false, error: "explicit_opt_in must be true to import session segments." };
        }
        const root = args.project_root ?? process.cwd();
        const segments = parseSessionExportSegments(args.raw_text, args.max_segments ?? 25);
        const shaped = proposalsFromSessionSegments(segments, args.label);
        const created: unknown[] = [];
        for (const s of shaped) {
          created.push(addProposal(root, s));
        }
        return { ok: true, created_count: created.length, created, segment_count: segments.length };
      });
    },
  },
  {
    name: "tied_leap_proposal_reject",
    config: {
      description:
        "Reject a proposal by id. Records status in queue + audit log; does not mutate TIED YAML.",
      inputSchema: z.object({
        project_root: z.string().optional(),
        proposal_id: z.string().min(1),
        reason: z.string().optional(),
      }),
    },
    handler: async (args: { project_root?: string; proposal_id: string; reason?: string }) => {
      return safeLeapCall(() => {
        const r = rejectProposal(args.project_root ?? process.cwd(), args.proposal_id, args.reason);
        return r.ok ? { ok: true, proposal: r.proposal } : { ok: false, error: r.error };
      });
    },
  },
  {
    name: "tied_leap_proposal_approve",
    config: {
      description:
        "Approve a pending proposal (ready for LEAP updates). Does not write project TIED YAML; apply changes with yaml_index_* MCP tools, then tied_leap_proposal_mark_applied. Run lint_yaml and tied_validate_consistency after YAML edits.",
      inputSchema: z.object({
        project_root: z.string().optional(),
        proposal_id: z.string().min(1),
        note: z.string().optional(),
      }),
    },
    handler: async (args: { project_root?: string; proposal_id: string; note?: string }) => {
      return safeLeapCall(() => {
        const r = approveProposal(args.project_root ?? process.cwd(), args.proposal_id, args.note);
        return r.ok ? { ok: true, proposal: r.proposal } : { ok: false, error: r.error };
      });
    },
  },
  {
    name: "tied_leap_proposal_mark_applied",
    config: {
      description:
        "Mark an approved proposal as applied after LEAP updates were written via MCP yaml tools. Does not perform YAML writes itself.",
      inputSchema: z.object({
        project_root: z.string().optional(),
        proposal_id: z.string().min(1),
      }),
    },
    handler: async (args: { project_root?: string; proposal_id: string }) => {
      return safeLeapCall(() => {
        const r = markApplied(args.project_root ?? process.cwd(), args.proposal_id);
        return r.ok ? { ok: true, proposal: r.proposal } : { ok: false, error: r.error };
      });
    },
  },
  {
    name: "tied_leap_proposal_update",
    config: {
      description:
        "Edit title/summary/leap_hints for a proposal in pending status only.",
      inputSchema: z.object({
        project_root: z.string().optional(),
        proposal_id: z.string().min(1),
        title: z.string().optional(),
        summary: z.string().optional(),
        leap_hints: z.record(z.string(), z.unknown()).optional(),
      }),
    },
    handler: async (args: {
      project_root?: string;
      proposal_id: string;
      title?: string;
      summary?: string;
      leap_hints?: Record<string, unknown>;
    }) => {
      return safeLeapCall(() => {
        const r = updatePendingProposal(args.project_root ?? process.cwd(), args.proposal_id, {
          title: args.title,
          summary: args.summary,
          leap_hints: args.leap_hints,
        });
        return r.ok ? { ok: true, proposal: r.proposal } : { ok: false, error: r.error };
      });
    },
  },
  {
    name: "tied_leap_proposal_queue_snapshot",
    config: {
      description:
        "Return raw queue.json contents for backup or inspection (non-canonical proposals).",
      inputSchema: z.object({
        project_root: z.string().optional(),
      }),
    },
    handler: async (args: { project_root?: string }) => {
      return safeLeapCall(() => loadQueue(args.project_root ?? process.cwd()));
    },
  },
  ...(["feature_specify", "feature_refine", "feature_plan", "feature_tasks", "feature_verify", "feature_close_out"] as const).map((name) => ({
    name,
    config: {
      description: `Feature orchestration lifecycle command ${name}; returns current state and next permitted phase.`,
      inputSchema: z.object({
        feature_identifier: z.string().min(1),
        expected_revision: z.number().int().positive().optional(),
        command_input: z.record(z.string(), z.unknown()).optional(),
      }),
    },
    handler: async (args: {
      feature_identifier: string;
      expected_revision?: number;
      command_input?: Record<string, unknown>;
    }) => textContent(prettyCanonicalJson(
      await handleOrchestrationTool(name, args, { store: new FeatureStore(path.join(getBasePath(), "features")) })
    )),
  })),
  {
    name: "feature_view_render",
    config: {
      description: "Render a deterministic Batch 4 feature view from a reference-only source projection.",
      inputSchema: z.object({
        view_kind: z.string().min(1),
        source_input: z.record(z.string(), z.unknown()),
      }),
    },
    handler: async (args: { view_kind: string; source_input: Record<string, unknown> }) =>
      textContent(prettyCanonicalJson(await handleOrchestrationTool("feature_view_render", args, {
        store: new FeatureStore(path.join(getBasePath(), "features")),
      }))),
  },
  {
    name: "feature_view_check_stale",
    config: {
      description: "Check a generated Batch 4 feature view against current source revisions; fail or warn explicitly.",
      inputSchema: z.object({
        generated_view: z.string(),
        current_source_revision: z.array(z.record(z.string(), z.unknown())),
        policy: z.enum(["fail", "warn"]),
        view_path: z.string().optional(),
      }),
    },
    handler: async (args: {
      generated_view: string;
      current_source_revision: Record<string, unknown>[];
      policy: "fail" | "warn";
      view_path?: string;
    }) => textContent(prettyCanonicalJson(await handleOrchestrationTool("feature_view_check_stale", args, {
      store: new FeatureStore(path.join(getBasePath(), "features")),
    }))),
  },
  {
    name: "feature_create",
    config: {
      description: "Create an idempotent feature package under {TIED_BASE_PATH}/features/.",
      inputSchema: z.object({
        request_key: z.string().min(1),
        title: z.string().min(1),
        mode: z.enum(["greenfield", "brownfield"]).optional(),
      }),
    },
    handler: async (args: { request_key: string; title: string; mode?: "greenfield" | "brownfield" }) => textContent(prettyCanonicalJson(
      await handleOrchestrationTool("feature_create", args, { store: new FeatureStore(path.join(getBasePath(), "features")) })
    )),
  },
  {
    name: "feature_update_canonical",
    config: {
      description: "Delegate canonical REQ, ARCH, or IMPL mutation to the existing TIED YAML surface.",
      inputSchema: z.object({ token: z.string().min(1), updates: z.record(z.string(), z.unknown()) }),
    },
    handler: async (args: { token: string; updates: Record<string, unknown> }) => textContent(prettyCanonicalJson(
      await handleOrchestrationTool("feature_update_canonical", args, {
        store: new FeatureStore(path.join(getBasePath(), "features")),
        delegateCanonical: async (request) => {
          const token = request.token;
          const updates = request.updates;
          if (typeof token !== "string" || typeof updates !== "object" || updates === null || Array.isArray(updates)) {
            return { ok: false, error: "INVALID_INPUT" };
          }
          const index = token.startsWith("REQ-")
            ? "requirements"
            : token.startsWith("ARCH-")
              ? "architecture"
              : token.startsWith("IMPL-")
                ? "implementation"
                : null;
          if (!index) return { ok: false, error: "INVALID_TOKEN" };
          const updated = updateRecord(index, token, updates as Record<string, unknown>);
          if (!updated.ok) return updated;
          return { ...updated, consistency: validateConsistency({ include_detail_files: true, include_pseudocode: true }) };
        },
      })
    )),
  },
  {
    name: "request_evidence_envelope_build",
    config: {
      description:
        "Read-only scan of working/{REQ-TOKEN}/ to build request-evidence-envelope.v1 with classified artifacts and explicit gaps[]. Does not mutate inner producer artifacts.",
      inputSchema: z.object({
        request_token: z.string().min(1),
        project_root: z.string().optional(),
        tied_base_path: z.string().optional(),
        depth_tier: z.enum(["minimal", "integrated", "strict_candidate"]).optional(),
        gate_policy: z.string().optional(),
        output_mode: z.enum(["json", "file"]).optional(),
        corpus_inventory: z.array(z.string()).optional(),
      }),
    },
    handler: async (args: {
      request_token: string;
      project_root?: string;
      tied_base_path?: string;
      depth_tier?: "minimal" | "integrated" | "strict_candidate";
      gate_policy?: string;
      output_mode?: "json" | "file";
      corpus_inventory?: string[];
    }) => {
      try {
        const confirmed = getBasePath();
        const projectRoot = args.project_root ?? path.resolve(confirmed, "..");
        const tiedBasePath = args.tied_base_path ?? confirmed;
        const result = await buildRequestEvidenceEnvelope({
          request_token: args.request_token,
          project_root: projectRoot,
          tied_base_path: tiedBasePath,
          confirmed_tied_base_path: confirmed,
          depth_tier: args.depth_tier,
          gate_policy: args.gate_policy,
          output_mode: args.output_mode,
          corpus_inventory: args.corpus_inventory,
        });
        return textContent(prettyCanonicalJson(result));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return textContent(prettyCanonicalJson({ ok: false, stage: "build", error: msg }));
      }
    },
  },
  {
    name: "request_evidence_envelope_validate",
    config: {
      description:
        "Validate request-evidence-envelope.v1 JSON or path. Rejects forbidden maturity or ranking fields.",
      inputSchema: z.object({
        envelope: z.record(z.string(), z.unknown()).optional(),
        envelope_path: z.string().optional(),
        project_root: z.string().optional(),
        fail_on_error_gaps: z.boolean().optional().default(false).describe(
          "When true, severity:error gaps fail validation (close-out blocking mode).",
        ),
        fail_on_process_gaps: z.boolean().optional().default(false).describe(
          "When true, process-adherence warn gaps fail validation (Wave 5 process-strict mode).",
        ),
      }),
    },
    handler: async (args: {
      envelope?: Record<string, unknown>;
      envelope_path?: string;
      project_root?: string;
      fail_on_error_gaps?: boolean;
      fail_on_process_gaps?: boolean;
    }) => {
      try {
        const result = await validateRequestEvidenceEnvelope({
          envelope: args.envelope as Parameters<typeof validateRequestEvidenceEnvelope>[0]["envelope"],
          envelope_path: args.envelope_path,
          project_root: args.project_root,
          fail_on_error_gaps: args.fail_on_error_gaps ?? false,
          fail_on_process_gaps: args.fail_on_process_gaps ?? false,
        });
        return textContent(prettyCanonicalJson(result));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return textContent(prettyCanonicalJson({ ok: false, diagnostics: [msg] }));
      }
    },
  },
  {
    name: "request_evidence_envelope_patch",
    config: {
      description:
        "Append-only patch of request-evidence-envelope.v1 after a producer write. Monotonic revision with merge key (kind, phase, path).",
      inputSchema: z.object({
        request_token: z.string().min(1),
        project_root: z.string().optional(),
        tied_base_path: z.string().optional(),
        depth_tier: z.enum(["minimal", "integrated", "strict_candidate"]).optional(),
        gate_policy: z.string().optional(),
        generated_at: z.string().optional(),
        expected_revision: z.number().int().nonnegative().optional(),
        artifact: z.object({
          kind: z.string().min(1),
          path: z.string().min(1),
          content_hash: z.string().min(1),
          phase: z.enum(["pre_implementation", "verification", "close_out"]).nullable().optional(),
          schema_version: z.string().nullable().optional(),
          status: z.enum(["present", "not_applicable", "expected_missing", "stale_projection"]).optional(),
          proof_boundaries: z.array(z.string()).optional(),
        }),
        run: z.object({
          run_id: z.string().min(1),
          phase: z.enum(["pre_implementation", "verification", "close_out"]),
          started_at: z.string().nullable().optional(),
          generator: z.string().min(1),
        }).optional(),
      }),
    },
    handler: async (args: Parameters<typeof patchRequestEvidenceEnvelope>[0]) => {
      try {
        const confirmed = getBasePath();
        const projectRoot = args.project_root ?? path.resolve(confirmed, "..");
        const tiedBasePath = args.tied_base_path ?? confirmed;
        const result = await patchRequestEvidenceEnvelope({
          ...args,
          project_root: projectRoot,
          tied_base_path: tiedBasePath,
          confirmed_tied_base_path: confirmed,
        });
        return textContent(prettyCanonicalJson(result));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return textContent(prettyCanonicalJson({ ok: false, gaps: [], error: msg }));
      }
    },
  },
  {
    name: "request_evidence_envelope_independent_proof_patch",
    config: {
      description:
        "Append or update one independent_proofs[] record on request-evidence-envelope.v1 (metadata-only; no foreign verifier execution).",
      inputSchema: z.object({
        request_token: z.string().min(1),
        project_root: z.string().optional(),
        expected_revision: z.number().int().nonnegative().optional(),
        generated_at: z.string().optional(),
        proof: z.object({
          proof_id: z.string().min(1),
          role: z.enum(["asserted", "derived"]),
          proof_kind: z.string().min(1),
          locator: z.object({
            path: z.string().optional(),
            uri: z.string().optional(),
            content_hash: z.string().optional(),
          }),
          verifier_hint: z.string().optional(),
          scope_limits: z.array(z.string()).optional().default([]),
          proof_boundary: z.string(),
          review_status: z.enum(["pending", "verified_offline", "rejected"]),
          reviewer_ref: z.string().optional(),
          reviewed_at: z.string().optional(),
        }),
      }),
    },
    handler: async (args: {
      request_token: string;
      project_root?: string;
      expected_revision?: number;
      generated_at?: string;
      proof: Parameters<typeof patchIndependentProof>[0]["proof"];
    }) => {
      try {
        const confirmed = getBasePath();
        const projectRoot = args.project_root ?? path.resolve(confirmed, "..");
        const result = await patchIndependentProof({
          request_token: args.request_token,
          project_root: projectRoot,
          proof: {
            ...args.proof,
            scope_limits: args.proof.scope_limits ?? [],
          },
          expected_revision: args.expected_revision,
          generated_at: args.generated_at,
        });
        return textContent(prettyCanonicalJson(result));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return textContent(prettyCanonicalJson({ ok: false, gaps: [], error: msg }));
      }
    },
  },
  {
    name: "request_evidence_envelope_backfill",
    config: {
      description:
        "Backfill request-evidence-envelope.v1.json for legacy timestamp client repos; writes not-applicable-receipt.v1.json stubs at minimal depth when inferable from CITDP.",
      inputSchema: z.object({
        request_token: z.string().min(1),
        project_root: z.string().optional(),
        tied_base_path: z.string().optional(),
        depth_tier: z.enum(["minimal", "integrated", "strict_candidate"]).optional(),
        gate_policy: z.string().optional(),
        write_not_applicable_receipts: z.boolean().optional(),
      }),
    },
    handler: async (args: {
      request_token: string;
      project_root?: string;
      tied_base_path?: string;
      depth_tier?: "minimal" | "integrated" | "strict_candidate";
      gate_policy?: string;
      write_not_applicable_receipts?: boolean;
    }) => {
      try {
        const confirmed = getBasePath();
        const projectRoot = args.project_root ?? path.resolve(confirmed, "..");
        const tiedBasePath = args.tied_base_path ?? path.join(projectRoot, "tied");
        const result = await backfillRequestEvidenceEnvelope({
          request_token: args.request_token,
          project_root: projectRoot,
          tied_base_path: tiedBasePath,
          confirmed_tied_base_path: tiedBasePath,
          depth_tier: args.depth_tier,
          gate_policy: args.gate_policy,
          write_not_applicable_receipts: args.write_not_applicable_receipts,
        });
        return textContent(prettyCanonicalJson(result));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return textContent(prettyCanonicalJson({ ok: false, stage: "backfill", error: msg }));
      }
    },
  },
  {
    name: "request_evidence_envelope_batch_collect",
    config: {
      description:
        "Collect envelope gap coverage across batch manifest rows or evaluation-corpus extension rows; emits envelope-gap-report.v1.yaml with per-kind denominators and no score field.",
      inputSchema: z.object({
        manifest_path: z.string().optional(),
        corpus_path: z.string().optional(),
        yaml_out: z.string().min(1),
        project_root: z.string().optional(),
        privacy_tier: z.enum(["shareable_hashed", "operator_local"]).optional(),
        include_absolute_paths: z.boolean().optional(),
        rows: z
          .array(
            z.object({
              project_root: z.string().min(1),
              request_token: z.string().min(1),
              client_alias: z.string().optional(),
              envelope_require_mode: z.enum(["legacy_infer", "require_envelope"]).optional(),
              envelope_artifact: z.string().optional(),
              tied_base_path: z.string().optional(),
            }),
          )
          .optional(),
      }),
    },
    handler: async (args: {
      manifest_path?: string;
      corpus_path?: string;
      yaml_out: string;
      project_root?: string;
      privacy_tier?: "shareable_hashed" | "operator_local";
      include_absolute_paths?: boolean;
      rows?: Array<{
        project_root: string;
        request_token: string;
        client_alias?: string;
        envelope_require_mode?: "legacy_infer" | "require_envelope";
        envelope_artifact?: string;
        tied_base_path?: string;
      }>;
    }) => {
      try {
        const confirmed = getBasePath();
        const projectRoot = args.project_root ?? path.resolve(confirmed, "..");
        const result = await collectEnvelopeGapReport({
          manifestPath: args.manifest_path,
          corpusPath: args.corpus_path,
          rows: args.rows,
          yamlOut: path.isAbsolute(args.yaml_out) ? args.yaml_out : path.join(projectRoot, args.yaml_out),
          projectRoot,
          defaultTiedBasePath: confirmed,
          privacyTier: args.privacy_tier,
          includeAbsolutePaths: args.include_absolute_paths,
        });
        return textContent(prettyCanonicalJson(result));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return textContent(
          prettyCanonicalJson({ ok: false, error: msg, validation_errors: [msg], exit_code: 1 }),
        );
      }
    },
  },
  ...jevPlanSkillsTools,
  ...contextAdaptiveMcpTools,
  ...processCertificationMcpTools,
  ...checklistEvidenceSufficiencyTools,
  ...toolSafetyMcpTools,
  ...projectOperationsMcpTools,
];
