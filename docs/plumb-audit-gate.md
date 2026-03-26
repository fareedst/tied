# Plumb Audit Gate (Preview + Gap Checks)

## Goal
Provide an opt-in voluntary gate that:
1. Runs **preview** (order 2): deterministic Plumb-style diff impact preview.
2. Runs **gap checks** (order 3): traceability gap report over the project’s effective roots.
3. Writes one append-only audit JSONL line per invocation under `plumb-audit/audit-log.jsonl`.
4. Optionally blocks commits (pre-commit hook) or CI runs, based on a documented failure policy.

## Where the audit log lives
`plumb-audit/audit-log.jsonl`

Each line is one JSON object (JSONL). The log is append-only; the gate never rewrites prior entries.

### Log schema (v1)
Fields written by the gate:
- `schema_version`: `"plumb-audit-gate-log.v1"`
- `timestamp`: ISO 8601 time of the gate invocation
- `attempt`: `{ attempt_id, source, policy, override_applied }`
- `command`: `{ argv, cwd }`
- `effective_roots` (from gap checks): roots + ignore_source + walk stats
- `pass`: boolean (true when enabled traceability gap dimensions report no gaps)
- `commit_allowed`: boolean (whether the gate would allow the commit/CI step)
- `blocked`: boolean (policy strict + gaps + no override)
- `preview`: summary references (`preview.summary_ref`) not full diffs
- `gap`: summary references (`gap.summary_ref`) not full diffs
- On internal tool errors: `fail_reason` + `tool_error`

## Failure policy (opt-in)
Controlled by `--policy` and (for hooks) `PLUMB_AUDIT_GATE_POLICY`.

- `warn-only` (default):
  - Writes audit log entries.
  - Never blocks commits (even if gaps exist).
  - Must not block on internal tool errors.
- `strict`:
  - Blocks only when **enabled traceability gap dimensions** report gaps.
  - Internal tool errors block as well (because policy is strict).

### Override behavior
To allow a strict commit attempt despite failures:
- set `PLUMB_AUDIT_GATE_OVERRIDE=1`
The audit line still records `pass`/`blocked` outcomes.

## Local / pre-commit hook (optional)
Install:
```bash
./scripts/install-plumb-audit-gate-hook.sh
```

Enable strict blocking:
```bash
PLUMB_AUDIT_GATE_POLICY=strict ./scripts/install-plumb-audit-gate-hook.sh
```

Pre-commit uses:
- `--source pre-commit`
- `--selection staged`

## CI step (optional)
Because CI checkouts usually have no staged/unstaged diffs, the gate supports a CI diff-base mode:

Example (compare `origin/main`..`HEAD`):
```bash
npm -C mcp-server run build
node mcp-server/dist/cli/plumb-audit-gate.js \
  --policy strict \
  --source ci \
  --selection staged \
  --diff-base origin/main
```

If your environment uses different base refs, set `--diff-base` accordingly.

## Boundary conditions
Rebases / amends:
- The audit log uses a per-invocation **`attempt_id`** (not commit SHA) so repeated commit attempts after rebase/amend remain distinct in the audit trail.

Team members without the hook installed:
- The hook is opt-in; the gate does not assume missing hooks imply malicious intent.
- CI remains the backstop when you run the CI gate in `--policy strict` mode.

