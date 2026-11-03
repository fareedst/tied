# Git hygiene receipt — REQ-TIED_RUNTIME_DISK_CONFIG spine fix

**Date:** 2026-11-03  
**context_mode:** plan_close_out  
**apply:** false  
**request_token:** REQ-TIED_RUNTIME_DISK_CONFIG  

## Preview

MCP `tied_git_hygiene` ok; no apply. Staged close-out excludes unrelated tracked dirty paths (fixtures, source-graph, other REQ working trees, methodology `tied-bundle/` drift, stray untracked CITDP fixture copies).

## Post-REQ workspace clean

After traceable commit: `git restore` on excluded paths listed in [traceable-commit-evidence.md](./traceable-commit-evidence.md). Remove untracked `tied-project/citdp/CITDP-REQ-{ACTIVATION,...}.yaml` fixture copies.
