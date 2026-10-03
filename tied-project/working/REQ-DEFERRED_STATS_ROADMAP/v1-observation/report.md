# Evidence chain statistics report

generated_at: 2026-08-23T06:29:12.382Z
mode: strict
include_absolute_paths: false
generator_version: 1.0.0
schema_version: evidence-chain-statistics-report.v1

## Counts

- inputs: 2
- cohorts: 1
- excluded_input_count: 0/2 observed source=report_input_manifest method=count proof_boundary=traceability_structure
- validation_error_count: 0/2 observed source=VALIDATE_PROFILE_ARTIFACT method=count proof_boundary=traceability_structure

## Cohorts

### evidence-chain-profile.v1|integrated

#### Statistics

- cohort_profile_count: 2/2 observed source=accepted_inputs method=count proof_boundary=traceability_structure
- unique_project_id_count: 1/2 observed source=identity.project_id method=distinct_count proof_boundary=traceability_structure
- measurement_status_count: 2/2 observed source=evidence_chain.graph method=status_count proof_boundary=traceability_structure field_path=evidence_chain.graph counted_status=observed
- measurement_status_count: 0/2 observed source=evidence_chain.graph method=status_count proof_boundary=traceability_structure field_path=evidence_chain.graph counted_status=not_measured
- measurement_status_count: 0/2 observed source=evidence_chain.graph method=status_count proof_boundary=traceability_structure field_path=evidence_chain.graph counted_status=unknown
- measurement_status_count: 0/2 observed source=evidence_chain.graph method=status_count proof_boundary=traceability_structure field_path=evidence_chain.graph counted_status=not_applicable
- measurement_status_count: 0/2 observed source=evidence_chain.vocab_resolution method=status_count proof_boundary=traceability_structure field_path=evidence_chain.vocab_resolution counted_status=observed
- measurement_status_count: 2/2 observed source=evidence_chain.vocab_resolution method=status_count proof_boundary=traceability_structure field_path=evidence_chain.vocab_resolution counted_status=not_measured
- measurement_status_count: 0/2 observed source=evidence_chain.vocab_resolution method=status_count proof_boundary=traceability_structure field_path=evidence_chain.vocab_resolution counted_status=unknown
- measurement_status_count: 0/2 observed source=evidence_chain.vocab_resolution method=status_count proof_boundary=traceability_structure field_path=evidence_chain.vocab_resolution counted_status=not_applicable
- measurement_status_count: 1/2 observed source=quality.command_results method=status_count proof_boundary=executable_behavior field_path=quality.command_results counted_status=observed
- measurement_status_count: 1/2 observed source=quality.command_results method=status_count proof_boundary=executable_behavior field_path=quality.command_results counted_status=not_measured
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
- measurement_status_count: 7/13 observed source=evidence_chain.structural method=status_count proof_boundary=traceability_structure field_path=evidence_chain.structural counted_status=observed
- measurement_status_count: 6/13 observed source=evidence_chain.structural method=status_count proof_boundary=traceability_structure field_path=evidence_chain.structural counted_status=not_measured
- measurement_status_count: 0/13 observed source=evidence_chain.structural method=status_count proof_boundary=traceability_structure field_path=evidence_chain.structural counted_status=unknown
- measurement_status_count: 0/13 observed source=evidence_chain.structural method=status_count proof_boundary=traceability_structure field_path=evidence_chain.structural counted_status=not_applicable
- proof_boundary_partition_count: 2/7 observed source=quality.proof_boundary_partition method=membership_count proof_boundary=traceability_structure partition=traceability_structure
- proof_boundary_partition_count: 2/7 observed source=quality.proof_boundary_partition method=membership_count proof_boundary=traceability_structure partition=pseudo_code_structure
- proof_boundary_partition_count: 0/7 observed source=quality.proof_boundary_partition method=membership_count proof_boundary=traceability_structure partition=semantic_fidelity
- proof_boundary_partition_count: 1/7 observed source=quality.proof_boundary_partition method=membership_count proof_boundary=traceability_structure partition=executable_behavior
- proof_boundary_partition_count: 2/7 observed source=quality.proof_boundary_partition method=membership_count proof_boundary=traceability_structure partition=human_decision

#### Proof-boundary summary

- traceability_structure: 2/7 observed
- pseudo_code_structure: 2/7 observed
- semantic_fidelity: 0/7 observed
- executable_behavior: 1/7 observed
- human_decision: 2/7 observed

## Excluded inputs

- none

## Validation errors

- none

## Residual risks

- profiles in cohort evidence-chain-profile.v1|integrated use incompatible denominators for evidence_chain.graph: 1, 2
- profiles in cohort evidence-chain-profile.v1|integrated use incompatible denominators for evidence_chain.structural: 1, 2
- profiles in cohort evidence-chain-profile.v1|integrated use incompatible denominators for quality.command_results: 1, not_measured
- v1 count-only aggregation cannot detect semantic denominator-unit drift when two profiles reuse the same field path with different informal units.

## Provenance

- project_id=33f7e345569cd47b commit=c8a9b79 profile_depth=integrated artifact_ref=profile-integrated-reprofile.v1.json profile_hash=1874f07107dff5cf
- project_id=33f7e345569cd47b commit=unknown profile_depth=integrated artifact_ref=profile-integrated.v1.json profile_hash=57e5f72548c88117
