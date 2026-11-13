# Harness-eval (plan)

**Status:** **M4** regression baselines + replay batch in build; **M3** billing reconciliation built (uncommitted); **M2** pricing, verifiers, cohort report shipped — see [PLAN.md](../../tied-project/working/REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM/PLAN.md).

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

4. Query, verify, or report:

```bash
harness-eval diagnostics --store "$HARNESS_EVAL_STORE"
harness-eval query summary --store "$HARNESS_EVAL_STORE"
harness-eval report cohort --store "$HARNESS_EVAL_STORE"
harness-eval verify trial --trial-id "<id>" --suite docs/demos/harness-eval/suites/engineering-suite-v1.yaml --store "$HARNESS_EVAL_STORE"
```

### Billing reconciliation (M3, opt-in)

Provider invoice or export data is **not** fetched automatically. Import a ledger YAML explicitly:

```bash
harness-eval billing import --ledger docs/demos/harness-eval/billing/sample-ledger-v1.yaml --store "$HARNESS_EVAL_STORE"
harness-eval report reconcile --store "$HARNESS_EVAL_STORE"
```

Sample ledger: [`billing/sample-ledger-v1.yaml`](billing/sample-ledger-v1.yaml). Unknown `trial_id` lines are skipped (not inserted). Omitted cost fields stay `null`.

### Regression baselines and historical replay (M4)

Committed baselines under [`baselines/`](baselines/) compare harness metrics (tokens, wall clock, nullable costs) — not WF facilitator grades. Replay manifests under [`replay/`](replay/) batch-import disposable clients via `importWfClient` (idempotent per path).

```bash
harness-eval regression baseline validate docs/demos/harness-eval/baselines/engineering-suite-v1-baseline.yaml
harness-eval regression compare --baseline docs/demos/harness-eval/baselines/engineering-suite-v1-baseline.yaml \
  --trial-id "<id>" --store "$HARNESS_EVAL_STORE"
harness-eval replay batch --manifest docs/demos/harness-eval/replay/sample-replay-batch-v1.yaml --store "$HARNESS_EVAL_STORE"
```

Map [traditional-workflow-trial-runs-registry](../traditional-workflow-trial-runs-registry.md) **Client ID** → absolute `client_root` in replay YAML manually (or a follow-on LEAP script); M4 does not parse the registry markdown.

List-price catalog (M2): [`pricing/list-price-v1.yaml`](pricing/list-price-v1.yaml). Unknown models keep `harness_estimated_cost` null.

**Proof boundary:** Token and cost metrics here are independent from `@record-wf-trial` session grading and from [project size cohort](../catalog-tied-size-and-trial-statistics.md) tables.

## Suite definitions

Draft suites live under [`suites/`](suites/) (e.g. `engineering-suite-v1.yaml`, **`metering-canary-suite-v1.yaml`** for controlled `wf-meter-01` trials — [REQ-HARNESS_EVAL_METERING_CANARY_WORKFLOW](../../tied-project/working/REQ-HARNESS_EVAL_METERING_CANARY_WORKFLOW/PLAN.md)).

## Implementation package

`mcp-server/packages/harness-eval` (created in `@build-plan`).
