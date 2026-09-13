#!/usr/bin/env python3
"""NB-1-E: client verification + close_out gates (mirrors enrolled external run-gates pattern)."""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

CLIENT_IDS = [
    "1786636023",
    "1786637086",
    "1786666674",
    "1787503424",
    "1789087315",
]
RUN_ID = "nb1-tranche-zero-20260913"
REQ = "REQ-PSEUDOCODE_MIGRATION"


def tied_call(root: Path, tool: str, args: dict) -> dict:
    cli = root / ".cursor/skills/tied-yaml/scripts/tied-cli.sh"
    proc = subprocess.run(
        [str(cli), tool, json.dumps(args)],
        capture_output=True,
        text=True,
        cwd=root,
    )
    if proc.returncode != 0:
        raise RuntimeError(f"{tool} failed: {proc.stderr or proc.stdout}")
    return json.loads(proc.stdout)


def load_yaml(path: Path) -> dict:
    import yaml

    with path.open() as f:
        return yaml.safe_load(f)


def build_tracker(phase: str) -> dict:
    evidence = f"working/{REQ}/adversarial-inquiry/phase-{phase}/"
    slugs = [
        "change-definition",
        "gate-pseudocode-validation",
        "verification-gate",
        "close-out",
    ]
    return {
        "steps": [
            {"slug": slug, "disposition": "completed", "evidence_refs": [evidence]}
            for slug in slugs
        ]
    }


def build_citdp(root: Path, phase: str) -> dict:
    citdp = load_yaml(root / f"tied/citdp/CITDP-{REQ}.yaml")
    key = next(iter(citdp))
    doc = citdp[key]
    doc.setdefault("completion_criteria", {})["activation"] = {
        "request_token": REQ,
        "run_id": RUN_ID,
        "phase": phase,
        "project_id": root.name,
    }
    return {key: doc}


def run_client(root: Path) -> dict:
    gates = root / f"working/{REQ}/gates"
    gates.mkdir(parents=True, exist_ok=True)
    outcomes = {}
    for phase in ("verification", "close_out"):
        collected = tied_call(
            root,
            "tied_checklist_activation_collect",
            {
                "request_token": REQ,
                "phase": phase,
                "run_id": RUN_ID,
                "project_root": str(root),
            },
        )
        if not collected.get("ok"):
            outcomes[phase] = False
            print(f"TRACE: {root.name} collect {phase} failed")
            continue

        gate = tied_call(
            root,
            "tied_checklist_gate_validate",
            {
                "phase": phase,
                "tracker": build_tracker(phase),
                "citdp": build_citdp(root, phase),
                "activation": {
                    "receipt": collected["receipt"],
                    "artifacts": collected["artifacts"],
                    "expected": collected["expected"],
                },
                "receipt_persistence": {
                    "request_token": REQ,
                    "gates_dir": f"working/{REQ}/gates",
                    "ledger_path": f"working/{REQ}/gates/gate-ledger.jsonl",
                    "run_id": RUN_ID,
                },
            },
        )
        (gates / f"{phase}-result.json").write_text(json.dumps(gate, indent=2) + "\n")
        outcomes[phase] = bool(gate.get("allowed"))
        print(
            f"TRACE: {root.name} {phase} allowed={gate.get('allowed')} diagnostics={gate.get('diagnostics', [])[:2]}"
        )
    return outcomes


def main() -> None:
    summary = {}
    for cid in CLIENT_IDS:
        summary[cid] = run_client(Path(f"/Users/fareed/Documents/dev/test/{cid}"))
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
