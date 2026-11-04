# Test strategy — REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS

**Phase:** refine-plan (design only). No production mutations in this phase.

## Unit (CI — required)

| Case | Test / file | Pass threshold |
| --- | --- | --- |
| Canonical MCP path env | `tools/bootstrap/lib/claude-client-validation.test.mjs` | `assertMcpJsonHarnessContract` passes when `tied-yaml.env.TIED_CLIENT_PROJECT_PATH` points at `{client}/tied-project/`; legacy `TIED_BASE_PATH` accepted when equivalent |
| Expected base path layout | Same | Expected path uses `resolveTiedLayout(clientRoot).tiedDir`, not hard-coded `{client}/tied` |
| Strict preflight flag | `tools/bootstrap/workflow-trial-agentstream-sh.test.mjs` (new cases) | `WF_TRIAL_STRICT_PREFLIGHT=1` + validation fail → orchestrator non-zero exit; default unset → current DIAGNOSTIC + continue |
| Agentstream regression | `cd mcp-server/packages/agentstream && npm test` | All existing tests green after any driver cwd change |

## Composition / script (CI — dry)

| Case | Command | Pass threshold |
| --- | --- | --- |
| Disposable bootstrap smoke | `node tools/bootstrap/new-tied-client.mjs --disposable --harness claude --out-path …` + validation script | `mcp_json_harness_contract` pass on fresh client |
| Dual-harness dry smoke | `bash scripts/dual-harness-wf03-parity-smoke.sh --dry-run-only` | Exit 0 (unchanged) |

## Manual (matrix — product + close_out)

| Case | Command | Pass threshold |
| --- | --- | --- |
| Claude wf-03 live cell | `AGENTSTREAM_CLAUDE_LIVE_OK=1 MODEL_CONFIG=claude-haiku-5-5 MODEL_SLUG=claude-haiku-5-5 HARNESS=claude workflow_trial_agentstream wf-03` | Preflight `ok: true`; turn 4 `close_out allowed: true`; envelope `blocking_gap_count: 0`; inventory turns 1–4 verified |
| Gold comparison | Same MODEL_SLUG as Cursor gold | Parity fingerprint per [REQ-AGENTSTREAM_CLAUDE_WF_PARITY PLAN §3](../REQ-AGENTSTREAM_CLAUDE_WF_PARITY/PLAN.md) |

## Out of scope for automated CI

- Full four-phase live LLM on every PR
- Re-running sponsor turns with transcript capture (facilitator inventory only)
