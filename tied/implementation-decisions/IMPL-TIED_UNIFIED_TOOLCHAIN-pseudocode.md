Grammar-Version: v2

# [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN]
# Planning pseudo-code: unified toolchain workspace and CLI dispatch (no production migration in Phase 0).

## WORKSPACE_SCAFFOLD
# [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN]
# PRE: mcp-server builds with existing npm scripts; tools/bootstrap remains addressable.
# POST (Phase 1): npm workspace at mcp-server/ with @tied/mcp (root package, src unchanged) and @tied/cli; @tied/bootstrap deferred to Phase 2.
# EFFECTS: Single `npm run build` at workspace root produces mcp-server/dist/index.js and packages/cli/dist for `tied mcp`.

## UMBRELLA_CLI_DISPATCH
# [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN]
# PRE: argv[0] is `tied` or `node @tied/cli`.
# POST: Subcommand `mcp` delegates to MCP stdio entry; `bootstrap` to copy-files; `yaml` to canonicalize; `agentstream` dispatches to ported or shim binary during strangler phase.
# EFFECTS: Operators use one documented CLI surface; tied-cli.sh may exec the same entry.

## MCP_STDIO_ENTRY_UNCHANGED
# [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN]
# PRE: Cursor `.cursor/mcp.json` references absolute path to dist/index.js or `tied mcp`.
# POST: Stdio JSON-RPC behavior matches pre-unification mcp-server; TIED_BASE_PATH semantics unchanged.
# FAILURE_MODES: Wrong TIED_BASE_PATH still mutates unintended tied/ tree (document; no regression).

## AGENTSTREAM_STRANGLER
# [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN]
# PRE: Go agentstream tests pass; TS port package exists behind env TIED_AGENTSTREAM_IMPL=go|ts.
# POST (Phase 3a): @tied/agentstream package; tied agentstream subcommand; default go spawn; tiedpreflight TS port with fixture parity tests; dry-run composition parity via Go oracle; checklist testdata golden assertions.
# POST (Phase 3b slice 1): TS-native --checklist-tracker-preview (PreviewTrackerMigration parity vs Go oracle); TIED_AGENTSTREAM_IMPL=ts serves preview without Go; other argv forwards with DIAGNOSTIC.
# BACKLOG (Phase 3b remainder): checklist render/expansion, pipeline, executor dry-run TS-native, adherence (RISK-UNIFIED-001).
# TERMINATION: When full parity gate passes, default impl=ts and Go removal scheduled in Phase 4.

## DEPRECATE_RUBY_AGENT_STREAM
# [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN]
# PRE: README marks tools/agent-stream deprecated; agentstream covers documented Ruby scenarios.
# POST: No new features in Ruby; removal in Phase 4 after one release cycle warning.

## BOOTSTRAP_PACKAGE_WRAP
# [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN]
# PRE: tools/bootstrap/copy-files.mjs and new-tied-client.mjs remain authoritative engines.
# POST: @tied/bootstrap resolves paths; `tied bootstrap` and copy_files.sh delegate without behavior drift.
# EFFECTS: E2E bootstrap tests pass via node, bash, and tied entrypoints.

## YAML_CLI_FRONTEND
# [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_YAML_CANONICALIZATION]
# PRE: mcp-server/dist/cli/yaml-canonicalizer.js implements canonical profile.
# POST: @tied/yaml-cli and `tied yaml lint|canonicalize` match yaml_tool.sh default/canonicalizer path.
# EFFECTS: Parity tests compare umbrella yaml subcommand to direct canonicalizer invocation.

## ADHERENCE_HOOK_TS_BRIDGE
# [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
# PRE: Ruby bridge defined append-only action_attempted semantics and fail-silent marker policy.
# POST: dist/cli/adherence-append-action-attempted.js mirrors Ruby; hooks and ruby launcher delegate to TS.
# FAILURE_MODES: Missing dist build → fail-silent diagnostic; no ledger write without marker.

