# [IMPL-TIED_PROCESS_CERTIFICATION_SPEC] [ARCH-TIED_PROCESS_CERTIFICATION_READINESS] [REQ-TIED_PROCESS_CERTIFICATION_READINESS] — spec loader

Grammar-Version: v2

procedure LOAD_PROCESS_CERTIFICATION_BUNDLE_V1:
  Contract:
    INPUT: bundleRoot path
    PRE: bundleRoot exists and is readable
    OUTPUT: loaded spec, mapping, capability model, catalog with content hashes
    POST:
      - success => EDSE-001…007 present exactly once each
      - success => reference_mapping_only true on 12207 mapping
      - success => no forbidden aggregate score keys on capability model
    EFFECTS: read-only filesystem
    FAILURE_MODES: missing clause, hash mismatch, forbidden rollup field
    TERMINATION: total
  READ edse-process-spec.v1.yaml, iso-12207-mapping.v1.yaml, iso-330xx-capability-model.v1.yaml, conformance-catalog.v1.yaml
  VALIDATE schema_version and required fields per artifact
  COMPUTE sha256 pins and compare declared content_hash when present
  RETURN bundle snapshot
