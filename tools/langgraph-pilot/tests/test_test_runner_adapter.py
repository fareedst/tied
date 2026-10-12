"""[PLAN-TIED-LG-P3-TDD] Subprocess runner contract."""

from __future__ import annotations

import sys
from pathlib import Path

from tied_langgraph.ledger import load_ledger
from tied_langgraph.runners.subprocess_test import run_subprocess_test


def test_subprocess_runner_records_ledger(tmp_path: Path) -> None:
    run_dir = tmp_path / "run"
    result = run_subprocess_test(
        run_directory=run_dir,
        run_id="run-subprocess",
        request_token="PLAN-TIED-LG-P3-TDD",
        cwd=tmp_path,
        command=[sys.executable, "-c", "import sys; sys.stderr.write('AssertionError\\n'); sys.exit(1)"],
        commit="abc123",
    )
    assert result.exit_code == 1
    ledger = load_ledger(run_dir / "run-ledger.json")
    assert ledger["run_id"] == "run-subprocess"
    assert len(ledger["observations"]) == 1
    assert ledger["observations"][0]["exit_code"] == 1
