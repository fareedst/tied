# [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [ARCH-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT]
# Summary: Generate and validate an explicit grammar v2 header for new TIED sidecars while preserving v1 behavior for legacy sidecars.

## NEW_PROJECT_GRAMMAR_DEFAULT

- [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [ARCH-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT] How: Select the template/bootstrap policy for newly generated sidecars without changing parser selection for existing files.
- Contract:
  - INPUT: template body, bootstrap mode, optional legacy sidecar
  - PRE: template body is readable; bootstrap mode identifies a new client generation
  - OUTPUT: generated sidecar body with `Grammar-Version: v2` in the preamble
  - POST:
    - success => the header is the first non-comment preamble line and the remaining v1-compatible body is preserved
    - legacy input => no existing sidecar is rewritten solely to add the header
  - DATA: canonical sidecar template and generated client files
  - DATA_TRANSITION: new client sidecar absent→header-bearing v2 body; existing legacy sidecar unchanged
  - EFFECTS: IO
  - TERMINATION: total
  - FAILURE_MODES: TemplateUnavailable, BootstrapWriteFailed
procedure SELECT_NEW_PROJECT_GRAMMAR_DEFAULT(template_body, bootstrap_mode):
  # [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [ARCH-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT] How: Require the explicit v2 header only on newly generated sidecars.
  Contract:
    INPUT: template body, bootstrap mode, optional legacy sidecar
    OUTPUT: generated sidecar body with v2 header | error: TemplateUnavailable | BootstrapWriteFailed
    PRE: template body is readable; bootstrap mode identifies a new client generation
    POST: new client output has the header; existing legacy sidecars remain unchanged
    FAILURE_MODES: TemplateUnavailable, BootstrapWriteFailed
    DATA: canonical sidecar template and generated client files
    DATA_TRANSITION: new client sidecar absent→header-bearing v2 body; existing legacy sidecar unchanged
    EFFECTS: IO
    TERMINATION: total
  IF template_body is unavailable: RETURN error TemplateUnavailable
  IF bootstrap_mode is new_client:
    INSERT `Grammar-Version: v2` after the template H1 and before the first procedure heading
    RETURN generated template body
  RETURN template_body

## LEGACY_V1_COMPATIBILITY

- [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [ARCH-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT] How: Keep absent-header sidecars on the existing v1 parser path and make the compatibility boundary auditable.
- Contract:
  - INPUT: sidecar body, parser version detector, validation and analysis results
  - PRE: sidecar body is available
  - OUTPUT: compatibility result distinguishing generated-v2, explicit-v2, and legacy-v1 cases
  - POST:
    - absent header => parser remains v1-compatible
    - explicit header => parser may select v2 without requiring `constraint_flow`
  - EFFECTS: pure
  - TERMINATION: total
  - FAILURE_MODES: InvalidVersionHeader
procedure CLASSIFY_SIDECAR_VERSION(sidecar_body):
  # [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [ARCH-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT] How: Classify the header boundary without rewriting the sidecar or enabling constraint analysis.
  Contract:
    INPUT: sidecar body, parser version detector
    OUTPUT: explicit_v2 | legacy_v1 | error: InvalidVersionHeader
    PRE: sidecar body is available
    POST: absent header remains v1-compatible; valid v2 header selects the v2 boundary
    FAILURE_MODES: InvalidVersionHeader
    EFFECTS: pure
    TERMINATION: total
  IF sidecar_body contains `Grammar-Version: v2` in the preamble: RETURN explicit_v2
  IF sidecar_body contains an unsupported grammar header: RETURN error InvalidVersionHeader
  RETURN legacy_v1

## NEW_CLIENT_AUDIT

- [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [ARCH-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT] How: Verify generation, Layer B, Layer C, and legacy compatibility as separate evidence dimensions.
- Contract:
  - INPUT: disposable client root, generated sidecar, Layer B report, Layer C report, legacy fixture report
  - PRE: disposable client bootstrap completed and reports are available
  - OUTPUT: grammar_v2_header audit result with independent dimensions
  - POST:
    - header dimension passes only when the generated sidecar has the exact v2 header
    - Layer B and Layer C dimensions retain their own proof boundaries
    - constraint_flow remains false for the default smoke
  - EFFECTS: IO
  - TERMINATION: total
  - FAILURE_MODES: GeneratedHeaderMissing, LayerBFailed, LayerCFailed, LegacyCompatibilityFailed
procedure AUDIT_NEW_CLIENT_GRAMMAR(client_root, reports):
  # [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [ARCH-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT] How: Emit a stable audit record that prevents a header check from masquerading as runtime or constraint proof.
  Contract:
    INPUT: disposable client root, generated sidecar, Layer B report, Layer C report, legacy fixture report
    OUTPUT: grammar_v2_header audit result | error: GeneratedHeaderMissing | LayerBFailed | LayerCFailed | LegacyCompatibilityFailed
    PRE: disposable client bootstrap completed and reports are available
    POST: header, Layer B, Layer C, constraint_flow, and legacy dimensions are reported independently
    FAILURE_MODES: GeneratedHeaderMissing, LayerBFailed, LayerCFailed, LegacyCompatibilityFailed
    EFFECTS: IO
    TERMINATION: total
  generated = READ generated sidecar from client_root
  IF generated lacks the exact v2 header: RETURN error GeneratedHeaderMissing
  IF reports.layer_b is not ok: RETURN error LayerBFailed
  IF reports.layer_c is not ok OR reports.layer_c.gate_mode_applied is false: RETURN error LayerCFailed
  IF reports.constraint_flow is true: RETURN error LayerCFailed
  IF reports.legacy_v1 is not compatible: RETURN error LegacyCompatibilityFailed
  RETURN { grammar_v2_header: pass, layer_b: reports.layer_b, layer_c: reports.layer_c, constraint_flow: false }

## COHORT_GRAMMAR_V2_REPLAY

- [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [ARCH-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT] How: Replay Track A audit expectations across evaluation-corpus rows without treating cohort replay as client close-out.
- Contract:
  - INPUT: evaluation-corpus row, stdd repo root, optional writeArtifact flag
  - PRE: row declares project_root and request_token; when grammar_v2_header_expect is pass the audit artifact path resolves under stdd or absolute operator storage
  - OUTPUT: per-row replay result with independent grammar_v2_header dimension only
  - POST:
    - rows with grammar_v2_header_expect pass fail when audit.ok is false or dimensions.grammar_v2_header is not pass
    - optional artifact write does not substitute for envelope or integrated gate completion
    - rows without pass expectation are skipped by replay driver
  - EFFECTS: IO
  - TERMINATION: total
  - FAILURE_MODES: MissingProjectRoot, AuditFailed, ArtifactReadBackFailed
procedure REPLAY_CORPUS_GRAMMAR_V2_ROW(row, std_root, options):
  # [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [ARCH-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT] How: Run audit on registered client root and enforce header dimension when cohort row opts in.
  Contract:
    INPUT: corpus row, stdd root, writeArtifact default true
    OUTPUT: replay ok | error: MissingProjectRoot | AuditFailed | ArtifactReadBackFailed
    PRE: grammar_v2_header_expect is pass when enforcement applies
    POST: header dimension pass is necessary and sufficient for replay ok; Layer B/C remain audit-internal only
    FAILURE_MODES: MissingProjectRoot, AuditFailed, ArtifactReadBackFailed
    EFFECTS: IO
    TERMINATION: total
  IF row.project_root is missing on disk: RETURN error MissingProjectRoot
  report = RUN grammar v2 default audit on row.project_root
  IF options.writeArtifact AND row.grammar_v2_audit_artifact:
    WRITE JSON report to resolved artifact path under std_root
    IF read-back JSON differs: RETURN error ArtifactReadBackFailed
  IF report.ok is not true OR report.dimensions.grammar_v2_header is not pass:
    RETURN error AuditFailed
  RETURN replay ok
