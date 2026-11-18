# WF trial closeout — operator environment recipes

[REQ-WF_TRIAL_VERIFICATION_RECEIPT_CLOSEOUT_SYNC](../../tied-project/requirements/REQ-WF_TRIAL_VERIFICATION_RECEIPT_CLOSEOUT_SYNC.yaml) · [REQ-WF_TRIAL_RANGE_VERIFICATION_RECEIPT_ASSIST](../../tied-project/requirements/REQ-WF_TRIAL_RANGE_VERIFICATION_RECEIPT_ASSIST.yaml) · [agentstream vocab](../../tied-project/vocab/agentstream.md)

| Goal | Environment |
| --- | --- |
| Legacy shell pass while debugging machine closeout | `WF_TRIAL_SKIP_MACHINE_CLOSEOUT_EXIT=1` |
| Stricter CITDP + pass-claim without receipt preflight | `WF_TRIAL_STRICT_CLOSEOUT_PREFLIGHT=1` (machine closeout still default on) |
| Facilitator persist missing verification receipt after green `npm test` | Single-cell: `WF_TRIAL_VERIFICATION_RECEIPT_ASSIST=1` (default **off**). **Matrix:** `workflow_trial_range` exports assist=1 by default ([REQ-WF_TRIAL_RANGE_VERIFICATION_RECEIPT_ASSIST](../../tied-project/requirements/REQ-WF_TRIAL_RANGE_VERIFICATION_RECEIPT_ASSIST.yaml)). Sets manifest `verification_receipt_assist: true` when a receipt is written. |
| Agent-only matrix / control replay via range | `WF_TRIAL_SKIP_VERIFICATION_RECEIPT_ASSIST=1 workflow_trial_range …` |
| Skip phase handoff / test count gate | `WF_TRIAL_SKIP_PHASE_HANDOFF_GATE=1` |
| Skip proof manifest gate | `WF_TRIAL_SKIP_PROOF_MANIFEST=1` |

**Readout grading:** When `verification_receipt_assist` is true on `wf-trial-orchestrator-run.v1.json`, `@record-wf-trial` should treat verification receipt as facilitator-assisted, not agent-persisted alone.

**Honest incomplete (Tier B):** Set build handoff front matter `verification_receipt_status: deferred` or `not_run` — do not claim Verification gate `allowed: true` without a receipt file.