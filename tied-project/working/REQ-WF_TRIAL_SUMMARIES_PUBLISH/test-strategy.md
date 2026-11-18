# Test strategy — [REQ-WF_TRIAL_SUMMARIES_PUBLISH]

**profile_depth:** minimal · **gate_policy:** advisory  
**Wave 2 (2026-11-18):** registry catalog sync + unlimited publish size batch — see [PLAN.md](./PLAN.md) § wave 2.

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
| SC-WF-PSP-04 | unit | `wf-trial-registry-author.test.mjs` | Append-only sync inserts missing href; does not remove orphan master row in fixture |
| SC-WF-PSP-05 | unit | Reuse / extend `read-trial-readout-session-grading` tests | mean + compact grades |
| SC-WF-PSP-06 | unit | `wf-trial-comparison-matrix.test.mjs` + `build-wf-trial-comparison-matrix.mjs --check` | Include WF-03 `cursor:grok47-low` spot **1795023644** |
| SC-WF-PSP-07 | unit | `project-size-discover-clients.test.mjs` (new) | `limit 0` vs `limit 5` on synthetic parent |
| SC-WF-PSP-08 | integration | post-publish store tree | Master + matrix contain `1795023644` |

## Fixtures

Location: `tools/bootstrap/fixtures/wf-trial-summaries-publish/`

- `catalog-snippet.md` — 2–3 Recorded trials rows with readout links
- `readout-stub-01.md` — metadata + session grading minimal valid table
- `registry-golden-fragment.md` — expected master rows for snippet

## RED-first order (wave 2)

1. SC-WF-PSP-04 (`wf-trial-registry-author`) + fixtures under `tools/bootstrap/fixtures/wf-trial-summaries-publish/`
2. SC-WF-PSP-07 (`project-size-discover-clients` unlimited)
3. SC-WF-PSP-06 matrix spot WF-03 (extends existing file)
4. SC-WF-PSP-08 + SC-WF-PSP-03 orchestrator integration (last)

Wave 1 tests remain green; do not regress SC-WF-PSP-01..06.

## Verification battery (close-out)

```bash
node --test tools/bootstrap/lib/store-facilitator-skills.test.mjs
node --test tools/bootstrap/lib/wf-trial-summaries-publish*.test.mjs
node --test tools/bootstrap/lib/wf-trial-comparison-matrix.test.mjs
node tools/bootstrap/lib/build-wf-trial-comparison-matrix.mjs --check
node tools/bootstrap/lib/wf-trial-summaries-publish.mjs --check
# tied-cli: tied_validate_consistency
```
