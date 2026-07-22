# [IMPL-MCP_USAGE_METRICS] [ARCH-MCP_USAGE_METRICS] [REQ-MCP_USAGE_METRICS]
# Summary: Opt-in JSONL metrics for every MCP tool call; sanitize args; wrap at registration; offline Ruby aggregator.

## Summary contract

- [IMPL-MCP_USAGE_METRICS] [ARCH-MCP_USAGE_METRICS] [REQ-MCP_USAGE_METRICS] How: INPUT/OUTPUT/DATA for usage-metrics module. Composition: independent of feedback.yaml; metrics file is append-only JSONL outside project TIED YAML unless path overridden.
- Contract:
  - INPUT: process.env TIED_MCP_COLLECT_METRICS, TIED_MCP_METRICS_PATH, TIED_MCP_METRICS_CLIENT; tool handler args; handler result or throw.
  - OUTPUT: JSONL line per invocation when enabled; analyze script YAML summary on stdout/stderr.
  - DATA: v1 record { v, ts, tool, client, base_path, duration_ms, ok, error_snippet, args_summary, args_signature }.
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

- [IMPL-MCP_USAGE_METRICS] [ARCH-MCP_USAGE_METRICS] [REQ-MCP_USAGE_METRICS] How: Build args_summary preserving scalar keys (token, index, type, format, dry_run, view, field, value, old_token, new_token, booleans). For blob keys (record, updates, detail_record, index_record, essence_pseudocode, steps, context) emit { _bytes: N } or { _keys: [...] } only. Truncate remaining strings to 200 chars; stable JSON stringify + SHA-256 hex prefix for args_signature.
- function sanitizeArgs(toolName, args):
  - FOR each key in args:
    - IF blob key: emit { _bytes: N } or { _keys: [...] } only.
    - ELSE IF preserved scalar: keep value.
    - ELSE IF string longer than 200: truncate.
  - args_signature = SHA-256 hex prefix of stable JSON stringify(args_summary).
  - RETURN { args_summary, args_signature }.

## Recording and wrapping

- [IMPL-MCP_USAGE_METRICS] [ARCH-MCP_USAGE_METRICS] [REQ-MCP_USAGE_METRICS] How: mkdir parent of metrics path; append JSON.stringify(record) + newline; ON IO error log DIAGNOSTIC to stderr and continue (non-fatal).
- procedure recordToolCall(record):
  - mkdir parent of resolveMetricsPath().
  - append JSON.stringify(record) + newline.
  - ON IO error: log DIAGNOSTIC to stderr; continue (non-fatal).

- [IMPL-MCP_USAGE_METRICS] [ARCH-MCP_USAGE_METRICS] [REQ-MCP_USAGE_METRICS] How: If not isMetricsEnabled(), return handler unchanged. Else return async wrapper: start timer; invoke handler; catch throws as ok false; detect result.isError; getBasePath() for base_path; client from TIED_MCP_METRICS_CLIENT or cursor-mcp; recordToolCall; rethrow or return result.
- function wrapToolHandler(toolName, handler):
  - IF not isMetricsEnabled(): RETURN handler unchanged.
  - RETURN async wrapper:
    - start timer.
    - invoke handler.
    - ON throw: ok = false; capture error_snippet; rethrow after record.
    - IF result.isError: ok = false.
    - client = TIED_MCP_METRICS_CLIENT or 'cursor-mcp'.
    - base_path = getBasePath().
    - recordToolCall(v1 record).
    - RETURN result.

## Registration, CLI, and offline analysis

- [IMPL-MCP_USAGE_METRICS] [ARCH-MCP_USAGE_METRICS] [REQ-MCP_USAGE_METRICS] How: For each allTools entry, register wrapToolHandler(name, handler) when metrics enabled else raw handler.
- procedure index_register_tools():
  - FOR each allTools entry:
    - IF isMetricsEnabled(): register wrapToolHandler(name, handler).
    - ELSE register raw handler.

- [IMPL-MCP_USAGE_METRICS] [ARCH-MCP_USAGE_METRICS] [REQ-MCP_USAGE_METRICS] How: When TIED_MCP_COLLECT_METRICS is set, export TIED_MCP_METRICS_CLIENT=tied-cli before node tied-mcp-stdio-client.cjs.
- procedure tied_cli_spawn():
  - WHEN TIED_MCP_COLLECT_METRICS is set:
    - export TIED_MCP_METRICS_CLIENT=tied-cli.
  - spawn node tied-mcp-stdio-client.cjs.

- [IMPL-MCP_USAGE_METRICS] [ARCH-MCP_USAGE_METRICS] [REQ-MCP_USAGE_METRICS] How: Stream each line JSON.parse; accumulate tool_counts, client_counts, failures, duration stats per tool, top_signatures; emit YAML per file; optional --aggregate to stderr.
- procedure analyze_tied_mcp_metrics(jsonl_paths):
  - FOR each path:
    - stream lines; JSON.parse each.
    - accumulate tool_counts, client_counts, failures, duration stats, top_signatures.
    - emit YAML summary to stdout.
  - IF --aggregate: emit combined summary to stderr.
