#!/usr/bin/env python3
"""
One-time: move IMPL detail essence_pseudocode to IMPL-TOKEN-pseudocode.md
and remove from tied/implementation-decisions/IMPL-*.yaml and index rows
in tied/implementation-decisions.yaml. Idempotent: skips if no inline essence in YAML.

If some IMPLs had `essence_pseudocode` only in the old index and not in the
detail file, re-create the missing *-pseudocode.md from git, e.g. from the last
index commit: extract `essence_pseudocode` for each IMPL-* and write
`tied/implementation-decisions/IMPL-TOKEN-pseudocode.md` when missing.
"""
from __future__ import annotations

import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
IMPL_DIR = ROOT / "tied" / "implementation-decisions"
INDEX = ROOT / "tied" / "implementation-decisions.yaml"


def _migrate_impl_detail_yaml(path: Path) -> bool:
    raw = path.read_text(encoding="utf-8")
    data = yaml.safe_load(raw)
    if not isinstance(data, dict) or not data:
        return False
    changed = False
    for k, v in list(data.items()):
        if not isinstance(k, str) or not k.startswith("IMPL-") or not isinstance(v, dict):
            continue
        ep = v.get("essence_pseudocode")
        if "essence_pseudocode" not in v:
            continue
        changed = True
        if isinstance(ep, str) and len(ep) > 0:
            (IMPL_DIR / f"{k}-pseudocode.md").write_text(ep, encoding="utf-8", newline="\n")
        v.pop("essence_pseudocode", None)
    if changed:
        out = yaml.dump(
            data,
            allow_unicode=True,
            default_flow_style=False,
            sort_keys=False,
            width=1_000_000,
        )
        path.write_text(out, encoding="utf-8", newline="\n")
    return changed


def _migrate_index() -> bool:
    if not INDEX.exists():
        return False
    data = yaml.safe_load(INDEX.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        return False
    changed = False
    for k, v in list(data.items()):
        if not isinstance(k, str) or not k.startswith("IMPL-") or not isinstance(v, dict):
            continue
        if "essence_pseudocode" not in v:
            continue
        v.pop("essence_pseudocode", None)
        changed = True
    if changed:
        out = yaml.dump(
            data,
            allow_unicode=True,
            default_flow_style=False,
            sort_keys=False,
            width=1_000_000,
        )
        INDEX.write_text(out, encoding="utf-8", newline="\n")
    return changed


def main() -> int:
    if not IMPL_DIR.is_dir():
        print("missing", IMPL_DIR, file=sys.stderr)
        return 2
    n = 0
    for path in sorted(IMPL_DIR.glob("IMPL-*.yaml")):
        if _migrate_impl_detail_yaml(path):
            n += 1
            print("migrated", path.relative_to(ROOT))
    if _migrate_index():
        n += 1
        print("migrated", INDEX.relative_to(ROOT))
    if n == 0:
        print("nothing to migrate (no inline essence_pseudocode in IMPL detail YAMLs / index)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
