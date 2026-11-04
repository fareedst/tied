# Session handoff — REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG

**handoff_kind:** session  
**Date:** 2026-11-04  
**request_token:** REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG  
**git:** `main` @ **`ef1fe2db`** — close-out complete; branch **ahead 9** of `origin/main` (push when ready)

## One line

WF trial bootstrap dirs now encode **harness + model bucket** in the disposable `--tag` (fair matrix cells under `TIED_TEST_ROOT`).

## Shipped

| Item | Location |
| --- | --- |
| Tag helpers | `scripts/lib/wf-trial-disposable-tag.inc.sh` |
| Orchestrator | `scripts/workflow-trial-agentstream.sh` |
| Tests | `tools/bootstrap/workflow-trial-agentstream-sh.test.mjs` |
| TIED | `REQ/ARCH/IMPL-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG` |
| Close-out | [close-out-handoff.md](./close-out-handoff.md) |

**Dir pattern:** `{epoch}-wf-agentstream-{wf-id}-{harness}-{modelBucket}`  
**Example:** `1793805223-wf-agentstream-wf-03-cursor-composer25`  
**modelBucket:** `MODEL_CONFIG` first, else `MODEL_SLUG`; lowercase; strip `.` and `-`.

## Operator

```bash
source scripts/build-commands.sh
# default cursor + composer-2.5
workflow-trial-agentstream wf-03 --dry-run

# claude cell (distinct dirname)
HARNESS=claude workflow-trial-agentstream wf-03 --dry-run
```

Verify:

```bash
node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs
```

Gold parity path unchanged: `1793760220-wf-agentstream-wf-03` (`WF03_GOLD_CLIENT`).

## Completion signals

| Signal | Status |
| --- | --- |
| Machine close-out | pass — gate `close_out-2026-11-04T16-18-34-117Z.json` under `tied-bundle/working/REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG/gates/` |
| Process contract | partial — minimal depth; do **not** use `--sync-dispositions` on close-out (clears sub-stub N/A policy) |
| Scoped commit | pass — `ef1fe2db` |

## Unstaged / other waves (do not fold into this REQ without new CITDP)

- `scripts/build-commands.sh` — `test_all_hygiene` block (+ optional one-line `workflow_trial` comment not in commit)
- Agentstream: `claude-driver.ts`, `live-driver-bind.ts`, harness dry-run test WIP
- REQ-TIED_RUNTIME_DISK_CONFIG, REQ-TIED_GIT_HYGIENE, prompt-type / JEV checklist copies
- Untracked: `REQ-AGENTSTREAM_CLAUDE_WF_PARITY/evidence/close-out-handoff.md`, `build-commands-test-all-hygiene.test.mjs`

## Suggested next steps

1. Push `main` when ready (includes this REQ among 9 local commits).
2. Optional: live Claude wf-03 with new dirname; update facilitator inventory on disposable client.
3. Optional: commit `build-commands.sh` comment-only or full `test_all_hygiene` under REQ-TIED_GIT_HYGIENE.
4. Fix doc drift: [close-out-handoff.md](./close-out-handoff.md) SHA line → `ef1fe2db` (amend chain left stale `08edf171` in committed file).

## Links

- Plan: [../PLAN.md](../PLAN.md)
- CITDP: [../../../citdp/CITDP-REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG.yaml](../../../citdp/CITDP-REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG.yaml)
- Prior parity REQ: [REQ-AGENTSTREAM_CLAUDE_WF_PARITY](../../REQ-AGENTSTREAM_CLAUDE_WF_PARITY/evidence/close-out-handoff.md) (`b0c7e854`, not pushed in prior session note)
