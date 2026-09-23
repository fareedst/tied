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
# POST: Subcommand `mcp` delegates to MCP stdio entry; `bootstrap` to copy-files; `yaml` to canonicalize; `agentstream` defaults to TS entry (Phase 4c); `TIED_AGENTSTREAM_IMPL=go` selects Go shim during deprecation window.
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
# POST (Phase 4d): Go tools/agentstream/ deleted; oracle fixtures under mcp-server/packages/agentstream/testdata/oracle/; TIED_AGENTSTREAM_IMPL=go rejected; TS-only forward path.
# TERMINATION (Phase 4d): Strangler complete — no Go subprocess; frozen oracle parity tests; operator quick-start Node-only.

## DEPRECATE_RUBY_AGENT_STREAM
# [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN]
# PRE: README marks tools/agent-stream deprecated; agentstream covers documented Ruby scenarios; Phase 4a live executor parity shipped.
# POST (Phase 4 slice 4b): tools/agent-stream/ removed from repo; operator docs point to tied agentstream and run-feature-batch-agentstream.sh; ATDD historical IMPL paths remain in TIED indexes as upstream references only.
# FAILURE_MODES: Operator script still defaulting to Ruby runner; grep/docs drift referencing removed tree.

procedure DEPRECATE_RUBY_AGENT_STREAM(project_root):
  # [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN]
  # How: delete tools/agent-stream; update run-feature-batch.sh to delegate to agentstream wrapper; refresh README and run-agent-stream-tied.md retirement banner.
  Contract:
    INPUT: project_root
    OUTPUT: git tree without Ruby agent-stream; updated operator entrypoints
    DATA: PLAN Phase 4b acceptance; Go/TS agentstream parity from 4a
    PRE: Deprecation notice present; no operator quick-start requires Ruby gem for unified suite
    POST: tools/agent-stream absent; scripts/run-feature-batch.sh does not invoke ruby run_agent_stream.rb
    EFFECTS: Filesystem — Ruby ATDD harness removed; strangler complete for Tier 4
    FAILURE_MODES: STALE_DOC_REFERENCE; BATCH_SCRIPT_RUBY_DEFAULT
    TERMINATION: total — finite file delete and doc grep pass
  DELETE directory tools/agent-stream under project_root
  REWRITE scripts/run-feature-batch.sh to exec run-feature-batch-agentstream.sh with same argv
  UPDATE root README and docs/run-agent-stream-tied.md with removal notice and tied agentstream migration
  RETURN inventory of remaining Tier 3 shell→Ruby paths per RISK-UNIFIED-005

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
# POST (Phase 4 slice 4b): dist/cli/adherence-append-action-attempted.js is sole hook bridge; .cursor/hooks/log.rb invokes TS only; scripts/adherence_append_action_attempted.rb removed; contract covered by mcp-server adherence-append-action-attempted.test.ts.
# FAILURE_MODES: Missing dist build → fail-silent diagnostic; no ledger write without marker.

procedure RUBY_ADHERENCE_LAUNCHER_REMOVAL(project_root):
  # [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
  # How: remove Ruby launcher and minitest contract test after TS tests green; update Go fake_tracker_agent.rb to node bridge path.
  Contract:
    INPUT: project_root
    OUTPUT: no scripts/adherence_append_action_attempted.rb on operator path
    DATA: active-turn-marker.v1; agent-adherence-event.v1 append-only rows
    PRE: log.rb calls adherence_append_action_attempted_ts; npm test covers append and fail-silent
    POST: Ruby launcher and ruby contract test deleted; CITDP evidence commands use npm test hook suite
    EFFECTS: Process — TS-only adherence hook bridge
    FAILURE_MODES: COMPOSITION_TEST_RUBY_SCRIPT_REFERENCE
    TERMINATION: total — finite delete and reference update
  DELETE scripts/adherence_append_action_attempted.rb
  DELETE scripts/test/adherence_append_action_attempted_test.rb
  UPDATE composition fixtures to node dist/cli/adherence-append-action-attempted.js
  RETURN pass when mcp-server adherence-append-action-attempted.test.ts green

