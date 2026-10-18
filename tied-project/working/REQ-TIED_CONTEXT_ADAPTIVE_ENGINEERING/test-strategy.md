# Test strategy — REQ-TIED_CONTEXT_ADAPTIVE_ENGINEERING

**depth_tier:** `integrated` · **gate_policy:** `advisory`  
**Authority:** CITDP `test_strategy` + this outline; RED before GREEN per [PROC-TIED_DEV_CYCLE].

## Module matrix (independent validation before composition)

| Module | IMPL token (proposed) | RED focus |
| --- | --- | --- |
| Contract loader/validator | `IMPL-TIED_CONTEXT_ADAPTIVE_CONTRACTS` | Schema version closed; enum checks; prerequisite refs resolve; compatibility DAG acyclic; deterministic sort order; malformed/unknown-field/duplicate-ID/cycle fixtures |
| Context profile validator/normalizer | `IMPL-TIED_CONTEXT_ADAPTIVE_PROFILE` | Dimension enum; evidence refs preserved; unsupported dimension rejected; **UNKNOWN criticality → not LOW** in downstream selector fixture |
| Deterministic selector | `IMPL-TIED_CONTEXT_ADAPTIVE_SELECTOR` | Hard constraints first; applicability; prerequisite/compatibility; stable hash on receipt; rejected candidates with matched rules |
| Reassessment comparator | `IMPL-TIED_CONTEXT_ADAPTIVE_REASSESS` | Immutable prior hash; material change classification; action enum; no in-place receipt mutation |
| Evaluation-link adapter | `IMPL-TIED_CONTEXT_ADAPTIVE_EVAL_LINK` | Maps to CITDP/envelope/quality/learning refs; explicit proof boundary that conformance ≠ effectiveness |

## Composition tests (UI-free, before MCP wiring)

1. Load methodology seed library from bundle path (or test fixture root).
2. `profile validate → select → obligations` happy path.
3. Incompatible practice pair → rejected with rule id.
4. Reassessment increased-risk → `loop_back` or `revise_plan` per pseudo-code.
5. Register four MCP tool names in `tools/index.ts` discovery test; assert EASAR/gate tool list unchanged.

## MCP contract tests

- `context_adaptive_practice_validate` — read-only; returns validation report.
- `context_adaptive_profile_validate` — read-only.
- `context_adaptive_select_practices` — deterministic JSON receipt; optional explicit output path only.
- `context_adaptive_reassess` — compares two profile snapshots + prior receipt.

## Dogfood / pilot (Slice 4)

Fixed EASAR receipt inputs (see [slice0-build-plan-entry.md](./evidence/slice0-build-plan-entry.md)):

- **Baseline arm:** fixed `[PROC-EASAR_RECOVERY]` procedure sequence without selector overlay.
- **Selected arm:** same inputs + rule-selected practice overlay from seed library.
- Metrics: selection overhead, evidence completeness, reassessment count, pairing outcome — **no causal claim**.
- Register methodology-learning experiment + `tied_methodology_conformance_effectiveness_pair`.

## Regression

- `npm run lint:ts --prefix mcp-server`
- Existing: `brownfield-intent-evidence`, `easar-receipts`, `checklist-validator`, `request-evidence-envelope`, `methodology-learning-experiment` test globs.

## Pseudo-code gate

- Layer C `pseudocode_analyze` with `gate_mode: true` on all new/changed IMPL sidecars before first RED.
