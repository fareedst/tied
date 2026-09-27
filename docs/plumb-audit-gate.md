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

### Log schema (v1 — default)
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

### Log schema (v2 — optional BBCE locality spike, W2)

When **`--locality-report`** or **`PLUMB_AUDIT_LOCALITY=1`** is set **and** both `--declared-change-surface` and `--slice-map` are provided, the gate writes **`plumb-audit-gate-log.v2`** instead of v1 for that invocation. v1 behavior is unchanged when the flag is unset.

Additional fields (compact — no full path dumps):

- `locality_summary_ref`: stable id + `scenario_id`, `owning_slice_req`, `change_locality`, counts (`unexpected_paths_count`, `shared_mechanism_touches_count`, `slice_crossings_count`, `total_changed_files`)
- `locality`: same compact metrics block (duplicate for log readers without hash id)

Optional append-only longitudinal JSONL via **`--locality-event-jsonl PATH`** (`bbce-locality-event.v1`).

**W2 policy:** locality metrics are **advisory** — they do not change `commit_allowed`, `blocked`, or strict traceability gap policy.

Example:

```bash
PLUMB_AUDIT_LOCALITY=1 node mcp-server/dist/cli/plumb-audit-gate.js \
  --policy warn-only \
  --selection staged \
  --declared-change-surface working/PLAN-TIED-BBCE-ALIGNMENT/pilot/declared-change-surface-claude-live.v1.yaml \
  --slice-map tied/analysis/agentstream-slice-map.yaml \
  --locality-event-jsonl working/PLAN-TIED-BBCE-ALIGNMENT/change-locality/w2-plumb-events.jsonl \
  --repo-root .
```

See `tied/analysis/README.md` and `docs/tied-bbce-alignment-plan.md` (Mechanism A).

**W4 operator paths (optional, default off):**

| Path | When |
| --- | --- |
| `working/{CHANGE-ID}/change-locality/*.jsonl` | Per-change pilot (`bbce-locality-event.v1`) via `--locality-event-jsonl` |
| `plumb-audit/audit-log.jsonl` | Repo operator log when gate runs with locality (v2 line) |
| `PLUMB_AUDIT_LOCALITY=1` or `--locality-report` | Enable locality block on a single invocation — **not** a CI mandate |

Dual-write to both pilot JSONL and repo audit log is optional; sponsors opt in per change. Mechanism D checklist bundle references these paths when `bbce_advisory_enforced` is true.

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

