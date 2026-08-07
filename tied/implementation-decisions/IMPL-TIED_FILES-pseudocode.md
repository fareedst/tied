# [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
# Summary: Bootstrap TIED layout from templates via copy_files.sh — indexes, guides, detail dirs, AGENTS.md family, vocabulary seed/merge, implementation pseudo-code sidecars, and tied-yaml skill.

# [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
# How: Contract — INPUT/OUTPUT/DATA for BOOTSTRAP_TIED below; these fields define the bootstrap boundary.
# [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
# How: INPUT — project root; template source directory (TIED repo templates/ or equivalent); TIED source root (SCRIPT_DIR).
# [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
# How: OUTPUT — created or updated files under tied/ and selected root files; process exit status.
# [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
# How: DATA — project indexes; inherited methodology tree; tied/vocab/*.md when seeded or merged; IMPL-*-pseudocode.md sidecars; and the client .cursor/mcp.json when initialized.

procedure BOOTSTRAP_TIED(projectRoot):
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
  # How: Bootstrap or refresh the client layout while preserving client-owned project YAML, existing vocabulary, and any existing MCP configuration.
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
  # How: Ensure tied/ exists; copy template indexes, detail YAML, and implementation pseudo-code sidecars; copy guide/schema docs from tied/docs/ in the TIED source per copy_files.sh; create detail subdirs; copy AGENTS.md, .cursorrules to project root.
  Contract:
    INPUT: projectRoot; template source; TIED source root; optional merge-vocab flag
    OUTPUT: bootstrapped or refreshed client layout; process exit status
    DATA: project YAML; inherited methodology files; client vocabulary files; client MCP configuration
    CONTROL: preserve client project YAML, existing vocabulary, and existing .cursor/mcp.json byte-for-byte; overwrite inherited methodology content
    PRE: projectRoot is a writable client directory; template source and required TIED source paths are readable
    POST: required TIED indexes, docs, detail directories, skill, and vocabulary policy outputs exist; failure returns non-zero
    EFFECTS: File I/O — creates or updates selected client files; Process — invokes helper copy and patch operations
    FAILURE_MODES: MISSING_TEMPLATE_SOURCE; UNWRITABLE_DESTINATION; SKILL_INSTALL_FAILED; COPY_FAILED; VOCABULARY_SOURCE_MISSING; MCP_CONFIG_INIT_FAILED
    DATA_TRANSITION: client layout absent|stale→bootstrapped|refreshed; inherited methodology old→current; client project YAML and existing MCP configuration unchanged
    TERMINATION: total — finite target list and finite vocabulary/file loops
  ON missing template source or unwritable destination: exit non-zero with actionable message
  FOR each copy_files.sh target: apply copy or merge policy; never overwrite client project-only YAML with empty templates where script forbids
  CALL INITIALIZE_TIED_MCP_CONFIG(projectRoot)
  CALL INSTALL_TIED_YAML_SKILL(projectRoot)
  CALL SEED_DOMAIN_VOCAB(projectRoot)
  CALL MERGE_DOMAIN_VOCAB(projectRoot) WHEN --merge-vocab is supplied
  RETURN success

procedure INITIALIZE_TIED_MCP_CONFIG(projectRoot):
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
  # How: Create the default TIED MCP configuration only when the client has no .cursor/mcp.json; preserve an existing configuration byte-for-byte.
  Contract:
    INPUT: projectRoot; built TIED MCP server path; absolute project TIED base path
    OUTPUT: newly initialized projectRoot/.cursor/mcp.json or unchanged existing configuration
    DATA: MCP server command, TIED_MCP_BIN args, TIED_BASE_PATH environment, existing client MCP configuration
    CONTROL: initialize only when .cursor/mcp.json is absent; never merge, rewrite, or normalize an existing file
    PRE: projectRoot/.cursor/ is writable when initialization is needed; built MCP server and TIED base path are resolvable
    POST: absent configuration becomes a valid TIED MCP config; existing configuration retains its original bytes
    EFFECTS: File I/O — conditionally creates one JSON file; Process — resolves paths and emits diagnostics
    FAILURE_MODES: MCP_SERVER_DIST_MISSING; MCP_CONFIG_PARENT_UNWRITABLE; MCP_CONFIG_WRITE_FAILED
    DATA_TRANSITION: config absent→default TIED MCP config; config present→same bytes
    TERMINATION: total — one existence check and at most one initialization
  IF projectRoot/.cursor/mcp.json exists:
    RETURN preserved
  CALL _refresh_tied_mcp_json(projectRoot)
  RETURN initialized

