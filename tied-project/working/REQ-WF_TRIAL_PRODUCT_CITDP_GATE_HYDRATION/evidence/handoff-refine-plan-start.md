# Handoff — start `@refine-plan` (REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION)

**handoff_kind:** phase_snapshot  
**date:** 2026-11-18  
**request_token:** REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION  
**prompt_type:** add-feature → refine-plan  
**plan_phase:** pre-implementation (complete after this session)

---

## Invocation source

```text
@refine-plan REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION
Handoff: tied-project/working/REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION/evidence/handoff-refine-plan-start.md
Cursor plan: .cursor/plans/product_citdp_gate_hydration_fa5eaad0.plan.md
```

## Intent

Bridge **WF product** `citdp.v1` (`profile_depth: minimal`, no `adversarial_inquiry`) into **checklist-shaped** gate input at **`runGateCheckComposition`** so **`tied_gate_check`** close-out works with **MPGW** on path-based gates. Live proof: **1794984015** — inline citdp passes; product file → `malformed_citdp:adversarial_inquiry`.

## Sponsor-locked

- Hydrate **only** `profile_depth: minimal` or **strict_candidate**; **integrated / missing profile_depth → fail closed**
- **Validation-only** clone — no silent on-disk rewrite
- Existing `adversarial_inquiry` → **no-op**
- Receipt hashes use **hydrated** citdp at validate time

## Refine exit (target)

- [x] REQ / ARCH / IMPL minted via TIED MCP
- [x] `PLAN.md`, `test-strategy.md`, tracker, CITDP draft
- [x] IMPL pseudo-code sidecar
- [x] Fixtures from 1794984015
- [x] Open items O1–O4 locked in PLAN
- [x] `handoff-build-plan-start.md` for `@build-plan`

## Do next

**`@build-plan`** with [handoff-build-plan-start.md](./handoff-build-plan-start.md).