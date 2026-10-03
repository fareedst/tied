# [IMPL-FEAT_MIGRATION_APPLY] [ARCH-FEAT_MIGRATION_PREVIEW] [REQ-FEAT_LEGACY_MIGRATION]


Grammar-Version: v2

## Summary contract
# [IMPL-FEAT_MIGRATION_APPLY] [ARCH-FEAT_MIGRATION_PREVIEW] [REQ-FEAT_LEGACY_MIGRATION] — apply only an explicitly confirmed clean preview with backup and rollback.
Contract:
  INPUT: migration_preview; confirmation: string where length(confirmation) > 0; destination: string where length(destination) > 0
  PRE: preview is valid, conflict-free, and confirmation is explicit
  OUTPUT: migration_result
  POST: success publishes complete manifests; failure restores the pre-apply destination state
  FAILURE_MODES: CONFIRMATION_REQUIRED, PREVIEW_STALE, CONFLICTS_PRESENT, BACKUP_FAILURE, PUBLISH_FAILURE, ROLLBACK_FAILURE
  DATA: migration-owned feature manifests and backup snapshot
  DATA_TRANSITION: destination changes only after backup; failure restores destination; project-owned TIED YAML remains unchanged
  EFFECTS: IO, State
  TERMINATION: total

## APPLY_CONFIRMED_MIGRATION
procedure APPLY_CONFIRMED_MIGRATION(migration_preview, confirmation, destination):
  Contract:
    INPUT: migration_preview; confirmation: string where length(confirmation) > 0; destination: string where length(destination) > 0
    PRE: preview is valid, conflict-free, and confirmation is explicit
    OUTPUT: migration_result
    POST: success publishes complete manifests; failure restores the pre-apply destination state
    FAILURE_MODES: CONFIRMATION_REQUIRED; PREVIEW_STALE; CONFLICTS_PRESENT; BACKUP_FAILURE; PUBLISH_FAILURE; ROLLBACK_FAILURE
    DATA_TRANSITION: destination changes only after backup; failure restores destination; project-owned TIED YAML remains unchanged
    EFFECTS: IO, State
    TERMINATION: total

# [IMPL-FEAT_MIGRATION_APPLY] [ARCH-FEAT_MIGRATION_PREVIEW] [REQ-FEAT_LEGACY_MIGRATION] — enforce review and recovery gates before publication.
  # [IMPL-FEAT_MIGRATION_APPLY] [ARCH-FEAT_MIGRATION_PREVIEW] [REQ-FEAT_LEGACY_MIGRATION] — enforce confirmation, backup, atomic publication, and rollback.
  IF confirmation is absent: RETURN CONFIRMATION_REQUIRED.
  IF preview is stale or contains conflicts: RETURN the corresponding diagnostic without writes.
  Create MIGRATION_BACKUP for migration-owned destinations.
  IF backup fails: RETURN BACKUP_FAILURE without publication.
  Publish each complete feature manifest through the existing atomic store boundary.
  IF publication fails: invoke RESTORE_MIGRATION_BACKUP.
  IF rollback fails: RETURN ROLLBACK_FAILURE with backup location and affected paths.
  Return success with backup reference, preserved source order, and changed manifests.

## RESTORE_MIGRATION_BACKUP
procedure RESTORE_MIGRATION_BACKUP(backup, destination):
  Contract:
    INPUT: backup with snapshot_paths: list where length(snapshot_paths) >= 0; destination: string where length(destination) > 0
    PRE: backup metadata matches destination scope
    OUTPUT: rollback_result
    POST: migration-owned destinations match backup hashes; project TIED YAML remains untouched
    FAILURE_MODES: ROLLBACK_FAILURE; HASH_MISMATCH
    DATA_TRANSITION: destination restored to backup state or unchanged on failure
    EFFECTS: IO, State
    TERMINATION: total

# [IMPL-FEAT_MIGRATION_APPLY] [ARCH-FEAT_MIGRATION_PREVIEW] [REQ-FEAT_LEGACY_MIGRATION] — restore only migration-owned destinations and leave project TIED YAML untouched.
  # [IMPL-FEAT_MIGRATION_APPLY] [ARCH-FEAT_MIGRATION_PREVIEW] [REQ-FEAT_LEGACY_MIGRATION] — restore migration-owned destinations and verify hashes.
  Restore backed-up files atomically.
  Verify destination hashes against backup metadata.
  Return rollback status and deterministic affected paths.
