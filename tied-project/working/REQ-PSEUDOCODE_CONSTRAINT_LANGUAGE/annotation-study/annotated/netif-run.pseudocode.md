# [IMPL-NETIF_CLI] [ARCH-NETIF_REPORT] [REQ-NETIF_REPORT]
Grammar-Version: v2

# Summary: Run(cfg) parses --json, wires discovery to formatters, writes stdout/stderr, returns exit codes 0 or 1.

## RUN
# [IMPL-NETIF_CLI] [ARCH-NETIF_REPORT] [REQ-NETIF_REPORT]
# How: CLI orchestration — discover, format, write output; List error → stderr + exit 1.

# [IMPL-NETIF_CLI] [ARCH-NETIF_REPORT] [REQ-NETIF_REPORT]
Contract:
  INPUT: cfg: NetifRunConfig
  OUTPUT: exit_code: int where exit_code >= 0 AND exit_code <= 1
  DATA: cfg (immutable): NetifRunConfig
  CONTROL: discover before format; no format on List error
  PRE: cfg.lister, cfg.stdout, cfg.stderr are non-nil
  POST: success writes formatted output to stdout; exit_code >= 0
  EFFECTS: State — stdout/stderr written; Control — process exit code
  FAILURE_MODES: LIST_FAILED — stderr message, exit 1; FLAG_PARSE_FAILED — stderr message, exit 1; JSON_ENCODE_FAILED — stderr message, exit 1; WRITE_FAILED — stderr message, exit 1
  DATA_TRANSITION: reports discovered→formatted→written
  TERMINATION: total — single pass

# [IMPL-NETIF_CLI] [ARCH-NETIF_REPORT] [REQ-NETIF_REPORT]
# How: Parse flags via flag.NewFlagSet, call DISCOVER_INTERFACES, route to formatter, write stdout.
procedure RUN(cfg):
  # [IMPL-NETIF_CLI] [ARCH-NETIF_REPORT] [REQ-NETIF_REPORT]
  # How: Parse --json boolean via flag set; flag errors write stderr and exit 1.
  fs = flag.NewFlagSet("netreport", ContinueOnError)
  fs.SetOutput(cfg.stderr)
  jsonMode = fs.Bool("json", false, "emit JSON output")
  IF fs.Parse(cfg.args[1:]) IS error:
    WRITE "error: {err}" TO cfg.stderr
    TERMINATION exit 1
  # [IMPL-NETIF_CLI] [IMPL-NETIF_DISCOVERY] [ARCH-NETIF_REPORT] [REQ-NETIF_REPORT]
  # How: Binding B1/B2/B3 — discover via injected lister.
  reports, err = DISCOVER_INTERFACES(cfg.lister)
  IF err IS NOT nil:
    WRITE "error: {err}" TO cfg.stderr
    TERMINATION exit 1
  IF *jsonMode:
    # [IMPL-NETIF_CLI] [IMPL-NETIF_FORMAT] [ARCH-NETIF_REPORT] [REQ-NETIF_REPORT]
    # How: Binding B2 — FormatJSON to stdout.
    output, err = FORMAT_JSON(reports)
    IF err IS NOT nil:
      WRITE "error: {err}" TO cfg.stderr
      TERMINATION exit 1
  ELSE:
    # [IMPL-NETIF_CLI] [IMPL-NETIF_FORMAT] [ARCH-NETIF_REPORT] [REQ-NETIF_REPORT]
    # How: Binding B1 — FormatHuman to stdout.
    output = FORMAT_HUMAN(reports)
  IF WRITE output TO cfg.stdout IS error:
    WRITE "error: {err}" TO cfg.stderr
    TERMINATION exit 1
  TERMINATION exit 0

## FAILURE_PATH_TESTS
# [IMPL-NETIF_CLI] [ARCH-NETIF_REPORT] [REQ-NETIF_REPORT]
# How: Exercise every declared CLI failure mode through injected arguments, lister, and writer seams.

# [IMPL-NETIF_CLI] [ARCH-NETIF_REPORT] [REQ-NETIF_REPORT]
Contract:
  INPUT: cfg with invalid flags, failing lister, or failing stdout writer
  OUTPUT: exit code 1 and diagnostic on stderr
  PRE: dependencies are injectable and no process exit is invoked by RUN
  POST: failure does not report success or silently discard the diagnostic
  EFFECTS: stderr written; stdout is not used after a discovered failure
  FAILURE_MODES: FLAG_PARSE_FAILED, LIST_FAILED, WRITE_FAILED
  TERMINATION: total

# [IMPL-NETIF_CLI] [ARCH-NETIF_REPORT] [REQ-NETIF_REPORT]
# How: RED tests provide each controlled fault and assert exit code plus diagnostic ownership.
procedure VERIFY_FAILURE_PATHS():
  ASSERT RUN(invalid_flag_cfg) == 1
  ASSERT RUN(list_error_cfg) == 1
  ASSERT RUN(write_error_cfg) == 1
  RETURN verified

## MAIN
# [IMPL-NETIF_CLI] [ARCH-NETIF_REPORT] [REQ-NETIF_REPORT]
# How: Binding B4 — thin entry delegates to Run with OS defaults.

# [IMPL-NETIF_CLI] [ARCH-NETIF_REPORT] [REQ-NETIF_REPORT]
Contract:
  INPUT: os.Args, os.Stdout, os.Stderr, default osLister
  OUTPUT: process exit code from Run
  PRE: none
  POST: exit code propagated without panic
  EFFECTS: process termination with Run exit code
  TERMINATION: total

# [IMPL-NETIF_CLI] [ARCH-NETIF_REPORT] [REQ-NETIF_REPORT]
# How: Build default cfg and os.Exit(Run(cfg)).
procedure MAIN(): # [IMPL-NETIF_CLI] [ARCH-NETIF_REPORT] [REQ-NETIF_REPORT]
  cfg = defaultCfg(os.Args, os.Stdout, os.Stderr, osLister{})
  code = RUN(cfg)
  os.Exit(code)
