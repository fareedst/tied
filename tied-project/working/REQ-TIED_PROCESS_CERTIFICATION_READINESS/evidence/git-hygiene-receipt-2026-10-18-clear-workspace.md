# Git hygiene receipt — clear-workspace (workspace scope)

**Date:** 2026-10-18  
**Context:** `@clear-workspace` · MCP `tied_git_hygiene` (`plan_close_out`, preview) · `tied_project_lint` ok

## Routing (by REQ)

| REQ / area | Close-out | Commit-ready | Action |
| --- | --- | --- | --- |
| **REQ-TIED_PROCESS_CERTIFICATION_READINESS** | **Done** (`75f41a15`) | Hygiene-only delta | Optional commit: `session-handoff.md` + hygiene receipts |
| **REQ-TIED_EASAR_RECOVERY slice 6** | **Not run** | **No** — build in progress | Keep all EASAR dirty/untracked; `@build-plan` when ready |
| **Regenerable pins** | N/A | N/A | Restored `tied-bundle/reports/source-graph/source-graph-index.v1.json` → HEAD |

## plan-close-out

**N/A** for PCR (completed prior). **Deferred** for EASAR slice 6 until implementation + verification gates.

## Applied hygiene

- `git checkout HEAD -- tied-bundle/reports/source-graph/source-graph-index.v1.json`
- **No** `tied_git_hygiene` deletes (`apply: false`; no sponsor allowlist)

## Tracked dirty (retained — intentional)

**EASAR slice 6 (portable recovery export):**

- `mcp-server/src/tools/index.ts`
- `mcp-server/src/easar-receipts/recovery-export-*.ts` (untracked)
- `tied-project/implementation-decisions/IMPL-TIED_EASAR_RECEIPTS-pseudocode.md`
- `tied-project/requirements/REQ-TIED_EASAR_RECOVERY.yaml`
- `tied-project/vocab/easar-recovery.md`
- `tied-project/working/REQ-TIED_EASAR_RECOVERY/**` (PLAN, slice6 plan, trackers, evidence)

**PCR:**

- `tied-project/working/REQ-TIED_PROCESS_CERTIFICATION_READINESS/evidence/session-handoff.md` (post-commit handoff)

## Untracked (retained)

All EASAR slice 6 working artifacts per MCP preview; plus this receipt and [git-hygiene-receipt-2026-10-18-post-close-out.md](./git-hygiene-receipt-2026-10-18-post-close-out.md).

## Traceable-commit prep

| Wave | Staging | Blocker |
| --- | --- | --- |
| PCR handoff-only | `session-handoff.md`, `git-hygiene-receipt-*.md` | Sponsor must ask to commit |
| EASAR slice 6 | See `@tied-project/working/REQ-TIED_EASAR_RECOVERY/evidence/slice6-e2e-plan.md` | Tests/gates/close-out not complete |

## Gitignore

**N/A** new patterns (EASAR files are trackable deliverables, not ephemeral).

## Recommended next

1. **EASAR:** `@build-plan` with `@tied-project/working/REQ-TIED_EASAR_RECOVERY/PLAN.md` + slice6 tracker.
2. **PCR:** optional tiny commit for handoff/hygiene receipts, or `@handoff` only.
3. **`git push`** when sponsor ready (~19 commits on `main`).
