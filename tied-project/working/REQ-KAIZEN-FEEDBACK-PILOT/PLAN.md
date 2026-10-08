# REQ-KAIZEN-FEEDBACK-PILOT — Phase 7 plan-new-feature (pre-RED)

**Status:** **Plan complete — pre-RED gate passed (2026-10-07)**. **STOP:** do not run `build-plan` until parent agent delegates implementation.

**Linked program plan:** [`docs/tied-kaizen-feedback-loop-plan.md`](../../../docs/tied-kaizen-feedback-loop-plan.md) (Phase 7 row)

**Prior phase:** [REQ-KAIZEN-OUTCOME-LOOP](../REQ-KAIZEN-OUTCOME-LOOP/PLAN.md) (closed — `c8a84fa`)

**Program orchestrator:** [`kaizen-program-execution-checklist.yaml`](../PLAN-TIED-KAIZEN-FEEDBACK-LOOP/kaizen-program-execution-checklist.yaml) — `current_step: P7-implement` after this pass

**CITDP (working):** [`CITDP-REQ-KAIZEN-FEEDBACK-PILOT.yaml`](./CITDP-REQ-KAIZEN-FEEDBACK-PILOT.yaml)

**Tracker:** [`checklist-tracker.yaml`](./checklist-tracker.yaml)

## Governing decisions

- `depth_tier: integrated`; `gate_policy: advisory` (kaizen program phase_defaults)
- **Module owns:** named pilot cohort, denominator-aware named metrics, stop criteria evaluation, `feedback-pilot.v1` report
- **Leaves alone:** treating pilot volume as methodology change; canonical TIED promotion
- **Promotion rule:** pilot stays analysis evidence until separate sponsor-approved TIED change
- Phase 3 transport **closed** — `notification_overload` and `transport_loss` stop criteria **not_applicable** until hinge reopen

## TIED stack (minted)

| Token | Role |
| --- | --- |
| REQ-KAIZEN-FEEDBACK-PILOT | Phase 7 requirement |
| ARCH-KAIZEN-FEEDBACK-PILOT | Pilot analysis boundary vs methodology promotion |
| IMPL-KAIZEN-FEEDBACK-PILOT | `feedback-kaizen-pilot.ts` + golden fixtures |

Pseudo-code: [`tied-project/implementation-decisions/IMPL-KAIZEN-FEEDBACK-PILOT-pseudocode.md`](../../implementation-decisions/IMPL-KAIZEN-FEEDBACK-PILOT-pseudocode.md)

## Exit evidence (build-plan target)

Fixtures: named metrics with denominators, stop criteria triggered/clear, transport criteria not_applicable, incompatible cohort, promotion_rule on report, store immutability.

## Next session

Run **`build-plan`** for Phase 7 only (`unit-test-red` onward on this tracker). Then **`plan-close-out`** and advance orchestrator to program `EXIT`.