## EXECUTOR_DRY_RUN_TS (Phase 3b slice 2a)
# [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN]
# PRE: Go runDryRun in tools/agentstream/cmd/agentstream/main.go is parity oracle; @tied/agentstream dispatcher routes dry-run argv when TIED_AGENTSTREAM_IMPL=ts.
# POST: TS-native dry-run emits same stderr DIAGNOSTIC/exit semantics as Go for golden fixture inputs; no Go subprocess for dry-run when impl=ts and argv qualifies.
# EFFECTS: Parity tests in packages/agentstream compare TS dry-run output to Go oracle JSON/fixtures.
# FAILURE_MODES: Partial argv match forwards to Go with DIAGNOSTIC (unchanged until slice completes).

procedure EXECUTOR_DRY_RUN_TS(dry_run_argv, project_root):
  # [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN]
  # How: parse argv like Go config.Config; if not dry-run mode, delegate to existing dispatch-go forward path.
  Contract:
    INPUT: dry_run_argv; project_root
    OUTPUT: process exit code; stderr DIAGNOSTIC stream
    DATA: Go runDryRun oracle; @tied/agentstream dispatcher state
    PRE: Go agentstream tests pass; TIED_AGENTSTREAM_IMPL=ts when TS path selected
    POST: dry-run stderr/exit matches Go oracle for golden fixture inputs
    EFFECTS: Process — TS dry-run without Go subprocess when argv qualifies
    FAILURE_MODES: UNQUALIFIED_ARGV_FORWARDS_TO_GO; ORACLE_MISMATCH
    TERMINATION: total — finite argv parse and dry-run simulation
  IF dry_run_argv lacks dry-run flag THEN RETURN dispatch_go_forward(dry_run_argv)
  RESOLVE turns, chain, preflight hooks per Go runDryRun contract
  EMIT stderr DIAGNOSTIC lines matching Go oracle for fixture inputs
  RETURN exit code matching Go oracle

## PIPELINE_BATCH_TS (Phase 3b slice 2b)
# [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-GOAGENT-PIPELINE] [REQ-GOAGENT-PIPELINE-CHAIN]
# PRE: Go pipeline.Build and featurespec.LoadTurns are parity oracles; slice 2a dry-run dispatch intact.
# POST: TS buildPipeline matches Go order (argv → prompts-file → tdd → feature-spec + checklist → verify); prompt-file preload applied; preview batch and qualified pipeline dry-run avoid Go when impl=ts.
# EFFECTS: run-feature-batch-agentstream.sh dry-run parity via tied agentstream; golden parity tests vs Go.
# FAILURE_MODES: UNQUALIFIED_ARGV_FORWARDS_TO_GO; PIPELINE_ORACLE_MISMATCH; TDD_OR_PROMPTS_FILE_NOT_IN_SLICE

procedure PIPELINE_BATCH_TS(pipeline_argv, project_root):
  # [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-GOAGENT-PIPELINE] [REQ-GOAGENT-PIPELINE-CHAIN]
  # How: parse argv; if preview-feature-spec-batch-yaml, render via TS featurespec preview; if dry-run and qualifies, buildPipeline + executeExecutorDryRun; else forward with DIAGNOSTIC.
  Contract:
    INPUT: pipeline_argv; project_root
    OUTPUT: stdout preview or dry-run transcript; stderr DIAGNOSTIC; exit code
    DATA: Go pipeline.Build oracle; featurespec batch YAML; checklist testdata goldens
    PRE: Go agentstream tests pass; TIED_AGENTSTREAM_IMPL=ts when TS path selected
    POST: pipeline dry-run and batch preview match Go oracle for qualified argv
    EFFECTS: Process — TS pipeline subset without Go subprocess when argv qualifies
    FAILURE_MODES: UNQUALIFIED_ARGV_FORWARDS_TO_GO; ORACLE_MISMATCH
    TERMINATION: total — finite parse, build, and render
  IF argv has --preview-feature-spec-batch-yaml AND qualifies THEN RETURN previewFeatureSpecBatch
  IF argv has dry-run AND qualifiesForTsNativeDryRun THEN
    turns := buildPipelineFromDryRunConfig
    RETURN renderDryRun(turns) matching Go runDryRun
  RETURN dispatch_go_forward(pipeline_argv)

