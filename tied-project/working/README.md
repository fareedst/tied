# Committed working root (`tied-project/working/`)

Per [working-artifact-placement](../../tied-bundle/docs/working-artifact-placement.md) ([PROC-WORKING_ARTIFACT_PLACEMENT]):

| Path | Role |
| --- | --- |
| **`tied-project/working/`** | **Canonical** committed process evidence — `PLAN.md`, per-REQ Trackers, handoffs, draft CITDP, envelope facets |
| `tied-bundle/working/` | Local/regenerable machine evidence (gates, ledgers, inquiry trees) — gitignored on clients |
| Repo-root **`working/`** | **Alias only** when present — not a second tree |

## Store repository (`stdd`)

This repo tracks a **symlink** at the repository root:

```text
working -> tied-project/working
```

Legacy plans and handoffs may link as `working/{TOKEN}/` or `tied-project/working/{TOKEN}/`; both resolve to the same committed tree here. **Author new paths as `tied-project/working/`** so brownfield clients without a root alias do not misplace edits.

## Brownfield clients

If a repo still has a physical undivided `working/` directory (not under `tied-project/`), run `tied-install --migrate-layout` and follow [working-artifact-placement](../../tied-bundle/docs/working-artifact-placement.md) § gray zones — do not maintain duplicate orchestrators.

## Related

- [AGENTS.md](../../AGENTS.md) — session bootstrap
- [docs/checklist-process-review-plan.md](../../docs/checklist-process-review-plan.md) — checklist/process review procedure
