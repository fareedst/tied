# Turn matrix — batch 1794165* (cursor / composer-2.5-fast)

Crosswalk: `process.stderr.log` turn banners vs session-handoff “do next” vs orchestrator manifest.

| Client ID | WF | Manifest `exit_code` | WritableIterable | Turn banners | Each turn has `session_id` | Handoff next step |
| --- | --- | --- | --- | --- | --- | --- |
| `1794165312` | 01 | 0 | No | 4/4 | Yes | close-out complete |
| `1794165972` | 02 | 0 | No | 4/4 | Yes | full four-phase |
| `1794166601` | 03 | 0 | No | 4/4 | Yes | close_out receipt on inventory |
| `1794167373` | 04 | 1 | **Yes** (line 15) | 3/4 | Turn 3 **no** `session_id` | `@close-out` (build-plan done) |
| `1794167900` | 05 | 1 | **Yes** (line 15) | 2/4 | Turns 1–2 yes | `@build-plan` (refine done) |

## Stderr detail (WF-04)

```
--- turn 1/4 --- session_id=9ed2ca81-...
--- turn 2/4 --- session_id=9cec7b20-...
--- turn 3/4 --- (no session_id line)
(manifest written; no turn 4)
```

Stdout tee for WF-04 includes **refine-plan complete** and **build-plan complete (11/11 tests)** — product work for turn 3 occurred even though stderr omits `session_id`.

## Stderr detail (WF-05)

```
--- turn 1/4 --- session_id=618bfa2d-...
--- turn 2/4 --- (no session_id on turn 2 banner in grep; turn 2 completed per stdout)
(manifest written; no turns 3–4)
```

On-disk: `REQ-CSV_ROW_MAP` refine artifacts; **no** `src/csvRowMap.ts` or RED tests.

## T3 handoff check

| Client | Expected (incomplete harness) | Actual session-handoff |
| --- | --- | --- |
| WF-04 | `@close-out` | `tied-project/working/REQ-REQID_MARKER_SCAN_CLI/evidence/session-handoff.md` → **Do next: `@close-out`** |
| WF-05 | `@build-plan` | `tied-project/working/REQ-CSV_ROW_MAP/evidence/session-handoff.md` → **Do next: `@build-plan`** |

T3 **pass**.
