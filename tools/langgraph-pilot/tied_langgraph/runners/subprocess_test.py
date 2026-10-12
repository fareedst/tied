"""Subprocess test runner with ledger observations — [PLAN-TIED-LG-P3-TDD]."""

from __future__ import annotations

import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import Sequence

from tied_langgraph.ledger import append_observation


@dataclass(frozen=True)
class TestRunResult:
    exit_code: int
    stdout: str
    stderr: str
    stdout_artifact: str
    stderr_artifact: str


def run_subprocess_test(
    *,
    run_directory: Path,
    run_id: str,
    request_token: str,
    cwd: Path,
    command: Sequence[str],
    commit: str | None = None,
    timeout_seconds: float = 120.0,
    ledger_filename: str = "run-ledger.json",
    tool: str = "subprocess_test",
) -> TestRunResult:
    cwd = cwd.resolve()
    run_directory.mkdir(parents=True, exist_ok=True)
    stdout_rel = "artifacts/last-test.stdout.txt"
    stderr_rel = "artifacts/last-test.stderr.txt"
    stdout_path = run_directory / stdout_rel
    stderr_path = run_directory / stderr_rel
    stdout_path.parent.mkdir(parents=True, exist_ok=True)

    completed = subprocess.run(
        list(command),
        cwd=cwd,
        capture_output=True,
        text=True,
        timeout=timeout_seconds,
        check=False,
    )
    stdout_path.write_text(completed.stdout, encoding="utf-8")
    stderr_path.write_text(completed.stderr, encoding="utf-8")

    summary_rel = "artifacts/last-test.summary.txt"
    summary_path = run_directory / summary_rel
    summary_path.write_text(
        f"exit_code={completed.returncode}\ncwd={cwd}\ncommand={' '.join(command)}\n",
        encoding="utf-8",
    )

    append_observation(
        run_directory=run_directory,
        ledger_filename=ledger_filename,
        run_id=run_id,
        request_token=request_token,
        tool=tool,
        commit=commit,
        exit_code=completed.returncode,
        artifact_path=summary_rel,
        candidate_commit=commit,
    )

    return TestRunResult(
        exit_code=completed.returncode,
        stdout=completed.stdout,
        stderr=completed.stderr,
        stdout_artifact=stdout_rel,
        stderr_artifact=stderr_rel,
    )