## CHECKLIST_RENDER_TS (Phase 3b slice 2c)
# [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-GOAGENT-YAML-STEPS] [REQ-GOAGENT-YAML-STEP-RENDER]
# PRE: Go checklist.MessagesFromYAML and checklist.Preview are parity oracles; slices 2a–2b dispatch intact.
# POST: TS --preview-lead-checklist (with -c) emits same stdout as Go for checklist testdata goldens; placeholder expansion and step bounds match; no Go forward when impl=ts and argv qualifies.
# EFFECTS: Parity tests compare TS checklist preview to Go oracle on tools/agentstream/checklist/testdata.
# FAILURE_MODES: UNQUALIFIED_ARGV_FORWARDS_TO_GO; CHECKLIST_RENDER_ORACLE_MISMATCH

procedure CHECKLIST_RENDER_TS(checklist_argv, project_root):
  # [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-GOAGENT-YAML-STEPS] [REQ-GOAGENT-YAML-STEP-RENDER]
  # How: parse argv; if --preview-lead-checklist with -c, render via messagesFromChecklistYaml + previewLeadChecklist; else forward with DIAGNOSTIC.
  Contract:
    INPUT: checklist_argv; project_root
    OUTPUT: stdout expanded checklist prompts; exit code
    DATA: Go checklist.Preview oracle; checklist-load-turns; checklist-placeholders
    PRE: Go agentstream tests pass; TIED_AGENTSTREAM_IMPL=ts when TS path selected
    POST: checklist preview stdout matches Go oracle for golden fixture inputs
    EFFECTS: Process — TS checklist render preview without Go subprocess when argv qualifies
    FAILURE_MODES: UNQUALIFIED_ARGV_FORWARDS_TO_GO; ORACLE_MISMATCH
    TERMINATION: total — finite parse and render
  IF argv has --preview-lead-checklist AND qualifiesForTsNativeChecklistPreview THEN
    opts := checklistLoadOptionsFromConfig
    RETURN previewLeadChecklist(-c path, opts) matching Go checklist.Preview
  RETURN dispatch_go_forward(checklist_argv)

## ADHERENCE_STRANGLER_TS (Phase 3b slice 2d)
# [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
# PRE: Go ReconcileAdherenceChain and adherence-reconcile CLI are parity oracles; slices 2a–2c dispatch intact; MCP adherence_append_action_attempted TS hook shipped.
# POST: TS adherence-reconcile operator surface in @tied/agentstream matches Go findings for table fixtures; tied agentstream impl=ts serves adherence-reconcile argv without Go forward; MCP tied_adherence_reconcile_run prefers TS reconcile when available.
# EFFECTS: Parity tests vs Go CLI; Ruby contract tests unchanged; checklist gate / reconcile composition expectations per RISK-UNIFIED-001.
# FAILURE_MODES: UNQUALIFIED_ARGV_FORWARDS_TO_GO; RECONCILE_ORACLE_MISMATCH

procedure ADHERENCE_STRANGLER_TS(adherence_argv, project_root):
  # [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
  # How: if argv is adherence-reconcile operator surface (requires --tracker), run TS ReconcileAdherenceChain and emit JSON; else existing dispatch paths.
  Contract:
    INPUT: adherence_argv; project_root
    OUTPUT: stdout ReconcileReport JSON; stderr DIAGNOSTIC on CLI errors; exit code
    DATA: Go ReconcileAdherenceChain oracle; agent-adherence-event.v1 ledger; checklist-gate-receipt.v1 dir
    PRE: Go agentstream checklist tests pass; TIED_AGENTSTREAM_IMPL=ts when TS path selected
    POST: reconcile report findings match Go oracle for qualified argv and fixture corpora
    EFFECTS: Process — TS adherence reconcile without Go subprocess when argv qualifies
    FAILURE_MODES: UNQUALIFIED_ARGV_FORWARDS_TO_GO; ORACLE_MISMATCH
    TERMINATION: total — finite parse, ledger read, reconcile
  IF argv is adherence-reconcile subcommand OR qualifiesForTsNativeAdherenceReconcile THEN
    RETURN runAdherenceReconcileCli(adherence_argv) matching Go cmd/adherence-reconcile
  RETURN dispatch_go_forward(adherence_argv)
