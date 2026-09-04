# [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP] [REQ-TIED_ADVERSARIAL_INQUIRY] [IMPL-TIED_VOCABULARY_REFRESH] [ARCH-TIED_VOCABULARY_LAYERS] [REQ-TIED_VOCABULARY_OWNERSHIP] [ARCH-MCP_USAGE_METRICS] [REQ-MCP_USAGE_METRICS] [IMPL-MCP_USAGE_METRICS]
# Summary: Bootstrap TIED layout from templates via copy_files.sh — indexes, guides, detail dirs, AGENTS.md family, layered methodology/client vocabulary ownership, managed prompt-type skills, feature-orchestration and adversarial-inquiry onboarding artifacts with closed verification, create-if-missing constitution example, attribute-preserving copies, source-date midnight timestamps on client copies, modification warnings, implementation pseudo-code sidecars, tied-yaml skill, and opt-in MCP metrics configuration.

# [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
# How: Contract — INPUT/OUTPUT/DATA for BOOTSTRAP_TIED below; these fields define the bootstrap boundary.
# [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
# How: INPUT — project root; template source directory (TIED repo templates/ or equivalent); TIED source root (SCRIPT_DIR).
# [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
# How: OUTPUT — created or updated files under tied/ and selected root files; process exit status.
# [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
# How: DATA — project indexes; inherited methodology tree; refreshable tied/methodology/vocab/*.md; durable client tied/vocab/*.md and handoffs; feature-orchestration onboarding and constitution artifacts; IMPL-*-pseudocode.md sidecars; managed .cursor/skills/ artifacts; source-date midnight metadata applied only to client copies; modification diagnostics; and the client .cursor/mcp.json when initialized, including opt-in metrics fields.

procedure BOOTSTRAP_TIED(projectRoot):
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP] [REQ-TIED_ADVERSARIAL_INQUIRY]
  # How: Bootstrap or refresh the client layout while preserving client-owned project YAML, existing vocabulary, and any existing MCP configuration; managed copies retain attributes, receive source-date midnight timestamps, warn before overwriting a changed client copy, initialize optional metrics fields only for a new MCP configuration when collection is explicitly enabled, and fail closed if the inherited adversarial inquiry contract is incomplete.
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
  # How: Ensure tied/ exists; copy template indexes, detail YAML, and implementation pseudo-code sidecars; copy guide/schema docs from tied/docs/ in the TIED source per copy_files.sh; create detail subdirs; copy AGENTS.md, .cursorrules to project root.
  Contract:
    INPUT: projectRoot; template source; TIED source root; optional merge-vocab flag
    OUTPUT: bootstrapped or refreshed client layout; process exit status
    DATA: project YAML; inherited methodology files; client vocabulary files; client MCP configuration
    CONTROL: preserve client project YAML, existing vocabulary, and existing .cursor/mcp.json byte-for-byte; overwrite inherited methodology and managed skill content; use cp -p or cp -pR and normalize only destination timestamps
    PRE: projectRoot is a writable client directory; template source and required TIED source paths are readable
    POST: required TIED indexes, docs, detail directories, managed prompt-type skills, feature-orchestration artifacts, and vocabulary policy outputs exist; copied managed files have their source item's local-date midnight timestamp; modification warnings precede managed overwrites; source files remain unchanged; failure returns non-zero
    EFFECTS: File I/O — creates or updates selected client files; Process — invokes helper copy and patch operations
    FAILURE_MODES: MISSING_TEMPLATE_SOURCE; UNWRITABLE_DESTINATION; SKILL_INSTALL_FAILED; COPY_FAILED; VOCABULARY_SOURCE_MISSING; FEATURE_ORCHESTRATION_PACKAGE_INCOMPLETE; MCP_CONFIG_INIT_FAILED
    DATA_TRANSITION: client layout absent|stale→bootstrapped|refreshed; inherited methodology old→current; source mtimes→destination local-date midnight mtimes; non-midnight managed destination→warning then current source; client project YAML and existing MCP configuration unchanged; source files unchanged
    TERMINATION: total — finite target list and finite vocabulary/file loops
  ON missing template source or unwritable destination: exit non-zero with actionable message
  FOR each copy_files.sh target: apply copy or merge policy; never overwrite client project-only YAML with empty templates where script forbids
  CALL INITIALIZE_TIED_MCP_CONFIG(projectRoot)
  CALL INSTALL_TIED_YAML_SKILL(projectRoot)
  CALL INSTALL_FEATURE_ORCHESTRATION_WRAPPERS(projectRoot)
  # [IMPL-TIED_FILES] [IMPL-TIED_VOCABULARY_REFRESH] [ARCH-TIED_STRUCTURE] [ARCH-TIED_VOCABULARY_LAYERS] [REQ-TIED_SETUP] [REQ-TIED_VOCABULARY_OWNERSHIP]
  # How: Delegate layered vocabulary refresh so methodology files are replaced with stale-file pruning while client glossaries and absent handoffs remain durable.
  CALL REFRESH_BOOTSTRAP_VOCABULARY(projectRoot, mergeVocab)
  CALL COPY_FEATURE_ORCHESTRATION_ARTIFACTS(projectRoot)
  CALL VERIFY_ADVERSARIAL_INQUIRY_METHODOLOGY(projectRoot)
  RETURN success

