/**
 * [REQ-TIED_SETUP] [REQ-MCP_USAGE_METRICS] [IMPL-TIED_FILES] [IMPL-MCP_USAGE_METRICS]
 * How: TIED_MCP_TOOL_PROFILE partitions registered MCP tools into core vs opt-in stdio entries.
 */

export type ToolProfile = "core" | "optin" | "full";

/** Frozen opt-in set (30d zero-call metrics); new tools default to core unless added here. */
export const OPTIN_TOOL_NAMES: ReadonlySet<string> = new Set([
  "context_adaptive_practice_validate",
  "context_adaptive_profile_validate",
  "context_adaptive_select_practices",
  "context_adaptive_reassess",
  "feature_update_canonical",
  "feature_view_render",
  "feature_view_check_stale",
  "get_requirements_for_decision",
  "quality_security_profile_validate",
  "request_evidence_envelope_batch_collect",
  "request_evidence_envelope_independent_proof_patch",
  "requirement_list_state_guide",
  "stressor_residue_record_validate",
  "test_adequacy_validate",
  "tied_certification_spec_validate",
  "tied_certification_conformance_evaluate",
  "tied_certification_capability_evaluate",
  "tied_certification_independent_assess",
  "tied_certification_adaptive_experiment_run",
  "tied_certification_readiness_report_compose",
  "tied_certification_assessor_pack_generate",
  "tied_cycles",
  "tied_easar_recovery_export_build",
  "tied_easar_validation_suite_run",
  "tied_edpc_failure_state_build",
  "tied_feedback_operational_add",
  "tied_jev_adversarial_triage_pilot",
  "tied_jev_checklist_evidence_sufficiency",
  "tied_leap_proposal_extract_diff",
  "tied_leap_proposal_import_session",
  "tied_leap_proposal_reject",
  "tied_methodology_learning_cohort_export_run",
  "tied_plumb_diff_impact_preview",
  "tied_research_record_add",
  "tied_source_graph_map",
  "tied_token_rename",
  "yaml_detail_list",
]);

const VALID_PROFILES = new Set<ToolProfile>(["core", "optin", "full"]);

export class InvalidToolProfileError extends Error {
  constructor(raw: string) {
    super(
      `Invalid TIED_MCP_TOOL_PROFILE=${JSON.stringify(raw)} (expected core, optin, or full)`,
    );
    this.name = "InvalidToolProfileError";
  }
}

/**
 * Resolve profile from env. Unset/empty → full (backward compatible ad-hoc runs).
 * Invalid values throw InvalidToolProfileError (fail fast at startup).
 */
export function resolveToolProfile(
  env: NodeJS.ProcessEnv = process.env,
): ToolProfile {
  const raw = env.TIED_MCP_TOOL_PROFILE?.trim().toLowerCase();
  if (!raw) {
    return "full";
  }
  if (!VALID_PROFILES.has(raw as ToolProfile)) {
    throw new InvalidToolProfileError(env.TIED_MCP_TOOL_PROFILE ?? raw);
  }
  return raw as ToolProfile;
}

export function shouldRegisterResources(profile: ToolProfile): boolean {
  return profile === "core" || profile === "full";
}

export function selectToolsForProfile<T extends { name: string }>(
  allTools: readonly T[],
  profile: ToolProfile,
): T[] {
  if (profile === "full") {
    return [...allTools];
  }
  if (profile === "optin") {
    return allTools.filter((t) => OPTIN_TOOL_NAMES.has(t.name));
  }
  return allTools.filter((t) => !OPTIN_TOOL_NAMES.has(t.name));
}
