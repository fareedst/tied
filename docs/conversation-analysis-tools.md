# Ruby tools for Cursor hook logs and transcripts

This repository ships Ruby scripts under `scripts/` for **offline** processing of Cursor hook export YAML (typically `~/.cursor/logs/conv_*.yaml`): shrinking files, summarizing activity, and extracting structured signals for review or research.

**Convention:** Run commands from the **repository root** unless noted. Paths to logs use your machine’s `~/.cursor/logs/` layout.

**Primary input shape:** Hook logs are a **top-level YAML sequence** of records (line-oriented: each record starts with an unindented `- `). Several tools stream record-by-record so multi-gigabyte files stay tractable. They strip embedded `transcript:` subtrees before parsing each record when full transcript text is not needed.

**Data source:** Hook records are usually produced by the Cursor hook in [`.cursor/hooks/log.rb`](../.cursor/hooks/log.rb), which appends normalized YAML under `~/.cursor/logs/`.

---

## Shared libraries (no CLI)

These are required by other scripts; you do not run them directly.

| Module | File | Role |
| --- | --- | --- |
| `CursorHookLogStream` | [`scripts/cursor_hook_log_stream.rb`](../scripts/cursor_hook_log_stream.rb) | Split hook logs into per-record strings; strip `transcript:` / `transcript_path:` in a streaming, O(1)-memory way. |
| `TranscriptLongTextDedupe` | [`scripts/transcript_long_text_dedupe.rb`](../scripts/transcript_long_text_dedupe.rb) | Find long text under `content` keys, assign SHA256-based digests, collapse duplicates. |
| `TranscriptYamlPrune` | [`scripts/transcript_yaml_prune.rb`](../scripts/transcript_yaml_prune.rb) | Post-order prune of empty or noisy keys (used after dedupe and in the hook). |

---

## Preprocessing

### `strip_transcripts.rb`

**Purpose:** Remove embedded `transcript:` blocks and `transcript_path:` lines from hook YAML files in place (streaming, low memory).

**Flags:**

- `--dry-run` — Print byte savings; do not write.
- `--backup` — Keep `path.strip.bak` after a successful replace (default removes backup).

**Examples:**

```bash
ruby scripts/strip_transcripts.rb --dry-run ~/.cursor/logs/conv_someid.yaml
ruby scripts/strip_transcripts.rb --backup ~/.cursor/logs/conv_someid.yaml
```

### `dedupe_transcript_yaml.rb`

**Purpose:** Deduplicate long (3+ lines) text anywhere a `content` key appears in the YAML tree, using 16-hex SHA256 digests; optionally prune empty / redundant keys.

**Flags:**

- `--dry-run` — Parse and dedupe in memory; print stats only.
- `--keep-backup` — Keep `path.dedupe.bak` after success.
- `--force` — Overwrite an existing `path.dedupe.bak`.
- `--no-prune-keys` — Disable post-dedupe pruning (default is to prune).

**Examples:**

```bash
ruby scripts/dedupe_transcript_yaml.rb --dry-run ~/.cursor/logs/conv_someid.yaml
ruby scripts/dedupe_transcript_yaml.rb --keep-backup ~/.cursor/logs/conv_someid.yaml
```

---

## Metrics and summaries

### `analyze_hook_log.rb`

**Purpose:** Stream through hook logs (transcript stripped per record), emit one YAML report per file on **stdout** (events, tools, failures, redundant reads, session metadata, etc.). With `--aggregate`, also writes a merged summary YAML to **stderr**.

**Flags:**

- `-g`, `--glob PATTERN` — Add files matching glob (repeatable); `~` expands.
- `--dir PATH` — All `*.yaml` in `PATH` (combine with `--min-size` to filter).
- `--min-size SIZE` — Only files ≥ size (e.g. `512K`, `1M`, `100M`).
- `--aggregate` — After per-file YAML on stdout, print full merged summary on stderr.

**Examples:**

```bash
ruby scripts/analyze_hook_log.rb ~/.cursor/logs/conv_someid.yaml
ruby scripts/analyze_hook_log.rb --dir ~/.cursor/logs --min-size 1M
ruby scripts/analyze_hook_log.rb --glob '~/.cursor/logs/conv_*.yaml' --aggregate 2>/tmp/hook-summary.yaml
```

---

## Extractors (hook logs)

All of the following accept **file arguments** and optional **`--files-from PATH`** (newline-separated paths; `#` comments and blank lines ignored). They use streaming record parsing where applicable.

### `extract_user_prompts.rb`

**Purpose:** Extract user prompts from `beforeSubmitPrompt` records (`normalized.details.prompt`).

**Flags:**

- `--regex REGEX` — Ruby regexp filter (required unless `--no-regex`).
- `--ignore-case` — Case-insensitive regex.
- `--no-regex` — Emit all prompts from the given files.
- `--files-from PATH` — Extra file list (repeatable).

