# TIED YAML updates — agent index

**Purpose**: One entry page that links every document that helps agents **read and update project TIED YAML** with the least friction (correct tools, payloads, merge semantics, validation).

**Do not** use this as a substitute for the skill: all mutations still go through [`.cursor/skills/tied-yaml/scripts/tied-cli.sh`](../../.cursor/skills/tied-yaml/scripts/tied-cli.sh) per the routing table below.

---

## Shortest path (most sessions)

1. Confirm the active tree: MCP tool **`tied_config_get_base_path`** (see [AGENTS.md](../../AGENTS.md) §1–2 and §3.2; cheat sheet in [yaml-update-mcp-runbook.md](yaml-update-mcp-runbook.md) §3).
2. **Mutate only via** `tied-cli.sh` — [SKILL.md](../../.cursor/skills/tied-yaml/SKILL.md) (environment, `@args.json`, large payloads).
3. **Heavy IMPL pseudo-code**: **`impl_detail_set_essence_pseudocode`**, not a giant `yaml_detail_update` — [yaml-update-mcp-runbook.md](yaml-update-mcp-runbook.md) §2.2.
4. **Several writes**: **`yaml_updates_apply`** with **`dry_run: true`** first — [yaml-update-mcp-runbook.md](yaml-update-mcp-runbook.md) §2.
5. **After writes**: `yaml_index_validate` / `lint_yaml` (per checklist) + **`tied_validate_consistency`** — [SKILL.md](../../.cursor/skills/tied-yaml/SKILL.md), [agent-req-implementation-checklist.md](agent-req-implementation-checklist.md) (`sub-yaml-edit-loop`).
6. **Detail field shapes** (e.g. `description`): prefer [detail-files-schema.md](../detail-files-schema.md) over partial samples.

---

## Tier 1 — Workflow and tools (start here)

| Topic | Document |
|--------|----------|
| Exclusive mutation path, `@file` args, `TIED_BASE_PATH` / `TIED_MCP_BIN`, validation loop, **semantic-tokens**, merge notes (arrays replace wholesale), re-read after critical writes | [`.cursor/skills/tied-yaml/SKILL.md`](../../.cursor/skills/tied-yaml/SKILL.md) |
| Full MCP tool catalog and parameter notes | [`.cursor/skills/tied-yaml/reference.md`](../../.cursor/skills/tied-yaml/reference.md) |
| One-token updates, batch merges, nested merge semantics, small payloads, timeouts | [yaml-update-mcp-runbook.md](yaml-update-mcp-runbook.md) |
| **Goal → tool** cheat sheet (includes `tied_config_get_base_path`) | [yaml-update-mcp-runbook.md](yaml-update-mcp-runbook.md) §3 |

**Note**: `tied_config_get_base_path` is documented in [reference.md](../../.cursor/skills/tied-yaml/reference.md) (Config), [yaml-update-mcp-runbook.md](yaml-update-mcp-runbook.md) §3, and [AGENTS.md](../../AGENTS.md).

---

## Tier 2 — Checklists and repo policy

| Topic | Document |
|--------|----------|
| `sub-yaml-edit-loop`, `sync-tied-stack`, verification, explicit skill links | [agent-req-implementation-checklist.md](agent-req-implementation-checklist.md) |
| TIED-first implementation flow | [tied-first-implementation-procedure.md](tied-first-implementation-procedure.md) |
| Session bootstrap, MCP-first access, `tied_config_get_base_path` | [AGENTS.md](../../AGENTS.md) |

---

## Tier 3 — Schema, server, offline

| Topic | Document |
|--------|----------|
| REQ / ARCH / IMPL detail YAML shapes | [detail-files-schema.md](../detail-files-schema.md) |
| Server behavior and tool schemas | [mcp-server/README.md](../../mcp-server/README.md) |
| Without Node/MCP (documented manual path) | [using-tied-without-mcp.md](./using-tied-without-mcp.md) |
| MCP narrative and footguns | [ai-agent-tied-mcp-usage.md](ai-agent-tied-mcp-usage.md) |

---

## Tier 0 — Session bootstrap (orientation, not tool routing)

Read during **session-bootstrap** alongside the skill; these do not replace `tied-cli.sh` for writes.

| Topic | Document |
|--------|----------|
| Token registry and guide | [`tied/semantic-tokens.yaml`](../semantic-tokens.yaml), [`tied/semantic-tokens.md`](../semantic-tokens.md) |
| IMPL pseudo-code and `[PROC-IMPL_PSEUDOCODE_TOKENS]` | [`tied/implementation-decisions.md`](../implementation-decisions.md) |
| AI principles and ordering | [`ai-principles.md`](./ai-principles.md) |

---

## Payload and shell hygiene

Prefer **JSON arguments in a file** (`tied-cli.sh <tool> @/path/to/args.json`) over inline shell JSON for large `index_record` / `detail_record` / `essence_pseudocode`. Build the file with a small Node or Python step using `JSON.stringify` rather than fragile `jq` one-liners for multiline strings. See [SKILL.md](../../.cursor/skills/tied-yaml/SKILL.md) (“Args from file”, “Large payloads”) and [yaml-update-mcp-runbook.md](yaml-update-mcp-runbook.md) §2.2.
