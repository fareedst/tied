"""Test-weakening heuristics — [PLAN-TIED-LG-P3-TDD]."""

from __future__ import annotations

import re
from typing import Any

_SKIP_PATTERNS = (
    re.compile(r"\bit\.skip\s*\("),
    re.compile(r"\btest\.skip\s*\("),
    re.compile(r"\bdescribe\.skip\s*\("),
    re.compile(r"\bxit\s*\("),
    re.compile(r"@pytest\.mark\.skip"),
)


def has_tdd_waiver(ledger: dict[str, Any] | None) -> bool:
    if not ledger:
        return False
    waiver = ledger.get("tdd_waiver")
    if not isinstance(waiver, dict):
        return False
    return bool(waiver.get("sponsor_flag")) and bool(str(waiver.get("scope") or "").strip())


def detect_test_weakening(*, diff_text: str, ledger: dict[str, Any] | None = None) -> bool:
    """Return True when diff suggests weakening and no ledger waiver is recorded."""
    if has_tdd_waiver(ledger):
        return False
    text = diff_text or ""
    for pattern in _SKIP_PATTERNS:
        if pattern.search(text):
            return True
    removed_assertions = 0
    for line in text.splitlines():
        if line.startswith("-") and ("assert" in line or "expect(" in line):
            removed_assertions += 1
    return removed_assertions > 0
