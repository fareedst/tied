# [IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] [ARCH-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] [REQ-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP]
# Summary: Normalize procedure block-lead comments inside sidecar bodies across phased waves without changing validator behavior or grammar version policy.

## BLOCK_LEAD_INVENTORY

- [IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] [ARCH-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] [REQ-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] How: Emit a machine-readable inventory of external-only and inter-procedure block-leads before any write pass.
- Contract:
  - INPUT: sidecar root, optional wave filter, check mode flag
  - PRE: sidecar root exists and is readable
  - OUTPUT: JSON inventory with external_only and inter_procedure counts per file
  - POST:
    - success => inventory lists every offending line with verbatim lead text and target procedure name
    - check mode => no file bytes are mutated
  - DATA: sidecar markdown files under `tied/implementation-decisions/`
  - DATA_TRANSITION: none in check mode
  - EFFECTS: IO
  - TERMINATION: total
  - FAILURE_MODES: SidecarRootUnavailable, InventoryWriteFailed
procedure SCAN_BLOCK_LEAD_PLACEMENT(sidecar_root, wave_filter, check_mode):
  # [IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] [ARCH-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] [REQ-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] How: Reuse block-lead detection aligned with pseudocode-shared isBlockLeadCommentLine and tokenScan bounds without mutating files in check mode.
  Contract:
    INPUT: sidecar root, optional wave filter, check mode flag
    OUTPUT: block_lead_inventory JSON | error: SidecarRootUnavailable | InventoryWriteFailed
    PRE: sidecar root exists and is readable
    POST: inventory counts match detected external-only and inter-procedure leads; check mode leaves bytes unchanged
    FAILURE_MODES: SidecarRootUnavailable, InventoryWriteFailed
    DATA: sidecar markdown files
    DATA_TRANSITION: none in check mode
    EFFECTS: IO
    TERMINATION: total
  IF sidecar_root is unavailable: RETURN error SidecarRootUnavailable
  files = LIST sidecar files matching wave_filter or all `IMPL-*-pseudocode.md`
  inventory = {}
  FOR each file in files:
    lines = READ file bytes
    procedures = SCAN procedure headings using the same heading pattern as pseudocode-shared
    external_only = COLLECT contiguous `# [IMPL|ARCH|REQ` lines immediately above each procedure heading
    inter_procedure = COLLECT trailing `# [IMPL|ARCH|REQ` lines between procedure bodies that belong to the next procedure
    inventory[file] = { external_only, inter_procedure, verbatim_lead_text preserved }
  IF check_mode: RETURN inventory
  WRITE inventory JSON to stdout or requested output path
  RETURN inventory

## EXTERNAL_BLOCK_LEAD_NORMALIZATION

- [IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] [ARCH-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] [REQ-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] How: Move predecessor block-leads from above procedure headings to the first line inside the procedure body before `Contract:`.
- Contract:
  - INPUT: sidecar file path, inventory entry, write mode flag
  - PRE: inventory entry identifies external-only leads for the file
  - OUTPUT: normalized sidecar bytes or dry-run diff
  - POST:
    - success => every moved lead appears inside the owning procedure body with verbatim text preserved
    - write mode false => bytes on disk remain unchanged
  - DATA: one sidecar file
  - DATA_TRANSITION: external-only lead absent→internal block-lead inside owning procedure
  - EFFECTS: IO
  - TERMINATION: total
  - FAILURE_MODES: TargetProcedureMissing, ContractAnchorMissing, WriteRejected
procedure NORMALIZE_EXTERNAL_BLOCK_LEAD(sidecar_path, inventory_entry, write_mode):
  # [IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] [ARCH-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] [REQ-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] How: Insert moved leads after the procedure heading and before the first `Contract:` row without altering non-lead prose.
  Contract:
    INPUT: sidecar file path, inventory entry, write mode flag
    OUTPUT: normalized sidecar bytes | dry-run diff | error: TargetProcedureMissing | ContractAnchorMissing | WriteRejected
    PRE: inventory entry identifies external-only leads
    POST: moved leads are internal; verbatim lead text unchanged; dry-run leaves disk unchanged
    FAILURE_MODES: TargetProcedureMissing, ContractAnchorMissing, WriteRejected
    DATA: one sidecar file
    DATA_TRANSITION: external-only lead absent→internal block-lead inside owning procedure
    EFFECTS: IO
    TERMINATION: total
  IF inventory_entry.external_only is empty: RETURN sidecar_path unchanged
  FOR each external lead in inventory_entry.external_only:
    LOCATE owning procedure heading
    IF procedure heading missing: RETURN error TargetProcedureMissing
    IF `Contract:` anchor missing inside procedure body: RETURN error ContractAnchorMissing
    REMOVE lead line from above heading
    INSERT lead line immediately after procedure heading and before `Contract:`
  IF write_mode is false: RETURN dry-run diff
  WRITE normalized bytes to sidecar_path
  RETURN sidecar_path

## INTER_PROCEDURE_BLOCK_LEAD_NORMALIZATION

- [IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] [ARCH-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] [REQ-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] How: Move trailing inter-procedure block-leads to the next procedure body start so literal-copy alignment matches the owning procedure.
- Contract:
  - INPUT: sidecar file path, inventory entry, write mode flag
  - PRE: inventory entry identifies inter-procedure leads between procedure bodies
  - OUTPUT: normalized sidecar bytes or dry-run diff
  - POST:
    - success => each inter-procedure lead attaches to the following procedure body start
    - write mode false => bytes on disk remain unchanged
  - DATA: one sidecar file
  - DATA_TRANSITION: inter-procedure lead relocated→internal lead on next procedure
  - EFFECTS: IO
  - TERMINATION: total
  - FAILURE_MODES: NextProcedureMissing, WriteRejected
