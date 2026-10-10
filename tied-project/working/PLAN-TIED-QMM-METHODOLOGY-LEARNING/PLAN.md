# PLAN-TIED-QMM-METHODOLOGY-LEARNING

Linked plan: [`docs/tied-qmm-methodology-learning-plan.md`](../../../docs/tied-qmm-methodology-learning-plan.md)

## Program status (2026-10-10)

**Orchestrator:** [`qmm-program-execution-checklist.yaml`](./qmm-program-execution-checklist.yaml)  
**Current wave:** `W0`  
**Program phase:** `ready_to_execute` — W0 charter complete; W1 implement still gated on authority extension  
**Source analysis:** [`docs/comparisons/qmm-kaizen-vs-tied.md`](../../../docs/comparisons/qmm-kaizen-vs-tied.md)
**Refine tracker:** [`checklist-tracker.yaml`](./checklist-tracker.yaml) — W0 documentation-only tracker (**refine pass 2** complete)

### Wave summary

| Wave | Status | Notes |
| --- | --- | --- |
| W0 | **complete** | Sponsor authority recorded — [`evidence/sponsor-authority-20261010.md`](./evidence/sponsor-authority-20261010.md) |
| W1 | **plan-only complete** | Child plan [`docs/tied-qmm-w1-methodology-pdsa-plan.md`](../../../docs/tied-qmm-w1-methodology-pdsa-plan.md); implement gated on `REQ-METHODOLOGY-LEARNING-EXPERIMENT` |
| W2–W5 | planned | Depend on W1 contract |
| W6 | deferred hinge | Kaizen Phase 3 transport only if sponsor reopens |
| Backlog | deferred | SPC charts, DORA, universal DMAIC (comparison non-goals) |

## Next agent — do this first

1. Read `qmm-program-execution-checklist.yaml` → `current_wave` and `execution_authority`.
2. **Do not** start W1 implement RED/MCP until sponsor extends `execution_authority` beyond plan-only.
3. W1 child plan authored — resume at [`../PLAN-TIED-QMM-W1-METHODOLOGY-PDSA/PLAN.md`](../PLAN-TIED-QMM-W1-METHODOLOGY-PDSA/PLAN.md).
4. PRELOAD orchestrator `vocabulary_preload` before TIED YAML or MCP writes on any wave.
5. Do not treat the W0 tracker as a W1 per-REQ Tracker; W1 requires a fresh copy of the canonical checklist plus a valid W1 CITDP and successful `pre_implementation` gate.

## Governing decisions (W0 — doc-only)

- Strategic direction copied from comparison **Strategic suggestion**; adoption is **not** enacted by W0.
- Loop 2 Kaizen program remains **closed**; Phase 3 is **W6 optional**, not W1 blocker.
- Methodology YAML in clients stays **read-only** (`tied-bundle/`) unless a future sponsor-approved LEAP/methodology change says otherwise.
- W0 CITDP persistence and checklist gate validation are explicitly deferred: this pass changes documentation artifacts only and has no valid behavior-changing REQ/CITDP pair.
