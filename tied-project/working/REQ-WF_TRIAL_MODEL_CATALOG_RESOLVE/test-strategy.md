# Test strategy — REQ-WF_TRIAL_MODEL_CATALOG_RESOLVE

**Phase:** refine-plan (design only; no RED files until build-plan).

## Satisfaction criteria → tests

| ID | Criterion | Test mapping |
| --- | --- | --- |
| **SC-CAT-ALIAS** | `claude` + `haiku-5-5` → `MODEL_SLUG=claude-haiku-5-5` | `wf-trial-model-spec.test.mjs` resolve-ref; shell dry-run |
| **SC-CAT-SLUG** | `cursor` + `gpt-5.6-luna-low-fast` ≡ matrix `luna-low` outputs | Same `model_config` + `model_slug` as matrix resolve |
| **SC-CAT-MATRIX** | `luna-low`, `claude-sonnet-5-5` unchanged | Existing SC-SPEC cases retained |
| **SC-CAT-COMPOSER-CLAUDE-FAIL** | `claude` + `composer-2.5` errors | Unit throws `HARNESS_NOT_SUPPORTED` |
| **SC-CAT-SYNC-CHECK** | `--check` exits 0 when catalog matches fixtures | `wf-trial-model-catalog.test.mjs` spawn sync |
| **SC-CAT-USAGE** | Zero-arg usage mentions catalog + MODEL_REF | `workflow-trial-agentstream-sh.test.mjs` |

## TDD order (build-plan)

1. Author REQ/ARCH/IMPL + IMPL pseudo-code; `pseudocode_validate`
2. **RED** — `wf-trial-model-catalog.test.mjs` (derive, parse `agent models` fixture, schema)
3. **RED** — extend `wf-trial-model-spec.test.mjs` (`resolve-ref`, alias hop, composer claude fail)
4. **RED** — shell usage + dry-run slug ref
5. Add [testdata/wf-trial-claude-models.v1.json](../../../tools/bootstrap/testdata/wf-trial-claude-models.v1.json) + minimal catalog fixture
6. **GREEN** — sync script, full catalog commit, resolver, shell
7. Matrix LEAP + docs; update `wf-trial-model-spec.test.mjs` composer+claude case → expect fail
8. `tied_validate_consistency`

## Unit — `wf-trial-model-catalog.test.mjs`

| Case | Threshold |
| --- | --- |
| Load `wf-trial-model-catalog.v1` | schema + aliases |
| Parse `agent models` fixture (5 lines) | 5 cursor rows |
| `deriveCursorModelConfig('gpt-5.6-luna-low-fast')` | `luna-low` |
| `deriveCursorModelConfig('grok-4.7-medium-fast')` | `grok47-med` |
| Claude JSON fixture | 15 rows, ids match API |

## Unit — `wf-trial-model-spec.test.mjs` (additions)

| Case | Threshold |
| --- | --- |
| `resolve-ref claude haiku-5-5` | resolution `alias`, slug API id |
| `resolve-ref cursor gpt-5.6-luna-low-fast` | resolution `matrix` or `catalog`, same as `luna-low` |
| `resolve-ref claude composer-2.5` | Error |
| Unknown ref | `unknown model ref` |
| Alias chain blocked | `haiku55` one hop only |

## Composition — shell

| Case | Threshold |
| --- | --- |
| Usage | catalog path + `haiku-5-5` example |
| `ECHO_EXEC=:` range claude haiku-5-5 medium 1 1 | exports correct MODEL_* |

## Verification manifest

```text
node --test tools/bootstrap/lib/wf-trial-model-catalog.test.mjs
node --test tools/bootstrap/lib/wf-trial-model-spec.test.mjs
node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs
node tools/bootstrap/sync-wf-trial-model-catalog.mjs --check
```

## Out of scope

- Live `agent models` in CI (use committed catalog + fixtures)
- Full disposable bootstrap matrix