## RISK_UNIFIED_005_INVENTORY (Phase 4 slice 4b)
# [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN]
# PRE: Tier 3 compare_yaml_dirs.rb deferred per sponsor OQ-4-3 unless blocking removal.
# POST: working inventory documents remaining shell→Ruby YAML paths (yaml_tool.sh, lint_yaml.sh) and @tied/yaml-cli replacement status.
# EFFECTS: Operators know Ruby YAML front-ends still exist until Tier 3 port; not blocking 4b Ruby agent-stream removal.

procedure RISK_UNIFIED_005_INVENTORY(project_root):
  # [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN]
  # How: grep scripts/*.sh for ruby invocations; record deferred compare scripts; no port in 4b unless gate blocked.
  Contract:
    INPUT: project_root
    OUTPUT: inventory table under working/REQ-TIED_UNIFIED_TOOLCHAIN/
    PRE: OQ-4-3 defer Tier 3 Ruby compare unless blocking
    POST: documented remaining Ruby/shell operator paths excluding removed agent-stream
    TERMINATION: total — finite grep and table write
  ENUM shell wrappers invoking Ruby YAML sorter
  RECORD compare_yaml_dirs.rb and yaml_semantic_compare.rb as deferred Tier 3
  RETURN inventory artifact path

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
# EFFECTS: Parity tests vs Go CLI; TS hook contract tests in mcp-server; checklist gate / reconcile composition expectations per RISK-UNIFIED-001.
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

## LIVE_EXECUTOR_TS (Phase 4 slice 4a)
# [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-GOAGENT-EXECUTOR] [REQ-TIED_UNIFIED_TOOLCHAIN]
# PRE: Go cmd/agentstream live loop is parity oracle; slices 2a–2d and extended dry-run dispatch intact.
# POST: TS live run invokes agent subprocess with stream-json parse; session chaining matches Go; no Go forward when impl=ts and argv qualifies (including --checklist-tracker-yaml tracker-mode live, Phase 4a follow-up).
# EFFECTS: Parity tests vs Go with fake_agent.rb control fixture; executor-run unit coverage for stream-json.
# FAILURE_MODES: UNQUALIFIED_ARGV_FORWARDS_TO_GO; LIVE_ORACLE_MISMATCH; MISSING_SESSION_ID

procedure LIVE_EXECUTOR_TS(live_argv, project_root):
  # [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-GOAGENT-EXECUTOR] [REQ-TIED_UNIFIED_TOOLCHAIN]
  # How: parse argv; buildTurnsFromConfig; runTiedPreflight; per-turn runAgent + sessionForTurn; exit on agent failure.
  Contract:
    INPUT: live_argv; project_root
    OUTPUT: streamed agent stdout; stderr turn headers and session_id; exit code
    DATA: Go executor.Run oracle; DryRunConfig from parseDryRunConfig
    PRE: TIED_AGENTSTREAM_IMPL=ts; qualifiesForTsNativeLiveRun
    POST: live stderr/session chaining matches Go oracle for golden fixtures
    EFFECTS: Process — TS agent subprocess without Go when argv qualifies
    FAILURE_MODES: UNQUALIFIED_ARGV_FORWARDS_TO_GO; ORACLE_MISMATCH
    TERMINATION: total — finite turn queue
  IF NOT qualifiesForTsNativeLiveRun THEN RETURN dispatch_go_forward(live_argv)
  IF checklist_tracker_yaml set THEN CALL EnsureTracker(definition, tracker_path, REQUEST token)
  IF run_id empty THEN ASSIGN newRunId
  turns := buildTurnsFromConfig
  IF runTiedPreflight blocks THEN RETURN exit code
  FOR each turn:
    IF tracker mode AND step_stub THEN evaluate traceable-commit envelope; append instruction_rendered; write active-turn marker; bindingEnv
    runAgent(agentArgv, extraEnv); capture session_id; stream stdout
    IF tracker mode THEN parseTrackerCompletionReceipt; ValidateReceiptBinding; resolve evidence; ApplyTrackerDisposition; ledger rows
    IF control goto AND tracker mode THEN InvalidateTrackerDownstream ELSE IF checklist-only goto THEN loop-back clearance on definition
    IF control goto THEN replaceRemainingFromStep
    clear active-turn marker
  RETURN exit code

