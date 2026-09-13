# [IMPL-GOAGENT-CHECKLIST-CONTROL] [ARCH-GOAGENT-CHECKLIST-CONTROL] [REQ-GOAGENT-CHECKLIST-CONTROL]
# Summary: Parse explicit agentstream_control JSON from a completed turn and apply only validated checklist routing actions.

# How: Contract for captured assistant text and loaded checklist slugs.
INPUT: turn_text, current_turn, checklist_turns, known_slugs, running_session
OUTPUT: next_queue, diagnostics, or validation_error
DATA: ControlDecision { schema_version, action, target, reason, evidence }

# How: Find explicit fenced JSON only; prose is ignored.

Grammar-Version: v2

procedure PARSE_CONTROL(turn_text):
  Contract:
    INPUT: turn_text: string where length(turn_text) >= 0
    PRE: turn_text is non-empty string when scanning
    OUTPUT: ControlDecision or no_control sentinel
    POST:
      - success => latest valid agentstream_control JSON decoded
      - no match => no_control without mutation
    FAILURE_MODES: INVALID_JSON_BLOCK
    DATA_TRANSITION: no checklist queue mutation; parse-only
    EFFECTS: pure

  # [IMPL-GOAGENT-CHECKLIST-CONTROL] [ARCH-GOAGENT-CHECKLIST-CONTROL] [REQ-GOAGENT-CHECKLIST-CONTROL]
  1. SCAN fenced json blocks from latest to earliest
  2. IF block decodes and has agentstream_control THEN RETURN decision
  3. RETURN no_control

# How: Validate schema and target before queue mutation.
procedure VALIDATE_CONTROL(decision, known_slugs):
  Contract:
    INPUT: decision: ControlDecision; known_slugs: list where length(known_slugs) >= 0
    PRE: decision parsed or no_control
    OUTPUT: validated decision or validation_error
    POST:
      - success => schema_version 1; action goto has target in known_slugs
      - failure => validation_error before queue mutation
    FAILURE_MODES: UNSUPPORTED_SCHEMA, UNKNOWN_ACTION, UNKNOWN_TARGET
    DATA_TRANSITION: no queue mutation until validation succeeds
    EFFECTS: pure

  # [IMPL-GOAGENT-CHECKLIST-CONTROL] [ARCH-GOAGENT-CHECKLIST-CONTROL] [REQ-GOAGENT-CHECKLIST-CONTROL]
  1. REQUIRE schema_version == 1
  2. REQUIRE action in { goto }
  3. IF action == goto THEN REQUIRE target in known_slugs
  4. RETURN valid decision or validation_error

# How: Apply goto by replacing only the remaining checklist segment.
procedure APPLY_CONTROL(decision, checklist_turns):
  Contract:
    INPUT: decision: ControlDecision; checklist_turns: list where length(checklist_turns) >= 0
    PRE: decision validated or no_control
    OUTPUT: next_queue with optional goto replacement segment
    POST:
      - success => goto enqueues turns from target slug; session chaining preserved
      - no_control => static next turn unchanged
    FAILURE_MODES: QUEUE_MUTATION_ERROR
    DATA_TRANSITION: checklist_turns queue replaced only on validated goto
    EFFECTS: pure

  # [IMPL-GOAGENT-CHECKLIST-CONTROL] [ARCH-GOAGENT-CHECKLIST-CONTROL] [REQ-GOAGENT-CHECKLIST-CONTROL]
  1. IF no_control THEN continue static next turn
  2. IF action == goto THEN enqueue checklist turns beginning at target slug
  3. Preserve ordinary session chaining rules for the newly queued turns
