# Test strategy — [REQ-WF_TRIAL_RANGE_CANONICAL_INPUT]

**Phase:** refine-plan · **depth:** minimal

## Satisfaction criteria → tests

| ID | Assert |
| --- | --- |
| SC-WRC-01 | `resolve-ref cursor grok-4.7 low` → slug `grok-4.7-low-fast`, config `grok47-low`, `disposable_model_bucket` `grok47low` |
| SC-WRC-02 | `build_wf_trial_disposable_tag` with `WF_TRIAL_DISPOSABLE_MODEL_BUCKET=grok46med`, `MODEL_EFFORT=medium` → suffix `grok46med` |
| SC-WRC-03 | `resolve-ref cursor grok47-med medium` throws tier conflict |
| SC-WRC-04 | Loop compose families in specs × all efforts; each slug in catalog load |
| SC-WRC-05 | `workflow_trial_range` usage stderr mentions `grok-4.7`; shell test dry-run tag for grok46 medium |

## TDD order (`@build-plan`)

1. IMPL pseudo-code + `pseudocode_validate`
2. RED spec/compose/shell tests
3. GREEN specs YAML, resolver bucket, inc.sh tag path
4. Docs smoke in `workflow-trials.md` examples

## Verification manifest

```bash
node --test tools/bootstrap/lib/wf-trial-model-spec.test.mjs
node --test tools/bootstrap/lib/wf-trial-model-compose.test.mjs
node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs
```