procedure COPY_WITH_ATTRIBUTES(sourcePath, destinationPath, recursive):
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
  # How: Copy a managed file or tree with cp -p/cp -pR, then apply each source item's local-date midnight timestamp only to the copied path and descendants.
  Contract:
    INPUT: readable sourcePath; destinationPath; recursive flag
    OUTPUT: copied destination with preserved non-time attributes and source-date midnight timestamps
    DATA: source file/tree; destination file/tree; source mtime map; destination timestamp map
    CONTROL: recursive=true selects cp -pR; recursive=false selects cp -p; calculate source-date midnights before copy; normalize destination after copy
    PRE: sourcePath exists; destination parent is writable
    POST: destination contains the source snapshot; mode/ownership/flags are preserved where cp -p supports them; each copied item has the source item's local-date midnight timestamp; source metadata and content are unchanged
    EFFECTS: File I/O; Process — invokes cp and Python timestamp helper
    FAILURE_MODES: SOURCE_MISSING; DESTINATION_UNWRITABLE; COPY_FAILED; TIMESTAMP_CALCULATION_FAILED; TIMESTAMP_NORMALIZATION_FAILED
    DATA_TRANSITION: destination absent|stale→source snapshot with source-date midnight timestamps; source unchanged
    TERMINATION: total
  CALL CALCULATE_SOURCE_DATE_MIDNIGHTS(sourcePath)
  IF recursive:
    RUN cp -pR sourcePath destinationPath
  ELSE:
    RUN cp -p sourcePath destinationPath
  CALL NORMALIZE_COPIED_PATH_TIMESTAMPS(sourcePath, destinationPath)
  RETURN success

procedure CALCULATE_SOURCE_DATE_MIDNIGHTS(sourcePath):
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
  # How: Read source mtimes and calculate local calendar-date midnights without modifying source files.
  Contract:
    INPUT: sourcePath
    OUTPUT: source item→local-date midnight timestamp map
    DATA: source item mtimes; calculated timestamp map
    PRE: sourcePath exists and metadata is readable
    POST: every source item has a calculated local-date midnight; source content and metadata are unchanged
    EFFECTS: File I/O — reads metadata; Process — invokes portable Python datetime calculation
    FAILURE_MODES: SOURCE_MISSING; SOURCE_METADATA_UNREADABLE; TIMESTAMP_CALCULATION_FAILED
    DATA_TRANSITION: source mtime→calculated local-date midnight map; source unchanged
    TERMINATION: total — finite file tree
  RUN portable source timestamp calculation
  RETURN success

