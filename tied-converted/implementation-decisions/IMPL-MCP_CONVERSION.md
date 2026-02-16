# [IMPL-MCP_CONVERSION] Monolithic-to-TIED Conversion Tools

**Cross-References**: [ARCH-MCP_CONVERSION] [REQ-CONVERSION_TOOL]
**Status**: Implemented
**Created**: 2026-02-16
**Last Updated**: 2026-02-16

---

## Decision

Implement conversion in mcp-server using parser (parser.ts), YAML generator (yaml-generator.ts), detail markdown generator (detail-generator.ts), and runner (runner.ts). Expose as MCP tools with file_path or content, output_base_path, dry_run, overwrite, token_format.

## Rationale

Single code path for CLI and MCP; supports both path and inline content.

## Implementation Approach

Tools read file or content, call convertMonolithicRequirements/Architecture/Implementation or convertMonolithicAll; write YAML index and detail .md under output_base_path.



## Code Locations

- See traceability in `implementation-decisions.yaml`


## Token Coverage `[PROC-TOKEN_AUDIT]`

REQ-CONVERSION_TOOL, ARCH-MCP_CONVERSION, IMPL-MCP_CONVERSION.


## Related Decisions

- Depends on: [ARCH-MCP_CONVERSION] [REQ-CONVERSION_TOOL]
- Supersedes: —
- See also: —



---

## Original section (from monolithic source)

<details>
<summary>Full section content from monolithic source</summary>

````
**Status**: Implemented

- **Decision**: Implement conversion in mcp-server using parser (parser.ts), YAML generator (yaml-generator.ts), detail markdown generator (detail-generator.ts), and runner (runner.ts). Expose as MCP tools with file_path or content, output_base_path, dry_run, overwrite, token_format.
- **Rationale**: Single code path for CLI and MCP; supports both path and inline content.
- **Implementation Approach**: Tools read file or content, call convertMonolithicRequirements/Architecture/Implementation or convertMonolithicAll; write YAML index and detail .md under output_base_path.
- **Token Coverage**: REQ-CONVERSION_TOOL, ARCH-MCP_CONVERSION, IMPL-MCP_CONVERSION.
````

</details>


---

*Migrated from monolithic implementation-decisions.md on 2026-02-16. Full section content from monolithic source is included when structured fields were not extracted.*
