# Close-out handoff — REQ-WF_TRIAL_MODEL_EFFORT

**Date:** 2026-11-09 · **Plan:** [../PLAN.md](../PLAN.md) · **Full handoff:** [handoff.md](./handoff.md)

## Completion signals

| Signal | Status | Notes |
| --- | --- | --- |
| Machine close_out | pass | [closeout-run-close-out-gates-final.json](./closeout-run-close-out-gates-final.json) → `merged_decision.allowed=true`, envelope `blocking_gap_count=0` |
| Process contract | pass | `--sync-dispositions --reconcile`; process grade **B** / `thin_ledger` advisory |
| Adherence ledger | partial | `legacy_no_adherence_chain` (minimal depth) |

**Upstream feedback:** N/A

## Verification

```bash
node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs
cd mcp-server/packages/agentstream && npm run build && find src -name '*.test.ts' -print0 | xargs -0 npx tsx --test
```

## Traceable commit

**SHA:** `4724dd47`
