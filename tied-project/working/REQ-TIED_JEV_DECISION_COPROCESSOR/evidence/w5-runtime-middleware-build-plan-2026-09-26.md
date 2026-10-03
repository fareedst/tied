# W5 runtime middleware build-plan evidence (2026-09-26)

[REQ-TIED_JEV_DECISION_COPROCESSOR] [IMPL-TIED_JEV_DECISION_COPROCESSOR]

Optional residual slice — does **not** reopen REQ Implemented or closed CITDP.

## Implemented (this slice)

| Piece | Path |
| --- | --- |
| Stream tool proposal parser + gate API | `mcp-server/packages/agentstream/src/jev-harness-live-tool-gate.ts` |
| Shared dist loader | `mcp-server/packages/agentstream/src/jev-harness-shared.ts` |
| Live loop wiring | `executor-run.ts` (stream-json line handler), `live-driver-bind.ts`, `live-executor.ts` (`createJevLiveToolGate` after preflight) |
| Composition tests | `jev-harness-live-tool-gate.test.ts` |
| Fake agent fixture | `testdata/live/fake_jev_shell_agent.rb` |
| IMPL LEAP note | `RUN_JEV_LIVE_TOOL_GATE` in `IMPL-TIED_JEV_DECISION_COPROCESSOR-pseudocode.md` |
| README | `@tied/agentstream` Jev live tool gate row |

## Already present (W5 core)

- `evaluateHarnessToolCall`, harness config, preflight smoke (`jev-harness-preflight.ts`), DAE + static MCP ordering unchanged.

## Enablement

- `AGENTSTREAM_JEV_HARNESS=1` or `.tied-yaml.yaml` → `jev.agentstream_harness: true`
- Built `mcp-server/dist/jev/harness-tool-guard.js` for live eval (same as preflight)
- `JEV_API_KEY` env-only; missing key → fail-closed on blocking tools per harness config

## Behavior

1. After DAE + Jev preflight, `executeLiveRun` builds `JevLiveToolGate` when harness enabled.
2. Cursor driver `runAgent` parses each NDJSON line; proposals from `agentstream_tool_proposal`, top-level `tool_use` / `tool_call`, or assistant `tool_use` blocks.
3. Blocking tools evaluated via `evaluateHarnessToolCall`; **`block`** → SIGTERM subprocess, turn exit **1**, `DIAGNOSTIC` on stderr.
4. **`confirm`** / **`allow`** → diagnostic only; turn continues.

## Verification commands

```bash
cd mcp-server && npm run build
cd mcp-server && bun test src/jev/harness-tool-guard.test.ts
cd mcp-server && bun test packages/agentstream/src/jev-harness-live-tool-gate.test.ts packages/agentstream/src/jev-harness-preflight.test.ts
cd mcp-server && node --test packages/agentstream/dist/jev-harness-live-tool-gate.test.js
```

Gate (optional slice, program closed): `tied_checklist_gate_validate` **verification** with closed CITDP + tracker → `allowed: true`, `depth: minimal`.

`tied_validate_consistency` → **ok: true** (post sidecar LEAP note only).

## Residual gaps

- **Production Cursor stream-json** may not emit tool proposals on stdout until the agent CLI exposes them; composition uses documented `agentstream_tool_proposal` extension and Anthropic-shaped `tool_use` blocks.
- **`--harness claude`** path uses batch stream parse after turn completes — live per-line gate not wired (cursor profile only).
- **Cursor IDE hooks** / MCP diagnostic tool — still out of scope.
- **`confirm`** does not pause for human approval in agentstream (stderr advisory only).

## REQ / CITDP status

**Unchanged** — REQ **Implemented**, CITDP **closed/final**; no status or CITDP body mutations.
