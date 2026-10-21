# Test strategy — REQ-TIED_HARNESS_TRACE_LEARNING_PILOT

**depth_tier:** `minimal`  
**gate_policy:** `advisory`

## refine-plan (planning artifacts)

| Check | Method | Expected |
| --- | --- | --- |
| CITDP + PLAN + Tracker | File presence | Complete through test-strategy |
| IMPL pseudo-code token comments | `pseudocode_validate` `gate_mode` on sidecar | Pass before pre_implementation |
| Plan gate | `tied_checklist_gate_validate` `pre_implementation` | `allowed: true` |

## add-feature / build-plan (Slices A–F)

### Mandatory order

1. **RED:** Add `tools/bootstrap/lib/harness-trace-learning-experiment-charter-doc.test.mjs` (pattern: [pre-handoff-charter-doc.test.mjs](../../../tools/bootstrap/lib/pre-handoff-charter-doc.test.mjs); markers mirror incident-revert corpus + HTOL-specific stop/hypothesis sections).
2. **Slice A:** Author `tied-bundle/docs/harness-trace-learning-experiment-charter.md` until doc test green.
3. **Slice B:** Add `tied-bundle/templates/htol-methodology-learning-experiment.v1.example.yaml` and `htol-feedback-pilot-spec.v1.example.yaml`.
4. **Slice C:** Upsert dogfood experiment via **`tied_methodology_learning_experiment_upsert`**; persist validate/list/enrollment-advisory JSON under `evidence/`.
5. **Slice D:** Run **`tied_feedback_pilot_run`** once; persist `htol-feedback-pilot-report.v1.json`; update outcome observation to **`inconclusive`** or **`not_measured`** only.
6. **Slice E:** Cross-links (HTOL guide Loop 3 section, LangChain Phase 2 row, client-development-index, feedback-to-tied; optional harness-trace-review denominator hint).
7. **Slice F:** Already minted at refine-plan; run **`lint_yaml`** on touched project YAML after upsert.

### test-strategy executable matrix (acceptance)

Charter must include a normative table requiring, for sponsor-run HTOL pilots:

| Field | Required content |
| --- | --- |
| RED command(s) | `node --test tools/bootstrap/lib/harness-trace-learning-experiment-charter-doc.test.mjs` |
| Green command(s) | Same command after charter + templates on disk |
| Verification gate | `tied_checklist_gate_validate` `phase: verification` + receipt under `gates/` |
| Proof line | Model self-check is not sole proof of enrollment or pilot run |

Compose with [harness-trace-observation-loop.md](../../../tied-bundle/docs/harness-trace-observation-loop.md) test-strategy executable matrix.

### Regression boundaries

- No new checklist slugs or gate MCP tools.
- **`tied_feedback_pilot_run`:** analysis evidence only; never auto-promote methodology YAML.
- **`methodology_outcome_observation`:** never **`improved`** / **`regressed`** on implement pass without sponsor-confirmed baseline + countermeasure.
- Default **`compatibility_key`:** `feedback-capture.v1|operator_local` until HTOL-tagged captures exist (`context.denominator_fingerprint: htol-v1` optional slice).

## verification gate

| Check | Method | Expected |
| --- | --- | --- |
| Charter contract | `node --test tools/bootstrap/lib/harness-trace-learning-experiment-charter-doc.test.mjs` | Pass |
| Dogfood row | `tied_methodology_learning_experiment_validate` on `mle-htol-pilot-20261021-001` | Pass |
| TIED graph | `tied_validate_consistency` | Pass |
| Checklist | `tied_checklist_gate_validate` `verification` | `allowed: true` |

## close-out

Deferred until sponsor `/close-out` with envelope sync per [completion-signals-handoff.md](../../../tools/bundled-prompt-type-skills/prompt-shared/completion-signals-handoff.md).
