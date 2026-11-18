# Session handoff — dave-farley-spec-must-be-executable-vs-tied

**Track:** non-tied-refine → **non-tied-build complete** → optional `@non-tied-close`  
**Depth:** `depth_tier: minimal`, `gate_policy: advisory`, `profile_depth: not_measured`

## Plan spine

Linked plan: [`../PLAN.md`](../PLAN.md).

## Plan execution steps

All PLAN build steps complete (2026-11-17).

### Required (`@non-tied-build`)

- [x] `plan-folder` — non-tied-plans package refined (PLAN, CITDP, test-strategy)
- [x] `receipt` — `tied-project/working/DOC-FARLEY-EXECUTABLE-SPEC-COMPARISON/evidence/url-fetch-receipt.md` (themes only)
- [x] `wave1-stub` — `docs/comparisons/dave-farley-spec-must-be-executable.md`
- [x] `draft-wave2` — 14-section `docs/comparisons/dave-farley-spec-must-be-executable-vs-tied-agent-management.md`
- [x] `backlink-capture` — Wave 1 ↔ Wave 2 sibling links
- [x] `allowlist` — `.gitignore` negation rules (two paths)
- [x] `consistency-pass` — claim labels; stub marker; no token mint in comparison bodies
- [x] `verify-local` — section parity + label grep (2026-11-17)

### Optional

- [x] `examples-row` — `tools/bundled-prompt-type-skills/external-service-comparison/examples.md`
- [ ] `matrix-sibling-line` — `docs/comparisons/methodology-composition-matrix.md` header (**Defer**)
- [x] `sibling-backlink` — AI-SDLC factory **Distinct from** row

## Deliverables (paths)

| Artifact | Path |
| --- | --- |
| Wave 1 stub | `docs/comparisons/dave-farley-spec-must-be-executable.md` |
| Wave 2 analysis | `docs/comparisons/dave-farley-spec-must-be-executable-vs-tied-agent-management.md` |
| Plan | `tied-project/non-tied-plans/dave-farley-spec-must-be-executable-vs-tied/PLAN.md` |
| CITDP draft | `tied-project/non-tied-plans/dave-farley-spec-must-be-executable-vs-tied/CITDP-dave-farley-spec-must-be-executable-vs-tied.yaml` |
| DOC working | `tied-project/working/DOC-FARLEY-EXECUTABLE-SPEC-COMPARISON/` |

## Verification notes

- Wave 2: 14 body sections per external-service-comparison reference (Executive summary through Related documents).
- Metadata: **reference only; no REQ mint**.
- No LinkedIn article body in committed paths.
- Matrix §2 new row: **Defer**.

## Next step

**non-tied-close** complete (2026-11-17): scoped traceable commit recorded in `evidence/traceable-commit-evidence.md`.

## Forbidden completed

No project REQ/ARCH/IMPL writes; Farley course outcomes not cited as TIED proof.

## Changelog (this slug)

| Date | prompt_type | Summary |
| --- | --- | --- |
| 2026-11-17 | non-tied-refine | Initial PLAN, CITDP, test-strategy, session-handoff |
| 2026-11-17 | non-tied-build | Wave 1–2 docs, DOC working, allowlist, examples row, AI-SDLC sibling backlink |
| 2026-11-17 | non-tied-close | Scoped traceable commit; scope in traceable-commit-evidence.md |