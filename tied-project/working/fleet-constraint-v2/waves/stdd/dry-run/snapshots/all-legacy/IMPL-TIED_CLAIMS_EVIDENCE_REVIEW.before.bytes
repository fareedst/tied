# [IMPL-TIED_CLAIMS_EVIDENCE_REVIEW] [ARCH-TIED_CLAIMS_EVIDENCE_REVIEW] [REQ-TIED_CLAIMS_EVIDENCE_REVIEW] — Read-only frozen claim surface evaluation, static evidence collection, disposition classification, append-only artifacts, and human-gated promotion.

## GENERATE_CLAIM_SURFACE_FROM_TIED

- [IMPL-TIED_CLAIMS_EVIDENCE_REVIEW] [ARCH-TIED_CLAIMS_EVIDENCE_REVIEW] [REQ-TIED_CLAIMS_EVIDENCE_REVIEW] Emit claim-surface.v1 and companion stubs from TIED indexes and detail files without mutating audited project YAML.
- Contract:
  - INPUT: project_root, tied_base_path, optional request_token (default REQ-TIED_CLAIMS_EVIDENCE_REVIEW), optional impl_token, optional block_id, optional source_revision, optional output_dir
  - PRE: project_root and tied_base_path exist; request detail file resolves
  - OUTPUT: { claim_surface, evidence_stubs, provenance } | abort with missing-input error
  - POST:
    - success => claims are assertions derived from REQ satisfaction criteria, ARCH rationale, and IMPL summaries; claims are not REQs
    - success => slice-boundary regression claims include requiresRuntimeProof and unsettled-regression materiality hints
  - FAILURE_MODES: MissingProjectRoot, MissingTiedBase, MissingRequestDetail
  - DATA: read-only TIED detail files
  - DATA_TRANSITION: none on audited project YAML; optional write of generator artifacts under output_dir
  - EFFECTS: IO
  - TERMINATION: total
- PROCEDURE: GENERATE_CLAIM_SURFACE_FROM_TIED
  - 1. Resolve request_token to default when omitted (Option C)
  - 2. Load linked REQ, ARCH, and IMPL detail files for the scoped stack
  - 3. Map each satisfaction criterion, architecture rationale, and implementation description to a claim record with stable id hash
  - 4. When IMPL pseudo-code sidecar exists, append a claim that the sidecar is present
  - 5. Append slice-boundary claims for runtime-only and unsettled-regression acceptance
  - 6. Sort and deduplicate claim ids; compute surface revision hash
  - 7. CALL EMIT_EVIDENCE_STUBS
  - 8. Write claim-surface.v1.json, evidence-stubs.json, generator-provenance.json, and expected-dispositions.yaml when output_dir is set
- How (sub-block, same token set as above): Generator never writes audited tied/requirements, tied/architecture-decisions, or tied/implementation-decisions paths.

## EMIT_EVIDENCE_STUBS

- [IMPL-TIED_CLAIMS_EVIDENCE_REVIEW] [ARCH-TIED_CLAIMS_EVIDENCE_REVIEW] [REQ-TIED_CLAIMS_EVIDENCE_REVIEW] Attach bounded static evidence references and proof boundaries to each claim on the frozen surface.
- Contract:
  - INPUT: claim_surface claims[], project_root context
  - PRE: claim_surface schemaVersion is claim-surface.v1
  - OUTPUT: evidence stub rows keyed by claimId
  - POST:
    - success => every stub names proofBoundary static_analysis or out_of_scope_static_slice
    - success => runtime-proof claims receive out_of_scope_static_slice without readable paths
  - FAILURE_MODES: none fatal; missing detail paths yield unsettled-oriented stubs
  - EFFECTS: pure
  - TERMINATION: total
- PROCEDURE: EMIT_EVIDENCE_STUBS
  - 1. For each claim, default proofBoundary to static_analysis
  - 2. IF claim.requiresRuntimeProof THEN set proofBoundary out_of_scope_static_slice and omit path
  - 3. ELSE IF claim is unsettled-regression sample THEN point path at nonexistent regression file
  - 4. ELSE map source token to tied detail file path and optional pseudoCodeRef for IMPL tokens
  - 5. RETURN stub array aligned to claim ids

