# REQ-KAIZEN-REVIEW-BRIDGE — Phase 5 plan-new-feature

**Status:** **pre-RED ready** — TIED stack minted, pseudo-code validated, pre_implementation gate passed; **STOP before build-plan/code**.

**Linked program plan:** [`docs/tied-kaizen-feedback-loop-plan.md`](../../../docs/tied-kaizen-feedback-loop-plan.md) (Phase 5 row)

**Prior phase:** [REQ-KAIZEN-FEEDBACK-ANALYSIS](../REQ-KAIZEN-FEEDBACK-ANALYSIS/PLAN.md) (closed — `b9a092f`)

**Program orchestrator:** [`kaizen-program-execution-checklist.yaml`](../PLAN-TIED-KAIZEN-FEEDBACK-LOOP/kaizen-program-execution-checklist.yaml) — `current_step: P5-initiate`

**CITDP (working):** [`CITDP-REQ-KAIZEN-REVIEW-BRIDGE.yaml`](./CITDP-REQ-KAIZEN-REVIEW-BRIDGE.yaml)

**Tracker:** [`checklist-tracker.yaml`](./checklist-tracker.yaml)

## Governing decisions

- `depth_tier: integrated`; `gate_policy: advisory` (kaizen program phase_defaults)
- Reuses **ARCH-TIED_FEEDBACK_PROMOTION_BOUNDARY** and existing **createReviewedLeapProposal** — no second queue, no automatic canonical YAML write
- Phase 3 transport **closed** — local/export only

## TIED stack (minted)

| Token | Role |
| --- | --- |
| REQ-KAIZEN-REVIEW-BRIDGE | Phase 5 requirement |
| ARCH-KAIZEN-REVIEW-BRIDGE | Digest finding → entry id → review handoff boundary |
| IMPL-KAIZEN-REVIEW-BRIDGE | `feedback-review-bridge.ts` + golden fixtures |

Pseudo-code: [`tied-project/implementation-decisions/IMPL-KAIZEN-REVIEW-BRIDGE-pseudocode.md`](../../implementation-decisions/IMPL-KAIZEN-REVIEW-BRIDGE-pseudocode.md)

## Exit evidence (build-plan target)

Fixtures: review required, reject, approve, canonical-write attempt, stale evidence, proposal link.

## Next session — build-plan

1. `/build-plan` scoped to Phase 5 only — RED `feedback-review-bridge.test.ts` + fixtures, then `feedback-review-bridge.ts`
2. Adversarial inquiry at verification; `tied_verify` and close-out
3. Persist CITDP to `tied-project/citdp/` on close-out
4. Advance orchestrator `P5-implement` → `P5-close` → `P6-initiate`
