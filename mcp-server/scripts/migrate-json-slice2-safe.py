#!/usr/bin/env python3
"""Conservative JSON slice 2 migration for mcp-server/src production TS."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src"
SKIP = {
    "storage-dump.ts",
    "yaml-canonicalizer.ts",
    "consistency-validator.ts",
    "validation-suite.ts",
    "yaml-client-formatter.ts",
    "tools/index.ts",
}
SKIP_PARTS = ("/e2e/",)


def iter_ts() -> list[Path]:
    out: list[Path] = []
    for p in ROOT.rglob("*.ts"):
        if p.name.endswith(".test.ts"):
            continue
        if p.name in SKIP or any(part in str(p) for part in SKIP_PARTS):
            continue
        out.append(p)
    return out


def insert_import(text: str, rel: str, names: set[str]) -> str:
    if not names:
        return text
    if "storage-dump.js" in text:
        return text
    imp = f'import {{ {", ".join(sorted(names))} }} from "{rel}";\n'
    m = re.match(r"^(\s*(?:/\*\*[\s\S]*?\*/\s*)?)", text)
    if m:
        return m.group(1) + imp + text[m.end() :]
    return imp + text


def storage_import_path(file: Path) -> str:
    import os

    rel = os.path.relpath(ROOT / "storage-dump.ts", file.parent).replace("\\", "/")
    if not rel.startswith("."):
        rel = "./" + rel
    return rel.replace(".ts", ".js")


def migrate_text(text: str) -> tuple[str, set[str]]:
    names: set[str] = set()
    out = text

    def repl_pretty(m: re.Match[str]) -> str:
        names.add("prettyCanonicalJson")
        return f"prettyCanonicalJson({m.group(1)})"

    out = re.sub(r"JSON\.stringify\(([\s\S]*?), null, 2\)", repl_pretty, out)

    if ".update(JSON.stringify(" in out:
        names.add("stableJsonForHash")
        out = out.replace(".update(JSON.stringify(", ".update(stableJsonForHash(")

    out = re.sub(
        r"fs\.writeFileSync\(([^,]+), `\$\{JSON\.stringify\(([\s\S]*?), null, 2\)\}\\n`",
        lambda m: (names.add("safeStringifyJson") or f"fs.writeFileSync({m.group(1)}, safeStringifyJson({m.group(2)}"),
        out,
    )
    out = re.sub(
        r"writeFileSync\(([^,]+), `\$\{JSON\.stringify\(([\s\S]*?), null, 2\)\}\\n`",
        lambda m: (names.add("safeStringifyJson") or f"writeFileSync({m.group(1)}, safeStringifyJson({m.group(2)}"),
        out,
    )
    out = re.sub(
        r"fs\.writeFileSync\(([^,]+), JSON\.stringify\(([\s\S]*?), null, 2\)",
        lambda m: (names.add("safeStringifyJson") or f"fs.writeFileSync({m.group(1)}, safeStringifyJson({m.group(2)}"),
        out,
    )
    out = re.sub(
        r"return `\$\{JSON\.stringify\(([\s\S]*?), null, 2\)\}\\n`",
        lambda m: (names.add("safeStringifyJson") or f"return safeStringifyJson({m.group(1)})"),
        out,
    )
    return out, names


def main() -> None:
    changed = 0
    for path in iter_ts():
        before = path.read_text()
        if "JSON.stringify" not in before and "storage-dump.js" in before:
            continue
        after, names = migrate_text(before)
        if after == before:
            continue
        rel = storage_import_path(path)
        after = insert_import(after, rel, names)
        path.write_text(after)
        changed += 1
        print(path.relative_to(ROOT))
    print("changed", changed)


if __name__ == "__main__":
    main()