procedure NORMALIZE_COPIED_PATH_TIMESTAMPS(sourcePath, destinationPath):
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
  # How: Apply each source item's local-date midnight to its corresponding copied destination item without changing source files or cp -p-preserved non-time attributes.
  Contract:
    INPUT: unchanged sourcePath; copied destinationPath
    OUTPUT: destinationPath with source-date midnight modification times
    DATA: source item→midnight map; destination file/tree
    PRE: sourcePath and destinationPath contain corresponding readable items
    POST: each destination item's modification time is the corresponding source item's local-date midnight; copied access times and other non-time attributes remain unchanged; source remains unchanged
    EFFECTS: File I/O — writes destination timestamps; Process — invokes portable Python os.utime traversal
    FAILURE_MODES: SOURCE_MISSING; DESTINATION_MISSING; PATH_MAPPING_FAILED; TIMESTAMP_NORMALIZATION_FAILED
    DATA_TRANSITION: cp-preserved source mtimes→source-date midnight destination mtimes; source unchanged
    TERMINATION: total — finite file tree
  RUN portable source-to-destination timestamp normalization
  RETURN success

procedure WARN_ON_MODIFIED_COPY_TARGET(destinationPath):
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
  # How: Before replacing an existing managed destination, report any file or descendant whose mtime is not truncated to local calendar-date midnight.
  Contract:
    INPUT: existing destinationPath
    OUTPUT: modification diagnostics or no diagnostic
    DATA: destination file/tree; local calendar-date midnight predicate; modified path list
    PRE: destinationPath may be absent or readable
    POST: absent destinations are silent; every non-midnight file is reported before overwrite
    EFFECTS: File I/O; stdout diagnostics
    FAILURE_MODES: DESTINATION_UNREADABLE
    TERMINATION: total — finite file tree
  IF destinationPath is absent:
    RETURN no diagnostic
  RUN portable midnight predicate for destinationPath
  IF any mtime is not local-date midnight:
    EMIT "Client-modified managed copy detected" with each path
  RETURN diagnostics

procedure INITIALIZE_TIED_MCP_CONFIG(projectRoot):
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP] [ARCH-MCP_USAGE_METRICS] [REQ-MCP_USAGE_METRICS] [IMPL-MCP_USAGE_METRICS]
  # How: Create the default TIED MCP configuration only when the client has no .cursor/mcp.json; when TIED_MCP_COLLECT_METRICS is exactly 1, add metrics fields and derive the client label from an explicit override or the project basename; preserve an existing configuration byte-for-byte.
  Contract:
    INPUT: projectRoot; built TIED MCP server path; absolute project TIED base path; optional TIED_MCP_COLLECT_METRICS and TIED_MCP_METRICS_CLIENT environment values
    OUTPUT: newly initialized projectRoot/.cursor/mcp.json or unchanged existing configuration
    DATA: MCP server command, TIED_MCP_BIN args, TIED_BASE_PATH environment, optional TIED_MCP_COLLECT_METRICS and TIED_MCP_METRICS_CLIENT environment values, existing client MCP configuration
    CONTROL: initialize only when .cursor/mcp.json is absent; when collection equals 1, set TIED_MCP_COLLECT_METRICS to 1 and use a non-empty TIED_MCP_METRICS_CLIENT override or basename(projectRoot); never merge, rewrite, or normalize an existing file
    PRE: projectRoot/.cursor/ is writable when initialization is needed; built MCP server and TIED base path are resolvable
    POST: absent configuration becomes a valid TIED MCP config; when collection equals 1 its env contains both metrics fields; otherwise metrics fields are absent; existing configuration retains its original bytes
    EFFECTS: File I/O — conditionally creates one JSON file; Process — resolves paths and emits diagnostics
    FAILURE_MODES: MCP_SERVER_DIST_MISSING; MCP_CONFIG_PARENT_UNWRITABLE; MCP_CONFIG_WRITE_FAILED
    DATA_TRANSITION: config absent→default TIED MCP config with optional metrics fields; config present→same bytes
    TERMINATION: total — one existence check and at most one initialization
  IF projectRoot/.cursor/mcp.json exists:
    RETURN preserved
  IF TIED_MCP_COLLECT_METRICS equals "1":
    metricsClient := TIED_MCP_METRICS_CLIENT WHEN non-empty ELSE basename(projectRoot)
    include TIED_MCP_COLLECT_METRICS := "1" and TIED_MCP_METRICS_CLIENT := metricsClient in the generated env
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

