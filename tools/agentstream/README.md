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
| `-o`, `--select-order` | Feature-spec batch filter: single `N` or inclusive `N-M` (synonym: `--feature-spec-batch-order`). |
| `-w`, `--workspace` | Workspace root (default: current directory). |
| `-m`, `--model MODEL` | Cursor agent model (default: `Auto`). |
| `-c`, `--lead-checklist-yaml` | Read-only lead checklist definition YAML; default resolves to repo `tied/docs/agent-req-implementation-checklist.yaml` when present. |
| `--checklist-tracker-yaml PATH` | Writable per-request **Authoritative Tracker** (`checklist-tracker.v1`). Requires `-c`. Must not equal the definition path. When missing on disk, agentstream materializes clean pending state including `sub-adversarial-inquiry-pass` as a top-level step row. |
| `--checklist-tracker-preview PATH` | Read-only **Tracker migration preview** (`tracker-migration-preview.v1`): slug diff vs `-c` definition; prints JSON and exits (no Tracker mutation). Requires `-c`. |
| `--adherence-ledger PATH` | Append-only **adherence ledger** (`agent-adherence-event.v1` JSONL). Default: `working/{REQ-TOKEN}/adherence/events.jsonl` when `--checklist-tracker-yaml` is set and `REQUEST` resolves a token. Stores hash/reference edges only (no prompt or response bodies). |
| `--lead-checklist-from-step`, `--lead-checklist-to-step` | Inclusive main-step bounds by slug (require `-c`). |
| `--lead-checklist-skip-sub` | Omit trailing `sub_procedures` turns. |
| `--lead-checklist-before-feature` | With both `-b` and `-c`, emit all checklist steps before all feature-spec records. |
| `--checklist-var KEY=VALUE` | Repeatable (synonym: `--lead-checklist-var`). Substitutes `{{KEY}}` in rendered checklist text. |
| `--checklist-var-strict`, `AGENTSTREAM_CHECKLIST_VAR_STRICT=1` | Fail rendering if any `{{NAME}}` remains after substitution. |
| `--skip-workspace-preload`, `AGENTSTREAM_SKIP_WORKSPACE_PRELOAD=1` | Skip prepending workspace `tied/agent-preload-contract.yaml`. |
| `-p`, `--prompt-file` | Repeatable session preload (merged with workspace preload; not a separate turn). |
| `--prompts-file`, `--tdd-yaml`, `-b` / `--feature-spec-batch-yaml` | Repeatable prompt sources. |
| `--preview-feature-spec-batch-yaml PATH` | Print expanded batch records and exit (no agent). |
| `--verify-session` | Append sentinel verification turn when supported. |
| `--agent-path PATH` | Explicit `cursor agent` binary (default: `agent` on PATH). |
| `--tied-mcp-preflight`, `AGENTSTREAM_TIED_MCP_PREFLIGHT=1` | Opt in: validate `.cursor/mcp.json` for `tied-yaml` before spawning `cursor agent` (off by default). |
| `--skip-tied-mcp-preflight`, `AGENTSTREAM_SKIP_TIED_MCP_PREFLIGHT=1` | Force skip when preflight is enabled (default is already skip). |
| `-y`, `--yes` | Non-interactive: auto-continue after preflight warnings/blocks when preflight is enabled. |
| `--mcp-json PATH` | Explicit `.cursor/mcp.json` when the workspace has multiple nested projects. |
| `--non-compact-html` | Opt-in: emit non–single-line HTML in turn body strings after load. |
| `--non-compact-html-indent N` | Stable spaces for wrapped continuation lines when `--non-compact-html` is on (0 = default). |
| `-h`, `--help` | Print usage and exit. |
| `--` then words | Extra argv words forwarded as prompt fragments. |

Positional **`FEATURE_SPEC_BATCH_YAML`** is accepted as a shorthand for `-b` (mutually exclusive with `-b`).

## Adherence operator runbook (Stages M–O)

### Active-turn marker and hook bridge

When `--checklist-tracker-yaml` and `--adherence-ledger` are set, agentstream writes `working/{REQ-TOKEN}/adherence/active-turn.json` (`active-turn-marker.v1`) after each `instruction_rendered` row and clears it after the turn handler completes. Cursor hooks (`.cursor/hooks/log.rb`) call `scripts/adherence_append_action_attempted.rb` to append **`action_attempted`** ledger rows during the subprocess window.

- **Fail-silent** when the marker is absent (non-checklist sessions unaffected).
- **Append-only** — prior ledger rows are never rewritten.
- **Privacy:** ledger stores bounded `evidence_refs` and `hook_log_ref` `{ path, line }` only — no prompt text, tool payloads, or shell output.
- **Non-implication:** `action_attempted` never proves `outcome_verified` or gate pass; hook transport success ≠ product success.

Turn order: `instruction_rendered` → `action_attempted` (hooks) → `outcome_verified` (completed) → `agent_acknowledged`.

### Reconcile CLI and MCP

Read-only adherence chain audit (`ReconcileReport`; never mutates Tracker or TIED YAML):

```bash
go build -o adherence-reconcile ./cmd/adherence-reconcile

./adherence-reconcile \
  --ledger working/REQ-TOKEN/adherence/events.jsonl \
  --tracker working/REQ-TOKEN/REQ-TOKEN_tracker.yaml \
  --gates working/REQ-TOKEN/gates \
  --workspace /path/to/repo
```

