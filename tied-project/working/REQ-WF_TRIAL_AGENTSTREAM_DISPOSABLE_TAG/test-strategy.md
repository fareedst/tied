# Test strategy — REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG

**Phase:** refine-plan (design only). No production shell changes in this phase.

## Unit (CI — required)

| Case | Location | Pass threshold |
| --- | --- | --- |
| Default tag | `workflow-trial-agentstream-sh.test.mjs` + `scripts/lib/wf-trial-disposable-tag.inc.sh` | `WF_ID=wf-03`, `HARNESS=cursor`, `MODEL_CONFIG=composer-2.5` → `wf-agentstream-wf-03-cursor-composer25` |
| Claude harness | Same | `HARNESS=claude` → suffix contains `-claude-composer25` |
| MODEL_SLUG fallback | Same | Unset `MODEL_CONFIG`, `MODEL_SLUG=composer-2.5-fast` → normalized bucket (no `.` or `-`) |
| Invalid wf id | Existing orchestrator test | Unchanged — rejects WF-99 before tag build |

## Composition (CI — regression guard)

| Case | Command | Pass threshold |
| --- | --- | --- |
| Dry-run with `--workspace` | `workflow-trial-agentstream.sh wf-02 --dry-run --workspace $(mktemp -d)` | Exit 0; `--model` on stdout (existing test) |
| Existing orchestrator tests | `node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs` | All green |

## Deferred (optional — costly)

| Case | Notes |
| --- | --- |
| Full disposable bootstrap | Temp `TIED_TEST_ROOT` + live `new-tied-client.mjs --tag` | Only if unit tests insufficient; adds tied-install latency to CI |

## Out of scope

- Live four-phase LLM runs
- Renaming gold client `1793760220-wf-agentstream-wf-03`
- Changing `dual-harness-wf03-parity-smoke.sh` gold default path

## Verification manifest (build-plan)

```text
node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs
```
