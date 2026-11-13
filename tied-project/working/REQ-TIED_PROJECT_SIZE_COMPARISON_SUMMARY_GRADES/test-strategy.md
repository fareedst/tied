# Test strategy — [REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_GRADES]

**Depth:** minimal · **Gate policy:** advisory

## Module boundaries

| Module | Responsibility |
| --- | --- |
| [`read-trial-readout-session-grading.mjs`](../../../tools/bootstrap/lib/read-trial-readout-session-grading.mjs) | `buildTrialReadoutGradesIndex`, `meanCompactGrades`, `parseSessionGradingTable` |
| [`project-size-comparison-render.mjs`](../../../tools/bootstrap/lib/project-size-comparison-render.mjs) | `renderGradesCell`, Summary column append |
| [`project-size-comparison-render.test.mjs`](../../../tools/bootstrap/lib/project-size-comparison-render.test.mjs) | SC-CGR-01…05 |
| [`project-size-batch-compare.mjs`](../../../tools/bootstrap/lib/project-size-batch-compare.mjs) | Pass `storeRoot` in render meta |

## Unit tests — index

| ID | Asserts |
| --- | --- |
| (optional) T-CGR-IDX-01 | Temp `docs/demos` fixture: suffix `-{basename}.md` indexes basename → display string |
| (optional) T-CGR-IDX-02 | Malformed / missing Session grading → no index entry (render shows `—`) |

Prefer testing render with **injected** `meta.gradesIndex` map to avoid scanning full demos in unit tests.

## Unit tests — render

| ID | Asserts |
| --- | --- |
| SC-CGR-01 | Summary header matches `\| wall_clock \| grades \|` |
| SC-CGR-02 | Fixture row + index entry `{ "1799990001-wf-agentstream-wf-10-cursor-test": { display: "3.50 · A/A/A/A/A/A/A" } }` emits that cell |
| SC-CGR-03 | Missing index key → `—` |
| SC-CGR-04 | Two ok rows same display label after prepare; only surviving basename’s index used |
| SC-CGR-05 | Column definitions include **grades**; `assertRenderableMarkdown` passes |

**RED first:** extend `SUMMARY_HEADER` regex before green.

## Composition / E2E

Regen `comparison-table.md` via batch CLI — operator evidence after green.

## Security

Read-only file scan under `docs/demos/`; no network.

## Verification manifest

```text
node --test tools/bootstrap/lib/project-size-comparison-render.test.mjs
node --test tools/bootstrap/lib/trial-readout-grading-rationale-contract.test.mjs
```
