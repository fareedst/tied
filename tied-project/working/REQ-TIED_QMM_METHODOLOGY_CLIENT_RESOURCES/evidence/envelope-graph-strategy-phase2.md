# Envelope graph strategy — phase 2 cohort export bundle (d2)

**Date:** 2026-10-10 · **run_id:** `qmm-phase2-d2-20261010`

## Problem

`REQ-METHODOLOGY-LEARNING-COHORT-EXPORT` (store) declares `depends_on`:

- `REQ-EVIDENCE_CHAIN_REPORT` — **in bundle** (phase 1 QA stack)
- `REQ-METHODOLOGY-LEARNING-EXPERIMENT` — **in bundle** (phase 1 QMM stack)
- `REQ-REQUEST_EVIDENCE_ENVELOPE` — **not in bundle** (store/client envelope stack; large, separate promotion)

Minimal-client `validateConsistency` fails when a bundle detail `depends_on` references a REQ absent from the methodology bundle index.

## Strategy (bundle-only LEAP trim)

| Layer | `REQ-REQUEST_EVIDENCE_ENVELOPE` |
| --- | --- |
| **Store `tied-project/`** | Keep `depends_on` — canonical traceability for stdd implement and MCP composition (`IMPL-REQUEST_EVIDENCE_ENVELOPE_BATCH` in pseudo-code). |
| **Fleet `tied-bundle/`** | Remove **`depends_on` and `related_to`** entries for the envelope REQ (index + detail). Record **`metadata.bundle_graph_note`** only — no index token edge, so minimal-client `validateConsistency` stays clean. |

Runtime cohort export MCP still composes envelope batch tools when present; the trim affects **inheritance graph validation only**, not code paths.

## Promotion scope (d2)

Single stack: `REQ-METHODOLOGY-LEARNING-COHORT-EXPORT` + `ARCH-*` + `IMPL-*` + pseudo-code sidecar.

Manifest key: `QMM_COHORT_EXPORT_METHODOLOGY_REQUIRED_FILES` (non-empty after d2).

Bootstrap: `verifyQmmCohortExportMethodology` (parallel to `verifyQaEvidenceChainMethodology`).

## Non-goals (this pass)

- Promoting full `REQ-REQUEST_EVIDENCE_ENVELOPE` R+A+I into `tied-bundle/`.
- Changing cohort export MCP behavior or W1/W4 stacks.
