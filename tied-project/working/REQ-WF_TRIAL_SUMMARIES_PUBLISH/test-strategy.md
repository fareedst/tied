# Test strategy — [REQ-WF_TRIAL_SUMMARIES_PUBLISH]

**profile_depth:** minimal · **gate_policy:** advisory

## Scope

| In | Out |
| --- | --- |
| Bootstrap `node:test` under `tools/bootstrap/lib/` | E2E disposable client runs |
| Skill contract (SKILL + reference prose) | MCP schema changes |
| Orchestrator `--check` on store tree | Auto-commit |
| Golden fixtures (minimal catalog fragment + 1–2 readout stubs) | Full 123-row registry golden |

## Test map

| ID | Type | File / command | Notes |
| --- | --- | --- | --- |
| SC-WF-PSP-01 | unit | `store-facilitator-skills.test.mjs` | Fourth skill name + bundle path |
| SC-WF-PSP-02 | unit | `wf-trial-summaries-publish-skill-contract.test.mjs` (new) | Parse SKILL.md + reference for artifact list + "no required" |
| SC-WF-PSP-03 | integration | `wf-trial-summaries-publish.test.mjs` | `--check` subprocess; optional skip if env lacks discover parent when testing size skip |
| SC-WF-PSP-04 | unit | `wf-trial-registry-author.test.mjs` | Fixture catalog markdown → master table fragment |
| SC-WF-PSP-05 | unit | Reuse / extend `read-trial-readout-session-grading` tests | mean + compact grades |
| SC-WF-PSP-06 | unit | `wf-trial-comparison-matrix.test.mjs` + `build-wf-trial-comparison-matrix.mjs --check` | After promote |

## Fixtures

Location: `tools/bootstrap/fixtures/wf-trial-summaries-publish/`

- `catalog-snippet.md` — 2–3 Recorded trials rows with readout links
- `readout-stub-01.md` — metadata + session grading minimal valid table
- `registry-golden-fragment.md` — expected master rows for snippet

## RED-first order

1. SC-WF-PSP-01, SC-WF-PSP-02 (skill manifest + contract)
2. SC-WF-PSP-04, SC-WF-PSP-05 (pure libs)
3. SC-WF-PSP-06 (matrix promote)
4. SC-WF-PSP-03 (orchestrator; last)

## Verification battery (close-out)

```bash
node --test tools/bootstrap/lib/store-facilitator-skills.test.mjs
node --test tools/bootstrap/lib/wf-trial-summaries-publish*.test.mjs
node --test tools/bootstrap/lib/wf-trial-comparison-matrix.test.mjs
node tools/bootstrap/lib/build-wf-trial-comparison-matrix.mjs --check
node tools/bootstrap/lib/wf-trial-summaries-publish.mjs --check
# tied-cli: tied_validate_consistency
```