MCP tool **`tied_adherence_reconcile_run`** spawns the same Go binary (no TypeScript finding-logic port). Exit 0 even when findings are present; inspect `findings[]` in the JSON report.

Library helpers (also used by pilot/stop evaluators):

| API | Role |
|-----|------|
| `ReconcileAdherenceChain` | Deterministic finding codes from ledger + Tracker + gates + TIED indexes. |
| `RunControlledClientPilot` | Controlled-client pilot report (`adherence-pilot-report.v1`). |
| `EvaluateRolloutStop` | Observational stop evaluator (writer corruption, unbound receipt, blocking reconcile findings, checklist byte drift). |
| `PreviewTrackerMigration` | Read-only slug diff (`tracker-migration-preview.v1`) vs checklist definition. |

Tests: `go test ./tools/agentstream/checklist/... -run 'Reconcile|Rollout|Pilot|PreviewTracker|gotoClears'`

Further operator detail: [`docs/checklist-adherence-remaining-work-plan.md`](../../docs/checklist-adherence-remaining-work-plan.md).

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

### Dynamic checklist control

Live checklist turns can alter the remaining turn queue only by emitting a strict fenced JSON control block. `agentstream` ignores prose such as “GOTO flag-contradictory-specs” unless it appears inside `agentstream_control` JSON:

```json
{
  "agentstream_control": {
    "schema_version": 1,
    "action": "goto",
    "target": "flag-contradictory-specs",
    "reason": "Focused RED test passes, but existing tests fail after GREEN code.",
    "evidence": ["go test ./...: TestExistingBehavior failed"]
  }
}
```

Supported action: `goto`. The target must match a loaded checklist step slug. On a valid `goto`, the live runner clears configured `loop_back_clearance.<target>.clear_slugs` completion markers in the checklist YAML, replaces the remaining queue with turns starting at the target slug, and continues with normal `agentstream_new_session` / resume behavior.

#### Adversarial inquiry blocking findings (non-normative driver hints)

When a checklist step runs **`sub-adversarial-inquiry-pass`** with `blocking=true` and a strict-eligible policy, unresolved error-severity findings may suggest an **`agentstream_control`** GOTO target by proof boundary. These hints are **non-normative** — procedural gating remains in checklist YAML (`verification-gate`, `sub-adversarial-inquiry-pass`); driver JSON does not replace checklist branches.

| Proof boundary | Typical GOTO target |
|---|---|
| `traceability_structure`, `pseudo_code_structure`, `semantic_fidelity` | `resolve-pseudocode` |
| `executable_behavior` | `unit-test-red` (composition binding faults may route to `composition-integration`) |

Emit targets only inside fenced `agentstream_control` JSON; prose such as “GOTO resolve-pseudocode” is ignored.

```json
{
  "agentstream_control": {
    "schema_version": 1,
    "action": "goto",
    "target": "resolve-pseudocode",
    "reason": "Strict adversarial inquiry: unresolved semantic_fidelity finding",
    "evidence": ["working/REQ-EXAMPLE/adversarial-inquiry/finding-ledger.jsonl"]
  }
}
```

For executable-behavior gaps, use `"target": "unit-test-red"` with evidence from `evidence-provenance.json` or the failing test output.

## Authoritative Tracker and completion receipts (`--checklist-tracker-yaml`)

The checklist definition (`-c`) is read-only. Per-request workflow state lives in a separate **Authoritative Tracker** file passed to `--checklist-tracker-yaml`. Each checklist turn with a `StepStub` must end with a strict fenced JSON envelope (subprocess success alone never advances the run):

```json
{
  "agentstream_tracker": {
    "schema_version": 1,
    "slug": "change-definition",
    "disposition": "completed",
    "evidence_refs": ["working/REQ-X/change-definition.md"],
    "instruction_nonce": "run-1:3:a1b2c3d4e5f67890",
    "instruction_hash": "sha256:…",
    "request_token": "REQ-X",
    "run_id": "run-1"
  }
}
```

When tracker mode is on (`--checklist-tracker-yaml`), binding fields are **required** on every receipt. Agentstream hashes rendered turn `Parts` before spawning the agent, appends an `instruction_rendered` ledger row, exports `INSTRUCTION_NONCE`, `INSTRUCTION_HASH`, `REQUEST_TOKEN`, and `RUN_ID` to the agent subprocess environment, parses receipts from **final assistant text only** (thinking deltas are excluded), validates binding, then appends `agent_acknowledged` on success.

Supported dispositions: `completed` (requires `evidence_refs`), `not_applicable` (`policy` + `rationale`), `waived` (`owner`, `expiry`, `approval`, `residual_risk`). Generic `skipped` is rejected. On `agentstream_control` **goto**, the runner invalidates configured downstream Tracker rows from `loop_back_clearance` before rerouting; it does not mutate the checklist definition bytes.

**Migration:** legacy full checklist copies remain readable by the shared gate during a transition window, but new writer output uses top-level `steps` with `disposition`. Materialize a clean tracker with `--checklist-tracker-yaml` on a new path when `--lead-checklist-yaml` points at the canonical definition. Preview slug drift (including stale dispositions) with `--checklist-tracker-preview` — **read-only**; do not rewrite existing client state automatically.

Example:

```bash
agentstream -w /path/to/repo \
  -c tied/docs/agent-req-implementation-checklist.yaml \
  --checklist-tracker-yaml working/REQ-EXAMPLE/REQ-EXAMPLE_tracker.yaml \
  --checklist-var REQUEST=REQ-EXAMPLE
```

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
