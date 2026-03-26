# Optional inferred LEAP proposal queue (human review)

## Goal

Borrow Plumb-style **extract → review → approve/reject/edit** for **optional** documentation hints. Proposals are **not** canonical `[REQ-*]` / `[ARCH-*]` / `[IMPL-*]` records until a human or an explicit agent applies LEAP updates through normal TIED workflows.

## Defaults

- **Off at the tool boundary**: `tied_leap_proposal_extract_diff` and `tied_leap_proposal_import_session` require `explicit_opt_in: true`.
- **No LLM and no API keys** for built-in extraction: diff extraction is deterministic (git `+` lines); session import splits text or JSON arrays.
- **No automatic approval** and **no writes to project TIED YAML** from these tools. After you edit YAML via MCP (`yaml_index_*`, detail writers, etc.), run `lint_yaml` on changed files and `tied_validate_consistency`.

## Storage

Under the **project root** (default `process.cwd()`), not under `tied/`:

| Path | Purpose |
| --- | --- |
| `leap-proposals/queue.json` | Current proposals with stable ids (`lp-…`) |
| `leap-proposals/audit-log.jsonl` | Append-only audit (`schema_version: leap-proposal-audit.v1`) |

## Lifecycle

1. **Add** — `tied_leap_proposal_add` (manual), or opt-in **extract** / **session import**.
2. **Edit** (optional) — `tied_leap_proposal_update` while `pending`.
3. **Reject** — `tied_leap_proposal_reject` (pending only): queue + audit update; **no** TIED YAML change.
4. **Approve** — `tied_leap_proposal_approve`: marks ready for LEAP; **still** no YAML write.
5. **Apply LEAP** — use existing MCP YAML tools (IMPL → ARCH → REQ as appropriate).
6. **Mark applied** — `tied_leap_proposal_mark_applied` after YAML edits are done.

## MCP tools

| Tool | Writes TIED YAML? |
| --- | --- |
| `tied_leap_proposal_list` | No |
| `tied_leap_proposal_queue_snapshot` | No |
| `tied_leap_proposal_add` | No |
| `tied_leap_proposal_extract_diff` | No |
| `tied_leap_proposal_import_session` | No |
| `tied_leap_proposal_update` | No |
| `tied_leap_proposal_reject` | No |
| `tied_leap_proposal_approve` | No |
| `tied_leap_proposal_mark_applied` | No |

## Out of scope

Full Plumb parity (e.g. `plumb modify`-style code rewrite), multi-tenant sync, and **automatic** promotion of inferred text to canonical REQ/ARCH/IMPL without review.
