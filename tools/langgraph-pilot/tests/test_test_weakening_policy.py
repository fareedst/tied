"""[PLAN-TIED-LG-P3-TDD] Test-weakening heuristics."""

from tied_langgraph.policies.test_weakening import detect_test_weakening, has_tdd_waiver


def test_skip_without_waiver_is_weakening() -> None:
    assert detect_test_weakening(diff_text="+it.skip('later')", ledger={})


def test_skip_with_waiver_allowed() -> None:
    ledger = {"tdd_waiver": {"scope": "doc", "reason": "doc-only", "sponsor_flag": True}}
    assert has_tdd_waiver(ledger)
    assert not detect_test_weakening(diff_text="+it.skip('later')", ledger=ledger)


def test_removed_assertion_is_weakening() -> None:
    diff = "-    expect(value).toBe(1)\n+    // removed"
    assert detect_test_weakening(diff_text=diff, ledger=None)
