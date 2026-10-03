# [IMPL-GOAGENT-TEXT-SOURCES] [ARCH-GOAGENT-TEXT-SOURCES] [REQ-GOAGENT-TEXT-SOURCES]
# Summary: Build Turns from argv words, whole files, --- split files, verify sentinel — all ChainFromPrevious true.

# How: Contract I/O (same IMPL/ARCH/REQ). Cross-IMPL — callee of IMPL-GOAGENT-PIPELINE only; Turn shape from IMPL-GOAGENT-LIB-TYPES.

# INPUT: argv words slice; file paths; file bytes for prompts split.
# OUTPUT: []Turn with Parts populated; ChainFromPrevious true for each.
# DATA: UTF-8 strings; regex for --- separators.


Grammar-Version: v2

procedure text_sources:
  Contract:
    INPUT: argv_words: list where length(argv_words) >= 0; prompt_file_paths: list where length(prompt_file_paths) >= 0
    PRE: paths addressable when provided
    OUTPUT: []Turn with Parts populated; ChainFromPrevious true
    POST:
      - success => ArgvTurn, per-file turns, or --- split turns returned
      - failure => error on file read failure
    FAILURE_MODES: FILE_READ_ERROR
    EFFECTS: IO

  # [IMPL-GOAGENT-TEXT-SOURCES] [ARCH-GOAGENT-TEXT-SOURCES] [REQ-GOAGENT-TEXT-SOURCES]
  # How: ArgvTurn copies words to one Turn.Parts; TurnsFromPromptFiles one Turn per path; TurnsFromPromptsFiles splits on separator regex.
  ON file read error: return error from TurnsFromPromptFiles / TurnsFromPromptsFiles
  # How: Return value uses IMPL-GOAGENT-LIB-TYPES.Turn for all branches.
  return []Turn per API