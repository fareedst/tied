# Harness-eval (plan)

**Status:** M1 build-plan GREEN — see [PLAN.md](../../tied-project/working/REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM/PLAN.md).

Repeatable measurement for **Cursor Agent CLI** and **Claude Code CLI** stream-json telemetry, composed with existing [workflow trials](../catalog-traditional-workflow-trial-prompts.md) without replacing `workflow_trial_agentstream`.

## Planned operator flow (M1)

1. Run a disposable WF trial as today (`workflow_trial_agentstream wf-NN`).
2. Optionally capture agent stream-json paths (not persisted by agentstream by default).
3. Import into the eval store:

```bash
export HARNESS_EVAL_STORE="${TIED_STORE_ROOT}/tied-bundle/reports/harness-eval"
harness-eval events import --wf-client "/path/to/disposable-client" \
  --trial-id "$(basename /path/to/disposable-client)"
# Optional: --jsonl /path/to/capture.jsonl (repeatable)
```

4. Query or export normalized trials:

```bash
harness-eval diagnostics --store "$HARNESS_EVAL_STORE"
```

**Proof boundary:** Token and cost metrics here are independent from `@record-wf-trial` session grading and from [project size cohort](../catalog-tied-size-and-trial-statistics.md) tables.

## Suite definitions

Draft suites live under [`suites/`](suites/) (e.g. `engineering-suite-v1.yaml`, **`metering-canary-suite-v1.yaml`** for controlled `wf-meter-01` trials — [REQ-HARNESS_EVAL_METERING_CANARY_WORKFLOW](../../tied-project/working/REQ-HARNESS_EVAL_METERING_CANARY_WORKFLOW/PLAN.md)).

## Implementation package

`mcp-server/packages/harness-eval` (created in `@build-plan`).
