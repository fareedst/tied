# PLAN-TIED-LG-P6-MULTI-TASK — Multi-task coordination and parallelism

| Field | Value |
| --- | --- |
| **Program** | [PLAN-TIED-LANGGRAPH-ORCHESTRATION](../../tied-project/working/PLAN-TIED-LANGGRAPH-ORCHESTRATION/PLAN.md) |
| **Wave** | P6 |
| **Working folder** | [tied-project/working/PLAN-TIED-LG-P6-MULTI-TASK/](../../tied-project/working/PLAN-TIED-LG-P6-MULTI-TASK/PLAN.md) |
| **Depends on** | P5 checklist slice complete (`a997b6d6`) |
| **Phased spec** | [tied-langgraph-orchestration-plan.md](./tied-langgraph-orchestration-plan.md) § Phase 6 |

## Goal

Extend the LangGraph **project graph** to schedule **dependent tasks** from a plan artifact DAG, run **independent** tasks in parallel via LangGraph **`Send`** (or equivalent fan-out), isolate each parallel implementer in a **mandatory git worktree** (or branch), **merge** results, run **combined regression** on the merged `candidate_commit`, and **invalidate stale evidence** when merge changes revision. Architectural invalidation routes to a **replan** edge with advisory `tied_leap_proposal_add`—no automatic REQ edits.

## Refined scope and authority

**Pilot-local** under `tools/langgraph-pilot/`. No new stdd `REQ-*`/`ARCH-*`/`IMPL-*` unless sponsor later mints LangGraph tokens. Fresh **implement** `pre_implementation` gate required before RED; plan-only receipts from this `refine-plan` pass are not reused for implement claims.

**Default parallelism policy:** at most **two** concurrent implementer worktrees in CI (hermetic git fixture); sponsor may raise cap in `@refine-plan` before `@build-plan` with documented memory/disk consequence.

## Default two-task fixture

Hermetic mini-repo under `tests/fixtures/parallel_mini_repo/` (or generated in `tmp_path`):

| Task id | `depends_on` | Work | Exit artifact |
| --- | --- | --- | --- |
| `task-alpha` | `[]` | Run default `tdd-unit-slice` segment in worktree `alpha/` | `slug-*.json` + ledger observations |
| `task-beta` | `[]` | Same segment in worktree `beta/` with distinct request_token suffix | same |
| `merge-main` | `task-alpha`, `task-beta` | Integrate worktrees → single tree; run combined regression (`pytest -q` stub or mini test runner) | `merge-regression.json` |

Tasks with shared `depends_on` edges run **sequentially** in topo order; tasks with no interdependency and a common merge parent are **Send-eligible**.

**Fault injection (required test):** force `task-beta` green gate failure; graph must **not** merge; ledger marks `merge-main` blocked; optional replan route emits advisory LEAP proposal record (mocked MCP).

## In scope

1. **`tied_langgraph/task_dag.py`** — load task DAG from JSON/YAML plan artifact; validate acyclic graph; topological schedule; expose `ready_tasks` and `merge_task` metadata.
2. **`tied_langgraph/worktree_pool.py`** — allocate one worktree (or branch) per parallel task id under run directory; reconcile cleanup; forbid shared `worktree_path` across concurrent Send workers.
3. **`tied_langgraph/graphs/project_multi.py`** (or extend `project.py` with mode flag) — project graph with:
   - schedule node: pop ready tasks from DAG
   - **Send** fan-out to per-task subgraph (reuse P5 checklist segment runner per task)
   - join / barrier before merge when all parents complete
   - **merge node**: integrate branches/worktrees, update `candidate_commit`, run regression runner
   - **staleness**: invoke Phase 2 `staleness_route` when merge commit ≠ prior evidence commits
   - **replan edge**: on architectural invalidation flag, call mocked `tied_leap_proposal_add` and route to `escalate` (no REQ YAML mutation)
4. **Plan artifact schema** — document `langgraph-task-plan.v1.json` in pilot README; default fixture path in tests.
5. **CLI** — `--task-plan PATH`, `--max-parallel N`, `--merge-regression-cmd` (optional; default hermetic stub).
6. **Tests**:
   - unit: DAG cycle detection, topo order, worktree path uniqueness
   - composition: two-task parallel fixture completes with merge regression evidence
   - fault: beta failure blocks merge; staleness after forced merge commit change
7. **README** — operator section: worktree layout, Send semantics, dual-tracker warning (inherits P5), merge regression evidence shape.

## Out of scope

- Phase 7 A/B readout vs agentstream (P7).
- Live charter client `1791767366` in default CI (optional sponsor smoke).
- LLM implementer nodes (scripted/hermetic runners only, same as P5).
- Full checklist graph for entire `[PROC-AGENT_REQ_CHECKLIST]` (Phase 8+ backlog).
- Replacing agentstream as default executor.

## Implementation sequence

RED-first `@build-plan` order:

1. Task DAG loader tests (failing) → `task_dag.py`.
2. Worktree pool contract tests → `worktree_pool.py`.
3. Single-task schedule wrapper (sequential two-task, no Send) → validate merge without parallelism.
4. Send fan-out + join + merge regression (happy path).
5. Fault injection + staleness + replan hook tests.
6. README + program checklist P6 status on close-out.

## Acceptance and exit criteria

- Parallel fixture: `task-alpha` and `task-beta` complete concurrently (or Send-scheduled) with isolated worktrees; `merge-main` produces merge regression observation on final commit.
- Run ledger references per-task slug evidence and merge regression artifact.
- Fault injection test proves merge blocked when a parallel task fails verification.
- Default CI: mocked MCP only; `cd tools/langgraph-pilot && .venv/bin/pytest -q` green including new P6 tests.
- Program wave exit: tracker + `langgraph-program-execution-checklist.yaml` P6 `implement_close_out_complete` with exit commit.

## References

- [plan-tied-lg-p5-checklist-slice.md](./plan-tied-lg-p5-checklist-slice.md)
- [LangGraph Send / map-reduce patterns](https://docs.langchain.com/oss/python/langgraph/graph-api)
- [tied-langgraph-orchestration-plan.md](./tied-langgraph-orchestration-plan.md) § Phase 6
