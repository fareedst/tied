# [IMPL-TIED_YAML_STYLE_RESOLVER] [ARCH-TIED_YAML_STYLE_RESOLUTION] [REQ-TIED_YAML_STYLE_CONFIGURATION]
# Summary: Resolve one repository YAML scalar style and apply it consistently to canonical serialization, lint, CLI, and MCP writes.

## RESOLVE_YAML_STYLE
# [IMPL-TIED_YAML_STYLE_RESOLVER] [ARCH-TIED_YAML_STYLE_RESOLUTION] [REQ-TIED_YAML_STYLE_CONFIGURATION]
# How: Select repository configuration before global fallbacks and reject explicit invalid repository values.
procedure RESOLVE_YAML_STYLE(tied_base_path, environment, filesystem):
  Contract:
  INPUT: tied_base_path, environment variables, optional repository and XDG config files
  OUTPUT: resolved scalar_style and configuration source
  DATA: scalar_style in {unwrapped, wrapped}; source in {repository, environment, xdg, default}
  CONTROL: repository > TIED_YAML_STYLE > XDG_CONFIG_HOME/tied/yaml-format.yaml > default
  PRE: tied_base_path identifies the target repository tied directory
  POST: one valid style is returned, or an explicit configuration error is returned
  EFFECTS: filesystem reads only; no writes
  FAILURE_MODES: INVALID_REPOSITORY_CONFIG; INVALID_GLOBAL_CONFIG; CONFIG_READ_FAILED
  DATA_TRANSITION: config bytes -> parsed config -> validated style
  TERMINATION: total
  repo_root := PARENT_DIRECTORY(tied_base_path)
  repo_file := JOIN(repo_root, ".tied-yaml.yaml")
  IF filesystem.exists(repo_file):
    config := PARSE_YAML_CONFIG(filesystem.read(repo_file))
    style := VALIDATE_YAML_STYLE(config.scalar_style)
    IF style invalid: RETURN INVALID_REPOSITORY_CONFIG
    RETURN {scalar_style: style, source: repository}
  IF environment.TIED_YAML_STYLE exists:
    style := VALIDATE_YAML_STYLE(environment.TIED_YAML_STYLE)
    IF style invalid: RETURN INVALID_GLOBAL_CONFIG
    RETURN {scalar_style: style, source: environment}
  xdg_file := JOIN(environment.XDG_CONFIG_HOME OR HOME/.config, "tied/yaml-format.yaml")
  IF filesystem.exists(xdg_file):
    config := PARSE_YAML_CONFIG(filesystem.read(xdg_file))
    style := VALIDATE_YAML_STYLE(config.scalar_style)
    IF style invalid: RETURN INVALID_GLOBAL_CONFIG
    RETURN {scalar_style: style, source: xdg}
  RETURN {scalar_style: unwrapped, source: default}

## VALIDATE_YAML_STYLE
# [IMPL-TIED_YAML_STYLE_RESOLVER] [ARCH-TIED_YAML_STYLE_RESOLUTION] [REQ-TIED_YAML_STYLE_CONFIGURATION]
# How: Restrict configuration to the two documented styles and prevent silent fallback.
procedure VALIDATE_YAML_STYLE(value):
  Contract:
  INPUT: untrusted configuration scalar
  OUTPUT: unwrapped or wrapped, or configuration error
  PRE: value may be absent, non-string, or unknown
  POST: only exact supported style values are accepted
  EFFECTS: pure
  FAILURE_MODES: INVALID_STYLE
  TERMINATION: total
  IF value equals unwrapped OR value equals wrapped: RETURN value
  RETURN error INVALID_STYLE

