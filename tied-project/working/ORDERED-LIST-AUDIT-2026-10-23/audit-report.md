# Audit report — ORDERED-LIST-AUDIT-2026-10-23

**Profile:** `minimal` / gate policy `advisory`  
**Date:** 2026-10-23

## Summary

Hygiene slice completed: legacy ordered-command keys removed from in-scope tracker/checklist YAML under `tied-project/working/`, repeatable audit tooling added, and nested close-out / operator evidence paths covered in `transformCitdpOrderedListKeys`.

## Verification battery (AUD-CHK)

| ID | Command | Result |
| --- | --- | --- |
| AUD-CHK-001 | `node scripts/rename-citdp-command-keys.mjs --check` | exit 0 |
| AUD-CHK-001b | `node scripts/rename-citdp-command-keys.mjs --check --include-trackers` | exit 0 |
| AUD-CHK-002 | `node scripts/audit-ordered-yaml-lists.mjs --check` | exit 0 |
| AUD-UNIT-001 | `npm test --prefix mcp-server` | pass |
| AUD-UNIT-002 | `citdp-ordered-keys.test.ts` operator_evidence rename | pass |
| Consistency | `tied_validate_consistency` | `ok: true` |

## Audit JSONL

| Metric | Value |
| --- | --- |
| Total classified rows | 5487 |
| Post-remediation `ordered_command` + legacy key violations | **0** |
| Lexically sorted shell-like `command_seq` (review hints) | see JSONL filter; documented in `semantic-decisions.md` |

Artifact: `ordered-list-audit.jsonl` (regenerate with `node scripts/audit-ordered-yaml-lists.mjs`).

## Code / tooling changes

- `scripts/audit-ordered-yaml-lists.mjs` — JSONL inventory + `--check` gate.
- `scripts/rename-citdp-command-keys.mjs` — `--include-trackers` glob coverage.
- `mcp-server/src/citdp-ordered-keys.ts` — nested `execution_evidence` paths (operator, close-out, slice `*_evidence`).

## Docs

- `tied-bundle/docs/agent-req-implementation-checklist.yaml` — normative `operator_evidence.command_seq`.
- `TODO.md` — ordered-list note marked done with `command_seq` example.

## Close-out status

**Verification complete; close-out deferred** (no commit per non-tied-plan default). Machine close-out envelope not required at `minimal` depth.
