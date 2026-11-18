# Handoff — start `@build-plan` (REQ-WF_TRIAL_MINIMAL_PROGRESSION_GATE_WAIVER)

**handoff_kind:** phase_snapshot  
**date:** 2026-11-18  
**request_token:** REQ-WF_TRIAL_MINIMAL_PROGRESSION_GATE_WAIVER  
**prompt_type:** refine-plan → build-plan  
**plan_phase:** pre-implementation  

---

## Invocation (new session)

```text
@build-plan
```

**Linked plan:** [../PLAN.md](../PLAN.md)  
**Rolling log:** [session-handoff.md](./session-handoff.md)  
**Test strategy:** [../test-strategy.md](../test-strategy.md)

---

## Plan spine

| Phase | Work |
| --- | --- |
| 1 RED | SC-MPGW-04/05 negatives in `checklist-validator.test.ts`; then SC-MPGW-01..03 phase allow cases |
| 2 GREEN | `validateAdversarialContract` + `tracker` input + waiver predicate; `validateChecklistGate` pass-through |
| 3 RED/GREEN | `checklist-gate-mcp.test.ts` SC-MPGW-06 (minimal CITDP, no fabricated lists) |
| 4 Docs | [wf-trial-checklist-gates-adjunct.md](../../../../tools/bundled-prompt-type-skills/prompt-shared/wf-trial-checklist-gates-adjunct.md) progression waiver paragraph |
| 5 TIED | IMPL pseudo-code sync; `pseudocode_validate`; `tied_validate_consistency` |
| 6 Live (optional) | SC-MPGW-07 gate replay on [1794981051 fixture](./fixture-live-gate-1794981051.md) |

**Proof target:** [verification-live-wf-01-1794981051.md](../REQ-WF_TRIAL_DISPOSABLE_CLOSEOUT_READINESS/evidence/verification-live-wf-01-1794981051.md) — four `missing_*` at verification/close_out.

---

## TIED tokens

| Token | Status | Detail |
| --- | --- | --- |
| REQ-WF_TRIAL_MINIMAL_PROGRESSION_GATE_WAIVER | proposed | [requirements/REQ-WF_TRIAL_MINIMAL_PROGRESSION_GATE_WAIVER.yaml](../../../requirements/REQ-WF_TRIAL_MINIMAL_PROGRESSION_GATE_WAIVER.yaml) |
| ARCH-WF_TRIAL_MINIMAL_PROGRESSION_GATE_WAIVER | proposed | [architecture-decisions/ARCH-WF_TRIAL_MINIMAL_PROGRESSION_GATE_WAIVER.yaml](../../../architecture-decisions/ARCH-WF_TRIAL_MINIMAL_PROGRESSION_GATE_WAIVER.yaml) |
| IMPL-WF_TRIAL_MINIMAL_PROGRESSION_GATE_WAIVER | proposed | [implementation-decisions/IMPL-WF_TRIAL_MINIMAL_PROGRESSION_GATE_WAIVER.yaml](../../../implementation-decisions/IMPL-WF_TRIAL_MINIMAL_PROGRESSION_GATE_WAIVER.yaml) |

**Satisfaction criteria:** SC-MPGW-01 … SC-MPGW-07.

**Depends on:** REQ-WF_TRIAL_DISPOSABLE_CLOSEOUT_READINESS, REQ-TIED_CHECKLIST_GATE_ENFORCEMENT, REQ-WF_TRIAL_MINIMAL_CHECKLIST_PLAYBOOK.

---

## Build commands (locked test-strategy)

```bash
cd mcp-server && npx tsx --test src/checklist-validator.test.ts src/tools/checklist-gate-mcp.test.ts
```

**Rebuild MCP dist** if IDE gate tools must reflect changes before live replay:

```bash
cd mcp-server && npm run build
```

---

## Constraints

- **Surface only** `mcp-server/src/checklist-validator.ts` (+ tests, adjunct doc).
- **No** disposable product `src/` edits.
- Waiver **all phases** at minimal depth when tracker stub present (sponsor locked refine).
- **Do not** weaken integrated / strict_candidate paths.