# PLAN-TIED-LG-P6-MULTI-TASK

| Field | Value |
| --- | --- |
| **Program wave** | P6 — multi-task scheduling |
| **Parent** | [PLAN-TIED-LANGGRAPH-ORCHESTRATION](../PLAN-TIED-LANGGRAPH-ORCHESTRATION/PLAN.md) |
| **Linked plan** | [docs/langgraph/plan-tied-lg-p6-multi-task.md](../../../docs/langgraph/plan-tied-lg-p6-multi-task.md) |
| **Phased spec** | [tied-langgraph-orchestration-plan.md](../../../docs/langgraph/tied-langgraph-orchestration-plan.md) § Phase 6 |
| **Prerequisite** | [PLAN-TIED-LG-P5-CHECKLIST](../PLAN-TIED-LG-P5-CHECKLIST/PLAN.md) implement + close-out complete (`a997b6d6`) |
| **CITDP** | [CITDP-PLAN-TIED-LG-P6-MULTI-TASK.yaml](../../citdp/CITDP-PLAN-TIED-LG-P6-MULTI-TASK.yaml) |
| **Status** | Implement + machine close-out complete (`@close-out` 2026-11-07) |
| **Exit** | Two-task parallel fixture with merge regression evidence on final commit |

## Authority

Sequential program wave after P5 exit. Pilot-local; no project TIED tokens at plan time.

## Module and acceptance contract

- `task_dag.py`: acyclic DAG load, topo schedule, merge task resolution.
- `worktree_pool.py`: one worktree per parallel task; cleanup.
- `graphs/project_multi.py`: Send fan-out, join, merge regression, staleness + replan edge.
- Reuse P5 `run_checklist_segment` / tracker writer per task with **disposable** tracker copies.

Handoff: [evidence/session-handoff.md](./evidence/session-handoff.md)

## Next agent

**`@build-plan`** on this working folder after sponsor authorizes implement.
