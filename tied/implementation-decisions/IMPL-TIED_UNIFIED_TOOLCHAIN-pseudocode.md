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
