#!/usr/bin/env python3
"""Rewrite agent-req-implementation-checklist.yaml: slug-only steps, clear_slugs, sub-* procedure slugs."""
from __future__ import annotations

import pathlib
import re
import sys

SID_TO_SLUG = {
    "S04": "author-requirement",
    "S05": "author-architecture",
    "S06.1": "catalog-pseudocode-contracts",
    "S06.2": "flag-insufficient-specs",
    "S06.3": "flag-contradictory-specs",
    "S06.4": "resolve-pseudocode",
    "S06.5": "apply-token-comments",
    "S06.5a": "gate-pseudocode-validation",
    "S06.6": "persist-implementation-records",
    "S07": "risk-assessment",
    "S08": "test-strategy",
    "S09.RED": "unit-test-red",
    "S09.GREEN": "unit-test-green",
    "S09.REFACTOR": "unit-refactor",
    "S09.SYNC": "three-way-alignment-unit",
    "S10": "composition-integration",
    "S11": "end-to-end-ui",
    "S12": "verification-gate",
    "S13": "sync-tied-stack",
}


def migrate(text: str) -> str:
    text = text.replace("yaml-edit-validation-loop", "sub-yaml-edit-loop")
    text = text.replace("pseudocode-validation-pass", "sub-pseudocode-validation-pass")
    text = text.replace("leap-micro-cycle", "sub-leap-micro-cycle")

    for sid, slug in SID_TO_SLUG.items():
        text = re.sub(rf"^(\s*)- {re.escape(sid)}$", rf"\1- {slug}", text, flags=re.MULTILINE)

    text = text.replace("clear_ids:", "clear_slugs:")

    lines = text.split("\n")
    out: list[str] = []
    i = 0
    while i < len(lines):
        line = lines[i]

        mid = re.match(r"^(\s+)- id: (S[\w.]+|SUB-[A-Z0-9-]+)\s*$", line)
        if mid and i + 1 < len(lines):
            nxt = lines[i + 1]
            sm = re.match(r"^(\s+)slug: ([a-z0-9.-]+)\s*$", nxt)
            if sm:
                out.append(f"{mid.group(1)}- slug: {sm.group(2)}")
                i += 2
                continue

        cm = re.match(r"^(\s+)# id (S[\w.]+|SUB-[A-Z0-9-]+) time\s*$", line)
        if cm:
            j = i + 1
            while j < len(lines) and lines[j].strip() == "":
                j += 1
            if j < len(lines):
                lm = re.match(r"^\s+- slug: ([a-z0-9.-]+)\s*$", lines[j])
                if lm:
                    out.append(f"{cm.group(1)}# slug {lm.group(1)} time")
                    i += 1
                    continue

        out.append(line)
        i += 1

    text = "\n".join(out)

    text = text.replace(
        "loop_back_clearance.<target>.clear_ids",
        "loop_back_clearance.<target>.clear_slugs",
    )

    return text


def main() -> None:
    paths = [pathlib.Path(p) for p in sys.argv[1:]]
    if not paths:
        paths = [pathlib.Path("docs/agent-req-implementation-checklist.yaml")]
    for path in paths:
        raw = path.read_text(encoding="utf-8")
        path.write_text(migrate(raw), encoding="utf-8")
        print(f"updated {path}")


if __name__ == "__main__":
    main()
