# Methodology surface enrollment (advisory)

## When this applies

Use this **advisory** checklist when a change touches any of these **production-system surfaces** on a methodology learning experiment record:

- `prompt_type_workflow` (leaf prompt type id in `surface_ref`)
- `gate_policy` (CITDP gate-policy evolution)
- `assurance_profile` (assurance profile selection for a methodology-surface change)

`checklist_step` surfaces follow the existing checklist PDSA path; enrollment `surface_ref` rules do not apply there.

This prose does **not** replace the per-request **Tracker**, **CITDP**, or `tied_checklist_gate_validate`. W2 pairing remains **CITDP-scoped** only (`methodology_surface_experiment_link`); there is no global gate hook for all prompt-type edits.

## Operator sequence (Loop 3 PDSA envelope)

1. **Hypothesis** — state what you expect to learn or improve on the surface.
2. **Experiment record** — upsert a `methodology-learning-experiment.v1` record with the correct `production_system_surface` and non-empty `surface_ref` when required.
3. **Machine assist (optional)** — call `tied_methodology_production_system_enrollment_validate` to check structural + enrollment rules (read-only; no store writes).
4. **Conformance refs** — attach typed conformance evidence refs on the linked CITDP when `methodology_surface_experiment_link` is present.
5. **Outcome observation** — record `methodology_outcome_observation` before verification/close_out when conformance refs exist (compose W2 pairing; avoid conformance-only trap).
6. **Pairing** — run W2 pairing disposition on the linked CITDP before claiming verification success when linkage is declared.

## Proof boundary

Enrollment validation reports **structural enrollment completeness only**. It does **not** prove methodology effectiveness, gate correctness, or pairing disposition by itself.
