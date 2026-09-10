# [IMPL-VOLUMESTATS-CLI] [ARCH-VOLUMESTATS-MODULES] [REQ-VOLUMESTATS-CLI] [REQ-VOLUMESTATS-OUTPUT]
Grammar-Version: v2

# How: Parse output selection and orchestrate discovery, collection, and reporting with stable exit codes.
Contract:
  INPUT: command_arguments: list of string, stdout: io.Writer, stderr: io.Writer, dependencies: VolumeStatsDeps
  PRE: dependencies provide discovery and collection functions; stdout and stderr accept text
  OUTPUT: exit_code: int where exit_code >= 0 AND exit_code <= 2
  POST: successful data is written to stdout; exit_code >= 0 AND exit_code <= 2
  FAILURE_MODES: INVALID_FLAGS; DISCOVERY_FAILED; COLLECTION_FAILED; REPORT_FAILED
  EFFECTS: IO
  TERMINATION: total

# [IMPL-VOLUMESTATS-CLI] [ARCH-VOLUMESTATS-MODULES] [REQ-VOLUMESTATS-CLI] [REQ-VOLUMESTATS-OUTPUT]
# How: Reject invalid or conflicting flags before invoking dependencies.
procedure PARSE_FLAGS:
  parse command_arguments with json and yaml booleans
  IF parsing fails: RETURN INVALID_FLAGS
  IF json and yaml are both selected: RETURN INVALID_FLAGS
  RETURN options

# [IMPL-VOLUMESTATS-CLI] [ARCH-VOLUMESTATS-MODULES] [REQ-VOLUMESTATS-CLI] [REQ-VOLUMESTATS-OUTPUT]
# How: Bind the modules in order and map failures to user-facing exit codes.
procedure RUN_VOLUMESTATS:
  options := PARSE_FLAGS(command_arguments)
  IF options invalid: WRITE stderr usage diagnostic; RETURN 2
  mount_points := dependencies.discover()
  IF discovery fails: WRITE stderr `DEBUG: discovery failed`; RETURN 1
  volume_stats := dependencies.collect(mount_points)
  IF collection fails: WRITE stderr `DEBUG: collection failed`; RETURN 1
  IF options json: RETURN WRITE_JSON(stdout, volume_stats) mapped to 0 or 1
  IF options yaml: RETURN WRITE_YAML(stdout, volume_stats) mapped to 0 or 1
  RETURN WRITE_TABLE(stdout, volume_stats) mapped to 0 or 1

# [IMPL-VOLUMESTATS-CLI] [ARCH-VOLUMESTATS-MODULES] [REQ-VOLUMESTATS-CLI] [REQ-VOLUMESTATS-OUTPUT]
# How: Keep process startup limited to delegation and OS exit handling.
procedure MAIN:
  # [IMPL-VOLUMESTATS-CLI] [ARCH-VOLUMESTATS-MODULES] [REQ-VOLUMESTATS-CLI] [REQ-VOLUMESTATS-OUTPUT]
  RETURN run(os arguments, default dependencies, stdout, stderr)