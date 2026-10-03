# W3 refine-plan — Refine outcomes (Touchpoint 1 — RECORD)

**Change ID:** `PLAN-TIED-RESIDUALITY-ANALYSIS`  
**Batch:** W3 stack elevation via LEAP — refine/plan only (no project YAML mutation)  
**Date:** 2026-09-27

## W2 entry (met)

- Classification ledger 25/25 with 14 W3 LEAP candidate rows (8 `candidate_requirement` + 6 `architecture_constraint`).
- Handoff: `evidence/w2-exit-w3-handoff.md`.

## Resolved terms (W3 batch)

- **behavior-changing CITDP** — Separate working record `CITDP-RESIDUALITY-PILOT-W3-LEAP.yaml`; distinct from plan-doc `CITDP-PLAN-TIED-RESIDUALITY-ANALYSIS.yaml`.
- **phased promotion** — Default **P0 (7 rows)** core pilot gaps vs **P1 defer (7 rows)** A5 ops/scale/ambiguous cluster; sponsor placeholders in `w3-leap/scope-and-phasing.md`.
- **residuality facet** — Stressor/residue IDs and ledger disposition referenced in traceability metadata only; not a parallel full specification authority.
- **harmful never → positive REQ** — e.g. S-T12 elevates as `architecture_constraint` only.

## Sponsor flags (refine defaults — decision required)

| Stressor | Issue | Default refine stance |
|----------|-------|----------------------|
| S-T10 | Lock-loss fencing ARCH vs IMPL | **P1 defer** — SD-W3-S-T10 |
| S-T03 | Execution store-unavailable mapping ambiguous | **Out of W3** — W4 first — SD-W3-S-T03 |
| 14 → N | Trim row set | **P0=7** batch 1 — SD-W3-TRIM |

## Deliverables produced (refine-plan W3)

1. Linked plan: `w3-refine-*` todos complete; `w3-build-plan-leap` pending.
2. `CITDP-RESIDUALITY-PILOT-W3-LEAP.yaml` — behavior-changing batch scaffold.
3. `w3-leap/scope-and-phasing.md` — in/out/defer + sponsor placeholders.
4. `w3-leap/proposed-stack-deltas/` — seven P0 proposed REQ/ARCH/IMPL deltas.
5. Tracker W3 refine batch section updated in `agent-req-implementation-checklist.yaml`.
6. `gate-tracker-pre-implementation-w3.yaml` + pre_implementation receipt `gates/pre_implementation-2026-09-27T05-42-19-358Z.json` (`allowed: true`, depth `integrated`).
7. This file + `w3-refine-risk-assessment.md` + `sub-adversarial-inquiry-pass-w3-refine.md`.

## Vocabulary RECORD/VALIDATE

- **RECORD:** W3 phasing and facet pattern in `w3-leap/scope-and-phasing.md`; no new semantic tokens in refine batch.
- **PRELOAD:** `residuality.md`, `quality-assurance.md`, `fidelity-research.md`.
- **VALIDATE:** Deferred to traceable-commit after build-plan W3 project YAML persist.

## Recommended next step

**build-plan W3** after sponsor fills SD-W3-ROW-SET, SD-W3-TRIM, SD-W3-S-T10, SD-W3-S-T03 — apply LEAP to approved rows, `pseudocode_validate`, persist project YAML, `tied_validate_consistency`, then W4 test strategy.
