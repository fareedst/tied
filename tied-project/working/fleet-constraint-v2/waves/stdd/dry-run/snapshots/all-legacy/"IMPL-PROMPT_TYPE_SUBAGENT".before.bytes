# [IMPL-PROMPT_TYPE_SUBAGENT] [ARCH-PROMPT_TYPE_SUBAGENT] [REQ-PROMPT_TYPE_SUBAGENT]
# Summary: Validate the explicit-only Task wrappers for all 13 leaf prompt types, plus the plan-refine-build sequence orchestrator, and their clean-context workflow contracts.

Contract:
  INPUT: agent_markdown_by_leaf; sequence_agent_markdown; canonical_skill_markdown_by_leaf; test_contract
  PRE: each of the 13 leaf agent files and plan-refine-build.md are readable; matching canonical skills exist; test_contract names required clauses
  OUTPUT: pass or contract_violation diagnostics
  POST: pass means each leaf wrapper and the sequence orchestrator have frontmatter, delegation, type-specific gates, safety boundary, and parent handoff contract
  FAILURE_MODES: missing_agent; invalid_frontmatter; invalid_activation; missing_skill_reference; missing_gate; missing_safety_boundary; missing_return_contract; invalid_sequence
  DATA: frontmatter; prompt_body; required_clauses; leaf_prompt_types; sequence_order
  EFFECTS: IO
  TERMINATION: total

procedure VALIDATE_PROMPT_TYPE_SUBAGENT_CONTRACT(agent_markdown, canonical_skill_markdown, test_contract):
  # [IMPL-PROMPT_TYPE_SUBAGENT] [ARCH-PROMPT_TYPE_SUBAGENT] [REQ-PROMPT_TYPE_SUBAGENT] — How: verify each agent file is an explicit-only Task wrapper around its canonical leaf skill.
  Contract:
    INPUT: agent_markdown; canonical_skill_markdown; test_contract
    PRE: all inputs are readable text for one leaf prompt type
    OUTPUT: pass or contract_violation diagnostics
    POST: pass means each required frontmatter and body clause is present for that leaf
    FAILURE_MODES: invalid_frontmatter; invalid_activation; missing_skill_reference; missing_gate; missing_safety_boundary; missing_return_contract
    DATA: parsed_frontmatter; prompt_body; required_clauses; diagnostics; leaf_name
    DATA_TRANSITION: unread_text -> parsed_frontmatter and prompt_body; required_clauses -> pass or contract_violation diagnostics
    EFFECTS: IO
    TERMINATION: total
  PARSE frontmatter from agent_markdown
  CHECK name equals the leaf prompt type
  CHECK is_background equals false
  CHECK readonly equals true for question and other; false for the other 11 leaves
  CHECK description contains positive and negative activation guidance
  CHECK description excludes proactive activation language
  CHECK prompt_body references tools/bundled-prompt-type-skills/{leaf}/SKILL.md
  CHECK prompt_body forbids clipboard and automatic Git mutation
  CHECK prompt_body requires explicit TIED applicability
  CHECK prompt_body does not use a triple-colon payload delimiter
  CHECK prompt_body names invocation remainder or linked plan as required by the leaf
  APPLY type-specific gate and handoff checks from test_contract
  RETURN pass or diagnostics

procedure DISPATCH_PROMPT_TYPE_SEQUENCE(request_envelope):
  # [IMPL-PROMPT_TYPE_SUBAGENT] [ARCH-PROMPT_TYPE_SUBAGENT] [REQ-PROMPT_TYPE_SUBAGENT] — How: verify the sequencer Task-launches the three leaf wrappers in order and stops on a failed gate.
  Contract:
    INPUT: request_envelope; plan-new-feature child; refine-plan child; build-plan child
    PRE: request_envelope includes the invocation remainder; the three leaf Task wrappers exist
    OUTPUT: aggregated parent_handoff or incomplete evidence
    POST: children ran in order plan-new-feature then refine-plan then build-plan; later Implement gates did not start after a failed earlier Plan gate
    FAILURE_MODES: child_incomplete; parallel_dispatch; skipped_step; orchestrator_implemented_feature
    DATA: child_handoffs; sequence_order; merge_gates
    DATA_TRANSITION: invocation remainder -> plan-new-feature handoff -> refine-plan linked plan -> build-plan linked plan -> aggregated parent_handoff
    EFFECTS: IO
    TERMINATION: total
  CHECK sequence agent name equals plan-refine-build
  CHECK sequence is foreground and writable
  FORBID implementing the feature in the orchestrator context
  LAUNCH Task subagent_type plan-new-feature with the invocation remainder
  IF child incomplete: RETURN incomplete
  LAUNCH Task subagent_type refine-plan with the prior plan as the linked plan
  IF child incomplete: RETURN incomplete
  LAUNCH Task subagent_type build-plan with the refined plan as the linked plan
  RETURN aggregated parent_handoff

procedure REPORT_PROMPT_TYPE_SUBAGENT_RESULT(execution_evidence):
  # [IMPL-PROMPT_TYPE_SUBAGENT] [ARCH-PROMPT_TYPE_SUBAGENT] [REQ-PROMPT_TYPE_SUBAGENT] — How: return auditable workflow evidence to the parent without overstating completion.
  Contract:
    INPUT: execution_evidence
    PRE: execution_evidence records completed gates and validation outcomes for the selected leaf or sequence
    OUTPUT: parent_handoff
    POST: parent_handoff names type-specific completion evidence and remaining risks without overstating success
    DATA: execution_evidence; parent_handoff
    DATA_TRANSITION: execution_evidence -> parent_handoff
    FAILURE_MODES: incomplete_when_validation_failed
    EFFECTS: pure
    TERMINATION: total
  INCLUDE resolved terms when sponsor wording was restated
  INCLUDE remaining risks, questions, or blocked gates
  IF the work is the plan-refine-build sequence:
    INCLUDE ordered child results for plan-new-feature, refine-plan, and build-plan
  IF the leaf performs TIED implementation or close-out:
    INCLUDE Tracker or CITDP status when the leaf uses them
    INCLUDE tests and validation results
    IF verification-gate or tied_validate_consistency failed:
      MARK completion as incomplete
  IF the leaf is non-tied or minimal:
    INCLUDE confirmation that no TIED writes occurred
  RETURN parent_handoff
