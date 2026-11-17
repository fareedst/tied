# Test strategy — [REQ-WF_TRIAL_EVALUATION_GUIDE]

**profile_depth:** minimal · **gate_policy:** advisory

## Scope

| In | Out |
| --- | --- |
| `wf-trial-evaluation-guide-contract.test.mjs` | Disposable client orchestrator runs |
| `AHE_WORKFLOW_TRIALS_GUIDE_REL` in path module | Rewriting 130+ readouts |
| README index link | Reddit post publish |
| TIED REQ/ARCH/IMPL mint + consistency | HMEP pipeline changes |

## Test map

| ID | Type | File / command | Notes |
| --- | --- | --- | --- |
| SC-WF-EG-01 | unit | `wf-trial-evaluation-guide-contract.test.mjs` | `resolveAhePaths` or `AHE_WORKFLOW_TRIALS_GUIDE_REL` + file exists |
| SC-WF-EG-02 | unit | same | Assert each normative H2 from PLAN § Guide outline |
| SC-WF-EG-03 | unit | same | Ban `maturity_score`; require leaderboard disclaimer; HMEP ≠ session grading |
| SC-WF-EG-04 | unit | same | Parse markdown links; `path.join(TIED_REPO_ROOT, rel)` exists for allowlist |
| SC-WF-EG-05 | unit | same | `README.md` contains `workflow-trials-guide.md` |
| SC-WF-EG-06 | integration | `tied_validate_consistency` | Post token mint |

## Link allowlist (SC-WF-EG-04 minimum)

Resolve at least:

- `docs/agent-harness-evaluation/catalogs/catalog-traditional-workflow-trial-prompts.md`
- `docs/agent-harness-evaluation/registries/traditional-workflow-trial-runs-registry.md`
- `docs/agent-harness-evaluation/cohort/comparison-table.md`
- Exemplar readout basename for WF-09 Haiku low @ 1794880253
- `tools/bundled-record-wf-trial-skill/SKILL.md` or `reference.md`

## RED-first order

1. Path constant + empty/missing guide → contract fails SC-WF-EG-01.
2. Stub guide with headings only → SC-WF-EG-02 partial green.
3. Full guide + README → SC-WF-EG-03..05 green.

## Verification battery (close-out)

```bash
node --test tools/bootstrap/lib/wf-trial-evaluation-guide-contract.test.mjs
# tied-cli: tied_validate_consistency
```