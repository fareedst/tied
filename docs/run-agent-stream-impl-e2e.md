# IMPL: E2E agent stream (subprocess)

**Source:** Imported from ATDD (`docs/impl_e2e_agent_stream.md`) at commit `eb88236290009b78eb11ea561816f0854176bf12`. See [run-agent-stream-upstream.md](run-agent-stream-upstream.md).

## Procedure: `run_agent_stream_turn`

**Process:** `[PROC-TIED_DEV_CYCLE]`  
**REQ:** `REQ-ATDD-E2E-AGENT_STREAM`  
**ARCH:** `ARCH-ATDD-E2E_SUBPROCESS_STREAM_JSON`  
**IMPL:** `IMPL-ATDD-E2E-AGENT_STREAM`

**testability:** `e2e_only`  
**e2e_only_reason:** The Cursor `agent` binary must run as a real subprocess: the stream-json NDJSON protocol, stderr forwarding, and `session_id` extraction depend on OS process boundaries and the external CLI — not available as an in-process Ruby API. Automated tests may place a protocol-compatible `agent` stub earlier on `PATH` to exercise the harness without live model calls.

**Effect:** For each resolved turn, invoke `agent --print --output-format stream-json …`, parse NDJSON lines, surface assistant/thinking text to stdout, and emit `session_id=…` on stderr for `--resume` chaining.

### Pseudo-code

```
procedure run_agent_stream_turn(cmd):
  spawn agent subprocess with cmd
  stream stdout lines as JSON objects
  capture session_id from any object carrying it
  print text fragments from thinking/assistant events
  forward agent stderr to process stderr
  require successful exit status
  print session_id=<captured> on stderr
```

**Output:** Stdout contains streamed text; stderr includes `session_id=<uuid>` when the stream provided one.

**Coverage note:** Argv expansion and YAML prompt expansion are covered by unit/composition tests (`AgentStreamArgv`, `TddLoopPrompts`, `FeatureSpecBatchPrompts`); only this subprocess+stream contract is E2E-only.

**STDD:** Vendored implementation lives under [tools/agent-stream/](../tools/agent-stream/run_agent_stream.rb).
