# REQ-KAIZEN-OUTCOME-LOOP — Phase 6 plan-new-feature

**Status:** **Close-out complete (2026-10-07)** — integrated `close_out` `run_id=kaizen-p6-close-20261007` (`merged_decision.allowed=true`, envelope `blocking_gap_count=0`); verification `kaizen-p6-verify-20261007` (9/9 tests). Handoff: [plan-close-out-handoff.md](./plan-close-out-handoff.md).

**Linked program plan:** [`docs/tied-kaizen-feedback-loop-plan.md`](../../../docs/tied-kaizen-feedback-loop-plan.md) (Phase 6 row)

**Prior phase:** [REQ-KAIZEN-REVIEW-BRIDGE](../REQ-KAIZEN-REVIEW-BRIDGE/PLAN.md) (closed — `73efd6f`)

**Program orchestrator:** [`kaizen-program-execution-checklist.yaml`](../PLAN-TIED-KAIZEN-FEEDBACK-LOOP/kaizen-program-execution-checklist.yaml) — `current_step: P7-initiate` (Phase 7 not started)

**CITDP (working):** [`CITDP-REQ-KAIZEN-OUTCOME-LOOP.yaml`](./CITDP-REQ-KAIZEN-OUTCOME-LOOP.yaml)

**Tracker:** [`checklist-tracker.yaml`](./checklist-tracker.yaml)

## Governing decisions

- `depth_tier: integrated`; `gate_policy: advisory` (kaizen program phase_defaults)
- **Module owns:** baseline resolution, follow-up window, outcome observation, evidence links, regression routing to **feedback analysis**
- **Leaves alone:** automatic reopen of canonical requirements; Phase 5 review bridge and LEAP queue
- Phase 3 transport **closed** — local append and export only

## TIED stack (minted)

| Token | Role |
| --- | --- |
| REQ-KAIZEN-OUTCOME-LOOP | Phase 6 requirement |
| ARCH-KAIZEN-OUTCOME-LOOP | Outcome observation boundary vs canonical TIED YAML |
| IMPL-KAIZEN-OUTCOME-LOOP | `feedback-outcome-loop.ts` + golden fixtures |

Pseudo-code: [`tied-project/implementation-decisions/IMPL-KAIZEN-OUTCOME-LOOP-pseudocode.md`](../../implementation-decisions/IMPL-KAIZEN-OUTCOME-LOOP-pseudocode.md)

## Exit evidence (build-plan target)

Fixtures: missing baseline, inconclusive, regression routed to analysis, evidence-link integrity, outcome transitions, follow-up window violations, store immutability on project TIED YAML.

## Next session — program Phase 7

Orchestrator advanced to `P7-initiate`. Run **`plan-new-feature`** for Phase 7 pilot only; do not restart Phase 6 unless LEAP scope change requires it.
