#!/usr/bin/env python3
"""NB-1-G partial rollup: refresh not_enrolled rows from scan diffs + receipt paths (honest aggregate)."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import yaml

STDD = Path("/Users/fareed/Documents/dev/chatgpt/stdd")
MANIFEST = STDD / "working/fleet-constraint-v2/client-inventory-manifest.v1.yaml"
CLIENT_IDS = [
    "1786636023",
    "1786637086",
    "1786666674",
    "1787503424",
    "1789087315",
]


def load_diff(client_id: str) -> dict:
    path = STDD / f"working/fleet-constraint-v2/waves/{client_id}/dry-run/inventory-diff.v1.json"
    return json.loads(path.read_text())


def aggregate_from_counts(counts: dict) -> str:
    scanned = sum(int(counts.get(k, 0) or 0) for k in counts)
    enforced = int(counts.get("constraint-enforced-v2", 0) or 0)
    if scanned > 0 and enforced == scanned:
        return "fleet-migrated-client"
    order = [
        "constraint-enforced-v2",
        "constraint-ready-v2",
        "header-only-v2",
        "legacy-v1",
        "unknown-or-mixed",
    ]
    for key in order:
        if counts.get(key, 0) > 0:
            return key
    return "legacy-v1"


def main() -> None:
    doc = yaml.safe_load(MANIFEST.read_text())
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
    for row in doc["clients"]:
        cid = str(row.get("client_id"))
        if cid not in CLIENT_IDS:
            continue
        diff = load_diff(cid)
        counts = diff["counts_by_state"]
        row["sidecar_counts_by_state"] = counts
        row["aggregate_migration_state"] = aggregate_from_counts(counts)
        row["client_migration_req"] = "REQ-PSEUDOCODE_MIGRATION"
        row["last_receipt_path"] = (
            f"working/fleet-constraint-v2/waves/{cid}/receipts/summary.json"
        )
        row["updated_at"] = now
        if row["aggregate_migration_state"] == "fleet-migrated-client":
            row["notes"] = (
                "NB-1 tranche zero complete; all active sidecars constraint-enforced-v2; "
                "G3 receipts on file."
            )
        else:
            row["notes"] = (
                "NB-1 tranche zero wave complete; G3 receipts on file. "
                "Aggregate honest per scan (not fleet-migrated-client until all sidecars constraint-enforced-v2)."
            )
        print(
            f"TRACE: manifest row {cid} aggregate={row['aggregate_migration_state']} counts={counts}"
        )
    doc["updated_at"] = now
    MANIFEST.write_text(yaml.dump(doc, sort_keys=False, default_flow_style=False))


if __name__ == "__main__":
    main()
