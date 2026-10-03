# Evidence chain statistics report

generated_at: 2026-08-28T02:42:53.742Z
mode: strict
include_absolute_paths: false
generator_version: 2.0.0
schema_version: evidence-chain-statistics-report.v2

## Counts

- inputs: 8
- cohorts: 1
- excluded_input_count: 0/8 observed source=report_input_manifest method=count proof_boundary=traceability_structure
- validation_error_count: 0/8 observed source=VALIDATE_PROFILE_ARTIFACT method=count proof_boundary=traceability_structure

## Cohorts

### evidence-chain-profile.v1|integrated

#### Sub-cohort 83a20f7f7574881f

##### Statistics

- denominator_subcohort_count: 1/1 observed source=PARTITION_SUBCOHORTS method=count proof_boundary=traceability_structure
- cohort_profile_count: 8/8 observed source=accepted_inputs method=count proof_boundary=traceability_structure
- unique_project_id_count: 8/8 observed source=identity.project_id method=distinct_count proof_boundary=traceability_structure
- measurement_status_count: 8/8 observed source=evidence_chain.graph method=status_count proof_boundary=traceability_structure field_path=evidence_chain.graph counted_status=observed
- measurement_status_count: 0/8 observed source=evidence_chain.graph method=status_count proof_boundary=traceability_structure field_path=evidence_chain.graph counted_status=not_measured
- measurement_status_count: 0/8 observed source=evidence_chain.graph method=status_count proof_boundary=traceability_structure field_path=evidence_chain.graph counted_status=unknown
- measurement_status_count: 0/8 observed source=evidence_chain.graph method=status_count proof_boundary=traceability_structure field_path=evidence_chain.graph counted_status=not_applicable
- measurement_status_count: 0/8 observed source=evidence_chain.vocab_resolution method=status_count proof_boundary=traceability_structure field_path=evidence_chain.vocab_resolution counted_status=observed
- measurement_status_count: 8/8 observed source=evidence_chain.vocab_resolution method=status_count proof_boundary=traceability_structure field_path=evidence_chain.vocab_resolution counted_status=not_measured
- measurement_status_count: 0/8 observed source=evidence_chain.vocab_resolution method=status_count proof_boundary=traceability_structure field_path=evidence_chain.vocab_resolution counted_status=unknown
- measurement_status_count: 0/8 observed source=evidence_chain.vocab_resolution method=status_count proof_boundary=traceability_structure field_path=evidence_chain.vocab_resolution counted_status=not_applicable
- measurement_status_count: 0/8 observed source=quality.command_results method=status_count proof_boundary=executable_behavior field_path=quality.command_results counted_status=observed
- measurement_status_count: 8/8 observed source=quality.command_results method=status_count proof_boundary=executable_behavior field_path=quality.command_results counted_status=not_measured
- measurement_status_count: 0/8 observed source=quality.command_results method=status_count proof_boundary=executable_behavior field_path=quality.command_results counted_status=unknown
- measurement_status_count: 0/8 observed source=quality.command_results method=status_count proof_boundary=executable_behavior field_path=quality.command_results counted_status=not_applicable
- measurement_status_count: 8/8 observed source=quality.freshness method=status_count proof_boundary=human_decision field_path=quality.freshness counted_status=observed
- measurement_status_count: 0/8 observed source=quality.freshness method=status_count proof_boundary=human_decision field_path=quality.freshness counted_status=not_measured
- measurement_status_count: 0/8 observed source=quality.freshness method=status_count proof_boundary=human_decision field_path=quality.freshness counted_status=unknown
- measurement_status_count: 0/8 observed source=quality.freshness method=status_count proof_boundary=human_decision field_path=quality.freshness counted_status=not_applicable
- measurement_status_count: 0/8 observed source=change_fidelity method=status_count proof_boundary=semantic_fidelity field_path=change_fidelity counted_status=observed
- measurement_status_count: 8/8 observed source=change_fidelity method=status_count proof_boundary=semantic_fidelity field_path=change_fidelity counted_status=not_measured
- measurement_status_count: 0/8 observed source=change_fidelity method=status_count proof_boundary=semantic_fidelity field_path=change_fidelity counted_status=unknown
- measurement_status_count: 0/8 observed source=change_fidelity method=status_count proof_boundary=semantic_fidelity field_path=change_fidelity counted_status=not_applicable
- measurement_status_count: 48/48 observed source=evidence_chain.structural method=status_count proof_boundary=traceability_structure field_path=evidence_chain.structural counted_status=observed
- measurement_status_count: 0/48 observed source=evidence_chain.structural method=status_count proof_boundary=traceability_structure field_path=evidence_chain.structural counted_status=not_measured
- measurement_status_count: 0/48 observed source=evidence_chain.structural method=status_count proof_boundary=traceability_structure field_path=evidence_chain.structural counted_status=unknown
- measurement_status_count: 0/48 observed source=evidence_chain.structural method=status_count proof_boundary=traceability_structure field_path=evidence_chain.structural counted_status=not_applicable
- proof_boundary_partition_count: 8/24 observed source=quality.proof_boundary_partition method=membership_count proof_boundary=traceability_structure partition=traceability_structure
- proof_boundary_partition_count: 8/24 observed source=quality.proof_boundary_partition method=membership_count proof_boundary=traceability_structure partition=pseudo_code_structure
- proof_boundary_partition_count: 0/24 observed source=quality.proof_boundary_partition method=membership_count proof_boundary=traceability_structure partition=semantic_fidelity
- proof_boundary_partition_count: 0/24 observed source=quality.proof_boundary_partition method=membership_count proof_boundary=traceability_structure partition=executable_behavior
- proof_boundary_partition_count: 8/24 observed source=quality.proof_boundary_partition method=membership_count proof_boundary=traceability_structure partition=human_decision

