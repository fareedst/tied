# Clear-workspace routing

Normative decision tree for **`@clear-workspace`** ([REQ-TIED_CLEAR_WORKSPACE_SKILL]). The skill delegates; it does not replace **`tied_checklist_gate_validate`**, **`tied_verify`**, or checklist authority.

## Inputs

- Sponsor-named **`request_token`** and paths to **Tracker**, **CITDP**, **PLAN.md**
- Optional pasted git context ([git-context-templates.md](git-context-templates.md) close-out variant)
- **`project_root`** for MCP when hygiene or lint runs

## Evaluation order

1. **Scope** — Resolve `tied-project/working/{REQ}/` (or program plan path). Do not invent a REQ.
2. **Optional lint** — `tied_project_lint` advisory when TIED YAML changed in scope.
3. **Close-out gap** — If implementation is done but **CHANGELOG**, **`close_out`** gate receipt, envelope validate, or commit is missing → run **`@close-out`** ([tied-close-out-process.md](tied-close-out-process.md)), which includes **traceable-commit** when gates allow.
4. **Git hygiene** — `tied_git_hygiene` with `context_mode: plan_close_out`, `apply: false` first. Write receipt to `evidence/git-hygiene-receipt-{YYYY-MM-DD}.md`. Apply deletes only when sponsor supplies an **exact** untracked allowlist ([REQ-TIED_GIT_HYGIENE]).
5. **Gitignore hygiene** — When untracked patterns are recurring, follow [gitignore-close-out-hygiene.md](gitignore-close-out-hygiene.md) (propose unstaged `.gitignore` edits; stage at traceable-commit).
6. **Commit-ready check** — Proceed to traceable-commit **prep** only when:
   - `close_out` gate **allowed: true** (when TIED close-out applies), and
   - envelope validate with blocking gaps cleared (or documented waivers), and
   - three [completion signals](completion-signals-handoff.md) documented for the REQ
7. **Traceable-commit-only path** — When **`@close-out`** already ran with gates green, skip duplicate commit. Otherwise checklist slug **traceable-commit**: VALIDATE, staging map, commit (same rules as [traceable-commit-close-out.md](traceable-commit-close-out.md)).
8. **Not commit-ready** — List blockers; recommend **`@handoff`** to continue in a fresh chat.

## Forbidden

- Unprompted `git commit`, `git push`, or automatic `git status`
- Claiming completion from tests alone when verification-gated work applies
- `pbpaste` / `pbcopy`

## Related surfaces

| Surface | Role |
| --- | --- |
| **`@close-out`** | LEAP stack sync, CHANGELOG, git hygiene preview, traceable commit when gates allow |
| **`@handoff`** | Chat continuity; updates **`evidence/session-handoff.md`** |
| **`@unblock`** | Costly sponsor decisions blocking progress |
