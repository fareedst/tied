# Session handoff — PLAN-HTOL-PILOT-COHORT-RUNBOOK

**Date:** 2026-10-21  
**REQ:** REQ-TIED_HTOL_PILOT_COHORT_RUNBOOK (Implemented — doc + test)

---

## Shipped this session

| Artifact | Path |
| --- | --- |
| Cohort runbook | [htol-pilot-cohort-runbook.md](../../../tied-bundle/docs/htol-pilot-cohort-runbook.md) |
| Instance template | [htol-pilot-cohort-runbook-instance.v1.example.yaml](../../../tied-bundle/templates/htol-pilot-cohort-runbook-instance.v1.example.yaml) |
| Bootstrap test | [htol-pilot-cohort-runbook-doc.test.mjs](../../../tools/bootstrap/lib/htol-pilot-cohort-runbook-doc.test.mjs) |
| Cross-links | Charter § Operator sequence; [harness-trace-observation-loop.md](../../../tied-bundle/docs/harness-trace-observation-loop.md) Loop 3 |
| TIED stack | REQ/ARCH/IMPL + CITDP + Tracker under `working/REQ-TIED_HTOL_PILOT_COHORT_RUNBOOK/` |

**Test:** `node --test tools/bootstrap/lib/htol-pilot-cohort-runbook-doc.test.mjs` — green.

---

## Completion signals

| Signal | Status |
| --- | --- |
| Machine close-out | **not_run** — sponsor did not request commit/`/close-out` |
| Process contract | **complete** for doc feature (runbook + test + traceability) |
| Adherence ledger | **not_run** until real cohort captures |

---

## Do next (optional)

1. **`/close-out`** when sponsor wants traceable commit.
2. **Real cohort:** new `experiment_id`, `@harness-trace-review`, captures with **`context.denominator_fingerprint: htol-v1`**, **`tied_feedback_pilot_run`** per runbook.
3. LangSmith export compose optional when keys exist — not required for cohort.

---

## Blockers

None for documentation. Outcomes stay **`not_measured`** / **`inconclusive`** until ≥3 tagged captures and sponsor outcome review.