**Examples:**

```bash
ruby scripts/extract_user_prompts.rb --no-regex ~/.cursor/logs/conv_*.yaml
ruby scripts/extract_user_prompts.rb --regex 'TIED|yaml' --ignore-case ~/.cursor/logs/conv_someid.yaml
```

### `extract_agent_struggle_phrases.rb`

**Purpose:** Scan `afterAgentThought` / `afterAgentResponse` text for weighted “struggle” phrase patterns; output one YAML list with match metadata.

**Flags:**

- `--max-per-record N` — Cap matches per record (default `5`).
- `--files-from PATH` — Repeatable.

**Example:**

```bash
ruby scripts/extract_agent_struggle_phrases.rb --max-per-record 5 ~/.cursor/logs/conv_someid.yaml > phrases.yaml
```

### `extract_repeated_tool_calls.rb`

**Purpose:** Group tool invocations by signature (tool name + stable JSON of `tool_input`); list signatures seen multiple times across `preToolUse` / `postToolUse` / `postToolUseFailure`.

**Flags:**

- `--min-count N` — Minimum occurrences to emit (default `2`).
- `--files-from PATH` — Repeatable.

**Example:**

```bash
ruby scripts/extract_repeated_tool_calls.rb --min-count 3 ~/.cursor/logs/conv_someid.yaml > repeats.yaml
```

### `extract_tool_failure_bursts.rb`

**Purpose:** Find bursts of consecutive `postToolUseFailure` events for the same conversation, generation, and tool within a time window; include nearest preceding `beforeSubmitPrompt` as anchor text.

**Flags:**

- `--window-seconds N` — Max gap between failures in one burst (default `180`).
- `--min-failures N` — Minimum failures in a burst (default `2`).
- `--files-from PATH` — Repeatable.

**Example:**

```bash
ruby scripts/extract_tool_failure_bursts.rb --window-seconds 180 --min-failures 2 ~/.cursor/logs/conv_someid.yaml > bursts.yaml
```

### `extract_struggle_episodes.rb`

**Purpose:** Segment logs into “episodes” (prompt boundaries, epoch gaps, `stop` events), score each episode with heuristics (tool failures, repeated inputs, read thrash, text signals, etc.).

**Flags:**

- `--gap-seconds N` — Split when epoch gap exceeds N (default `120`).
- `--min-score N` — Only emit episodes with `struggle_score >= N`.
- `--format FMT` — `ndjson` (default, one JSON object per line) or `yaml` (single list document).
- `--files-from PATH` — Repeatable.

**Examples:**

```bash
ruby scripts/extract_struggle_episodes.rb ~/.cursor/logs/conv_someid.yaml > episodes.ndjson
ruby scripts/extract_struggle_episodes.rb --gap-seconds 300 --min-score 10 --format yaml ~/.cursor/logs/conv_someid.yaml
```

---

## Other input: `extract_queries.rb`

**Purpose:** Extract unique user query bodies from **transcript** YAML where assistant message content includes `<user_query>...</user_query>` tags.

**Important:** This script is **not** tailored to hook log shape. It reads the **entire input** via ARGF (stdin or file args), `YAML.safe_load`s it as a top-level array of records with `transcript` → `message` → `content` arrays. Use it on exports that still contain full transcript structure.

**Flags:** None.

**Examples:**

```bash
ruby scripts/extract_queries.rb < export.yaml
ruby scripts/extract_queries.rb export.yaml
```

---

## Docs build: `citdp_hook_log_evidence_build.rb`

**Purpose:** From repo root, regenerate CITDP ↔ hook-log correlation artifacts under `docs/` (markdown table + TSV), using `docs/citdp/CITDP-*.yaml` and optional `~/.cursor/logs/conv_ruby_treegrep_*.yaml`.

**Flags:** None.

**Example:**

```bash
ruby scripts/citdp_hook_log_evidence_build.rb
```

See generated [`docs/citdp-evidence-hook-log-correlation.md`](citdp-evidence-hook-log-correlation.md) (after a successful run) for the embedded recipe that chains `analyze_hook_log.rb` for aggregate/per-file YAML outputs.

---

## Quick reference

| Script | Typical input |
| --- | --- |
| `strip_transcripts.rb`, `dedupe_transcript_yaml.rb` | Hook YAML files (in-place writers) |
| `analyze_hook_log.rb`, `extract_*.rb` (except `extract_queries`) | Hook YAML (`conv_*.yaml`) |
| `extract_queries.rb` | Full transcript YAML with `<user_query>` tags |
| `citdp_hook_log_evidence_build.rb` | Repo `docs/citdp/` + optional hook glob on disk |

Run `ruby scripts/<name>.rb --help` for the canonical option list.
