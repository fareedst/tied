# Test strategy — REQ-CITDP_ORDERED_LIST_KEYS

**Profile depth:** minimal  
**Gate policy:** advisory  
**E2E:** not applicable (no UI; behavior is validator + YAML migration + canonicalizer contract)

## Module boundaries

| Module | Validation |
| --- | --- |
| `citdp-ordered-keys.ts` | Unit tests in isolation |
| `citdp-writer.ts` | Composition test: write rejects legacy keys, accepts `command_seq` |
| `yaml-canonicalizer.ts` | Existing unit suite + one CITDP-shaped fixture |
| Migration script | Dry-run mode + idempotency run (script self-check or shell test) |

## Matrix

| Id | Layer | Input | Expected |
| --- | --- | --- | --- |
| OK-EVID-SEQ | Unit | `{ evidence: { command_seq: ["b","a"] } }` | `validateCitdpOrderedListKeys` ok |
| REJ-EVID-CMD | Unit | `{ evidence: { commands: ["x"] } }` | diagnostic `deprecated_citdp_key:evidence.commands` |
| REJ-TS-CMD | Unit | `{ test_strategy: { commands: ["x"] } }` | diagnostic `deprecated_citdp_key:test_strategy.commands` |
| OK-TS-VERIF | Unit | `{ test_strategy: { verification_command_seq: ["a"] } }` | ok |
| REJ-TS-VERIF-LEG | Unit | `{ test_strategy: { verification_commands: ["a"] } }` | deprecated key diagnostic |
| WRITER-REJ | Composition | `writeCitdpRecord` with `evidence.commands` | `ok: false` before file write |
| WRITER-OK | Composition | `writeCitdpRecord` with `command_seq` | `ok: true`; round-trip load |
| CANON-SEQ | Unit | canonicalize `evidence.command_seq: ["z","a"]` | order `z,a` unchanged |
| MIG-IDEM | Script | run migration twice on fixture dir | second run no diff |

## TDD sequence

1. RED unit tests for `validateCitdpOrderedListKeys` (module may not exist).
2. GREEN validator module.
3. RED writer composition tests.
4. GREEN hook in `citdp-writer.ts`.
5. Run migration on repo; fix any script bugs.
6. RED canonicalizer case if not already green.
7. Full `npm test --prefix mcp-server`.

## Proof boundaries

- Does not prove every historical clone outside this store migrated (template + install refresh only).
- Does not validate non-`citdp_record_write` direct file edits (lint/canonicalize still apply).
