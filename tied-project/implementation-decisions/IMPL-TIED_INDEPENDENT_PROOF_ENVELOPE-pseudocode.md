# [IMPL-TIED_INDEPENDENT_PROOF_ENVELOPE] [ARCH-TIED_INDEPENDENT_PROOF_ENVELOPE] [REQ-TIED_OPEN_ONTOLOGIES_WAVE3] — Metadata-only independent_proofs on envelope v1

Grammar-Version: v2

## independent proof patch

- [IMPL-TIED_INDEPENDENT_PROOF_ENVELOPE] [ARCH-TIED_INDEPENDENT_PROOF_ENVELOPE] [REQ-TIED_OPEN_ONTOLOGIES_WAVE3] Append or update independent_proofs[] without executing foreign verifiers.
procedure PATCH_INDEPENDENT_PROOFS:
  # [IMPL-TIED_INDEPENDENT_PROOF_ENVELOPE] [ARCH-TIED_INDEPENDENT_PROOF_ENVELOPE] [REQ-TIED_OPEN_ONTOLOGIES_WAVE3] How: validate records, merge by proof_id, preserve envelope backward compatibility
  Contract:
    INPUT: envelope document, proof records[]
    PRE: envelope schema_version request-evidence-envelope.v1
    OUTPUT: updated envelope with independent_proofs[]
    POST: no automatic promotion of review_status to verified_offline
    EFFECTS: pure validation and merge
  VALIDATE each proof record schema
  MERGE into envelope.independent_proofs by proof_id
  RETURN envelope
