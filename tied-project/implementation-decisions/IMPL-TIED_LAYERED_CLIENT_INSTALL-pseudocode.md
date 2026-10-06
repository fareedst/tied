# IMPL-TIED_LAYERED_CLIENT_INSTALL essence pseudocode

<!-- [IMPL-TIED_LAYERED_CLIENT_INSTALL] [ARCH-TIED_LAYERED_CLIENT_INSTALL] [REQ-TIED_LAYERED_CLIENT_INSTALL] -->

```
// [IMPL-TIED_LAYERED_CLIENT_INSTALL] [ARCH-TIED_LAYERED_CLIENT_INSTALL] [REQ-TIED_LAYERED_CLIENT_INSTALL]
// How: Layered install orchestration for linked/full client profiles.
PROCEDURE INSTALL_TIED_LAYERS(projectRoot, options)
  PRE: projectRoot is writable directory; store reachable when not doctor-only
  POST: selected layers applied; manifest written unless doctor
  EFFECTS: gitignored stubs or copies; MCP env includes bundle when linked
  FAILURE_MODES: STORE_UNREACHABLE; verify gate failures

  PARSE_INSTALL_ARGS(argv) -> options
  RESOLVE_STORE_ROOT(options) -> storeRoot
  CHECK_STORE_REACHABLE(storeRoot)

  IF options.doctor THEN
    RUN_DOCTOR(projectRoot, storeRoot)
    TERMINATE
  ENDIF

  IF layers contains db THEN INSTALL_DB_LAYER END
  IF layers contains mcp THEN INSTALL_MCP_LAYER END
  IF layers contains skills THEN
    IF mode linked THEN INSTALL_SKILLS_LINKED ELSE INSTALL_SKILLS_FULL END
  ENDIF
  IF layers contains methodology THEN
    IF mode linked THEN INSTALL_METHODOLOGY_LINKED ELSE INSTALL_METHODOLOGY_FULL END
  ENDIF

  VERIFY_STORE(projectRoot, options)
  WRITE_INSTALL_MANIFEST(projectRoot, selections)
END PROCEDURE

// [IMPL-TIED_LAYERED_CLIENT_INSTALL] [ARCH-TIED_LAYERED_CLIENT_INSTALL] [REQ-TIED_LAYERED_CLIENT_INSTALL]
// How: Idempotent managed gitignore paths for gitignored install artifacts.
PROCEDURE APPLY_GITIGNORE_MANAGED_BLOCK(projectRoot)
  PRE: projectRoot writable
  POST: marker-delimited block lists mcp/skills/methodology/docs/manifest paths
  EFFECTS: append or replace TIED INSTALL MANAGED section in .gitignore
END PROCEDURE

// [IMPL-TIED_LAYERED_CLIENT_INSTALL] [ARCH-TIED_LAYERED_CLIENT_INSTALL] [REQ-TIED_LAYERED_CLIENT_INSTALL]
// How: Resolve linked methodology bundle path (live store tree vs pinned corpus).
PROCEDURE RESOLVE_LINKED_METHODOLOGY_BUNDLE(projectRoot, storeRoot, choice)
  PRE: storeRoot reachable
  POST: absolute bundlePath for MCP TIED_METHODOLOGY_BUNDLE_PATH
  EFFECTS: may materialize .linked-methodology-view under projectRoot
  FAILURE_MODES: BUNDLE_MISSING
END PROCEDURE

// [IMPL-TIED_LAYERED_CLIENT_INSTALL] [ARCH-TIED_LAYERED_CLIENT_INSTALL] [REQ-TIED_LAYERED_CLIENT_INSTALL]
// How: Linked verify uses synthetic tied/ symlinks so inherited methodology checks run without local copies.
PROCEDURE VERIFY_STORE_LINKED(projectRoot, storeRoot, bundlePath)
  PRE: linked install completed or partial with bundlePath
  POST: fidelity/inherited/pseudocode checks pass against syntheticTiedDir
  EFFECTS: returns parity not_applicable_linked (skip client refresh parity exit 1)
END PROCEDURE

// [IMPL-TIED_LAYERED_CLIENT_INSTALL] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_LAYERED_CLIENT_INSTALL] [REQ-TIED_SETUP]
// How: Post-install verify may call tied_validate_consistency via INVOKE_TIED_CLI_MCP_TOOL (Node stdio client, windowsHide on win32).
PROCEDURE VERIFY_STORE_MCP_CONSISTENCY(projectRoot, storeRoot)
  PRE: tied-project layout present; store MCP dist built
  POST: invokeTiedCliMcpTool ok when consistency passes
  EFFECTS: subprocess via CHILD_PROCESS_SPAWN_OPTIONS
END PROCEDURE

// [IMPL-TIED_LAYERED_CLIENT_INSTALL] [ARCH-TIED_LAYERED_CLIENT_INSTALL] [REQ-TIED_LAYERED_CLIENT_INSTALL]
// How: Factory passthrough maps new-tied-client flags/env to tied-install argv.
PROCEDURE BUILD_FACTORY_INSTALL_ARGV(sourceRoot, harnessProfile, installOptions)
  PRE: sourceRoot is store
  POST: argv includes --mode, --harness, --store; optional --layers, --methodology-bundle, --doctor
END PROCEDURE

// [IMPL-TIED_LAYERED_CLIENT_INSTALL] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_LAYERED_CLIENT_INSTALL]
// How: Install shell shims (.sh / .cmd / .ps1) delegate to one Node child (CLI install or install-layers.mjs).
PROCEDURE RUN_TIED_INSTALL_ENTRYPOINT(argv)
  PRE: Node on PATH (shim checks); repo root resolvable from import.meta.url
  POST: child exit status returned unchanged; argv forwarded without mutation
  EFFECTS: spawns exactly one child — CLI `install` when dist exists else install-layers.mjs
  FAILURE_MODES: NODE_MISSING (shim); CHILD_SPAWN_FAILED → exit 1 with DIAGNOSTIC line
END PROCEDURE

// [IMPL-TIED_LAYERED_CLIENT_INSTALL] [ARCH-TIED_LAYERED_CLIENT_INSTALL] [REQ-TIED_LAYERED_CLIENT_INSTALL]
// How: install-layers --legacy-bootstrap selects platform copy_files entry (win32 → tied-install.cmd).
PROCEDURE RESOLVE_LEGACY_BOOTSTRAP_SCRIPT(repoRoot, platform)
  PRE: repoRoot is store checkout
  POST: absolute path to tied-install.cmd on win32 else tied-install.sh
END PROCEDURE
```
