# Traceable commit — FIX-LINT-TIED-TEST-ALL

## Vocab VALIDATE

Ad-hoc infrastructure fix; no new domain terms. Existing terms: **linked install**, **lint_tied**, **yaml_tool**.

## Verification

| Check | Result |
| --- | --- |
| `bash -n scripts/build-commands.sh scripts/yaml_tool.sh` | pass |
| `source scripts/build-commands.sh && lint_tied` with cwd=`bkpdir` (linked client) | pass |
| `scripts/lint_yaml.sh -F tied-bundle` from bkpdir cwd | pass |

## Hygiene

- Receipt: [git-hygiene-receipt-2026-10-22.md](git-hygiene-receipt-2026-10-22.md)

## Gates

No REQ-scoped Tracker or envelope for this ad-hoc fix wave.
