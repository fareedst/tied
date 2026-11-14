# Git hygiene — plan_close_out (2026-11-14)

**REQ:** REQ-AGENT_HARNESS_EVALUATION_DOCS  
**MCP:** `tied_git_hygiene` · `context_mode: plan_close_out` · `apply: false`

## Gitignore close-out

- **Applied (staged):** `docs/agent-harness-evaluation/operator-cheatsheet.md` — local-only operator quick ref.
- **Regenerable:** gate receipts under `tied-bundle/working/REQ-AGENT_HARNESS_EVALUATION_DOCS/gates/` — not staged.

## committed_working_stage_candidates

- `tied-project/working/REQ-AGENT_HARNESS_EVALUATION_DOCS/evidence/verification-evidence-manifest.v1.json` (negation rule in `.gitignore` allows track)
- `tied-project/working/REQ-AGENT_HARNESS_EVALUATION_DOCS/evidence/request-evidence-envelope.v1.json` (same)

## Excluded drift (not in staging map)

- `tied-project/working/FACILITATOR-WF-PUBLISH-*/`
- `tied-project/working/REQ-WF_TRIAL_MATRIX_COLUMN_LAYOUT/`
- Unrelated open REQ working trees