# Test strategy — REQ-AGENTSTREAM_CLAUDE_WF_PARITY

**Phase:** refine-plan (design only). No production code in this phase.

## Unit / composition (CI — required)

| Case | Command / test file | Pass threshold |
| --- | --- | --- |
| Claude argv MCP flags | `mcp-server/packages/agentstream/src/claude-agent-argv.test.ts` | Assert `--mcp-config`, `--strict-mcp-config` when client `.mcp.json` exists; opt-out via `AGENTSTREAM_CLAUDE_STRICT_MCP=0` |
| Live driver bind | `live-driver-bind.test.ts` | Claude `runTurn` unchanged contract; exit code semantics preserved |
| Harness trace writer | `harness-turn-trace.test.ts` (new) | JSONL schema v1; one line per turn; manifest fields |
| Batch placeholder expansion | `scripts/workflow-trial-agentstream-sh.test.mjs` or dedicated test | `HARNESS=claude` → `{{SKILL_ROOT}}` → `.claude/skills`; cursor → `.cursor/skills` |
| Agentstream package | `cd mcp-server/packages/agentstream && npm test` | All tests green; update frozen dry-run oracle if argv rendering changes |

## Script / integration (CI — default dry)

| Case | Command | Pass threshold |
| --- | --- | --- |
| Dual-harness smoke (dry) | `scripts/dual-harness-wf03-parity-smoke.sh --dry-run-only` | Exit 0; Claude argv contains MCP flags; optional gold fingerprint load from `1793760220…` read-only |
| Claude client validation hook | Orchestrator preflight when `HARNESS=claude` | `run-tied-claude-client-validation.mjs` MCP smoke passes or skips with clear DIAGNOSTIC when `claude` absent |

## Manual / nightly (live — product parity)

| Case | Command | Pass threshold |
| --- | --- | --- |
| WF-03 Claude live | Same `MODEL_SLUG` as gold Cursor cell; `AGENTSTREAM_CLAUDE_LIVE_OK=1`; `AGENTSTREAM_HARNESS_TRACE=1` | Parity fingerprint vs `1793760220-wf-agentstream-wf-03`: tests green, envelope, `close_out allowed: true`, inventory turns 3–4 complete |
| WF-03 Cursor regression | Optional re-run only when batch text changes | Gold class outcome unchanged |

## Out of scope for automated CI

- Full live `workflow_trial_agentstream wf-03` × two harnesses (costly; sponsor nightly or pre-release).
