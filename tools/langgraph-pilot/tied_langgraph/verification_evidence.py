"""Evidence schema checks for verification subgraph — [PLAN-TIED-LG-P4-ACCEPTANCE]."""

from __future__ import annotations

import re
from typing import Any

from tied_langgraph.policies.acceptance import required_evidence_kinds

_SHA256_RE = re.compile(r"^[a-f0-9]{64}$")


class EvidenceSchemaError(ValueError):
    """Evidence dict failed deterministic schema validation."""


def validate_evidence_record(kind: str, record: Any) -> None:
    if not isinstance(record, dict):
        raise EvidenceSchemaError(f"{kind}: expected object record")
    if record.get("result") not in ("passed", "failed", "skipped"):
        raise EvidenceSchemaError(f"{kind}: invalid or missing result")
    commit = record.get("commit")
    if not commit or not isinstance(commit, str):
        raise EvidenceSchemaError(f"{kind}: commit required")
    sha = record.get("artifact_sha256")
    if sha is not None and not _SHA256_RE.match(str(sha)):
        raise EvidenceSchemaError(f"{kind}: artifact_sha256 must be 64 hex chars")


def validate_evidence_schema(evidence: dict[str, Any]) -> None:
    """Validate all records present in evidence dict."""
    if not evidence:
        raise EvidenceSchemaError("evidence must be non-empty")
    for kind, record in evidence.items():
        validate_evidence_record(kind, record)


def validate_evidence_for_acceptance(evidence: dict[str, Any]) -> None:
    """Require every acceptance kind with commit, passed result, and artifact hash."""
    for kind in required_evidence_kinds():
        record = evidence.get(kind)
        if record is None:
            raise EvidenceSchemaError(f"{kind}: required for acceptance validation")
        validate_evidence_record(kind, record)
        if record.get("result") != "passed":
            raise EvidenceSchemaError(f"{kind}: result must be passed")
        if not record.get("artifact_sha256"):
            raise EvidenceSchemaError(f"{kind}: artifact_sha256 required")
