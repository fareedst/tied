# Git hygiene receipt — @clear-workspace

**Date:** 2026-10-23  
**Scope inferred:** `DOC-AI-SDLC-FACTORY-COMPARISON` (editor focus); hygiene preview is **repo-wide**  
**Tool:** `tied_git_hygiene` (`apply: false`, `context_mode: plan_close_out`)  
**MCP base path:** `/Users/fareed/Documents/dev/chatgpt/stdd/tied-project`

## Routing steps

| Step | Result |
| --- | --- |
| 1. Scope | `tied-project/working/DOC-AI-SDLC-FACTORY-COMPARISON/` — Wave 2 doc outreach (`no_req_mint: true`) |
| 2. `tied_project_lint` | **N/A** — no project YAML changed in DOC scope |
| 3. Close-out gap | **N/A** — deliverable committed (`eb501dae`); pass-2 refine is reconciliation only |
| 4. Git hygiene | **Preview** (this receipt); **no deletes** (no sponsor allowlist) |
| 5. Gitignore hygiene | **N/A** for DOC — comparison allowlist already on `main`; other untracked comparisons are separate programs |
| 6. Commit-ready (whole repo) | **No** — ~170 tracked dirty paths across many REQs/programs |
| 7. Traceable-commit prep | **Optional micro-wave** for DOC pass-2 only (see below); **no commit** without sponsor ask |
| 8. Handoff | **Recommended** if continuing multi-REQ WIP in a fresh chat |

## Branch posture

- `main` **ahead of `origin/main` by 28 commits** (unpushed local history).

## DOC-AI-SDLC-FACTORY-COMPARISON delta (post-`eb501dae`)

| Path | State | Notes |
| --- | --- | --- |
| `PLAN-refine-pass2.md` | untracked | Pass-2 reconciliation; idempotent build-plan record |
| `checklist-tracker-refine.yaml` | modified | pass-2 / traceable-commit notes |
| `evidence/build-plan-handoff.md` | modified | pass-2 confirmation |
| `evidence/close-out-handoff.md` | modified | optional envelope sync deferred |
| `evidence/traceable-commit-evidence.md` | modified | records `eb501dae` |

**Optional scoped staging map** (sponsor-owned):

```
tied-project/working/DOC-AI-SDLC-FACTORY-COMPARISON/PLAN-refine-pass2.md
tied-project/working/DOC-AI-SDLC-FACTORY-COMPARISON/checklist-tracker-refine.yaml
tied-project/working/DOC-AI-SDLC-FACTORY-COMPARISON/evidence/build-plan-handoff.md
tied-project/working/DOC-AI-SDLC-FACTORY-COMPARISON/evidence/close-out-handoff.md
tied-project/working/DOC-AI-SDLC-FACTORY-COMPARISON/evidence/traceable-commit-evidence.md
tied-project/working/DOC-AI-SDLC-FACTORY-COMPARISON/evidence/git-hygiene-receipt-2026-10-23-clear-workspace.md
```

Comparison doc and `.gitignore` allowlist are **clean vs HEAD** (already in `eb501dae`).

## Untracked (repo-wide preview — retained)

- `.bkpdir.yml`
- `docs/comparisons/veronika-heimsbakk-*` (2 files) — see `DOC-HEIMSBBAKK-ONTOLOGY-COMPARISON/`
- `docs/tools/remote-org-http-mcp*.md` (incl. `.local*` — treat `.local.md` as operator-only)
- `docs/tools/voice-agents.md`, `docs/visuals/2026-10-20.md`
- `tied-bundle/docs/external-service-three-wave-comparison-template.md`
- `tied-project/working/DOC-HEIMSBBAKK-ONTOLOGY-COMPARISON/`
- `tied-project/working/REQ-PSEUDOCODE_LAYER_B_CORPUS/`

## Tracked dirty (retained — multi-program WIP)

100+ paths across methodology refresh, MCP, EDPC, EASAR, harness comparisons, envelope evaluation, bootstrap tests, etc. **Do not** stage as a single commit.

## Applied hygiene

- **None** (`apply: false`; no sponsor-supplied delete allowlist).

## Recommended next

1. **DOC pass-2 only:** ask for a **traceable commit** with the scoped map above, or leave working-tree evidence local.
2. **Whole workspace:** **`@handoff`** with explicit `request_token` per active REQ; avoid monolithic commit.
3. **Separate programs:** `@clear-workspace DOC-HEIMSBBAKK-ONTOLOGY-COMPARISON` (or named REQ) when ready.
4. **`git push`:** sponsor decision when the 28 local commits should publish.
