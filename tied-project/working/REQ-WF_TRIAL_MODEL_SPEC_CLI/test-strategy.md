# Test strategy — REQ-WF_TRIAL_MODEL_SPEC_CLI

**Phase:** refine-plan (design only; no RED files yet).

## TDD order (build-plan)

1. `pseudocode_validate` on IMPL pseudo-code sidecar
2. **RED** — `tools/bootstrap/lib/wf-trial-model-spec.test.mjs` (resolver + registry)
3. **RED** — update `workflow-trial-agentstream-sh.test.mjs` contracts
4. **GREEN** — registry, mjs, inc.sh, `workflow_trial_range`, orchestrator hook
5. Docs + LEAP `REQ-WF_TRIAL_MODEL_EFFORT` SC-RANGE-* strings
6. `tied_validate_consistency`

## Unit — `wf-trial-model-spec.test.mjs`

| Case | Pass threshold |
| --- | --- |
| `luna-low` + cursor | `model_slug` = `gpt-5.6-luna-low-fast`, `model_config` = `luna-low` |
| `composer-2.5` + claude | `model_slug` = `claude-haiku-5-5` |
| `luna-low` + claude | Error (no claude_slug) |
| Unknown id | Non-zero / thrown |
| Missing registry file | Fail closed with message |

## Composition — `workflow-trial-agentstream-sh.test.mjs`

| Case | Maps to |
| --- | --- |
| Zero-arg usage | **SC-SPEC-USAGE** — 5-arg signature + `luna-low medium` example |
| Resolve via sourced range | **SC-SPEC-RESOLVE** — env after dry-run stub |
| Composer + effort | **SC-RANGE-WARN** (retain) — `cursor composer-2.5 medium 1 1` |
| Unknown config id | **SC-SPEC-UNKNOWN** — no `workflow_trial_agentstream` in loop |

## Out of scope

- Live disposable bootstrap matrix
- record-wf-trial filename generation tests (unchanged contract)

## Verification manifest (build-plan)

```text
node --test tools/bootstrap/lib/wf-trial-model-spec.test.mjs
node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs
```
