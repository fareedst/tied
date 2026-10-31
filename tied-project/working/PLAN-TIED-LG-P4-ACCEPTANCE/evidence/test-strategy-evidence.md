# test-strategy — PLAN-TIED-LG-P4-ACCEPTANCE

RED-first: `test_acceptance_gate.py`, `test_verification_evidence.py`, `test_separation_policy.py`, `test_verification_subgraph.py` before module implementation.

Composition: verification subgraph invoke with `skip_mcp_gate=True`. Default CI: no live Node MCP.
