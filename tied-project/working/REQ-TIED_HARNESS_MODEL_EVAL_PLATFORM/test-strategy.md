# Test strategy — [REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM]

**Phase:** refine-plan M4 pass 4 · **depth:** minimal / **integrated** at M4 build for replay + compare blocks  
**Package:** `mcp-server/packages/harness-eval`

## Satisfaction criteria → tests

| ID | Assert | Test home |
| --- | --- | --- |
| SC-HMEP-M1-01 | Cursor NDJSON with/without `usage` → `token_observation` rows only when present | `src/adapters/cursor/*.test.ts` |
| SC-HMEP-M1-02 | Claude resume fixtures → session delta applied once | `src/adapters/claude/*.test.ts` |
| SC-HMEP-M1-03 | Second `events import` same `origin_id` → zero new usage rows | `src/normalize/ingest.test.ts` |
| SC-HMEP-M1-04 | Overlapping categories → `completeness: incomplete` flag, no canonical total | `src/tokens/accounting.test.ts` |
| SC-HMEP-M1-05 | Suite YAML edit without hash bump → validate exit ≠ 0 | `src/suite/validate.test.ts` |
| SC-HMEP-M1-06 | `--wf-client` temp tree with manifest → trial row + fingerprint | `src/cli/import-wf.test.ts` |
| SC-HMEP-M1-07 | `diagnostics` lists fixture ids per harness | `src/cli/diagnostics.test.ts` |
| SC-HMEP-M1-08 | Cross-harness summary JSON matches golden | `src/store/query.test.ts` |

## Fixture matrix (F-19)

| Fixture id | Harness | Scenario |
| --- | --- | --- |
| `cursor-success-with-usage` | cursor | Terminal result includes usage object |
| `cursor-success-no-usage` | cursor | Terminal result without usage |
| `cursor-tool-failure` | cursor | Failed tool call event |
| `cursor-truncated-jsonl` | cursor | Partial final line |
| `claude-success-verbose` | claude | `--verbose` stream-json completion |
| `claude-resume-cumulative` | claude | Second file with cumulative usage |
| `claude-tool-failure` | claude | Tool error event |
| `duplicate-event-id` | both | Same event id twice in one file |
| `unknown-event-type` | both | Preserved in raw; normalize skips or tags unknown |

Golden files under `mcp-server/packages/harness-eval/fixtures/stream-json/`.  
Live captures under `fixtures/live-capture/` gitignored; document CLI versions in fixture README.

## Counting invariants (RED assertions)

- No negative token counts
- `reasoning_tokens` ⊆ `output_tokens` when both present
- `null` fields remain null in export (not `0`)
- Request-scoped vs invocation-scoped totals not interchangeable

## TDD order (`@build-plan`)

1. IMPL pseudo-code + `pseudocode_validate`
2. `sub-adversarial-inquiry-pass` (integrated) on adapter + token blocks
3. Contract schema tests in `mcp-server/contracts/harness-eval/`
4. RED adapter + ingest tests against fixtures
5. GREEN SQLite schema + normalize + CLI
6. Composition: import WF manifest fixture tree

## M2 satisfaction criteria → tests

| ID | Assert | Test home |
| --- | --- | --- |
| SC-HMEP-M2-01 | Pricing YAML + unknown slug → null cost | `src/pricing/catalog.test.ts`, contracts `harness-eval-pricing.*` |
| SC-HMEP-M2-02 | Legacy v1 sqlite migrates | `src/store/migrate.test.ts` |
| SC-HMEP-M2-03 | Import + JSONL → `harness_estimated_cost` | `src/runner/import-wf-m2.test.ts` |
| SC-HMEP-M2-04 | `token_present` verifier | `src/verify/trial.test.ts` |
| SC-HMEP-M2-05 | Cohort JSON by wf_id × harness | `src/report/cohort.test.ts` |
| SC-HMEP-M2-06 | verify trial CLI suite bind | `src/cli/verify.test.ts` |

## M3 satisfaction criteria → tests (design only)

| ID | Assert | Test home (build-plan) |
| --- | --- | --- |
| SC-HMEP-M3-01 | Ledger schema + unknown `trial_id` → skip summary | `src/billing/ledger.test.ts`, contracts `harness-eval-billing-ledger.*` |
| SC-HMEP-M3-02 | v2 sqlite → v3 columns nullable | `src/store/migrate-v3.test.ts` |
| SC-HMEP-M3-03 | Partial ledger row → only set columns update | `src/billing/apply.test.ts` |
| SC-HMEP-M3-04 | Reconcile JSON null-safe deltas | `src/report/reconcile.test.ts` |
| SC-HMEP-M3-05 | CLI without `--ledger` → no mutation | `src/cli/billing-import.test.ts` |

**Security:** no network fixtures; ledger paths are local YAML only (no API keys in repo).

## M4 satisfaction criteria → tests (design only)

| ID | Assert | Test home (build-plan) |
| --- | --- | --- |
| SC-HMEP-M4-01 | Baseline hash + schema; tamper → validate exit ≠ 0 | `src/regression/baseline.test.ts`, contracts `harness-eval-baseline.*` |
| SC-HMEP-M4-02 | `regression compare` tolerance breach → CLI exit 1; null metric skipped | `src/regression/compare.test.ts`, `src/cli/regression-compare.test.ts` |
| SC-HMEP-M4-03 | `replay batch` twice → observation count unchanged | `src/runner/replay.test.ts` |
| SC-HMEP-M4-04 | Batch without jsonl → `input_tokens` null; `wf_id`+`harness` in cohort query | `src/runner/replay-manifest-only.test.ts` |
| SC-HMEP-M4-05 | Missing `client_root` → skip entry; exit 0 + skip list | `src/runner/replay.test.ts`, contracts `harness-eval-replay-manifest.*` |

**Composition:** replay tests call real `importWfClient` on temp manifest trees (no markdown registry parser).

**Tolerance fixtures:** golden over/under wall_clock_ms rows in `fixtures/regression/`.

## Verification manifest (regression battery)

```bash
cd mcp-server/packages/harness-eval && npm test
node --test mcp-server/contracts/harness-eval/*.test.mjs
```
