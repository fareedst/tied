# [ARCH-MODULE_VALIDATION] Module Validation Before Integration

**Cross-References**: [REQ-MODULE_VALIDATION], [REQ-CONVERSION_TOOL]
**Status**: Implemented
**Created**: 2026-02-16
**Last Updated**: 2026-02-16

---

## Decision

Expose STDD-to-TIED conversion via an MCP server (tied-yaml) with tools: convert_monolithic_requirements, convert_monolithic_architecture, convert_monolithic_implementation, convert_monolithic_all.

## Rationale

Enables migration without manual section extraction; Cursor and other MCP clients can invoke conversion.

## Alternatives Considered

Big-bang integration (rejected).

## Implementation Approach

Node.js MCP server using existing parser and YAML/detail generators; file_path or content input; output_base_path configurable.

## Token Coverage `[PROC-TOKEN_AUDIT]`

- [ ] Code and tests carry `[ARCH-MODULE_VALIDATION]` and related tokens

## Validation Evidence `[PROC-TOKEN_VALIDATION]`

| Date | Result | Notes |
|------|--------|-------|
| 2026-02-16 | Migrated | Converted from monolithic |

## Related Decisions

- Depends on: [REQ-MODULE_VALIDATION], [REQ-CONVERSION_TOOL]
- Informs: (see implementation decisions)
- See also: —



---

## Original section (from monolithic source)

<details>
<summary>Full section content from monolithic source</summary>

````
**Status**: Active

- **Decision**: Identify module boundaries first; validate each module with unit tests and mocks before integration. Document validation results.
- **Rationale**: Reduces integration failures and preserves [REQ-MODULE_VALIDATION].
- **Alternatives Considered**: Big-bang integration (rejected).
- **Implementation Approach**: Per-module test suites; contract tests at boundaries; integration only after validation passes.

## MCP Conversion Service [ARCH-MCP_CONVERSION] [REQ-CONVERSION_TOOL]

**Status**: Implemented

- **Decision**: Expose STDD-to-TIED conversion via an MCP server (tied-yaml) with tools: convert_monolithic_requirements, convert_monolithic_architecture, convert_monolithic_implementation, convert_monolithic_all.
- **Rationale**: Enables migration without manual section extraction; Cursor and other MCP clients can invoke conversion.
- **Implementation Approach**: Node.js MCP server using existing parser and YAML/detail generators; file_path or content input; output_base_path configurable.
````

</details>


---

*Migrated from monolithic architecture-decisions.md on 2026-02-16. Full section content from monolithic source is included when structured fields were not extracted.*
