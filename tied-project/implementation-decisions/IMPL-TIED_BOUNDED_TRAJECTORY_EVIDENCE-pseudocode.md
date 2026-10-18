# [IMPL-TIED_BOUNDED_TRAJECTORY_EVIDENCE] [ARCH-TIED_BOUNDED_COMPOSITION] [REQ-TIED_BOUNDED_COMPOSITION]
# Captures compact trajectory manifests with local raw artifacts under operator-local working roots.

Grammar-Version: v2

## Trajectory manifest capture

- [IMPL-TIED_BOUNDED_TRAJECTORY_EVIDENCE] [ARCH-TIED_BOUNDED_COMPOSITION] [REQ-TIED_BOUNDED_COMPOSITION] Manifest writer plus local trajectories/ placement; committed envelope receives compact artifacts only.
- Contract:
  - INPUT: request_token, normalized pilot budget, run identity, harness or adapter identity, candidate metadata, optional redaction policy
  - PRE: TIED base path matches intended project; request_token valid; pilot budget passed VALIDATE_PILOT_BUDGET
  - OUTPUT: trajectory manifest artifact reference | error WrongBasePath | error PrivacyRedactionFailure
  - POST:
    - on success: raw high-volume payload under tied-bundle/working/{REQ-TOKEN}/trajectories/; manifest records hashes, provenance refs, proof boundaries; no unrestricted prompt or output bodies in committed envelope artifact
    - on error WrongBasePath: no writes under wrong project root
  - FAILURE_MODES: WrongBasePath, PrivacyRedactionFailure, MissingProvenance
  - DATA: local trajectory files, compact manifest record
  - DATA_TRANSITION: append manifest and local artifacts; never promote raw bodies into committed envelope
  - EFFECTS: IO, State
  - TERMINATION: total

procedure CAPTURE_TRAJECTORY_MANIFEST(context, run_outcome):
  # [IMPL-TIED_BOUNDED_TRAJECTORY_EVIDENCE] [ARCH-TIED_BOUNDED_COMPOSITION] [REQ-TIED_BOUNDED_COMPOSITION] How: place local raw evidence and emit compact manifest for downstream analysis.
  Contract:
    INPUT: bounded capture context, run outcome summary (exit, hashes, truncated summaries)
    OUTPUT: manifest artifact descriptor | error WrongBasePath | error PrivacyRedactionFailure | error MissingProvenance
    PRE: working-root classification includes trajectories/; privacy tier defaults operator_local
    POST: manifest links budget id, run id, adapter id, candidate hashes, and proof_boundary raw_trajectories_operator_local
    FAILURE_MODES: WrongBasePath, PrivacyRedactionFailure, MissingProvenance
    EFFECTS: IO, State
    TERMINATION: total
  IF tied base path != intended project tied-project: RETURN error WrongBasePath
  redact secret-bearing fields per policy
  IF redaction fails: RETURN error PrivacyRedactionFailure
  IF required provenance ref missing: RETURN error MissingProvenance
  write raw artifacts under local trajectories path for request_token
  write compact manifest under committed working root when review requires promotion
  RETURN manifest artifact descriptor
