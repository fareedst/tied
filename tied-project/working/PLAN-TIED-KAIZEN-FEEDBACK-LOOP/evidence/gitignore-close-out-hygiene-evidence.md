# gitignore close-out hygiene

Request: `PLAN-TIED-KAIZEN-FEEDBACK-LOOP`

**2026-10-08:** Added `mcp-server/.gitignore` entry `tied-project/`; removed ephemeral `mcp-server/tied-project/` tree from wrong-root MCP runs. Prior rows below remain valid for `tied-bundle/working/`.

| Path | Class | Git treatment |
|---|---|---|
| `docs/tied-kaizen-feedback-loop-plan.md` | Linked plan | Commit in `plan-close-out` pass (see `evidence/commit-pass-handoff.md`) |
| `tied-project/vocab/feedback-to-tied.md` | Canonical vocabulary | Same commit pass |
| `tied-project/working/PLAN-TIED-KAIZEN-FEEDBACK-LOOP/` | Committed process evidence | Same commit pass |
| `tied-project/citdp/CITDP-PLAN-TIED-KAIZEN-FEEDBACK-LOOP.yaml` | Canonical CITDP | Commit when the sponsor asks |
| `tied-bundle/working/PLAN-TIED-KAIZEN-FEEDBACK-LOOP/gates/` | Local gate receipts | Already ignored |
| `tied-bundle/working/PLAN-TIED-KAIZEN-FEEDBACK-LOOP/adherence/` | Local ledger | Already ignored |

No new ignore pattern is required for those local prefixes. Existing rules cover `tied-bundle/working/**/gates/` and `tied-bundle/working/**/adherence/`.
