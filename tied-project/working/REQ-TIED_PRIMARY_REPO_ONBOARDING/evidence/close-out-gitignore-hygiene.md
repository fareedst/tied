# Gitignore close-out hygiene — REQ-TIED_PRIMARY_REPO_ONBOARDING

**Procedure:** [PROC-GITIGNORE_CLOSE_OUT]

- Store-path remediation (2026-10-05) touched only install-managed paths (`.cursor/mcp.json`, `.mcp.json`, `.cursor/skills/`, `.claude/`, client `tied-bundle/install.json`) — **N/A** for new patterns.
- REQ commit scope must **exclude** those paths; see `.gitignore` `# BEGIN TIED INSTALL MANAGED` (lines 418–429).
- Ephemeral `.cursor/debug-*.log` already covered by `.gitignore:2`.
