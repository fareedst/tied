# W3 false-positive policy (Mechanisms B + C)

**Change ID:** `PLAN-TIED-BBCE-ALIGNMENT` · **Wave:** W3 refine · **gate_policy:** advisory

## Purpose

Document expected noise for shared-code justification (Mechanism **B**) and boundary violation detection (Mechanism **C**) so pilot metrics are interpreted as **review-gated evidence**, not correctness or REQ satisfaction.

## Mechanism B — shared-code touches

| Signal class | Example (agentstream pilot) | Treatment |
| --- | --- | --- |
| Declared shared mechanism | `paths.ts`, `repo-root.ts`, `checklist-constants.ts` | Trigger justification pass; **not** auto-fail |
| Package manifest churn | `package.json` version bumps | Justification or waiver; often cross-cutting |
| Test-only edits | `*.test.ts` outside declared surface | Lower locality; separate from shared-code gate |
| IMPL `code_locations` drift | Token lists stale vs actual paths | Prefer LEAP update; gate surfaces gap, does not block LEAP |
| Monorepo root configs | `mcp-server/package.json`, workspace tsconfig | Out-of-slice; document in waiver or consumers list |

**Non-negotiable:** No CI hard fail on shared touch in W3 pilot. Strict hook is **optional** and sponsor-escalated only after calibration.

## Mechanism C — boundary crossings

| Signal class | Example | Treatment |
| --- | --- | --- |
| Path classified to another binding | Edit under `control.ts` while declared slice is Claude live | Report as `slice_crossing`; human confirms ARCH/binding inventory |
| Shared mechanism path | Same as B | Counted separately from import-based crossing |
| Test / fixture paths | `fixtures/claude/**` | Often expected; suppress or tag `expected_test_surface` in dry-run |
| Import heuristic false edge | Re-export through barrel file | Advisory; document in report `confidence: low` |
| Traceability gap | Missing token in file | **Exclude** from boundary report — use plumb / consistency tools |

## Escalation (sponsor)

Move from **advisory** to **strict-candidate** only when:

1. W3 dry-run on historical diff (including `paths.ts` touch) shows acceptable false-positive rate.
2. Waiver path for shared-code and boundary findings is exercised in working-folder evidence.
3. Falsification questions in CITDP remain unanswered (no silent promotion to REQ).

## Proof boundary

Heuristics prove **diff-scope and slice-alignment discipline**, not runtime behavior.
