# Test strategy — REQ-WF_TRIAL_RANGE_PROOF_MANIFEST_MANDATE

**profile_depth:** minimal · **gate_policy:** advisory  
**Wave:** 2 (orchestrator default-on; remove `WF_TRIAL_REQUIRE_PROOF_MANIFEST`)

## Modules

| Module | Validation |
| --- | --- |
| `wf-trial-proof-manifest-gate.mjs` | Node unit tests: missing file, wrong `schema_version`, `prompt_id` mismatch, empty `files`, happy path (unchanged) |
| `wf-trial-proof-manifest-gate.inc.sh` | Sourced from bash tests in `workflow-trial-agentstream-sh.test.mjs` |
| `wf_trial_proof_manifest_gate_enabled` | **Wave 2:** enabled with **empty** env; disabled only when `WF_TRIAL_SKIP_PROOF_MANIFEST=1` |

## RED before GREEN (`@build-plan` wave 2)

1. Extend `workflow-trial-agentstream-sh.test.mjs` (fail first, then fix inc):
   - **SC-RPM-01:** source `wf-trial-proof-manifest-gate.inc.sh` with no env → `wf_trial_proof_manifest_gate_enabled` succeeds.
   - **SC-RPM-01 (negative):** grep `build-commands.sh` and gate inc — **no** `WF_TRIAL_REQUIRE_PROOF_MANIFEST`.
   - **SC-RPM-06:** help documents default gate + `WF_TRIAL_SKIP_PROOF_MANIFEST` only (no REQUIRE).
   - **SC-RPM-02:** WF-10 norm + missing manifest → `wf_trial_proof_manifest_gate_check` exit 1 (fixture temp dir).
   - Remove or replace tests that assert `workflow_trial_range` exports REQUIRE.

2. Regression: `wf_trial_proof_manifest_gate_applies WF-03` and `WF-09` both true (G5 B).

## Integration (no live agentstream)

- Temp dir + minimal valid manifest → Node helper exit 0.
- Same without file → exit 1 (with gate enabled, no skip).

## SC-RPM-07

Unchanged: `FOUR_PHASE_EXIT` precedence over gate.

## Verification commands

```bash
node --test tools/bootstrap/lib/wf-trial-proof-manifest-gate.test.mjs
node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs
```
