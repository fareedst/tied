# Session handoff — REQ-WF_TRIAL_MODEL_SPEC_CLI

**handoff_kind:** prompt-skill-disk  
**request_token:** REQ-WF_TRIAL_MODEL_SPEC_CLI  
**date:** 2026-11-09  
**plan_phase:** close-out-ready  

---

## Plan execution steps

1. Validate [IMPL pseudo-code](../../../implementation-decisions/IMPL-WF_TRIAL_MODEL_SPEC_CLI-pseudocode.md) with `pseudocode_validate`.
2. **RED** — add [tools/bootstrap/lib/wf-trial-model-spec.test.mjs](../../../tools/bootstrap/lib/wf-trial-model-spec.test.mjs) and extend [workflow-trial-agentstream-sh.test.mjs](../../../tools/bootstrap/workflow-trial-agentstream-sh.test.mjs) per [test-strategy.md](../test-strategy.md).
3. Add [docs/demos/wf-trial-model-specs.yaml](../../../docs/demos/wf-trial-model-specs.yaml) per PLAN §6.
4. Implement [tools/bootstrap/lib/wf-trial-model-spec.mjs](../../../tools/bootstrap/lib/wf-trial-model-spec.mjs) + [scripts/lib/wf-trial-model-spec.inc.sh](../../../scripts/lib/wf-trial-model-spec.inc.sh).
5. Replace `workflow_trial_range` in [scripts/build-commands.sh](../../../scripts/build-commands.sh) (5-arg).
6. Optional orchestrator resolve in [scripts/workflow-trial-agentstream.sh](../../../scripts/workflow-trial-agentstream.sh).
7. Update help, `how`, catalog, [tied-project/vocab/agentstream.md](../../vocab/agentstream.md).
8. LEAP [REQ-WF_TRIAL_MODEL_EFFORT](../../../requirements/REQ-WF_TRIAL_MODEL_EFFORT.yaml) range criteria / handoff examples.
9. **GREEN** — verification manifest; `lint_yaml`; `tied_validate_consistency`.
10. Persist CITDP to `tied-project/citdp/` at close-out.

---

## Do next

**`@close-out`** when ready to commit (verification gate + traceable commit).

---

## TIED tokens

- [REQ-WF_TRIAL_MODEL_SPEC_CLI](../../../requirements/REQ-WF_TRIAL_MODEL_SPEC_CLI.yaml)
- [ARCH-WF_TRIAL_MODEL_SPEC_CLI](../../../architecture-decisions/ARCH-WF_TRIAL_MODEL_SPEC_CLI.yaml)
- [IMPL-WF_TRIAL_MODEL_SPEC_CLI](../../../implementation-decisions/IMPL-WF_TRIAL_MODEL_SPEC_CLI.yaml)