## SERIALIZER_OPTIONS_FOR_STYLE
# [IMPL-TIED_YAML_STYLE_RESOLVER] [ARCH-TIED_YAML_STYLE_RESOLUTION] [REQ-TIED_YAML_STYLE_CONFIGURATION]
# How: Configure js-yaml to quote only string scalars in wrapped mode while retaining YAML-native types.
procedure SERIALIZER_OPTIONS_FOR_STYLE(resolved):
  Contract:
  INPUT: resolved scalar style
  OUTPUT: serializer options
  PRE: resolved.scalar_style is valid
  POST: unwrapped uses plain-when-safe behavior; wrapped forces double-quoted strings only
  EFFECTS: pure
  FAILURE_MODES: INVALID_STYLE
  TERMINATION: total
  IF resolved.scalar_style equals wrapped:
    RETURN {forceQuotes: true, quotingType: double, noCompatMode: true}
  RETURN {forceQuotes: false, noCompatMode: true}

## CANONICALIZE_WITH_RESOLVED_STYLE
# [IMPL-TIED_YAML_STYLE_RESOLVER] [ARCH-TIED_YAML_STYLE_RESOLUTION] [REQ-TIED_YAML_STYLE_CONFIGURATION]
# How: Reuse canonical map/list/opaque rules and inject only the resolved scalar serializer policy.
procedure CANONICALIZE_WITH_RESOLVED_STYLE(value, tied_base_path):
  Contract:
  INPUT: typed YAML value and target repository base path
  OUTPUT: canonical YAML text plus yaml_format metadata
  DATA: canonical value, resolved style, serializer output
  CONTROL: delegate structure to CANONICALIZE_YAML_VALUE; delegate scalar emission to SERIALIZER_OPTIONS_FOR_STYLE
  PRE: value is valid typed YAML
  POST: output is deterministic; booleans, numbers, and null remain typed
  EFFECTS: pure except configuration reads
  FAILURE_MODES: CONFIG_ERROR; UNSUPPORTED_VALUE; SERIALIZATION_FAILED
  DATA_TRANSITION: value -> ordered value -> styled YAML text
  TERMINATION: total
  resolved := RESOLVE_YAML_STYLE(tied_base_path, environment, filesystem)
  ordered := CANONICALIZE_YAML_VALUE(value, root)
  text := DUMP_YAML(ordered, SERIALIZER_OPTIONS_FOR_STYLE(resolved))
  RETURN {text, yaml_format: REPORT_YAML_FORMAT(resolved)}

## REPORT_YAML_FORMAT_WITH_STYLE
# [IMPL-TIED_YAML_STYLE_RESOLVER] [ARCH-TIED_YAML_STYLE_RESOLUTION] [REQ-TIED_YAML_STYLE_CONFIGURATION]
# How: Make effective style and precedence source observable in every successful writer response.
procedure REPORT_YAML_FORMAT(resolved):
  Contract:
  INPUT: resolved style
  OUTPUT: stable yaml_format metadata
  PRE: resolved is valid
  POST: metadata includes canonical profile, scalar_style, and style_source
  EFFECTS: pure
  FAILURE_MODES: none
  TERMINATION: total
  RETURN {
    profile_id: tied-yaml-canonical-v1,
    scalar_style: resolved.scalar_style,
    style_source: resolved.source,
    recursive_key_order: case-insensitive-primary locale-independent lexical with original-value tie-break,
    string_scalar_rule: double-quote strings only when wrapped,
    typed_scalar_rule: preserve booleans numbers and nulls,
    opaque_block_policy: preserve block-scalar bodies and IMPL pseudo-code sidecars
  }

## WRITE_YAML_THROUGH_POLICY
# [IMPL-TIED_YAML_STYLE_RESOLVER] [ARCH-TIED_YAML_STYLE_RESOLUTION] [REQ-TIED_YAML_STYLE_CONFIGURATION] [REQ-MODULE_VALIDATION]
# How: Route every index, detail, CITDP, feedback, rename, batch, and verification YAML write through one resolved canonical writer.
procedure WRITE_YAML_THROUGH_POLICY(path, value, tied_base_path):
  Contract:
  INPUT: project YAML path, typed value, target tied base path
  OUTPUT: atomic write result with yaml_format
  DATA: original bytes, canonical styled text, temporary file, metadata
  CONTROL: one resolver and one atomic write path; no writer-specific style option
  PRE: path is project YAML and value is serializable
  POST: success atomically replaces path in resolved style; failure preserves original bytes
  EFFECTS: filesystem writes; Exn for reported failures
  FAILURE_MODES: CONFIG_ERROR; INVALID_YAML; SERIALIZATION_FAILED; TEMP_WRITE_FAILED; ATOMIC_RENAME_FAILED
  DATA_TRANSITION: typed value -> styled canonical bytes -> atomic target replacement
  TERMINATION: total
  result := CANONICALIZE_WITH_RESOLVED_STYLE(value, tied_base_path)
  IF result failed: RETURN error
  RETURN WRITE_ATOMIC(path, result.text) plus result.yaml_format