## Excluded inputs

- none

## Validation errors

- none

## Residual risks

- v2 sub-cohort partition isolates denominator fingerprint mismatches; count-only statistics remain within fingerprint boundaries.

## Provenance

- project_id=2256b85524ecaa2d commit=bc61056fe260bc3831efb5ce7772244339fd1cd6 profile_depth=integrated artifact_ref=panorama-post-alignment.v1.json profile_hash=8c1db215d491178c denominator_fingerprint=83a20f7f7574881f
- project_id=3af4cd62216c401b commit=1a79d55f14f6ee842621b1f8f0bff0e703dd0450 profile_depth=integrated artifact_ref=indescript-post-alignment.v1.json profile_hash=6ba4c86fa816c744 denominator_fingerprint=83a20f7f7574881f
- project_id=69cb84308c3d6924 commit=47f1530ceaebe1e384d3fccc95a879c3bb1b9657 profile_depth=integrated artifact_ref=treegrep.v1.json profile_hash=fd2ea4d8e1274841 denominator_fingerprint=83a20f7f7574881f
- project_id=7a5dba914f13e217 commit=1798c4424d4ef6ea29ce4b95caee51cc9f1fdc75 profile_depth=integrated artifact_ref=nsync-post-alignment.v1.json profile_hash=a9b5250b7d8e0fa4 denominator_fingerprint=83a20f7f7574881f
- project_id=80e219cd16ef8e3b commit=0995ddd8a5208ce5b2a8e838ff66da02a78b66e4 profile_depth=integrated artifact_ref=treegrep-post-alignment.v1.json profile_hash=fb3ba7dcb7fa1307 denominator_fingerprint=83a20f7f7574881f
- project_id=8cc4c7db8ac063e6 commit=07aeca0fb6326c6d9f30e217e95f6e7e735a94ed profile_depth=integrated artifact_ref=nsync.v1.json profile_hash=ff3b2fada492774a denominator_fingerprint=83a20f7f7574881f
- project_id=af185e7e62bb1bfb commit=76a3060026c81c4d1e42bcd26aba4a05b16fb246 profile_depth=integrated artifact_ref=indescript.v1.json profile_hash=f5199c1a84edd31f denominator_fingerprint=83a20f7f7574881f
- project_id=d5dba3d9186254ca commit=595d323e24e56642d83ed631124a0e14e70ace56 profile_depth=integrated artifact_ref=panorama.v1.json profile_hash=d9b4167046688b84 denominator_fingerprint=83a20f7f7574881f
