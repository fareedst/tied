# Evidence chain statistics report

generated_at: 2026-10-10T20:33:39.195Z
mode: strict
include_absolute_paths: false
generator_version: 1.0.0
schema_version: evidence-chain-statistics-report.v1

## Counts

- inputs: 3
- cohorts: 2
- excluded_input_count: 0/3 observed source=report_input_manifest method=count proof_boundary=traceability_structure
- validation_error_count: 0/3 observed source=VALIDATE_PROFILE_ARTIFACT method=count proof_boundary=traceability_structure

## Cohorts

### evidence-chain-profile.v1|human_research

#### Statistics

- cohort_profile_count: 1/1 observed source=accepted_inputs method=count proof_boundary=traceability_structure
- unique_project_id_count: 1/1 observed source=identity.project_id method=distinct_count proof_boundary=traceability_structure
- measurement_status_count: 0/1 observed source=evidence_chain.graph method=status_count proof_boundary=traceability_structure field_path=evidence_chain.graph counted_status=observed
- measurement_status_count: 1/1 observed source=evidence_chain.graph method=status_count proof_boundary=traceability_structure field_path=evidence_chain.graph counted_status=not_measured
- measurement_status_count: 0/1 observed source=evidence_chain.graph method=status_count proof_boundary=traceability_structure field_path=evidence_chain.graph counted_status=unknown
- measurement_status_count: 0/1 observed source=evidence_chain.graph method=status_count proof_boundary=traceability_structure field_path=evidence_chain.graph counted_status=not_applicable
- measurement_status_count: 1/1 observed source=evidence_chain.vocab_resolution method=status_count proof_boundary=traceability_structure field_path=evidence_chain.vocab_resolution counted_status=observed
- measurement_status_count: 0/1 observed source=evidence_chain.vocab_resolution method=status_count proof_boundary=traceability_structure field_path=evidence_chain.vocab_resolution counted_status=not_measured
- measurement_status_count: 0/1 observed source=evidence_chain.vocab_resolution method=status_count proof_boundary=traceability_structure field_path=evidence_chain.vocab_resolution counted_status=unknown
- measurement_status_count: 0/1 observed source=evidence_chain.vocab_resolution method=status_count proof_boundary=traceability_structure field_path=evidence_chain.vocab_resolution counted_status=not_applicable
- measurement_status_count: 0/1 observed source=quality.command_results method=status_count proof_boundary=executable_behavior field_path=quality.command_results counted_status=observed
- measurement_status_count: 1/1 observed source=quality.command_results method=status_count proof_boundary=executable_behavior field_path=quality.command_results counted_status=not_measured
- measurement_status_count: 0/1 observed source=quality.command_results method=status_count proof_boundary=executable_behavior field_path=quality.command_results counted_status=unknown
- measurement_status_count: 0/1 observed source=quality.command_results method=status_count proof_boundary=executable_behavior field_path=quality.command_results counted_status=not_applicable
- measurement_status_count: 1/1 observed source=quality.freshness method=status_count proof_boundary=human_decision field_path=quality.freshness counted_status=observed
- measurement_status_count: 0/1 observed source=quality.freshness method=status_count proof_boundary=human_decision field_path=quality.freshness counted_status=not_measured
- measurement_status_count: 0/1 observed source=quality.freshness method=status_count proof_boundary=human_decision field_path=quality.freshness counted_status=unknown
- measurement_status_count: 0/1 observed source=quality.freshness method=status_count proof_boundary=human_decision field_path=quality.freshness counted_status=not_applicable
- measurement_status_count: 0/1 observed source=change_fidelity method=status_count proof_boundary=semantic_fidelity field_path=change_fidelity counted_status=observed
- measurement_status_count: 1/1 observed source=change_fidelity method=status_count proof_boundary=semantic_fidelity field_path=change_fidelity counted_status=not_measured
- measurement_status_count: 0/1 observed source=change_fidelity method=status_count proof_boundary=semantic_fidelity field_path=change_fidelity counted_status=unknown
- measurement_status_count: 0/1 observed source=change_fidelity method=status_count proof_boundary=semantic_fidelity field_path=change_fidelity counted_status=not_applicable
- measurement_status_count: 8/8 observed source=evidence_chain.structural method=status_count proof_boundary=traceability_structure field_path=evidence_chain.structural counted_status=observed
- measurement_status_count: 0/8 observed source=evidence_chain.structural method=status_count proof_boundary=traceability_structure field_path=evidence_chain.structural counted_status=not_measured
- measurement_status_count: 0/8 observed source=evidence_chain.structural method=status_count proof_boundary=traceability_structure field_path=evidence_chain.structural counted_status=unknown
- measurement_status_count: 0/8 observed source=evidence_chain.structural method=status_count proof_boundary=traceability_structure field_path=evidence_chain.structural counted_status=not_applicable
- proof_boundary_partition_count: 1/4 observed source=quality.proof_boundary_partition method=membership_count proof_boundary=traceability_structure partition=traceability_structure
- proof_boundary_partition_count: 1/4 observed source=quality.proof_boundary_partition method=membership_count proof_boundary=traceability_structure partition=pseudo_code_structure
- proof_boundary_partition_count: 1/4 observed source=quality.proof_boundary_partition method=membership_count proof_boundary=traceability_structure partition=semantic_fidelity
- proof_boundary_partition_count: 0/4 observed source=quality.proof_boundary_partition method=membership_count proof_boundary=traceability_structure partition=executable_behavior
- proof_boundary_partition_count: 1/4 observed source=quality.proof_boundary_partition method=membership_count proof_boundary=traceability_structure partition=human_decision

