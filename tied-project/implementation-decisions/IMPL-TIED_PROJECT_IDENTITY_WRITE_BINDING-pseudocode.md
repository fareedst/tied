# [IMPL-TIED_PROJECT_IDENTITY_WRITE_BINDING] [ARCH-TIED_PROJECT_IDENTITY_WRITE_BINDING] [REQ-TIED_PROJECT_IDENTITY_WRITE_BINDING] — Path 2 marker, startup binding, per-write guard.

Grammar-Version: v2

## Summary contract
Contract:
  INPUT: tied base path, env, target file paths for writes
  OUTPUT: binding status; throws IdentityWriteBindingError on enforced mismatch
  PRE: tied base from getBasePath(); config may disable enforce
  POST: when enforce on, corpus writes only when marker matches live identity
  FAILURE_MODES: mismatch, missing marker when enforce on (except bootstrap)
  EFFECTS: marker file IO on bootstrap; pure checks otherwise
  TERMINATION: total

procedure ENSURE_PROJECT_IDENTITY_MARKER(tiedBasePath, env):
  # [IMPL-TIED_PROJECT_IDENTITY_WRITE_BINDING] [ARCH-TIED_PROJECT_IDENTITY_WRITE_BINDING] [REQ-TIED_PROJECT_IDENTITY_WRITE_BINDING] — How: Idempotent marker create when absent.
  Contract:
    PRE: tiedBasePath is canonical absolute tied-project root
    POST: marker exists with writable_root and project_id when enforce on or marker was missing
    EFFECTS: may write project-identity.v1.yaml once
  IF NOT IS_WRITE_BINDING_ENFORCED(tiedBasePath) THEN RETURN ok
  IF MARKER_VALID_FOR(tiedBasePath, env) THEN RETURN ok
  IF MARKER_FILE_EXISTS(tiedBasePath) AND NOT MARKER_VALID_FOR THEN RETURN error mismatch
  WRITE marker from resolveProjectIdentity(tiedBasePath, env) and canonical writable_root

procedure ASSERT_BINDING_AT_STARTUP(tiedBasePath, env):
  # [IMPL-TIED_PROJECT_IDENTITY_WRITE_BINDING] [REQ-TIED_PROJECT_IDENTITY_WRITE_BINDING] — How: Path 2 fail closed before mutations when marker exists and enforce on.
  Contract:
    PRE: called once per process after ensure marker
    POST: startupChecked flag set; throws on mismatch when enforce on
    DATA_TRANSITION: startupCheckedRoots gains canonical tiedBasePath once per process
  IF NOT IS_WRITE_BINDING_ENFORCED(tiedBasePath) THEN RETURN
  ENSURE_PROJECT_IDENTITY_MARKER(tiedBasePath, env)
  IF live identity differs from marker THEN THROW IdentityWriteBindingError
  DATA_TRANSITION startupCheckedRoots.add(canonical tiedBasePath)

procedure ASSERT_BINDING_FOR_WRITE(filePath, tiedBasePath, env):
  # [IMPL-TIED_PROJECT_IDENTITY_WRITE_BINDING] [ARCH-TIED_PROJECT_IDENTITY_WRITE_BINDING] — How: Per-write guard for canonicalizer and sidecar paths under base.
  Contract:
    PRE: filePath absolute; bootstrap exempt for marker path only
    POST: no-op when disabled, exempt path, or binding ok
  IF IS_MARKER_BOOTSTRAP_PATH(filePath, tiedBasePath) THEN RETURN
  IF NOT IS_WRITE_BINDING_ENFORCED(tiedBasePath) THEN RETURN
  IF NOT path under tiedBasePath THEN RETURN
  ASSERT_BINDING_AT_STARTUP if not yet checked
  IF live identity differs from marker THEN THROW IdentityWriteBindingError

procedure BINDING_STATUS(tiedBasePath, env):
  # [IMPL-TIED_PROJECT_IDENTITY_WRITE_BINDING] [REQ-TIED_PROJECT_IDENTITY_WRITE_BINDING] — How: Diagnostics for tied_config_get_base_path.
  Contract:
    OUTPUT: ok | mismatch | disabled | marker_missing
    EFFECTS: pure
