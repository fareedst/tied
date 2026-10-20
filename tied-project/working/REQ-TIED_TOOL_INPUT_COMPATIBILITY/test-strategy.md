# Test strategy — REQ-TIED_TOOL_INPUT_COMPATIBILITY

**Depth:** integrated · **Gate policy:** advisory  
**IMPL sidecar:** [IMPL-TIED_TOOL_INPUT_NORMALIZATION-pseudocode.md](../../implementation-decisions/IMPL-TIED_TOOL_INPUT_NORMALIZATION-pseudocode.md)

## Unit (RED before `normalizeRecordPayload` implementation)

| Block lead / area | File | Assertions |
| --- | --- | --- |
| `NORMALIZE_RECORD_PAYLOAD` | `mcp-server/src/parse-content.test.ts` | Plain object pass-through; valid JSON/YAML string parity with today; reject null, array, number, string primitive, boolean |
| `PARSE_RECORD_OR_YAML` | same | Existing cases remain green (no regression) |

## Composition / MCP schema

| Area | File | Assertions |
| --- | --- | --- |
| Write-tool Zod / JSON Schema | `mcp-server/src/tools/yaml-canonicalization-mcp.test.ts` or dedicated `tool-record-input-schema.test.ts` | Each in-scope tool accepts object **and** string; malformed shapes fail at schema/handler boundary |
| Canonical persistence | same or handler test | Object and string payloads producing identical on-disk YAML for fixture record |

**In-scope tools:** `yaml_index_insert`, `yaml_index_update`, `yaml_detail_create`, `yaml_detail_update`, `citdp_record_write`, `tied_token_create_with_detail` (both record fields).

## CLI regression

| Area | File | Assertions |
| --- | --- | --- |
| `EMIT_CLI_HINDRANCE_DIAGNOSTIC` | `mcp-server/test/tied-cli-large-args.test.cjs` | stderr contains `DIAGNOSTIC: TIED_CLI_HINDRANCE` with parseable JSON; simulated `-32602` / transport failure; **exit code unchanged** vs baseline fixture |

## Assurance mapping

| Profile | Evidence |
| --- | --- |
| baseline-functional | parse-content unit tests |
| external-input-security | reject non-record; no write on failed normalize |
| data-integrity-migration | object/string YAML equivalence |
| stateful-reliability | CLI exit codes |
| ai-enabled | schema-level object acceptance (agent tool boundary) |

## Adversarial / checklist

- Structural `sub-adversarial-inquiry-pass` at **pre_implementation** (refine pass 1 run) with identity-bound `run_id` paired to gate receipt.
- Before RED in build-plan: confirm gate receipt **allowed** and inquiry artifacts present under `tied-bundle/working/REQ-TIED_TOOL_INPUT_COMPATIBILITY/adversarial-inquiry/` (or documented waiver).

## Verification gate (post-implementation)

- `npx tsc -b` in `mcp-server`
- Full focused test list above
- `pseudocode_validate` (gate_mode)
- `tied_validate_consistency`
