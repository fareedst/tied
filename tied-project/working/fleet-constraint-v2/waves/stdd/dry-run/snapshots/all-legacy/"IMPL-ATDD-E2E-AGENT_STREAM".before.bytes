# [REQ-MODULE_VALIDATION] [ARCH-MODULE_VALIDATION] [IMPL-MODULE_VALIDATION] — E2E harness justified by external CLI only
# [IMPL-ATDD-E2E-AGENT_STREAM] [ARCH-ATDD-E2E_SUBPROCESS_STREAM_JSON] [REQ-ATDD-E2E-AGENT_STREAM]
# Summary: Execute agent subprocess with stream-json; surface text; capture session_id — E2E-only harness.
procedure run_agent_stream_subprocess(cmd):
  # [IMPL-ATDD-E2E-AGENT_STREAM] [ARCH-ATDD-E2E_SUBPROCESS_STREAM_JSON] [REQ-ATDD-E2E-AGENT_STREAM]
  # How: Spawn subprocess with Open3 — satisfies ARCH external CLI boundary.
  spawn agent subprocess with cmd via Open3.popen3
  # [IMPL-ATDD-E2E-AGENT_STREAM] [ARCH-ATDD-E2E_SUBPROCESS_STREAM_JSON] [REQ-ATDD-E2E-AGENT_STREAM]
  # How: Forward stderr to host stderr — REQ observability for agent errors.
  forward agent stderr stream to process stderr (async)
  # [IMPL-ATDD-E2E-AGENT_STREAM] [ARCH-ATDD-E2E_SUBPROCESS_STREAM_JSON] [REQ-ATDD-E2E-AGENT_STREAM]
  # How: Line-by-line JSON parse and fragment extraction — REQ stream-json protocol.
  for each non-empty line on stdout:
    parse line as JSON object
    capture session_id from object if present
    extract_text_fragments(object) to stdout (thinking deltas and assistant text parts)
    print newline after thinking completed events as needed
  # [IMPL-ATDD-E2E-AGENT_STREAM] [ARCH-ATDD-E2E_SUBPROCESS_STREAM_JSON] [REQ-ATDD-E2E-AGENT_STREAM]
  # How: Fail closed on non-zero exit — REQ reliable exit status.
  require exit status success or exit with agent status
  # [IMPL-ATDD-E2E-AGENT_STREAM] [ARCH-ATDD-E2E_SUBPROCESS_STREAM_JSON] [REQ-ATDD-E2E-AGENT_STREAM]
  # How: Emit session_id on stderr for resume — REQ chaining for multi-turn.
  print session_id=<captured> on stderr when captured
  return captured session id to caller for next turn --resume