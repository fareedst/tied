# IMPL-TIED_DAE_INCORPORATION — essence_pseudocode

<!-- [IMPL-TIED_DAE_INCORPORATION] [ARCH-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION] — Program orchestration: wave-gated DAE pattern delivery on existing MCP/CLI gate stack. -->

PROGRAM DAE_INCORPORATION_ORCHESTRATOR
  // [IMPL-TIED_DAE_INCORPORATION] [ARCH-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION]
  // How: Reads linked PLAN wave id; refuses code waves until pre_implementation gate allows Tracker + CITDP.

  INPUT working_req_token
  INPUT wave_id
  INPUT tracker_path
  INPUT citdp_path
  PRE tracker_path exists AND citdp_path exists
  POST wave deliverables recorded in PLAN disposition table OR wave marked deferred with sponsor waiver
  EFFECTS PLAN disposition updated; optional working/{REQ}/gates receipts
  FAILURE_MODES invalid_wave_id; gate_blocked; mcp_unavailable

  CALL RESOLVE_WAVE_SCOPE(wave_id) -> wave_spec
  CALL tied_checklist_gate_validate(phase=pre_implementation, tracker_path, citdp_path)
  IF gate.allowed == false THEN
    EXIT non_zero  // DAE Step 0 parity — [REQ-TIED_DAE_INCORPORATION] SC-DAE-WAVE1-ERGONOMICS
  END IF

  SWITCH wave_id
    CASE wave_0_maintain
      // [REQ-TIED_DAE_INCORPORATION] SC-DAE-WAVE0-MAINTAIN — document-only; regression via existing gate tests
      CALL DOCUMENT_SHIPPED_GATE_SURFACE()
      CALL UPDATE_COORDINATOR_GUIDE_STATUS_MATRIX()
    CASE wave_1_adherence_ergonomics
      // [ARCH-TIED_DAE_INCORPORATION] centralized CLI gate composition
      CALL IMPLEMENT_GATE_CHECK_CLI()
      CALL IMPLEMENT_TIED_NEXT_RECOMMENDATION()
      CALL ALIGN_HANDOFF_YAML_TO_ENVELOPE_V1()
    CASE wave_2_quick_wins
      CALL IMPLEMENT_BRANCH_HYGIENE_CHECK()
      CALL IMPLEMENT_PSEUDOCODE_LEAKAGE_LINT()
      CALL EXTEND_CITDP_TEMPLATE(size, gate_profile, express_lane)
      CALL OPTIONAL_DIFF_SCOPED_CRAP_HOOK()
    CASE wave_3_validation_depth
      CALL IMPLEMENT_FOUR_WAY_CLOSURE_JOIN_REPORT()
      CALL UPDATE_PSEUDOCODE_GUIDE_MECHANICAL_VS_JUDGMENT()
    CASE wave_4_verification_charter
      CALL OPTIONAL_CHARTER_MUTATION_CACHE()
      CALL HARDEN_DISJOINT_VERIFIER_IN_GATE_VALIDATE()
      CALL OPTIONAL_GAUNTLET_BLOCK_ON_CITDP()
    CASE wave_5_graph_integrity
      CALL EXTEND_ONTOLOGY_CONSISTENCY_RULES()
      CALL IMPLEMENT_CHARTER_COMPLIANCE_TABLE_AT_ARCH()
    DEFAULT
      FAILURE invalid_wave_id
  END SWITCH

  CALL tied_validate_consistency()
  CALL UPDATE_PLAN_WAVE_DISPOSITION(wave_id)
END PROGRAM

