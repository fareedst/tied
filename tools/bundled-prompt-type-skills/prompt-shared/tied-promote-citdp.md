# Plan — promote standalone CITDP (`citdp-promote`)

## Inputs

- **Required:** named CITDP file (`citdp-file:` envelope or invocation remainder naming `CITDP-*.yaml` or `tied-project/citdp/CITDP-*.yaml`).

## Plan

1. Read `tied-bundle/docs/client-development-index.md` first.
2. Load the named CITDP; stop if missing or ambiguous.
3. **Refine promotion scope** — confirm `change_request_id`, desired tokens, and costly-choice approval for any new REQ/ARCH/IMPL slugs before `tied_token_create_with_detail`.
4. Update CITDP `impact_analysis` and `record_identity` when promotion scope differs from the standalone record.
5. Create or update project REQ/ARCH/IMPL via TIED MCP only for tokens listed in CITDP and sponsor-confirmed.
6. Copy a per-task **Tracker** from `tied-bundle/docs/agent-req-implementation-checklist.yaml`.
7. Continue with [tied-plan-citdp-build.md](tied-plan-citdp-build.md) and [tied-implement.md](tied-implement.md) (same gates as `build-plan`).

If a **linked PLAN** markdown exists after promotion, `@build-plan` may execute it; `@citdp-promote` remains the entry when the authoritative artifact is the **CITDP record**.

**Gate:** `tied_checklist_gate_validate` with `phase: pre_implementation` before RED/code. Update CITDP `leap_feedback` when implementation diverges from standalone analysis.

## Forbidden

- Promoting without naming a CITDP file.
- Silent token creation from free-text remainder without CITDP cross-reference and sponsor confirmation.
