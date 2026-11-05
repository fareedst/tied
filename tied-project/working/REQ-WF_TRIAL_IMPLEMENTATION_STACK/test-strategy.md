# Test strategy — REQ-WF_TRIAL_IMPLEMENTATION_STACK

**profile_depth:** minimal · **gate_policy:** advisory

## Unit / shell (build-plan — TDD)

| ID | Function | Fixture | Assert |
| --- | --- | --- | --- |
| TS-STACK-SEED-1 | `seed_wf_trial_typescript_stack` | empty temp workspace | creates `package.json`, `tsconfig.json`, `src/.gitkeep` |
| TS-STACK-SEED-2 | same | existing `package.json` | file unchanged; DIAGNOSTIC skip |
| TS-STACK-SEED-3 | package.json script | seeded fixture | `"test"` contains `node --import tsx --test` and `src/**/*.test.ts` |
| TS-STACK-PRELOAD-1 | `materialize_wf_trial_preload_contract` | ws with tied-bundle wf-trial preload doc | creates project contract with `language: TypeScript`, `test_framework: node-test` |
| TS-STACK-PRELOAD-2 | same | existing project contract | copy-if-absent; unchanged |
| TS-STACK-SKIP-1 | orchestrator hook | `WF_TRIAL_SKIP_IMPLEMENTATION_STACK=1` | no seed files; generic preload path or skip WF preload per PLAN |
| TS-STACK-REG-1 | dry-run | built CLI + temp workspace | `--model` still on stdout (regression) |

**Runner:** `node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs`

## Integration (manual / facilitator)

| ID | Step | Pass |
| --- | --- | --- |
| TS-INT-1 | `workflow_trial_agentstream wf-03 --dry-run` after build | stderr DIAGNOSTIC for stack seed + WF preload materialize |
| TS-INT-2 | Live disposable wf-03 | Product tree uses `.ts` under `src/`; facilitator `npm test` documented |

## Out of scope

- Live LLM four-turn enforcement (agent compliance)
- npm install network in CI shell tests
- Rewriting historical trial readouts

## RED sequence (build-plan)

1. Add failing TS-STACK-* cases in `workflow-trial-agentstream-sh.test.mjs`
2. Implement `wf-trial-implementation-stack.inc.sh` + orchestrator wiring + bundle preload YAML + fixture
3. Update batch YAML, prompt-shared, catalog, record-wf-trial reference
4. GREEN + TIED tokens + `tied_validate_consistency`
