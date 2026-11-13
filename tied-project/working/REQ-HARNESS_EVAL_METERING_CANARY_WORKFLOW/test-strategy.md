# Test strategy — [REQ-HARNESS_EVAL_METERING_CANARY_WORKFLOW]

**Phase:** refine-plan · **depth:** `minimal` · **gate_policy:** `advisory`  
**Scope:** TIED store scripts and docs only (disposable client product tested only during live WF smoke).

## Satisfaction criteria → tests

| ID | Assert | Test home |
| --- | --- | --- |
| SC-HEMC-01 | `wf-meter-01 --dry-run` exit 0; remainder contains `meteringCanaryLabel` | `workflow-trial-agentstream-sh.test.mjs` |
| SC-HEMC-02 | `wf-13` / `wf-meter-99` rejected; `wf-09 --dry-run` still passes | same |
| SC-HEMC-03 | Catalog file exists; includes budget table and `PROMPT-WF-METER-01` block | `wf-trial-metering-catalog-contract.test.mjs` |
| SC-HEMC-04 | Suite YAML parses; `scenario_id: wf-meter-01` | contract test or harness-eval schema test (when HMEP SC-HMEP-M1-05 lands) |
| SC-HEMC-05 | `--help` mentions `wf-meter-01` | `workflow-trial-agentstream-sh.test.mjs` |
| SC-HEMC-06 | Manual smoke manifest optional; evidence path in working folder | operator evidence |

## RED assertions (orchestrator)

- `normalize_wf_id wf-meter-01` → `WF-METER-01`
- `CATALOG_REL` for meter ids points at `docs/demos/catalog-harness-metering-lite-workflow.md`
- `extract_feature_remainder WF-METER-01` non-empty line count ≥ 1
- Traditional path: `WF-02` still uses `catalog-traditional-workflow-trial-prompts.md`

## TDD order (`@build-plan`)

1. IMPL pseudo-code for id routing + catalog extract
2. RED bootstrap tests (above)
3. GREEN script + catalog + suite YAML
4. Optional manual: full four-phase disposable run → manifest JSON saved under evidence

## Verification manifest (close-out target)

```bash
node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs
node --test tools/bootstrap/lib/wf-trial-metering-catalog-contract.test.mjs
```
