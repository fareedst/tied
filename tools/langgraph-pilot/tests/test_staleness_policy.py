"""[PLAN-TIED-LG-P2-EVIDENCE] Staleness invalidation stub."""

from __future__ import annotations

from tied_langgraph.policies.staleness import evidence_is_stale, staleness_route


def test_equal_commits_continue() -> None:
    assert staleness_route(candidate_commit="abc", evidence_commit="abc") == "continue"
    assert not evidence_is_stale(candidate_commit="abc", evidence_commit="abc")


def test_mismatch_routes_repair() -> None:
    assert staleness_route(candidate_commit="abc", evidence_commit="def") == "repair"
    assert evidence_is_stale(candidate_commit="abc", evidence_commit="def")