procedure NORMALIZE_INTER_PROCEDURE_BLOCK_LEAD(sidecar_path, inventory_entry, write_mode):
  # [IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] [ARCH-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] [REQ-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] How: Relocate trailing leads from the gap before the next procedure heading to that procedure's internal block-lead slot.
  Contract:
    INPUT: sidecar file path, inventory entry, write mode flag
    OUTPUT: normalized sidecar bytes | dry-run diff | error: NextProcedureMissing | WriteRejected
    PRE: inventory entry identifies inter-procedure leads
    POST: inter-procedure leads attach to the next procedure; verbatim text preserved; dry-run leaves disk unchanged
    FAILURE_MODES: NextProcedureMissing, WriteRejected
    DATA: one sidecar file
    DATA_TRANSITION: inter-procedure lead relocated→internal lead on next procedure
    EFFECTS: IO
    TERMINATION: total
  IF inventory_entry.inter_procedure is empty: RETURN sidecar_path unchanged
  FOR each inter lead in inventory_entry.inter_procedure:
    LOCATE next procedure heading after the gap
    IF next procedure heading missing: RETURN error NextProcedureMissing
    REMOVE lead line from inter-procedure gap
    INSERT lead line at next procedure internal block-lead position before `Contract:`
  IF write_mode is false: RETURN dry-run diff
  WRITE normalized bytes to sidecar_path
  RETURN sidecar_path

## WAVE_ORCHESTRATION

- [IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] [ARCH-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] [REQ-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] How: Apply normalization in phased waves with per-file and per-wave validation gates.
- Contract:
  - INPUT: wave id, sidecar file list, write mode flag, validation tools
  - PRE: Track C validator hardening is deployed; wave file list is explicit
  - OUTPUT: wave result with inventory before/after and validation receipts
  - POST:
    - success => every file in the wave passes pseudocode_validate and wave gate records zero external-only and inter-procedure leads
    - write mode false => only inventory and dry-run diffs are emitted
  - DATA: wave-scoped sidecar files and gate receipts under `working/REQ-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP/`
  - DATA_TRANSITION: wave sidecars external/inter leads absent→internal placement; docs/template sync deferred to wave B4
  - EFFECTS: IO
  - TERMINATION: total
  - FAILURE_MODES: WaveFileListMissing, PerFileValidationFailed, WaveGateFailed
procedure APPLY_WAVE_SWEEP(wave_id, file_list, write_mode, validators):
  # [IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] [ARCH-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] [REQ-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] How: Run inventory, normalization, and gates for one wave without crossing into another wave's file list.
  Contract:
    INPUT: wave id, sidecar file list, write mode flag, validation tools
    OUTPUT: wave sweep result | error: WaveFileListMissing | PerFileValidationFailed | WaveGateFailed
    PRE: wave file list is explicit and Track C safety net is available
    POST: wave inventory after sweep reports zero external-only and inter-procedure leads when write_mode is true
    FAILURE_MODES: WaveFileListMissing, PerFileValidationFailed, WaveGateFailed
    DATA: wave-scoped sidecar files and gate receipts
    DATA_TRANSITION: wave sidecars normalized; receipts persisted per wave
    EFFECTS: IO
    TERMINATION: total
  IF file_list is empty: RETURN error WaveFileListMissing
  before = CALL SCAN_BLOCK_LEAD_PLACEMENT(sidecar_root, wave_id, check_mode=true)
  FOR each file in file_list:
    entry = before[file]
    CALL NORMALIZE_EXTERNAL_BLOCK_LEAD(file, entry, write_mode)
    CALL NORMALIZE_INTER_PROCEDURE_BLOCK_LEAD(file, entry, write_mode)
    IF write_mode:
      result = CALL validators.pseudocode_validate for owning IMPL token
      IF result is not ok: RETURN error PerFileValidationFailed
  after = CALL SCAN_BLOCK_LEAD_PLACEMENT(sidecar_root, wave_id, check_mode=true)
  IF after reports any external_only OR inter_procedure: RETURN error WaveGateFailed
  IF write_mode: CALL validators.tied_validate_consistency
  PERSIST wave receipt under working folder for wave_id
  RETURN { wave_id, before, after, receipts }

## DOC_AND_TEMPLATE_SYNC

- [IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] [ARCH-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] [REQ-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] How: Mandate internal block-lead placement in authoring docs after sidecar waves complete.
- Contract:
  - INPUT: format guide path, template path, sweep completion flag
  - PRE: waves B1–B3 complete with zero leak-risk inventory
  - OUTPUT: updated authoring guidance requiring internal placement for new/changed procedures
  - POST:
    - success => format guide and template examples show internal block-leads only
    - validator behavior remains unchanged from Track C
  - EFFECTS: IO
  - TERMINATION: total
  - FAILURE_MODES: SweepIncomplete, DocSyncRejected
procedure SYNC_AUTHORING_GUIDANCE(format_guide_path, template_path, sweep_complete):
  # [IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] [ARCH-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] [REQ-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] How: Update wave B4 docs to require internal placement without reintroducing external-only examples.
  Contract:
    INPUT: format guide path, template path, sweep completion flag
    OUTPUT: updated docs | error: SweepIncomplete | DocSyncRejected
    PRE: waves B1–B3 complete with zero leak-risk inventory
    POST: format guide mandates internal placement; template example remains internal-only
    FAILURE_MODES: SweepIncomplete, DocSyncRejected
    EFFECTS: IO
    TERMINATION: total
  IF sweep_complete is false: RETURN error SweepIncomplete
  UPDATE format_guide_path to mandate internal block-lead placement for new/changed procedures
  VERIFY template_path block-lead example remains inside procedure bodies
  RETURN { format_guide_path, template_path, policy: internal_only }