## ENFORCE_COMPATIBILITY_LINT
# [IMPL-TIED_YAML_STYLE_RESOLVER] [ARCH-TIED_YAML_STYLE_RESOLUTION] [REQ-TIED_YAML_STYLE_CONFIGURATION]
# How: Make yaml_tool default lint and list sorting call the same style-aware canonical path after ordering operations.
procedure ENFORCE_COMPATIBILITY_LINT(paths, flags, tied_base_path):
  Contract:
  INPUT: YAML paths, sort flags, target tied base path
  OUTPUT: aggregate result and yaml_format
  PRE: paths are finite and flags only control ordering
  POST: every rewritten path follows the resolved style; ordering flags remain independent
  EFFECTS: filesystem writes; Exn for reported failures
  FAILURE_MODES: CONFIG_ERROR; PATH_NOT_FOUND; INVALID_YAML; WRITE_FAILED
  TERMINATION: total
  FOR each path IN paths:
    value := READ_TYPED_YAML(path)
    value := APPLY_ORDERING_FLAGS(value, flags)
    WRITE_YAML_THROUGH_POLICY(path, value, tied_base_path)
  RETURN aggregate success with REPORT_YAML_FORMAT(RESOLVE_YAML_STYLE(tied_base_path, environment, filesystem))

## MCP_WRITER_RESPONSE
# [IMPL-TIED_YAML_STYLE_RESOLVER] [ARCH-TIED_YAML_STYLE_RESOLUTION] [REQ-TIED_YAML_STYLE_CONFIGURATION] [REQ-MODULE_VALIDATION]
# How: Expose the same resolved metadata from each successful MCP writer and never claim success after a policy failure.
procedure MCP_WRITER_RESPONSE(write_operation):
  # [IMPL-TIED_YAML_STYLE_RESOLVER] [ARCH-TIED_YAML_STYLE_RESOLUTION] [REQ-TIED_YAML_STYLE_CONFIGURATION] [REQ-MODULE_VALIDATION]
  Contract:
  INPUT: writer operation that delegates YAML mutation to WRITE_YAML_THROUGH_POLICY
  OUTPUT: writer response with yaml_format
  PRE: writer uses the shared canonical writer
  POST: response bytes and metadata agree on scalar_style and style_source
  EFFECTS: filesystem writes; Exn for reported failures
  FAILURE_MODES: propagate policy, serialization, and atomic failures
  DATA_TRANSITION: writer request -> shared policy result -> response metadata
  TERMINATION: total
  result := AWAIT write_operation
  IF result failed: RETURN result error
  RETURN result with yaml_format preserved

