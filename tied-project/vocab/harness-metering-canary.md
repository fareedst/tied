# Harness metering canary workflow (canonical)

**Scope:** Controlled four-phase disposable trials for calibrating harness-eval imports during HMEP development (`wf-meter-01`, lite metering catalog, optional facilitator readout boundary).

**Traceability:** [REQ-HARNESS_EVAL_METERING_CANARY_WORKFLOW](../requirements/REQ-HARNESS_EVAL_METERING_CANARY_WORKFLOW.yaml) · [ARCH-HARNESS_EVAL_METERING_CANARY_WORKFLOW](../architecture-decisions/ARCH-HARNESS_EVAL_METERING_CANARY_WORKFLOW.yaml) · [IMPL-HARNESS_EVAL_METERING_CANARY_WORKFLOW](../implementation-decisions/IMPL-HARNESS_EVAL_METERING_CANARY_WORKFLOW.yaml) · [REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM](../requirements/REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM.yaml)

**See also:** [`routing.md`](routing.md) (row **2c**) · [`domain-references.md`](domain-references.md) · [`harness-model-eval.md`](harness-model-eval.md) · [`agentstream.md`](agentstream.md) · [PLAN.md](../working/REQ-HARNESS_EVAL_METERING_CANARY_WORKFLOW/PLAN.md) · [`catalog-harness-metering-lite-workflow.md`](../../docs/demos/catalog-harness-metering-lite-workflow.md)

---

## Canonical terms

| Preferred term | Meaning |
| --- | --- |
| **metering canary** | `workflow_trial_agentstream wf-meter-01` run with minimal GREEN product scope for HMEP calibration. |
| **PROMPT-WF-METER-01** | Catalog remainder token under `docs/demos/catalog-harness-metering-lite-workflow.md`. |
| **metering-canary-suite-v1** | Harness-eval suite YAML scenario id `wf-meter-01`. |
| **D-PROOF-BOUNDARY-CANARY** | Token metrics via harness-eval; `@record-wf-trial` grading remains optional and outside HMEP M1 proof. |
| **wf-meter-01** | Workflow trial profile key for the metering canary disposable client fixture. |
| **controlled workflow fixture** | Disposable four-phase client scoped to metering import smoke, not full product REQ surface. |

## Boundaries

- Canary runs prove **import and store shape**; they do not certify methodology effectiveness or WF session grades.
- **manifest-only import** may apply when stream-json is absent; see [`harness-model-eval.md`](harness-model-eval.md).

## Alphabetical index

| Term | Section |
| --- | --- |
| controlled workflow fixture | Canonical terms |
| D-PROOF-BOUNDARY-CANARY | Canonical terms |
| metering canary | Canonical terms |
| metering-canary-suite-v1 | Canonical terms |
| PROMPT-WF-METER-01 | Canonical terms |
| wf-meter-01 | Canonical terms |
