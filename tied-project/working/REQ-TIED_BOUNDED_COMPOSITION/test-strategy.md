# Test strategy — REQ-TIED_BOUNDED_COMPOSITION

**Build `depth_tier`:** `integrated` · **Refine-plan analysis gate:** `integrated` eligibility recorded; structural inquiry at build Slice 0 pre-RED · **gate_policy:** `advisory`  
**Authority:** CITDP `test_strategy` + this outline; RED before GREEN per [PROC-TIED_DEV_CYCLE].

## Module matrix (validate independently before composition)

| Module | IMPL token | RED focus |
| --- | --- | --- |
| Pilot budget | `IMPL-TIED_BOUNDED_PILOT_BUDGET` | Closed schema `pilot-budget.v1`; k>0; mode parallel\|sequential; seed/namespace; cost ceiling; stop criteria; invalid k/mode/duplicate namespace; R=4k/P=3k formula field only |
| Trajectory evidence | `IMPL-TIED_BOUNDED_TRAJECTORY_EVIDENCE` | Manifest writer; local `trajectories/` placement via working-root; wrong base path; secret redaction; no raw body in committed envelope artifact |
| Divergence analysis | `IMPL-TIED_BOUNDED_DIVERGENCE_ANALYSIS` | Deterministic contrast rows; identical vs divergent runs; missing provenance; truncation; stale manifest; refuses YAML/finding-ledger writes |
| Lesson distillation | `IMPL-TIED_BOUNDED_LESSON_DISTILLATION` | Draft-only outputs; stale report hash; ineligible input; duplicate suppression; explicit-write refusal without operator bridge |
| Shadow comparison | `IMPL-TIED_BOUNDED_SHADOW_COMPARISON` | Stable anonymization; ties; omission; canary secrets; `selection_authority: none`; budget exhaustion |
| Agentstream seam | `IMPL-TIED_BOUNDED_AGENTSTREAM_SEAM` | Driver contract validation; inject launch/parse/session/errors; dry-run parity; schedule→manifest provenance |

## Composition tests (UI-free)

1. `budget validate → trajectory manifest → envelope gap/discovery` (request-evidence-envelope types).
2. `manifest → divergence report` (read-only).
3. `divergence report → lesson drafts` (no silent feedback write).
4. `manifests → shadow report` (advisory schema).
5. `schedule → injected driver → trajectory manifest` (agentstream-adapter + live-driver-bind).
6. **Gate regression:** shadow/divergence outputs consumed as evidence only; `tied_checklist_gate_validate` disposition unchanged by analyzer modules (fixture Tracker).

## Binding inventory (close-out)

| Seam | Owner IMPL |
| --- | --- |
| budget → capture | PILOT_BUDGET → TRAJECTORY_EVIDENCE |
| capture → envelope | TRAJECTORY_EVIDENCE → REQUEST_EVIDENCE_ENVELOPE |
| manifest → divergence | TRAJECTORY_EVIDENCE → DIVERGENCE_ANALYSIS |
| divergence → lesson draft | DIVERGENCE_ANALYSIS → LESSON_DISTILLATION |
| manifest → shadow | TRAJECTORY_EVIDENCE → SHADOW_COMPARISON |
| schedule → driver | AGENTSTREAM_SEAM |
| driver → provenance | AGENTSTREAM_SEAM → TRAJECTORY_EVIDENCE |

Run `binding_inventory_validate` after Slice 4.

## Fixture categories

| Category | Intent |
| --- | --- |
| Golden budget + manifest | Happy path envelope discovery |
| Secret-bearing trajectory | Redaction + privacy tier failure |
| Divergence traps | Tool order vs outcome vs exit metadata |
| Conformance-only trap | Lesson distiller with missing denominators → honest `not_measured` |
| Shadow authority | Report without required authority fields → schema reject |
| Driver injection | Invalid OEE/descriptor → fail closed |
| Wrong TIED_BASE_PATH | Path-safe IDs refuse cross-project writes |

## Regression

- TypeScript: `npx tsc -b` (repo) after each iteration.
- Existing: `request-evidence-envelope`, `working-root`, `checklist-validator`, `methodology-learning-experiment`, `feature-orchestration/agentstream-adapter`, `@tied/agentstream` harness tests.

## Integrated adversarial inquiry (build-plan)

- Structural pass at Slice 0 pre-RED under `tied-bundle/working/REQ-TIED_BOUNDED_COMPOSITION/adversarial-inquiry/phase-pre_implementation/`.
- Distinct `run_id` for verification and close_out per integrated activation checklist §8.

## Pseudo-code gate

- All six sidecars: Layer C `pseudocode_analyze` with `gate_mode: true` before first RED in build-plan.
