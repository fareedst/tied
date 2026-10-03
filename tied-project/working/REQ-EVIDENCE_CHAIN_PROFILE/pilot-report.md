# Evidence chain profile — stdd wiring pilot

Date: 2026-08-22  
Client: `/Users/fareed/Documents/dev/chatgpt/stdd`  
Tokens: `[REQ-EVIDENCE_CHAIN_PROFILE]` `[ARCH-EVIDENCE_CHAIN_PROFILE]` `[IMPL-EVIDENCE_CHAIN_PROFILE]` `[PROC-EVIDENCE_CHAIN]`

## Phase A + B pilot runs

| Run | Artifact | quality.command_results | structural rows |
|---|---|---|---|
| Bare integrated (pre-wiring baseline) | `working/evidence-chain/stdd-integrated.json` | `not_measured` | all `not_measured` |
| Manifest attach only | `working/evidence-chain/stdd-integrated-with-manifest.json` | **`observed`** | all `not_measured` (expected pre-structural flag) |
| Manifest + `invoke_structural_validators: true` | `working/evidence-chain/stdd-integrated-with-manifest-and-structural.json` | **`observed`** | all **`observed`** |

Manifest source: `working/evidence-chain/verification-evidence-manifest.v1.json` (from `quality_evidence_collect_manifest`).

## Proof-boundary partition (post-wiring)

- `traceability_structure` / `pseudo_code_structure`: `observed` only when `invoke_structural_validators: true`
- `executable_behavior`: `observed` when `manifest_reference` supplied
- `semantic_fidelity`: human_research adapters only
- `human_decision`: freshness / residual-risk partition

## Limitations

- Structural live collection is opt-in (`invoke_structural_validators`, default `false`).
- No sibling-client pilots re-run in this session.
- Generator did not write project YAML, finding ledgers, or case reports.

## Cross-project writes

None.
