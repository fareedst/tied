# Test strategy — REQ-TIED_PROCESS_CERTIFICATION_READINESS

**Build `depth_tier`:** `integrated` · **Refine-plan gate `depth_tier`:** `minimal` · **gate_policy:** `advisory`  
**Authority:** CITDP `test_strategy` + this outline; RED before GREEN per [PROC-TIED_DEV_CYCLE].

## Module matrix (validate independently before composition)

| Module | IMPL token | RED focus |
| --- | --- | --- |
| Spec load / validate | `IMPL-TIED_PROCESS_CERTIFICATION_SPEC` | Schema closed; version/hash pinning; EDSE-001…007 required; duplicate/missing/stale clause IDs; mapping `reference_mapping_only`; forbidden aggregate score keys on capability model |
| Clause conformance | `IMPL-TIED_PROCESS_CERTIFICATION_CONFORMANCE` | Catalog resolves validator + evidence kind + TIED surface; deterministic matrix; negative: incomplete evidence, wrong evidence kind, stale spec hash |
| Capability profile | `IMPL-TIED_PROCESS_CERTIFICATION_CAPABILITY` | Seven dimensions each emitted; dimension failure isolated; no rollup field; evaluator/limitation/proof_boundary on every row |
| Independent assessment | `IMPL-TIED_PROCESS_CERTIFICATION_INDEPENDENT` | **C2:** file-based `independent-assessment-record.v1` load/validate; independence rules; insufficient independence rejected; agreement/disagreement deterministic ordering |
| Adaptive experiment | `IMPL-TIED_PROCESS_CERTIFICATION_ADAPTIVE` | **C1:** fixture-grounded fixed vs rule-selected vs adaptive arms (CASE/EASAR receipt fixtures); context perturbation changes selection receipt; held-out case retains provenance; stop criteria / underpowered input failures; no live operator run path in v1 |
| Readiness report compose | `IMPL-TIED_PROCESS_CERTIFICATION_REPORT` | Layer separation (conformance ≠ capability ≠ adaptive); `ready_for_external_appraisal` only when declared conditions pass; never emits `certified` |

## Composition tests (UI-free, before MCP wiring)

1. Load bundle resources from `tied-bundle/resources/process-certification/` (or fixture root).
2. `spec validate → conformance → capability` on golden process record fixture.
3. Compose readiness from existing gate/envelope/CASE/adversarial fixture paths (read-only).
4. Register MCP tool names in `tools/index.ts` discovery test; regression: context-adaptive and easar tool lists unchanged.
5. Request-evidence-envelope discovery includes new artifact types with phase links and content hashes.
6. CLI `tied certification readiness` dispatches to same handlers as MCP (no second authority).

## Fixture categories

| Category | Intent |
| --- | --- |
| Positive golden | All seven clauses pass; all seven capability dimensions reported |
| Conformance-only trap | Conformance pass while capability fails—readiness headline must not over-claim |
| Mapping abuse | Invalid 12207 ref or missing `reference_mapping_only` |
| Independence | Shared implementer/assessor identity; missing attestation |
| Disagreement | Two assessors conflict on material finding |
| Determinism | Same inputs → identical report hash |
| Adaptive | Perturbation changes receipt; held-out path present; no superiority language in output |
| Proof boundary | Report JSON schema rejects `certified`, `iso_compliant`, `maturity_score` |

## Regression

- `npm run lint:ts --prefix mcp-server`
- Existing: `context-adaptive`, `checklist-validator`, `request-evidence-envelope`, `methodology-learning-experiment`, `pairConformanceEffectiveness` test globs.

## Pseudo-code gate

- Layer C `pseudocode_analyze` with `gate_mode: true` on all new/changed IMPL sidecars before first RED in build-plan.

## Integrated adversarial inquiry (build-plan)

- Structural `sub-adversarial-inquiry-pass` at Slice 0 with four artifacts under `tied-bundle/working/REQ-TIED_PROCESS_CERTIFICATION_READINESS/adversarial-inquiry/phase-pre_implementation/`.
- Verification and close_out runs with distinct `run_id` per [integrated-activation-checklist-enforcement-plan.md](../../../docs/integrated-activation-checklist-enforcement-plan.md) §8.
