# PLAN-TIED-LG-P5-CHECKLIST

| Field | Value |
| --- | --- |
| **Program wave** | P5 — checklist slice |
| **Parent** | [PLAN-TIED-LANGGRAPH-ORCHESTRATION](../PLAN-TIED-LANGGRAPH-ORCHESTRATION/PLAN.md) |
| **Linked plan** | [docs/langgraph/plan-tied-lg-p5-checklist-slice.md](../../../docs/langgraph/plan-tied-lg-p5-checklist-slice.md) |
| **Phased spec** | [tied-langgraph-orchestration-plan.md](../../../docs/langgraph/tied-langgraph-orchestration-plan.md) § Phase 5 |
| **Prerequisite** | [PLAN-TIED-LG-P4-ACCEPTANCE](../PLAN-TIED-LG-P4-ACCEPTANCE/PLAN.md) implement + close-out complete |
| **CITDP** | [CITDP-PLAN-TIED-LG-P5-CHECKLIST.yaml](../../citdp/CITDP-PLAN-TIED-LG-P5-CHECKLIST.yaml) |
| **Fixture client** | Charter path optional; default CI hermetic only |
| **Status** | Implement + machine close-out complete (`@close-out` 2026-11-07) — commit `a997b6d6` |
| **Exit** | Segment-driven project graph; tracker shows completed slugs with evidence refs |

## Authority

Sequential program wave after P4 exit. Pilot-local; no project TIED tokens at plan time.

## Next agent

1. **`@close-out`** when sponsor wants machine envelope + traceable-commit.
2. Optional: disposable-tracker smoke against charter client under working evidence.

Handoff: [evidence/session-handoff.md](./evidence/session-handoff.md)

## Module and acceptance contract

- `checklist_segment.py`: load checklist + tracker; validate contiguous segment.
- `tracker_writer.py`: single-writer dispositions and evidence_refs.
- `graphs/project.py`: slug iterator dispatching P3/P4 subgraphs.
- Operator CLI flags aligned with agentstream checklist vars.
