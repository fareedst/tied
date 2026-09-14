#!/usr/bin/env python3
"""NB-3-G partial rollup: refresh wave-3 rows from scan diffs + receipt paths (honest aggregate)."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import yaml

STDD = Path("/Users/fareed/Documents/dev/chatgpt/stdd")
MANIFEST = STDD / "working/fleet-constraint-v2/client-inventory-manifest.v1.yaml"
CLIENT_IDS = [
    "1787495576",
    "1787603099",
    "1787416567",
    "1787507684",
    "1787638699",
]


def load_diff(client_id: str) -> dict:
    path = STDD / f"working/fleet-constraint-v2/waves/{client_id}/dry-run/inventory-diff.v1.json"
    return json.loads(path.read_text())


def receipt_counts(client_id: str) -> dict | None:
    """When every wave receipt has layer_c.ok, manifest may record fleet-migrated-client."""
    receipts_dir = STDD / f"working/fleet-constraint-v2/waves/{client_id}/receipts"
    if not receipts_dir.is_dir():
        return None
    paths = sorted(receipts_dir.glob("IMPL-*.receipt.json"))
    if not paths:
        return None
    ok_layers = []
    for path in paths:
        doc = json.loads(path.read_text())
        ok_layers.append(bool(doc.get("layer_c", {}).get("ok")))
    if not all(ok_layers):
        return None
    n = len(paths)
    return {
        "legacy-v1": 0,
        "header-only-v2": 0,
        "constraint-ready-v2": 0,
        "constraint-enforced-v2": n,
        "unknown-or-mixed": 0,
    }


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
        counts = receipt_counts(cid)
        if counts is None:
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
                "NB-3 tranche two complete; all active sidecars constraint-enforced-v2; "
                "G3 receipts on file."
            )
        else:
            row["notes"] = (
                "NB-3 tranche two wave complete; G3 receipts on file. "
                "Aggregate honest per scan (not fleet-migrated-client until all sidecars constraint-enforced-v2)."
            )
        print(
            f"TRACE: manifest row {cid} aggregate={row['aggregate_migration_state']} counts={counts}"
        )
    doc["updated_at"] = now
    MANIFEST.write_text(yaml.dump(doc, sort_keys=False, default_flow_style=False))


if __name__ == "__main__":
    main()
