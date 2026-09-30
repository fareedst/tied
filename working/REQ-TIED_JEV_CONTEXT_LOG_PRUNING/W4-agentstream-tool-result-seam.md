# W4: agentstream `tool_result` seam (documented deferral)

**[REQ-TIED_JEV_CONTEXT_LOG_PRUNING]** Runtime slice 1 is library + replay benchmark only.

Investigation (2026-09-29): `mcp-server/packages/agentstream/src/executor-run.ts` parses assistant/thinking streams and gate proposals; it does **not** currently intercept sanitized shell/tool-result bodies for per-turn pruning.

**Opt-in flag:** `TIED_JEV_CONTEXT_LOG_PRUNING=1` resolves via `resolveContextLogPruningConfig()` in `mcp-server/src/jev/context-log-pruner.ts`. Default off — no agentstream behavior change in this wave.

**Adapter (2026-09-29 close-out):** `jev-context-log-pruning-stream.ts` + `executor-run.ts` / `live-executor.ts` parse `agentstream_tool_result` and `tool_result` NDJSON; call `pruneContextLog()` when opt-in is on. Composition test: `jev-context-log-pruning-stream.test.ts`.

Replacing stream bodies in the agent transcript is a follow-on; this wave logs `DIAGNOSTIC: context log prune:` metrics to stderr and proves the hook.
