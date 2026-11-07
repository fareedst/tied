# Test strategy — [REQ-WF_TRIAL_FOUR_PHASE_SHELL_EXIT]

**Mode:** refine-plan locked. **Gate policy:** advisory. **depth_tier:** minimal.

## Composition

| ID | Target | Intent |
| --- | --- | --- |
| **T-EXIT-TRAP-01** (existing) | dry-run full wrapper | No `expanded_batch: unbound variable` on normal dry-run exit |
| **T-AGENTSTREAM-EXIT-01** (new) | **inc.sh only** + stub cmd | Non-zero exit propagation without trap noise |
| **T-WRAPPER-SMOKE** (existing subset) | help / WORKSPACE | Unchanged per REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE |

## T-AGENTSTREAM-EXIT-01 (locked — inc.sh extract)

**Rejected:** `WF_TRIAL_TEST_HARNESS` / stub env on production `run-traditional-four-phase-agentstream.sh`.

**Approach:**

1. **RED** adds test spawning `bash -c` that:
   - `source "${REPO_ROOT}/scripts/lib/wf-trial-run-four-phase-agentstream.inc.sh"`
   - Calls `wf_trial_four_phase_prepare_expanded_batch` with a minimal batch template under `tools/bootstrap/.tmp-four-phase-*` (create tied-project stub workspace as needed for expand helper — or pass temp template path only if expand does not need workspace)
   - Defines `cmd=(bash -c 'exit 42')`
   - Invokes `wf_trial_four_phase_run_agentstream` (exact calling convention per IMPL)
   - Asserts exit status `42` and stderr does not match `/expanded_batch: unbound variable/`

2. **GREEN** implements inc functions + wrapper refactor (D1–D3).

3. Optional integration smoke: full wrapper live path still covered by existing dry-run tests; no second live agentstream stub required.

## Unit

None beyond bash composition.

## E2E

Operator may rerun `workflow-trial-agentstream wf-05` after merge; not a REQ satisfaction gate.

## RED sequence (build-plan)

1. Add inc.sh skeleton + T-AGENTSTREAM-EXIT-01 → fail (functions missing or behavior wrong).
2. Implement D1–D3 → green.
3. Full `run-traditional-four-phase-agentstream-sh.test.mjs` green.