procedure INSTALL_FEATURE_ORCHESTRATION_WRAPPERS(projectRoot):
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP] [IMPL-FEAT_ONBOARDING_COMMANDS] [ARCH-FEAT_ONBOARDING_BOUNDARY] [REQ-FEAT_ONBOARDING_COMMANDS]
  # How: Distribute the onboarding wrapper with the managed tied-yaml skill and bake the canonical TIED source root so fresh clients can invoke feature orchestration without duplicating runtime logic.
  Contract:
    INPUT: projectRoot; canonical bundled tied-yaml skill; TIED source real path
    OUTPUT: executable projectRoot/.cursor/skills/tied-yaml/scripts/tied.sh and optional feature-orchestrator.sh
    DATA: wrapper scripts; TIED_REPO_ROOT marker; onboarding and orchestration entry-point paths
    CONTROL: canonical bundle is copied by INSTALL_TIED_YAML_SKILL; replace only the unsubstituted repository marker; preserve client-owned files outside the managed skill
    PRE: bundled wrapper source exists; built onboarding and orchestration entry points are available in the TIED source when invoked
    POST: client wrapper scripts are present, executable, and resolve the absolute TIED source root; missing build remains an actionable runtime failure
    EFFECTS: File I/O — copies managed scripts and patches marker; Process — invokes chmod and inline marker replacement
    FAILURE_MODES: WRAPPER_SOURCE_MISSING; WRAPPER_COPY_FAILED; WRAPPER_MARKER_REPLACEMENT_FAILED; ENTRYPOINT_BUILD_MISSING
    DATA_TRANSITION: wrapper absent|stale→managed wrapper with resolved source root; client-owned non-wrapper files unchanged
    TERMINATION: total — finite wrapper list and one marker replacement pass
  CALL PATCH_FEATURE_WRAPPER_REPO_ROOT(projectRoot)
  RUN chmod executable on each installed wrapper
  RETURN success

procedure PATCH_FEATURE_WRAPPER_REPO_ROOT(projectRoot):
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP] [IMPL-FEAT_ONBOARDING_COMMANDS] [ARCH-FEAT_ONBOARDING_BOUNDARY] [REQ-FEAT_ONBOARDING_COMMANDS]
  # How: Replace the wrapper's unresolved TIED_REPO_ROOT marker with the bootstrap source realpath while leaving already customized clients unchanged.
  Contract:
    INPUT: projectRoot; TIED source real path
    OUTPUT: patched onboarding wrapper scripts or explicit non-fatal skip for an absent optional wrapper
    DATA: wrapper text; TIED_REPO_ROOT marker
    CONTROL: patch tied.sh when present; patch feature-orchestrator.sh when present; replace each marker once; do not rewrite resolved scripts
    PRE: installed skill directory is readable; wrapper scripts may be absent only when the bundle does not provide them
    POST: each present wrapper resolves TIED_REPO_ROOT to the canonical TIED source; absent optional wrapper is reported without mutation
    EFFECTS: File I/O — reads and conditionally rewrites managed scripts; Diagnostics — reports skipped optional paths
    FAILURE_MODES: WRAPPER_UNREADABLE; MARKER_REPLACEMENT_FAILED; NON_FATAL_OPTIONAL_WRAPPER_ABSENT
    DATA_TRANSITION: placeholder marker→absolute TIED source path; resolved marker→unchanged; absent optional wrapper→unchanged
    TERMINATION: total — finite wrapper list
  FOR each wrapper in tied.sh, feature-orchestrator.sh:
    IF wrapper is absent: continue
    IF wrapper contains unsubstituted marker: replace marker with realpath(TIED_SOURCE) once
    ELSE IF marker line absent: warn and skip (non-fatal)

