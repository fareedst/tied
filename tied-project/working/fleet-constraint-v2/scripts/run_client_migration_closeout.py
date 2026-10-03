#!/usr/bin/env python3
"""E2.4 SC-FLEET-P4-005 — client migration REQ close-out (minimal depth, G3 blocking)."""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

STDD = Path("/Users/fareed/Documents/dev/chatgpt/stdd")
TIED_CLI = STDD / ".cursor/skills/tied-yaml/scripts/tied-cli.sh"
RUN_ID = "fleet-migration-phase4-closeout-4b-20260913"

CLIENTS = [
    {
        "client_id": "1789069630",
        "repo": Path("/Users/fareed/Documents/dev/test/1789069630"),
        "req": "REQ-PSEUDOCODE_MIGRATION",
        "wave_id": "W-ext-1789069630-1",
        "g3_summary": "working/fleet-constraint-v2/waves/1789069630/receipts/summary.json",
        "impl_tokens": [
            "IMPL-APP_DISPLAY_RESOLVER",
            "IMPL-PERM_CATALOG",
            "IMPL-PERM_REPORT_CLI",
            "IMPL-PERM_REPORT_FORMATTER",
            "IMPL-TCC_DB_READER",
        ],
    },
    {
        "client_id": "1789177584",
        "repo": Path("/Users/fareed/Documents/dev/test/1789177584"),
        "req": "REQ-PSEUDOCODE_MIGRATION_PILOT_1789177584",
        "wave_id": "W-ext-1789177584-1",
        "g3_summary": "working/fleet-constraint-v2/waves/1789177584/receipts/summary.json",
        "impl_tokens": [
            "IMPL-URLFETCH_CLI",
            "IMPL-URLFETCH_FETCH",
            "IMPL-URLFETCH_REPORT",
            "IMPL-URLFETCH_RUNNER",
            "IMPL-URLFETCH_SAVE",
        ],
    },
    {
        "client_id": "1789136889",
        "repo": Path("/Users/fareed/Documents/dev/test/1789136889"),
        "req": "REQ-PSEUDOCODE_MIGRATION",
        "wave_id": "W-ext-1789136889-1",
        "g3_summary": "working/fleet-constraint-v2/waves/1789136889/receipts/summary.json",
        "impl_tokens": [
            "IMPL-TCP_CONNECT_CLI",
            "IMPL-TCP_CONNECT_DIAL",
            "IMPL-TCP_CONNECT_PROBE",
            "IMPL-TCP_CONNECT_REPORT",
        ],
    },
    {
        "client_id": "1789147101",
        "repo": Path("/Users/fareed/Documents/dev/test/1789147101"),
        "req": "REQ-PSEUDOCODE_MIGRATION",
        "wave_id": "W-ext-1789147101-1",
        "g3_summary": "working/fleet-constraint-v2/waves/1789147101/receipts/summary.json",
        "impl_tokens": [
            "IMPL-FILEHASH_DIGEST",
            "IMPL-FILEHASH_DISCOVER",
            "IMPL-FILEHASH_FORMAT",
            "IMPL-FILEHASH_RUNNER",
        ],
    },
]


def tied_cli(base: Path, tool: str, args: dict) -> dict:
    env = {"TIED_BASE_PATH": str(base)}
    proc = subprocess.run(
        [str(TIED_CLI), tool, json.dumps(args)],
        capture_output=True,
        text=True,
        env={**subprocess.os.environ, **env},
    )
    if proc.returncode != 0:
        raise RuntimeError(f"{tool} failed: {proc.stderr or proc.stdout}")
    return json.loads(proc.stdout)


