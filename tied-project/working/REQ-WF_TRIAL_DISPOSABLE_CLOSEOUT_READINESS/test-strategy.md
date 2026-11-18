# Test strategy — REQ-WF_TRIAL_DISPOSABLE_CLOSEOUT_READINESS

**profile_depth:** minimal · **gate_policy:** advisory  
**Surface:** `mcp-server/src/` + `tied-install.sh` + `scripts/lib/` + `tools/bootstrap/` (not disposable product `src/`).

## Modules

| Module | Validation |
| --- | --- |
| `resolveDefaultDisposableChecklistTemplatePath` | Client bundle → store bundle → cwd precedence |
| `validateCitdpOpenRecord` | Minimal waiver when tracker waives adversarial |
| `wf_trial_machine_closeout_exit_check` | Tier A vs Tier B |
| `wf_trial_process_log_finalize` | Manifest after composite exit |

## SC-DCR-06 grading policy (locked refine-plan)

Three-way table for live WF-01 and `@record-wf-trial`:

| Grade | Verification gate | Orchestrator shell | Readout label |
| --- | --- | --- | --- |
| **Full** | `gates/verification-*.json` `allowed: true` | `close_out` receipt `allowed: true` **or** inventory `close_out_turn` complete | `machine_complete` |
| **Partial (SC-DCR-06 pass)** | `allowed: true` | Exit **0**, **no** `ERROR`, optional `DIAGNOSTIC: wf_trial_machine_closeout_reason=no_close_out_gate_receipt` only (Tier B) | `partial_tier_b` |
| **Fail** | `allowed: false` or missing verification receipt when claimed | `ERROR` or exit **1** (Tier A) or manifest `exit_code` ≠ shell | `fail` |

**Normative:** SC-DCR-06 **criterion satisfied** at **Partial** or **Full**. Matrix comparability cohorts may still require **Full** for “green close-out” columns — document `partial_tier_b` explicitly in readout.

## RED → GREEN (`@build-plan`)

| Case | Setup | Expected | SC |
| --- | --- | --- | --- |
| Store-only template | Fixture client: empty `tied-bundle/templates/`; MCP `TIED_STORE_ROOT` set | `loadWfTrialDisposableChecklistSlugs` non-empty; slugs validate | SC-DCR-01 |
| Install materialize | Temp client after `tied-install` | `wf-trial-minimal-checklist-tracker.yaml` present | SC-DCR-02 |
| Minimal CITDP | CITDP minimal + tracker `minimal-depth-no-inquiry` | `validateCitdpOpenRecord` ok without adversarial lists | SC-DCR-03 |
| Tier A blocked close_out | `close_out-*.json` `allowed: false` | ERROR + exit 1 | SC-DCR-04 |
| Tier B no receipt | No gates dir / no tier-A signals | DIAGNOSTIC only + exit 0 | SC-DCR-04 |
| Manifest lag | Mock machine closeout exit 1 after four-phase 0 | manifest `exit_code` 1 | SC-DCR-05 |
| Regression disposable union | [DGA fixture](../REQ-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT/evidence/fixture-disposable-tracker-1794975372.yaml) | Still SC-WF-DGA-01 green | — |
| Integrated depth | depth_tier integrated CITDP | adversarial lists still required | — |

## Fixture note

`evidence/fixture-thin-templates-1794978904-class.md` — documents incident class: thin client `tied-bundle/templates/`, verification `invalid_slug`, blocked `citdp_record_write`, split manifest/orchestrator exit (no committed disposable client id in store repo).

## Commands

```bash
node --test tools/bootstrap/lib/wf-trial-disposable-slug-registry.test.mjs
node --test mcp-server/src/checklist-pseudocode-gate.test.ts
node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs
```

## Live (`@build-plan` close-out wave)

```bash
workflow_trial_range claude haiku-5-5 low 1 1
```

Evidence: `tied-project/working/REQ-WF_TRIAL_DISPOSABLE_CLOSEOUT_READINESS/evidence/verification-live-wf-01-*.md` with SC-DCR-06 grade column.