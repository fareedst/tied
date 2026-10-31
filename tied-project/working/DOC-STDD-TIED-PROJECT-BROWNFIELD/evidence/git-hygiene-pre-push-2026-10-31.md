# Git hygiene — pre-push (2026-10-31)

**Context:** `main` **5 commits** ahead of `origin/main` (G1, G5, G7 traceable slices).  
**Tool:** `tied_git_hygiene` (`agent_preview`, `DOC-STDD-TIED-PROJECT-BROWNFIELD`)

---

## Restored to `HEAD` (regenerable / stray edits)

| Path | Reason |
| --- | --- |
| `mcp-server/test/fixtures/**/request-evidence-envelope.v1.json` | Test run drift |
| `mcp-server/test/fixtures/**/corpus-graph-index.v1.json`, `source-graph-index.v1.json` | Graph refresh noise |
| `tied-bundle/reports/source-graph/source-graph-index.v1.json` | Local graph refresh |
| `tied-project/working/evaluation/envelope-gap-report.v1.yaml` | Reverted accidental shrink to 10-token sample; **G5 full report** stays at commit `2fa173cc` |
| `tied-project/working/REQ-TIED_JEV_CONTEXT_LOG_PRUNING/evidence/context-pruning-benchmark.v1.json` | Benchmark regen |
| `tied-project/working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/fixture-*/regression-manifest.json` | Fixture regen |
| `tied-project/working/DOC-STDD-META-HUB-TEMPLATE-DOGFOOD/evidence/traceable-commit-evidence.md` | One-line SHA drift |
| `tied-project/working/PLAN-EDPC-META-HUB-ENGAGEMENT/evidence/session-handoff.md` | Uncommitted session sync |
| `tied-project/working/WORKSPACE-CLEAR-2026-10-31/evidence/workspace-clear-handoff.md` | Unrelated handoff |

Command: `git restore` on the paths above.

---

## Left dirty (intentional WIP — not in gap push)

| Area | Paths |
| --- | --- |
| **DOC gap sprint handoff** | `tied-project/working/DOC-STDD-TIED-PROJECT-BROWNFIELD/evidence/session-handoff.md` — commit separately or push without |
| **LangGraph P4** | `tools/langgraph-pilot/**`, `PLAN-TIED-LANGGRAPH-ORCHESTRATION/…`, untracked `PLAN-TIED-LG-P4-ACCEPTANCE/`, `docs/langgraph/plan-tied-lg-p4-acceptance-gate.md`, `CITDP-PLAN-TIED-LG-P4-ACCEPTANCE.yaml` |
| **CHANGELOG** | Review before commit (may belong to LangGraph slice) |

---

## Untracked — do not push with gap batch

| Path | Action |
| --- | --- |
| `project-identity.v1.yaml` (repo root) | **Never commit** — local Path 3 dogfood |
| `tied-project/citdp/CITDP-REQ-*.yaml` (6 files) | MCP/test scratch — removed from working tree (see below) |

---

## Push readiness

```bash
# Gap commits only (working tree may still show LangGraph + DOC handoff)
git push origin main
```

Optional: `chore(working)` commit for [session-handoff.md](./session-handoff.md) before or after push.
