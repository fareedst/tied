# Live WF-01 verification — 1794981051 (SC-DCR-06)

**Client:** `/Users/fareed/Documents/dev/test/1794981051-wf-agentstream-wf-01-claude-claudehaiku55low`  
**Product REQ:** `REQ-SEMVER_COMPARATOR`  
**Orchestrator:** `workflow_trial_agentstream wf-01` · Claude Haiku 5.5 low · methodology **4.2.2**

## SC-DCR-06 grade

| Column | Result |
| --- | --- |
| **Readout label** | **`fail`** (verification `allowed: false`) — not `partial_tier_b` |
| Verification | `gates/verification-2026-11-18T05-53-23-694Z.json` → `allowed: false` (missing adversarial CITDP lists at **gate** validate) |
| Shell | `exit_code: 0`; tier B `DIAGNOSTIC: wf_trial_machine_closeout_reason=no_close_out_gate_receipt`; **no** machine closeout `ERROR` |
| Manifest | `exit_code: 0` matches shell |
| close_out | No `gates/close_out-*.json` |

## SC-DCR partial credit (store REQ)

| SC | Live |
| --- | --- |
| SC-DCR-01 | No `invalid_slug` in orchestrator stderr |
| SC-DCR-04 tier B | Observed |
| SC-DCR-05 | Manifest 0 = shell 0 |
| SC-DCR-03 | Product `citdp/CITDP-REQ-SEMVER_COMPARATOR.yaml` persisted (product schema) |
| SC-DCR-06 | **Fail** — verification must be `allowed: true` |

## Facilitator replay (2026-11-18)

`npm test` → **17/17** pass on client root.

## Follow-on (out of scope unless new REQ slice)

Extend **minimal adversarial waiver** to `validateChecklistGate` / `validateAdversarialContract` at verification when tracker `minimal-depth-no-inquiry` (open-record waiver alone insufficient for turn 3 gate receipts).

## Inventory

`tied-project/working/REQ-SEMVER_COMPARATOR/evidence/trial-workflow-interaction-inventory.v1.json`