# publish-wf-trial-summaries — reference

[REQ-WF_TRIAL_SUMMARIES_PUBLISH]

## Invocation (no required remainder)

```text
@publish-wf-trial-summaries [--dry-run] [--check] [--skip-size-batch] [--skip-registry-matrix]
```

| Flag | Effect |
| --- | --- |
| *(none)* | Full cohort refresh |
| `--dry-run` | Print planned steps only |
| `--check` | Run comparison-matrix spot checks on current registry (no writes) |
| `--skip-size-batch` | Skip `project-size-batch-compare.mjs` |
| `--skip-registry-matrix` | Skip registry + matrix regen |

CLI equivalent:

```bash
node tools/bootstrap/lib/wf-trial-summaries-publish.mjs [--store-root ABS] [flags]
```

## Publish surface

| Artifact | Action |
| --- | --- |
| [traditional-workflow-trial-runs-registry.md](../../docs/demos/traditional-workflow-trial-runs-registry.md) | Refresh master table grades/exit/run time from readouts; recompute **Latest**; update header |
| Same file § Latest-run comparison matrix | `build-wf-trial-comparison-matrix.mjs` |
| [comparison-table.md](../../tied-project/non-tied-plans/project-size-batch-discover-compare/evidence/comparison-table.md) | `project-size-batch-compare.mjs --include-trial-factors` |
| [catalog-traditional-workflow-trial-prompts.md](../../docs/demos/catalog-traditional-workflow-trial-prompts.md) | **Validate** readout links only (no row rewrite v1) |

**Forbidden:** `maturity_score`, leaderboard-as-maturity, disposable client writes, auto git commit.

## Diagnostics

Orphan `trial-readout-*.md` files not linked from catalog → listed in publish-summary evidence; excluded from registry policy.

## Store install

```bash
./tied-install.sh --allow-self-install --layers skills .
```