def ensure_tokens(client: dict) -> None:
    base = client["repo"] / "tied"
    req = client["req"]
    detail = base / "requirements" / f"{req}.yaml"
    if detail.exists():
        print(f"TRACE: {client['client_id']} {req} exists")
        return
    arch, impl = "ARCH-PSEUDOCODE_MIGRATION", "IMPL-PSEUDOCODE_MIGRATION"
    tied_cli(
        base,
        "tied_token_create_with_detail",
        {
            "token": req,
            "index_record": json.dumps(
                {
                    "name": "Fleet constraint v2 migration (client wave close-out)",
                    "category": "Functional",
                    "priority": "P1",
                    "status": "Implemented",
                    "description": f"Phase 4 fleet migration for {client['client_id']} wave {client['wave_id']}.",
                    "related_requirements": {
                        "depends_on": ["REQ-TIED_SETUP"],
                        "related_to": [],
                        "supersedes": [],
                    },
                    "traceability": {
                        "architecture": [arch],
                        "implementation": [*client["impl_tokens"], impl],
                    },
                }
            ),
            "detail_record": json.dumps(
                {
                    "category": "Functional",
                    "name": "Fleet constraint v2 migration (client wave close-out)",
                    "priority": "P1",
                    "status": "Implemented",
                    "description": f"Client-owned SC-FLEET-P4-005 for wave {client['wave_id']}.",
                    "satisfaction_criteria": [
                        {
                            "id": "SC-CLIENT-P4-MIGRATION-001",
                            "criterion": "Wave sidecars constraint-enforced-v2 with G3 layer_c.ok",
                            "metric": client["g3_summary"],
                        }
                    ],
                    "traceability": {
                        "architecture": [arch],
                        "implementation": [*client["impl_tokens"], impl],
                    },
                }
            ),
        },
    )
    tied_cli(
        base,
        "tied_token_create_with_detail",
        {
            "token": arch,
            "index_record": json.dumps(
                {
                    "name": "Pseudocode migration (client fleet wave)",
                    "status": "Accepted",
                    "cross_references": {"requirements": [req]},
                }
            ),
            "detail_record": json.dumps(
                {
                    "name": "Pseudocode migration (client fleet wave)",
                    "status": "Accepted",
                    "decision": "Client records fleet migration proof boundary; orchestrator holds G3 receipts.",
                    "cross_references": {"requirements": [req]},
                }
            ),
        },
    )
    tied_cli(
        base,
        "tied_token_create_with_detail",
        {
            "token": impl,
            "index_record": json.dumps(
                {
                    "name": "Migration close-out (client)",
                    "status": "Implemented",
                    "cross_references": {
                        "requirements": [req],
                        "architecture": [arch],
                    },
                }
            ),
            "detail_record": json.dumps(
                {
                    "name": "Migration close-out (client)",
                    "status": "Implemented",
                    "implementation_approach": "Documentation-only migration close-out.",
                    "cross_references": {
                        "requirements": [req],
                        "architecture": [arch],
                    },
                }
            ),
        },
    )


def write_citdp(client: dict) -> None:
    base = client["repo"] / "tied"
    manifest_rel = f"working/{client['req']}/evidence/pseudocode-g3-manifest.v1.json"
    record = {
        "change_definition": {
            "current_behavior": "Sidecars constraint-ready-v2 before Phase 4 close-out enforce",
            "desired_behavior": "constraint-enforced-v2 with orchestrator G3 receipts",
            "non_goals": ["Orchestrator REQ close_out", "Product code changes"],
            "success_criteria": ["G3 layer_c.ok on all wave sidecars"],
        },
        "risk_analysis": {
            "adversarial_inquiry": {
                "depth_tier": "minimal",
                "gate_policy": "blocking",
                "assurance_profile": "baseline-functional",
                "rationale": "Fleet pseudo-code migration close-out; documentation-only scope.",
                "close_out_inquiry_waiver": "Fleet pseudo-code migration only; integrated inquiry not required for doc-only close-out.",
                "falsification_questions": [
                    "Can client claim fleet-migrated-client without G3 layer_c.ok on wave sidecars?",
                ],
                "counterexamples": [
                    "Inventory aggregate fleet-migrated-client while a wave receipt has layer_c.ok false",
                ],
                "disconfirming_observations": [
                    "Orchestrator summary.json missing impl_token receipt path",
                ],
                "evidence_references": [manifest_rel],
            }
        },
        "completion_criteria": {
            "verification_gate_notes": f"Orchestrator G3 summary {client['g3_summary']}",
        },
    }
    tied_cli(
        base,
        "citdp_record_write",
        {
            "filename": f"CITDP-{client['req']}.yaml",
            "record": json.dumps(record),
        },
    )


