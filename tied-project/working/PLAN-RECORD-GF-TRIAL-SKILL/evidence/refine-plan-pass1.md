# Refine-plan pass 1 — PLAN-RECORD-GF-TRIAL-SKILL

**Date:** 2026-10-24  
**Prompt type:** refine-plan  
**Linked plan:** `record-gf-trial_skill_3118d76f.plan.md`  
**Authoritative PLAN:** [../PLAN.md](../PLAN.md)

## Delta vs initial Cursor plan

| Area | Initial plan | Refine pass 1 |
| --- | --- | --- |
| TIED tracking | Skill bundle only | **CITDP + Tracker** under `tied-project/working/PLAN-RECORD-GF-TRIAL-SKILL/` |
| Install mechanism | Hardcoded in mjs | **`STORE_FACILITATOR_SKILLS`** manifest key (parallel to standalone list) |
| Self-install guard | `--allow-self-install` mention | **`path.resolve(projectRoot) === path.resolve(storeRoot)`** before stub install |
| Idempotency | Mentioned in verification | **Default stop** without `--force` when readout exists — locked costly/reversible table |
| Traceability | No REQ v1 | **LEAP** extend [REQ-TIED_CLIENT_BOOTSTRAP_SKILLS](../../requirements/REQ-TIED_CLIENT_BOOTSTRAP_SKILLS.yaml) / IMPL pseudo-code; vocab **RECORD** in `project-operations-mcp.md` |
| Test strategy | Single bootstrap test | **RED-first** `store-facilitator-skills.test.mjs` + **regression** on five standalone skills |
| Full install mode | skills-linked only | Plan includes **`installSkillsFull`** hook for store self-install parity |

## Plan process tools (DAE + BBCE)

| Check | Result |
| --- | --- |
| `tied-project/config.yaml` `dae.crap_threshold` | CRAP adjunct inactive (bootstrap diff scope TBD at implement) |
| BBCE | **not_applicable** — bootstrap + docs |
| JEV plan-skills | Advisory per config |

## Gates (refine phase)

- **`tied_gate_check` `pre_implementation`** (2026-10-24): **`allowed: false`**, `reasons: [gate_blocked]`, `receipt_path: null` — minimal Tracker (not full checklist copy from `agent-req-implementation-checklist.yaml`); CITDP lives in **working/** until post-implement persist decision.
- **Handoff to `@build-plan`:** Proceed with **RED test file first** and expand Tracker `completed` slugs as implement phases finish (`pseudo-code-validation`, `module-validation`, etc.) per [agent-req-implementation-checklist.yaml](../../../tied-bundle/docs/agent-req-implementation-checklist.yaml). Re-run gate at **verification** before close-out claims.

## Implement status

**Deferred** — no bundled skill tree or bootstrap code in refine pass 1.

## Next step

`@build-plan` linked to [../PLAN.md](../PLAN.md) — Phase 1 RED test + manifest, Phase 2 skill bundle + bootstrap hook, Phase 3 docs + LEAP + vocab.
