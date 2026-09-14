#!/usr/bin/env python3
"""NB-4-C: spawn client-owned REQ-PSEUDOCODE_MIGRATION stack (NB-4 tranche final)."""
from __future__ import annotations

import json
from pathlib import Path

import yaml

STDD = Path("/Users/fareed/Documents/dev/chatgpt/stdd")
CLIENTS: dict[str, list[str]] = {
    "1787691672": [
        "IMPL-SERVICE_REPORT_CLI",
        "IMPL-REPORT_FORMATTER",
        "IMPL-NETWORK_LISTENER_COLLECTOR",
        "IMPL-LAUNCHD_COLLECTOR",
        "IMPL-PROCESS_RUNNER",
    ],
    "1787626480": [
        "IMPL-ARCHIVEINFO-CLI-CMD",
        "IMPL-ARCHIVEINFO-CONFIG",
        "IMPL-ARCHIVEINFO-FORMAT-DETECT",
        "IMPL-ARCHIVEINFO-GLOB",
        "IMPL-ARCHIVEINFO-READ",
        "IMPL-ARCHIVEINFO-FORMAT-OUT",
    ],
}


def wave_id(client_id: str) -> str:
    return f"W-ext-{client_id}-1"


def ensure_index_entry(index_path: Path, token: str, entry: dict) -> None:
    data = yaml.safe_load(index_path.read_text()) or {}
    if token in data:
        print(f"DEBUG: {index_path.name} already has {token}")
        return
    data[token] = entry
    index_path.write_text(yaml.dump(data, sort_keys=False, default_flow_style=False))