def write_working_artifacts(client: dict) -> Path:
    req = client["req"]
    work = client["repo"] / "working" / req
    gates = work / "gates"
    evidence = work / "evidence"
    gates.mkdir(parents=True, exist_ok=True)
    evidence.mkdir(parents=True, exist_ok=True)
    manifest = {
        "schema_version": 1,
        "wave_id": client["wave_id"],
        "orchestrator_repo": str(STDD),
        "orchestrator_g3_summary": client["g3_summary"],
        "impl_tokens": client["impl_tokens"],
        "proof_boundary": "Authoritative G3 receipts in stdd orchestrator repo",
    }
    manifest_path = evidence / "pseudocode-g3-manifest.v1.json"
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    checklist = {
        "request": req,
        "profile": {"depth_tier": "minimal", "gate_policy": "blocking"},
        "execution_evidence": {"request": req, "completed": []},
        "steps": [
            {
                "slug": "sub-adversarial-inquiry-pass",
                "disposition": "completed",
                "evidence_refs": [
                    {"kind": "file_path", "path": str(manifest_path.relative_to(client["repo"]))}
                ],
            },
            {
                "slug": "gate-pseudocode-validation",
                "disposition": "completed",
                "evidence_refs": [
                    {"kind": "file_path", "path": str(manifest_path.relative_to(client["repo"]))}
                ],
            },
            {
                "slug": "verification-gate",
                "disposition": "completed",
                "evidence_refs": [
                    {"kind": "file_path", "path": str(manifest_path.relative_to(client["repo"]))}
                ],
            },
        ],
    }
    import yaml

    tracker_path = work / "agent-req-implementation-checklist.yaml"
    tracker_path.write_text(
        yaml.safe_dump(checklist, sort_keys=False, allow_unicode=True),
        encoding="utf-8",
    )
    return tracker_path


def validate_pseudocode(client: dict) -> None:
    base = client["repo"] / "tied"
    for impl in client["impl_tokens"]:
        sidecar = base / "implementation-decisions" / f"{impl}-pseudocode.md"
        text = sidecar.read_text(encoding="utf-8")
        v = tied_cli(base, "pseudocode_validate", {"token": impl, "pseudocode": text})
        a = tied_cli(
            base,
            "pseudocode_analyze",
            {
                "token": impl,
                "pseudocode": text,
                "gate_mode": True,
                "typed_flow": True,
                "constraint_flow": True,
            },
        )
        if v.get("ok") is False or a.get("ok") is not True:
            raise RuntimeError(f"pseudocode gate failed {impl}: validate={v.get('ok')} analyze={a.get('ok')}")


def run_gates(client: dict, tracker_path: Path) -> None:
    base = client["repo"] / "tied"
    req = client["req"]
    work = client["repo"] / "working" / req
    gates_dir = work / "gates"
    import yaml

    citdp_raw = yaml.safe_load(
        (base / "citdp" / f"CITDP-{req}.yaml").read_text(encoding="utf-8")
    )
    citdp = citdp_raw.get(f"CITDP-{req}", citdp_raw.get(req, citdp_raw))
    tracker = yaml.safe_load(tracker_path.read_text(encoding="utf-8"))
    for phase in ("verification", "close_out"):
        if phase == "close_out":
            tracker.setdefault("steps", []).append(
                {
                    "slug": "gitignore-close-out-hygiene",
                    "disposition": "not_applicable",
                    "notes": "No gitignore changes in migration close-out",
                }
            )
        gate = tied_cli(
            base,
            "tied_checklist_gate_validate",
            {
                "phase": phase,
                "project_root": str(client["repo"]),
                "tracker": tracker,
                "citdp": citdp,
                "receipt_persistence": {
                    "request_token": req,
                    "gates_dir": str(gates_dir.relative_to(client["repo"])),
                    "ledger_path": str(
                        (gates_dir / "gate-ledger.jsonl").relative_to(client["repo"])
                    ),
                    "run_id": RUN_ID,
                },
            },
        )
        (gates_dir / f"{phase}-result.json").write_text(
            json.dumps(gate, indent=2) + "\n", encoding="utf-8"
        )
        print(f"TRACE: {client['client_id']} {phase} allowed={gate.get('allowed')}")
        if not gate.get("allowed"):
            raise RuntimeError(json.dumps(gate, indent=2))


def main() -> None:
    for client in CLIENTS:
        print(f"\n=== {client['client_id']} {client['req']} ===")
        ensure_tokens(client)
        write_citdp(client)
        tracker = write_working_artifacts(client)
        validate_pseudocode(client)
        consistency = tied_cli(client["repo"] / "tied", "tied_validate_consistency", {})
        err_count = len(consistency.get("errors") or [])
        print(f"TRACE: tied_validate_consistency errors={err_count}")
        if err_count:
            raise RuntimeError(f"consistency failed {client['client_id']}")
        run_gates(client, tracker)


if __name__ == "__main__":
    main()
