# [IMPL-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [ARCH-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [REQ-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] — Blueprint C evidence sufficiency pre-gate (Pattern 11 & 5).

Grammar-Version: v2

## Configuration and opt-in

- [IMPL-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [ARCH-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [REQ-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] Resolve opt-in from env and manifest; default off; env overrides manifest.
procedure RESOLVE_CHECKLIST_EVIDENCE_SUFFICIENCY_CONFIG:
  # [IMPL-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [ARCH-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [REQ-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] How: TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY 1/true or jev.checklist_evidence_sufficiency true; invalid manifest → diagnostic and off.
  Contract:
    INPUT: env map, projectRoot for tied-project/config.yaml
    OUTPUT: { enabled, enabled_source, diagnostics[] }
    PRE: true
    POST: on success, enabled false when no truthy env or manifest
    EFFECTS: pure
    TERMINATION: total
  READ env TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY
  IF env explicitly false or 0 THEN RETURN enabled false with env override
  IF env truthy THEN RETURN enabled true
  READ manifest jev.checklist_evidence_sufficiency boolean true only
  RETURN enabled from manifest with diagnostics on invalid flag

## Slug scope and evidence extraction

procedure DERIVE_PRE_GATE_TARGET_SLUGS:
  # [IMPL-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [ARCH-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] How: union derivePhaseAwareSlugs(depth, phase) with required_step_slugs from gate MCP args.
  Contract:
    INPUT: citdp adversarial depth_tier, gate phase, optional required_step_slugs[]
    OUTPUT: slug[] unique ordered
    PRE: depth_tier present in citdp
    POST: slug set matches validateChecklistGate requiredSlugs
    EFFECTS: pure
  COMPUTE autoSlugs FROM depth and phase
  UNION with required_step_slugs
  RETURN slug list

procedure EXTRACT_GATE_EVIDENCE_STATE:
  # [IMPL-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [ARCH-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] How: per slug collect step evidence fields and capped excerpt for Jev state.
  Contract:
    INPUT: tracker, slug, step metadata from checklist
    OUTPUT: { criterion_text, evidence_excerpt, required_tokens[] }
    PRE: tracker is record
    POST: excerpt length <= JEV max state policy
    EFFECTS: pure
  COLLECT evidence from step evidence refs tracking fields
  BUILD compact state for jevDecide

## Tier-1 deterministic pre-checks

procedure RUN_DETERMINISTIC_EVIDENCE_PRECHECKS:
  # [IMPL-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [ARCH-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [REQ-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] How: empty whitespace reject; required token regex when contract lists tokens.
  Contract:
    INPUT: evidence_excerpt, required_tokens[]
    OUTPUT: { ok, reasons[], remediation_hints[] }
    PRE: feature enabled
    POST: ok false when empty or missing required token literals
    EFFECTS: pure
  IF excerpt is blank THEN reject with remediation command_output
  FOR each required token IF missing in excerpt THEN reject with remediation token_citations

## Jev fan-out and thresholds

procedure RUN_JEV_EVIDENCE_SUFFICIENCY_FANOUT:
  # [IMPL-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [ARCH-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] How: three questions substantive noul tokens noul score 1-5; fail-open on jevDecide skip or error.
  Contract:
    INPUT: compact state, jevConfig, contextMeta for trace
    OUTPUT: { nouls, score, jev_skipped, jev_skip_reason?, observation }
    PRE: state redacted and size capped
    POST: on skip, jev_skipped true and caller proceeds to authoritative gate
    FAILURE_MODES: no_credentials, state_too_large, http_error
    EFFECTS: Http | Async
  CALL jevDecide with noul_evidence_substantive noul_tokens_present score_evidence_completeness
  PARSE answers or return skip observation

procedure APPLY_SUFFICIENCY_THRESHOLDS:
  # [IMPL-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [ARCH-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [REQ-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] How: reject when substantive < 0.60 OR score <= 2 OR token noul < 0.60 when required.
  Contract:
    INPUT: parsed Jev answers, token question required flag
    OUTPUT: { pass, reasons[], remediation_hints[] }
    PRE: thresholds pinned in code
    EFFECTS: pure
  EVALUATE threshold rules
  MAP failure kind to remediation_hints

procedure EMIT_PRE_GATE_DISPOSITION:
  # [IMPL-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [ARCH-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] How: JSON pre_gate jev_evidence_sufficiency; never gate_receipt or allowed true from Jev alone.
  Contract:
    INPUT: aggregate slug results, phase
    OUTPUT: PreGateDisposition JSON
    PRE: any slug failed
    POST: response excludes gate_receipt field
    EFFECTS: pure
  BUILD failed_step_slugs reasons user_message jev_observation

## Gate hook and trace

procedure HOOK_CHECKLIST_GATE_VALIDATE:
  # [IMPL-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [ARCH-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] How: when config enabled run pre-gate per target slug before validateChecklistGate else unchanged.
  Contract:
    INPUT: existing gate MCP args
    OUTPUT: gate result OR pre-gate reject short-circuit
    PRE: tied_checklist_gate_validate entry
    POST: on pass or feature off delegate to validateChecklistGate
    EFFECTS: may short-circuit without authoritative validate
  IF NOT enabled THEN CALL validateChecklistGate unchanged
  FOR each target slug RUN precheck and optional Jev
  IF any fail THEN RETURN pre-gate disposition without validateChecklistGate

procedure APPEND_SYSTEM_ONE_DECIDE_TRACE:
  # [IMPL-TIED_JEV_DECISION_COPROCESSOR] [IMPL-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [REQ-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] How: when JEV_DECIDE_TRACE=1 append system-one-decide-trace.v1 JSONL with context_meta gate_phase step_slug.
  Contract:
    INPUT: jevDecide request response latency contextMeta
    OUTPUT: append to JEV_DECIDE_TRACE_PATH or stderr summary
    PRE: trace env opt-in
    POST: wire state is post-redaction only
    EFFECTS: file append optional
  WRITE one JSON line per decide call