procedure INSTALL_TIED_YAML_SKILL(projectRoot):
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
  # How: Install the canonical or explicitly permitted fallback skill, then patch its TIED repository root.
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
  # How: Copy tied-yaml skill from tools/bundled-tied-yaml-skill/ (canonical); dev fallback .cursor/skills/tied-yaml only if bundle incomplete; overwrite each run; chmod tied-cli.sh executable.
  Contract:
    INPUT: projectRoot; canonical bundled skill; development fallback skill
    OUTPUT: installed projectRoot/.cursor/skills/tied-yaml/ with executable tied-cli.sh
    DATA: skill files; TIED_REPO_ROOT marker
    CONTROL: canonical bundle preferred; fallback allowed only when bundle is incomplete; overwrite inherited skill files
    PRE: projectRoot is writable; at least one complete skill source is readable
    POST: installed skill is complete, tied-cli.sh is executable, and its repository-root marker is patched
    EFFECTS: File I/O — copies and modifies skill files; Process — invokes chmod and CLI-root patching
    FAILURE_MODES: BUNDLED_SKILL_INCOMPLETE; FALLBACK_SKILL_INCOMPLETE; SKILL_COPY_FAILED; CLI_PATCH_FAILED
    DATA_TRANSITION: skill absent|stale→installed current skill; marker unresolved→resolved
    TERMINATION: total — evaluate finite source candidates and one patch operation
  IF bundled skill at TIED_SOURCE/tools/bundled-tied-yaml-skill/scripts/tied-cli.sh is complete:
    copy bundled skill to projectRoot/.cursor/skills/tied-yaml/
  ELSE IF dev fallback at TIED_SOURCE/.cursor/skills/tied-yaml/scripts/tied-cli.sh is complete:
    warn non-canonical fallback; copy dev skill to projectRoot/.cursor/skills/tied-yaml/
  ELSE:
    exit non-zero with recovery instructions
  CALL PATCH_TIED_CLI_REPO_ROOT(projectRoot)
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
  # How: Do not create projectRoot/scripts/tied-cli.sh; canonical stdio client is projectRoot/.cursor/skills/tied-yaml/scripts/tied-cli.sh only.

procedure PATCH_TIED_CLI_REPO_ROOT(projectRoot):
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
  # How: Resolve the installed CLI's repository marker once and leave already customized clients unchanged.
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
  # How: Replace TIED_REPO_ROOT placeholder in installed tied-cli.sh with realpath of TIED source so TIED_MCP_BIN resolves to TIED_SOURCE/mcp-server/dist/index.js on client projects.
  Contract:
    INPUT: projectRoot; TIED source real path
    OUTPUT: patched tied-cli.sh or an explicit non-fatal skip
    DATA: CLI text; TIED_REPO_ROOT marker
    CONTROL: replace the unsubstituted marker once; do not rewrite an already customized CLI
    PRE: projectRoot/.cursor/skills/tied-yaml/scripts/tied-cli.sh may exist and is readable if patching is required
    POST: an existing marker is replaced with the canonical TIED source path; missing CLI returns without mutation
    EFFECTS: File I/O — reads and conditionally rewrites one shell script; Process — runs inline Python replacement
    FAILURE_MODES: CLI_MISSING; CLI_UNREADABLE; MARKER_REPLACEMENT_FAILED; NON_FATAL_MARKER_ABSENT
    DATA_TRANSITION: marker placeholder→absolute TIED source path; absent CLI→unchanged
    TERMINATION: total — one file inspection and at most one replacement
  cliPath := projectRoot/.cursor/skills/tied-yaml/scripts/tied-cli.sh
  IF cliPath missing: RETURN
  IF cliPath contains unsubstituted marker /ABSOLUTE/PATH/TO/TIED/SOURCE/DIR:
    replace marker with realpath(TIED_SOURCE) once via python3 inline script
  ELSE IF marker line absent: warn and skip (non-fatal)

