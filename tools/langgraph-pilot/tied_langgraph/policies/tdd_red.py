"""ValidRedEvidence policy for TDD RED gate — [PLAN-TIED-LG-P3-TDD]."""

from __future__ import annotations

from enum import Enum


class RedClassification(str, Enum):
    VALID_RED = "ValidRedEvidence"
    INVALID_RED = "InvalidRedEvidence"


_INVALID_MARKERS = (
    "SyntaxError",
    "IndentationError",
    "ModuleNotFoundError",
    "Cannot find module",
    "ImportError",
    "ReferenceError",
    "ENOENT",
)

_ASSERTION_MARKERS = (
    "AssertionError",
    "assertion failed",
    "Expected",
    "FAIL ",
    "FAIL:",
    "✗",
    "not ok",
)


def classify_red_result(*, exit_code: int, stdout: str = "", stderr: str = "") -> RedClassification:
    """Classify a RED-phase test run as valid expected failure or invalid noise."""
    combined = f"{stdout}\n{stderr}"
    if exit_code == 0:
        return RedClassification.INVALID_RED
    for marker in _INVALID_MARKERS:
        if marker in combined:
            return RedClassification.INVALID_RED
    for marker in _ASSERTION_MARKERS:
        if marker in combined:
            return RedClassification.VALID_RED
    # Non-zero exit without recognized assertion signal — treat as invalid RED.
    return RedClassification.INVALID_RED


def implement_allowed(red: RedClassification) -> bool:
    return red is RedClassification.VALID_RED
