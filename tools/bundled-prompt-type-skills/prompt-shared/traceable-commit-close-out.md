# Traceable commit (plan-close-out)

**Checklist slug:** `traceable-commit` ([PROC-AGENT_REQ_CHECKLIST])  
**Tokens:** [REQ-PROMPT_TYPE_GLOBAL_SKILLS], [REQ-TIED_GIT_HYGIENE]

Run this block **only after** unified **close_out** allows progression (`tied_checklist_gate_validate` `allowed: true` **and** envelope validate with `fail_on_error_gaps: true` and zero blocking error gaps, or equivalent `run-close-out-gates.mjs --envelope-blocking`). If either check fails, **skip commit** and label the handoff **incomplete** with blocker evidence.

## Preconditions

- `sub-close-out-evidence-sync` (or gate runner with `--sync-dispositions --reconcile`) already ran in the same close-out pass.
- Default **git hygiene** preview completed: MCP **`tied_git_hygiene`** with `context_mode: plan_close_out`, `apply: false`; receipt at `evidence/git-hygiene-receipt-{YYYY-MM-DD}.md`. Use `apply: true` only with sponsor **exact** `allowed_paths`.
- Gitignore close-out hygiene handoff bullet recorded ([gitignore-close-out-hygiene.md](gitignore-close-out-hygiene.md)).

## Procedure

1. **Touchpoint 3 (VALIDATE)** — CALL `sub-vocabulary-sync` (VALIDATE): audit all files in the scoped staging map; TIED name fields, token suffixes, pseudo-code block names, tests/code identifiers, README/CHANGELOG terms resolve to preferred terms in `./tied-project/vocab/*.md`. Do not stage until VALIDATE passes or immature-client deferral is documented in the per-request Tracker.
2. **Evidence paths** — Write or update:
   - `evidence/proposed-commit-message.txt` (staging map + message draft)
   - `evidence/traceable-commit-evidence.md` (VALIDATE outcome, gate receipt refs, hygiene receipt path)
3. **Stage** — `git add` only paths in the staging map (scoped to the REQ wave; exclude unrelated workspace drift).
4. **Commit message** — Per [PROC-COMMIT_MESSAGES](../../../tied-bundle/docs/processes.md): header `type(scope): subject` (≤50 chars); body with motivation, REQ/ARCH/IMPL tokens, three **completion signals** summary; footer tokens touched. Include proof-boundary / open-finding counts when CITDP requires.
5. **Commit** — `git commit` with the prepared message. **Do not push** unless the sponsor explicitly asks in the same thread.
6. **Post-commit** — Record commit SHA in `plan-close-out-handoff.md` (or parent return). Update Tracker **`traceable-commit`** disposition to `completed` with typed `evidence_refs` (dual-write with `execution_evidence.completed` in the same pass).

## Advisory (non-blocking alone)

- Diff-scoped change-risk report when CITDP `diff_scoped_crap` is true and `crap_block` is false — warn in commit body if threshold exceeded.

## Forbidden

- Commit when `close_out` gate or envelope blocking checks failed
- `git push` without explicit sponsor request
- Staging secrets (`.env`, credentials)
