# Semantic decisions — ordered list audit

## Preserved without rename

| Path | Key | Rationale |
| --- | --- | --- |
| `tied-project/working/REQ-DEFERRED_STATS_ROADMAP/v1-observation/metrics-summary.yaml` | `sample_args_summary.commands` | MCP args **shape** metadata (`_bytes`, `_length`), not a normative shell-command sequence. Lexical sort of sibling keys is immaterial. |
| Checklist / gate YAML | `phases`, `dispositions`, `completed` | Document order is not proven normative for gate phase enumeration; treated as unordered sets for canonicalizer purposes until a separate sponsor decision. |

## Order recovery evidence (git spot-check)

| Path | Parent commit | Finding |
| --- | --- | --- |
| `REQ-TIED_CHECKLIST_GATE_ENFORCEMENT_tracker.yaml` → `execution_evidence.operator_evidence` | `6b99ac2^` vs `HEAD` | **Document order unchanged** after `commands` → `command_seq` rename (10 entries, identical sequence). |
| `REQ-TIED_YAML_CANONICALIZATION_record-aware_tracker.yaml` | `6b99ac2^` vs `HEAD` | Spot-check: `close_out_evidence.verification.command_seq` order matches pre-rename `verification.commands`. |
| `REQ-TIED_BOOTSTRAP_DETAIL_INTEGRITY_20260825.yaml` | `6b99ac2^` vs `HEAD` | `verification_command_seq` list order matches prior `verification_commands`. |

## Ambiguous lexically sorted `command_seq` (manual review)

Many CITDP `evidence.command_seq` batteries are **alphabetically sorted** but were authored under `command_seq` (or migrated earlier with order preserved in git). Alphabetical order alone is **not** treated as proof of silent reorder. Rows flagged in `ordered-list-audit.jsonl` (`lexically_sorted: true`, `length >= 2`, `looks_like_shell: true`) are **review hints only**; no order changes applied in this slice.

## Follow-up (out of slice)

- Write-time validation for tracker YAML (would be a new REQ).
- Renaming `phases` / `dispositions` to `*_seq` only after procedure text proves document order is normative.
