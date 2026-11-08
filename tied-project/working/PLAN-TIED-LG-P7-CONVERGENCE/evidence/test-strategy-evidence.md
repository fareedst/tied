# test-strategy — PLAN-TIED-LG-P7-CONVERGENCE

**Date:** 2026-11-07

**Primary verification:** Documentary — metrics sourced from gate JSON, trackers, trial readouts, pytest log.

**No RED product tests required** for plan exit unless sponsor opts into metrics JSON schema unit test in pilot.

**Regression guard:**

```bash
cd tools/langgraph-pilot && .venv/bin/pytest -q
```

**Manual A/B:** Optional sponsor-timed agentstream run on fixture; LangGraph arm uses P3–P6 evidence inventory.
