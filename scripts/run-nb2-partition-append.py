#!/usr/bin/env python3
"""Ensure NB-2 external G3 waves exist in fleet-wave-partition.v1.yaml."""
from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path

import yaml

STDD = Path("/Users/fareed/Documents/dev/chatgpt/stdd")
PARTITION = STDD / "working/fleet-constraint-v2/fleet-wave-partition.v1.yaml"
CLIENT_IDS = [
    "1786637885",
    "1786643714",
    "1788547701",
    "1787421852",
    "1787461685",
]


def wave_entry(client_id: str) -> dict:
    wid = f"W-ext-{client_id}-1"
    return {
        "client_ids": [client_id],
        "gate_stage": "G3",
        "max_sidecars": 10,
        "notes": "NB-2 tranche one (od-nb2-acceptance accepted); header-only-v2 wave.",
        "receipts_dir": f"working/fleet-constraint-v2/waves/{client_id}/receipts",
        "sidecar_list_path": f"working/fleet-constraint-v2/waves/{client_id}/wave-1-sidecars.yaml",
        "wave_id": wid,
        "wave_status": "planned",
    }


def main() -> None:
    doc = yaml.safe_load(PARTITION.read_text()) or {}
    waves = doc.setdefault("waves", [])
    existing = {w.get("wave_id") for w in waves}
    added = []
    for client_id in CLIENT_IDS:
        wid = f"W-ext-{client_id}-1"
        if wid in existing:
            print(f"DEBUG: partition already has {wid}")
            continue
        waves.append(wave_entry(client_id))
        added.append(wid)
    if added:
        doc["updated_at"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
        PARTITION.write_text(yaml.dump(doc, sort_keys=False, default_flow_style=False))
    print(f"TRACE: partition append added={added}")


if __name__ == "__main__":
    main()
