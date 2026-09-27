# W4 test strategy — residuality pilot (refine-plan scaffold)

**Change ID:** `PLAN-TIED-RESIDUALITY-ANALYSIS`  
**CITDP:** `CITDP-RESIDUALITY-PILOT-W4-TESTS.yaml`  
**Date:** 2026-09-27  
**Status:** Executed — build-plan W4 (`w4-build-plan-tests`) 2026-09-27; see `evidence/w4-build-plan-summary.md`

## Scope

- **In batch 1:** W3 P0 stressor facets (S-T01, S-T04, S-T05, S-T12, S-T14, S-T15, S-T18) plus W2 `finding` confirmation rows and **S-T03** composition clarification.
- **Out of batch 1:** P1 deferrals (S-T09, S-T10, S-T11, S-T16, S-O02, S-O06, S-O07); holdouts in `validation-stressors.md` until primary matrix GREEN.
- **Module boundary:** `mcp-server/src/feature-orchestration/` (`execution-state.ts`, `store.ts`, scheduler/readiness bindings as composition peers).
- **Proof stance:** Composition faults prove **binding exercised** per [composition-coverage.md](../../tied/docs/composition-coverage.md) — not universal resilience.

## PROC-TIED_DEV_CYCLE ordering (normative for build-plan W4)

1. **Unit RED** — failing tests for each P0 IMPL block not covered by current tests (`APPEND_EVIDENCE`, `EVALUATE_DEPENDENCIES`, `RECORD_TERMINAL_FAILURE_AFTER_MAX_RETRIES`, extended `RESUME_EXECUTION`, `HANDLE_LOCK_TTL`, dedup on `createIdempotently` redelivery).
2. **Unit GREEN** — implement pseudo-code blocks in production modules (build-plan only).
3. **Module validation** — unit suite green in isolation before composition (`[REQ-MODULE_VALIDATION]`).
4. **Composition RED** — UI-free faults with fakes on persistence/queue seams.
5. **Composition GREEN** — wire injectors and adapters.
6. **Holdout** — run `validation-stressors.md` scenarios; disclose overlap with design stressors.

## S-T03 clarification (before optional stack elevation)

| Path | Seam | Expected failure | IMPL / REQ anchor | Composition injection |
|------|------|------------------|-------------------|------------------------|
| Idempotent create | `FeatureStore` publish / metadata IO | `PUBLISH_FAILED`; no committed feature readable | IMPL-FEAT_IDEMPOTENT_CREATE CREATE path; REQ-FEAT_IDEMPOTENT_CREATION crit. 2 | Fake store throws on `publish` or `renameSync` after partial write |
| Task execution evidence | Persistence adapter behind `ExecutionStateStore` | `STORE_WRITE_FAILED` or `STORE_UNAVAILABLE`; no success transition | IMPL-FEAT_TASK_EXECUTION_STATE `APPEND_EVIDENCE` step 4–5; REQ-FEAT_TASK_EXECUTION_RECOVERY S-T15 facet | Injectable store double rejects append; assert no `passed` status |

**Refine default:** Execution-path proof via composition + IMPL `FAILURE_MODES` is sufficient for pilot; add REQ satisfaction criterion only if unit/composition RED shows silent success or missing error surface (**SD-W4-S-T03-EXEC**).

## Test matrix

Columns: `stressor_id` | `test_layer` | `fault_pattern` | `tied_refs` | `proof_boundary`

### P0 facets (W3 LEAP — unit-first)

| stressor_id | test_layer | fault_pattern | tied_refs | proof_boundary |
|-------------|------------|---------------|-----------|----------------|
| S-T01 | unit | duplicate delivery — same attempt_key / request_key redelivery | REQ-FEAT_TASK_EXECUTION_RECOVERY, REQ-FEAT_IDEMPOTENT_CREATION, IMPL-FEAT_TASK_EXECUTION_STATE APPEND_EVIDENCE, IMPL-FEAT_IDEMPOTENT_CREATE | Proves dedup POST for one logical attempt; not broker-wide exactly-once |
| S-T04 | unit | unknown-outcome retry — consult store before re-allocate / non-terminal resume | REQ-FEAT_TASK_EXECUTION_RECOVERY, REQ-FEAT_IDEMPOTENT_CREATION, RESUME_EXECUTION, CREATE_FEATURE_IDEMPOTENTLY | Proves client-safe retry semantics in module; not network partition proof |
| S-T05 | unit | completion order vs message order — store order unlocks dependents | REQ-FEAT_TASK_EXECUTION_RECOVERY, IMPL EVALUATE_DEPENDENCIES | Proves dependency predicate uses store sequence; not full scheduler integration |
| S-T12 | unit | duplicate attempt_key append — EVIDENCE_DUPLICATE_REJECTED | ARCH-FEAT_TASK_EXECUTION_STATE, IMPL APPEND_EVIDENCE | Proves harmful dedup constraint; not audit log tamper resistance |
| S-T14 | unit | max retries exhausted — terminal failed, dependents locked | REQ-FEAT_TASK_EXECUTION_RECOVERY, RECORD_TERMINAL_FAILURE_AFTER_MAX_RETRIES | Proves bounded retry policy; not poison-message auto-quarantine UX |
| S-T15 | unit | store write failure on evidence append — STORE_WRITE_FAILED | REQ-FEAT_TASK_EXECUTION_RECOVERY, APPEND_EVIDENCE | Proves no silent success on IO failure; pairs with S-T03 execution leg |
| S-T18 | unit | lock TTL expired — metadata authoritative, new allocation allowed | REQ-FEAT_IDEMPOTENT_CREATION, IMPL HANDLE_LOCK_TTL | Proves TTL path in module; not distributed clock skew proof |

