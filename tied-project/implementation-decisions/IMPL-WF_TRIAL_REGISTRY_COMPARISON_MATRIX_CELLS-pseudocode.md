# Summary: Matrix cell render imports wall minutes + passes master Grades verbatim.

```text
# [IMPL-WF_TRIAL_REGISTRY_COMPARISON_MATRIX_CELLS] [ARCH-WF_TRIAL_REGISTRY_COMPARISON_MATRIX_CELLS] [REQ-WF_TRIAL_REGISTRY_COMPARISON_MATRIX_CELLS]

FORMAT_MATRIX_WALL_MINS(wallSeconds):
  # Implements REQ wall_mins via formatWallClockMinutes; ARCH no duplicate rounding.
  INPUT: orchestrator seconds from master Run time or em dash
  OUTPUT: "{n}m" or "—"
  PRE: formatWallClockMinutes from project-size-comparison-render
  IF wallSeconds missing OR "—" THEN RETURN "—"
  minutes := formatWallClockMinutes(numeric seconds)
  RETURN minutes as string + literal "m" suffix OR "—"

RENDER_WF_TRIAL_COMPARISON_MATRIX_CELL(opts):
  # Implements REQ full Grades line; second line is master column not readout scrape.
  INPUT: wallSeconds, gradesDisplay, readout relative path
  OUTPUT: markdown cell or "—"
  wallEm := FORMAT_MATRIX_WALL_MINS(wallSeconds)
  gradesEm := gradesDisplay unless missing then "—"
  IF wallEm "—" AND gradesEm "—" THEN RETURN "—"
  RETURN bold wallEm + br + bold gradesEm + br + readout link

BUILD_COMPARISON_MATRIX_SECTION:
  # parseMasterRows stores gradesDisplay from master col 7
  FOR each winning (wf, toolset_key) row
    APPEND RENDER_WF_TRIAL_COMPARISON_MATRIX_CELL(row.runTime, row.gradesDisplay, row.readout)
```
