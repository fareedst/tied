# CITDP draft — REQ-WF_TRIAL_PROOF_MANIFEST_SUBTYPE_GATE

(refine-plan sync — see [CITDP-REQ-WF_TRIAL_PROOF_MANIFEST_SUBTYPE_GATE.yaml](./CITDP-REQ-WF_TRIAL_PROOF_MANIFEST_SUBTYPE_GATE.yaml))

## change_definition

- **current_behavior:** L3 min-shape validates only `files[0].proof_subtype`.
- **desired_behavior:** All rows + optional bindings; `FACET_AS_SUBTYPE`; stderr DIAGNOSTIC hints.
- **unchanged_behavior:** RPM FILE_EXISTS / FILE_COVERAGE / scaffold / SKIP env.

## test_strategy

[node --test tools/bootstrap/lib/wf-trial-proof-manifest-gate.test.mjs](./test-strategy.md)
