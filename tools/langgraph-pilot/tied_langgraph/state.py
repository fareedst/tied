"""RunState v0 for LangGraph pilot."""

from __future__ import annotations

from typing import Any, TypedDict


class RunState(TypedDict, total=False):
    run_id: str
    request_token: str
    policy_version: str
    baseline_commit: str | None
    candidate_commit: str | None
    checklist_vars: dict[str, Any]
    evidence_refs: dict[str, Any]
    mcp_last_result: dict[str, Any] | None
    checkpoint_path: str | None