## FREEZE_CLAIM_SURFACE

- [IMPL-TIED_CLAIMS_EVIDENCE_REVIEW] [ARCH-TIED_CLAIMS_EVIDENCE_REVIEW] [REQ-TIED_CLAIMS_EVIDENCE_REVIEW] Accept only caller-selected frozen JSON within the declared input boundary and compute a content hash.
- Contract:
  - INPUT: claim_surface_path, input_boundary_root
  - PRE: resolved claim_surface_path is inside input_boundary_root
  - OUTPUT: { ok: true, frozen: { surface, contentHash, frozenPath } } | { ok: false, error }
  - POST:
    - success => surface claims are normalized, sorted, and deduplicated by id
    - error PathOutsideBoundary => no file read occurs outside boundary
  - FAILURE_MODES: PathOutsideBoundary, InvalidSchema, DuplicateClaimId, OversizedInput
  - EFFECTS: IO
  - TERMINATION: total
- PROCEDURE: FREEZE_CLAIM_SURFACE
  - 1. Reject resolved paths outside input_boundary_root
  - 2. Parse JSON and validate schemaVersion claim-surface.v1
  - 3. Validate each claim id, text, source, scope, and size limits
  - 4. Sort claims by id and reject duplicate ids
  - 5. Compute sha256 content hash over canonical JSON
  - 6. RETURN frozen surface bundle

## COLLECT_CLAIM_EVIDENCE

- [IMPL-TIED_CLAIMS_EVIDENCE_REVIEW] [ARCH-TIED_CLAIMS_EVIDENCE_REVIEW] [REQ-TIED_CLAIMS_EVIDENCE_REVIEW] Perform bounded static file reads with provenance and reject path traversal.
- Contract:
  - INPUT: evidence stub, project_root
  - PRE: execution_policy is static_only for slice 1 orchestration
  - OUTPUT: CollectedEvidence row | { kind: PathTraversalRejected }
  - POST:
    - success => resolved path stays within project_root
    - success => found rows include contentHash when file exists
  - FAILURE_MODES: PathTraversalRejected
  - EFFECTS: IO
  - TERMINATION: total
- PROCEDURE: COLLECT_CLAIM_EVIDENCE
  - 1. IF stub has no path THEN RETURN found false with declared proofBoundary
  - 2. Resolve path relative to project_root
  - 3. IF resolved path escapes project_root THEN RETURN PathTraversalRejected
  - 4. IF file missing THEN RETURN found false
  - 5. ELSE hash file contents and RETURN found true with path and optional validator command
- PROCEDURE: COLLECT_ALL_CLAIM_EVIDENCE
  - 1. FOR each stub CALL COLLECT_CLAIM_EVIDENCE
  - 2. ON PathTraversalRejected abort entire collection
  - 3. RETURN evidence list keyed by claimId

## CLASSIFY_CLAIM_STATUS

- [IMPL-TIED_CLAIMS_EVIDENCE_REVIEW] [ARCH-TIED_CLAIMS_EVIDENCE_REVIEW] [REQ-TIED_CLAIMS_EVIDENCE_REVIEW] Classify shown, unsettled, or not_examined with demonstrated_gap and unresolved_exposure dimensions and explicit proof boundaries.
- Contract:
  - INPUT: claim record, optional collected evidence, execution_policy
  - PRE: execution_policy is static_only
  - OUTPUT: claim review row with disposition, reason, proofBoundary, demonstratedGap, unresolvedExposure, evidenceRefs
  - POST:
    - success => missing evidence does not imply defect; disposition is not_examined or unsettled with stated reason
    - success => runtime-proof claims are not_examined with out_of_scope_static_slice
  - FAILURE_MODES: AmbiguousDisposition when execution_policy is unsupported
  - EFFECTS: pure
  - TERMINATION: total
