# Test strategy — REQ-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT

**profile_depth:** minimal · **gate_policy:** advisory  
**Surface:** `mcp-server/src/` + `scripts/lib/` + `tools/bootstrap/` (not disposable product `src/`).

## Modules

| Module | Validation |
| --- | --- |
| `loadWfTrialDisposableChecklistSlugs` | Parses slim template steps; stable slug set |
| `validateCanonicalSlugs` | Disposable flag unions registry |
| `validateChecklistGate` | Integration with fixture CITDP minimal + disposable tracker |
| `wf_trial_machine_closeout_exit_check` | Inventory / gate receipt fixtures |

## RED → GREEN (`@build-plan`)

| Case | Setup | Expected | SC |
| --- | --- | --- | --- |
| Disposable completed slugs | [fixture-disposable-tracker-1794975372.yaml](./evidence/fixture-disposable-tracker-1794975372.yaml) | `validateCanonicalSlugs` ok | SC-WF-DGA-01 |
| Store tracker shape | copy methodology slugs only, no disposable flag | `invalid_slug:red-tests` if polluted | SC-WF-DGA-03 |
| Wave 2 unknown | `author-implementation` slug | `invalid_slug` | SC-WF-DGA-03 |
| Slim seed rationale | load template YAML | `sub-adversarial-inquiry-pass` has `rationale` | SC-WF-DGA-02 |
| Inventory incomplete | fixture JSON `close_out_turn.status: incomplete` | machine check exit 1 | SC-WF-DGA-04 |
| Skip env | `WF_TRIAL_SKIP_MACHINE_CLOSEOUT_EXIT=1` | exit 0 same fixture | SC-WF-DGA-04 |
| Shell hook | mock four-phase exit 0 + incomplete inventory | orchestrator final exit 1 | SC-WF-DGA-05 |
| FOUR_PHASE non-zero | stub agentstream exit 2 | machine check not run / subprocess exit wins | SC-WF-DGA-05 |

## Fixture note

`evidence/fixture-disposable-tracker-1794975372.yaml` — snapshot of checklist-tracker from live client `1794975372-wf-agentstream-wf-01-claude-claudehaiku55low` (slim shape, `workflow_trial_disposable: true`).

## Regression

- [REQ-WF_TRIAL_SLIM_TRACKER_INTER_TURN](../REQ-WF_TRIAL_SLIM_TRACKER_INTER_TURN/test-strategy.md) interleaved tests unchanged.
- `checklist-pseudocode-gate.test.ts` Wave 2 cases remain green.

## Commands

```bash
node --test mcp-server/src/checklist-pseudocode-gate.test.ts
node --test tools/bootstrap/lib/wf-trial-disposable-slug-registry.test.mjs
node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs
```

## Live (`@build-plan` close-out wave)

```bash
workflow_trial_range claude haiku-5-5 low 1 1
```

Evidence path: `tied-project/working/REQ-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT/evidence/verification-live-wf-01-*.md`