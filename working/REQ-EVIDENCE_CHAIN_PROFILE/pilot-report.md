# Evidence chain profile — stdd Phase 4 pilot

Date: 2026-08-22  
Client: `/Users/fareed/Documents/dev/chatgpt/stdd`  
Tokens: `[REQ-EVIDENCE_CHAIN_PROFILE]` `[ARCH-EVIDENCE_CHAIN_PROFILE]` `[IMPL-EVIDENCE_CHAIN_PROFILE]` `[PROC-EVIDENCE_CHAIN]`

## Required runs

| Depth | Artifact | Result |
|---|---|---|
| `integrated` | `working/evidence-chain/stdd-integrated.json` | ok; sources: PROJECT_MANIFEST, RUN_STRUCTURAL_ANALYSIS |
| `human_research` | `working/evidence-chain/stdd-human_research.json` | ok; plus AUDIT_IMPL_FIDELITY, ANALYZE_BINDING_EVIDENCE; `change_fidelity` `not_measured` / `not_applicable` (no change_context) |

Path B fixture: `working/evidence-chain/example-profile.json` (`generator: manual`).

## Normalization metadata

- `schema_version`: `evidence-chain-profile.v1`
- `project_id`: SHA-256 prefix of the confirmed TIED base path (not the raw path)
- `tied_base_path_confirmed`: true
- Methodology / templates / fixtures listed under `scope.excluded`
- `scope.not_measured` includes `vocabulary_drift_automation` and `block_level_impl_test_matrix`

## Proof-boundary partition

- `traceability_structure` / `pseudo_code_structure`: structural adapter rows
- `semantic_fidelity`: human_research adapters only
- `executable_behavior`: `not_measured` (no quality commands executed in this pilot)
- `human_decision`: freshness / residual-risk partition

## Limitations

- Structural validators used the default ok stubs unless injected; this pilot does not claim live `tied_validate_consistency` inside the profile rows.
- No sibling-client pilots (3–5) were available in this session; they remain optional and non-blocking.
- Generator did not write project YAML, finding ledgers, or case reports.

## Cross-project writes

None.
