# [IMPL-EVIDENCE_CHAIN_PROFILE] [ARCH-EVIDENCE_CHAIN_PROFILE] [REQ-EVIDENCE_CHAIN_PROFILE] — Read-only evidence-chain-profile.v1 generator, normalizer, and manual contract.

## GENERATE_EVIDENCE_CHAIN_PROFILE

- [IMPL-EVIDENCE_CHAIN_PROFILE] [ARCH-EVIDENCE_CHAIN_PROFILE] [REQ-EVIDENCE_CHAIN_PROFILE] Compose depth-gated adapters into one read-only profile without first-slice side effects.
- Contract:
  - INPUT: generate args including profile_depth, project_root, tied_base_path, optional scope, change_context, output_path, adapters
  - PRE: profile_depth is integrated or human_research; TIED base path confirmation is attempted before collection
  - OUTPUT: { ok: true, profile, source_references } | { ok: false, stage, error }
  - POST:
    - success => normalized evidence-chain-profile.v1 with no maturity field and no project YAML mutation
    - error WrongTiedBasePath => no collection adapters run after fail-closed check
  - FAILURE_MODES: WrongTiedBasePath, InvalidScope, ValidatorFailure, MalformedProfile, ForbiddenOutputPath
  - DATA: caller-selected profile file or in-memory JSON only
  - DATA_TRANSITION: none on project REQ/ARCH/IMPL; optional write of the profile file
  - EFFECTS: IO
  - TERMINATION: total
- PROCEDURE: GENERATE_EVIDENCE_CHAIN_PROFILE
  - 1. CALL RESOLVE_EVIDENCE_CHAIN_SCOPE
  - 2. CALL PROJECT_MANIFEST / resolveProjectManifest and fail closed on WrongTiedBasePath
  - 3. CALL COLLECT_STRUCTURAL_CHAIN
  - 4. IF profile_depth is human_research THEN CALL COLLECT_HUMAN_RESEARCH_CHAIN
  - 5. CALL ATTACH_QUALITY_PARTITION
  - 6. CALL NORMALIZE_EVIDENCE_CHAIN_PROFILE
  - 7. IF output_mode is file THEN write only a non-intent path
- ON adapter or profile-file write failure: RETURN { ok: false, stage, error } without emitting a partial profile.
- ON WrongTiedBasePath: RETURN { ok: false, stage: "manifest", error: "WrongTiedBasePath" }
- How (sub-block, same token set as above): Never call RUN_FIRST_SLICE, RUN_FIDELITY_RESEARCH_PILOT, appendCandidateFinding, or promoteConfirmedCase.

## RESOLVE_EVIDENCE_CHAIN_SCOPE

- [IMPL-EVIDENCE_CHAIN_PROFILE] [ARCH-EVIDENCE_CHAIN_PROFILE] [REQ-EVIDENCE_CHAIN_PROFILE] Bound roots, ignore, token scope, and profile_depth with explicit excluded, unknown, and not_measured sets.
- Contract:
  - INPUT: roots, ignore_file, config_path, requirement_tokens, architecture_tokens, implementation_tokens, profile_depth
  - PRE: profile_depth is one of the two v1 evidence-chain profile depths
  - OUTPUT: resolved scope with excluded, unknown, not_measured
  - POST:
    - success => every omitted dimension is named as excluded, unknown, or not_measured
    - error InvalidScope => generation stops before collection
  - FAILURE_MODES: InvalidScope
  - EFFECTS: pure
  - TERMINATION: total
- PROCEDURE: RESOLVE_EVIDENCE_CHAIN_SCOPE
  - 1. Reject unknown profile_depth
  - 2. Record roots_used and ignore_source
  - 3. Record requirement, architecture, and implementation populations from the explicit token scope
  - 4. Leave file counts empty and mark them unknown when no file inventory adapter is in scope
  - 5. Mark automated vocabulary drift checks not_measured when no drift tool is in scope

## COLLECT_STRUCTURAL_CHAIN

- [IMPL-EVIDENCE_CHAIN_PROFILE] [ARCH-EVIDENCE_CHAIN_PROFILE] [REQ-EVIDENCE_CHAIN_PROFILE] Compose structural adapters for traceability and pseudo-code structure only.
- Contract:
  - INPUT: resolved scope, resolveManifest result, runStructuralAnalysis adapter
  - PRE: TIED base path already confirmed
  - OUTPUT: structural evidence rows with proof_boundary traceability_structure or pseudo_code_structure
  - POST: success => fidelity, binding, and specification adapters were not invoked
  - FAILURE_MODES: ValidatorFailure
  - EFFECTS: IO
  - TERMINATION: total
