# Test strategy — REQ-WF_TRIAL_MINIMAL_CHECKLIST_PLAYBOOK (+ phase handoff + manifest LEAP)

**profile_depth:** minimal · **gate_policy:** advisory  
**Build surface:** store repo scripts/bootstrap (not disposable product `src/`).

## Modules

| Module | Validation |
| --- | --- |
| `wf-trial-proof-manifest-gate.mjs` | **RED first:** FILE_EXISTS (path missing), FILE_COVERAGE (files.length < test ts count), happy path unchanged |
| `wf-trial-phase-handoff-gate.inc.sh` | Sourced from `workflow-trial-agentstream-sh.test.mjs`: missing handoff → exit 1; turn 3 without tests → exit 1; skip env → DIAGNOSTIC |
| `wf_trial_resolve_product_req_token` | Fixture workspace with handoff markdown → resolves token; seed copies template once |
| `wf-trial-implementation-stack.inc.sh` | Regression: existing stack/preload tests still pass |

## RED → GREEN sequence (`@build-plan`)

1. Extend `wf-trial-proof-manifest-gate.test.mjs` with failing cases for SC-RPM-09/10.
2. Extend `workflow-trial-agentstream-sh.test.mjs` for SC-WF-PHG-01..04 before implementing inc.sh.
3. Implement mjs + bash; wire `run-traditional-four-phase-agentstream.sh`.
4. Docs-only changes validated by grep/snapshot tests where existing patterns exist.

## LEAP (manifest REQ)

Update satisfaction criteria on `REQ-WF_TRIAL_RANGE_PROOF_MANIFEST_MANDATE` detail + IMPL pseudo-code in same build wave; run `tied_validate_consistency`.

## Verification commands

```bash
node --test tools/bootstrap/lib/wf-trial-proof-manifest-gate.test.mjs
node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs
```

Post-ship (manual): single-cell `workflow_trial_agentstream wf-10` + `@record-wf-trial` grade comparison vs Haiku baseline readouts.
