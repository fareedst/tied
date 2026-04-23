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
| `-c`, `--lead-checklist-yaml` | Lead checklist YAML; default resolves to repo `tied/docs/agent-req-implementation-checklist.yaml` when present. |
| `--lead-checklist-before-feature` | With both `-b` and `-c`, emit all checklist steps before all feature-spec records (default is feature-spec first). |
| `--checklist-var KEY=VALUE` | Repeatable (synonym: `--lead-checklist-var`). Substitutes **`{{KEY}}`** in rendered lead checklist text (`goals`, `tasks`, step `title`, flow branch prose, etc.). Split on the **first** `=` so values may contain `=`. Missing keys leave `{{KEY}}` unchanged unless strict mode applies. |
| `--checklist-var-strict`, `AGENTSTREAM_CHECKLIST_VAR_STRICT=1` | Fail rendering if any `{{NAME}}` remains after substitution (forgotten vars). |
| (no flag) + optional file | **`--workspace`/`agent-preload-contract.yaml`:** if that file **exists** (e.g. after the lead checklist’s ARCH/IMPL steps create it), the CLI **always** prepends it as the first session preload, **before** any explicit `-p` paths, so a generated contract is not skipped by passing other prompt files. If the file does not exist (early in a TIED run), no default preload is added. |
| `--skip-workspace-preload`, `AGENTSTREAM_SKIP_WORKSPACE_PRELOAD=1` | Skip prepending the workspace `agent-preload-contract.yaml` even when present (e.g. tests, tooling). |
| `-p` / `--prompt-file` | Repeatable, **merged after** the workspace `agent-preload-contract.yaml` when that file exists (deduplicated if you pass the same path again). Each file’s contents are **prepended** (one `agent` argv part per file) on **every turn that starts a new Cursor session** (no effective `--resume`), including after a feature-spec record that breaks the chain. Not a separate pipeline turn (turn counts omit prompt-only steps). |
| `--prompts-file`, `--tdd-yaml`, `-b` / `--feature-spec-batch-yaml` | Repeatable prompt sources (same roles as Ruby runner). |
| `--preview-feature-spec-batch-yaml PATH` | Print expanded batch records and exit (no agent). |
| `--verify-session` | Pass-through for agent session verification when supported. |
| `--tied-mcp-preflight`, `AGENTSTREAM_TIED_MCP_PREFLIGHT=1` | Opt in: validate `.cursor/mcp.json` for `tied-yaml` before spawning `cursor agent` (off by default). |
| `--skip-tied-mcp-preflight`, `AGENTSTREAM_SKIP_TIED_MCP_PREFLIGHT=1` | Force skip when preflight is enabled (default is already skip). |
| `-y` / `--yes` | Non-interactive: auto-continue after preflight warnings/blocks when preflight is enabled. |
| `--mcp-json PATH` | Explicit `.cursor/mcp.json` when the workspace has multiple nested projects (only used with preflight). |
| `--` then words | Extra argv words forwarded as prompt fragments (after other sources are merged). |

Positional **`FEATURE_SPEC_BATCH_YAML`** is accepted as a shorthand for `-b` (mutually exclusive with `-b`).

## Library usage

Import packages: `stdd/agentstream`, `stdd/agentstream/featurespec`, `stdd/agentstream/pipeline`, `stdd/agentstream/executor`, etc. See source comments for `[REQ-GOAGENT-*]` tokens.

## Pipeline turn order (feature-spec vs lead checklist)

[`pipeline.Build`](pipeline/pipeline.go) concatenates sources in this order: argv fragments → `--prompt-file` is **not** extra turns (see below) → `--tdd-yaml` → then **by default** **`--feature-spec-batch-yaml`** → **`--lead-checklist-yaml`**.

**Default:** when both `-b` and `-c` are present, **feature-spec records become the earliest turns**, then all checklist steps (often starting with `session-bootstrap`). Drivers such as [`scripts/tasd.sh`](../scripts/tasd.sh) that embed a batch **and** a full checklist should use **orientation-only** text in the first feature record if they keep default order: an imperative `## Behavior` (“write the script now”) is turn 1 and runs **before** the checklist can enforce TIED / pseudo-code / RED.

**`--lead-checklist-before-feature`:** when set **with both** `-b` and `-c`, **all lead checklist turns run first**, then **all** feature-spec records. That makes turn 1 the first checklist step but moves the feature batch to **after** `traceable-commit` (trailing turns). Many drivers only need `--checklist-var` for story text and can omit `-b` when using this flag to avoid junk tail turns.

Use `## Goal` for high-level intent, `## Rules` for hard constraints, and avoid implementation language in turn 1 unless you intend the agent to act before the checklist (default order).

### `scripts/tasd.sh` (lead checklist driver)

[`scripts/tasd.sh`](../scripts/tasd.sh) bootstraps a fresh workspace (`copy_files.sh`), then runs agentstream with the lead REQ checklist and preset `--checklist-var` sponsor text (`CHANGE_TITLE`, `FEATURE_GOAL`, `FEATURE_BEHAVIOR_SUMMARY`). Optional **target** is the second positional argument (default `hello`):

| Target | Intent |
|--------|--------|
| `hello` | Bash hello-world exercise |
| `unitconv-cf` | Celsius/Fahrenheit converter (Goal 1; own R→A→I run) |
| `unitconv-general` | General unit converter (Goal 2; separate run from Goal 1) |

Example: `scripts/tasd.sh my-run unitconv-cf --dry-run`. Further flags pass through to agentstream unchanged.

## Lead checklist step bounds

