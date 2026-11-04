# Close-out handoff — REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG

**Date:** 2026-11-04  
**Request:** Disposable client dirname suffix with harness + model bucket  
**Plan:** [../PLAN.md](../PLAN.md) · **CITDP:** [../../../citdp/CITDP-REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG.yaml](../../../citdp/CITDP-REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG.yaml)

## What shipped

**Goal:** Bootstrap dirs under `TIED_TEST_ROOT` distinguish `(PROMPT-WF-NN × harness × model configuration)` via `--tag` passed to `new-tied-client.mjs`.

| Deliverable | Detail |
| --- | --- |
| Tag helpers | [`scripts/lib/wf-trial-disposable-tag.inc.sh`](../../../scripts/lib/wf-trial-disposable-tag.inc.sh) |
| Orchestrator | [`scripts/workflow-trial-agentstream.sh`](../../../scripts/workflow-trial-agentstream.sh) — env order fix + `build_wf_trial_disposable_tag` |
| Tests | [`tools/bootstrap/workflow-trial-agentstream-sh.test.mjs`](../../../tools/bootstrap/workflow-trial-agentstream-sh.test.mjs) |
| Docs | Catalog automated path, bootstrap README, `how` guide |

Example: `1793805223-wf-agentstream-wf-03-cursor-composer25`

**TIED:** REQ/ARCH/IMPL stack; LEAP on wf-trial orchestration CITDP satisfaction criterion.

## Completion signals

- **Machine close-out:** **pass** — `close_out` `allowed: true`; envelope `blocking_gap_count: 0` (regenerable). Gate: `tied-bundle/working/REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG/gates/close_out-2026-11-04T16-18-34-117Z.json`.
- **Process contract:** **partial** — minimal depth; `sub-adversarial-inquiry-pass` N/A with receipt; tracker not fully dispositioned (gate allowed without `--sync-dispositions`).
- **Adherence ledger:** **partial** — reconcile run at close-out; minimal depth (expected thin ledger).
- **Workspace cleanliness (scoped REQ):** **pass** — scoped traceable commit; unrelated WIP unstaged. [traceable-commit-evidence.md](./traceable-commit-evidence.md)

**Upstream feedback capture:** N/A

## CI / local checks

```bash
node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs
```

## Unstaged drift (not in this commit)

- `scripts/build-commands.sh` — `test_all_hygiene` + comment-only `workflow_trial` note (hygiene block excluded)
- Agentstream driver WIP, REQ-TIED_RUNTIME_DISK_CONFIG / REQ-TIED_GIT_HYGIENE waves

## Commit

**SHA:** `ef1fe2db` — `feat(orchestrator): WF trial disposable dir includes harness and model`
