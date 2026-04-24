# [IMPL-GOAGENT-CLI-CMD] [ARCH-GOAGENT-CLI] [REQ-GOAGENT-CLI-CONFIG]
# Summary: Parse argv, resolve defaults, validate, branch preview vs pipeline vs executor — unified CLI.

# How: Composition order: config.ParseAndResolve → optional IMPL-GOAGENT-FEATURESPEC Preview (early exit) → IMPL-GOAGENT-PIPELINE.Build → mid-batch slice/resume → ReadPromptFilePreload(cfg.PromptFiles) → ApplyPromptFilePreload(turns, cfg.SessionID, preload) → ChainBetween → optional tiedpreflight (static .cursor/mcp.json) → dry-run OR per-turn IMPL-GOAGENT-EXECUTOR. Shared DATA: []Turn and session id string; pre — cwd + os.Args; post — process exit.

procedure main:
  # [IMPL-GOAGENT-CLI-CMD] [ARCH-GOAGENT-CLI] [REQ-GOAGENT-CLI-CONFIG]
  cfg := ParseAndResolve(cwd, os.Args[1:])
  ON ParseAndResolve error: if help sentinel print usage and exit 0; else print error and exit non-zero
  # [IMPL-GOAGENT-FEATURESPEC] [ARCH-GOAGENT-YAML-FEATURESPEC] [REQ-GOAGENT-FEATURESPEC-BATCH]
  if cfg.PreviewFeatureSpecBatchYAML != "":
    featurespec.Preview(...)
    exit 0
  # [IMPL-GOAGENT-PIPELINE] [ARCH-GOAGENT-PIPELINE] [REQ-GOAGENT-PIPELINE-CHAIN] [REQ-GOAGENT-CLI-CONFIG]
  turns := pipeline.Build(...)
  ON pipeline.Build error: exit non-zero with error
  ON cfg.FirstTurn > 1 and empty SessionID: error exit (--session-id required for resume)
  turns := pipeline.SliceFromFirstTurn(turns, cfg.FirstTurn)
  ON SliceFromFirstTurn error (e.g. N > len(turns)): exit non-zero
  preload := pipeline.ReadPromptFilePreload(cfg.PromptFiles)
  ON ReadPromptFilePreload error: exit non-zero
  pipeline.ApplyPromptFilePreload(turns, cfg.SessionID, preload)
  chain := pipeline.ChainBetween(turns)
  # [tiedpreflight] Optional validation of .cursor/mcp.json for tied-yaml before cursor agent or dry-run.
  # Default OFF: resolveDefaults sets SkipTiedMCPPreflight=true unless user set --tied-mcp-preflight or --skip-tied-mcp-preflight.
  # effectiveSkipTiedMCPPreflight (main.go): AGENTSTREAM_SKIP_TIED_MCP_PREFLIGHT=1 forces skip; AGENTSTREAM_TIED_MCP_PREFLIGHT=1 forces run.
  # When enabled: TTY may prompt; non-TTY may exit non-zero unless -y/--yes or skip env.
  if runTiedPreflight(cfg) != 0:
    exit with code from preflight
  if cfg.DryRun:
    runDryRun(...)
    exit 0
  for each turn with index i in sliced list:
    # [IMPL-GOAGENT-EXECUTOR] [ARCH-GOAGENT-EXECUTOR] [REQ-GOAGENT-AGENT-EXECUTOR]
    argv := executor.AgentArgv(...)
    sid, code, err := executor.Run(...)
    ON executor.Run error or empty session id when required: exit with code and message per main.go contract
    require sid non-empty (Ruby parity)