# W5 build-plan evidence — Jev harness (2026-09-26)

[REQ-TIED_JEV_DECISION_COPROCESSOR] [IMPL-TIED_JEV_DECISION_COPROCESSOR]

## Delivered

| Component | Path |
| --- | --- |
| Harness config | `mcp-server/src/jev/harness-config.ts` |
| Tool guard (fail-closed) | `mcp-server/src/jev/harness-tool-guard.ts` |
| Context filter advisory | `mcp-server/src/jev/context-filter-advisory.ts` |
| Unit tests | `mcp-server/src/jev/harness-tool-guard.test.ts` |
| Agentstream preflight | `mcp-server/packages/agentstream/src/jev-harness-preflight.ts` |
| Agentstream integration test (mock deps) | `mcp-server/packages/agentstream/src/jev-harness-preflight.test.ts` |
| Wiring | `live-executor.ts`, `executor-dry-run.ts` after DAE gate |

## Policy (sponsor)

- Blocking tools: `bash`, `Shell`
- Destructive argv patterns blocked deterministically (`rm -rf`, `git push --force`, etc.)
- Without `JEV_API_KEY` when harness enabled: blocking tools **deny** (`jev_unavailable_fail_closed`)
- Jev high noul ≥ 0.72 → block; ≥ 0.45 confirm threshold for softer gate

## Verification

```bash
cd mcp-server && bun test src/jev/
cd mcp-server && npm run build && node --test packages/agentstream/dist/jev-harness-preflight.test.js
```

No live Jev API calls in CI (mock `fetchImpl` only).

## Non-goals (W5)

- Cursor IDE middleware hook (future)
- MCP tool exposing `evaluateHarnessToolCall` to editors
- Replacing `tied_checklist_gate_validate` or adversarial inquiry artifacts
