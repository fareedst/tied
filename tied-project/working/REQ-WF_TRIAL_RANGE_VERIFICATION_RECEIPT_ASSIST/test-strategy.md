# Test strategy — REQ-WF_TRIAL_RANGE_VERIFICATION_RECEIPT_ASSIST

**Phase:** refine-plan · **depth:** minimal

## Satisfaction criteria → tests

| ID | Assert |
| --- | --- |
| SC-WVR-01 | `build-commands.sh` `workflow_trial_range` body contains `export WF_TRIAL_VERIFICATION_RECEIPT_ASSIST=1` in default branch |
| SC-WVR-02 | Same function: when `WF_TRIAL_SKIP_VERIFICATION_RECEIPT_ASSIST` set non-zero, `unset WF_TRIAL_VERIFICATION_RECEIPT_ASSIST` (or equivalent) |
| SC-WVR-03 | Zero-arg usage heredoc includes assist default line + skip env name (grep contract) |
| SC-WVR-04 | `tools/bootstrap/wf-trial-range-receipt-assist.test.mjs` encodes SC-WVR-01..03 + CLI guide snippet if present |
| SC-WVR-05 | `wf-trial-agentstream-help.inc.sh` still documents opt-in assist; optional test that help text does not say “range default assist” on orchestrator section |
| SC-WVR-06 | `_build_commands_cli_guide.inc.sh` mentions range assist default and skip |

## Optional shell probe (build-plan)

If monit `:` pattern is insufficient, stub `workflow_trial_agentstream` in a sourced test:

```bash
source scripts/build-commands.sh
workflow_trial_agentstream() { echo "ASSIST=${WF_TRIAL_VERIFICATION_RECEIPT_ASSIST:-}"; }
export -f workflow_trial_agentstream
workflow_trial_range claude haiku-5-5 low 1 1 :
# expect ASSIST=1 in captured output
```

Mirror skip path with `WF_TRIAL_SKIP_VERIFICATION_RECEIPT_ASSIST=1`.

## TDD order (`@build-plan`)

1. TIED REQ/ARCH/IMPL + IMPL pseudo-code (HMEP-parity export block)
2. RED `wf-trial-range-receipt-assist.test.mjs`
3. GREEN `build-commands.sh` + docs/vocab
4. LEAP indexes; `lint_yaml`; `tied_validate_consistency`
5. Regression: `node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs`

## Verification manifest (draft)

```bash
node --test tools/bootstrap/wf-trial-range-receipt-assist.test.mjs
node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs
# after LEAP: pseudocode_validate IMPL-WF_TRIAL_RANGE_VERIFICATION_RECEIPT_ASSIST
```

**Optional operator smoke (not CI):** `workflow_trial_range claude haiku-5-5 low 9 9` without manual ASSIST → manifest `verification_receipt_assist: true` when tests green (composes SC-VRCS-06 arm B via range).