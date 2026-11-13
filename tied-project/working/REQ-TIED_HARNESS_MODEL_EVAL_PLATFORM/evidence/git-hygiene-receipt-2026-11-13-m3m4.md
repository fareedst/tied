# git hygiene receipt — HMEP M3+M4 close-out

**date:** 2026-11-13  
**context_mode:** plan_close_out  
**request_token:** REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM  
**apply:** false

## Staged scope (HMEP M3+M4 only)

- `mcp-server/packages/harness-eval/` — billing, schema v3, reconcile, regression, replay
- `mcp-server/contracts/harness-eval/` — billing, baseline, replay manifest schemas + contract tests
- `docs/demos/harness-eval/` — README, billing, baselines, replay samples
- `tied-project/requirements*`, `implementation-decisions/IMPL-*-pseudocode.md`, `vocab/harness-model-eval.md`
- `tied-project/citdp/CITDP-REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM.yaml`
- `tied-project/working/REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM/` (PLAN, tracker, CITDP copy, evidence)

## Excluded unrelated drift

- `mcp-server/src/yaml-canonicalizer*`, `scripts/yaml_list_sorter.rb`
- `REQ-HARNESS_EVAL_METERING_CANARY_WORKFLOW` working/citdp touch
- `REQ-WF_TRIAL_RANGE_CANONICAL_INPUT` tracker
- `REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_GRADES` draft CITDP
- `tied-bundle/working/REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM/gates/` (regenerable)
