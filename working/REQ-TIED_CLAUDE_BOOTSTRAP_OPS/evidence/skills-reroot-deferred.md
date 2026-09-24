# CONFIG_SKILLS_REROOT deferral (B3)

**REQ:** REQ-TIED_CLAUDE_BOOTSTRAP_OPS  
**Block:** CONFIG_SKILLS_REROOT  
**Date (original deferral):** 2026-09-23 (build-plan B2–B5)  
**Date (LEAP pass):** 2026-09-24 (R2 — remainder doc hygiene)

## Disposition

**Deferred** — not implemented in this slice.

## Rationale

- **Windows copy proof is satisfied:** `WINDOWS_COPY_PROVEN_IN_CI` / `windows_copy_proven_in_ci` is **true** in repo ([`tools/bootstrap/lib/constants.mjs`](../../../tools/bootstrap/lib/constants.mjs); green CI run **36031010940** in [`windows-claude-smoke-proof.md`](windows-claude-smoke-proof.md)). This satisfies the IMPL PRE gate for *enabling* repo-root `skills/` re-root; it does **not** implement B3.
- **Close-out disposition:** REQ-TIED_CLAUDE_BOOTSTRAP_OPS close-out kept CONFIG_SKILLS_REROOT (B3) on the deferred list. Proof alone does not reopen or auto-merge re-root.
- **Sponsor policy:** No default-on repo-root `skills/` re-root; re-root requires an explicit scoped program (new REQ), not a flag flip.
- **Implementation gap:** B3 still needs RED dual-harness install paths + Windows asserts per bootstrap ops CITDP — out of scope for the closed B2–B5 slice.

## Follow-up

Implement optional repo-root `skills/` re-root via remainder program **R3** in [`working/REQ-TIED_CLAUDE_DOC_REMAINDER/PLAN.md`](../../REQ-TIED_CLAUDE_DOC_REMAINDER/PLAN.md): **`plan-new-feature`** (e.g. dedicated REQ token) → **`build-plan`** with RED dual-harness + Windows asserts; not default-on.

Broader closed-REQ metadata LEAP (REQ/CITDP/CHANGELOG vs proof flag) is **R4** ([`working/REFINE-DUAL_REQ_CLOSE_OUT/`](../../REFINE-DUAL_REQ_CLOSE_OUT/)).