procedure VERIFY_ADVERSARIAL_INQUIRY_METHODOLOGY(projectRoot):
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP] [REQ-TIED_ADVERSARIAL_INQUIRY]
  # How: Fail closed unless the inherited adversarial inquiry REQ/ARCH/IMPL records, checklist record, and both pseudo-code sidecars are present.
  Contract:
    INPUT: projectRoot; required adversarial inquiry methodology artifact paths
    OUTPUT: success diagnostics or non-zero failure with missing paths
    DATA: client methodology adversarial inquiry records and pseudo-code sidecars
    CONTROL: require every inherited artifact; validation is read-only
    PRE: methodology refresh has completed and projectRoot/tied is readable
    POST: all six adversarial inquiry artifacts exist and are readable, or bootstrap exits non-zero with an actionable missing-artifact diagnostic
    EFFECTS: File I/O — reads file existence and permissions; Diagnostics — emits completion or failure guidance
    FAILURE_MODES: REQUIRED_ARTIFACT_MISSING; REQUIRED_ARTIFACT_UNREADABLE; ADVERSARIAL_INQUIRY_GATE_FAILED
    DATA_TRANSITION: unknown inquiry package→verified complete|verified incomplete; client files unchanged
    TERMINATION: total — finite required artifact list
  FOR each required adversarial inquiry artifact:
    IF artifact is absent or unreadable:
      report missing path and corrective command
      RETURN non-zero
  report read-only inquiry adoption path
  RETURN success

procedure COPY_FEATURE_ORCHESTRATION_ARTIFACTS(projectRoot):
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP] [REQ-FEAT_ADOPTION_GUIDANCE] [IMPL-FEAT_ONBOARDING_COMMANDS] [ARCH-FEAT_ONBOARDING_BOUNDARY] [REQ-FEAT_ONBOARDING_COMMANDS]
  # How: Publish the client-facing constitution example and onboarding guide additively, then verify the complete orchestration package without overwriting project-owned YAML or existing documentation.
  Contract:
    INPUT: projectRoot; canonical TIED source
    OUTPUT: constitution example when absent; onboarding guide when absent; verification result
    DATA: source constitution example; source onboarding guide; client tied/ and tied/docs/ paths; required orchestration artifact list
    CONTROL: create-if-missing for constitution; copy-when-missing for docs; inherited methodology remains refreshable; existing client content is preserved
    PRE: projectRoot/tied/ is writable or creatable; canonical source artifacts are readable
    POST: fresh clients contain the example and guide; brownfield clients retain existing bytes; verification fails closed when any required package artifact is absent
    EFFECTS: File I/O — conditionally creates client artifacts; Diagnostics — reports package completeness and corrective commands
    FAILURE_MODES: CONSTITUTION_SOURCE_MISSING; ONBOARDING_DOC_SOURCE_MISSING; CLIENT_DESTINATION_UNWRITABLE; FEATURE_ORCHESTRATION_PACKAGE_INCOMPLETE
    DATA_TRANSITION: absent client package→published package; existing client artifact→same bytes; incomplete package→non-zero bootstrap
    TERMINATION: total — finite artifact list
  IF projectRoot/tied/constitution.example.yaml is absent:
    copy canonical tied/constitution.example.yaml
  IF projectRoot/tied/docs/tied-feature-onboarding.md is absent:
    copy canonical tied/docs/tied-feature-onboarding.md
  CALL VERIFY_FEATURE_ORCHESTRATION_METHODOLOGY(projectRoot)
  RETURN verification result

