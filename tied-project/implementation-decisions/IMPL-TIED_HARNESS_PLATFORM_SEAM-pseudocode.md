# [IMPL-TIED_HARNESS_PLATFORM_SEAM] [ARCH-TIED_HARNESS_PLATFORM_SEAM] [REQ-TIED_HARNESS_PLATFORM_SEAM] — Phased harness–platform seam docs and optional preflight hooks.

## DOCUMENT_SEAM_GUIDANCE

# [IMPL-TIED_HARNESS_PLATFORM_SEAM] [ARCH-TIED_HARNESS_PLATFORM_SEAM] [REQ-TIED_HARNESS_PLATFORM_SEAM] How: planning-only add-feature mints tokens and PLAN; build-plan executes reversible slices without replacing MCP gate authority.

PRE:
  sponsor_comparison_doc_read
  depth_tier_minimal_unless_behavior_changing_code
POST:
  REQ_ARCH_IMPL_on_disk
  PLAN_phased_slices
  tracker_and_citdp_for_gates

SLICE_A_SESSION_BOOTSTRAP:
  # [IMPL-TIED_HARNESS_PLATFORM_SEAM] [ARCH-TIED_HARNESS_PLATFORM_SEAM] [REQ-TIED_HARNESS_PLATFORM_SEAM] How: strengthen operator path to tied_config_get_base_path before yaml_index_* writes.
  INPUT: AGENTS.md, tied-yaml skill, agentstream README preflight flags
  OUTPUT: doc and/or opt-in preflight chain documenting TIED_BASE_PATH verification
  EFFECTS: reduces wrong-tree MCP writes class of defect
  FAILURE_MODES: preflight enabled without valid layout blocks batch runs — document skip flags

SLICE_B_PROMPT_HARNESS_PROFILES:
  # [IMPL-TIED_HARNESS_PLATFORM_SEAM] [ARCH-TIED_HARNESS_PLATFORM_SEAM] [REQ-TIED_HARNESS_PLATFORM_SEAM] How: extend fresh-client-prompt-activation-map with TIED applicability column; no waiver language in delegation.
  INPUT: prompt-type taxonomy, REQ-PROMPT_TYPE_GLOBAL_SKILLS
  OUTPUT: explicit TIED-tracked vs non-tied prompt types in activation map
  POST: delegation instructions must not imply tied_checklist_gate_validate waivers

SLICE_C_AGENTSTREAM_PREFLIGHT_CHAIN:
  # [IMPL-TIED_HARNESS_PLATFORM_SEAM] [ARCH-TIED_HARNESS_PLATFORM_SEAM] [REQ-TIED_HARNESS_PLATFORM_SEAM] How: document DAE gate preflight + Jev harness tool gate as middleware composing with checklist gates.
  INPUT: agentstream README, agentstream vocab
  OUTPUT: compose-don't-replace section cross-linking tied_checklist_gate_validate

SLICE_D_AUTHORITY_CHECKLIST:
  # [IMPL-TIED_HARNESS_PLATFORM_SEAM] [ARCH-TIED_HARNESS_PLATFORM_SEAM] [REQ-TIED_HARNESS_PLATFORM_SEAM] How: committed checklist under tied-project/working/REQ-TIED_HARNESS_PLATFORM_SEAM/.
  INPUT: traefik comparison doc, sponsor-agent-relationship vocab
  OUTPUT: authority-boundary-operator-checklist.md with harness vs platform-adjacent columns

SLICE_E_MATRIX_ROW_13:
  # [IMPL-TIED_HARNESS_PLATFORM_SEAM] [ARCH-TIED_HARNESS_PLATFORM_SEAM] [REQ-TIED_HARNESS_PLATFORM_SEAM] How: fill row 13 mechanism cells only where concrete; respect REQ-TIED_METHODOLOGY_COMPOSITION_MATRIX scope.
  INPUT: methodology-composition-matrix.md row 13
  OUTPUT: updated mechanism cells without codegen broadening

SLICE_F_TOOL_INPUT_CROSSREF:
  # [IMPL-TIED_HARNESS_PLATFORM_SEAM] [ARCH-TIED_HARNESS_PLATFORM_SEAM] [REQ-TIED_HARNESS_PLATFORM_SEAM] How: one-line tie-in to closed REQ-TIED_TOOL_INPUT_COMPATIBILITY (structured record + TIED_CLI_HINDRANCE) in harness MCP seam docs.
  INPUT: REQ-TIED_TOOL_INPUT_COMPATIBILITY close-out
  OUTPUT: cross-reference in session bootstrap / tied-yaml docs where tool-call seam is discussed

VALIDATE_STACK:
  # [IMPL-TIED_HARNESS_PLATFORM_SEAM] [ARCH-TIED_HARNESS_PLATFORM_SEAM] [REQ-TIED_HARNESS_PLATFORM_SEAM] How: lint changed YAML; pseudocode_validate; tied_validate_consistency after build-plan mutations.
  CALL pseudocode_validate gate_mode
  CALL tied_validate_consistency
