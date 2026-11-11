# [IMPL-WF_TRIAL_PHASE_HANDOFF_GATE] [ARCH-WF_TRIAL_PHASE_HANDOFF_GATE] [REQ-WF_TRIAL_PHASE_HANDOFF_GATE]

Grammar-Version: v2

## RESOLVE_PRODUCT_REQ

procedure RESOLVE_PRODUCT_REQ:
  Contract:
    INPUT: workspace rooted at disposable clone
    OUTPUT: product REQ token string or failure
    PRE: tied-project/working exists
    POST: token from tier A-D (handoff table/line, dirname, PLAN.md); excludes orchestrator dirs
    EFFECTS: none
    FAILURE_MODES: no parseable product folder
  Tier A-B: parse phase-handoff-add-feature.md (request_token line, table REQ token/REQ, backtick REQ)
  Tier C: dirname when handoff exists and folder matches REQ-*
  Tier D: PLAN.md Request token patterns
  Pick newest mtime among non-excluded working children

## POST_FOUR_PHASE_HANDOFF_GATE

procedure PHASE_HANDOFF_GATE:
  Contract:
    INPUT: workspace, store_root, WF_TRIAL_SKIP_PHASE_HANDOFF_GATE
    OUTPUT: exit 0 or 1
    PRE: product REQ resolved via RESOLVE_PRODUCT_REQ
    POST: requires phase-handoff add-feature/refine-plan/build-plan; turn 3 tests when package.json seeded
  IF SKIP THEN DIAGNOSTIC RETURN 0
  ON resolve miss: EMIT working listing + found-unparsed handoffs THEN ERROR
  VERIFY handoff files 1-3 under working/{product_REQ}/evidence
  IF package.json THEN require >=1 src/**/*.test.ts AND npm test pass when npm available

procedure STRICT_CLOSEOUT_PREFLIGHT:
  Contract:
    INPUT: WF_TRIAL_STRICT_CLOSEOUT_PREFLIGHT, workspace
    OUTPUT: exit 0 or 1
    PRE: default off
    POST: when on, requires CITDP YAML and verification receipt when build handoff claims verification
