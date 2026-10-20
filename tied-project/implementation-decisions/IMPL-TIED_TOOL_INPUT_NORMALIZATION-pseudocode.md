# [IMPL-TIED_TOOL_INPUT_NORMALIZATION] [ARCH-TIED_TOOL_INPUT_NORMALIZATION] [REQ-TIED_TOOL_INPUT_COMPATIBILITY] — Object-or-string record inputs and CLI hindrance diagnostics.

Grammar-Version: v2

## Shared record payload normalization

- [IMPL-TIED_TOOL_INPUT_NORMALIZATION] [ARCH-TIED_TOOL_INPUT_NORMALIZATION] [REQ-TIED_TOOL_INPUT_COMPATIBILITY] Normalize MCP write-tool record fields so native JSON objects and legacy JSON/YAML strings produce the same canonical record before YAML persistence.
- Contract:
  - INPUT: `raw` unknown (MCP tools/call argument value after JSON parse)
  - PRE: `raw` is defined (not missing)
  - OUTPUT: ParseResult success or error envelope
  - POST:
    - success branch: value is a non-null plain object (not array); string inputs parsed with existing JSON-then-YAML rules
    - error branch: caller receives stable error string; no partial write
  - FAILURE_MODES: invalid_string, non_object, null_or_array, primitive
  - EFFECTS: pure
  - TERMINATION: total
procedure NORMALIZE_RECORD_PAYLOAD:
  # [IMPL-TIED_TOOL_INPUT_NORMALIZATION] [ARCH-TIED_TOOL_INPUT_NORMALIZATION] [REQ-TIED_TOOL_INPUT_COMPATIBILITY] How: branch on typeof raw; delegate strings to PARSE_RECORD_OR_YAML.
  Contract:
    INPUT: raw
    OUTPUT: ParseResult success or error envelope
    PRE: raw !== undefined
    POST: success branch implies record object; error branch returns stable error string
    FAILURE_MODES: invalid_string, non_object, null_or_array, primitive
    EFFECTS: pure
  IF typeof raw === "object" AND raw !== null AND NOT Array.isArray(raw) THEN
    - RETURN { ok: true, value: raw }
  IF typeof raw === "string" THEN
    - RETURN PARSE_RECORD_OR_YAML(raw)
  - RETURN { ok: false, error: "Payload must be a JSON or YAML object (not null, array, or primitive)" }

procedure PARSE_RECORD_OR_YAML:
  # [IMPL-TIED_TOOL_INPUT_NORMALIZATION] [ARCH-TIED_TOOL_INPUT_NORMALIZATION] [REQ-TIED_TOOL_INPUT_COMPATIBILITY] How: preserve existing parseRecordOrYaml behavior for string callers.
  Contract:
    INPUT: str string
    OUTPUT: ParseResult
    EFFECTS: pure
  - TRY JSON.parse(str); ON fail TRY yaml.load(str)
  - IF result is null OR array OR non-object THEN RETURN invalid non_object
  - RETURN { ok: true, value }

## MCP write-tool schema and handler wiring

- [IMPL-TIED_TOOL_INPUT_NORMALIZATION] [ARCH-TIED_TOOL_INPUT_NORMALIZATION] [REQ-TIED_TOOL_INPUT_COMPATIBILITY] Zod input schemas accept `z.union([z.string(), z.record(z.string(), z.unknown())])` for each legacy string record field; handlers call NORMALIZE_RECORD_PAYLOAD before existing writers.
procedure APPLY_RECORD_FIELD_TO_WRITE_TOOLS:
  # [IMPL-TIED_TOOL_INPUT_NORMALIZATION] [ARCH-TIED_TOOL_INPUT_NORMALIZATION] [REQ-TIED_TOOL_INPUT_COMPATIBILITY] How: same coercion path for index, detail, citdp, and token-create tools listed in REQ satisfaction criteria.
  Contract:
    INPUT: tool_name, field_name, raw
    OUTPUT: ParseResult success or error envelope
    PRE: tool_name in ALLOWED_WRITE_TOOLS
    POST: success branch unchanged behavior when raw is a valid legacy string; error branch no write
    FAILURE_MODES: normalize_failed, disallowed_tool
    EFFECTS: IO when downstream writer persists
  - ALLOWED_WRITE_TOOLS := yaml_index_insert.record, yaml_index_update.updates, yaml_detail_create.record, yaml_detail_update.updates, citdp_record_write.record, tied_token_create_with_detail.index_record, tied_token_create_with_detail.detail_record
  - result := NORMALIZE_RECORD_PAYLOAD(raw)
  - IF NOT result.ok THEN RETURN tool error envelope (no write)
  - CALL existing writer with result.value

## CLI hindrance diagnostic (transport / JSON-RPC)

- [IMPL-TIED_TOOL_INPUT_NORMALIZATION] [ARCH-TIED_TOOL_INPUT_NORMALIZATION] [REQ-TIED_TOOL_INPUT_COMPATIBILITY] Emit machine-readable stderr line for tied-cli stdio client failures without changing exit codes or auto-writing feedback.
procedure EMIT_CLI_HINDRANCE_DIAGNOSTIC:
  # [IMPL-TIED_TOOL_INPUT_NORMALIZATION] [ARCH-TIED_TOOL_INPUT_NORMALIZATION] [REQ-TIED_TOOL_INPUT_COMPATIBILITY] How: prefix DIAGNOSTIC: TIED_CLI_HINDRANCE with JSON classification when JSON-RPC or tools/call fails validation or transport.
  Contract:
    INPUT: failure_kind, jsonrpc_code optional, tool_name optional, recovery_hint
    OUTPUT: stderr line + preserved legacy ERROR line
    PRE: failure_kind in KNOWN_KINDS
    POST: process exit code unchanged from pre-change behavior
    EFFECTS: IO stderr
    FAILURE_MODES: diagnostic_serialization_fail
  - KNOWN_KINDS := invalid_arguments, transport_error, parse_error, tool_error
  - EMIT `DIAGNOSTIC: TIED_CLI_HINDRANCE ` + JSON.stringify({ failure_kind, jsonrpc_code, tool_name, recovery_hint })
  - EMIT existing human-readable ERROR unchanged
  - DO NOT CALL tied_feedback_add from this path
