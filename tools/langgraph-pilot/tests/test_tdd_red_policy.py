"""[PLAN-TIED-LG-P3-TDD] RED classification policy tests."""

from tied_langgraph.policies.tdd_red import RedClassification, classify_red_result, implement_allowed


def test_valid_red_on_assertion_failure() -> None:
    red = classify_red_result(exit_code=1, stderr="AssertionError: expected true")
    assert red is RedClassification.VALID_RED
    assert implement_allowed(red)


def test_invalid_red_on_syntax_error() -> None:
    red = classify_red_result(exit_code=1, stderr="SyntaxError: invalid syntax")
    assert red is RedClassification.INVALID_RED


def test_invalid_red_when_tests_pass() -> None:
    red = classify_red_result(exit_code=0, stdout="ok")
    assert red is RedClassification.INVALID_RED


def test_invalid_red_on_import_error() -> None:
    red = classify_red_result(exit_code=1, stderr="ModuleNotFoundError: no module named x")
    assert red is RedClassification.INVALID_RED