procedure VERIFY_FEATURE_ORCHESTRATION_METHODOLOGY(projectRoot):
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP] [REQ-FEAT_ADOPTION_GUIDANCE] [IMPL-FEAT_ONBOARDING_COMMANDS] [ARCH-FEAT_ONBOARDING_BOUNDARY] [REQ-FEAT_ONBOARDING_COMMANDS]
  # How: Fail closed when the fresh-client orchestration contract is incomplete and report the exact wrapper, documentation, constitution, vocabulary, and build recovery paths.
  Contract:
    INPUT: projectRoot; required orchestration artifact paths
    OUTPUT: success diagnostics or non-zero failure with missing paths and corrective commands
    DATA: client methodology records; onboarding docs; constitution example; vocabulary; wrapper scripts; built entry points
    CONTROL: require files that bootstrap promises; allow no silent omission; validation is read-only
    PRE: bootstrap copy and skill installation have completed
    POST: every required artifact exists and is readable, or bootstrap exits non-zero with actionable diagnostics
    EFFECTS: File I/O — reads file existence and permissions; Diagnostics — emits completion or recovery guidance
    FAILURE_MODES: REQUIRED_ARTIFACT_MISSING; REQUIRED_ARTIFACT_UNREADABLE; FEATURE_ORCHESTRATION_GATE_FAILED
    DATA_TRANSITION: unknown package→verified complete|verified incomplete; client files unchanged
    TERMINATION: total — finite required artifact list
  FOR each required artifact:
    IF artifact is absent or unreadable:
      report missing path and corrective command
      RETURN non-zero
  report tied init, tied feature new, tied_validate_consistency, and manual/offline corrective paths
  RETURN success

procedure REFRESH_BOOTSTRAP_VOCABULARY(projectRoot, mergeVocab):
  # [IMPL-TIED_FILES] [IMPL-TIED_VOCABULARY_REFRESH] [ARCH-TIED_STRUCTURE] [ARCH-TIED_VOCABULARY_LAYERS] [REQ-TIED_SETUP] [REQ-TIED_VOCABULARY_OWNERSHIP]
  # How: Delegate refreshable methodology vocabulary, durable client vocabulary, handoff creation, and report-first legacy migration to the vocabulary ownership implementation.
  Contract:
    INPUT: projectRoot; optional mergeVocab flag
    OUTPUT: layered vocabulary refresh result
    DATA: methodology vocabulary snapshot; client vocabulary and handoffs
    CONTROL: preserve client-owned files; exclude source-only glossaries; replace stale methodology files
    PRE: projectRoot and TIED source vocabulary are readable and writable as required
    POST: inherited methodology vocabulary is current; client vocabulary remains durable; handoffs exist when absent
    EFFECTS: File I/O; Diagnostics
    FAILURE_MODES: SOURCE_MISSING; DESTINATION_UNWRITABLE; COPY_FAILED; HANDOFF_WRITE_FAILED
    DATA_TRANSITION: methodology old|absent→current snapshot; client vocabulary→preserved client layer plus absent handoffs
    TERMINATION: total
  CALL IMPL-TIED_VOCABULARY_REFRESH.REFRESH_VOCABULARY(projectRoot, mergeVocab)
  RETURN success

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

procedure VERIFY_INHERITED_DETAIL_FILES(client_tied_dir):
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_BOOTSTRAP_DETAIL_INTEGRITY] [REQ-TIED_SETUP]
  # How: After methodology copy, require bootstrap-critical detail artifacts and verify every usable indexed detail_file resolves under tied/methodology/ without traversal.
  Contract:
    INPUT: client tied/ directory with refreshed methodology snapshot
    OUTPUT: exit status 0 when complete; diagnostic messages on failure
    DATA: methodology index YAML rows; required artifact relative paths
    CONTROL: fail closed; skip sentinel detail_file values; reject .. traversal
    PRE: copy_files.sh has populated tied/methodology/ indexes and detail trees
    POST: required artifacts exist; every usable indexed path resolves in-bound
    EFFECTS: Process — read-only verification; no client project YAML mutation
    FAILURE_MODES: MISSING_REQUIRED_ARTIFACT; UNRESOLVED_INDEX_PATH; TRAVERSAL_REJECTED
    DATA_TRANSITION: copied methodology→verified integrity or bootstrap abort
    TERMINATION: total — finite required list plus finite index scan
  FOR each required relative path in INHERITED_DETAIL_REQUIRED:
    IF file missing under client_tied_dir/methodology: RETURN error
  FOR each methodology index in [requirements, architecture-decisions, implementation-decisions]:
    FOR each token row with usable detail_file:
      IF resolved path escapes methodology boundary OR contains ..: RETURN error
      IF resolved file missing: RETURN error
  EMIT completion guidance for tied_validate_consistency
  RETURN success

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

