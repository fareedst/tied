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
  POST: marker-delimited block lists mcp/skills/methodology/docs/manifest paths plus BASE_FILES agent loaders AGENTS.md and .cursorrules
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

// [IMPL-TIED_LAYERED_CLIENT_INSTALL] [ARCH-TIED_TWO_FOLDER_LAYOUT] [REQ-TIED_LAYERED_CLIENT_INSTALL] [REQ-TIED_TWO_FOLDER_LAYOUT] [PROC-TIED_METHODOLOGY_READONLY]
// How: Manifest allowlists install methodology docs into tied-bundle/docs and templates into tied-bundle/templates only; no tied-project/working/{REQ}/ comprehension seed on factory clients.
PROCEDURE INSTALL_METHODOLOGY_DOC_AND_TEMPLATE_ALLOWLIST(projectRoot, storeRoot, mode)
  PRE: manifest.json defines DOCS_TO_COPY and METHODOLOGY_TEMPLATES_TO_COPY
  POST: linked stubs or full copy-when-missing for allowlisted basenames under client tied-bundle/
  EFFECTS: processes.md sibling links (brownfield guide, working-artifact-placement) resolve locally
  FAILURE_MODES: STORE_DOC_OR_TEMPLATE_MISSING
  DATA_TRANSITION: DOCS_TO_COPY → tied-bundle/docs/; sidecar + METHODOLOGY_TEMPLATES_TO_COPY → tied-bundle/templates/
END PROCEDURE

// [IMPL-TIED_LAYERED_CLIENT_INSTALL] [ARCH-TIED_LAYERED_CLIENT_INSTALL] [REQ-TIED_LAYERED_CLIENT_INSTALL]
// How: Operator help when shim invoked without a client target (texture aligned with build-workspace.sh).
PROCEDURE TIED_INSTALL_HELP_TEXTURE(argv)
  PRE: argv is process argv slice after node entry
  POST: if isTiedInstallHelpArgv(argv) then styled help on stdout and exit 0; else install proceeds
  EFFECTS: dispatch path prints help without CHILD spawn or DIAGNOSTIC line
  FAILURE_MODES: none (help is success)

  IF isTiedInstallHelpArgv(argv) THEN
    printTiedInstallHelp()
    TERMINATE exit 0
  ENDIF
END PROCEDURE

// [IMPL-TIED_LAYERED_CLIENT_INSTALL] [ARCH-TIED_LAYERED_CLIENT_INSTALL] [REQ-TIED_LAYERED_CLIENT_INSTALL]
// How: Load ordered client roots from YAML list file or stdin for batch tied-install.
PROCEDURE LOAD_INSTALL_TARGETS_YAML(sourcePath, baseDir)
  PRE: sourcePath is readable file path or "-" for stdin
  POST: ordered list of absolute directory path strings
  EFFECTS: parse js-yaml document as list or { targets: list }; resolve relative paths against baseDir; expand ~
  FAILURE_MODES: TARGETS_YAML_INVALID; TARGETS_LIST_EMPTY
END PROCEDURE

// [IMPL-TIED_LAYERED_CLIENT_INSTALL] [ARCH-TIED_LAYERED_CLIENT_INSTALL] [REQ-TIED_LAYERED_CLIENT_INSTALL]
// How: Apply include/exclude globs and optional missing or install-manifest filters before batch run.
PROCEDURE FILTER_INSTALL_TARGETS(paths, filterOptions)
  PRE: paths are normalized absolute strings
  POST: subset paths after AND-combined filters
  FAILURE_MODES: TARGETS_FILTER_EMPTY
END PROCEDURE

// [IMPL-TIED_LAYERED_CLIENT_INSTALL] [ARCH-TIED_LAYERED_CLIENT_INSTALL] [REQ-TIED_LAYERED_CLIENT_INSTALL]
// How: Sequential multi-target install orchestration with plan-only and continue-on-error policies.
PROCEDURE RUN_INSTALL_BATCH(targets, parsedOptions, runOne) // [IMPL-TIED_LAYERED_CLIENT_INSTALL] [ARCH-TIED_LAYERED_CLIENT_INSTALL] [REQ-TIED_LAYERED_CLIENT_INSTALL]
  PRE: targets non-empty when not plan-only; runOne invokes per-target install, refresh, doctor, or migrate
  POST: each target processed per fail-fast or continue-on-error policy
  EFFECTS: log prefix [index/total]; DIAGNOSTIC batch summary line
  FAILURE_MODES: BATCH_ABORTED_FIRST_ERROR; BATCH_PARTIAL_FAILURE
  TERMINATION: exit 0 when all succeed or plan-only; exit 1 on any failure (partial when continue-on-error)
END PROCEDURE
```