- PROCEDURE: CLASSIFY_CLAIM_STATUS
  - 1. IF claim.requiresRuntimeProof THEN disposition not_examined; unresolvedExposure true; proofBoundary out_of_scope_static_slice
  - 2. ELSE IF no evidence stub THEN disposition not_examined
  - 3. ELSE IF evidence proofBoundary is out_of_scope_static_slice THEN disposition not_examined; unresolvedExposure true
  - 4. ELSE IF evidence found with contentHash THEN disposition shown; attach evidenceRefs
  - 5. ELSE IF evidence found without hash THEN disposition unsettled; demonstratedGap and unresolvedExposure true
  - 6. ELSE disposition unsettled; unresolvedExposure true
  - 7. RETURN review row

## RECORD_PROOF_BOUNDARY

- [IMPL-TIED_CLAIMS_EVIDENCE_REVIEW] [ARCH-TIED_CLAIMS_EVIDENCE_REVIEW] [REQ-TIED_CLAIMS_EVIDENCE_REVIEW] Require proofBoundary on every evidence row and disposition; state what the static slice does not prove.
- Contract:
  - INPUT: disposition row or collected evidence row
  - PRE: slice execution_policy is static_only
  - OUTPUT: row with proofBoundary populated
  - POST: success => no row omits proofBoundary; runtime claims never claim executable_behavior proof
  - EFFECTS: pure
  - TERMINATION: total
- How (sub-block, same token set as above): Implemented inside CLASSIFY_CLAIM_STATUS and COLLECT_CLAIM_EVIDENCE; orchestrator copies boundaries into report and provenance without widening scope.

## APPEND_CLAIM_REVIEW_LEDGER

- [IMPL-TIED_CLAIMS_EVIDENCE_REVIEW] [ARCH-TIED_CLAIMS_EVIDENCE_REVIEW] [REQ-TIED_CLAIMS_EVIDENCE_REVIEW] Append disposition rows and auxiliary records without overwriting prior ledger entries.
- Contract:
  - INPUT: ledger, claim review row | unsettled question | independent check | outside observation
  - PRE: output directory is not under audited tied intent paths
  - OUTPUT: append result or duplicate link for repeated claimId
  - POST:
    - success => duplicate claimId returns link metadata without overwrite
    - success => outside observations and unsettled questions remain separate from claim disposition rows
  - DATA: append-only claim-review-ledger.v1.jsonl and companion jsonl files
  - DATA_TRANSITION: append rows only
  - EFFECTS: State
  - TERMINATION: total
- PROCEDURE: APPEND_CLAIM_REVIEW_ROW
  - 1. IF claimId already present THEN RETURN duplicate metadata
  - 2. ELSE push immutable copy of row
- PROCEDURE: APPEND_OUTSIDE_OBSERVATION
  - 1. Append observation row that does not mutate claim disposition
- PROCEDURE: APPEND_UNSETTLED_QUESTION
  - 1. Append sponsor or operator follow-up question linked to optional claimId
- PROCEDURE: APPEND_INDEPENDENT_CHECK
  - 1. Append reviewer disagreement or agreement without mutating prior ledger rows

## RUN_CLAIMS_EVIDENCE_REVIEW

- [IMPL-TIED_CLAIMS_EVIDENCE_REVIEW] [ARCH-TIED_CLAIMS_EVIDENCE_REVIEW] [REQ-TIED_CLAIMS_EVIDENCE_REVIEW] Orchestrate freeze, collect, classify, ledger append, and provenance emission under working scope only.
- Contract:
  - INPUT: projectRoot, claimSurfacePath, inputBoundaryRoot, outputDir, evidenceStubs, executionPolicy, requestToken, runId, optional includePilotSamples
  - PRE: outputDir is not an audited intent write target
  - OUTPUT: { ok: true, report, provenance, outputPaths } | { ok: false, error }
  - POST:
    - success => artifacts written only under outputDir
    - error AuditedProjectWriteRejected => no profile artifacts emitted
  - FAILURE_MODES: AuditedProjectWriteRejected, PathOutsideBoundary, InvalidSchema, DuplicateClaimId, OversizedInput, PathTraversalRejected
  - DATA_TRANSITION: write ledger, report, provenance, unsettled, independent, and outside observation files
  - EFFECTS: IO, State
  - TERMINATION: total