#### Proof-boundary summary

- traceability_structure: 1/4 observed
- pseudo_code_structure: 1/4 observed
- semantic_fidelity: 1/4 observed
- executable_behavior: 0/4 observed
- human_decision: 1/4 observed

### evidence-chain-profile.v1|integrated

#### Statistics

- cohort_profile_count: 2/2 observed source=accepted_inputs method=count proof_boundary=traceability_structure
- unique_project_id_count: 2/2 observed source=identity.project_id method=distinct_count proof_boundary=traceability_structure
- measurement_status_count: 0/2 observed source=evidence_chain.graph method=status_count proof_boundary=traceability_structure field_path=evidence_chain.graph counted_status=observed
- measurement_status_count: 2/2 observed source=evidence_chain.graph method=status_count proof_boundary=traceability_structure field_path=evidence_chain.graph counted_status=not_measured
- measurement_status_count: 0/2 observed source=evidence_chain.graph method=status_count proof_boundary=traceability_structure field_path=evidence_chain.graph counted_status=unknown
- measurement_status_count: 0/2 observed source=evidence_chain.graph method=status_count proof_boundary=traceability_structure field_path=evidence_chain.graph counted_status=not_applicable
- measurement_status_count: 2/2 observed source=evidence_chain.vocab_resolution method=status_count proof_boundary=traceability_structure field_path=evidence_chain.vocab_resolution counted_status=observed
- measurement_status_count: 0/2 observed source=evidence_chain.vocab_resolution method=status_count proof_boundary=traceability_structure field_path=evidence_chain.vocab_resolution counted_status=not_measured
- measurement_status_count: 0/2 observed source=evidence_chain.vocab_resolution method=status_count proof_boundary=traceability_structure field_path=evidence_chain.vocab_resolution counted_status=unknown
- measurement_status_count: 0/2 observed source=evidence_chain.vocab_resolution method=status_count proof_boundary=traceability_structure field_path=evidence_chain.vocab_resolution counted_status=not_applicable
- measurement_status_count: 0/2 observed source=quality.command_results method=status_count proof_boundary=executable_behavior field_path=quality.command_results counted_status=observed
- measurement_status_count: 2/2 observed source=quality.command_results method=status_count proof_boundary=executable_behavior field_path=quality.command_results counted_status=not_measured
- measurement_status_count: 0/2 observed source=quality.command_results method=status_count proof_boundary=executable_behavior field_path=quality.command_results counted_status=unknown
- measurement_status_count: 0/2 observed source=quality.command_results method=status_count proof_boundary=executable_behavior field_path=quality.command_results counted_status=not_applicable
- measurement_status_count: 2/2 observed source=quality.freshness method=status_count proof_boundary=human_decision field_path=quality.freshness counted_status=observed
- measurement_status_count: 0/2 observed source=quality.freshness method=status_count proof_boundary=human_decision field_path=quality.freshness counted_status=not_measured
- measurement_status_count: 0/2 observed source=quality.freshness method=status_count proof_boundary=human_decision field_path=quality.freshness counted_status=unknown
- measurement_status_count: 0/2 observed source=quality.freshness method=status_count proof_boundary=human_decision field_path=quality.freshness counted_status=not_applicable
- measurement_status_count: 0/2 observed source=change_fidelity method=status_count proof_boundary=semantic_fidelity field_path=change_fidelity counted_status=observed
- measurement_status_count: 2/2 observed source=change_fidelity method=status_count proof_boundary=semantic_fidelity field_path=change_fidelity counted_status=not_measured
- measurement_status_count: 0/2 observed source=change_fidelity method=status_count proof_boundary=semantic_fidelity field_path=change_fidelity counted_status=unknown
- measurement_status_count: 0/2 observed source=change_fidelity method=status_count proof_boundary=semantic_fidelity field_path=change_fidelity counted_status=not_applicable
- measurement_status_count: 9/9 observed source=evidence_chain.structural method=status_count proof_boundary=traceability_structure field_path=evidence_chain.structural counted_status=observed
- measurement_status_count: 0/9 observed source=evidence_chain.structural method=status_count proof_boundary=traceability_structure field_path=evidence_chain.structural counted_status=not_measured
- measurement_status_count: 0/9 observed source=evidence_chain.structural method=status_count proof_boundary=traceability_structure field_path=evidence_chain.structural counted_status=unknown
- measurement_status_count: 0/9 observed source=evidence_chain.structural method=status_count proof_boundary=traceability_structure field_path=evidence_chain.structural counted_status=not_applicable
- proof_boundary_partition_count: 2/5 observed source=quality.proof_boundary_partition method=membership_count proof_boundary=traceability_structure partition=traceability_structure
- proof_boundary_partition_count: 1/5 observed source=quality.proof_boundary_partition method=membership_count proof_boundary=traceability_structure partition=pseudo_code_structure
- proof_boundary_partition_count: 0/5 observed source=quality.proof_boundary_partition method=membership_count proof_boundary=traceability_structure partition=semantic_fidelity
- proof_boundary_partition_count: 0/5 observed source=quality.proof_boundary_partition method=membership_count proof_boundary=traceability_structure partition=executable_behavior
- proof_boundary_partition_count: 2/5 observed source=quality.proof_boundary_partition method=membership_count proof_boundary=traceability_structure partition=human_decision

#### Proof-boundary summary

- traceability_structure: 2/5 observed
- pseudo_code_structure: 1/5 observed
- semantic_fidelity: 0/5 observed
- executable_behavior: 0/5 observed
- human_decision: 2/5 observed

## Excluded inputs

- none

## Validation errors

- none

## Residual risks

- Hand-built Path B example; MCP validators were not run
- profiles in cohort evidence-chain-profile.v1|integrated use incompatible denominators for evidence_chain.structural: 1, 3
- v1 count-only aggregation cannot detect semantic denominator-unit drift when two profiles reuse the same field path with different informal units.

## Provenance

- project_id=cfd5bf6ad98024eb commit=local-working-tree profile_depth=human_research artifact_ref=stdd-human_research.json profile_hash=5f5d337bd4c2f989
- project_id=cfd5bf6ad98024eb commit=local-working-tree profile_depth=integrated artifact_ref=stdd-integrated.json profile_hash=272af59747a1f947
- project_id=manual-example commit=unknown profile_depth=integrated artifact_ref=example-profile.json profile_hash=6cc83e8463bb242a
