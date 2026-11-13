# Test strategy — REQ-WF_TRIAL_MODEL_COMPOSE

**Phase:** refine-plan Wave 2 (design + implemented).

## Satisfaction criteria → tests

| ID | Criterion | Test mapping |
| --- | --- | --- |
| **SC-COMPOSE-LUNA** | `cursor` + `luna` + `medium` → slug `gpt-5.6-luna-medium-fast`, config `luna-med` | `wf-trial-model-compose.test.mjs`, `resolve-ref` with effort |
| **SC-COMPOSE-GROK47** | `grok47` + `medium` → `grok-4.7-medium-fast`, config `grok47-med` | compose unit tests |
| **SC-COMPOSE-GROK46** | `cursor-grok-4.6` + `low` → `cursor-grok-4.6-low-fast`, config `grok46-low` | compose unit, spec `resolve-ref`, shell `workflow_trial_range` |
| **SC-COMPOSE-CONFLICT** | `luna-low` + `medium` → throw tier_mismatch | spec unit test |
| **SC-COMPOSE-LEGACY** | `luna-low` + `-` → unchanged slug, no throw | spec + shell dry-run |
| **SC-COMPOSE-USAGE** | zero-arg usage lists compose families including grok46 | shell test |

## TDD order (Wave 1 — complete)

1. REQ/ARCH/IMPL + pseudo-code; `pseudocode_validate`
2. RED — `wf-trial-model-compose.test.mjs`
3. RED — extend `wf-trial-model-spec.test.mjs` (resolve-ref + effort)
4. RED — shell usage + `workflow_trial_range cursor luna medium 1 1`
5. GREEN — schema v2, compose module, resolver, inc.sh, build-commands

## Wave 2 verification (implemented — close-out gate)

| Case | Threshold | File |
| --- | --- | --- |
| `composeCursorSlug('grok46', 'low')` | `cursor-grok-4.6-low-fast`, `grok46-low` | `wf-trial-model-compose.test.mjs` |
| `resolve-ref cursor cursor-grok-4.6 low` | `resolution: compose`, slug as above | `wf-trial-model-spec.test.mjs` |
| `resolve-ref cursor grok46 medium` | `cursor-grok-4.6-medium-fast` | `wf-trial-model-spec.test.mjs` |
| `workflow_trial_range cursor cursor-grok-4.6 low 1 1` | exports slug/config/effort | `workflow-trial-agentstream-sh.test.mjs` |

## Verification manifest

```text
node --test tools/bootstrap/lib/wf-trial-model-compose.test.mjs
node --test tools/bootstrap/lib/wf-trial-model-spec.test.mjs
node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs
```

Operator smoke:

```bash
source scripts/build-commands.sh
workflow_trial_range cursor cursor-grok-4.6 low 1 1
# expect cursor-grok-4.6-low-fast, grok46-low, MODEL_EFFORT=low
```
