# Test strategy — REQ-WF_TRIAL_MODEL_COMPOSE

**Phase:** refine-plan (design only).

## Satisfaction criteria → tests

| ID | Criterion | Test mapping |
| --- | --- | --- |
| **SC-COMPOSE-LUNA** | `cursor` + `luna` + `medium` → slug `gpt-5.6-luna-medium-fast`, config `luna-med` | `wf-trial-model-compose.test.mjs`, `resolve-ref` with effort |
| **SC-COMPOSE-GROK47** | `grok47` + `medium` → `grok-4.7-medium-fast`, config `grok47-med` | compose unit tests |
| **SC-COMPOSE-CONFLICT** | `luna-low` + `medium` → throw tier_mismatch | spec unit test |
| **SC-COMPOSE-LEGACY** | `luna-low` + `-` → unchanged slug, no throw | spec + shell dry-run |
| **SC-COMPOSE-USAGE** | zero-arg usage shows `luna medium`, not `luna-low-fast medium` | shell test |

## TDD order (build-plan)

1. REQ/ARCH/IMPL + pseudo-code; `pseudocode_validate`
2. RED — `wf-trial-model-compose.test.mjs`
3. RED — extend `wf-trial-model-spec.test.mjs` (resolve-ref + effort)
4. RED — shell usage + `workflow_trial_range cursor luna medium 1 1`
5. GREEN — schema v2, compose module, resolver, inc.sh, build-commands
6. LEAP effort REQ usage strings; vocab
7. `tied_validate_consistency`

## Unit — `wf-trial-model-compose.test.mjs`

| Case | Threshold |
| --- | --- |
| `effortToModelConfigSuffix('medium')` | `med` |
| `composeCursorSlug('luna', 'high')` | `gpt-5.6-luna-high-fast` |
| Compose slug missing from catalog | throws |
| `composer-2.5` + effort | slug `composer-2.5-fast`, effort ignored in slug tier |

## Unit — spec extensions

| Case | Threshold |
| --- | --- |
| `resolve-ref cursor luna medium` | `resolution: compose` |
| `resolve-ref cursor luna -` | error effort_required |
| `resolve-ref cursor luna-low medium` | tier_mismatch |
| `resolve-ref cursor luna-low` (no effort) legacy path | matrix resolve |

## Verification manifest

```text
node --test tools/bootstrap/lib/wf-trial-model-compose.test.mjs
node --test tools/bootstrap/lib/wf-trial-model-spec.test.mjs
node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs
```
