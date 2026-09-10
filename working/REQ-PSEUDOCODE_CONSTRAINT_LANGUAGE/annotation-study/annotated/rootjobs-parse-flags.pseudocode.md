# [IMPL-ROOTJOBS_CLI] [ARCH-ROOTJOBS_MODULES] [REQ-ROOTJOBS] [REQ-ROOTJOBS_OUTPUT]
Grammar-Version: v2

# Summary: CLI flags, Run test seam, orchestrate collect→tree→render.

## PARSE_FLAGS
# [IMPL-ROOTJOBS_CLI] [ARCH-ROOTJOBS_MODULES] [REQ-ROOTJOBS_OUTPUT]
# How: Parse -json and -pretty; default text output.

Contract:
  INPUT: os.Args: list of string
  OUTPUT: options: RootJobsOptions
  PRE: main or test invokes Run with Options
  POST: flags bound; Collector defaults to GopsutilCollector when nil
  EFFECTS: Control — output format selection

procedure PARSE_FLAGS():
  Contract:
    INPUT: os.Args: list of string
    OUTPUT: options: RootJobsOptions
    PRE: flag package available
    POST: JSON and Pretty flags parsed
    EFFECTS: Control — output format selection
    FAILURE_MODES: none — invalid flags use flag package defaults
  json := flag.Bool("-json", false)
  pretty := flag.Bool("-pretty", false)
  RETURN Options{JSON: json, Pretty: pretty}

## INVOKE_COLLECTOR
# [IMPL-ROOTJOBS_CLI] [ARCH-ROOTJOBS_MODULES] [REQ-ROOTJOBS_SNAPSHOT] [IMPL-ROOTJOBS_COLLECT]
# How: Call Collector.Snapshot(ctx); propagate error.

procedure INVOKE_COLLECTOR(ctx, opts):
  collector := opts.Collector OR default GopsutilCollector
  processes, err := collector.Snapshot(ctx)
  IF err: RETURN exit 1, write stderr
  RETURN processes

## BUILD_TREE
# [IMPL-ROOTJOBS_CLI] [ARCH-ROOTJOBS_MODULES] [REQ-ROOTJOBS_TREE] [IMPL-ROOTJOBS_TREE]
# How: tree.BuildForest(processes).

  forest := tree.BuildForest(processes)

## RENDER_OUTPUT
# [IMPL-ROOTJOBS_CLI] [ARCH-ROOTJOBS_MODULES] [REQ-ROOTJOBS_OUTPUT] [IMPL-ROOTJOBS_RENDER]
# How: Branch on opts.JSON to RENDER_JSON or RENDER_TEXT.

procedure RENDER_OUTPUT(forest, opts, stdout):
  Contract:
    INPUT: Forest; Options; io.Writer
    OUTPUT: exit code 0 or error
    POST: stdout receives text or JSON forest
    EFFECTS: State — rendered output written
    FAILURE_MODES: RENDER_ERROR; MARSHAL_ERROR
  IF opts.JSON:
    render.RenderJSON(forest, stdout, opts.Pretty)
  ELSE:
    render.RenderText(forest, stdout)
  RETURN exit 0

## ON error
# [IMPL-ROOTJOBS_CLI] [ARCH-ROOTJOBS_MODULES] [REQ-ROOTJOBS]
# How: Snapshot or render failure writes message to stderr and returns 1.

  WRITE err to stderr
  RETURN 1