Optional inclusive slice of main `steps` in the lead checklist YAML (by step `slug`, YAML document order):

- `--lead-checklist-from-step SLUG` — lower bound (omit = from first step)
- `--lead-checklist-to-step SLUG` — upper bound (omit = through last main step)

Each flag requires a resolved `--lead-checklist-yaml` path. Sub-procedures are not filtered by these bounds (`--lead-checklist-skip-sub` still controls whether subs are appended after the sliced main steps).

### `agentstream_new_session` (optional, per step or sub-procedure)

Checklist items may set **`agentstream_new_session: true`** next to `slug` in the lead checklist YAML. For that turn, the pipeline sets `ChainFromPrevious: false`, so the driver runs **`cursor agent` without `--resume` for that turn** (a new session). Omitted or `false` continues the previous turn’s session (default). Sub-procedures support the same key. **`--session-id` applies only to turn 1** (the first turn after `--first-turn` slicing); mid-pipeline new sessions do not reuse a prior `session_id` for that specific turn. See [tied/docs/agent-req-implementation-checklist.md](../../tied/docs/agent-req-implementation-checklist.md) (“Suggested session handoffs”) for which canonical steps set the flag.

### Sub-procedures and duplicate turns (`--lead-checklist-skip-sub`)

By default, **after** every main checklist step (through `traceable-commit`), the loader **appends** each entry in `sub_procedures` as its own turn (`sub-yaml-edit-loop`, `sub-pseudocode-validation-pass`, `sub-leap-micro-cycle`, …). Those procedures are **also** meant to run when a parent step says `CALL <slug>` during the main flow—so full checklist runs often get **duplicate** subs at the end.

- Prefer **`--lead-checklist-skip-sub`** when you want **one turn per main step only** and rely on `CALL` semantics inside each step for subs.
- If subs are included, agents should treat trailing sub turns as **no-op** unless new TIED/YAML work is pending (see `tied/docs/agent-req-implementation-checklist.yaml` description / `traceable-commit` tasks).

## Lead checklist placeholders (`{{KEY}}`)

Static checklist YAML can include tokens such as `{{REQ_TOKEN}}` or `{{CHANGE_TITLE}}`. Pass values at invocation time:

```bash
agentstream -d -w /path/to/repo -c tied/docs/agent-req-implementation-checklist.yaml \
  --checklist-var REQ_TOKEN=REQ-HELLO_SCRIPT \
  --checklist-var CHANGE_TITLE='Hello World script' \
  --checklist-var-strict
```

Machine-oriented flow targets (`next`, `CALL`, branch `target`) are **not** expanded—only human-readable fields—so GOTO/CALL semantics stay valid.

The Ruby runner `tools/agent-stream/run_agent_stream.rb` accepts the same `--checklist-var` / `--checklist-var-strict` flags (see `tools/agent-stream/lib/agent_stream_argv.rb`).

## Feature-spec batch YAML (`-b` / `--feature-spec-batch-yaml`)

Each list record must include **`feature_name`** and **`goal`**. Optional fields are merged into the rendered prompt in a fixed order: header (`#` or `# [order] name`), **`## Goal`**, optional **`## Behavior`** (free-form description of what to implement; block scalars supported), then **`## Rules`**, **`## Examples`**, **`## Boundary conditions`**, **`## Out of scope`** when present. Use **`behavior`** for concrete product or script instructions; use **`goal`** for higher-level intent. When this batch is combined with `--lead-checklist-yaml`, see **Pipeline turn order** above—by default **`behavior` on the first record is turn 1** and runs before `session-bootstrap`; with **`--lead-checklist-before-feature`**, feature-spec turns follow the **entire** checklist. Lead-checklist **`{{KEY}}`** substitution is separate—pass `--checklist-var` only when the checklist YAML contains matching placeholders.

## Optional tied-yaml preflight (before `cursor agent`)

**By default, preflight is off** — agents should not rely on scanning `.cursor/mcp.json`; `copy_files.sh` installs the Cursor skill under `.cursor/skills/tied-yaml/` but does **not** create `mcp.json`. Enable validation only when you want it: `--tied-mcp-preflight` or `AGENTSTREAM_TIED_MCP_PREFLIGHT=1`.

When enabled, `agentstream` checks `.cursor/mcp.json` under `--workspace` for a `tied-yaml` server entry and validates `env.TIED_BASE_PATH` (absolute path, under the workspace tree). It searches `WORKSPACE/.cursor/mcp.json` first, then `WORKSPACE/*/.cursor/mcp.json` when there is exactly one match; multiple subprojects require `--mcp-json PATH`.

This **does not** prove Cursor exposes `tied-yaml` at runtime; it catches missing or mis-pointed config that often leads to agents editing the wrong `tied/`.

- **Dry-run (`-d`)**: prints diagnostics and always exits 0 (no stdin prompt).
- **TTY + problems**: prompts `y/N` to continue.
- **When preflight is enabled, non-TTY + blocked config**: exits non-zero unless `-y` / `--yes`, `AGENTSTREAM_SKIP_TIED_MCP_PREFLIGHT=1`, or `--skip-tied-mcp-preflight`.
- **When preflight is enabled, warnings only** (e.g. greenfield without `tied/requirements.yaml`): non-TTY continues; TTY may prompt.

Flags when using preflight: `--mcp-json`, `--skip-tied-mcp-preflight`, `-y` / `--yes` (see `--help`).

## TIED

Requirements and decisions: `REQ-GOAGENT-*`, `ARCH-GOAGENT-*`, `IMPL-GOAGENT-*` in `tied/`.