def spawn_client(client_id: str, impl_tokens: list[str]) -> None:
    impl_token = impl_tokens[0]
    root = Path(f"/Users/fareed/Documents/dev/test/{client_id}")
    wid = wave_id(client_id)
    summary_metric = (
        f"working/fleet-constraint-v2/waves/{client_id}/receipts/summary.json"
    )

    req_detail = root / "tied/requirements/REQ-PSEUDOCODE_MIGRATION.yaml"
    req_detail.parent.mkdir(parents=True, exist_ok=True)
    req_detail.write_text(
        yaml.dump(
            {
                "REQ-PSEUDOCODE_MIGRATION": {
                    "category": "Functional",
                    "description": f"NB-4 Track B tranche final; wave {wid}.",
                    "name": "Fleet constraint v2 migration (client wave close-out)",
                    "priority": "P1",
                    "satisfaction_criteria": [
                        {
                            "criterion": "Wave sidecars constraint-enforced-v2 with G3 layer_c.ok",
                            "id": "SC-CLIENT-P4-MIGRATION-001",
                            "metric": summary_metric,
                        }
                    ],
                    "status": "Planned",
                    "traceability": {
                        "architecture": ["ARCH-PSEUDOCODE_MIGRATION"],
                        "implementation": [impl_token, "IMPL-PSEUDOCODE_MIGRATION"],
                    },
                }
            },
            sort_keys=False,
        )
    )

    arch_detail = root / "tied/architecture-decisions/ARCH-PSEUDOCODE_MIGRATION.yaml"
    arch_detail.write_text(
        yaml.dump(
            {
                "ARCH-PSEUDOCODE_MIGRATION": {
                    "cross_references": {"requirements": ["REQ-PSEUDOCODE_MIGRATION"]},
                    "decision": "Client defers to orchestrator fleet program; local REQ records proof boundary for NB-4 G3 wave.",
                    "name": "Pseudocode migration (client fleet wave)",
                    "status": "Accepted",
                }
            },
            sort_keys=False,
        )
    )

    impl_detail = root / "tied/implementation-decisions/IMPL-PSEUDOCODE_MIGRATION.yaml"
    impl_detail.write_text(
        yaml.dump(
            {
                "IMPL-PSEUDOCODE_MIGRATION": {
                    "cross_references": {
                        "architecture": ["ARCH-PSEUDOCODE_MIGRATION"],
                        "requirements": ["REQ-PSEUDOCODE_MIGRATION"],
                    },
                    "implementation_approach": "Documentation-only migration close-out; no runtime code change.",
                    "name": "Migration close-out orchestration (client)",
                    "status": "Planned",
                }
            },
            sort_keys=False,
        )
    )

    citdp_path = root / "tied/citdp/CITDP-REQ-PSEUDOCODE_MIGRATION.yaml"
    citdp_path.parent.mkdir(parents=True, exist_ok=True)
    citdp_path.write_text(
        yaml.dump(
            {
                "CITDP-REQ-PSEUDOCODE_MIGRATION": {
                    "change_definition": {
                        "current_behavior": "Sidecar header-only-v2 before NB-4 G3 enforce",
                        "desired_behavior": "constraint-enforced-v2 with orchestrator G3 receipts",
                        "non_goals": ["Orchestrator REQ close_out", "Product code changes"],
                        "success_criteria": ["G3 layer_c.ok on all wave sidecars"],
                    },
                    "completion_criteria": {
                        "verification_gate_notes": summary_metric,
                    },
                    "risk_analysis": {
                        "adversarial_inquiry": {
                            "assurance_profile": "baseline-functional",
                            "close_out_inquiry_waiver": "Fleet pseudo-code migration only; minimal depth.",
                            "counterexamples": [
                                "Inventory aggregate fleet-migrated-client while a wave receipt has layer_c.ok false"
                            ],
                            "depth_tier": "minimal",
                            "profile_depth": "minimal",
                            "disconfirming_observations": [
                                "Orchestrator summary.json missing impl_token receipt path"
                            ],
                            "evidence_references": [
                                "working/REQ-PSEUDOCODE_MIGRATION/evidence/pseudocode-g3-manifest.v1.json"
                            ],
                            "falsification_questions": [
                                "Can client claim fleet-migrated-client without G3 layer_c.ok on wave sidecars?"
                            ],
                            "gate_policy": "blocking",
                            "rationale": "NB-4 fleet pseudo-code migration close-out.",
                        }
                    },
                }
            },
            sort_keys=False,
        )
    )

    ensure_index_entry(
        root / "tied/requirements.yaml",
        "REQ-PSEUDOCODE_MIGRATION",
        {
            "category": "Functional",
            "description": f"NB-4 fleet migration evidence for client {client_id} wave {wid}.",
            "detail_file": "requirements/REQ-PSEUDOCODE_MIGRATION.yaml",
            "name": "Fleet constraint v2 migration (client wave close-out)",
            "priority": "P1",
            "related_requirements": {
                "depends_on": ["REQ-TIED_SETUP"],
                "related_to": [],
                "supersedes": [],
            },
            "status": "Planned",
            "traceability": {
                "architecture": ["ARCH-PSEUDOCODE_MIGRATION"],
                "implementation": [impl_token, "IMPL-PSEUDOCODE_MIGRATION"],
            },
        },
    )

    ensure_index_entry(
        root / "tied/architecture-decisions.yaml",
        "ARCH-PSEUDOCODE_MIGRATION",
        {
            "cross_references": {"requirements": ["REQ-PSEUDOCODE_MIGRATION"]},
            "detail_file": "architecture-decisions/ARCH-PSEUDOCODE_MIGRATION.yaml",
            "name": "Pseudocode migration (client fleet wave)",
            "status": "Accepted",
        },
    )

    ensure_index_entry(
        root / "tied/implementation-decisions.yaml",
        "IMPL-PSEUDOCODE_MIGRATION",
        {
            "cross_references": {
                "architecture": ["ARCH-PSEUDOCODE_MIGRATION"],
                "requirements": ["REQ-PSEUDOCODE_MIGRATION"],
            },
            "detail_file": "implementation-decisions/IMPL-PSEUDOCODE_MIGRATION.yaml",
            "name": "Migration close-out orchestration (client)",
            "status": "Planned",
        },
    )

    work = root / "working/REQ-PSEUDOCODE_MIGRATION"
    work.mkdir(parents=True, exist_ok=True)
    checklist = work / "agent-req-implementation-checklist.yaml"
    if not checklist.exists():
        checklist.write_text(
            yaml.dump(
                {
                    "request": "REQ-PSEUDOCODE_MIGRATION",
                    "profile": {"depth_tier": "minimal", "gate_policy": "blocking"},
                    "execution_evidence": {
                        "request": "REQ-PSEUDOCODE_MIGRATION",
                        "completed": [],
                    },
                    "steps": [
                        {
                            "slug": "sub-adversarial-inquiry-pass",
                            "disposition": "not_applicable",
                            "policy": "minimal-depth-no-inquiry",
                        },
                        {
                            "slug": "gate-pseudocode-validation",
                            "disposition": "pending",
                        },
                        {
                            "slug": "verification-gate",
                            "disposition": "pending",
                        },
                    ],
                },
                sort_keys=False,
            )
        )

    evidence_dir = work / "evidence"
    evidence_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = evidence_dir / "pseudocode-g3-manifest.v1.json"
    manifest_path.write_text(
        json.dumps(
            {
                "schema_version": 1,
                "wave_id": wid,
                "orchestrator_repo": str(STDD),
                "orchestrator_g3_summary": summary_metric,
                "impl_tokens": impl_tokens,
                "proof_boundary": "Authoritative G3 receipts in stdd orchestrator repo",
            },
            indent=2,
        )
        + "\n"
    )
    print(f"TRACE: NB-4-C spawned {client_id} {impl_tokens}")


def main() -> None:
    for client_id, impl_tokens in CLIENTS.items():
        spawn_client(client_id, impl_tokens)


if __name__ == "__main__":
    main()