ACTIVE PROCEDURE IMPLEMENT_GATE_CHECK_CLI
  // [IMPL-TIED_DAE_INCORPORATION] [ARCH-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION]
  // How: Compose prior-slug disposition + tied_checklist_gate_validate (+ optional branch hard fail) into one CLI exit — W1a/W2a.
  INPUT request_token
  INPUT phase
  INPUT slug OPTIONAL
  INPUT tracker_path
  INPUT citdp_path
  INPUT check_branch BOOLEAN DEFAULT false
  PRE Node MCP server available OR documented manual path
  PRE phase IN {pre_implementation, verification, close_out}
  POST CLI returns 0 iff tied_checklist_gate_validate.allowed == true
  EFFECTS stdout JSON summary; optional receipt under working/{REQ}/gates/
  FAILURE_MODES
    mcp_unavailable -> exit 2
    missing_tracker_or_citdp -> exit 2
    gate_not_allowed -> exit 1 with reasons[]
  DATA_TRANSITION none
  CALL RESOLVE_TRACKER_AND_CITDP(request_token, tracker_path, citdp_path)
  IF slug PRESENT THEN
    CALL ASSERT_PRIOR_SLUG_DISPOSITION(tracker, slug)
  END IF
  CALL tied_checklist_gate_validate(phase, tracker, citdp) -> gate
  IF check_branch THEN
    CALL IMPLEMENT_BRANCH_HYGIENE_CHECK(mode=hard)
  END IF
  IF gate.allowed == false THEN EXIT 1 ELSE EXIT 0 END IF
END ACTIVE PROCEDURE

ACTIVE PROCEDURE IMPLEMENT_TIED_NEXT_RECOMMENDATION
  // [IMPL-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION] — How: Deterministic first pending checklist slug + open REQ tokens — W1b.
  INPUT project_root
  INPUT request_token OPTIONAL
  PRE project_root is a readable workspace
  POST exactly one recommended slug printed when pending steps exist
  EFFECTS stdout recommendation only (no Tracker mutation)
  FAILURE_MODES
    ambiguous_trackers_without_token -> exit 2
    no_pending_slug -> exit 1
  CALL DISCOVER_TRACKER_PATHS(project_root, request_token) -> tracker_paths
  IF tracker_paths.count > 1 AND request_token ABSENT THEN EXIT 2 WITH tracker_paths END IF
  CALL LOAD_TRACKER(tracker_paths[0]) -> tracker
  CALL FIRST_PENDING_SLUG_IN_CHECKLIST_ORDER(tracker) -> slug
  CALL COLLECT_OPEN_REQ_TOKENS(tracker_paths) -> open_tokens  // execution_evidence.request + pending/in_progress steps
  CALL COLLECT_CITDP_PHASES(open_tokens) -> citdp_phases  // tied/citdp/CITDP-{TOKEN}.yaml record_identity.phase
  CALL GIT_CURRENT_BRANCH_INFORMATIONAL(project_root) -> current_branch
  PRINT slug, open_tokens, citdp_phases, current_branch, rationale
END ACTIVE PROCEDURE

ACTIVE PROCEDURE ALIGN_HANDOFF_YAML_TO_ENVELOPE_V1
  // [IMPL-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION] — How: Additive working/{REQ}/handoffs/{phase}.yaml; does not replace envelope — W1c.
  INPUT request_token
  INPUT phase
  INPUT criteria_list
  PRE envelope v1 docs remain authoritative for close-out packaging
  POST handoff YAML schema_version 1 written under handoffs/
  EFFECTS creates/updates handoffs/{phase}.yaml only
  FAILURE_MODES invalid_schema -> exit 1; missing_required_criterion -> exit 1
  CALL WRITE_HANDOFF_YAML(path=working/{request_token}/handoffs/{phase}.yaml, criteria_list)
  CALL VALIDATE_HANDOFF_SCHEMA(path)
  // Envelope tools request_evidence_envelope_* unchanged
END ACTIVE PROCEDURE

ACTIVE PROCEDURE IMPLEMENT_BRANCH_HYGIENE_CHECK
  // [IMPL-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION] — How: Compare git HEAD to CITDP/Tracker branch field — W2a.
  INPUT expected_branch
  INPUT cwd
  INPUT mode  // warn | hard | skip
  PRE mode == skip OR git available
  POST returns { ok, current, expected }
  EFFECTS none on git state
  FAILURE_MODES not_a_git_repo -> exit 2; mismatch -> exit 1 when mode=hard
  CALL git_rev_parse_abbrev_ref_HEAD(cwd) -> current
  IF mode == skip OR expected_branch ABSENT THEN RETURN ok END IF
  IF current != expected_branch AND mode == hard THEN EXIT 1 END IF
END ACTIVE PROCEDURE

