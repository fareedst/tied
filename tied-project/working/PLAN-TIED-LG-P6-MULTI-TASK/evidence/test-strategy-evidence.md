# test-strategy — PLAN-TIED-LG-P6-MULTI-TASK

RED-first: `test_task_dag.py`, `test_worktree_pool.py`, `test_project_multi_parallel.py` before module implementation.

**Unit:** DAG cycle/topo, worktree path uniqueness, replan hook payload (mocked MCP).

**Composition:** two-task Send fixture with merge regression artifact; fault injection on `task-beta`.

**Default CI:** hermetic `tmp_path` git + mocked MCP; no mutation of committed program trackers.

**Repeatable verification (post-build):**

```bash
cd tools/langgraph-pilot && .venv/bin/pytest -q
```
