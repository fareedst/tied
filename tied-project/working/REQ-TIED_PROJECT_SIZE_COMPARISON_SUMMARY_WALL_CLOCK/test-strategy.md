# Test strategy — [REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_WALL_CLOCK]

## Unit — render

| ID | Case |
| --- | --- |
| SC-CWC-01 | Summary header ends with `wall_clock` (not `wall_time`) |
| SC-CWC-02 | `formatWallClockMinutes(null)` → render `—` |
| SC-CWC-04 | `993.6` → `17`; `29` → `0`; `30` → `1` |
| SC-CWC-04 | Markdown row last cell `17` for fixture receipt |

Full regen is build-plan operator evidence (SC-CWC-05).
