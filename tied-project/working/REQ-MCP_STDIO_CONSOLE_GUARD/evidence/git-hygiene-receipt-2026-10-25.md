# Git hygiene receipt — REQ-MCP_STDIO_CONSOLE_GUARD

**Date:** 2026-10-25  
**Tool:** `tied_git_hygiene` · `context_mode: plan_close_out` · `apply: false`

## Scoped staging

REQ-MCP_STDIO_CONSOLE_GUARD product + TIED artifacts + `tied-project/working/REQ-MCP_STDIO_CONSOLE_GUARD/` (PLAN, CITDP, committed manifest per gitignore exception).

## Excluded unrelated drift

Other modified paths (e.g. REQ-TIED_CLIENT_FEEDBACK_CAPTURE, source-graph indexes, adversarial fixtures, JEV benchmark) left unstaged.

## Regenerable

Gate JSON under `tied-project/working/REQ-MCP_STDIO_CONSOLE_GUARD/gates/` (if present) — local only per gitignore.
