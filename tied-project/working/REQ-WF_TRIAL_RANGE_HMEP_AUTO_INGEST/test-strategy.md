# Test strategy — [REQ-WF_TRIAL_RANGE_HMEP_AUTO_INGEST]

**Phase:** refine-plan · **depth:** minimal

## Satisfaction criteria → tests

| ID | Assert |
| --- | --- |
| SC-WRH-01 | `hmepStreamCaptureEnabled()` false by default; true when `WF_TRIAL_HMEP_CAPTURE=1`; `resolveHmepStreamJsonPath(ws, 3)` ends with `stream-json/turn-003.jsonl`; append creates file with NDJSON line |
| SC-WRH-02 | Sourced shell test: `workflow_trial_range` function body exports capture env; calls `wf_trial_hmep_import_cell` after loop body (grep/contract test without live trial) |
| SC-WRH-03 | Import harness-eval fixture `claude-success-verbose.jsonl` copied to client `stream-json/turn-001.jsonl` → import observations ≥ 1; optional composition with `applyTrialPricing` when model in catalog |
| SC-WRH-04 | With `WF_TRIAL_SKIP_HMEP_CAPTURE=1`, capture helper no-op; import helper returns early |
| SC-WRH-05 | Documented + unit: capture off when env unset (single-cell path has no export in orchestrator sh) |
| SC-WRH-06 | Shell test: import helper invoked when mock orchestrator exit 2 (stub function; assert import called) |

## Driver integration (build-plan)

- Spy or inject `appendHmepStreamJsonLine` in `runAgent` / `collectClaudeStreamFromSpawn` tests (mock spawn with one NDJSON line).
- Live executor: pass `turnIndex` through `RunAgentOptions` / `CollectClaudeStreamSpawnOptions` (type-only contract test if spawn too heavy).

## TDD order (`@build-plan`)

1. IMPL pseudo-code sidecar + `pseudocode_validate`
2. RED `hmep-stream-capture.test.ts` + shell contract tests
3. GREEN capture module + driver wiring + `live-executor` options
4. RED/GREEN `wf-trial-hmep-import.inc.sh` + `workflow_trial_range`
5. Vocab + CLI guide; LEAP indexes; `tied_validate_consistency`

## Verification manifest (draft)

```bash
cd mcp-server/packages/agentstream && npm test -- --test-name-pattern 'hmep-stream-capture'
cd mcp-server/packages/harness-eval && npm test
node --test tools/bootstrap/wf-trial-hmep-import.test.mjs
# after LEAP: pseudocode_validate IMPL-WF_TRIAL_RANGE_HMEP_AUTO_INGEST
```

**Optional operator smoke (not CI):** `workflow_trial_range claude haiku-5-5 low 9 9` then `harness-eval query summary`.
