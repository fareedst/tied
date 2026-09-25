# [IMPL-TIED_METHODOLOGY_CLIENT_BOUNDARY] [ARCH-TIED_METHODOLOGY_CLIENT_BOUNDARY] [REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY] — Layered client methodology boundary (Phase A mechanical + Phase B MCP read spike).

Grammar-Version: v2

## Phase A — mechanical enforcement (pattern #4)

- [IMPL-TIED_METHODOLOGY_CLIENT_BOUNDARY] [ARCH-TIED_METHODOLOGY_CLIENT_BOUNDARY] [REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY] How: optional bootstrap hardening and client git hook compose with existing MCP project-only write policy without replacing loaders.
- Contract:
  - INPUT: client_project_root, bootstrap_options, platform_kind
  - PRE: TIED_BASE_PATH resolves to client tied/; copy_files.sh or Node bootstrap already installed methodology tree when client expects inherited snapshot
  - OUTPUT: bootstrap_result OR error InvalidOption OR error PlatformUnsupported OR error HookInstallFailed
  - POST:
    - on success: methodology tree unchanged in merge semantics; optional Unix read-only applied only when flag enabled; hook template present when install requested
    - on error PlatformUnsupported: no partial chmod on unsupported OS; documented Windows ACL guidance only
  - FAILURE_MODES: InvalidOption, PlatformUnsupported, HookInstallFailed
  - EFFECTS: IO, State
  - TERMINATION: total
procedure INSTALL_METHODOLOGY_READONLY_BOOTSTRAP_FLAG:
  # [IMPL-TIED_METHODOLOGY_CLIENT_BOUNDARY] [ARCH-TIED_METHODOLOGY_CLIENT_BOUNDARY] [REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY] How: after managed copy of tied/methodology/, optionally mark tree read-only on Unix when sponsor flag set.
  Contract:
    INPUT: client_project_root, bootstrap_flag_methodology_readonly
    OUTPUT: applied boolean and platform string
    PRE: bootstrap_flag_methodology_readonly is explicit boolean; not default-on without CITDP opt-in
    POST: on success when platform is Unix AND flag true THEN tied/methodology tree permissions deny writer role ELSE permissions unchanged
    EFFECTS: IO
  IF bootstrap_flag_methodology_readonly is false THEN RETURN applied false and platform platform_kind
  IF platform_kind is Unix THEN SET read_only permissions recursively on tied/methodology tree
  ELSE RETURN applied false and platform platform_kind WITH documented Windows ACL pattern in operator doc
  RETURN applied true and platform platform_kind

procedure INSTALL_CLIENT_HOOK_TEMPLATE:
  # [IMPL-TIED_METHODOLOGY_CLIENT_BOUNDARY] [ARCH-TIED_METHODOLOGY_CLIENT_BOUNDARY] [REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY] How: install pre-commit hook template that rejects any staged path matching tied/methodology/ prefix.
  Contract:
    INPUT: client_project_root, hook_install_request
    OUTPUT: installed boolean and hook_path string OR error HookInstallFailed
    PRE: hook_install_request is explicit; hook does not modify methodology files
    POST: on success hook exits non-zero when staged paths include tied/methodology/ prefix
    FAILURE_MODES: HookInstallFailed
    EFFECTS: IO
  WRITE pre_commit hook template that scans staged paths for tied/methodology/ prefix
  EMIT operator instructions to enable hook under client_project_root
  RETURN installed true and hook_path resolved_hook_path

procedure DOCUMENT_CI_METHODOLOGY_PATH_GUARD:
  # [IMPL-TIED_METHODOLOGY_CLIENT_BOUNDARY] [ARCH-TIED_METHODOLOGY_CLIENT_BOUNDARY] [REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY] How: document CI job pattern comparing diff name-only against tied/methodology/ prefix for advisory enforcement.
  Contract:
    INPUT: client_development_index_doc
    OUTPUT: doc_section_ref
    PRE: doc section names compose-don't-fork with MCP loaders
    POST: on success operators have copy-paste CI guard recipe; default remains advisory unless org enables required check
    EFFECTS: IO
  APPEND section methodology-boundary-ci-guard to client_development_index_doc
  RETURN doc_section_ref

## MCP compose — do not fork write guards

- [IMPL-TIED_METHODOLOGY_CLIENT_BOUNDARY] [ARCH-TIED_METHODOLOGY_CLIENT_BOUNDARY] [REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY] How: Phase A hooks add friction; MCP detail-loader and yaml-loader remain authoritative for project-only writes.
procedure COMPOSE_WITH_EXISTING_MCP_WRITE_GUARDS:
  # [IMPL-TIED_METHODOLOGY_CLIENT_BOUNDARY] [ARCH-TIED_METHODOLOGY_CLIENT_BOUNDARY] [REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY] How: decision function; hooks never bypass loader rejection.
  Contract:
    INPUT: mutation_target_path, loader_policy
    OUTPUT: allow_write OR reject_methodology_write
    PRE: loader_policy is existing detail-loader and yaml-loader project-only rules
    POST: on reject_methodology_write same semantics as today; hooks never bypass MCP rejection
    DATA: none
    DATA_TRANSITION: unchanged
    EFFECTS: pure
  IF mutation_target_path is under tied/methodology/ THEN RETURN reject_methodology_write using loader_policy
  ELSE RETURN allow_write for project YAML paths only

