"""[PLAN-TIED-LG-P4-ACCEPTANCE] Deterministic acceptance policy tests."""

from tied_langgraph.policies.acceptance import (
    AcceptanceRoute,
    acceptance_gate,
    required_evidence_kinds,
)


def _passed(commit: str) -> dict[str, dict[str, str]]:
    kinds = required_evidence_kinds()
    return {kind: {"result": "passed", "commit": commit} for kind in kinds}


def test_accept_when_all_required_evidence_matches_revision() -> None:
    route = acceptance_gate(
        evidence=_passed("abc123"),
        candidate_commit="abc123",
        requirements_covered=True,
        unresolved_blockers=[],
    )
    assert route is AcceptanceRoute.ACCEPT


def test_repair_when_review_evidence_missing() -> None:
    evidence = _passed("abc123")
    del evidence["independent_review"]
    route = acceptance_gate(
        evidence=evidence,
        candidate_commit="abc123",
        requirements_covered=True,
        unresolved_blockers=[],
    )
    assert route is AcceptanceRoute.REPAIR


def test_repair_when_evidence_commit_mismatch() -> None:
    route = acceptance_gate(
        evidence=_passed("old"),
        candidate_commit="new",
        requirements_covered=True,
        unresolved_blockers=[],
    )
    assert route is AcceptanceRoute.REPAIR


def test_replan_when_requirements_not_covered() -> None:
    route = acceptance_gate(
        evidence=_passed("abc123"),
        candidate_commit="abc123",
        requirements_covered=False,
        unresolved_blockers=[],
    )
    assert route is AcceptanceRoute.REPLAN


def test_escalate_when_unresolved_blockers() -> None:
    route = acceptance_gate(
        evidence=_passed("abc123"),
        candidate_commit="abc123",
        requirements_covered=True,
        unresolved_blockers=["envelope_error_gap"],
    )
    assert route is AcceptanceRoute.ESCALATE


def test_repair_when_result_not_passed() -> None:
    evidence = _passed("abc123")
    evidence["green_test"]["result"] = "failed"
    route = acceptance_gate(
        evidence=evidence,
        candidate_commit="abc123",
        requirements_covered=True,
        unresolved_blockers=[],
    )
    assert route is AcceptanceRoute.REPAIR
