# Refine-plan pass 2 — close-out planning

**Date:** 2026-10-20  
**Prompt type:** refine-plan  
**Linked plan:** Cursor `hps_req_close-out_a5b032cf.plan.md`  
**Authoritative PLAN:** [../PLAN.md](../PLAN.md)

## Delta vs pass 1 / build-plan

| Area | Before | Refine pass 2 |
| --- | --- | --- |
| **program_phase** | build-plan handoff | **build-plan complete**; close-out section in PLAN |
| **Next actor** | `@build-plan` | **`@close-out`** |
| **Tracker** | Ends at verification-gate | Pending close-out slugs: sync-tied-stack, gitignore-close-out-hygiene, sub-close-out-evidence-sync, traceable-commit |
| **Commit scope** | Unspecified | **HPS wave + Traefik if diff**; exclude EDPC/dogfood/local MCP/visuals and unrelated `.gitignore` |
| **CITDP success** | build-plan only | Added close_out + scoped traceable commit criteria |
| **test-strategy** | build slices only | close-out table (envelope, skip-manifest partial contract) |

## Implement status

**Deferred** — no file edits beyond PLAN/CITDP/tracker/test-strategy/evidence in refine pass 2. Unified close-out runs under `@close-out`.

## Gates (refine pass 2)

- **`pre_implementation`:** **`allowed: true`** — `run_id=hps-refine-pass2-preimpl-20261020-r1`, receipt [pre_implementation-2026-10-21T04-40-13-651Z.json](../gates/pre_implementation-2026-10-21T04-40-13-651Z.json).
- **Verification** receipt unchanged ([verification-2026-10-21T04-34-09-507Z.json](../gates/verification-2026-10-21T04-34-09-507Z.json)).
- **CITDP** synced to `tied-project/citdp/`; tracker + CITDP `lint_yaml` pass.

## Next step

`@close-out` per PLAN **Close-out plan** section and [close-out SKILL](../../../tools/bundled-prompt-type-skills/close-out/SKILL.md).
