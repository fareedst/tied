# Gitignore close-out hygiene — OEE-TIED-CLIENT-DELIVERY

**Date:** 2026-10-12  
**Slug:** `gitignore-close-out-hygiene` ([PROC-GITIGNORE_CLOSE_OUT])

## Inputs

Session-handoff indicative snapshot plus `tied_git_hygiene` preview (checklist mode).

## Classification

| Path class | Examples | Action |
| --- | --- | --- |
| **track** | `docs/tied-operating-environment-externalities.md`, `docs/tied-concept-impact-inquiry.md`, `tied-project/vocab/operating-environment-externalities.md`, `tied-project/working/OEE-TIED-CLIENT-DELIVERY/**`, `tied-bundle/docs/client-development-index.md`, `tied-project/vocab/routing.md` | Stage at traceable-commit |
| **ignore / leave untracked** | `docs/tools/*.mp4`, `docs/demos/trial-readout-PROMPT-GF-09-*`, LangGraph `PLAN-TIED-LG-*`, bounded-worker REQ scratch, adversarial fixture envelopes | Do not stage; no new one-off ignore literals |
| **tracked dirty (out of scope)** | `semantic-tokens.yaml`, LangGraph handoffs, checklist fixtures, catalog demo edits | Do not stage unless sponsor expands scope |

## Handoff bullet

- **Gitignore hygiene ([PROC-GITIGNORE_CLOSE_OUT]):** N/A for new patterns — OEE deliverables classified **track**; ephemeral noise (`docs/tools/*.mp4`, unrelated untracked programs) left unstaged; no `.gitignore` edit required.
