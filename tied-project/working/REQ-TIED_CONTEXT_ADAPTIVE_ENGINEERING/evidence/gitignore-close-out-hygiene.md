# Gitignore close-out hygiene — REQ-TIED_CONTEXT_ADAPTIVE_ENGINEERING

**Date:** 2026-10-18 · **[PROC-GITIGNORE_CLOSE_OUT]**

## Classification

| Class | Paths | Action |
| --- | --- | --- |
| **ignore (existing)** | `tied-bundle/working/**/adversarial-inquiry/` | Already gitignored; close_out artifacts regenerable |
| **ignore (existing)** | `request-evidence-envelope.v1.json` under working evidence | Regenerable envelope per [PROC-WORKING_ARTIFACT_PLACEMENT] |
| **track** | `tied-project/working/REQ-TIED_CONTEXT_ADAPTIVE_ENGINEERING/**` committed rationale | Stage at `@traceable-commit` |
| **track** | `mcp-server/src/context-adaptive/`, seed `tied-bundle/resources/context-adaptive/` | Product deliverables |
| **exclude from CAE commit** | Unrelated drift: `REQ-TIED_JEV_CONTEXT_LOG_PRUNING`, `REQ-TIED_PATH_SCOPED_REVIEW_GUIDANCE/PLAN.md`, `REQ-TIED_EASAR_RECOVERY` handoff-only edits, MCP test fixture envelopes | Do not stage with CAE wave |

## Handoff bullet

**Gitignore hygiene ([PROC-GITIGNORE_CLOSE_OUT]):** N/A for new patterns — bundle `working/` inquiry paths match existing gitignore; CAE committed working tree is intentional **track**; exclude unrelated modified paths listed above at `traceable-commit`.