- PROCEDURE: COLLECT_STRUCTURAL_CHAIN
  - 1. CALL runStructuralAnalysis with consistency, pseudo-code, cycles, binding inventory, and test adequacy validators
  - 2. Partition rows by proof_boundary without claiming executable_behavior
  - 3. Mark all structural rows not_measured when validators were omitted by the caller
  - 4. Compute graph nodes, edges, and cycles from the selected TIED dependency graphs

## COLLECT_HUMAN_RESEARCH_CHAIN

- [IMPL-EVIDENCE_CHAIN_PROFILE] [ARCH-EVIDENCE_CHAIN_PROFILE] [REQ-EVIDENCE_CHAIN_PROFILE] Invoke fidelity and binding adapters only at human_research depth; never append findings.
- Contract:
  - INPUT: profile_depth, optional change_context, fidelity and binding adapter inputs
  - PRE: profile_depth is human_research
  - OUTPUT: semantic_fidelity rows plus change_fidelity status
  - POST:
    - success without change_context => change_fidelity is not_measured and not_applicable; generation still ok
    - success with change_context => ANALYZE_SPECIFICATION_STATE may be referenced; no ledger write
  - FAILURE_MODES: ValidatorFailure
  - EFFECTS: IO
  - TERMINATION: total
- PROCEDURE: COLLECT_HUMAN_RESEARCH_CHAIN
  - 1. CALL AUDIT_IMPL_FIDELITY
  - 2. CALL ANALYZE_BINDING_EVIDENCE
  - 3. IF change_context is present THEN CALL ANALYZE_SPECIFICATION_STATE for references only
  - 4. ELSE set change_fidelity to not_measured / not_applicable
  - 5. Preserve fidelity and composition adapter results in semantic_fidelity and composition evidence fields
- How (sub-block, same token set as above): Do not append fidelity findings or promote confirmed cases.

## ATTACH_QUALITY_PARTITION

- [IMPL-EVIDENCE_CHAIN_PROFILE] [ARCH-EVIDENCE_CHAIN_PROFILE] [REQ-EVIDENCE_CHAIN_PROFILE] Embed or link quality evidence without inventing executable results.
- Contract:
  - INPUT: optional quality_plan, quality_manifest, or manifest_reference
  - PRE: none required; missing quality is allowed
  - OUTPUT: quality section with proof-boundary partition
  - POST: success => absent executable results are not_measured, never silent zeros
  - FAILURE_MODES: MalformedProfile
  - EFFECTS: pure
  - TERMINATION: total
- PROCEDURE: ATTACH_QUALITY_PARTITION
  - 1. IF a verification-evidence-manifest.v1 is supplied THEN embed or reference it
  - 2. ELSE mark command results not_measured
  - 3. Never invent exit codes or pass/fail from TIED consistency alone

## NORMALIZE_EVIDENCE_CHAIN_PROFILE

- [IMPL-EVIDENCE_CHAIN_PROFILE] [ARCH-EVIDENCE_CHAIN_PROFILE] [REQ-EVIDENCE_CHAIN_PROFILE] Deterministically sort, require denominators, preserve proof boundaries, and reject maturity fields.
- Contract:
  - INPUT: draft profile object
  - PRE: draft is an object
  - OUTPUT: evidence-chain-profile.v1 | error MalformedProfile
  - POST:
    - success => stable order, every ratio has denominator, no maturity or score keys
    - error MalformedProfile => no profile emitted
  - FAILURE_MODES: MalformedProfile
  - EFFECTS: pure
  - TERMINATION: total
- PROCEDURE: NORMALIZE_EVIDENCE_CHAIN_PROFILE
  - 1. Reject missing schema_version or any maturity/score field
  - 2. Require source, method, denominator, and proof_boundary on derived fields
  - 3. Preserve not_measured, unknown, and not_applicable
  - 4. Stable-sort arrays and object keys used for comparison

## EMIT_MANUAL_PROFILE_CONTRACT