- PROCEDURE: RUN_CLAIMS_EVIDENCE_REVIEW
  - 1. Reject outputDir under audited tied intent directories
  - 2. CALL FREEZE_CLAIM_SURFACE
  - 3. CALL COLLECT_ALL_CLAIM_EVIDENCE
  - 4. CALL CLASSIFY_CLAIM_STATUS for each frozen claim
  - 5. Append ledger rows and optional pilot sample unsettled questions, outside observation, and independent check
  - 6. Build claim-review-report.v1 summary and claim-review-provenance.v1 with artifact hashes
  - 7. Write json and jsonl artifacts under outputDir
  - 8. RETURN report and provenance paths

## RUN_CLAIMS_EVIDENCE_PILOT

- [IMPL-TIED_CLAIMS_EVIDENCE_REVIEW] [ARCH-TIED_CLAIMS_EVIDENCE_REVIEW] [REQ-TIED_CLAIMS_EVIDENCE_REVIEW] Run static_only pilot against tied-generated fixture layout with pilot acceptance samples enabled.
- Contract:
  - INPUT: projectRoot, fixtureRoot, outputDir, optional requestToken, optional runId
  - PRE: fixtureRoot contains claim-surface.v1.json and evidence-stubs.json
  - OUTPUT: RUN_CLAIMS_EVIDENCE_REVIEW result
  - POST: success => includePilotSamples true for acceptance rows
  - EFFECTS: IO
  - TERMINATION: total
- PROCEDURE: RUN_CLAIMS_EVIDENCE_PILOT
  - 1. Resolve default requestToken when omitted
  - 2. Load fixture claim surface and stubs
  - 3. CALL RUN_CLAIMS_EVIDENCE_REVIEW with inputBoundaryRoot equal fixtureRoot

## RUN_CLAIMS_EVIDENCE_REVIEW_MCP

- [IMPL-TIED_CLAIMS_EVIDENCE_REVIEW] [ARCH-TIED_CLAIMS_EVIDENCE_REVIEW] [REQ-TIED_CLAIMS_EVIDENCE_REVIEW] Primary slice-1 operator entry: MCP tool tied_claims_evidence_review_run delegates to pilot or explicit surface paths.
- Contract:
  - INPUT: tied_base_path, output_dir, optional request_token, optional claim_surface_path, optional fixture_root, execution_policy static_only
  - PRE: tied_base_path resolves; output_dir is outside audited intent paths
  - OUTPUT: MCP tool result with report, provenance, and output_paths
  - POST: success => same read-only boundary as RUN_CLAIMS_EVIDENCE_REVIEW
  - FAILURE_MODES: AuditedProjectWriteRejected, PathOutsideBoundary, PathTraversalRejected, InvalidSchema
  - EFFECTS: IO
  - TERMINATION: total
- PROCEDURE: RUN_CLAIMS_EVIDENCE_REVIEW_MCP
  - 1. Derive projectRoot from tied_base_path
  - 2. Default request_token and fixture paths when omitted
  - 3. CALL RUN_CLAIMS_EVIDENCE_REVIEW or RUN_CLAIMS_EVIDENCE_PILOT per caller args
  - 4. RETURN structured MCP payload

## PROMOTE_CONFIRMED_CASE

- [IMPL-TIED_CLAIMS_EVIDENCE_REVIEW] [IMPL-TIED_FIDELITY_RESEARCH] [ARCH-TIED_CLAIMS_EVIDENCE_REVIEW] [REQ-TIED_CLAIMS_EVIDENCE_REVIEW] [REQ-TIED_FIDELITY_RESEARCH] Delegate human-confirmed claim-review rows to fidelity case promotion without automatic REQ mutation.
- Contract:
  - INPUT: findingId, reviewers[], originLayer claim-review, divergentEdge claim-to-evidence
  - PRE: promotion is explicitly human-authorized; unsettled and not_examined rows do not auto-promote
  - OUTPUT: case report from promoteConfirmedCase | unchanged when not authorized
  - POST: success => audited project REQ, ARCH, IMPL remain unchanged
  - DATA_TRANSITION: append research case report only
  - EFFECTS: IO, State
  - TERMINATION: total
- PROCEDURE: PROMOTE_CONFIRMED_CASE
  - 1. CALL promoteConfirmedCase with claim-review origin metadata
  - 2. Do not invoke LEAP from unsettled or not_examined dispositions alone
  - 3. RETURN case report