ACTIVE PROCEDURE IMPLEMENT_PSEUDOCODE_LEAKAGE_LINT
  // [IMPL-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION] — How: Flag host syntax/SQL/paths unless DATA or leakage-ok — W2b.
  INPUT essence_pseudocode
  INPUT gate_mode BOOLEAN
  PRE essence_pseudocode is text
  POST diagnostics[] emitted; blocking when gate_mode and error severity present
  EFFECTS none on sidecar bytes unless caller persists
  FAILURE_MODES leak_detected -> error diagnostic
  CALL SCAN_LEAKAGE_PATTERNS(essence_pseudocode) -> diagnostics
END ACTIVE PROCEDURE

ACTIVE PROCEDURE EXTEND_CITDP_TEMPLATE
  // [IMPL-TIED_DAE_INCORPORATION] [ARCH-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION]
  // How: Add size, gate_profile, express_lane with XS-only express and charter safety override — W2c.
  INPUT citdp_draft
  PRE size IN {XS,S,M,L,XL} when present
  POST express_lane true only when size XS AND charter_allows
  EFFECTS CITDP template/docs updated
  FAILURE_MODES express_lane_with_non_xs -> reject
END ACTIVE PROCEDURE

ACTIVE PROCEDURE OPTIONAL_DIFF_SCOPED_CRAP_HOOK
  // [IMPL-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION] — How: Optional diff-scoped change-risk report at verification-gate; advisory at traceable-commit — W2d.
  INPUT diff_paths
  INPUT threshold
  INPUT enabled BOOLEAN DEFAULT false
  INPUT hook_slug  // verification-gate | traceable-commit
  PRE enabled == false OR coverage map available
  PRE CITDP.diff_scoped_crap == true to run after quality_evidence_collect_manifest
  POST report path working/{REQ}/evidence/diff-scoped-crap-{timestamp}.json when enabled
  EFFECTS evidence artifact only; compose coverage map metadata + diff paths from git (listGitDiffPathsInRepo) or explicit hook override; default off when CITDP diff_scoped_crap false
  CALL runOptionalDiffScopedCrapAfterManifest() from collectVerificationEvidence after successful manifest (mcp-server/src/diff-scoped-crap-hook.ts)
  FAILURE_MODES above_threshold -> fail when hook_slug=verification-gate AND CITDP.crap_block; warn when traceable-commit
END ACTIVE PROCEDURE

ACTIVE PROCEDURE WIRE_AGENTSTREAM_DAE_GATE_PREFLIGHT
  // [IMPL-TIED_DAE_INCORPORATION] [ARCH-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION] — How: Optional post-tiedpreflight pre-turn gate check — R3b shipped (dae-gate-preflight.ts + executor-dry-run/live-executor).
  INPUT batch_request_token
  INPUT agentstream_config
  PRE tiedpreflight.status == ok
  PRE agentstream_config.dae_gate_check == true OR env AGENTSTREAM_DAE_GATE_CHECK == 1
  POST first dispatcher turn starts only when tied gate check exit 0
  EFFECTS spawn tied gate check --phase pre_implementation; exit 2 on misconfig (same as preflight fail path)
  FAILURE_MODES gate exit 1 -> block batch; exit 2 -> document skip flags (-y, AGENTSTREAM_SKIP_TIED_MCP_PREFLIGHT)
  CALL IMPLEMENT_GATE_CHECK_CLI(phase=pre_implementation, request_token=batch_request_token)
END ACTIVE PROCEDURE

ACTIVE PROCEDURE IMPLEMENT_FOUR_WAY_CLOSURE_JOIN_REPORT
  // [IMPL-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION] — How: Criterion↔block↔test↔code join report — W3a.
  INPUT req_token
  INPUT impl_tokens
  INPUT gate_mode BOOLEAN
  PRE REQ satisfaction_criteria ids stable
  POST report JSON under working/{REQ}/evidence/
  EFFECTS evidence artifact
  FAILURE_MODES orphan_block_or_unmapped_criterion -> ok false when gate_mode
  CALL JOIN_CRITERIA_TO_BLOCKS(req_token, impl_tokens)
  CALL JOIN_BLOCKS_TO_TESTS(impl_tokens)
  CALL JOIN_BLOCKS_TO_CODE(impl_tokens)
  CALL pseudocode_analyze(
    closure_join_report=true,
    req_token,
    impl_tokens,
    project_root,
    test_globs OPTIONAL,
    code_globs OPTIONAL,
    gate_mode,
    persist_closure_report DEFAULT true
  ) -> report.sections.closure_join
  // Shared lib: mcp-server/src/analysis/closure-join-report.ts (single join engine; no duplicate algorithm)
