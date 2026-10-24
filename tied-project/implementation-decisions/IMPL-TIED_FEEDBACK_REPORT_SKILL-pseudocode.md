# [IMPL-TIED_FEEDBACK_REPORT_SKILL] [ARCH-TIED_FEEDBACK_REPORT_SKILL_BOUNDARY] [REQ-TIED_FEEDBACK_REPORT_SKILL] — Bundled /feedback sponsor witness capture skill.

Grammar-Version: v2

## Feedback skill bootstrap

procedure INSTALL_FEEDBACK_SKILL:
  # [IMPL-TIED_FEEDBACK_REPORT_SKILL] [ARCH-TIED_FEEDBACK_REPORT_SKILL_BOUNDARY] [REQ-TIED_FEEDBACK_REPORT_SKILL] [REQ-TIED_CLIENT_BOOTSTRAP_SKILLS] How: manifest BUNDLED_STANDALONE_CLIENT_SKILLS entry copies tools/bundled-feedback-skill to client skills dir.
  Contract:
    INPUT: project_root, install_mode full | linked
    OUTPUT: { dest: string }
    PRE: canonical SKILL.md exists under tools/bundled-feedback-skill
    POST: installed skill documents /feedback, intake gate, receipt boundary
    DATA: client .cursor/skills/feedback tree
    DATA_TRANSITION: absent or stub skill to installed SKILL.md tree
    EFFECTS: IO
  IF full THEN copyTree bundled-feedback-skill
  ELSE write linked stub pointing at store SKILL.md
  RETURN dest path

procedure FEEDBACK_SKILL_PROCEDURE:
  # [IMPL-TIED_FEEDBACK_REPORT_SKILL] [ARCH-TIED_FEEDBACK_REPORT_SKILL_BOUNDARY] [REQ-TIED_FEEDBACK_REPORT_SKILL] [REQ-FEEDBACK_TO_TIED] [REQ-TIED_SPONSOR_AGENT_RELATIONSHIP] How: sponsor witness intake only; agent is instrument; no canonical YAML mutation from skill body.
  Contract:
    INPUT: sponsor message with optional /feedback prefix; optional incident fields
    OUTPUT: feedback capture receipt or intake questions
    PRE: disable-model-invocation skill; sponsor confirms destination base_path before write
    POST: feedback.yaml append via MCP OR explicit manual fallback documented
    FAILURE_MODES: missing incident details → ask minimum report; wrong base_path without confirm → refuse write
    EFFECTS: IO on confirmed capture path only
  STRIP /feedback or @feedback prefix
  IF minimum report incomplete THEN ASK sponsor for attempt, error text, client, destination confirm, recounting
  CLASSIFY feedback entry type and observation_kind
  COMPOSE witness sections Observation, Failure, Sponsor intent, Workaround, Redaction
  CALL tied_config_get_base_path
  IF sponsor has not confirmed destination THEN ASK confirm before optional base_path override
  CALL tied_feedback_capture_observation with privacy_tier operator_local, idempotency_key, evidence_refs
  ON MCP unavailable FALLBACK tied_feedback_operational_add then tied_feedback_add or manual per using-tied-without-mcp
  RETURN receipt stating receipt is not notification, countermeasure, canonical change, or LEAP promotion authorization
  IF sponsor requests export THEN tied_feedback_export
  UNLESS sponsor explicitly requests reviewed promotion DO NOT tied_feedback_promote
