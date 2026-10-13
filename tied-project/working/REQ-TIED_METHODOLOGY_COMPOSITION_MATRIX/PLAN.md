# Refined implementation handoff

## Request

- Token: `REQ-TIED_METHODOLOGY_COMPOSITION_MATRIX`
- Linked Cursor plan: `/Users/fareed/.cursor/plans/methodology_composition_matrix_fd80b58a.plan.md`
- Scope: sponsor-facing documentation only; no production code, generator, MCP resource, or methodology-bundle edits.

## Refine decisions

- `profile_depth: minimal`
- `depth_tier: minimal`
- `gate_policy: advisory`
- `methodology_surface_change_class: none`
- Persisted CITDP: deferred under `tied-bundle/docs/citdp-policy.md`; analysis remains in the linked plan and this committed handoff because no behavior under test changes.
- §1 inventory: exactly **27** rows (19 QMM-expanded + 8 delivery/scaling), one row per `(QMM loop, method)`; enumerated inventory in linked plan refine pass 2 (2026-10-13).
- §2 inventory: exactly 10 rows, one row per adjacent framework with an explicit `Loop(s)` set.
- Dispositions: `Align`, `Defer`, `Tension`, `Gap`, `Composable`, `OutOfScope`.
- TIED mechanism columns are sponsor-owned and remain blank or `_TBD_` in v1.

## Plan and proof boundary

The implementation will add one comparison Markdown file, two bounded cross-links, and project-owned REQ/ARCH/IMPL records. Validation proves row counts, required columns, link resolution, YAML syntax, and TIED traceability. It does not prove external-standard compliance or behavioral equivalence.

## Implement slices

1. Use the TIED YAML tool surface to create the project REQ/ARCH/IMPL records and semantic-token registration.
2. Run the pre-implementation checklist gate with this tracker and the plan’s inline CITDP analysis.
3. Establish row/column/link assertions, then author the matrix Markdown.
4. Add the two comparison-document cross-links.
5. Run Markdown/link checks, `lint_yaml` for each changed project YAML, vocabulary RECORD/VALIDATE, and `tied_validate_consistency`.
6. Complete verification and close-out evidence; prepare a traceable commit without staging or committing it in this workflow.

## Session handoff

[`evidence/session-handoff.md`](evidence/session-handoff.md) — refine pass 2 state, gates, resume steps (2026-10-13).

## Gate (refine pass 2)

- Inline CITDP for gates: `citdp-inline-deferred.yaml` (not persisted under `tied-project/citdp/`).
- Re-run `tied_checklist_gate_validate` with `phase: pre_implementation` after tracker or depth changes.

## Sponsor review boundary

Sponsor review is required before accepting disputed classifications, filling mechanism cells, or promoting this outreach artifact into executable tooling. Those are reversible documentation choices for v1; no costly choice blocks this refinement.
