# Git-hygiene receipt — plan-close-out (CO3)

**Date:** 2026-10-17  
**Run-id:** `psrg-closeout-git-hygiene-2026-10-17`  
**Request:** [REQ-TIED_PATH_SCOPED_REVIEW_GUIDANCE]  
**Tool:** `tied_git_hygiene` (`context_mode: plan_close_out`, `apply: false`, preview `ok: true`)

## Verification (pre-commit)

```text
node --test tools/bootstrap/lib/path-scoped-review-guidance-doc.test.mjs
# 3/3 pass (2026-10-17 plan-close-out CO3)
```

## Untracked — stage at traceable-commit (**track**)

| Path | Class | Notes |
| --- | --- | --- |
| `tied-bundle/docs/path-scoped-review-guidance.md` | **track** | Primary methodology doc |
| `tied-bundle/templates/path-scoped-REVIEW.v1.example.md` | **track** | Client template |
| `tied-bundle/templates/tied-project-review-index.v1.example.md` | **track** | Client template |
| `tied-project/requirements/REQ-TIED_PATH_SCOPED_REVIEW_GUIDANCE.yaml` | **track** | TIED index detail |
| `tied-project/architecture-decisions/ARCH-TIED_PATH_SCOPED_REVIEW_GUIDANCE.yaml` | **track** | TIED index detail |
| `tied-project/implementation-decisions/IMPL-TIED_PATH_SCOPED_REVIEW_GUIDANCE.yaml` | **track** | TIED index detail |
| `tied-project/implementation-decisions/IMPL-TIED_PATH_SCOPED_REVIEW_GUIDANCE-pseudocode.md` | **track** | IMPL sidecar |
| `tied-project/citdp/CITDP-REQ-TIED_PATH_SCOPED_REVIEW_GUIDANCE.yaml` | **track** | CITDP persist |
| `tools/bootstrap/lib/path-scoped-review-guidance-doc.test.mjs` | **track** | Doc contract test |
| `tied-project/working/REQ-TIED_PATH_SCOPED_REVIEW_GUIDANCE/` | **track** | PLAN + CITDP working copy + this receipt |

## Tracked dirty — stage with feature commit (**track**)

| Path | Class | Notes |
| --- | --- | --- |
| `CHANGELOG.md` | **track** | Unreleased path-scoped entry (already drafted) |
| `docs/comparisons/claude-code-team-code-review-vs-tied.md` | **track** | Compose snapshot: learning #2 / §7 path-scoped **Implemented** |
| `tied-bundle/docs/client-development-index.md` | **track** | Quick read link to path-scoped guidance |
| `tied-project/requirements.yaml` | **track** | Index insert |
| `tied-project/architecture-decisions.yaml` | **track** | Index insert |
| `tied-project/implementation-decisions.yaml` | **track** | Index insert |
| `tied-project/vocab/routing.md` | **track** | Vocab RECORD (if diff is path-scoped only) |
| `tied-project/vocab/quality-assurance.md` | **track** | Vocab RECORD (if diff is path-scoped only) |
| `tied-bundle/docs/pre-handoff-verification-charter.md` | **review** | Stage only if diff belongs to this slice; otherwise split commit |

## Do not stage (gitignored regenerables)

Per `.gitignore` `tied-project/working/**/evidence/request-evidence-envelope.v1.json` and related close-out regenerables — none required for this **optional minimal** doc slice unless sponsor runs full `run-close-out-gates.mjs`.

## Gitignore close-out ([PROC-GITIGNORE_CLOSE_OUT])

**N/A** — no new ephemeral untracked patterns; path-scoped deliverables are **track** methodology + project TIED, not regenerable gate receipts.

## Outcome

Preview `ok: true`; no `apply` deletes; no `.gitignore` edits in this pass.

## Machine close-out

**Deferred** — PLAN marks tracker/ envelope close-out optional for doc-only slice. Run `run-close-out-gates.mjs` before claiming three completion signals if sponsor wants machine close-out on [REQ-TIED_PATH_SCOPED_REVIEW_GUIDANCE].