## RESOLVE_CLIENT_FORMATTER
# [IMPL-TIED_YAML_STYLE_RESOLVER] [ARCH-TIED_YAML_STYLE_RESOLUTION] [REQ-TIED_YAML_STYLE_CONFIGURATION]
# How: Parse optional client_formatter from repository .tied-yaml.yaml; absent hook yields styling_status not_configured.
procedure RESOLVE_CLIENT_FORMATTER(tied_base_path, environment, filesystem):
  Contract:
  INPUT: tied_base_path, environment, repository config file
  OUTPUT: styling_status, optional formatter declaration, scalar_style default
  DATA: client_formatter {command, args[], version?}; styling_status in {configured, not_configured}
  CONTROL: only repository .tied-yaml.yaml may declare client_formatter; no global/env fallback
  PRE: tied_base_path identifies the target repository tied directory
  POST: configured only when command is non-empty; malformed mapping fails without spawn
  EFFECTS: filesystem read only
  FAILURE_MODES: INVALID_REPOSITORY_CONFIG; CONFIG_READ_FAILED
  DATA_TRANSITION: config bytes -> parsed mapping -> validated formatter declaration
  TERMINATION: total
  repo_root := PARENT_DIRECTORY(tied_base_path)
  repo_file := JOIN(repo_root, ".tied-yaml.yaml")
  IF NOT filesystem.exists(repo_file): RETURN {styling_status: not_configured}
  config := PARSE_YAML_CONFIG(filesystem.read(repo_file))
  scalar_style := config.scalar_style OR unwrapped
  VALIDATE_YAML_STYLE(scalar_style)
  formatter := config.client_formatter
  IF formatter absent OR formatter.command empty: RETURN {styling_status: not_configured, scalar_style}
  VALIDATE_FORMATTER_DECLARATION(formatter)
  RETURN {styling_status: configured, scalar_style, formatter}

## VALIDATE_FORMATTER_DECLARATION
# [IMPL-TIED_YAML_STYLE_RESOLVER] [ARCH-TIED_YAML_STYLE_RESOLUTION] [REQ-TIED_YAML_STYLE_CONFIGURATION]
# How: Restrict hook config to command plus optional args list and opaque version string.
procedure VALIDATE_FORMATTER_DECLARATION(formatter):
  Contract:
  INPUT: untrusted client_formatter mapping
  OUTPUT: normalized {command, args, version?}
  PRE: formatter may be non-object or contain unknown keys
  POST: command is non-empty string; args is string list when present; version is string when present
  EFFECTS: pure
  FAILURE_MODES: INVALID_FORMATTER_CONFIG
  TERMINATION: total
  IF formatter.command missing OR NOT string OR trimmed empty: RETURN error INVALID_FORMATTER_CONFIG
  IF formatter.args present AND NOT string list: RETURN error INVALID_FORMATTER_CONFIG
  IF formatter.version present AND NOT string: RETURN error INVALID_FORMATTER_CONFIG
  RETURN normalized declaration

## GUARD_PROJECT_TIED_PATH
# [IMPL-TIED_YAML_STYLE_RESOLVER] [ARCH-TIED_YAML_STYLE_RESOLUTION] [REQ-TIED_YAML_STYLE_CONFIGURATION] [REQ-TIED_YAML_CANONICALIZATION]
# How: Allow hook targets only under project-owned tiedBasePath and never under tied/methodology/**.
procedure GUARD_PROJECT_TIED_PATH(absolute_path, tied_base_path):
  Contract:
  INPUT: candidate absolute file path, tied_base_path
  OUTPUT: guarded path or path error
  PRE: absolute_path is normalized
  POST: path is strict descendant of tied_base_path and not under JOIN(tied_base_path, methodology)
  EFFECTS: pure
  FAILURE_MODES: PATH_OUT_OF_SCOPE; METHODOLOGY_PATH_FORBIDDEN
  TERMINATION: total
  normalized := CANONICALIZE_PATH(absolute_path)
  tied_root := CANONICALIZE_PATH(tied_base_path)
  methodology_root := JOIN(tied_root, methodology)
  IF NOT normalized.starts_with(tied_root + separator): RETURN error PATH_OUT_OF_SCOPE
  IF normalized.starts_with(methodology_root + separator): RETURN error METHODOLOGY_PATH_FORBIDDEN
  RETURN normalized