procedure SEED_DOMAIN_VOCAB(projectRoot):
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP] [PROC-VOCABULARY_INDEX]
  # How: Seed canonical glossaries only for a client with no existing Markdown vocabulary.
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP] [PROC-VOCABULARY_INDEX]
  # How: When client tied/vocab/ is missing or has no *.md files, copy all *.md from TIED_SOURCE/tied/vocab/ preserving basename (seed set includes routing.md as primary PRELOAD entry and domain-references.md as full on-demand catalog); never overwrite existing client vocab files.
  Contract:
    INPUT: projectRoot; canonical vocabulary source
    OUTPUT: seeded client tied/vocab/ or preserved existing vocabulary
    DATA: canonical glossary files; client glossary files
    CONTROL: seed only when the client has no Markdown glossary; preserve every existing client glossary
    PRE: vocabulary source and destination may be absent; destination can be created when writable
    POST: when source is non-empty and destination is empty, every canonical glossary is copied; otherwise client files remain unchanged
    EFFECTS: File I/O — creates a directory and copies glossary files; Diagnostics — reports skipped or empty-source cases
    FAILURE_MODES: VOCABULARY_SOURCE_MISSING; VOCABULARY_DESTINATION_UNWRITABLE; VOCABULARY_COPY_FAILED
    DATA_TRANSITION: vocabulary absent→seeded; existing client vocabulary→preserved
    TERMINATION: total — finite canonical glossary files
  dest := projectRoot/tied/vocab/
  IF dest has one or more *.md files: RETURN (client extensions preserved)
  IF TIED_SOURCE/tied/vocab/ missing or empty: warn; RETURN
  FOR each *.md in TIED_SOURCE/tied/vocab/: copy to dest preserving basename

procedure MERGE_DOMAIN_VOCAB(projectRoot):
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP] [PROC-VOCABULARY_INDEX]
  # How: Add absent canonical glossary basenames under --merge-vocab without overwriting client glossaries.
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP] [PROC-VOCABULARY_INDEX]
  # How: When --merge-vocab is supplied, add only canonical glossary filenames absent from projectRoot/tied/vocab/; preserve every existing client glossary and report added/preserved counts.
  Contract:
    INPUT: projectRoot; canonical vocabulary source; merge-vocab control
    OUTPUT: additive vocabulary changes; added and preserved counts
    DATA: canonical glossary files; client glossary files; merge counters
    CONTROL: add only absent basenames; never overwrite client-owned glossary content
    PRE: merge-vocab was explicitly supplied; source and destination paths are inspectable or creatable
    POST: each canonical basename is present; pre-existing client files retain their original content; counts describe observed actions
    EFFECTS: File I/O — creates destination and copies absent glossary files; Diagnostics — reports added and preserved counts
    FAILURE_MODES: VOCABULARY_SOURCE_MISSING; VOCABULARY_DESTINATION_UNWRITABLE; VOCABULARY_COPY_FAILED
    DATA_TRANSITION: client vocabulary set→union(client set, canonical set); existing file content unchanged
    TERMINATION: total — finite canonical glossary files
  dest := projectRoot/tied/vocab/
  IF TIED_SOURCE/tied/vocab/ missing or empty: warn; RETURN
  FOR each *.md in TIED_SOURCE/tied/vocab/:
    IF dest/basename(file) is absent: copy file preserving basename
    ELSE: preserve existing client file