## TRACKER_MODE_LIVE_TS (Phase 4a follow-up)
# [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
# PRE: Go cmd/agentstream tracker loop is oracle; EnsureTracker and receipt gating match checklist/tracker*.go.
# POST: Live runs with --checklist-tracker-yaml run TS-native when impl=ts; adherence ledger defaults; receipt before turn N+1.
# EFFECTS: Parity tests mirror tracker_composition_test.go with fake_tracker_agent.rb fixtures.

procedure TRACKER_MODE_LIVE_TS(tracker_live_argv, project_root):
  # [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
  # How: LIVE_EXECUTOR_TS with EnsureTracker, adherence/receipt loop, gate receipt writes per Go main.go handleTrackerTurn.
  Contract:
    INPUT: tracker_live_argv with -c and --checklist-tracker-yaml; REQUEST checklist var
    OUTPUT: tracker yaml updates; optional adherence JSONL; exit code
    DATA: Go tracker composition oracle; tracker-checklist.yaml fixture
    PRE: qualifiesForTsNativeLiveRun; tracker path differs from definition path
    POST: receipt gating and tracker dispositions match Go oracle
    EFFECTS: Process — TS tracker-mode live without Go subprocess when argv qualifies
    FAILURE_MODES: MISSING_RECEIPT; BINDING_MISMATCH; ORACLE_MISMATCH
    TERMINATION: total — finite checklist turn queue
  RETURN LIVE_EXECUTOR_TS(tracker_live_argv, project_root)

## CHECKLIST_RUN_TS (Phase 4 slice 4a)
# [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-GOAGENT-YAML-STEPS] [REQ-GOAGENT-CHECKLIST-CONTROL]
# PRE: Go checklist load + control.Parse loop is oracle; LIVE_EXECUTOR_TS dispatches qualified live argv.
# POST: Live checklist execution (-c without preview/dry-run) honors agentstream_control goto via replaceRemainingFromStep or InvalidateTrackerDownstream when tracker yaml set; matches Go fixtures.
# FAILURE_MODES: UNQUALIFIED_ARGV_FORWARDS_TO_GO; CONTROL_ROUTING_MISMATCH

procedure CHECKLIST_RUN_TS(checklist_live_argv, project_root):
  # [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-GOAGENT-CHECKLIST-CONTROL] [REQ-GOAGENT-CHECKLIST-CONTROL]
  # How: LIVE_EXECUTOR_TS with checklist turns; parseControl on transcript; Validate + ReplaceRemainingFromStep on goto.
  Contract:
    INPUT: checklist_live_argv with -c; project_root
    OUTPUT: agent stdout per turn; control DIAGNOSTIC on stderr; exit code
    DATA: Go main loop oracle; control-checklist.yaml fixture
    PRE: qualifiesForTsNativeLiveRun; lead checklist yaml set
    POST: control goto routing matches Go for golden fixture
    EFFECTS: Process — TS checklist live run without Go subprocess when argv qualifies
    FAILURE_MODES: UNQUALIFIED_ARGV_FORWARDS_TO_GO; ORACLE_MISMATCH
    TERMINATION: total — finite checklist turn queue
  RETURN LIVE_EXECUTOR_TS(checklist_live_argv, project_root)

## EXECUTOR_DRY_RUN_TS extension (Phase 4 slice 4a)
# [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-GOAGENT-PIPELINE] [REQ-TIED_UNIFIED_TOOLCHAIN]
# POST: qualifiesForTsNativeDryRun accepts --prompts-file, --tdd-yaml, --verify-session, --non-compact-html, argv after --, and --checklist-tracker-yaml on dry-run; pipeline uses loadTddTurns and applyNonCompactHtmlToTurns.
# EFFECTS: Parity tests vs Go oracle for verify-session and extended pipeline shapes.

## AGENTSTREAM_DEFAULT_IMPL_TS (Phase 4 slice 4c)
# [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN]
# PRE: Phase 4a live executor parity shipped; @tied/cli and @tied/agentstream resolveAgentstreamImpl used by tied agentstream subcommand.
# POST: When TIED_AGENTSTREAM_IMPL unset, resolve to ts; explicit go spawns Go binary; unknown values DIAGNOSTIC then ts.
# EFFECTS: Operators get TS-native documented flows without setting env; CI and parity tests cover both ts and go tokens.

