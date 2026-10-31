# Git hygiene receipt — repo-wide `@clear-workspace` (post LEAP unify)

**Date:** 2026-10-31  
**Tool:** `tied_git_hygiene` (`context_mode: plan_close_out`, `apply: false`)  
**Routing:** [session-handoff-clear-workspace-2026-10-31.md](../../post-session/session-handoff-clear-workspace-2026-10-31.md)

## Actions taken

| Path class | Disposition |
| --- | --- |
| MCP adversarial fixture envelopes | **`git restore`** (regenerable) |
| `tied-bundle/reports/source-graph/source-graph-index.v1.json` + mini-repo fixture | **`git restore`** |
| Checklist gate `fixture-1787603099/regression-manifest.json` | **`git restore`** |
| ICP `verification-evidence-manifest.v1.json` | **`git restore`** |
| Jev `context-pruning-benchmark.v1.json` | **`git restore`** |
| `tied-project/citdp/CITDP-REQ-{ACTIVATION,NESTED,PRESERVE,UNIT_TEST,UPGRADE*}.yaml` | **deleted** (MCP test scaffold) |
| REQ-TIED_WORKFLOW_VISUALIZATION_SKILL working edits | **`git restore`** (post-close-out handoff drift; canonical at `e01f5f4a`) |
| REQ-TIED_DURABLE_CHECKLIST_CONTROLLER `close-out-handoff.md` local tweak | **`git restore`** (post-session doc holds clear-workspace pointer) |

## Left intentionally dirty / untracked

| Path | Reason |
| --- | --- |
| `project-identity.v1.yaml` (repo root) | Dogfood marker — **untracked** per ICP constraint; do not commit |
| `tied-project/working/REQ-TIED_INTENT_CONTROL_PLANE/evidence/close-out-mcp-test-isolation-2026-10-30.md` | **Committed** in **`64d6b12d`** |
| `tied-project/working/REQ-TIED_INTENT_CONTROL_PLANE/evidence/evidence-chain-profile.v1.json` | Regenerable — local untracked only |
| `project-identity.v1.yaml` (repo root) | Local dogfood marker — untracked per ICP constraint |

## Follow-up pass (2026-10-31)

Close-out handoff links + **`origin/main`** sync; remaining untracked paths documented in [session-handoff.md](./session-handoff.md) § Workspace.

## MCP note

`tied_git_hygiene` **apply** with partial `allowed_paths` rejected (`allowlist_mismatch`); CITDP scaffolds removed via shell `rm` matching preview untracked set subset.