procedure COPY_IMPLEMENTATION_PSEUDOCODE_SIDECARS(projectRoot):
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
  # How: Refresh inherited IMPL sidecars from templates while leaving project-owned implementation decisions untouched.
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
  # How: Copy template IMPL-*-pseudocode.md files into projectRoot/tied/methodology/implementation-decisions/ on every refresh so inherited Active IMPL behavior remains available to merged-view validation.
  Contract:
    INPUT: projectRoot; template implementation-decision sidecar directory
    OUTPUT: refreshed inherited pseudo-code sidecars under projectRoot/tied/methodology/implementation-decisions/
    DATA: canonical IMPL sidecars; inherited client sidecars
    CONTROL: overwrite inherited sidecars from canonical templates; do not touch project-owned implementation decisions
    PRE: template sidecar directory is readable; destination is writable or creatable
    POST: every canonical IMPL-*-pseudocode.md has a matching current inherited copy
    EFFECTS: File I/O — creates destination and overwrites inherited sidecars
    FAILURE_MODES: SIDECAR_SOURCE_MISSING; SIDECAR_DESTINATION_UNWRITABLE; SIDECAR_COPY_FAILED
    DATA_TRANSITION: inherited sidecars old|absent→canonical current set
    TERMINATION: total — finite canonical sidecar files
  FOR each IMPL-*-pseudocode.md in TIED_SOURCE/templates/implementation-decisions/:
    copy file to projectRoot/tied/methodology/implementation-decisions/ overwriting inherited copy

procedure CANONICALIZE_YAML_FILE(path):
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP] [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION] [PROC-YAML_EDIT_LOOP]
  # How: Delegate one YAML file to the shared tied-yaml-canonical-v1 profile; preserve IMPL pseudo-code sidecars as opaque text.
  Contract:
    INPUT: one YAML file path
    OUTPUT: canonicalized YAML file; shared profile result and yaml_format metadata
    DATA: YAML mapping or sequence at path
    CONTROL: one path per invocation; tied-yaml-canonical-v1
    PRE: path exists and is a regular writable project YAML file
    POST: shared canonicalizer rewrites valid output atomically; failures preserve original bytes
    EFFECTS: File I/O; Exn
    FAILURE_MODES: PATH_MISSING; PATH_NOT_REGULAR; INVALID_YAML; WRITE_FAILED
    DATA_TRANSITION: valid YAML non-canonical→valid canonical YAML; invalid or inaccessible→unchanged with failure
    TERMINATION: total
  RETURN IMPL-TIED_YAML_CANONICALIZER.CANONICALIZE_YAML_FILE(path)

procedure LINT_YAML_PATHS(paths):
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP] [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION] [PROC-YAML_EDIT_LOOP]
  # How: Attempt each YAML path independently through the shared canonicalizer and aggregate results; compatibility flags remain accepted by the frontend.
  Contract:
    INPUT: finite list of YAML paths
    OUTPUT: aggregate lint result with yaml_format metadata
    DATA: per-path canonicalization statuses
    CONTROL: invoke shared canonicalization independently for every path; retain the latest non-zero status
    PRE: paths is finite; each path is intended to be validated independently
    POST: every supplied path was attempted; zero means all paths passed, non-zero identifies at least one failure
    EFFECTS: File I/O; Exn
    FAILURE_MODES: EMPTY_PATH_LIST; PATH_VALIDATION_FAILED; INVALID_YAML; WRITE_FAILED
    DATA_TRANSITION: input paths→per-path statuses→aggregate status
    TERMINATION: total
  rc := 0
  FOR each path in paths:
    st := CALL CANONICALIZE_YAML_FILE(path)
    IF st != 0: rc := st
  RETURN rc

## REPORT_MODIFIED_PATHS
# [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP] [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION] [PROC-YAML_EDIT_LOOP]
# How: Emit normal stdout only for paths whose list or map ordering changed; retain stderr diagnostics for failures.
procedure REPORT_MODIFIED_PATHS(result):
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP] [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION] [PROC-YAML_EDIT_LOOP]
  # How: Emit normal stdout only for paths whose list or map ordering changed; retain stderr diagnostics for failures.
  Contract:
    INPUT: one sorter result with list and map modification counts
    OUTPUT: normal stdout for modified paths; no normal stdout for unchanged paths
    PRE: result contains groups_modified and maps_modified counts
    POST: unchanged paths are silent; changed paths retain validation and modification summaries
    EFFECTS: stdout emission only
    TERMINATION: total
  modified := result.groups_modified > 0 OR result.maps_modified > 0
  IF modified is false:
    RETURN no normal stdout
  IF result.validated:
    EMIT semantic validation passed
  EMIT modification summary
