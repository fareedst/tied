# Test strategy — REQ-WF_TRIAL_VERIFICATION_RECEIPT_CLOSEOUT_SYNC

**profile_depth:** minimal · **gate_policy:** advisory  
**Surfaces:** Bash orchestrator libs; bootstrap `workflow-trial-agentstream-sh.test.mjs`; `run-traditional-four-phase-agentstream-sh.test.mjs` batch contract.

## Modules

| Module | Validation |
| --- | --- |
| `wf-trial-handoff-verification-claim.inc.sh` | Tier A/B claim detection |
| `wf-trial-verification-receipt-assist.inc.sh` | Opt-in MCP receipt persist |
| `wf-trial-machine-closeout-exit.inc.sh` | Uses shared claim helper |
| `wf-trial-phase-handoff-gate.inc.sh` | Strict preflight uses shared helper |

## Claim parser fixture matrix (SC-VRCS-02, SC-VRCS-07)

| Fixture id | Handoff content | `gates/verification-*.json` | Expected Tier A? | Expected exit |
| --- | --- | --- | --- | --- |
| F-WF09 | Table row `Verification gate` with `allowed: true` + prose “not persisted” | absent | **yes** (`verification_handoff_without_receipt`) | 1 |
| F-defer | Front matter `verification_receipt_status: deferred` + pending verification-gate | absent | **no** | 0 (`no_close_out_gate_receipt` diagnostic) |
| F-notrun | Front matter `verification_receipt_status: not_run`; stub only | absent | **no** | 0 |
| F-receipt | Handoff path to `gates/verification-2026-*.json` | present `allowed: true` | **no** | 0 |
| F-closeout | No verification claim; `close_out-*.json` `allowed: true` | optional | **no** | 0 |
| F-naive | Mention “verification-gate” slug in tracker table only; no pass claim | absent | **no** (regression guard vs old grep) | 0 |

**Parser rules (locked for RED):**

1. Parse YAML front matter first; `deferred` / `not_run` → **no pass claim**.
2. Else inspect `| Verification gate |` table cell (case-insensitive): pass claim when `allowed` + `true` in same cell **and** cell does **not** match deferral phrases (`not persisted`, `no receipt_persistence`, `deferred`, `not_run`).
3. Else if handoff references existing `gates/verification-*.json` path on disk → **no Tier A**.
4. `in_progress: true` without finalized gate row → **no pass claim**.

## Receipt assist (SC-VRCS-03, SC-VRCS-04)

| Case | Env | Tests | Receipt | Expected |
| --- | --- | --- | --- | --- |
| A1 | assist=1 | green | absent | receipt created OR DIAGNOSTIC skip (no CLI) |
| A2 | unset | green | absent | no assist DIAGNOSTIC |
| A3 | assist=1 | fail | absent | skip persist |
| A4 | assist=1 | green | present | idempotent skip |

Use temp workspace with `package.json` + passing `npm test` script stub when full product tree impractical.

## Batch contract (SC-VRCS-01)

Assert expanded `traditional-four-phase-agentstream.yaml` contains:

- `receipt_persistence`
- `verification_receipt_status`

Assert `wf-trial-build-plan-handoff.md` documents front matter fields.

## LEAP regression

After claim parser GREEN, update tests that assumed naive `grep -qi verification` (if any).

## Commands

```bash
node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs
node --test tools/bootstrap/run-traditional-four-phase-agentstream-sh.test.mjs
```

## Live appendix (SC-VRCS-06)

| Arm | Env | Expect |
| --- | --- | --- |
| Control | default | exit 1 unless turn 3 persists receipt (agent-dependent) |
| Assist | `WF_TRIAL_VERIFICATION_RECEIPT_ASSIST=1` | exit 0 when product tests green on disposable WF-09 |

Record in `evidence/live-wf-09-vrcs-replay.md` (build-plan).

## RED → GREEN order

1. F-defer, F-notrun, F-naive (lock honesty + regression).
2. F-WF09 (Tier A preserved).
3. F-receipt, F-closeout.
4. Assist A1–A4.
5. Batch contract SC-VRCS-01.
6. Live SC-VRCS-06 (optional close-out wave).