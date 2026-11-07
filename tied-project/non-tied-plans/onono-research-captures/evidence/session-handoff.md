# Session handoff — onono-research-captures

**handoff_kind:** session  
**Date:** 2026-11-07  
**request_token:** n/a (non-tied)  
**prompt_type:** non-tied-close  
**plan_phase:** close-out-ready

## Plan spine

Linked plan: [`../PLAN.md`](../PLAN.md). Wave 0 captures complete; Wave 2 analysis pending `@non-tied-build`. Related: [store-vendor-skills](../store-vendor-skills/PLAN.md) (closed). Cursor design: [`.cursor/plans/onono_wave_2_tied_97689e73.plan.md`](../../../../.cursor/plans/onono_wave_2_tied_97689e73.plan.md).

## Authoritative refs

| Role | Path |
| --- | --- |
| Plan | `tied-project/non-tied-plans/onono-research-captures/PLAN.md` |
| Test strategy | `tied-project/non-tied-plans/onono-research-captures/test-strategy.md` |
| Capture index | `docs/comparisons/onono-research-capture-index.md` (gitignored) |
| Captures (7 + companions) | `docs/comparisons/onono-*.md` (gitignored) |
| Wave 2 target (build) | `docs/comparisons/onono-progressive-ai-system-learning-vs-tied-agent-management.md` (gitignored) |
| Comparison template | `tied-bundle/docs/external-service-three-wave-comparison-template.md` |

## Plan execution steps

**Last updated:** 2026-11-07 · **prompt_type:** non-tied-refine · **PLAN:** `onono-research-captures/PLAN.md`

### Required (Wave 0 — done)

- [x] `capture-seven` — 5 articles + manifesto + Progressive AI concept per research hub
- [x] `gitignore-verify` — `git check-ignore -v docs/comparisons/onono-*.md` → `docs/comparisons/*`
- [x] `index-file` — `onono-research-capture-index.md` with URLs and thematic edges

### Required (Wave 2 — `@non-tied-build`)

- [x] `plan-package` — `PLAN.md`, `test-strategy.md`, handoff (refine + build updates on disk)
- [x] `preload-captures` — seven captures + index; sponsor-agent relationship lens
- [x] `draft-wave2-analysis` — `onono-progressive-ai-system-learning-vs-tied-agent-management.md` (14 sections, no sibling cross-links)
- [x] `verify-local` — claim labels; `git check-ignore` confirmed ignored

### Optional

- [x] `non-tied-close` — traceable commit plan folder only (captures + vs-tied stay gitignored)
- [ ] `publish-allowlist` — sponsor opt-in: `!docs/comparisons/onono-*` for Wave 1 and/or Wave 2
- [ ] `client-boundary` — note disposable client lacks ONONO captures

### Recommendations

- Claims in captures are **ONONO-reported**; Hou et al. and arxiv cites are **third-party** (not verified in stdd).
- Wave 2 publish boundary: **local only** (no allowlist) — sponsor confirmed 2026-11-07.
- No REQ/ARCH/IMPL mint from comparison prose.

### Changelog (this slug)

- 2026-11-07 handoff: seven gitignored markdown captures + index; built after `store-vendor-skills` close (`b9106ac5`, `c0c056c2`).
- 2026-11-07 non-tied-refine: `PLAN.md` + `test-strategy.md`; Wave 2 steps; local-only vs-tied deliverable; no sibling comparison links.
- 2026-11-07 non-tied-build: Wave 2 analysis written (gitignored); invocation note: linked plan is **non-TIED** track (`@non-tied-build`), not full TIED `build-plan` gates.
- 2026-11-07 non-tied-close: committed plan package; ONONO captures and vs-tied remain local-only.

## Environment

**workspace_root:** `/Users/fareed/Documents/dev/chatgpt/stdd`  
**execution_site:** TIED store  
**agent-browser:** global CLI + Chrome for Testing (operator host; captures already on disk)

## Related and pending prior requests

| id | kind | status | blocks_current | evidence_link |
| --- | --- | --- | --- | --- |
| store-vendor-skills | non-tied slug | closed | no | `tied-project/non-tied-plans/store-vendor-skills/evidence/session-handoff.md` |
| citdp-scratch | untracked YAML | pending | no | `tied-project/citdp/CITDP-REQ-*.yaml` (exclude from commits) |

## Finished this session

- **non-tied-build:** Wave 2 analysis at `docs/comparisons/onono-progressive-ai-system-learning-vs-tied-agent-management.md` (~340 lines, gitignored).

## Do next

1. Optional **`publish-allowlist`** — sponsor opt-in to track `docs/comparisons/onono-*` (Wave 1 and/or Wave 2).
2. Read local Wave 2: `docs/comparisons/onono-progressive-ai-system-learning-vs-tied-agent-management.md` (gitignored).

## Constraints

- No REQ/ARCH/IMPL MCP writes from capture or comparison work.
- Do not add `!docs/comparisons/onono-*` allowlist unless sponsor opts into publish.

## Repeatable verification

```bash
ls docs/comparisons/onono-*.md | wc -l   # expect 8 until Wave 2 adds vs-tied
git check-ignore -v docs/comparisons/onono-research-capture-index.md
git status tied-project/non-tied-plans/onono-research-captures/
```
