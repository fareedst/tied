# Handoff — start `@close-out` (REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION)

**handoff_kind:** phase_snapshot  
**date:** 2026-11-18  
**request_token:** REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION  
**prompt_type:** refine-plan → close-out  
**plan_phase:** verification  

---

## Invocation

```text
@close-out REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION
```

**Linked plan:** [../PLAN.md](../PLAN.md)  
**Session log:** [session-handoff.md](./session-handoff.md)  
**Build evidence:** [phase-handoff-build-plan.md](./phase-handoff-build-plan.md)

---

## Machine verification (bootstrap)

| Check | Command / artifact |
| --- | --- |
| Unit + MCP | `cd mcp-server && npx tsx --test src/dae/citdp-gate-hydration.test.ts src/tools/tied-gate-check-mcp.test.ts` |
| SC-CGH-06 | `node tied-project/working/REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION/evidence/sc-cgh-06-replay.mjs` (after `npm run build` in `mcp-server/`) |
| TypeScript | `cd mcp-server && npx tsc -p tsconfig.json --noEmit` |

---

## TIED tokens

| Token | Detail |
| --- | --- |
| REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION | [requirements/](../../../requirements/REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION.yaml) |
| IMPL | `in_progress` → promote on `tied_verify` when sponsor closes |

---

## Close-out scope

- Store methodology REQ only (no disposable product `src/`).
- Run `sub-close-out-evidence-sync` / verification gate per playbook if tracker steps require.
- Sponsor-only **traceable commit** when requested.

---

## Locked (do not reopen)

Minimal + strict_candidate hydration only; validation-only clone; `citdp_path` mutual exclusion; shared `citdp-adversarial-shape.ts`.

## Live external proof (optional grade)

[live-wf-proof-1795014853.md](./live-wf-proof-1795014853.md) — disposable **1795014853**; close_out **`allowed: true`** on product `citdp_path` (no `malformed_citdp`).

## Canonical handoff

Prefer **[handoff-to-close-out.md](./handoff-to-close-out.md)** for copy-paste and gap narrative.

## Do next

Execute close-out checklist; sponsor **traceable commit** when requested (store `stdd` only).