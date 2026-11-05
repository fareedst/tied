# [IMPL-WF_TRIAL_IMPLEMENTATION_STACK] [ARCH-WF_TRIAL_IMPLEMENTATION_STACK] [REQ-WF_TRIAL_IMPLEMENTATION_STACK] — WF trial TypeScript stack seed and preload.

Grammar-Version: v2

## WF_TRIAL_IMPLEMENTATION_STACK_ENABLED

- [IMPL-WF_TRIAL_IMPLEMENTATION_STACK] [ARCH-WF_TRIAL_IMPLEMENTATION_STACK] [REQ-WF_TRIAL_IMPLEMENTATION_STACK] Opt-out env gate for matrix stack.
- Contract:
  - INPUT: env WF_TRIAL_SKIP_IMPLEMENTATION_STACK
  - PRE: none
  - OUTPUT: boolean enabled
  - POST: skip env set and not 0 → disabled; else enabled
  - EFFECTS: when disabled, orchestrator uses generic preload materialize only

## SEED_WF_TRIAL_TYPESCRIPT_STACK

- [IMPL-WF_TRIAL_IMPLEMENTATION_STACK] [ARCH-WF_TRIAL_IMPLEMENTATION_STACK] [REQ-WF_TRIAL_IMPLEMENTATION_STACK] Copy-if-absent fixture from store tools/bootstrap/fixtures/wf-trial-typescript-stack.
- Contract:
  - INPUT: workspace absolute path, store_root
  - PRE: fixture directory exists under store_root
  - OUTPUT: package.json, tsconfig.json, src/.gitkeep when absent
  - POST: existing destination files never overwritten
  - EFFECTS: DIAGNOSTIC per seeded or skipped file
  - FAILURE_MODES: missing fixture → DIAGNOSTIC only (non-fatal)

## MATERIALIZE_WF_TRIAL_PRELOAD_CONTRACT

- [IMPL-WF_TRIAL_IMPLEMENTATION_STACK] [ARCH-WF_TRIAL_IMPLEMENTATION_STACK] [REQ-WF_TRIAL_IMPLEMENTATION_STACK] Copy wf-trial-agent-preload-contract.yaml to tied-project/agent-preload-contract.yaml.
- Contract:
  - INPUT: workspace, optional store_root fallback
  - PRE: source YAML readable from client tied-bundle or store tied-bundle
  - OUTPUT: project agent-preload-contract with language TypeScript and test_framework node-test
  - POST: copy-if-absent when dest already exists
  - EFFECTS: DIAGNOSTIC materialized or exists

## WF_TRIAL_APPLY_IMPLEMENTATION_STACK

- [IMPL-WF_TRIAL_IMPLEMENTATION_STACK] [ARCH-WF_TRIAL_IMPLEMENTATION_STACK] [REQ-WF_TRIAL_IMPLEMENTATION_STACK] Orchestrator hook composing seed then WF preload.
- Contract:
  - INPUT: workspace, store_root
  - PRE: wf_trial_implementation_stack_enabled true
  - OUTPUT: seeded stack files and WF preload contract when sources present
  - POST: calls SEED then MATERIALIZE in order
  - EFFECTS: none when disabled (caller handles generic preload)
