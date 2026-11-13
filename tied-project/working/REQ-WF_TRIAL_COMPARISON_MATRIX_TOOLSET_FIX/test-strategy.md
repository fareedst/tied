# Test strategy — REQ-WF_TRIAL_COMPARISON_MATRIX_TOOLSET_FIX

**Depth:** minimal · **Gate policy:** advisory

## Module boundaries

| Module | Responsibility |
| --- | --- |
| [`wf-trial-comparison-matrix.mjs`](../../../tools/bootstrap/lib/wf-trial-comparison-matrix.mjs) | Cell renderer (existing) + **toolset column manifest** + **`toolsetKeyFromMasterRow`** |
| [`wf-trial-comparison-matrix.test.mjs`](../../../tools/bootstrap/lib/wf-trial-comparison-matrix.test.mjs) | SC-WF-CMX-01…04 (cells) + **SC-WF-CMX-07…09** (toolset/headers) |
| [`build-comparison-matrix.mjs`](../PLAN-WF-TRIAL-COMPARISON-MATRIX/evidence/build-comparison-matrix.mjs) | Parse/reduce; `SPOT_CHECKS` with updated `toolset_key` strings (SC-WF-CMX-04, SC-WF-CMX-10 via grep) |

## Unit tests — toolset resolution (RED first)

| ID | Asserts |
| --- | --- |
| SC-WF-CMX-07 | Claude Haiku low row → `claude:claude-haiku-5-5` (never `claude:composer-2.5`) |
| SC-WF-CMX-08 | Claude Haiku medium readout → `claude:claude-haiku-5-5@medium` |
| SC-WF-CMX-09 | `MATRIX_COLUMNS` entry for Haiku baseline has header ``Claude · `claude-haiku-5-5` `` |

Fixtures use plain objects `{ wf, harness, slug, readout }` — no filesystem for effort tokens except optional readout basename.

## Unit tests — cell renderer (regression)

Existing SC-WF-CMX-01…04 and SC-WF-CMX-04 three-line contract remain green; no behavior change.

## Builder integration

| ID | Asserts |
| --- | --- |
| SC-WF-CMX-04 | `build-comparison-matrix.mjs --check` exit 0 |
| SC-WF-CMX-05 | Master table unchanged when regen (diff scope) |
| SC-WF-CMX-10 | Generated matrix header row contains no ``Claude · `composer-2.5` `` |

## E2E

None.

## Security

Read-only parse of registry + optional readout paths under `docs/demos/`.

## Verification manifest

```text
node --test tools/bootstrap/lib/wf-trial-comparison-matrix.test.mjs
node tied-project/working/PLAN-WF-TRIAL-COMPARISON-MATRIX/evidence/build-comparison-matrix.mjs --check
node tied-project/working/PLAN-WF-TRIAL-COMPARISON-MATRIX/evidence/build-comparison-matrix.mjs
```
