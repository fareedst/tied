# test-strategy — PLAN-TIED-LG-P5-CHECKLIST

RED-first: `test_checklist_segment.py`, `test_tracker_writer.py`, `test_project_checklist_graph.py` before module implementation.

Composition: three-slug segment with mocked TDD + verification subgraphs and **disposable** tracker under `tests/fixtures/` or tmp path.

Default CI: no live MCP; no mutation of committed program trackers.
