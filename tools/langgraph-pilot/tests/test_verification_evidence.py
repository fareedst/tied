"""[PLAN-TIED-LG-P4-ACCEPTANCE] Evidence schema validation."""

import pytest

from tied_langgraph.verification_evidence import (
    EvidenceSchemaError,
    validate_evidence_record,
    validate_evidence_schema,
)


def test_validate_evidence_schema_accepts_minimal_passed_record() -> None:
    validate_evidence_schema(
        {
            "green_test": {"result": "passed", "commit": "c1", "artifact_sha256": "a" * 64},
            "regression_suite": {"result": "passed", "commit": "c1", "artifact_sha256": "b" * 64},
            "independent_review": {"result": "passed", "commit": "c1", "artifact_sha256": "c" * 64},
        }
    )


def test_validate_evidence_schema_rejects_missing_commit() -> None:
    with pytest.raises(EvidenceSchemaError, match="commit"):
        validate_evidence_schema({"green_test": {"result": "passed"}})


def test_validate_evidence_record_requires_sha256_when_present() -> None:
    with pytest.raises(EvidenceSchemaError, match="sha256"):
        validate_evidence_record("green_test", {"result": "passed", "commit": "c1", "artifact_sha256": "short"})
