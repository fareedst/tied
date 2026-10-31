# [IMPL-TIED_DURABLE_CHECKLIST_CONTROLLER] [ARCH-TIED_DURABLE_CHECKLIST_CONTROLLER] [REQ-TIED_DURABLE_CHECKLIST_CONTROLLER] [REQ-TIED_INTENT_CONTROL_PLANE] — Wave 4 durable checklist resume (REQ-CTRL-007).

Grammar-Version: v2

## DERIVE_CHECKLIST_RESUME_PLAN

procedure DERIVE_CHECKLIST_RESUME_PLAN(input):
  Contract:
    INPUT: ordered turn queue with step_stub, Authoritative Tracker step dispositions
    PRE: tracker schema_version checklist-tracker.v1
    OUTPUT: first_turn (1-based), next_step_slug, skipped_completed_count | terminal error
    POST: first_turn points at first turn whose stub disposition is pending (not completed/waived/not_applicable)
    FAILURE_MODES: all_steps_terminal; stub_not_in_tracker; no_stubbed_turns
    EFFECTS: pure
    TERMINATION: total

  # [IMPL-TIED_DURABLE_CHECKLIST_CONTROLLER] — How: REQ-CTRL-007 — resume unattended execution from last accepted tracker state, not conversational memory.
  FOR each turn index i with non-empty step_stub:
    IF stub missing from tracker inventory: RETURN stub_not_in_tracker
    IF disposition terminal: CONTINUE
    RETURN first_turn = i+1, next_step_slug = stub
  RETURN all_steps_terminal

## PARSE_SESSION_FROM_STATE_HISTORY

procedure PARSE_SESSION_FROM_STATE_HISTORY(input):
  Contract:
    INPUT: tracker.state_history[]
    PRE: optional
    OUTPUT: session_id hint or empty
    POST: uses latest turn_identity session= segment only as hint for agentstream --resume
    FAILURE_MODES: none (empty hint)
    EFFECTS: pure
    TERMINATION: total

  # [IMPL-TIED_DURABLE_CHECKLIST_CONTROLLER] — How: optional chain resume hint after interruption; operator may still pass --session-id explicitly.
  READ last state_history.turn_identity
  EXTRACT session id suffix after :session=
  RETURN hint

## SHARED_CHECKLIST_RESUME_MODULE

module @tied/checklist-resume:
  Contract:
    OUTPUT: DERIVE_CHECKLIST_RESUME_PLAN, loadTrackerResumeContext, resolveResumeFromTrackerPolicy
    POST: single canonical implementation for MCP read tool and agentstream apply (LEAP unify)
    EFFECTS: pure (tracker IO via loadTrackerResumeContext only)

  # [IMPL-TIED_DURABLE_CHECKLIST_CONTROLLER] — How: Wave 4 duplicate copies removed; package under mcp-server/packages/checklist-resume.
  EXPORT deriveChecklistResumePlan, loadTrackerResumeContext, resolveResumeFromTrackerPolicy

## AGENTSTREAM_APPLY_RESUME

procedure AGENTSTREAM_APPLY_RESUME(input):
  Contract:
    INPUT: DryRunConfig with optional --resume-from-tracker, --checklist-tracker-yaml, built turn queue
    PRE: shouldApplyResumeFromTracker(cfg) — CLI flag OR checklist.resume_from_tracker true in tied-project/config.yaml; config false blocks CLI (resume_from_tracker_disabled_by_config); tracker path readable; --first-turn not conflicting with derived plan unless still 1
    OUTPUT: cfg.firstTurn updated; cfg.sessionId filled when empty and hint present
    POST: buildTurnsFromConfig slices queue from derived first_turn
    FAILURE_MODES: checklist_tracker_required; first_turn_conflict; resume plan errors
    DATA_TRANSITION: cfg.firstTurn and optional cfg.sessionId updated from tracker plan; Authoritative Tracker bytes unchanged
    EFFECTS: mutates cfg only before subprocess
    TERMINATION: total

  # [IMPL-TIED_DURABLE_CHECKLIST_CONTROLLER] [REQ-GOAGENT-CHECKLIST-CONTROL] — How: agentstream partial gap closed for tracker-derived resume (DEC-OPEN-003: controller logic shared with MCP read tool).
  CALL DERIVE_CHECKLIST_RESUME_PLAN
  IF CLI --first-turn > 1 AND differs from plan: RETURN first_turn_conflict
  SET cfg.firstTurn from plan
  IF cfg.sessionId empty: SET from PARSE_SESSION_FROM_STATE_HISTORY hint

## MCP_RESUME_PLAN_TOOL

procedure TIED_CHECKLIST_CONTROLLER_RESUME_PLAN(input):
  Contract:
    INPUT: tracker_path, turns[{step_stub}]
    PRE: read-only MCP call
    OUTPUT: JSON plan + session_id_hint
    POST: no tracker mutation
    FAILURE_MODES: same as DERIVE_CHECKLIST_RESUME_PLAN
    DATA_TRANSITION: no tracker or checklist definition mutation; response JSON only
    EFFECTS: pure read
    TERMINATION: total

  # [IMPL-TIED_DURABLE_CHECKLIST_CONTROLLER] — How: Process authority surface for agents/drivers without starting agentstream subprocess.
  CALL loadTrackerResumeContext
  CALL DERIVE_CHECKLIST_RESUME_PLAN
  RETURN plan JSON
