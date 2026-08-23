# [IMPL-MCP_USAGE_METRICS] [ARCH-MCP_USAGE_METRICS] [REQ-MCP_USAGE_METRICS]
# Summary: Opt-in JSONL metrics for every MCP tool call; sanitize args; wrap at registration; bounded offline Ruby aggregation with explicit signature coverage.

## Summary contract

- [IMPL-MCP_USAGE_METRICS] [ARCH-MCP_USAGE_METRICS] [REQ-MCP_USAGE_METRICS] How: INPUT/OUTPUT/DATA for usage-metrics module. Composition: independent of feedback.yaml; metrics file is append-only JSONL outside project TIED YAML unless path overridden.
- Contract:
  - INPUT: process.env TIED_MCP_COLLECT_METRICS, TIED_MCP_METRICS_PATH, TIED_MCP_METRICS_CLIENT; tool handler args; handler result or throw.
  - OUTPUT: JSONL line per invocation when enabled; analyze script YAML summary on stdout/stderr.
  - DATA: v1 record { v, ts, tool, client, project_id, duration_ms, ok, error_snippet, args_summary, args_signature }.
  - CONTROL: Collection off unless TIED_MCP_COLLECT_METRICS is 1 or true (case-insensitive); write failures are non-fatal.

## Env gate and path resolution

- [IMPL-MCP_USAGE_METRICS] [ARCH-MCP_USAGE_METRICS] [REQ-MCP_USAGE_METRICS] How: Return true when TIED_MCP_COLLECT_METRICS is 1 or true (case-insensitive); else false (zero file I/O).
- function isMetricsEnabled():
  - RETURN true when env is 1 or true (case-insensitive); else false.

- [IMPL-MCP_USAGE_METRICS] [ARCH-MCP_USAGE_METRICS] [REQ-MCP_USAGE_METRICS] How: Use TIED_MCP_METRICS_PATH when set; else path.join(os.homedir(), '.cursor', 'logs', 'tied-mcp-metrics.jsonl').
- function resolveMetricsPath():
  - IF TIED_MCP_METRICS_PATH set: RETURN that path.
  - ELSE RETURN path.join(os.homedir(), '.cursor', 'logs', 'tied-mcp-metrics.jsonl').

## Arg sanitization

- [IMPL-MCP_USAGE_METRICS] [ARCH-MCP_USAGE_METRICS] [REQ-MCP_USAGE_METRICS] How: Build args_summary preserving scalar keys (token, index, type, format, dry_run, view, field, value, old_token, new_token, booleans). For blob keys (record, updates, detail_record, index_record, essence_pseudocode, steps, context) emit { _bytes: N } or { _keys: [...] } only. Truncate remaining strings to 200 chars; recursively canonicalize object keys before SHA-256 hashing the args_signature.
- function sanitizeArgs(toolName, args):
  - FOR each key in args:
    - IF blob key: emit { _bytes: N } or { _keys: [...] } only.
    - ELSE IF preserved scalar: keep value.
    - ELSE IF string longer than 200: truncate.
  - args_signature = SHA-256 hex prefix of recursively key-sorted args_summary.
  - RETURN { args_summary, args_signature }.

## Recording and wrapping

- [IMPL-MCP_USAGE_METRICS] [ARCH-MCP_USAGE_METRICS] [REQ-MCP_USAGE_METRICS] How: mkdir parent of metrics path; append JSON.stringify(record) + newline; ON IO error log DIAGNOSTIC to stderr and continue (non-fatal).
- procedure recordToolCall(record):
  - mkdir parent of resolveMetricsPath().
  - append JSON.stringify(record) + newline.
  - ON IO error: log DIAGNOSTIC to stderr; continue (non-fatal).

- [IMPL-MCP_USAGE_METRICS] [ARCH-MCP_USAGE_METRICS] [REQ-MCP_USAGE_METRICS] How: If not isMetricsEnabled(), return handler unchanged. Else return async wrapper: start timer; invoke handler; catch throws as ok false; detect result.isError; derive hashed project_id from getBasePath() without persisting the raw path; redact absolute paths in error snippets; client from TIED_MCP_METRICS_CLIENT or cursor-mcp; recordToolCall; rethrow or return result.
- function wrapToolHandler(toolName, handler):
  - IF not isMetricsEnabled(): RETURN handler unchanged.
  - RETURN async wrapper:
    - start timer.
    - invoke handler.
    - ON throw: ok = false; capture error_snippet; rethrow after record.
    - IF result.isError: ok = false.
    - client = TIED_MCP_METRICS_CLIENT or 'cursor-mcp'.
    - project_id = SHA-256 prefix of resolved getBasePath(); do not persist base_path.
    - redact absolute paths from error_snippet.
    - recordToolCall(v1 record).
    - RETURN result.

