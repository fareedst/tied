# Ordered-list audit inventory (pass 2 verified)

**Token:** `ORDERED-LIST-AUDIT-2026-10-23`  
**Related:** [REQ-CITDP_ORDERED_LIST_KEYS], [ARCH-CITDP_ORDERED_LIST_KEYS], [IMPL-CITDP_ORDERED_KEY_VALIDATE], [REQ-TIED_YAML_CANONICALIZATION]

| Layer | Path pattern | Keys reviewed | Semantic class | Action |
| --- | --- | --- | --- | --- |
| CITDP corpus | `tied-project/citdp/CITDP-*.yaml` | `command_seq`, `verification_command_seq`, … | ordered_command | Already migrated (rename `--check` green) |
| CITDP template | `tied-bundle/docs/citdp-record-template.yaml` | `command_seq` | ordered_command | No change |
| Checklist master | `tied-bundle/docs/agent-req-implementation-checklist.yaml` | `operator_evidence.command_seq` (added) | ordered_command | Template normative key added |
| Trackers (11) | `*tracker*.yaml` under `tied-project/working/` | `evidence`, `operator_evidence`, `close_out_evidence.verification` | ordered_command | Renamed via `rename-citdp-command-keys.mjs --include-trackers` |
| Per-request checklists (9) | `agent-req-implementation-checklist*.yaml` | same nested close-out / operator paths | ordered_command | Renamed |
| Bootstrap slice | `REQ-TIED_BOOTSTRAP_DETAIL_INTEGRITY_20260825.yaml` | `close_out_evidence.verification_command_seq` | ordered_command | Renamed |
| FIX tracker | `FIX-TIED_CYCLES_OK_FIELD/tracker.yaml` | `verification_command_seq` | ordered_command | Renamed |
| JEV citdp-docs (2) | `citdp-doc-jev-*.yaml` | `evidence.command_seq` | ordered_command | Renamed |
| Metrics observation | `REQ-DEFERRED_STATS_ROADMAP/.../metrics-summary.yaml` | `sample_args_summary.commands` (object field, not a shell list) | metadata / N/A | **No rename** — not an ordered shell battery |
| Gate / workflow | `phases`, `dispositions`, `completed` | set-like | unordered_set | **No rename** (deferred decision) |

**Mechanical remediation:** 32 tracker/checklist YAML files touched across two rename passes (top-level + nested close-out / slice evidence paths).
