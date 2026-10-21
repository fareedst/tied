# Test strategy — REQ-TIED_HTOL_PILOT_COHORT_RUNBOOK

**depth_tier:** `minimal`  
**gate_policy:** `advisory`

## add-feature / build-plan

### Mandatory order

1. **RED/GREEN:** `node --test tools/bootstrap/lib/htol-pilot-cohort-runbook-doc.test.mjs`
2. **Slice A:** Author `tied-bundle/docs/htol-pilot-cohort-runbook.md` until doc test green.
3. **Slice B:** Add `tied-bundle/templates/htol-pilot-cohort-runbook-instance.v1.example.yaml`.
4. **Slice C:** Cross-links in charter § Operator sequence and harness-trace-observation-loop Loop 3 section.
5. **Slice D:** `pseudocode_validate` on IMPL sidecar; `tied_validate_consistency`; `lint_yaml` on touched project YAML.

### test-strategy executable matrix (acceptance)

| Field | Required content |
| --- | --- |
| RED command(s) | `node --test tools/bootstrap/lib/htol-pilot-cohort-runbook-doc.test.mjs` |
| Green command(s) | Same command after runbook + links on disk |
| Verification gate | `tied_checklist_gate_validate` `phase: verification` + receipt under `gates/` |
| Proof line | model self-check is not sole proof of runbook completeness |

Compose with [harness-trace-learning-experiment-charter.md](../../../tied-bundle/docs/harness-trace-learning-experiment-charter.md) test-strategy matrix.

### Regression boundaries

- No changes to methodology MCP tool contracts
- No LangSmith or vendor bench claims in runbook
- Dogfood row `mle-htol-pilot-20261021-001` remains structural/inconclusive until real cohort