- [IMPL-EVIDENCE_CHAIN_PROFILE] [ARCH-EVIDENCE_CHAIN_PROFILE] [REQ-EVIDENCE_CHAIN_PROFILE] Validate Path B generator manual profiles without claiming unrun MCP validators.
- Contract:
  - INPUT: draft profile with generator manual
  - PRE: generator equals manual
  - OUTPUT: normalized profile | error MalformedProfile
  - POST:
    - success => assumptions, confidence, and unsupported_checks are present
    - error MalformedProfile => missing Path B fields or claimed unrun MCP results
  - FAILURE_MODES: MalformedProfile
  - EFFECTS: pure
  - TERMINATION: total
- PROCEDURE: EMIT_MANUAL_PROFILE_CONTRACT
  - 1. Require assumptions array, confidence, and unsupported_checks array
  - 2. Reject claims of MCP validator results that are not listed as run

## EVIDENCE_CHAIN_PROFILE_MCP_HANDLER

- [IMPL-EVIDENCE_CHAIN_PROFILE] [ARCH-EVIDENCE_CHAIN_PROFILE] [REQ-EVIDENCE_CHAIN_PROFILE] MCP tool handler for evidence_chain_profile_generate with optional attach-provenance wiring.
- Contract:
  - INPUT: profile_depth, project_root, tied_base_path, optional scope, change_context, output_path, manifest_reference, invoke_structural_validators (default false)
  - PRE: TIED base path confirmed via getBasePath; invoke_structural_validators does not imply quality manifest collection
  - OUTPUT: { ok: true, profile, source_references } | { ok: false, stage, error }
  - POST:
    - success with manifest_reference => quality.command_results observed when manifest resolves
    - success with invoke_structural_validators true => structural_validators !== undefined; structural rows observed with proof boundaries preserved
    - success without wiring => structural and executable rows remain not_measured (backward compatible)
    - error WrongTiedBasePath => no live validator collection runs
  - FAILURE_MODES: WrongTiedBasePath, InvalidScope, ValidatorFailure, MalformedProfile, ForbiddenOutputPath
  - EFFECTS: IO; may invoke validateConsistency, runScopedAnalysis, validateEssencePseudocode, validateBindingInventory, validateTestAdequacyPlan when invoke_structural_validators is true
  - TERMINATION: total
- PROCEDURE: EVIDENCE_CHAIN_PROFILE_MCP_HANDLER
  - 1. Resolve project_root and tied_base_path from args or getBasePath
  - 2. IF invoke_structural_validators THEN CALL createLiveStructuralValidators(scope) and pass structural_validators to GENERATE_EVIDENCE_CHAIN_PROFILE
  - 3. ELSE omit structural_validators so COLLECT_STRUCTURAL_CHAIN marks structural rows not_measured
  - 4. Pass manifest_reference through to ATTACH_QUALITY_PARTITION unchanged
  - 5. RETURN GENERATE_EVIDENCE_CHAIN_PROFILE result as JSON text content
- How (sub-block, same token set as above): Live structural collection is opt-in; proof boundaries on each validator row remain traceability_structure or pseudo_code_structure only.

## SUB_EVIDENCE_CHAIN_PROFILE

- [IMPL-EVIDENCE_CHAIN_PROFILE] [ARCH-EVIDENCE_CHAIN_PROFILE] [REQ-EVIDENCE_CHAIN_PROFILE] [PROC-EVIDENCE_CHAIN] Checklist collection points for generating and referencing a profile without storing it as intent.
- Contract:
  - INPUT: request token, profile_depth, optional change_context, output path under working/
  - PRE: TIED base path confirmed for the client under change
  - OUTPUT: profile path or fail-closed error
  - POST: success => CITDP may store evidence.profile_reference; project YAML unchanged
  - FAILURE_MODES: WrongTiedBasePath, InvalidScope, MalformedProfile
  - DATA: working/evidence-chain/{run_id}.json
  - DATA_TRANSITION: create or overwrite only the caller-selected profile file
  - EFFECTS: IO
  - TERMINATION: total
- PROCEDURE: SUB_EVIDENCE_CHAIN_PROFILE
  - 1. Declare scope, roots, denominators, and profile_depth
  - 2. CALL GENERATE_EVIDENCE_CHAIN_PROFILE
  - 3. Record profile_reference; do not copy generated evidence into REQ/ARCH/IMPL intent
