# Git-hygiene receipt — post BFIE traceable-commit

**Date:** 2026-10-13  
**Run-id:** `bfie-post-commit-git-hygiene-2026-10-13`  
**Tool:** `tied_git_hygiene` (preview, `context_mode: checklist`)  
**Base commit:** `b69ff757` (BFIE hash pin)

## Preview

- **Untracked:** none  
- **Tracked dirty (5):** regenerable local/test-run churn only  

## Restored (`git restore`)

| Path | Reason |
| --- | --- |
| `mcp-server/test/fixtures/adversarial-inquiry-*-mode-b/.../request-evidence-envelope.v1.json` (×2) | Envelope `generated_at` / revision drift from MCP tests |
| `tied-project/working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/fixture-1787603099/regression-manifest.json` | Local fixture metadata drift |
| `tied-project/working/REQ-TIED_JEV_CONTEXT_LOG_PRUNING/evidence/context-pruning-benchmark.v1.json` | Regenerated benchmark timestamps / `git_rev` |
| `tied-project/working/evaluation/envelope-gap-report.v1.yaml` | Local evaluation sweep output |

## Outcome

Working tree **clean** after restore; no `.gitignore` changes required.
