# Test strategy — REQ-WF_TRIAL_FOUR_PHASE_HARDENING

**profile_depth:** minimal · **gate_policy:** advisory

## Unit / shell (build-plan — TDD)

| ID | Function | Fixture | Assert |
| --- | --- | --- | --- |
| TS-PRELOAD-1 | `materialize_disposable_preload_contract` | temp dir with tied-bundle template only | creates `tied-project/agent-preload-contract.yaml` |
| TS-PRELOAD-2 | same | existing project contract | `{ skipped }`, file unchanged |
| TS-PRELOAD-3 | resolver integration | mock workspace layout | first preload candidate is project path |
| TS-PREFLIGHT-1 | `wf_trial_reconcile_preflight` | store_root without dist | `ok: false`, remediation mentions build-workspace |
| TS-PREFLIGHT-2 | same | dist file present | `ok: true` |
| TS-PREFLIGHT-3 | env skip | `WF_TRIAL_SKIP_RECONCILE_PREFLIGHT=1` | no failure when dist missing |
| TS-PREFLIGHT-4 | env strict | `WF_TRIAL_STRICT_RECONCILE=1` + missing dist | exit 2 from orchestrator wrapper test |

**Runner:** `node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs`

## Integration (manual / facilitator)

| ID | Step | Pass |
| --- | --- | --- |
| TS-INT-1 | `workflow_trial_agentstream wf-03 --dry-run` after build | No `preload: using tied-bundle template` when materialize ran |
| TS-INT-2 | Live wf-03 disposable | Four `phase-handoff-*.md` files exist under product REQ working folder |

## Out of scope

- Live LLM four-turn batch regression
- Full adherence reconcile band grading
- PROMPT-WF-03 product tests

## RED sequence (build-plan)

1. Add failing tests TS-PRELOAD-* / TS-PREFLIGHT-* in `.test.mjs`
2. Implement `wf-trial-four-phase-hardening.inc.sh` + orchestrator hooks
3. Promote playbook markdown to prompt-shared; update batch YAML
4. GREEN + `tied_validate_consistency`
