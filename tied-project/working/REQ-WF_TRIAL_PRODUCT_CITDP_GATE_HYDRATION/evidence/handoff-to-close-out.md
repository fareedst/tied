# Handoff → `@close-out` (REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION)

**handoff_kind:** session  
**date:** 2026-11-18  
**request_token:** REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION  
**prompt_type:** close-out  
**plan_phase:** verification  

---

## Copy-paste (new session)

```text
@close-out REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION
Handoff: tied-project/working/REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION/evidence/handoff-to-close-out.md
Linked plan: tied-project/working/REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION/PLAN.md
```

---

## What this REQ was for (add-feature intent)

**Problem (pre-CGH):** WF disposable **product** `citdp.v1` files use `profile_depth: minimal` and **no** `risk_analysis.adversarial_inquiry`. Turn 3 agents pass **inline** gate-shaped CITDP; turn 4 **`tied_gate_check`** loads **`tied-project/citdp/CITDP-{product}.yaml`** → **`malformed_citdp:adversarial_inquiry`**, blocking machine close-out even when **MPGW** list waivers ship.

**Fix (CGH):** Validation-only **hydration** at `runGateCheckComposition` and `tied_checklist_gate_validate` (`citdp_path` + inline body) synthesizes `risk_analysis.adversarial_inquiry` for **minimal** / **strict_candidate** only. On-disk product YAML unchanged.

**Workflow arc:** Cursor add-feature plan → refine-plan (tokens + fixtures) → build-plan (mcp-server) → post-build refine LEAP → **this close-out**.

---

## Gap status after ship

| Gap | Status | Evidence |
| --- | --- | --- |
| Path-based `tied_gate_check` + product citdp → `malformed_citdp` | **Fixed** | Store tests SC-CGH-01..06; [sc-cgh-06-live-replay.md](./sc-cgh-06-live-replay.md) |
| Live WF-01 disposable (post-deploy MCP) | **Confirmed** | Live cell **1795014853** — see [live-wf-proof-1795014853.md](./live-wf-proof-1795014853.md) |
| Orchestrator `verification_handoff_without_receipt` | **Out of scope** | Machine closeout hygiene ([REQ-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT](../../REQ-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT/PLAN.md)); not CGH |

---

## Store close-out checklist

### Machine (methodology REQ)

| Step | Command / artifact |
| --- | --- |
| Tests | `cd mcp-server && npx tsx --test src/dae/citdp-gate-hydration.test.ts src/tools/tied-gate-check-mcp.test.ts` |
| Fixture replay | `cd mcp-server && npm run build` then `node tied-project/working/REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION/evidence/sc-cgh-06-replay.mjs` |
| TypeScript | `cd mcp-server && npx tsc -p tsconfig.json --noEmit` |
| TIED consistency | `tied_validate_consistency` (project scope) |

### Tracker ([../checklist-tracker.yaml](../checklist-tracker.yaml))

Mark **verification-gate** complete when bootstrap commands above green; **traceable-commit** on sponsor commit only.

### Scope boundary (do not expand in this close-out)

- No change to disposable agent obligation to persist **`gates/verification-*.json`** (separate playbook / future REQ).
- No envelope `depthFromRecord` LEAP.

---

## Files touched (store)

| Area | Paths |
| --- | --- |
| Core | `mcp-server/src/citdp-adversarial-shape.ts`, `mcp-server/src/dae/citdp-gate-hydration.ts`, `gate-check-composition.ts`, `tools/index.ts`, `citdp-envelope-context.ts` |
| Tests | `citdp-gate-hydration.test.ts`, `tied-gate-check-mcp.test.ts` |
| Docs | `tools/bundled-prompt-type-skills/prompt-shared/wf-trial-four-phase-close-out-playbook.md` |
| TIED | `tied-project/requirements|architecture-decisions|implementation-decisions/*PRODUCT_CITDP_GATE_HYDRATION*` |

---

## Sponsor decisions (frozen)

R1–R10 in [PLAN.md](../PLAN.md). **Do not** reopen hydration for `integrated` product citdp without adversarial section.

---

## Related refs

| Doc | Path |
| --- | --- |
| Session log | [session-handoff.md](./session-handoff.md) |
| Build | [phase-handoff-build-plan.md](./phase-handoff-build-plan.md) |
| MPGW sibling | [REQ-WF_TRIAL_MINIMAL_PROGRESSION_GATE_WAIVER](../REQ-WF_TRIAL_MINIMAL_PROGRESSION_GATE_WAIVER/PLAN.md) |
| Pre-fix class | Clients **1794981051** / **1794984015** (fixture sources) |