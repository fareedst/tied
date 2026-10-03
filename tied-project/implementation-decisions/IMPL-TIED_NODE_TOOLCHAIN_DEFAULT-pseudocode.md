# [IMPL-TIED_NODE_TOOLCHAIN_DEFAULT] [ARCH-TIED_NODE_TOOLCHAIN_DEFAULT] [REQ-TIED_NODE_TOOLCHAIN_DEFAULT] [REQ-TIED_UNIFIED_TOOLCHAIN] — Node-only controlled install/build/test/replay paths for the TIED mcp-server workspace.

Grammar-Version: v2

## Controlled runner inventory

- [IMPL-TIED_NODE_TOOLCHAIN_DEFAULT] [ARCH-TIED_NODE_TOOLCHAIN_DEFAULT] [REQ-TIED_NODE_TOOLCHAIN_DEFAULT] How: Enumerate canonical files that must never invoke Bun for operator/CI processes.
- Contract:
  - INPUT: repository root path
  - PRE: caller has read access to mcp-server and scripts trees
  - OUTPUT: list of controlled relative paths
  - POST: success => list includes package.json, build-commands.sh, run-mcp-tests.mjs, replay-jev-*.ts
  - EFFECTS: pure
  - TERMINATION: total
procedure CONTROLLED_RUNNER_PATHS:
  # [IMPL-TIED_NODE_TOOLCHAIN_DEFAULT] [ARCH-TIED_NODE_TOOLCHAIN_DEFAULT] [REQ-TIED_NODE_TOOLCHAIN_DEFAULT] How: Fixed canonical set for static contract enforcement.
  RETURN paths for mcp-server/package.json, scripts/build-commands.sh, mcp-server/scripts/run-mcp-tests.mjs, glob replay-jev-*.ts

## Workspace build (NODE_ONLY_WORKSPACE_BUILD)

- [IMPL-TIED_NODE_TOOLCHAIN_DEFAULT] [ARCH-TIED_NODE_TOOLCHAIN_DEFAULT] [REQ-TIED_NODE_TOOLCHAIN_DEFAULT] How: npm workspace build after root tsc.
procedure NODE_ONLY_WORKSPACE_BUILD:
  Contract:
    INPUT: mcp-server workspace root
    PRE: npm and node on PATH
    OUTPUT: success | { error: build_failed }
    POST: success => all workspace packages with build script compiled
    EFFECTS: IO
    TERMINATION: total
  RUN npm run build at workspace root where script equals tsc then npm run build --workspaces --if-present
  ON non-zero exit RETURN { error: build_failed }

## Shell aliases (NODE_ONLY_SHELL_ALIASES)

- [IMPL-TIED_NODE_TOOLCHAIN_DEFAULT] [ARCH-TIED_NODE_TOOLCHAIN_DEFAULT] [REQ-TIED_NODE_TOOLCHAIN_DEFAULT] How: build-commands.sh mirrors README npm commands.
procedure NODE_ONLY_SHELL_ALIASES:
  Contract:
    INPUT: build-commands functions build_mcp, test_mcp, test_agentstream, verify_agentstream_parity
    PRE: none
    OUTPUT: success
    POST: success => each echo_exec uses npm install, npm run, or npm run -w workspace
    EFFECTS: pure
    TERMINATION: total
  FOR each function REPLACE bun install WITH npm install
  FOR each function REPLACE bun run WITH npm run and Bun --filter WITH npm -w package name

## MCP test runner (NODE_ONLY_MCP_TEST_RUNNER)

- [IMPL-TIED_NODE_TOOLCHAIN_DEFAULT] [ARCH-TIED_NODE_TOOLCHAIN_DEFAULT] [REQ-TIED_NODE_TOOLCHAIN_DEFAULT] How: run-mcp-tests uses tsx for replay scripts like the main ts test suite.
procedure NODE_ONLY_MCP_TEST_RUNNER:
  Contract:
    INPUT: replay script relative path under mcp-server/scripts
    PRE: tsx available via node_modules/.bin or npx
    OUTPUT: success | { error: replay_failed }
    POST: success => replay script exit 0
    EFFECTS: IO
    TERMINATION: total
  RESOLVE tsx command same as tsx --test batch
  SPAWN tsx with replay script path
  ON non-zero exit RETURN { error: replay_failed }

## Replay script entry (REPLAY_SCRIPT_NODE_ENTRY)

- [IMPL-TIED_NODE_TOOLCHAIN_DEFAULT] [ARCH-TIED_NODE_TOOLCHAIN_DEFAULT] [REQ-TIED_NODE_TOOLCHAIN_DEFAULT] How: Node-compatible dirname via fileURLToPath(import.meta.url).
procedure REPLAY_SCRIPT_NODE_ENTRY:
  Contract:
    INPUT: import.meta.url of replay module
    PRE: ESM module context
    OUTPUT: repoRoot absolute path
    POST: success => repoRoot resolves two levels above script directory
    EFFECTS: pure
    TERMINATION: total
  SET scriptDir FROM dirname of fileURLToPath(import.meta.url)
  SET repoRoot FROM resolve(scriptDir, ../..)
  RETURN repoRoot

## Static contract (NODE_ONLY_BUN_FORBIDDEN)

- [IMPL-TIED_NODE_TOOLCHAIN_DEFAULT] [ARCH-TIED_NODE_TOOLCHAIN_DEFAULT] [REQ-TIED_NODE_TOOLCHAIN_DEFAULT] How: Contract test fails on Bun shebang or bun install/run/test spawns in controlled files.
procedure NODE_ONLY_BUN_FORBIDDEN:
  Contract:
    INPUT: controlled file contents
    PRE: CONTROLLED_RUNNER_PATHS enumerated
    OUTPUT: pass | { error: bun_detected, path, match }
    POST: pass => no forbidden Bun patterns in any controlled file
    EFFECTS: pure
    TERMINATION: total
  FOR each controlled path READ content
  IF content matches env bun shebang OR bun install OR bun run OR bun test THEN RETURN error
  RETURN pass
