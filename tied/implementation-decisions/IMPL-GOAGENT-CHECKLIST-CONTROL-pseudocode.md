# [IMPL-GOAGENT-CHECKLIST-CONTROL] [ARCH-GOAGENT-CHECKLIST-CONTROL] [REQ-GOAGENT-CHECKLIST-CONTROL]
# Summary: Parse explicit agentstream_control JSON from a completed turn and apply only validated checklist routing actions.

# How: Contract for captured assistant text and loaded checklist slugs.
INPUT: turn_text, current_turn, checklist_turns, known_slugs, running_session
OUTPUT: next_queue, diagnostics, or validation_error
DATA: ControlDecision { schema_version, action, target, reason, evidence }

# How: Find explicit fenced JSON only; prose is ignored.
procedure PARSE_CONTROL(turn_text):
  1. SCAN fenced json blocks from latest to earliest
  2. IF block decodes and has agentstream_control THEN RETURN decision
  3. RETURN no_control

# How: Validate schema and target before queue mutation.
procedure VALIDATE_CONTROL(decision, known_slugs):
  1. REQUIRE schema_version == 1
  2. REQUIRE action in { goto }
  3. IF action == goto THEN REQUIRE target in known_slugs
  4. RETURN valid decision or validation_error

# How: Apply goto by replacing only the remaining checklist segment.
procedure APPLY_CONTROL(decision, checklist_turns):
  1. IF no_control THEN continue static next turn
  2. IF action == goto THEN enqueue checklist turns beginning at target slug
  3. Preserve ordinary session chaining rules for the newly queued turns
