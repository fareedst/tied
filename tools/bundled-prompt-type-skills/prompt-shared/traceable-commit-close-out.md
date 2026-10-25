# Traceable commit (close-out)

**Checklist slug:** `traceable-commit` ([PROC-AGENT_REQ_CHECKLIST])  
**Tokens:** [REQ-PROMPT_TYPE_GLOBAL_SKILLS], [REQ-TIED_GIT_HYGIENE]

Run this block **only after** unified **close_out** allows progression (`tied_checklist_gate_validate` `allowed: true` **and** envelope validate with `fail_on_error_gaps: true` and zero blocking error gaps, or equivalent `run-close-out-gates.mjs --envelope-blocking`). If either check fails, **skip commit** and label the handoff **incomplete** with blocker evidence.

## Preconditions

- `sub-close-out-evidence-sync` (or gate runner with `--sync-dispositions --reconcile`) already ran in the same close-out pass.
- Default **git hygiene** preview completed: MCP **`tied_git_hygiene`** with `context_mode: plan_close_out`, `apply: false`; receipt at `evidence/git-hygiene-receipt-{YYYY-MM-DD}.md`. Use `apply: true` only with sponsor **exact** `allowed_paths`.
- Gitignore close-out hygiene handoff bullet recorded ([gitignore-close-out-hygiene.md](gitignore-close-out-hygiene.md)).

## Post-REQ workspace clean

**Post-REQ workspace clean** (for the active `request_token` only):

1. **Scoped artifacts** — Every path in the staging map is committed or explicitly classified (defer/N/A with Tracker note).
2. **Regenerable noise** — REQ-scoped regenerable files restored or deleted in **this** close-out pass (hygiene receipt documents apply=false preview and any restore).

Unrelated REQ trackers, draft CITDP under other tokens, and gate receipts under `tied-bundle/working/` may remain modified — that is **not** a failed close-out for the active REQ. Record excluded drift in `evidence/traceable-commit-evidence.md`.

### When `@clear-workspace` is redundant vs router

| Situation | `@clear-workspace` |
| --- | --- |
| `@close-out` completed with gates green, hygiene receipt written, traceable-commit done or explicitly deferred for **this** `request_token` | **Redundant** — do not instruct as a second lifecycle step |
| Scope ambiguous, sponsor did not name REQ/PLAN, or close-out stopped mid-flight (gate/envelope/hygiene incomplete) | **Router / recovery** — run [clear-workspace-routing.md](clear-workspace-routing.md) |
| Minimal-depth feedback ingest PLAN complete; other REQs still open | **Not implied** — handoff must state repo-wide dirt is expected ([completion-signals-handoff.md](completion-signals-handoff.md)) |

## Procedure

1. **Touchpoint 3 (VALIDATE)** — CALL `sub-vocabulary-sync` (VALIDATE): audit all files in the scoped staging map; TIED name fields, token suffixes, pseudo-code block names, tests/code identifiers, README/CHANGELOG terms resolve to preferred terms in `./tied-project/vocab/*.md`. Do not stage until VALIDATE passes or immature-client deferral is documented in the per-request Tracker.
2. **Evidence paths** — Write or update:
   - `evidence/proposed-commit-message.txt` (staging map + message draft)
   - `evidence/traceable-commit-evidence.md` (VALIDATE outcome, gate receipt refs, hygiene receipt path, **excluded unrelated drift** summary)
   - **Upstream feedback capture outcome** — in `traceable-commit-evidence.md` (or linked close-out evidence) record **one** of: MCP **`receipt` `id`** (+ optional store **`fb-*`**, client **`feedback.yaml`** path), or **N/A + reason**. Not implied by machine **`close_out`** alone ([completion-signals-handoff.md](completion-signals-handoff.md); [REQ-TIED_CLIENT_FEEDBACK_CAPTURE] **SC-NO-NARRATIVE-POST**).
3. **Committed working staging map** — After `sub-close-out-evidence-sync`, include every **track** artifact that close-out produced and the envelope references:
   - `tied-project/working/{REQ-TOKEN}/evidence/verification-evidence-manifest.v1.json` when verification/test slugs completed (not regenerable gate JSON).
   - `tied-project/working/{REQ-TOKEN}/evidence/request-evidence-envelope.v1.json` when envelope workflow is in scope.
   - MCP **`tied_git_hygiene`** with `context_mode: plan_close_out`, `apply: false`, and `request_token: {REQ-TOKEN}` lists `committed_working_stage_candidates` — merge those paths into the staging map (they are often untracked even when work is complete).
4. **Stage** — `git add` only paths in the staging map (scoped to the REQ wave; exclude unrelated workspace drift and regenerable gate receipts under `tied-bundle/working/`).
5. **Commit message** — Per [PROC-COMMIT_MESSAGES](../../../tied-bundle/docs/processes.md): header `type(scope): subject` (≤50 chars); body with motivation, REQ/ARCH/IMPL tokens, three **completion signals** summary; footer tokens touched. Include proof-boundary / open-finding counts when CITDP requires.
6. **Commit** — `git commit` with the prepared message. **Do not push** unless the sponsor explicitly asks in the same thread.
7. **Post-commit** — Record commit SHA in `close-out-handoff.md` (or parent return). Update Tracker **`traceable-commit`** disposition to `completed` with typed `evidence_refs` (dual-write with `execution_evidence.completed` in the same pass).

## Advisory (non-blocking alone)

- Diff-scoped change-risk report when CITDP `diff_scoped_crap` is true and `crap_block` is false — warn in commit body if threshold exceeded.

## Forbidden

- Commit when `close_out` gate or envelope blocking checks failed
- `git push` without explicit sponsor request
- Staging secrets (`.env`, credentials)
