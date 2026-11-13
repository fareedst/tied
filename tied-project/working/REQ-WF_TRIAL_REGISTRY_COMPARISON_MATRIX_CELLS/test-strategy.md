# Test strategy — [REQ-WF_TRIAL_REGISTRY_COMPARISON_MATRIX_CELLS]

**Depth:** minimal · **Gate policy:** advisory

## Module boundaries

| Module | Responsibility |
| --- | --- |
| [`project-size-comparison-render.mjs`](../../../tools/bootstrap/lib/project-size-comparison-render.mjs) | `formatWallClockMinutes` (existing) |
| **New** [`wf-trial-comparison-matrix.mjs`](../../../tools/bootstrap/lib/wf-trial-comparison-matrix.mjs) | `renderWfTrialComparisonMatrixCell` |
| **New** [`wf-trial-comparison-matrix.test.mjs`](../../../tools/bootstrap/lib/wf-trial-comparison-matrix.test.mjs) | SC-WF-CMX-01…03 unit coverage |
| [`build-comparison-matrix.mjs`](../PLAN-WF-TRIAL-COMPARISON-MATRIX/evidence/build-comparison-matrix.mjs) | Integration parse/reduce + `--check` spots (SC-WF-CMX-04) |

## Unit tests — cell renderer

| ID | Asserts |
| --- | --- |
| SC-WF-CMX-02 | `1162` → wall line `**19m**`; `30` → `**1m**`; `29` → `**0m**` |
| SC-WF-CMX-02b | `wallSeconds` null / non-finite / `—` → wall line `—` |
| SC-WF-CMX-03 | `gradesDisplay` `3.87 · A/A−/…` emitted verbatim on line 2 (bold) |
| SC-WF-CMX-03b | `gradesDisplay` `—` with valid wall → grade line `—`; all missing → cell `—` |
| SC-WF-CMX-01 | Output never matches `/\d+s/` on line 1 |
| SC-WF-CMX-04 (unit) | Full cell: three lines `**{mins}m**<br>**{grades}**<br>[readout](path)` |

**RED first:** author tests before `wf-trial-comparison-matrix.mjs` implementation.

## Builder integration (`--check`)

| ID | Asserts |
| --- | --- |
| SC-WF-CMX-04 | `node …/build-comparison-matrix.mjs --check` exit 0 with spot table from PLAN |
| SC-WF-CMX-05 | Manual or scripted diff: master table lines before `## Latest-run` unchanged across regen |

No composition tests required — builder is a doc emit script; `--check` is the integration gate.

## E2E

None — facilitator markdown only.

## Security

Read-only parse of registry MD under `docs/demos/`; no network.

## Verification manifest

```text
node --test tools/bootstrap/lib/wf-trial-comparison-matrix.test.mjs
node tied-project/working/PLAN-WF-TRIAL-COMPARISON-MATRIX/evidence/build-comparison-matrix.mjs --check
```

After regen:

```text
node tied-project/working/PLAN-WF-TRIAL-COMPARISON-MATRIX/evidence/build-comparison-matrix.mjs
```
