# IMPL-WF_TRIAL_MODEL_EFFORT — essence_pseudocode

```text
# [IMPL-WF_TRIAL_MODEL_EFFORT] [ARCH-WF_TRIAL_MODEL_EFFORT] [REQ-WF_TRIAL_MODEL_EFFORT]
# Model effort from workflow_trial_range through agentstream harness launch.

PROCEDURE WF_TRIAL_VALIDATE_MODEL_EFFORT
  # [REQ-WF_TRIAL_MODEL_EFFORT] Fail closed before disposable bootstrap when effort invalid.
  PRE: raw effort from MODEL_EFFORT env or workflow_trial_range 4th arg
  POST: MODEL_EFFORT exported when valid; unset when - or empty
  INPUT: raw string
  CONTROL: allowed ∈ {low, medium, high, xhigh, max}
  FAILURE_MODES: invalid level → ERROR stderr exit 1
  TERMINATION: return 0

PROCEDURE WORKFLOW_TRIAL_RANGE_EXPORT_EFFORT
  # [REQ-WF_TRIAL_MODEL_EFFORT] Breaking 4th positional on workflow_trial_range.
  PRE: build-commands.sh sourced
  INPUT: harness, model_slug, model_config, effort, end, start, monit
  OUTPUT: MODEL_EFFORT on each workflow_trial_agentstream child env when effort ≠ -
  DATA_TRANSITION: effort=- → omit MODEL_EFFORT from child env
  EFFECTS: loop wf-NN with HARNESS MODEL_* AGENTSTREAM_CLAUDE_LIVE_OK when claude

PROCEDURE BUILD_DISPOSABLE_TAG_WITH_EFFORT
  # [REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG] [REQ-WF_TRIAL_MODEL_EFFORT] Extend modelBucket.
  PRE: MODEL_CONFIG|MODEL_SLUG normalized; MODEL_EFFORT optional
  POST: tag wf-agentstream-{wf}-{harness}-{bucket}[effortSuffix]
  INPUT: wf_id
  DATA: bucket ← normalize config/slug; effortSuffix ← normalize MODEL_EFFORT when set
  EFFECTS: printf composed tag

PROCEDURE EXPAND_FOUR_PHASE_EFFORT
  # [REQ-WF_TRIAL_MODEL_EFFORT] Batch placeholder and agentstream CLI.
  PRE: MODEL_EFFORT may be empty
  POST: {{MODEL_EFFORT}} expanded; --model-effort passed when non-empty
  INPUT: BATCH_YAML template, env MODEL_*
  OUTPUT: expanded batch path; tied agentstream argv

PROCEDURE AGENTSTREAM_RESOLVE_MODEL_EFFORT
  # [REQ-GOAGENT-CLI-CONFIG] [REQ-WF_TRIAL_MODEL_EFFORT]
  PRE: parseDryRunConfig argv
  POST: cfg.modelEffort validated enum or empty
  INPUT: --model-effort flag, MODEL_EFFORT env
  CONTROL: CLI overrides env
  FAILURE_MODES: invalid level throws before run

PROCEDURE CLAUDE_APPLY_EFFORT
  # [REQ-GOAGENT-AGENT-EXECUTOR] [REQ-WF_TRIAL_MODEL_EFFORT]
  PRE: harness claude; modelEffort non-empty
  POST: argv contains --effort; spawn env CLAUDE_CODE_EFFORT_LEVEL
  EFFECTS: agentArgv; liveBinding.runTurn extraEnv

PROCEDURE CURSOR_APPLY_MODEL_SLUG_EFFORT
  # [REQ-WF_TRIAL_MODEL_EFFORT] [ARCH-WF_TRIAL_MODEL_EFFORT]
  PRE: harness cursor; modelEffort non-empty; AGENTSTREAM_CURSOR_MODEL_BRACKET_EFFORT not 0
  POST: --model token is catalog slug with hyphen effort tier; preserve thinking modifier and -fast suffix; canonicalize Grok vendor prefix (4.5/4.6 cursor-grok-*, 4.7+ grok-*)
  INPUT: base model slug, modelEffort
  CONTROL: skip when Auto, effort empty, or composer-2.5 blocklist
  FAILURE_MODES: opt-out env → plain slug; composer → unchanged + DIAGNOSTIC
  EFFECTS: applyCursorModelForAgent; agentArgv --model

PROCEDURE CURSOR_LIVE_ARGV_EXTRAS
  # [REQ-WF_TRIAL_MODEL_EFFORT] [REQ-AGENTSTREAM_CLAUDE_WF_PARITY]
  PRE: harness cursor; non-interactive --print argv
  POST: argv includes --approve-mcps unless KEEP_MCPS; --add-dir store when linked client resolves
  EFFECTS: cursorLiveArgvExtras; optional --auto-review / --stream-partial-output via env
```
