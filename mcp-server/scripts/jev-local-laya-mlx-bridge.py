#!/usr/bin/env python3
"""
[REQ-TIED_JEV_LOCAL_DECISION_PROVIDER] stdin/stdout JSON bridge for local laya_mlx decisions.
Contract: jev-local-bridge-request.v1 -> jev-local-bridge-response.v1
"""
from __future__ import annotations

import json
import sys
from typing import Any


REQUEST_SCHEMA = "jev-local-bridge-request.v1"
RESPONSE_SCHEMA = "jev-local-bridge-response.v1"


def emit(payload: dict[str, Any]) -> None:
    sys.stdout.write(json.dumps(payload))
    sys.stdout.flush()


def fail(error_code: str, message: str) -> None:
    emit(
        {
            "schema": RESPONSE_SCHEMA,
            "ok": False,
            "error_code": error_code,
            "error_message": message[:500],
        }
    )


def validate_prob(value: Any) -> bool:
    return isinstance(value, (int, float)) and 0.0 <= float(value) <= 1.0


def stub_answer(question_id: str, question: dict[str, Any]) -> dict[str, Any]:
    qtype = question.get("type")
    if qtype == "noul":
        return {"type": "noul", "noul": 0.5}
    if qtype == "choice":
        criteria = question.get("criteria") or {}
        keys = list(criteria.keys())
        choice = keys[0] if keys else "unknown"
        probs = {k: (1.0 / len(keys) if keys else 1.0) for k in keys}
        return {
            "type": "choice",
            "choice": choice,
            "confidence": 0.5,
            "probabilities": probs,
        }
    if qtype == "score":
        return {
            "type": "score",
            "score": 0.5,
            "confidence": 0.5,
            "probabilities": {"0": 0.5, "1": 0.5},
        }
    raise ValueError(f"unsupported_question_type:{question_id}")


def decide_with_laya(req: dict[str, Any]) -> dict[str, Any]:
    try:
        import laya_mlx  # type: ignore
    except ImportError as exc:
        fail("import_error", f"laya_mlx not installed: {exc}")
        return {}

    # Adapter boundary: map generic questions to laya_mlx when API is available.
    # Until the vendor API is pinned, use deterministic stub answers after import check.
    _ = laya_mlx
    answers: dict[str, Any] = {}
    for qid, question in (req.get("questions") or {}).items():
        answers[qid] = stub_answer(qid, question)
    return {
        "schema": RESPONSE_SCHEMA,
        "ok": True,
        "response": {
            "model": req.get("model") or "aac6fef/laya-mlx",
            "answers": answers,
        },
    }


def main() -> int:
    raw = sys.stdin.read()
    if not raw.strip():
        fail("malformed_request", "empty stdin")
        return 0
    try:
        req = json.loads(raw)
    except json.JSONDecodeError:
        fail("malformed_request", "invalid JSON")
        return 0
    if req.get("schema") != REQUEST_SCHEMA:
        fail("malformed_request", "schema mismatch")
        return 0
    try:
        out = decide_with_laya(req)
    except ValueError as exc:
        fail("unsupported_question_type", str(exc))
        return 0
    if out:
        emit(out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
