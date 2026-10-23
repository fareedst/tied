# [IMPL-CITDP_ORDERED_KEY_VALIDATE] [ARCH-CITDP_ORDERED_LIST_KEYS] [REQ-CITDP_ORDERED_LIST_KEYS] — Reject legacy CITDP command list keys at write; support bulk rename transform.

Grammar-Version: v2

## VALIDATE_CITDP_ORDERED_LIST_KEYS

- [IMPL-CITDP_ORDERED_KEY_VALIDATE] [ARCH-CITDP_ORDERED_LIST_KEYS] [REQ-CITDP_ORDERED_LIST_KEYS] Fail closed when open CITDP records use deprecated ordered-command keys.
- Contract:
  - INPUT: citdp_record (mapping)
  - PRE: citdp_record is a plain object
  - OUTPUT: { ok: boolean, diagnostics: string[] }
  - POST:
    - ok true IFF diagnostics empty
    - each diagnostic is deprecated_citdp_key:{section}.{key}
  - EFFECTS: none (pure)
- FOR each section IN (evidence, adoption_evidence):
  - IF section present AND mapping:
    - IF commands key present THEN append deprecated_citdp_key:{section}.commands
- IF test_strategy present AND mapping:
  - FOR each legacy key IN (commands, verification_commands, integration_commands, regression_commands):
    - IF key present THEN append deprecated_citdp_key:test_strategy.{key}
- RETURN { ok, diagnostics }

## TRANSFORM_CITDP_ORDERED_LIST_KEYS

- [IMPL-CITDP_ORDERED_KEY_VALIDATE] [ARCH-CITDP_ORDERED_LIST_KEYS] [REQ-CITDP_ORDERED_LIST_KEYS] Rename legacy keys for migration scripts (idempotent).
- Contract:
  - INPUT: citdp_record (mapping)
  - OUTPUT: citdp_record (deep clone with renames applied)
  - POST: command_seq present IFF commands was present and command_seq absent before
- APPLY EVIDENCE map (commands -> command_seq) to evidence and adoption_evidence when present
- APPLY TEST_STRATEGY map to test_strategy when present
- RETURN transformed record

## WRITE_CITDP_RECORD_HOOK

- [IMPL-CITDP_ORDERED_KEY_VALIDATE] [ARCH-CITDP_ORDERED_LIST_KEYS] [REQ-CITDP_ORDERED_LIST_KEYS] Invoke validator after DAE field validation and before canonical atomic write.
- Contract:
  - PRE: merged CITDP record ready for persistence
  - POST: write aborts with invalid CITDP ordered list keys error when validator not ok
  - EFFECTS: no file write when validator fails
