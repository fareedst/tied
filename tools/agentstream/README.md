# agentstream (Go)

Unified implementation of `scripts/run-feature-batch.sh` and `tools/agent-stream/run_agent_stream.rb`: one CLI plus importable packages under module `stdd/agentstream`. Use **`scripts/run-feature-batch-agentstream.sh`** from the repo root for the same flag surface as the Ruby batch script (it sets **`AGENTSTREAM`** or runs `go run`).

## Build

```bash
cd tools/agentstream
go build -o agentstream ./cmd/agentstream
```

Requires Go 1.22+. Prefer a local build over committing a prebuilt binary.

## CLI quick reference

Run **`agentstream --help`** for the full option list. Highlights:

| Flag / env | Purpose |
|------------|---------|
| `-d`, `--dry-run` | Print turns, prompt parts, and the `cursor agent` argv per turn; exit 0 (no subprocess, no preflight prompt). |
| `-s`, `--session-id` | Resume token for turn 1 when continuing a session; **required** when `-f` / `--first-turn` is greater than 1. |
| `-f`, `--first-turn N` | 1-based first turn to run (mid-batch resume). |
| `-o`, `--select-order` | Feature-spec batch filter: single `N` or inclusive `N-M`. |
| `-w`, `--workspace` | Workspace root (default: current directory). |
| `-c`, `--lead-checklist-yaml` | Lead checklist YAML; default resolves to repo `docs/agent-req-implementation-checklist.yaml` when present. |
| `-p` / `--prompt-file`, `--prompts-file`, `--tdd-yaml`, `-b` / `--feature-spec-batch-yaml` | Repeatable prompt sources (same roles as Ruby runner). |
| `--preview-feature-spec-batch-yaml PATH` | Print expanded batch records and exit (no agent). |
| `--verify-session` | Pass-through for agent session verification when supported. |
| `--skip-tied-mcp-preflight`, `-y` / `--yes`, `AGENTSTREAM_SKIP_TIED_MCP_PREFLIGHT=1` | Bypass or auto-confirm tied-yaml preflight (needed for many CI/non-TTY runs). |
| `--mcp-json PATH` | Explicit `.cursor/mcp.json` when the workspace has multiple nested projects. |
| `--` then words | Extra argv words forwarded as prompt fragments (after other sources are merged). |

Positional **`FEATURE_SPEC_BATCH_YAML`** is accepted as a shorthand for `-b` (mutually exclusive with `-b`).

## Library usage

Import packages: `stdd/agentstream`, `stdd/agentstream/featurespec`, `stdd/agentstream/pipeline`, `stdd/agentstream/executor`, etc. See source comments for `[REQ-GOAGENT-*]` tokens.

## Lead checklist step bounds

Optional inclusive slice of main `steps` in the lead checklist YAML (by `id`, document order):

- `--lead-checklist-from-step ID` — lower bound (omit = from first step)
- `--lead-checklist-to-step ID` — upper bound (omit = through last main step)

Each flag requires a resolved `--lead-checklist-yaml` path. Sub-procedures are not filtered by these bounds (`--lead-checklist-skip-sub` still controls whether subs are appended after the sliced main steps).

## Tied-yaml preflight (before `cursor agent`)

Before the first live turn, `agentstream` checks `.cursor/mcp.json` under `--workspace` for a `tied-yaml` server entry and validates `env.TIED_BASE_PATH` (absolute path, under the workspace tree). It searches `WORKSPACE/.cursor/mcp.json` first, then `WORKSPACE/*/.cursor/mcp.json` when there is exactly one match; multiple subprojects require `--mcp-json PATH`.

This **does not** prove Cursor exposes `tied-yaml` at runtime; it catches missing or mis-pointed config that often leads to agents editing the wrong `tied/`.

- **Dry-run (`-d`)**: prints diagnostics and always exits 0 (no stdin prompt).
- **TTY + problems**: prompts `y/N` to continue.
- **Non-TTY + blocked config**: exits non-zero unless `-y` / `--yes`, `AGENTSTREAM_SKIP_TIED_MCP_PREFLIGHT=1`, or `--skip-tied-mcp-preflight`.
- **Warnings only** (e.g. greenfield without `tied/requirements.yaml`): non-TTY continues; TTY may prompt.

Flags: `--mcp-json`, `--skip-tied-mcp-preflight`, `-y` / `--yes` (see `--help`).

## TIED

Requirements and decisions: `REQ-GOAGENT-*`, `ARCH-GOAGENT-*`, `IMPL-GOAGENT-*` in `tied/`.
