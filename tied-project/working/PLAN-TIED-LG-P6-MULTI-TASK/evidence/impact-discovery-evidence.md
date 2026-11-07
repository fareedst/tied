# impact-discovery — PLAN-TIED-LG-P6-MULTI-TASK

**Modules:** `task_dag.py`, `worktree_pool.py`, `graphs/project_multi.py` (and optional `project.py` wiring), tests, README.

**TIED tokens:** none (pilot-local). **P5 reuse:** `run_checklist_segment`, `tracker_writer`, staleness from Phase 2.

**Blast radius:** `tools/langgraph-pilot/` only; hermetic git fixtures; disposable tracker copies under `tied-bundle/working/`.
