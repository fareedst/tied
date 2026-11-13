# build-plan M4 evidence

**date:** 2026-11-13  
**prompt_type:** build-plan  
**request_token:** REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM  
**milestone:** M4 (F-15, F-16)

## Satisfaction criteria

| ID | Evidence |
| --- | --- |
| SC-HMEP-M4-01 | `src/regression/baseline.test.ts`, `harness-eval-baseline.contract.test.mjs` |
| SC-HMEP-M4-02 | `src/regression/compare.test.ts`, `src/cli/regression-compare.test.ts` |
| SC-HMEP-M4-03 | `src/runner/replay.test.ts` (second batch `observations_inserted=0`) |
| SC-HMEP-M4-04 | `src/runner/replay-manifest-only.test.ts` |
| SC-HMEP-M4-05 | `src/runner/replay.test.ts` (skip missing dir, CLI exit 0) |

## Verification

```text
cd mcp-server/packages/harness-eval && npm test
→ 30 pass
node --test mcp-server/contracts/harness-eval/*.test.mjs
→ 5 pass
```

## Deliverables

- `src/regression/{baseline,compare}.ts`
- `src/runner/replay.ts`
- CLI: `regression baseline validate`, `regression compare`, `replay batch`
- Contracts: `harness-eval-baseline.schema.json`, `harness-eval-replay-manifest.schema.json`
- Operator artifacts: `docs/demos/harness-eval/baselines/`, `replay/`
- REQ satisfaction SC-HMEP-M4-01…05 via MCP `yaml_index_update`
- IMPL pseudo-code blocks VALIDATE_REGRESSION_BASELINE, COMPARE_TRIAL_TO_BASELINE, REPLAY_BATCH_IMPORT, VALIDATE_REPLAY_MANIFEST

## Constraints honored

- D-PROOF-BOUNDARY: baseline metrics only
- D-REPLAY-MANIFEST: no registry markdown parser
- Null tokens/costs preserved (no fabricated zeros)

## Next

- `@close-out` M3 (scoped) and/or M4 — uncommitted on disk; sponsor request required for commit