procedure LOAD_BOOTSTRAP_MANIFEST():
  # [IMPL-TIED_FILES] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_SETUP]
  # How: Read tools/bootstrap/manifest.json as the single source for DOCS_TO_COPY, skill dirs, verify lists, and TIED_CLI_REPO_ROOT_MARKER.
  Contract:
    INPUT: TIED source repository root
    OUTPUT: parsed manifest object
    DATA: manifest.json file lists and marker constants
    PRE: tools/bootstrap/manifest.json exists and is readable JSON
    POST: engine uses manifest values for all bootstrap list-driven steps
    EFFECTS: File I/O — read manifest once per bootstrap invocation
    FAILURE_MODES: MANIFEST_MISSING; MANIFEST_PARSE_FAILED
    TERMINATION: total
  READ tools/bootstrap/manifest.json relative to TIED source root
  RETURN manifest

procedure BOOTSTRAP_TIED_NODE(projectRoot, mergeVocab):
  # [IMPL-TIED_FILES] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_SETUP]
  # How: Node >=18 implementation of BOOTSTRAP_TIED with parity to the legacy bash contract; uses manifest-driven lists and copy-managed.mjs helpers.
  Contract:
    INPUT: projectRoot; optional mergeVocab flag; process environment for MCP metrics
    OUTPUT: bootstrapped or refreshed client layout; process exit status
    DATA: same as BOOTSTRAP_TIED
    CONTROL: preserve client project YAML, existing vocabulary, and existing .cursor/mcp.json byte-for-byte; overwrite inherited methodology and managed skill content
    PRE: Node >=18 available; mcp-server/dist/index.js built; projectRoot writable
    POST: same as BOOTSTRAP_TIED
    EFFECTS: File I/O and subprocess-free bootstrap on Windows and Unix
    FAILURE_MODES: same as BOOTSTRAP_TIED plus NODE_MISSING; MANIFEST_MISSING
    TERMINATION: total
  CALL LOAD_BOOTSTRAP_MANIFEST()
  CALL bootstrap orchestration in tools/bootstrap/lib/bootstrap.mjs using manifest lists
  RETURN success

procedure RUN_BOOTSTRAP_ENTRYPOINT(platform, projectRoot, mergeVocab):
  # [IMPL-TIED_FILES] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_SETUP]
  # How: Platform entry points (copy_files.cmd, copy_files.sh) delegate to BOOTSTRAP_TIED_NODE; bash is not a second implementation.
  Contract:
    INPUT: platform in {node, bash, cmd}; projectRoot; optional mergeVocab
    OUTPUT: bootstrap result via shared Node engine
    DATA: entrypoint script path; Node CLI path tools/bootstrap/copy-files.mjs
    CONTROL: bash and cmd wrappers exec Node; no duplicate bootstrap logic in shell
    PRE: Node on PATH for all entrypoints
    POST: identical bootstrap outputs regardless of entrypoint when Node engine succeeds
    EFFECTS: Process — exec node copy-files.mjs with parsed argv
    FAILURE_MODES: NODE_MISSING; ENTRYPOINT_SCRIPT_MISSING
    TERMINATION: total
  IF platform is cmd OR bash:
    EXEC node tools/bootstrap/copy-files.mjs with projectRoot and flags
  ELSE IF platform is node:
    CALL BOOTSTRAP_TIED_NODE(projectRoot, mergeVocab)
  ELSE:
    RETURN unsupported platform error
  RETURN success

