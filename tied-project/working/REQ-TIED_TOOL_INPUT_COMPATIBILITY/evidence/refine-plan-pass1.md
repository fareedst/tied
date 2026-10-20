# Refine-plan pass 1 — Native record inputs and QC loop

**Date:** 2026-10-20  
**Prompt type:** refine-plan (Composer 2.5 Fast)  
**Linked plan:** `native_input_qc_loop_feb4ed40.plan.md`  
**Authoritative PLAN:** [../PLAN.md](../PLAN.md)

## Delta vs Luna (plan-new-feature) plan

| Area | Luna plan | Refine pass 1 |
| --- | --- | --- |
| Structure | Single “Design / Implementation / TDD” flow | Split **Refine / Plan / Phases / Implement boundary** with working artifact table |
| Tool inventory | Listed in prose | Explicit **in-scope / out-of-scope** table (`tied_feedback_add.context` excluded) |
| depth_tier | Stated integrated | CITDP + tracker + **adversarial inquiry** + gate receipt at integrated |
| TIED stack | “Create chain” todo | **Minted** REQ/ARCH/IMPL + semantic tokens + validated IMPL sidecar |
| Pseudocode | “Author before tests” | Sidecar written; **`pseudocode_validate` ok: true** (gate mode) |
| Next actor | Implicit | Explicit **`@build-plan`** with phase numbering |
| Provenance | None | [plan-refine-provenance.md](./plan-refine-provenance.md) + JSONL delta log |

## Gates (refine phase)

- **`pre_implementation`:** **`allowed: true`** — `run_id=ntic-refine-preimpl-20261020-r1`, receipt [pre_implementation-2026-10-20T05-43-33-302Z.json](../gates/pre_implementation-2026-10-20T05-43-33-302Z.json).
- **`pseudocode_validate`:** pass — [pseudocode-validate-IMPL-TIED_TOOL_INPUT_NORMALIZATION.json](./pseudocode-validate-IMPL-TIED_TOOL_INPUT_NORMALIZATION.json).
- **`tied_validate_consistency`:** pass (post token mint).
- **Envelope:** [request-evidence-envelope.v1.json](./request-evidence-envelope.v1.json) — integrated identity; **evidence_chain_profile gap** expected until verification (non-blocking for pre_implementation).

## Implement status

**Deferred** — no `mcp-server` product diff in refine pass 1.

## Next step

`@build-plan` linked to [../PLAN.md](../PLAN.md) — Phase 1 RED tests.
