# change-definition — PLAN-TIED-LG-P3-TDD

**Date:** 2026-10-12

| | |
| --- | --- |
| **Current** | P2 pilot routes on envelope gaps; `tdd_red.py` is a stub; no executable TDD subgraph. |
| **Desired** | RED/GREEN/REFACTOR subgraph with **ValidRedEvidence** gate, ledger observations, test-weakening heuristics, hermetic composition test. |
| **Non-goals** | P4 acceptance subgraph; P5 checklist slice; fixture TIED mutations; weakening RED policy. |
| **Success** | Hermetic forced fail→pass with ledger refs; `@build-plan` pytest green after implement pre_impl gate. |
