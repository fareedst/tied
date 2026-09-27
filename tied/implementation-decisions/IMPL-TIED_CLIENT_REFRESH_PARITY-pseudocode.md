# [IMPL-TIED_CLIENT_REFRESH_PARITY] [ARCH-TIED_CLIENT_REFRESH_PARITY] [REQ-TIED_CLIENT_REFRESH_PARITY]
# Summary: After bootstrap refresh, compare source templates and DOCS_TO_COPY docs to the client tree; emit versioned JSON report; exit non-zero on methodology drift by default.

# [IMPL-TIED_CLIENT_REFRESH_PARITY] [ARCH-TIED_CLIENT_REFRESH_PARITY] [REQ-TIED_CLIENT_REFRESH_PARITY] — CONTRACT
# INPUT: tiedSourceRoot (TIED repo), clientProjectRoot, options { failOnMethodologyDrift, failOnDocDrift, strictRefresh, skipParityGate, parityGateReportOnly, semanticYamlCompare, reportPath }
# OUTPUT: ClientRefreshParityReport v1; process exit 0 | 1 | 2 (drift classes)
# DATA: manifest DOCS_TO_COPY, templates/ tree, client tied/methodology, client tied/docs
# CONTROL: invoked from verify-client-methodology.mjs CLI and bootstrap tail after verifyMethodologyPseudocodeTokenRefs
# PRE: REQ-TIED_YAML_COMPARE_RUBY_LOAD satisfied when semantic YAML dir compare is enabled
# POST: report lists matched, drifted, missing, preserved_by_policy for each parity class
# EFFECTS: stdout/stderr human summary; optional JSON file
# FAILURE_MODES: missing client tied/, unreadable manifest, compare_yaml_dirs non-zero when semantic fallback requested

RUN_CLIENT_REFRESH_PARITY_GATE(options):
  # [IMPL-TIED_CLIENT_REFRESH_PARITY] [ARCH-TIED_CLIENT_REFRESH_PARITY] [REQ-TIED_CLIENT_REFRESH_PARITY]
  # How: Orchestrate Parity A then Parity B; merge into report envelope schema client-refresh-parity-report.v1.

  LOAD manifest from tools/bootstrap/manifest.json under tiedSourceRoot
  BUILD report skeleton { schema_version: "client-refresh-parity-report.v1", generated_at, source_root, client_root, parity_a: {}, parity_b: {} }

  CALL COMPUTE_PARITY_A_TEMPLATES_VS_METHODOLOGY
  CALL COMPUTE_PARITY_B_DOCS_TO_COPY_HASHES
  CALL EMIT_PARITY_REPORT(report, options.reportPath)

  IF methodology drift AND options.failOnMethodologyDrift THEN EXIT 1
  IF doc drift AND (options.failOnDocDrift OR options.strictRefresh) THEN EXIT 1
  IF doc drift AND NOT strict THEN EXIT 0 with sayWarn summary  # default warn-only doc drift
  ELSE EXIT 0

COMPUTE_PARITY_A_TEMPLATES_VS_METHODOLOGY:
  # [IMPL-TIED_CLIENT_REFRESH_PARITY] [ARCH-TIED_CLIENT_REFRESH_PARITY] [REQ-TIED_CLIENT_REFRESH_PARITY] [PROC-YAML_EDIT_LOOP]
  # How: Walk templates/{requirements,architecture-decisions,implementation-decisions,vocab} vs client tied/methodology/**; skip METHODOLOGY_TEMPLATE_ONLY paths.

  leftRoot = tiedSourceRoot + "/templates" mapped per ARCH allowlist
  rightRoot = clientProjectRoot + "/tied/methodology"
  FOR each relative path in union(left, right):
    IF path in METHODOLOGY_TEMPLATE_ONLY_ALLOWLIST THEN RECORD preserved_by_policy; CONTINUE
    IF missing on one side THEN RECORD missing; CONTINUE
    IF both YAML AND options.semanticYamlCompare THEN shell compare_yaml_dirs on parent dir pair for this file
    ELIF both files THEN sha256 equality (default v1)
    ELSE RECORD matched or drifted by sha256

COMPUTE_PARITY_B_DOCS_TO_COPY_HASHES:
  # [IMPL-TIED_CLIENT_REFRESH_PARITY] [ARCH-TIED_CLIENT_REFRESH_PARITY] [REQ-TIED_CLIENT_REFRESH_PARITY] [IMPL-TIED_FILES]
  # How: For each basename in manifest DOCS_TO_COPY, hash source tied/docs/file vs client tied/docs/file; missing client file is preserved_by_policy when copy-when-missing policy applies.

  FOR docName IN manifest.DOCS_TO_COPY:
    sourcePath = tiedSourceRoot + "/tied/docs/" + docName
    clientPath = clientProjectRoot + "/tied/docs/" + docName
    IF NOT exists(clientPath) THEN RECORD missing (bootstrap would copy on next fresh path)
    ELIF sha256(source) == sha256(client) THEN RECORD matched
    ELSE RECORD drifted  # client authoritative but stale vs source

EMIT_PARITY_REPORT(report, reportPath):
  # [IMPL-TIED_CLIENT_REFRESH_PARITY] [ARCH-TIED_CLIENT_REFRESH_PARITY] [REQ-TIED_CLIENT_REFRESH_PARITY]
  # How: Write JSON; print counts and top N drift paths for operator.

LOAD_METHODOLOGY_TEMPLATE_ONLY_ALLOWLIST:
  # [IMPL-TIED_CLIENT_REFRESH_PARITY] [ARCH-TIED_CLIENT_REFRESH_PARITY] [REQ-TIED_CLIENT_REFRESH_PARITY]
  # How: Import METHODOLOGY_TEMPLATE_ONLY_PATHS from tools/bootstrap/lib/methodology-template-only-allowlist.mjs (source of truth; not manifest.json).

  RETURN paths relative to templates/ root for Parity A preserved_by_policy skips

WIRE_BOOTSTRAP_TAIL(bootstrapOptions):
  # [IMPL-TIED_CLIENT_REFRESH_PARITY] [ARCH-TIED_CLIENT_REFRESH_PARITY] [REQ-TIED_CLIENT_REFRESH_PARITY] [IMPL-TIED_FILES] [REQ-TIED_SETUP]
  # How: In bootstrap.mjs after verifyMethodologyPseudocodeTokenRefs and before applyMethodologyClientBoundary; flags from copy-files.mjs.

  IF bootstrapOptions.skipParityGate THEN RETURN without report
  ELSE CALL RUN_CLIENT_REFRESH_PARITY_GATE with failOnMethodologyDrift NOT parityGateReportOnly, failOnDocDrift strictRefresh AND NOT parityGateReportOnly
  IF parityGateReportOnly THEN map drift to sayWarn only; bootstrap exit 0 from parity sub-step

FIX_WARN_MODIFIED_DIRECTORY_FALSE_POSITIVE:
  # [IMPL-TIED_CLIENT_REFRESH_PARITY] [IMPL-TIED_FILES] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_CLIENT_REFRESH_PARITY]
  # How: warnModifiedCopyTarget scans only files OR normalizes directory mtimes after copyTreeWithAttributes; directories recreated by rm/mkdir during vocab refresh must not emit client-modification warnings when file descendants are midnight-normalized.

  IN copy-managed.mjs warnModifiedCopyTarget:
    IF stat.isDirectory() THEN SKIP warning OR normalize directory mtime to midnight after tree copy
    ELSE retain existing isLocalDateMidnight check
