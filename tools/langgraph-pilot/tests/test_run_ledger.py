"""[PLAN-TIED-LG-P2-EVIDENCE] Run ledger append and path confinement."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from tied_langgraph.ledger import LEDGER_SCHEMA_VERSION, LedgerPathError, append_observation, load_ledger


def test_append_observation_records_required_fields(tmp_path: Path) -> None:
    artifact = tmp_path / "obs.json"
    artifact.write_text("{}", encoding="utf-8")
    obs = append_observation(
        run_directory=tmp_path,
        ledger_filename="ledger.json",
        run_id="run-1",
        request_token="PLAN-TIED-LG-P2-EVIDENCE-FIXTURE",
        tool="request_evidence_envelope_validate",
        commit="abc123",
        exit_code=0,
        artifact_path="obs.json",
    )
    assert obs["tool"] == "request_evidence_envelope_validate"
    assert obs["commit"] == "abc123"
    assert obs["exit_code"] == 0
    assert obs["artifact_path"] == "obs.json"
    assert obs["sha256"].startswith("sha256:")

    ledger = json.loads((tmp_path / "ledger.json").read_text(encoding="utf-8"))
    assert ledger["schema_version"] == LEDGER_SCHEMA_VERSION
    assert len(ledger["observations"]) == 1


def test_ledger_rejects_path_escape(tmp_path: Path) -> None:
    with pytest.raises(LedgerPathError):
        append_observation(
            run_directory=tmp_path,
            ledger_filename="ledger.json",
            run_id="run-1",
            request_token="PLAN-TIED-LG-P2-EVIDENCE-FIXTURE",
            tool="pytest",
            commit=None,
            exit_code=1,
            artifact_path="../outside.txt",
        )


def test_load_ledger_empty_defaults(tmp_path: Path) -> None:
    ledger = load_ledger(tmp_path / "missing.json")
    assert ledger["observations"] == []
