# Handoff — start `@build-plan` (REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION)

**handoff_kind:** phase_snapshot  
**date:** 2026-11-18  
**request_token:** REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION  
**prompt_type:** refine-plan → build-plan  
**plan_phase:** pre-implementation  

---

## Invocation (new session)

```text
@build-plan REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION
```

**Linked plan:** [../PLAN.md](../PLAN.md)  
**Rolling log:** [session-handoff.md](./session-handoff.md)  
**Test strategy:** [../test-strategy.md](../test-strategy.md)

---

## Plan spine

| Phase | Work |
| --- | --- |
| 1 RED | `citdp-gate-hydration.test.ts` SC-CGH-01,03,04; composition test SC-CGH-05; MCP `citdp_path` SC-CGH-01/negative |
| 2 GREEN | Implement `citdp-gate-hydration.ts`; wire `gate-check-composition.ts`; optional `tools/index.ts` `citdp_path`; reasons mapping in `gate-check-mcp.ts` |
| 3 GREEN integration | Real `validateChecklistGate` with 4015 fixtures SC-CGH-01..02 (requires MPGW in tree) |
| 4 Docs | `wf-trial-four-phase-close-out-playbook.md` paragraph |
| 5 TIED | Update IMPL status; `pseudocode_validate`; `tied_validate_consistency` |
| 6 Live | SC-CGH-06 replay doc `fixture-live-gate-1794984015.md` |

**Proof target:** product CITDP [fixtures/product-citdp-1794984015.yaml](../fixtures/product-citdp-1794984015.yaml) + [fixtures/disposable-tracker-1794984015.yaml](../fixtures/disposable-tracker-1794984015.yaml).

---

## TIED tokens

| Token | Status | Detail |
| --- | --- | --- |
| REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION | proposed | [requirements/REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION.yaml](../../../requirements/REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION.yaml) |
| ARCH-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION | proposed | [architecture-decisions/ARCH-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION.yaml](../../../architecture-decisions/ARCH-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION.yaml) |
| IMPL-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION | proposed | [implementation-decisions/IMPL-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION.yaml](../../../implementation-decisions/IMPL-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION.yaml) |

**Depends on:** REQ-WF_TRIAL_MINIMAL_PROGRESSION_GATE_WAIVER (built), REQ-TIED_DAE_INCORPORATION, REQ-WF_TRIAL_DISPOSABLE_CLOSEOUT_READINESS.

**CITDP:** [citdp/CITDP-REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION.yaml](../../../citdp/CITDP-REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION.yaml)

---

## Environment

| Variable | Value |
| --- | --- |
| workspace_root | `/Users/fareed/Documents/dev/chatgpt/stdd` |
| TIED_BASE_PATH | `/Users/fareed/Documents/dev/chatgpt/stdd/tied-project` |
| profile_depth / gate_policy | minimal / advisory |

**Verification commands (post-GREEN):**

```bash
cd mcp-server && npx tsx --test src/dae/citdp-gate-hydration.test.ts src/tools/tied-gate-check-mcp.test.ts
```

---

## Locked decisions (do not re-litigate)

1. Hydration **minimal + strict_candidate** only; integrated/missing profile_depth **fail closed**.
2. **No** on-disk product citdp mutation.
3. **`citdp_path`** MCP v1 — mutually exclusive with inline `citdp`.
4. Shared **`adversarialSection`** helper with envelope context (R9).

---

## Do next

1. PRELOAD `tied-project/vocab/` gate / agentstream terms if naming in docs.
2. TDD waves 1–3 per PLAN §3.
3. Write `evidence/phase-handoff-build-plan.md` when GREEN.
4. Sponsor-only: `@close-out` / commit unless requested.