## RUN_CLIENT_FORMATTER_HOOK
# [IMPL-TIED_YAML_STYLE_RESOLVER] [ARCH-TIED_YAML_STYLE_RESOLUTION] [REQ-TIED_YAML_STYLE_CONFIGURATION] [REQ-MODULE_VALIDATION]
# How: Capture pre-hook bytes, spawn declared formatter in-place on one guarded path, then validate acceptance.
procedure RUN_CLIENT_FORMATTER_HOOK(absolute_path, tied_base_path, environment, filesystem):
  Contract:
  INPUT: project YAML path, tied_base_path, resolved formatter declaration
  OUTPUT: styling evidence {styling_status, command, version?, semantic_compare_ok, idempotent}
  DATA: pre_hook_bytes, post_hook_bytes, spawn argv, timeout, stdout/stderr bounds
  CONTROL: shell false; cwd client project root; append absolute_path as final argv element
  PRE: RESOLVE_CLIENT_FORMATTER returned configured; path passes GUARD_PROJECT_TIED_PATH
  POST: post-hook bytes parse; yaml_semantic_compare(pre, post) succeeds; second hook pass is byte-identical
  EFFECTS: filesystem read/write on target path; child process spawn
  FAILURE_MODES: PATH_OUT_OF_SCOPE; SPAWN_FAILED; TIMEOUT; NONZERO_EXIT; INVALID_POST_HOOK_YAML; SEMANTIC_DRIFT; NON_IDEMPOTENT_OUTPUT
  DATA_TRANSITION: pre bytes -> hook rewrite -> validated post bytes -> idempotence check
  TERMINATION: total
  guarded := GUARD_PROJECT_TIED_PATH(absolute_path, tied_base_path)
  resolved := RESOLVE_CLIENT_FORMATTER(tied_base_path, environment, filesystem)
  IF resolved.styling_status equals not_configured: RETURN {styling_status: not_configured}
  pre_bytes := filesystem.read(guarded)
  argv := BUILD_FORMATTER_ARGV(resolved.formatter, guarded)
  spawn_result := SPAWN_NO_SHELL(argv, cwd=PARENT_DIRECTORY(tied_base_path), timeout=DEFAULT_FORMATTER_TIMEOUT)
  IF spawn_result failed: RESTORE_OR_FAIL(guarded, pre_bytes); RETURN spawn_result error
  post_bytes := filesystem.read(guarded)
  IF NOT PARSEABLE_YAML(post_bytes): RETURN error INVALID_POST_HOOK_YAML
  IF yaml_semantic_compare(pre_bytes, post_bytes) failed: RETURN error SEMANTIC_DRIFT
  second := SPAWN_NO_SHELL(argv, cwd=PARENT_DIRECTORY(tied_base_path), timeout=DEFAULT_FORMATTER_TIMEOUT)
  IF second failed: RETURN second error
  IF filesystem.read(guarded) != post_bytes: RETURN error NON_IDEMPOTENT_OUTPUT
  RETURN {styling_status: configured, command: resolved.formatter.command, version: resolved.formatter.version, semantic_compare_ok: true, idempotent: true}

## REPORT_STYLING_EVIDENCE
# [IMPL-TIED_YAML_STYLE_RESOLVER] [ARCH-TIED_YAML_STYLE_RESOLUTION] [REQ-TIED_YAML_STYLE_CONFIGURATION]
# How: Expose styling_status and formatter provenance alongside existing yaml_format metadata.
procedure REPORT_STYLING_EVIDENCE(resolved_style, hook_result):
  # [IMPL-TIED_YAML_STYLE_RESOLVER] [ARCH-TIED_YAML_STYLE_RESOLUTION] [REQ-TIED_YAML_STYLE_CONFIGURATION]
  Contract:
  INPUT: resolved scalar style, hook runner result
  OUTPUT: styling evidence object for checklist and MCP responses
  PRE: resolved_style valid; hook_result from RUN_CLIENT_FORMATTER_HOOK or not_configured short-circuit
  POST: styling_status matches hook_result; configured responses include command and optional version
  EFFECTS: pure
  FAILURE_MODES: none
  TERMINATION: total
  RETURN MERGE(REPORT_YAML_FORMAT(resolved_style), {
    styling_status: hook_result.styling_status,
    client_formatter: WHEN configured THEN {command: hook_result.command, version: hook_result.version}
  })
