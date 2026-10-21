# [IMPL-TIED_BUILD_COMMANDS_HOW_TEXTURE] [ARCH-TIED_CLI_OPERATOR_OUTPUT_TEXTURE] [REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE] — Styled `how()` operator help with plain mode and stderr-first stream routing.

Grammar-Version: v2

## CLI guide texture and dispatch

- [IMPL-TIED_BUILD_COMMANDS_HOW_TEXTURE] [ARCH-TIED_CLI_OPERATOR_OUTPUT_TEXTURE] [REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE] How: Initialize plain/texture and help stream from env, CLI flags, NO_COLOR, and TTY on the selected fd; route section output through render helpers; peel global flags before topic dispatch.
- Contract:
  - INPUT: `how` invocation argv after shell parsing; sourced build-commands context
  - PRE: `build-commands.sh` loaded; `_HOW_*` helpers defined before `how()` call
  - OUTPUT: success yields help text on selected fd (default stderr), stdout empty; error yields message on stderr, exit 2
  - POST:
    - success: topic content emitted; stdout empty unless stdout stream selected
    - error unknown topic/flag/arity: stderr diagnostic; exit 2
  - FAILURE_MODES: unknown_global_flag, unknown_topic, excess_args
  - EFFECTS: IO
  - TERMINATION: total

procedure HOW_PLAIN_INIT:
  # [IMPL-TIED_BUILD_COMMANDS_HOW_TEXTURE] [ARCH-TIED_CLI_OPERATOR_OUTPUT_TEXTURE] [REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE] How: Derive _HOW_USE_TEXTURE from CLI plain flag, TIED_CLI_PLAIN=1, NO_COLOR, and non-TTY on help fd.
  Contract:
    INPUT: _HOW_PLAIN_CLI, _HOW_FD, env NO_COLOR, TIED_CLI_PLAIN
    OUTPUT: _HOW_USE_TEXTURE boolean; ANSI vars or empty; _HOW_HR_CHAR; _HOW_SECTION_PREFIX
    PRE: _HOW_FD is 1 or 2
    POST: plain mode: no ANSI, ASCII hyphen rules, no decorative Unicode prefixes
    EFFECTS: pure
  IF CLI plain OR TIED_CLI_PLAIN=1 OR NO_COLOR set OR help fd not TTY THEN
    SET _HOW_USE_TEXTURE false
    SET ANSI escape vars empty
    SET _HOW_HR_CHAR to ASCII hyphen repeat
    SET _HOW_SECTION_PREFIX empty
  ELSE
    SET _HOW_USE_TEXTURE true
    SET bold/dim/cyan ANSI vars
    SET _HOW_HR_CHAR to Unicode rule when texture on
    SET _HOW_SECTION_PREFIX to optional glyph prefix
  RETURN

procedure HOW_STREAM_INIT:
  # [IMPL-TIED_BUILD_COMMANDS_HOW_TEXTURE] [ARCH-TIED_CLI_OPERATOR_OUTPUT_TEXTURE] [REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE] How: Select help fd from --stdout CLI, TIED_CLI_HELP_STDOUT=1, default stderr.
  Contract:
    INPUT: _HOW_STDOUT_CLI, env TIED_CLI_HELP_STDOUT
    OUTPUT: _HOW_FD 1 or 2
    PRE: HOW_PLAIN_INIT completed (TTY probe uses _HOW_FD candidate order: resolve fd then re-run plain if needed — plan: stream init after plain uses selected fd for TTY)
    POST: default _HOW_FD=2 unless stdout override
    EFFECTS: pure
  IF _HOW_STDOUT_CLI OR TIED_CLI_HELP_STDOUT=1 THEN
    SET _HOW_FD=1
  ELSE
    SET _HOW_FD=2
  CALL HOW_PLAIN_INIT with final _HOW_FD for TTY probe
  RETURN

procedure HOW_RENDER:
  # [IMPL-TIED_BUILD_COMMANDS_HOW_TEXTURE] [ARCH-TIED_CLI_OPERATOR_OUTPUT_TEXTURE] [REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE] How: printf section lines via _how_out to _HOW_FD; errors always >&2.
  Contract:
    INPUT: section strings; render role (title, header, cmd, note, hr)
    OUTPUT: formatted lines on _HOW_FD
    PRE: _HOW_FD valid
    POST: _how_unknown_topic and _how_unknown_flag always write stderr
    EFFECTS: IO
  CALL _how_out for each formatted line
  RETURN

procedure HOW_DISPATCH:
  # [IMPL-TIED_BUILD_COMMANDS_HOW_TEXTURE] [ARCH-TIED_CLI_OPERATOR_OUTPUT_TEXTURE] [REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE] How: Peel global flags, default topic all, reject unknown flags and excess args, dispatch to _how_* section.
  Contract:
    INPUT: remaining argv
    OUTPUT: section help or error
    PRE: peel loop only accepts flags before topic token
    POST: at most one topic token after peel
    FAILURE_MODES: unknown_global_flag, unknown_topic, excess_args
    EFFECTS: IO
  WHILE args remain AND token starts with `-` AND not topic THEN
    IF plain or stdout flag THEN consume
    ELSE IF unknown `-` prefix THEN _how_unknown_flag; RETURN error
  IF more than one topic arg THEN stderr excess; RETURN error
  CASE topic: CALL matching _how_* section
  TERMINATION: total
  RETURN