procedure AGENTSTREAM_DEFAULT_IMPL_TS():
  # [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN]
  # How: default env literal ts in @tied/cli and dispatch-go.ts; update dispatcher.test.ts; refresh README dispatch tables.
  Contract:
    INPUT: process.env.TIED_AGENTSTREAM_IMPL optional
    OUTPUT: impl token go or ts
    DATA: PLAN Phase 4c acceptance; OQ-4-1 go opt-in during window
    PRE: Parity gates for documented operator flows pass with impl=ts
    POST: unset env yields ts; TIED_AGENTSTREAM_IMPL=go yields go
    EFFECTS: CLI help and operator docs state ts default
    FAILURE_MODES: STALE_DEFAULT_GO_IN_DOCS; TEST_EXPECTS_GO_DEFAULT
    TERMINATION: total — finite grep and test update
  raw := trim lower(process.env.TIED_AGENTSTREAM_IMPL ?? "ts")
  IF raw == "go" THEN RETURN go
  IF raw != "ts" AND raw != "" THEN LOG DIAGNOSTIC unknown; RETURN ts
  RETURN ts

## GO_DEPRECATION_WINDOW (Phase 4 slice 4c)
# [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN]
# PRE: tools/agentstream/ present; sponsor OQ-4-4 one tagged release with Go in repo and TS default.
# POST: phase4c-deprecation-notice.md documents window, opt-in go, and 4d removal; Go README banner; no Go tree delete in 4c.
# FAILURE_MODES: OPERATOR_ASSUMES_GO_REMOVED; MISSING_RELEASE_NOTE

procedure GO_DEPRECATION_WINDOW(project_root):
  # [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN]
  # How: write working/REQ-TIED_UNIFIED_TOOLCHAIN/phase4c-deprecation-notice.md; update PLAN dispatch table and root README.
  Contract:
    INPUT: project_root
    OUTPUT: deprecation notice artifact; updated operator docs
    DATA: OQ-4-4; OQ-4-1 go valid until 4d
    PRE: Default flip implemented in AGENTSTREAM_DEFAULT_IMPL_TS
    POST: Notice states ≥ one release cycle / tagged milestone before Go removal
    EFFECTS: Filesystem — notice only; Go tree unchanged
    FAILURE_MODES: PREMATURE_GO_DELETE
    TERMINATION: total — doc write without tools/agentstream delete
  WRITE working/REQ-TIED_UNIFIED_TOOLCHAIN/phase4c-deprecation-notice.md
  UPDATE README and tools/agentstream/README with deprecation banner
  RETURN success

## GO_TREE_REMOVAL (Phase 4 slice 4d)
# [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN]
# PRE: Phase 4a–4c shipped; npm test green with Go oracle; OQ-4-1 no post-4d go shim; OQ-4-2 frozen fixtures.
# POST: tools/agentstream/ Go sources removed (redirect README stub); testdata migrated; dispatch rejects go; phase4d-go-oracle-freeze.json records last_go_oracle_commit.
# FAILURE_MODES: PARITY_WITHOUT_FIXTURES; OPERATOR_DOC_REQUIRES_GO

procedure GO_TREE_REMOVAL(project_root):
  # [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN]
  # How: capture oracle fixtures; relocate checklist testdata; delete Go module; update @tied/cli and scripts; npm test without Go on PATH.
  Contract:
    INPUT: project_root
    OUTPUT: TS-only agentstream operator path; fixture root mcp-server/packages/agentstream/testdata/
    DATA: RISK-UNIFIED-007; phase4d-go-oracle-freeze.json
    PRE: Parity tests migrated to frozen oracle; MCP stdio unchanged
    POST: TIED_AGENTSTREAM_IMPL=go exits 2 with reinstall hint; no go run in default shell drivers
    EFFECTS: Filesystem — Go tree deleted; stub README at tools/agentstream/
    FAILURE_MODES: GO_FORWARD_REMAINS; TEST_REQUIRES_GO_BINARY
    TERMINATION: total — finite delete, fixture write, grep pass
  CAPTURE oracle outputs to packages/agentstream/testdata/oracle/
  DELETE Go module tree tools/agentstream except redirect README
  REWRITE dispatch-go.ts and @tied/cli to reject impl=go
  UPDATE scripts run-feature-batch-agentstream.sh, feature-relay.sh, tasd.sh, build-commands.sh
  RETURN phase4d-go-oracle-freeze.json with last_go_oracle_commit