procedure CREATE_DISPOSABLE_TIED_CLIENT(testRoot, sourceRoot):
  # [IMPL-TIED_FILES] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_SETUP]
  # How: Allocate testRoot/<unix-seconds> using Math.floor(Date.now()/1000) and run the full new-client pipeline.
  Contract:
    INPUT: testRoot; sourceRoot; optional skip flags for lint, MCP enable, git
    OUTPUT: disposable client directory path; process exit status
    DATA: timestamp directory name; bootstrapped client tree
    CONTROL: default testRoot is %USERPROFILE%/Documents/dev/test or $HOME/Documents/dev/test; timestamp is seconds not milliseconds
    PRE: testRoot parent is writable; sourceRoot contains bootstrap entry points
    POST: client directory exists with bootstrapped tied/ layout; stdout prints Disposable TIED client path on success
    EFFECTS: File I/O; Process — invokes RUN_NEW_TIED_CLIENT_PIPELINE
    FAILURE_MODES: UNWRITABLE_TEST_ROOT; PIPELINE_STEP_FAILED
    TERMINATION: total
  LET timestamp = floor(now_ms / 1000) as decimal string
  LET clientDir = join(testRoot, timestamp)
  CALL RUN_NEW_TIED_CLIENT_PIPELINE(clientDir, sourceRoot)
  PRINT "Disposable TIED client: {testRoot}/{timestamp}"
  RETURN clientDir

procedure RUN_NEW_TIED_CLIENT_PIPELINE(clientDir, sourceRoot):
  # [IMPL-TIED_FILES] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_SETUP]
  # How: Mirror scripts/build-commands.sh _new_tied_test_client — mkdir parent, bootstrap cwd, lint tied YAML, optional agent MCP enable, git init/commit.
  Contract:
    INPUT: clientDir; sourceRoot; optional skipLint; skipMcpEnable; skipGit; forceMcpEnable
    OUTPUT: bootstrapped disposable or explicit client; process exit status
    DATA: client project tree; git repository; linted tied/**/*.yaml files
    CONTROL: fail-fast on any step; auto-skip agent mcp enable on non-TTY unless forceMcpEnable; git commit message exactly TIED
    PRE: clientDir writable; sourceRoot contains copy_files entry and built yaml-canonicalizer when lint enabled
    POST: tied/ bootstrapped; tied YAML canonicalized when lint enabled; git commit TIED when git enabled
    EFFECTS: File I/O; Process — spawn copy_files entry, lint helper, agent CLI, git
    FAILURE_MODES: COPY_FILES_FAILED; LINT_FAILED; AGENT_MISSING; GIT_FAILED; CANONICALIZER_MISSING
    DATA_TRANSITION: empty|explicit clientDir→bootstrapped client with optional git repo
    TERMINATION: total — finite pipeline steps
  CALL mkdir -p dirname(clientDir) and create empty clientDir when disposable
  RUN copy_files entry with cwd=clientDir and no args
  CALL LINT_CLIENT_TIED_YAML(clientDir, sourceRoot) unless skipLint
  IF not skipMcpEnable AND (stdin is TTY OR forceMcpEnable):
    RUN agent mcp enable tied-yaml with cwd=clientDir
  ELSE IF not skipMcpEnable:
    WARN auto-skip agent mcp enable on non-TTY
  UNLESS skipGit:
    RUN git init; git add .; git commit -m TIED with cwd=clientDir
  RETURN success

procedure LINT_CLIENT_TIED_YAML(clientDir, sourceRoot):
  # [IMPL-TIED_FILES] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_SETUP]
  # How: lint_yaml.sh -F tied parity — glob tied/**/*.yaml under client cwd; node mcp-server/dist/cli/yaml-canonicalizer.js per file.
  Contract:
    INPUT: clientDir; sourceRoot
    OUTPUT: canonicalized tied YAML files; process exit status
    DATA: tied/**/*.yaml paths under clientDir
    CONTROL: fail if canonicalizer missing; process each file independently
    PRE: mcp-server/dist/cli/yaml-canonicalizer.js exists under sourceRoot
    POST: every tied/**/*.yaml file canonicalized in place
    EFFECTS: File I/O; Process — node canonicalizer per YAML path
    FAILURE_MODES: CANONICALIZER_MISSING; LINT_FILE_FAILED
    TERMINATION: total — finite YAML file list
  FOR each yamlPath in glob(clientDir/tied/**/*.yaml):
    RUN node sourceRoot/mcp-server/dist/cli/yaml-canonicalizer.js yamlPath
  RETURN success
