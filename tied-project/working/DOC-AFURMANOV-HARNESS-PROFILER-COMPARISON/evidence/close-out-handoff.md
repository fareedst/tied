# Close-out handoff — DOC-AFURMANOV-HARNESS-PROFILER-COMPARISON

**Date:** 2026-11-17  
**Leaf:** `@non-tied-close` (no unified TIED `close_out` gate stack)

## Deliverables

| Artifact | Path | Git |
| --- | --- | --- |
| Wave 1 stub | `docs/comparisons/afurmanov-harness-profiler.md` | untracked (allowlisted) |
| Wave 2 analysis | `docs/comparisons/afurmanov-harness-profiler-vs-tied-agent-management.md` | untracked (allowlisted) |
| Allowlist | `.gitignore` | modified (+2 lines) |
| Examples | `tools/bundled-prompt-type-skills/external-service-comparison/examples.md` | modified |
| HTOL cross-link | `tied-bundle/docs/harness-trace-observation-loop.md` | modified |
| LangChain harness sibling | `docs/comparisons/langchain-harness-engineering-vs-tied-agent-management.md` | modified |
| Plan / test-strategy | `tied-project/non-tied-plans/afurmanov-harness-profiler-vs-tied/` | untracked |
| Working evidence | `tied-project/working/DOC-AFURMANOV-HARNESS-PROFILER-COMPARISON/` | untracked |

## Completion signals

| Signal | Status |
| --- | --- |
| **Machine close-out** | **not_run** — DOC outreach; no `close_out` gate (forbidden on this leaf) |
| **Process contract** | **pass** — build verification (14 sections, labels, links); `tied_git_hygiene` preview ok |
| **TIED YAML / CITDP** | **not in scope** — no `tied_validate_consistency` required |

## Excluded from this commit (workspace noise)

Other dirty/untracked paths (Open Governance wave, REQ YAML, fixtures, regenerable reports) are **out of scope** for this DOC token. Stage only the map in [traceable-commit-evidence.md](./traceable-commit-evidence.md).

## Local-only note

`docs/comparisons/cursor-harness-engineering-vs-tied-agent-management.md` carries a **Distinct from** Furmanov line on disk but is **gitignored** (no `!` allowlist line in `.gitignore`). Optional follow-up: allowlist + commit sibling backlink.

## Remaining risks (Wave 3 **Defer**)

- Methodology composition matrix §2 row
- agentstream ↔ harness-profiler JSONL bridge (`add-feature`)
- Claude Code plugin install in stdd

## Commits

| SHA | Summary |
| --- | --- |
| *(pending sponsor)* | See `proposed-commit-message.txt` |