END ACTIVE PROCEDURE

ACTIVE PROCEDURE UPDATE_PSEUDOCODE_GUIDE_MECHANICAL_VS_JUDGMENT
  // [IMPL-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION] — How: Document never-LLM vs always-LLM boundary — W3b.
  INPUT guide_path  // tied/docs/pseudocode-writing-and-validation.md
  PRE guide_path writable in methodology source
  POST section present distinguishing mechanical vs judgment checks
  EFFECTS documentation only
END ACTIVE PROCEDURE

ACTIVE PROCEDURE OPTIONAL_CHARTER_MUTATION_CACHE
  // [IMPL-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION] — How: Diff-scoped unit mutation after green; charter-off default — W4a.
  INPUT verification_charter BOOLEAN
  PRE verification_charter == true to run
  POST cache manifest + score; may fail verification-gate
  EFFECTS cache dir under project policy path
END ACTIVE PROCEDURE

ACTIVE PROCEDURE HARDEN_DISJOINT_VERIFIER_IN_GATE_VALIDATE
  // [IMPL-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION] — How: Fail gate when verifier session == implementer without waiver — W4b.
  INPUT citdp
  INPUT ledger
  PRE citdp.disjoint_verifier == required to enforce
  POST allowed false when session ids equal without waiver
  EFFECTS gate reasons[] include disjoint_verifier
  FAILURE_MODES same_session_without_waiver -> gate blocked
END ACTIVE PROCEDURE

ACTIVE PROCEDURE OPTIONAL_GAUNTLET_BLOCK_ON_CITDP
  // [IMPL-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION] — How: Optional gauntlet probes after composition green — W4c.
  INPUT citdp_or_impl_gauntlet_block
  PRE block present to run
  POST probes executed; results in evidence/
  EFFECTS evidence only
END ACTIVE PROCEDURE

ACTIVE PROCEDURE EXTEND_ONTOLOGY_CONSISTENCY_RULES
  // [IMPL-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION] — How: Inverse/SCC/functional/disjoint rules on token graph — W5a.
  INPUT tied_base_path
  PRE indexes readable
  POST structured issues; ok false on cycle or duplicate detail
  EFFECTS none on YAML unless caller fixes
  FAILURE_MODES dependency_cycle; duplicate_detail_file
  CALL tied_validate_consistency(ontology_rules=true) OR sibling tied_validate_ontology() sharing same rule engine
END ACTIVE PROCEDURE

ACTIVE PROCEDURE IMPLEMENT_CHARTER_COMPLIANCE_TABLE_AT_ARCH
  // [IMPL-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION] — How: Immutable scope table before gate-pseudocode-validation — W5b.
  INPUT touch_set
  INPUT immutable_arch_req_tokens
  PRE author-architecture or risk-assessment in progress
  POST compliance table artifact; blocks gate-pseudocode-validation on violation
  EFFECTS working/{REQ}/evidence/charter-compliance.json
  FAILURE_MODES immutable_touch_without_arch_approval -> block
END ACTIVE PROCEDURE

ACTIVE PROCEDURE DOCUMENT_SHIPPED_GATE_SURFACE
  // [IMPL-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION] — How: Wave 0 ownership note for shipped gate tools — W0a.
  INPUT shipped_tool_list
  PRE tools already covered by REQ-TIED_CHECKLIST_GATE_ENFORCEMENT tests
  POST PLAN Artifacts ownership row current
  EFFECTS documentation only
END ACTIVE PROCEDURE

ACTIVE PROCEDURE UPDATE_COORDINATOR_GUIDE_STATUS_MATRIX
  // [IMPL-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION] — How: Refresh coordinator Status column — W0b.
  INPUT adoption_rows
  PRE coordinator guide role banner present
  POST Status cells match shipped anchors
  EFFECTS docs/comparisons/dae-mechanisms-for-tied-improvement.md only
END ACTIVE PROCEDURE
