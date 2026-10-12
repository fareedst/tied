"""Append-only run ledger for LangGraph pilot observations."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any

LEDGER_SCHEMA_VERSION = "langgraph-run-ledger.v1"


class LedgerPathError(ValueError):
    """Observation artifact path escapes the run directory."""


def _sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(65536), b""):
            digest.update(chunk)
    return f"sha256:{digest.hexdigest()}"


def _resolve_under_run(run_directory: Path, artifact_path: str) -> Path:
    run_directory = run_directory.resolve()
    candidate = (run_directory / artifact_path).resolve()
    if candidate != run_directory and run_directory not in candidate.parents:
        raise LedgerPathError(f"artifact_path {artifact_path!r} escapes run_directory")
    return candidate


def load_ledger(path: Path) -> dict[str, Any]:
    if not path.is_file():
        return {
            "schema_version": LEDGER_SCHEMA_VERSION,
            "run_id": "",
            "request_token": "",
            "observations": [],
        }
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise ValueError("ledger root must be an object")
    return data


def append_observation(
    *,
    run_directory: Path,
    ledger_filename: str,
    run_id: str,
    request_token: str,
    tool: str,
    commit: str | None,
    exit_code: int,
    artifact_path: str,
    candidate_commit: str | None = None,
    envelope_path: str | None = None,
) -> dict[str, Any]:
    """Append one observation record and persist the ledger under run_directory."""
    run_directory.mkdir(parents=True, exist_ok=True)
    artifact = _resolve_under_run(run_directory, artifact_path)
    sha256 = _sha256_file(artifact) if artifact.is_file() else f"sha256:{'0' * 64}"

    ledger_path = run_directory / ledger_filename
    ledger = load_ledger(ledger_path)
    if not ledger.get("run_id"):
        ledger["run_id"] = run_id
    if not ledger.get("request_token"):
        ledger["request_token"] = request_token
    ledger["schema_version"] = LEDGER_SCHEMA_VERSION
    if candidate_commit is not None:
        ledger["candidate_commit"] = candidate_commit
    if envelope_path is not None:
        ledger["envelope_path"] = envelope_path

    observation = {
        "tool": tool,
        "commit": commit,
        "exit_code": exit_code,
        "artifact_path": artifact_path,
        "sha256": sha256,
    }
    observations = ledger.setdefault("observations", [])
    if not isinstance(observations, list):
        raise ValueError("ledger observations must be a list")
    observations.append(observation)

    ledger_path.write_text(json.dumps(ledger, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return observation


def set_tdd_waiver(
    *,
    run_directory: Path,
    ledger_filename: str,
    scope: str,
    reason: str,
    sponsor_flag: bool,
) -> dict[str, Any]:
    """Record an explicit TDD waiver on the run ledger."""
    run_directory.mkdir(parents=True, exist_ok=True)
    ledger_path = run_directory / ledger_filename
    ledger = load_ledger(ledger_path)
    ledger["tdd_waiver"] = {
        "scope": scope,
        "reason": reason,
        "sponsor_flag": sponsor_flag,
    }
    ledger_path.write_text(json.dumps(ledger, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return ledger["tdd_waiver"]
