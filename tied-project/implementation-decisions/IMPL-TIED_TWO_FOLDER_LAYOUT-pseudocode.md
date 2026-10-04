# IMPL-TIED_TWO_FOLDER_LAYOUT essence pseudocode

<!-- [IMPL-TIED_TWO_FOLDER_LAYOUT] [ARCH-TIED_TWO_FOLDER_LAYOUT] [ARCH-TIED_PROJECT_CONFIG_OWNERSHIP] [REQ-TIED_TWO_FOLDER_LAYOUT] -->

```
// [IMPL-TIED_TWO_FOLDER_LAYOUT] [ARCH-TIED_TWO_FOLDER_LAYOUT] [REQ-TIED_TWO_FOLDER_LAYOUT]
// How: Pure path resolution from project root using tied-project + tied-bundle constants.
PROCEDURE RESOLVE_TIED_LAYOUT(projectRoot) -> layout
  PRE: projectRoot is absolute or resolvable path string
  POST: layout fields are absolute paths; methodologyIndexRoot equals bundleDir
  EFFECTS: none (pure)
  FAILURE_MODES: none
END PROCEDURE

// [IMPL-TIED_TWO_FOLDER_LAYOUT] [ARCH-TIED_TWO_FOLDER_LAYOUT] [REQ-TIED_TWO_FOLDER_LAYOUT]
// How: Refuse installer when store and project roots coincide or nest.
PROCEDURE GUARD_SELF_INSTALL(projectRoot, storeRoot, allow)
  PRE: both roots resolvable
  POST: returns when allowed or distinct roots
  FAILURE_MODES: SELF_INSTALL_REFUSED when equal or nested and allow is false
END PROCEDURE

// [IMPL-TIED_TWO_FOLDER_LAYOUT] [ARCH-TIED_PROJECT_CONFIG_OWNERSHIP] [REQ-TIED_TWO_FOLDER_LAYOUT]
// How: Parse committed project config at tied-project/config.yaml.
PROCEDURE LOAD_PROJECT_CONFIG(layout) -> cfg
  PRE: layout.projectConfigPath may exist
  POST: cfg conforms to tied-project-config.v1 when file present
  FAILURE_MODES: PROJECT_CONFIG_INVALID; CONFIG_UNKNOWN_KEY
END PROCEDURE

// [IMPL-TIED_TWO_FOLDER_LAYOUT] [ARCH-TIED_PROJECT_CONFIG_OWNERSHIP] [REQ-TIED_TWO_FOLDER_LAYOUT]
// How: Parse local install config; null when absent (store mode).
PROCEDURE LOAD_INSTALL_CONFIG(layout) -> cfg|null
  PRE: layout.installConfigPath optional
  POST: null when file absent (store mode)
  FAILURE_MODES: INSTALL_CONFIG_INVALID
END PROCEDURE

// [IMPL-TIED_TWO_FOLDER_LAYOUT] [ARCH-TIED_PROJECT_CONFIG_OWNERSHIP] [REQ-TIED_TWO_FOLDER_LAYOUT]
// How: Disjoint key ownership with install_defaults overlay only.
PROCEDURE MERGE_TIED_CONFIG(project, install) -> effective
  PRE: project and install parsed objects
  POST: effective config for readers
  FAILURE_MODES: CONFIG_KEY_OWNERSHIP_VIOLATION
END PROCEDURE

// [IMPL-TIED_TWO_FOLDER_LAYOUT] [ARCH-TIED_TWO_FOLDER_LAYOUT] [REQ-TIED_TWO_FOLDER_LAYOUT]
// How: Methodology root from env override, install.json, or store mode null.
PROCEDURE RESOLVE_METHODOLOGY_ROOT(layout, env) -> path|null
  PRE: layout resolved
  POST: absolute bundle root or null in store mode
  EFFECTS: none
END PROCEDURE

// [IMPL-TIED_TWO_FOLDER_LAYOUT] [ARCH-TIED_TWO_FOLDER_LAYOUT] [REQ-TIED_TWO_FOLDER_LAYOUT]
// How: Fail-closed legacy markers including top-level tied/ after migration.
PROCEDURE DETECT_LEGACY_LAYOUT(projectRoot) -> result
  PRE: projectRoot writable path
  POST: detected false or LEGACY_LAYOUT_DETECTED with migrate hint
  TERMINATION: scan complete
END PROCEDURE

// [IMPL-TIED_TWO_FOLDER_LAYOUT] [ARCH-TIED_TWO_FOLDER_LAYOUT] [REQ-TIED_TWO_FOLDER_LAYOUT]
// How: Gitignore v2 — tied-bundle/, harness paths, optional repo-root skills/; client profile strips legacy LOCAL WORKING blocks.
PROCEDURE APPLY_GITIGNORE_MANAGED_BLOCK(projectRoot)
  PRE: projectRoot writable
  POST: INSTALL MANAGED block only; no LOCAL WORKING or UNDIVIDED STORE MIRROR; no tied-project/ entry
  EFFECTS: replaces v1 paths; mergeLocalWorkingGitignoreBlock with profile client removes legacy blocks
END PROCEDURE

// [IMPL-TIED_TWO_FOLDER_LAYOUT] [ARCH-TIED_TWO_FOLDER_LAYOUT] [REQ-TIED_TWO_FOLDER_LAYOUT]
// How: Store close-out and collapseLegacyWorkingGitignorePatterns use profile store + expanded working globs.
PROCEDURE MERGE_LOCAL_WORKING_GITIGNORE(content, profile)
  PRE: profile in {client, store}
  POST: client removes legacy blocks without append; store maintains expanded local-working block
  EFFECTS: preserves unrelated lines and ! negations
END PROCEDURE

// [IMPL-TIED_TWO_FOLDER_LAYOUT] [ARCH-TIED_TWO_FOLDER_LAYOUT] [REQ-TIED_TWO_FOLDER_LAYOUT]
// How: Route committed vs local working artifacts.
PROCEDURE RESOLVE_WORKING_ROOT(projectRoot, token, kind) -> path
  PRE: kind in {committed, local}
  POST: path under tied-project/working or tied-bundle/working
  EFFECTS: none
END PROCEDURE

// [IMPL-TIED_TWO_FOLDER_LAYOUT] [ARCH-TIED_TWO_FOLDER_LAYOUT] [REQ-TIED_TWO_FOLDER_LAYOUT]
// How: Idempotent layout migration for brownfield clients and store self-host.
PROCEDURE MIGRATE_LAYOUT(projectRoot, options)
  PRE: options may include store, dryRun
  POST: tied-project + tied-bundle present; no top-level tied/
  EFFECTS: git mv or fs rename; config transform; gitignore rewrite
  FAILURE_MODES: LEGACY_LAYOUT_DETECTED when blocked; migration partial errors
  TERMINATION: idempotent second run is no-op
END PROCEDURE
```
