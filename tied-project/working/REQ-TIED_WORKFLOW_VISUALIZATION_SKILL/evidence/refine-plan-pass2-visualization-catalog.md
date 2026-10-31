# Refine pass 2 — visualization catalog expansion

**Date:** 2026-10-30  
**Trigger:** Sponsor feedback — eleven-section cap artificially short; need multiple critical domain paths and full integration/high-level workflow coverage.

## Change

- Replaced fixed **eleven Mermaid sections** with **visualization catalog** (perspectives A–I) in [../PLAN.md](../PLAN.md).
- Added **workflow inventory** step before composing diagrams.
- **Must-include** rule: all integration-boundary flows + all critical domain flows + primary operator path.
- Optional satellite docs: `<project>-workflows-<domain>.md`, `<project>-integrations.md`.
- Updated CITDP desired_behavior and test-strategy contract expectations.

## Mapping from original eleven to catalog

| Original | Catalog home |
| --- | --- |
| System context | A1 |
| Solution/project topology | A2 |
| Layer dependencies | A3 |
| Primary operator/user path | A4 |
| One critical domain path | **C** — one section **per** critical domain |
| Data/persistence | E1–E4 |
| External API/service plane | D1 |
| External clients/integrators | D2 (+ D3–D6 as evidenced) |
| Batch/console utilities | F1 |
| Security/auth providers | G1–G3 |
| Major UI/module map | H1–H2 |

## New TIED-comprehension perspectives (not in original list)

B2 config plane, B3 source-graph hot path, B4 declared vs observed, D3 async/messaging, D5 OEE, D6 file interchange, E4 data integrity, F2–F4 ops/failure/change, I1–I4 meta-views.
