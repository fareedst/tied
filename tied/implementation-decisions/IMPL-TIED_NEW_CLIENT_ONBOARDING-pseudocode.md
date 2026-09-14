# [IMPL-TIED_NEW_CLIENT_ONBOARDING] [ARCH-TIED_NEW_CLIENT_ADHERENCE] [REQ-TIED_NEW_CLIENT_ADHERENCE] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_MIGRATION_TOOLING]
# Summary: Client-root G4 bootstrap audit CLI — compose grammar-v2-default audit, optional consistency, persist tied-new-client-audit.v1 report (post–Track B onboarding).

Grammar-Version: v2

PROC RUN_TIED_NEW_CLIENT_AUDIT(clientRoot, options)
  PRE: clientRoot exists and contains tied/ after copy_files.sh; stdd audit libraries built (mcp-server dist)
  POST: exit 0 iff audit ok and all enforced dimensions pass; exit non-zero otherwise
  EFFECTS: invokes runGrammarV2DefaultAudit at gateStage G4; optional tied_validate_consistency; writes tied-new-client-audit.v1 JSON
  FAILURE_MODES: CLIENT_ROOT_INVALID; AUDIT_DIMENSION_FAILED; CONSISTENCY_FAILED; REPORT_WRITE_FAILED
  TERMINATION: single audit pass per invocation

  # [IMPL-TIED_NEW_CLIENT_ONBOARDING] [REQ-TIED_NEW_CLIENT_ADHERENCE] How: Resolve absolute clientRoot; reject missing tied/ or templates/impl-essence-pseudocode-template.md.
  CALL RESOLVE_CLIENT_ROOT(clientRoot)

  # [IMPL-TIED_NEW_CLIENT_ONBOARDING] [ARCH-TIED_NEW_CLIENT_ADHERENCE] How: Layer A proof — G4 constraint-enforced bootstrap dimensions via existing audit module (not fleet manifest row).
  CALL COMPOSE_G4_CLIENT_ROOT_AUDIT(clientRoot)

  # [IMPL-TIED_NEW_CLIENT_ONBOARDING] [REQ-TIED_NEW_CLIENT_ADHERENCE] How: OD-NC-2 default off — only when options.with_consistency is true.
  IF options.with_consistency THEN CALL RUN_OPTIONAL_TIED_CONSISTENCY(clientRoot)

  # [IMPL-TIED_NEW_CLIENT_ONBOARDING] [REQ-TIED_NEW_CLIENT_ADHERENCE] How: Persist machine report; embed grammar audit envelope; record onboarding-adherent claim boundary (not fleet-migrated-client).
  CALL WRITE_ONBOARDING_AUDIT_REPORT(clientRoot, auditEnvelope, options)

PROC COMPOSE_G4_CLIENT_ROOT_AUDIT(clientRoot)
  PRE: RESOLVE_CLIENT_ROOT succeeded
  POST: auditEnvelope.ok reflects runGrammarV2DefaultAudit ok at gateStage G4 with constraint_flow enforced
  EFFECTS: delegates to scripts/lib/audit-grammar-v2-default.mjs runGrammarV2DefaultAudit
  FAILURE_MODES: AUDIT_COMPOSE_FAILED

  DATA auditResult = runGrammarV2DefaultAudit(clientRoot, { gateStage: "G4" })
  RETURN auditResult

PROC RUN_OPTIONAL_TIED_CONSISTENCY(clientRoot)
  PRE: options.with_consistency true; TIED_BASE_PATH points at clientRoot/tied
  POST: consistency errors fail audit pass when flag set
  EFFECTS: invokes tied_validate_consistency via MCP/cli against client tied/
  FAILURE_MODES: CONSISTENCY_TOOL_UNAVAILABLE; CONSISTENCY_GRAPH_FAILED

  CALL tied_validate_consistency(TIED_BASE_PATH = clientRoot + "/tied")

PROC WRITE_ONBOARDING_AUDIT_REPORT(clientRoot, auditEnvelope, options)
  PRE: auditEnvelope schema_version grammar-v2-default-audit.v1 present
  POST: report file validates against tied-new-client-audit.v1.schema.json
  EFFECTS: writes JSON under options.reportPath or client working/ default
  FAILURE_MODES: REPORT_WRITE_FAILED; REPORT_SCHEMA_MISMATCH

  DATA report = {
    schema_version: "tied-new-client-audit.v1",
    generated_at: ISO8601_NOW(),
    client_root: clientRoot,
    ok: auditEnvelope.ok AND optionalConsistencyOk,
    gate_stage: "G4",
    with_consistency: options.with_consistency == true,
    proof_boundary: "onboarding-adherent bootstrap only; not fleet-migrated-client without G3 receipts",
    grammar_audit: auditEnvelope
  }
  WRITE report TO options.reportPath
