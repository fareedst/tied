# Test strategy — product REQ resolver (wave 2)

**profile_depth:** minimal · **gate_policy:** advisory  
**Tracker slugs:** `unit-test-red` → `unit-test-green` → `composition-integration` → `verification-gate`

## RED first (`@build-plan`)

Add to [`workflow-trial-agentstream-sh.test.mjs`](../../../tools/bootstrap/workflow-trial-agentstream-sh.test.mjs) (reuse existing bash `source` + temp `tied-project/working` layout):

| Case | Fixture | Expected | SC |
| --- | --- | --- | --- |
| Table `REQ token` row | `phase-handoff-add-feature.md` with `\| REQ token \| \`REQ-…\` \|` | `wf_trial_resolve_product_req_token` prints token | SC-WF-PHG-06 |
| Table `REQ` row only | `\| REQ \| \`REQ-…\` \|` | same | SC-WF-PHG-06 |
| Dirname fallback | handoff present, empty body, dir `REQ-PHG-DIR-FALLBACK` | basename wins | SC-WF-PHG-06 |
| Gate happy | stubs for handoffs 2–3; no `package.json` (skip npm) | `wf_trial_phase_handoff_gate_check` exit 0 | SC-WF-PHG-01 |
| Diagnostics | only `wf-trial-orchestrator-run` under working (+ unparsed handoff in second dir) | stderr lists ≤12 basenames and `found-unparsed:` paths; exit 1 | SC-WF-PHG-06 |
| Regression | existing SC-WF-PHG-01/03/04 cases | unchanged pass | SC-WF-PHG-01..04 |

**Composition:** Resolver + gate sourced together (same as production `wf-trial-phase-handoff-gate.inc.sh`).

## Commands

```bash
node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs
```

## Manual (post-green)

Inspect disposable run folder for `1794406459-*` if still on disk: confirm table handoff would parse; otherwise diagnostics must show missing product `REQ-*` folder.
