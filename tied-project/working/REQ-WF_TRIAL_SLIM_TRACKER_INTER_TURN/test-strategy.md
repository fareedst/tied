# Test strategy — REQ-WF_TRIAL_SLIM_TRACKER_INTER_TURN

**profile_depth:** minimal · **gate_policy:** advisory  
**Surface:** store `scripts/` + `tools/bootstrap/lib/` (not disposable product `src/`).

## Modules

| Module | Validation |
| --- | --- |
| `wf-trial-tracker-shape.mjs` | Classify valid slim vs legacy wrapper vs empty steps |
| `wf_trial_reconcile_slim_checklist_tracker` | Fixture workspace: legacy → slim + `.bak` |
| `wf_trial_four_phase_run_interleaved` | Dry-run argv: four orders, resume flag after turn 1, abort on exit 42 |
| `run-traditional-four-phase-agentstream.sh` | Regression: monolithic path when skip env set |

## RED → GREEN (`@build-plan`)

| Case | Setup | Expected | SC |
| --- | --- | --- | --- |
| Legacy wrapper | [fixture-legacy-tracker.yaml](./evidence/fixture-legacy-tracker-1794971027.yaml) | `isSlimTrackerShape: false` | SC-WF-IST-02 |
| Slim template | copy from `tied-bundle/templates/wf-trial-minimal-checklist-tracker.yaml` | `true` | SC-WF-IST-02 |
| Reconcile | temp client + handoff + legacy tracker | slim file + backup | SC-WF-IST-02 |
| Reconcile idempotent | valid slim present | unchanged mtime / no backup | SC-WF-IST-02 |
| Interleaved skip | `WF_TRIAL_SKIP_INTERLEAVED_TRACKER_SEED=1` | single agentstream invoke (spy) | SC-WF-IST-04 |
| Interleaved hook | mock turn-1 success | reconcile called before order 2 | SC-WF-IST-01 |
| Session parse | stdout or stderr fixture with `session_id=uuid` | extract uuid for resume argv | SC-WF-IST-01 / SC-WF-IRC |

## Regression

- Existing `materialize_wf_trial_minimal_checklist_tracker copy-if-absent [SC-WF-CLP-05]` stays green.
- [REQ-WF_TRIAL_FOUR_PHASE_SHELL_EXIT](../../../tied-project/requirements/REQ-WF_TRIAL_FOUR_PHASE_SHELL_EXIT.yaml) shell-exit tests unchanged.

## Commands

```bash
node --test tools/bootstrap/lib/wf-trial-tracker-shape.test.mjs
node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs
```