## Registration and CLI

- [IMPL-MCP_USAGE_METRICS] [ARCH-MCP_USAGE_METRICS] [REQ-MCP_USAGE_METRICS] How: For each allTools entry, register exactly one handler from instrumentToolHandlers; it wraps the handler when metrics are enabled and preserves the raw handler otherwise.
- procedure index_register_tools():
  - handlers = instrumentToolHandlers(allTools).
  - FOR each allTools entry: register handlers[name].

- [IMPL-MCP_USAGE_METRICS] [ARCH-MCP_USAGE_METRICS] [REQ-MCP_USAGE_METRICS] How: When TIED_MCP_COLLECT_METRICS is set, export TIED_MCP_METRICS_CLIENT=tied-cli before node tied-mcp-stdio-client.cjs.
- procedure tied_cli_spawn():
  - WHEN TIED_MCP_COLLECT_METRICS is set:
    - export TIED_MCP_METRICS_CLIENT=tied-cli.
  - spawn node tied-mcp-stdio-client.cjs.

## ANALYZE_TIED_MCP_METRICS

- [IMPL-MCP_USAGE_METRICS] [ARCH-MCP_USAGE_METRICS] [REQ-MCP_USAGE_METRICS] How: Bound deterministic per-file and aggregate signature analysis, disclose candidate visibility through signature_coverage, and sum aggregate schema errors without conflating parse errors.
- Contract:
  - INPUT: one or more existing metrics JSONL paths; optional --aggregate; optional --project-root
  - PRE: every input path names a readable file; file argument multiplicity retains existing CLI semantics
  - OUTPUT: one per-file YAML report on stdout; optional aggregate YAML summary on stderr
  - POST:
    - every top_signatures list has at most SIGNATURE_BOUND rows ordered by descending count, then tool, then args_signature
    - every report includes signature_coverage { bound, considered, emitted, omitted, status }
    - per-file considered equals distinct valid (tool, args_signature) keys; status is exact_within_bound exactly when omitted is zero
    - aggregate considered equals the visible distinct candidate-key union from bounded per-file top_signatures
    - aggregate status is exact_within_bound exactly when every per-file status is exact_within_bound and aggregate omitted is zero; otherwise status is approximate
    - aggregate schema_errors equals the sum of per-file schema_errors and remains distinct from parse_errors
    - reversing distinct input-path order does not change aggregate top_signatures, including sample_args_summary
  - FAILURE_MODES: InvalidOption, MetricsFileNotFound
  - DATA: SIGNATURE_BOUND = 50; per-file streaming counters; visible aggregate candidate map
  - CONTROL: per-file YAML remains on stdout; --aggregate remains on stderr; approximate discloses candidates hidden by per-file truncation
  - EFFECTS: IO
  - TERMINATION: total
- PROCEDURE: ANALYZE_TIED_MCP_METRICS
  - 1. SET SIGNATURE_BOUND to 50.
  - FOR each path:
    - stream lines and JSON.parse each non-empty line.
    - count malformed JSON as parse_errors.
    - reject non-object or missing-core-field records as schema_errors.
    - accumulate tool_counts, client_counts, failures, duration stats, and signatures.
    - for equal (tool, args_signature) keys retain the lexically smallest recursively key-sorted canonical JSON sample_args_summary.
    - order signature rows by descending count, then tool, then args_signature.
    - build signature_coverage from the complete per-file candidate set and SIGNATURE_BOUND.
    - emit YAML summary to stdout.
  - IF --aggregate:
    - sum lines, parse_errors, schema_errors, ok_count, and fail_count from every per-file report.
    - merge only visible per-file top_signatures by (tool, args_signature).
    - for equal aggregate keys retain the lexically smallest recursively key-sorted canonical JSON sample_args_summary.
    - order aggregate signature rows by descending count, then tool, then args_signature.
    - build aggregate signature_coverage from the visible candidate union and SIGNATURE_BOUND.
    - set aggregate status to approximate when any per-file status is approximate or aggregate omitted is nonzero; otherwise exact_within_bound.
    - emit combined summary to stderr.
