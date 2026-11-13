# Cursor and Claude model catalogs

**Snapshot date:** 2026-11-12 (UTC)  
**Environment:** macOS, Cursor Agent CLI `2026.11.10-731fb78` (`/Users/fareed/.local/bin/agent`)

This document records **all models visible to this account** in Cursor (Agent CLI catalog) and **all current Claude API models** per Anthropic’s public documentation. It also explains exactly how each list was obtained.

---

## How the data was retrieved

### Cursor Agent catalog (`agent models`)

| Step | What we ran / opened | Why |
| --- | --- | --- |
| 1 | `agent models` | Authoritative **per-account** list of selectable Agent/CLI model **slugs** and display names. Same source this repo uses in [`tools/bootstrap/sync-wf-trial-model-catalog.mjs`](../tools/bootstrap/sync-wf-trial-model-catalog.mjs) (`cursor_source: agent models`). |
| 2 | Saved stdout to [`docs/evidence/cursor-agent-models-2026-11-12.txt`](evidence/cursor-agent-models-2026-11-12.txt) | Immutable snapshot (**276** slug lines) for diffing on later dates. |
| 3 | Fetched [Cursor Models & Pricing](https://cursor.com/docs/models-and-pricing) | Official **product** names, plan gates, pricing, and which models are **Cursor-first-party** (included usage pool) vs third-party. |
| 4 | Compared with committed [`docs/demos/wf-trial-model-catalog.yaml`](../docs/demos/wf-trial-model-catalog.yaml) (`generated_at: 2026-11-10`) | Confirms this repo’s workflow-trial catalog is regenerated from the same `agent models` source. |

**Caveats**

- The CLI list is **account- and plan-dependent** (e.g. hidden models, Max Mode, Enterprise data-retention flags). Your picker may show fewer rows than the docs table.
- **Desktop vs web:** Forum reports that the desktop model picker can be a strict subset of the web app for the same account; treat `agent models` as the CLI truth and the docs page as the global product matrix.
- **Parameterized slugs:** The CLI tip documents overrides such as `--model 'claude-opus-4-8[context=1m,effort=high,fast=false]'` — those are not separate catalog rows.

### Anthropic Claude API

| Step | What we ran / opened | Why |
| --- | --- | --- |
| 1 | Fetched [Models overview](https://platform.claude.com/docs/en/models/overview) | Canonical **human names**, API IDs for the current generation, pricing, context limits, and the **“All models”** table (including retired / limited-access). |
| 2 | Fetched [API usage primer](https://platform.claude.com/docs/en/claude_api_primer) | Quick-reference **Claude API ID** strings for recommended defaults. |
| 3 | `GET https://api.anthropic.com/v1/models` | **Programmatic** list (`id` per model). **Not run live** in this session (`ANTHROPIC_API_KEY` unset). |
| 4 | Repo fixture [`tools/bootstrap/testdata/wf-trial-claude-models.v1.json`](../tools/bootstrap/testdata/wf-trial-claude-models.v1.json) | Example `GET /v1/models` response shape used by catalog sync (15 IDs, `has_more: false`). Refresh with a key: `curl -sS https://api.anthropic.com/v1/models -H "x-api-key: $ANTHROPIC_API_KEY" -H "anthropic-version: 2023-06-01"`. |

**Caveats**

- **Cursor slugs ≠ Claude API IDs.** In Cursor, Anthropic models appear as many tiered slugs (`claude-opus-5-5-high-fast`, thinking variants, etc.). The Claude API uses pinned IDs like `claude-opus-5-5`.
- **Claude Code / Agent harness** in this repo uses the API list above; see the `claude:` section of `wf-trial-model-catalog.yaml`.

---

## Cursor models

### Cursor-first-party (included usage pool)

From [Models & Pricing](https://cursor.com/docs/models-and-pricing) — joint Cursor / provider branding, billed from the weekly **Cursor model** pool on paid plans:

| Product name | Typical CLI slugs (this snapshot) | Notes |
| --- | --- | --- |
| **Composer 2.5** | `composer-2.5`, `composer-2.5-fast` | Cursor’s agentic coding model |
| **Grok 4.7** | `grok-4.7-*` (effort + optional `-fast`) | Also 500k context variants in docs |
| **Grok 4.6** | `cursor-grok-4.6-*` | Prefixed `cursor-` in CLI catalog |
| **Grok 4.5** | `cursor-grok-4.5-*`, `cursor-grok-4.5-high` | |

**Count in this CLI snapshot:** 2 Composer + 22 Grok-family slugs = **24** first-party rows (plus `auto`).

### Full Agent CLI catalog (276 slugs)

**Authoritative full list:** [`docs/evidence/cursor-agent-models-2026-11-12.txt`](evidence/cursor-agent-models-2026-11-12.txt)  
Format: `{slug} - {display label}`

**Breakdown by family (same snapshot):**

| Family | Slug count | Examples |
| --- | ---: | --- |
| Anthropic (via Cursor) | 133 | `claude-opus-5-5-medium-fast`, `claude-haiku-5-5-thinking-high`, `claude-4.6-sonnet-medium-thinking` |
| OpenAI GPT | 83 | `gpt-5.3-codex-high-fast`, `gpt-5.6-luna-medium`, `gpt-5.4-mini-high` |
| Grok (Cursor) | 22 | `grok-4.7-high-fast`, `cursor-grok-4.6-xhigh` |
| Google Gemini | 12 | `gemini-4-carbon-medium`, `gemini-3.8-flash-high` |
| Muse | 12 | `muse-spark-1.3-max`, `muse-wonder-1.0-high` |
| DeepSeek | 5 | `deepseek-v41-flash-1017-max` |
| Kimi | 4 | `kimi-k3-max`, `kimi-k2.7-code` |
| Composer | 2 | `composer-2.5`, `composer-2.5-fast` |
| GLM | 2 | `glm-5.2-high`, `glm-5.2-max` |
| Auto | 1 | `auto` |

### Docs-only / pricing matrix (not necessarily every CLI slug)

The [Models & Pricing](https://cursor.com/docs/models-and-pricing) third-party table also documents models that may be **hidden by default** in the UI (e.g. Claude 4 Sonnet, GPT-5, Gemini 2.5 Flash, GLM 5.3). Use the docs page when reconciling **pricing and capabilities**; use `agent models` when reconciling **what you can pass to `--model` today**.

### Task subagent allowlist (this Cursor session)

Separately from the full catalog, **Task tool subagents** in this workspace are restricted to:

- `composer-2.5-fast`
- `gemini-4-carbon-medium`

That is a **harness constraint**, not Cursor’s global model list.

---

## Claude models (Anthropic API)

### Recommended current generation (API IDs)

From [Models overview](https://platform.claude.com/docs/en/models/overview) and [API usage primer](https://platform.claude.com/docs/en/claude_api_primer):

| Model | Claude API ID | Role |
| --- | --- | --- |
| Claude Opus 5.5 | `claude-opus-5-5` | Default for most workloads / agentic coding |
| Claude Fable 5.2 | `claude-fable-5-2` | Harder reasoning / long-horizon agents |
| Claude Sonnet 5.5 | `claude-sonnet-5-5` | Speed + intelligence balance |
| Claude Haiku 5.5 | `claude-haiku-5-5` | Fast, high-volume tasks |

### All models in Anthropic docs (“All models” table)

| Model | API ID (4.6+ dateless or documented form) | Context | Status notes |
| --- | --- | --- | --- |
| Claude Fable 5.2 | `claude-fable-5-2` | 1M | Current |
| Claude Opus 5.5 | `claude-opus-5-5` | 1M | Current |
| Claude Sonnet 5.5 | `claude-sonnet-5-5` | 1M | Current |
| Claude Haiku 5.5 | `claude-haiku-5-5` | 1M | Current |
| Claude Mythos 5.2 | `claude-mythos-5-2` (limited availability) | 1M | Verification programs |
| Claude Fable 5.1 | `claude-fable-5-1` | 1M | Current |
| Claude Mythos 5.1 | `claude-mythos-5-1` (limited) | 1M | Verification programs |
| Claude Fable 5 | `claude-fable-5` | 1M | Current |
| Claude Mythos 5 | `claude-mythos-5` (limited) | 1M | Verification programs |
| Claude Opus 5 | `claude-opus-5` | 1M | Prior Opus |
| Claude Opus 4.8 | `claude-opus-4-8` | 1M | Current |
| Claude Opus 4.7 | `claude-opus-4-7` | 1M | Current |
| Claude Opus 4.6 | `claude-opus-4-6` | 1M | Current |
| Claude Opus 4.5 | `claude-opus-4-5-20251101` (dated snapshot) | 200K | Current |
| Claude Opus 4.1 | dated 4.1 ID | 200K | Retired (exceptions on some clouds) |
| Claude Opus 4 | dated 4 ID | 200K | Retired (exceptions on some clouds) |
| Claude Sonnet 5 | `claude-sonnet-5` | 1M | Prior Sonnet |
| Claude Sonnet 4.6 | `claude-sonnet-4-6` | 1M | Current |
| Claude Sonnet 4.5 | `claude-sonnet-4-5-20250929` | 200K | Current |
| Claude Sonnet 4 | dated 4 ID | 200K | Retired (exceptions) |
| Claude Haiku 4.5 | `claude-haiku-4-5-20251001` | 200K | Current / prior Haiku |

For **pinned snapshot semantics** (dateless vs alias), see [Model IDs and versioning](https://platform.claude.com/docs/en/about-claude/models/model-ids-and-versions).

### Example `GET /v1/models` payload (repo fixture)

Ids returned in [`wf-trial-claude-models.v1.json`](../tools/bootstrap/testdata/wf-trial-claude-models.v1.json) (refresh live to update):

1. `claude-fable-5-2`
2. `claude-haiku-5-5`
3. `claude-sonnet-5-5`
4. `claude-opus-5-5`
5. `claude-fable-5-1`
6. `claude-opus-5`
7. `claude-sonnet-5`
8. `claude-fable-5`
9. `claude-opus-4-8`
10. `claude-opus-4-7`
11. `claude-sonnet-4-6`
12. `claude-opus-4-6`
13. `claude-opus-4-5-20251101`
14. `claude-haiku-4-5-20251001`
15. `claude-sonnet-4-5-20250929`

### Claude models as exposed inside Cursor (133 slugs)

Cursor does not expose one row per API ID. It exposes **effort**, **fast**, **thinking**, and **legacy 4.x** variants. Every `claude-*` line in [`cursor-agent-models-2026-11-12.txt`](evidence/cursor-agent-models-2026-11-12.txt) is a distinct `--model` slug for Agent/CLI on this account.

---

## Refreshing this document

```bash
# Cursor catalog
agent models | grep -E '^[a-z0-9]' > docs/evidence/cursor-agent-models-$(date +%Y-%m-%d).txt

# Regenerate repo workflow catalog (Cursor + Claude fixture)
node tools/bootstrap/sync-wf-trial-model-catalog.mjs

# Claude API (requires key)
curl -sS https://api.anthropic.com/v1/models \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" | jq '.data[].id'
```

Then update the snapshot date at the top of this file and reconcile any count/family changes.

---

## References

- [Cursor — Models & Pricing](https://cursor.com/docs/models-and-pricing)
- [Cursor — Available models (help)](https://cursor.com/help/models-and-usage/available-models)
- [Anthropic — Models overview](https://platform.claude.com/docs/en/models/overview)
- [Anthropic — Model IDs and versioning](https://platform.claude.com/docs/en/about-claude/models/model-ids-and-versions)
- [Anthropic — Models API (`/v1/models`)](https://platform.claude.com/docs/en/api/models/list)
