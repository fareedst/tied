# [IMPL-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_GRADES] [ARCH-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_GRADES] [REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_GRADES]

Grammar-Version: v2

# Summary: Build readout grades index by discover basename; append grades column after wall_clock in comparison Summary markdown.

# [IMPL-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_GRADES] [ARCH-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_GRADES] [REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_GRADES] — scan docs/demos readouts into basename-indexed meanCompactGrades display strings.
procedure BUILD_TRIAL_READOUT_GRADES_INDEX:
  Contract:
    INPUT: storeRoot path string
    OUTPUT: Map discoverBasename to { display string from meanCompactGrades }
    PRE: storeRoot exists; demos dir under storeRoot/docs/demos
    POST: each indexed file ends with hyphen plus discoverBasename dot md; values pure from parseSessionGradingTable
    EFFECTS: read-only filesystem scan
    FAILURE_MODES: unreadable file skipped; parse errors omit entry
  SET demosDir TO join storeRoot docs demos
  FOR EACH file matching trial-readout-PROMPT-WF- star dot md IN demosDir
    EXTRACT discoverBasename FROM filename suffix after final hyphen segment matching row.label convention
    PARSE markdown WITH parseSessionGradingTable
  IF parse errors THEN CONTINUE without entry
    BUILD compactSlash FROM grade rows band values joined by slash
    SET display TO meanCompactGrades compactSlash dot display
    MAP discoverBasename TO display

# [IMPL-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_GRADES] [ARCH-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_GRADES] [REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_GRADES] — fail-soft cell from index keyed by full discover basename.
procedure RENDER_GRADES_CELL:
  Contract:
    INPUT: discoverBasename string; gradesIndex Map
    OUTPUT: display string or em dash
    POST: uses full basename key; never display wf-NN label
    EFFECTS: pure
  IF gradesIndex lacks discoverBasename THEN RETURN em dash
  RETURN escape pipes in indexed display string

# [IMPL-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_GRADES] [ARCH-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_GRADES] [REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_GRADES] — append grades column after wall_clock in Summary pipeline.
procedure RENDER_COMPARISON_MARKDOWN_GRADES:
  Contract:
    INPUT: okRows after prepareComparisonSummaryRows; meta storeRoot optional; meta gradesIndex optional
    OUTPUT: grades column in header definitions and each Summary row after wall_clock cell
    PRE: COMPACT column order through wall_clock unchanged
    POST: SC-CGR-01 through SC-CGR-05
    EFFECTS: builds index from storeRoot when gradesIndex absent
  SET index TO meta gradesIndex OR BUILD_TRIAL_READOUT_GRADES_INDEX meta storeRoot
  APPEND grades to Summary header after wall_clock
  FOR EACH row IN okRows
    APPEND RENDER_GRADES_CELL row.label index after wall_clock cell
