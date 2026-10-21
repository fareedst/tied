# Plan refine provenance — REQ-PSEUDOCODE_VALIDATE_PATH_INPUT

**Pass:** refine-plan 1 · **Date:** 2026-10-21

## Source

- Sponsor thread: `pseudocode_validate` -32602 on token + `pseudocode_path` JSON (HTOL runbook).
- Linked Cursor plan: `validate_path_input_3fea2021.plan.md`
- Skill: `refine-plan` → add-feature recommendation

## Refine deltas (pass 1)

1. **Token regex:** Plan corrected to `^IMPL-[A-Z0-9_-]+$` (hyphenated IMPL tokens).
2. **Non-goal clarified:** No token-only load from IMPL detail `essence_pseudocode_path` (sponsor chose default sidecar only).
3. **CITDP + test-strategy + tracker** materialized under `tied-project/working/REQ-PSEUDOCODE_VALIDATE_PATH_INPUT/`.
4. **Draft IMPL pseudo** in working folder pending token mint at build-plan.
5. **Vocab RECORD** in `tied-yaml-mcp.md` and `pseudocode-and-citdp.md`.
6. **Kaizen capture** (sponsor `/xlate` witness): `feedback_id=fb-mvia5ie8-837apk` — [sponsor-witness-baseline-pseudocode-validate-path.md](./sponsor-witness-baseline-pseudocode-validate-path.md), [kaizen-capture-receipt.json](./kaizen-capture-receipt.json).

## Deferred to build-plan

- TIED token mint (REQ/ARCH/IMPL)
- RED/GREEN mcp-server code
- LEAP REQ-PSEUDOCODE_STATIC_ANALYSIS / IMPL-QUALITY_PSEUDOCODE_VALIDATOR
- `gate-pseudocode-validation`, adversarial inquiry, pre_implementation gate with full activation
