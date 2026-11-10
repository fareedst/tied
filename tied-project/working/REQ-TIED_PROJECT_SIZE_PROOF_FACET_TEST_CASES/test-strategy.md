# Test strategy — [REQ-TIED_PROJECT_SIZE_PROOF_FACET_TEST_CASES]

**Depth:** minimal · **Gate policy:** advisory

## Module boundaries

| Module | Responsibility |
| --- | --- |
| `mcp-server/src/project-size/test-case-count.ts` | Pure `countTestCasesInSource` (comments/strings strip + regex) |
| `mcp-server/src/project-size/snapshot-builder.ts` | Sum cases into tier buckets; emit `validator_version` 1.1.0 |
| Facilitator render | Glossary text only (no logic change beyond doc strings) |

## Unit tests (RED before production code)

### `test-case-count.ts` (isolated)

| Test | Asserts |
| --- | --- |
| Single `it` | count === 1 |
| Multiple `it` in one file | count === N |
| `test()` alias | counted |
| `it.skip` / `it.only` | counted (WF discovery parity) |
| Comment-only `// it(` | not counted after strip |
| String literal containing `it(` | not counted after naive strip |

### `project-size.test.ts` (integration fixture)

Fixture: [`mcp-server/test/fixtures/project-size/mini-client/`](../../../mcp-server/test/fixtures/project-size/mini-client/)

| Test | Asserts |
| --- | --- |
| Case vs file | `unit_tests` > unit-classified file count (SC-PFC-02) |
| Validator | `receipt.validator_version === "1.1.0"` |
| Cross-layer | `proof_facets_per_atom` reflects case sum |
| verify_ev | `verify_evidence_files` still file-based if fixture has evidence paths (optional 0) |

**Fixture change:** Add `src/gamma.test.ts` with **three** `it` blocks (unit tier); keep `alpha.test.ts` / `beta.test.ts` at one case each → expect `unit_tests === 5`, unit files === 3.

## Composition tests

- Existing `project-size-mcp.composition.test.ts` still passes; optionally assert `validator_version` on MCP path.

## E2E

None — facilitator dogfood via batch compare CLI after build.

## Security

Read-only scan of subject repo; no writes to subject `tied-project/*.yaml`.

## Risks (advisory)

| Risk | Mitigation |
| --- | --- |
| Regex under-count nested or dynamic tests | Document bounds; WF stack uses flat `it`/`test` |
| Regex over-count in string literals | Strip pass + unit tests with string fixtures |
| Cohort compares pre/post 1.1.0 | Catalog + `validator_version` filter |
