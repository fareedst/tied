# [IMPL-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_WALL_CLOCK] [ARCH-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_WALL_CLOCK] [REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_WALL_CLOCK]

Grammar-Version: v2

procedure FORMAT_WALL_CLOCK_MINUTES:
  Contract:
    INPUT: seconds number or null
    OUTPUT: minutes integer or null
    PRE: seconds from orchestratorWallTimeSeconds when called from render
    POST: null when input null or non-finite; else Math.round seconds divided by 60
    EFFECTS: pure
  IF seconds not finite number THEN RETURN null
  RETURN Math.round seconds divided by 60

procedure RENDER_WALL_CLOCK_CELL:
  Contract:
    INPUT: receipt object
    OUTPUT: display string minutes or em dash
    POST: uses FORMAT_WALL_CLOCK_MINUTES on orchestratorWallTimeSeconds receipt
    EFFECTS: pure string format
  SET raw TO orchestratorWallTimeSeconds receipt
  SET minutes TO FORMAT_WALL_CLOCK_MINUTES raw
  IF minutes null THEN RETURN em dash glyph
  RETURN string of minutes
