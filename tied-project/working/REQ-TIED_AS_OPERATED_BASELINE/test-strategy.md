# Test strategy — [REQ-TIED_AS_OPERATED_BASELINE]

**Refined:** 2026-11-18 (`@refine-plan`)  
**Plan:** [PLAN.md](./PLAN.md) · **CITDP:** [CITDP-REQ-TIED_AS_OPERATED_BASELINE.draft.yaml](./CITDP-REQ-TIED_AS_OPERATED_BASELINE.draft.yaml)

---

## Scope

Unit and composition tests for checklist **facet** `as_operated_baseline` only. No RED for runbook content generation, EDPC MCP, or RDB registry authoring automation in v1.

---

## Fixtures

**Root:** `mcp-server/test/fixtures/as-operated-baseline/`

| Fixture | Purpose |
| --- | --- |
| `tracker-follow-up-only.yaml` | `mode: follow_up_only` — snapshot dirs may be absent; gates pass |
| `tracker-active-missing-snapshot.yaml` | `mode: active`, empty `replacement-discovery/` — **fail** at composition-integration |
| `tree-snapshot-a-minimal/` | Meets Snapshot-A counts from PLAN |
| `tree-snapshot-b-dogfood-stub/` | Trimmed copy of DOC-TIED-RDB-ANALYSIS layout for golden minimum checker (build-plan copies or symlinks) |

**Receipt golden:** `expected-composition-receipt.v1.json`, `expected-preverify-receipt.v1.json` (hashes optional v1).

---

## RED matrix — `checklist-validator.test.ts`

| Test name pattern | Assert |
| --- | --- |
| `as_operated_baseline follow_up_only skips snapshot enforcement` | `composition-integration` + `verification-gate` allowed without RDB tree |
| `as_operated_baseline active blocks composition-integration without Snapshot-A` | Diagnostic includes `missing_snapshot_composition_integration` |
| `as_operated_baseline active allows composition-integration with Snapshot-A` | OK when tree + receipt present |
| `as_operated_baseline active blocks verification-gate without Snapshot-B` | Diagnostic includes `missing_snapshot_pre_verification` |
| `as_operated_baseline active allows verification-gate with Snapshot-B` | OK when G-0–G-7/G-9 minimum counts satisfied |
| `as_operated_baseline rejects invalid mode` | Unknown mode fails closed |
| `as_operated_baseline forbids phase 8 gate token in tracker` | If tracker sets `replacement_phase: 8`, diagnostic (optional v1.1) |

Implementation detail deferred to IMPL pseudo-code; tests written **before** production facet code per `[PROC-TIED_DEV_CYCLE]`.

---

## Snapshot minimum checker (unit)

**Module (proposed):** `mcp-server/src/as-operated-baseline/snapshot-minimums.ts`

| Function | PRE | POST |
| --- | --- | --- |
| `validateSnapshotA(root)` | `root` is directory | Returns `{ ok, diagnostics[], gate_scores: { G0, G2partial, G4partial } }` |
| `validateSnapshotB(root)` | `root` is directory | Returns `{ ok, diagnostics[], gates: G0..G7, G9 }` aligned to parent program table |

Counts use the same numeric thresholds as [replacement-discovery-baseline/PLAN.md](../../non-tied-plans/replacement-discovery-baseline/PLAN.md) for Snapshot-B; Snapshot-A uses PLAN partial table.

---

## Composition

| Test | Assert |
| --- | --- |
| `checklist-validator` integration | `tied_checklist_gate_validate` path loads tracker with facet from fixture YAML |
| No mutation | No test or code path calls `yaml_index_update` when validating snapshots |

---

## Manual / dogfood

| Step | Owner |
| --- | --- |
| Re-run store dogfood receipt paths | Optional regression: DOC-TIED-RDB-ANALYSIS tree satisfies Snapshot-B |
| Sponsor review | Confirm `active` default for store docs vs client `follow_up_only` |

---

## command_seq (verification evidence, build-plan)

```bash
npm run lint:ts --prefix mcp-server
node --test mcp-server/dist/checklist-validator.test.js --test-name-pattern 'as_operated_baseline'
```

---

## Out of scope (v1)

- E2E agentstream turn that authors full RDB phase reports
- MCP tool to upsert registry YAML
- Formal diff between VRAI indexes and RDB registries (EDPC/BFIE compose track)