### P0 facets — composition bindings

| stressor_id | test_layer | fault_pattern | tied_refs | proof_boundary |
|-------------|------------|---------------|-----------|----------------|
| S-T01 | composition | duplicate delivery fault — same delivery twice at worker→store binding | IMPL-FEAT_TASK_EXECUTION_STATE, IMPL-FEAT_IDEMPOTENT_CREATE | Binding exercised; idempotency_evidence column |
| S-T05 | composition | ordering fault — completion signal before handler registered / inverted store vs broker order | ARCH-FEAT_TASK_EXECUTION_STATE, EVALUATE_DEPENDENCIES | ordering + async_semantics columns; not race-free system |
| S-T04 | composition | timeout fault — side effect committed before client observes timeout | REQ both pilot REQs | failure_behavior + TIMEOUT row when declared |

### Finding rows — confirmation tests (no W3 elevation)

| stressor_id | test_layer | fault_pattern | tied_refs | proof_boundary |
|-------------|------------|---------------|-----------|----------------|
| S-T02 | composition | suppressed failure/recovery — crash mid-write (abort after partial state write) | IMPL-FEAT_TASK_EXECUTION_STATE | Confirms non-terminal + retry append; may trigger LEAP if gap found |
| S-T06 | unit | stale resume — STALE_INPUT | IMPL RESUME_EXECUTION | Confirms existing criterion alignment |
| S-T13 | composition | split-claim — two workers report completion (future scheduler scope) | REQ-FEAT_TASK_EXECUTION_RECOVERY | Discovery confirmation; may defer if out of module boundary |
| S-O01 | unit | cancellation not resumable without flag | IMPL RESUME_EXECUTION | Confirms CANCELLATION_NOT_RESUMABLE path |
| S-O04 | unit | operator stale retry — STALE_INPUT surfaced | IMPL RESUME_EXECUTION | Confirms operator-visible stale error |
| S-T07 | composition | concurrent identical create — lock + metadata | IMPL-FEAT_IDEMPOTENT_CREATE | data-integrity binding; not load test |
| S-T08 | composition | partial publish fault — PUBLISH_FAILED cleanup | IMPL-FEAT_IDEMPOTENT_CREATE, store.test patterns | Confirms reservation cleanup |
| S-T17 | unit | empty request_key — REQUEST_KEY_REQUIRED | IMPL CREATE path | Confirms PRE |
| S-O05 | unit | fingerprint mismatch — REQUEST_KEY_COLLISION | IMPL CREATE path | Confirms stable collision semantics |
| S-T03 | composition | store unavailable — create publish + execution evidence append (split legs) | REQ-FEAT_IDEMPOTENT_CREATION, REQ-FEAT_TASK_EXECUTION_RECOVERY, IMPL both | Explicit failure; no silent success; lock recoverable per worksheet |

## Scaffold file map

| Artifact | Purpose |
|----------|---------|
| `mcp-server/src/feature-orchestration/w4-residuality-pilot.unit.test.scaffold.ts` | Unit RED placeholders for P0 blocks + finding unit rows |
| `mcp-server/src/feature-orchestration/w4-residuality-pilot.composition.test.scaffold.ts` | CONTROLLED_COMPOSITION_FAULT placeholders including S-T03 |

## Commands (build-plan)

```bash
cd mcp-server && bun test src/feature-orchestration/
```

## Evidence (build-plan exit)

- Failing RED captured before GREEN (commit or working evidence paths under `working/PLAN-TIED-RESIDUALITY-ANALYSIS/evidence/`)
- `tied_validate_consistency` after any LEAP stack change
- Verification gate with W4-specific adversarial `run_id`
