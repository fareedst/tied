# Git hygiene — clear-workspace (2026-10-31)

**Tool:** `tied_git_hygiene` (`context_mode: plan_close_out`, `apply: false` then `apply: true`)  
**Scope:** Repo-wide drift after REQ-TIED_BOUNDED_COMPOSITION reconcile commits  
**Reference:** [clear-workspace-routing.md](../../../../tools/bundled-prompt-type-skills/prompt-shared/clear-workspace-routing.md), [workspace-clear-handoff.md](../../WORKSPACE-CLEAR-2026-10-31/evidence/workspace-clear-handoff.md)

## Preview summary

| Class | Action |
| --- | --- |
| BC evidence SHA drift | Commit fix → primary traceable **`1b9e5646`** (pin commit `0afc94d6` had wrong `efbd165e`) |
| Gate test CITDP litter | Delete untracked `tied-project/citdp/CITDP-REQ-{ACTIVATION,NESTED,...}.yaml` |
| Path-3 dogfood markers | Delete `project-identity.v1.yaml`, `tied-bundle/project-identity.v1.yaml` (keep local only when actively dogfooding) |
| Regenerable brownfield graphs | Delete untracked corpus/source graph indexes under DOC brownfield evidence |
| Reconcile stderr captures | Delete `bc-reconcile-*.stderr.txt` (regenerable quality collect output) |

## Excluded from commit

- `project-identity.v1.yaml` — never product config in git  
- Regenerable gate/tied-verify JSON (gitignored under `tied-project/working/**/gates/`)

## Post-clear expectation

`git status --porcelain` empty on `main` (ignored paths may remain).

## Execution

- **Commit:** `d2d16ad2` — traceable SHA fix + this receipt  
- **`tied_git_hygiene` apply:** 12 untracked paths deleted (see preview in MCP receipt)  
- **Result:** workspace clean on 2026-10-31