## Phase B — strategic MCP bundled read (pattern #2 spike)

- [IMPL-TIED_METHODOLOGY_CLIENT_BOUNDARY] [ARCH-TIED_METHODOLOGY_CLIENT_BOUNDARY] [REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY] How: spike merged methodology read from bundled corpus without removing copy_files.sh until parity gates documented in PLAN.
procedure SPIKE_BUNDLED_METHODOLOGY_READ:
  # [IMPL-TIED_METHODOLOGY_CLIENT_BOUNDARY] [ARCH-TIED_METHODOLOGY_CLIENT_BOUNDARY] [REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY] How: bundled corpus read with methodology-first then project fallback parity versus copied tree fixture.
  Contract:
    INPUT: mcp_server_bundle_path, TIED_BASE_PATH, read_request
    OUTPUT: merged_read_view OR error BundleMissing OR error ParityGap
    PRE: project YAML still on disk at TIED_BASE_PATH; bundled corpus version pinned
    POST: on success methodology-first read resolves from bundle then project fallback matches existing sentinel semantics
    FAILURE_MODES: BundleMissing, ParityGap
    EFFECTS: IO
  LOAD bundled_methodology_corpus FROM mcp_server_bundle_path
  RESOLVE read_request using methodology_first detail path THEN project fallback when sentinel or absent
  IF parity tests against copied_tree_fixture fail THEN RETURN error ParityGap
  RETURN merged_read_view

procedure PACK_METHODOLOGY_BUNDLE_FOR_RELEASE:
  # [IMPL-TIED_METHODOLOGY_CLIENT_BOUNDARY] [ARCH-TIED_METHODOLOGY_CLIENT_BOUNDARY] [REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY] How: copy repo tied/methodology into release corpus beside @tied/mcp with version manifest for pinned offline reads.
  Contract:
    INPUT: source_methodology_dir, corpus_out_dir, manifest_out_path, tied_mcp_version
    OUTPUT: methodology_bundle_manifest OR error SourceMissing OR error ManifestInvalid
    PRE: source_methodology_dir exists and matches tied/methodology layout; tied_mcp_version from package.json
    POST: corpus_out_dir is flat methodology layout; manifest schema methodology-bundle-manifest.v1 with corpus_sha256 and per-file digests
    FAILURE_MODES: SourceMissing, ManifestInvalid
    EFFECTS: IO
  COPY source_methodology_dir TO corpus_out_dir
  COMPUTE per_file_sha256 AND corpus_sha256
  WRITE methodology_bundle_manifest TO manifest_out_path
  IF manifest validation against corpus fails THEN RETURN error ManifestInvalid
  RETURN methodology_bundle_manifest

procedure DOCUMENT_MIGRATION_FROM_COPIED_TREE:
  # [IMPL-TIED_METHODOLOGY_CLIENT_BOUNDARY] [ARCH-TIED_METHODOLOGY_CLIENT_BOUNDARY] [REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY] How: record migration gates in PLAN Phase B without removing local methodology tree by default.
  Contract:
    INPUT: PLAN_phase_B_section
    OUTPUT: migration_gates_list
    PRE: non-goals include no automatic removal of tied/methodology/ without sponsor gate
    POST: on success PLAN lists parity tests, tied-cli parity, rollback via copy_files.sh refresh
    EFFECTS: IO
  RECORD migration_gates_list IN PLAN_phase_B_section
  RETURN migration_gates_list

procedure DOCUMENT_OFFLINE_COPY_FILES_POLICY:
  # [IMPL-TIED_METHODOLOGY_CLIENT_BOUNDARY] [ARCH-TIED_METHODOLOGY_CLIENT_BOUNDARY] [REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY] How: G4 operator runbook + sponsor sign-off retain copy_files.sh for offline/air-gap; bundled read stays optional.
  Contract:
    INPUT: offline_runbook_doc, sponsor_signoff_receipt_path
    OUTPUT: g4_gate_evidence_refs
    PRE: policy.copy_files_refresh_retained true AND policy.bundle_optional true in signoff schema methodology-offline-policy-signoff.v1
    POST: on success operators have refresh steps, bundle coexistence, CI guard pointers, decision matrix; PLAN marks G4 Met
    EFFECTS: IO
  WRITE offline_runbook_doc WITH sections when_to_copy_files, refresh_procedure, bundle_coexistence, ci_guard, decision_matrix, g3_pack_link
  VALIDATE sponsor_signoff_receipt_path against methodology-offline-policy-signoff.v1
  RECORD g4_gate_evidence_refs IN PLAN migration_gates_list
  RETURN g4_gate_evidence_refs
