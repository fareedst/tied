# Monolithic Implementation Decisions (STDD 1.0.0 sample)

Sample monolithic implementation-decisions.md for MCP conversion to TIED.

## 1. TIED File Layout and Indexes [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]

**Status**: Implemented

- **Decision**: Implement TIED structure with YAML index files at base path (requirements.yaml, architecture-decisions.yaml, implementation-decisions.yaml) and detail markdown under requirements/, architecture-decisions/, implementation-decisions/.
- **Rationale**: Matches [ARCH-TIED_STRUCTURE]; enables tooling and traceability.
- **Implementation Approach**: Use getBasePath() from TIED_BASE_PATH or default "tied"; resolve index and detail paths relative to base.
- **Token Coverage**: REQ-TIED_SETUP, ARCH-TIED_STRUCTURE, IMPL-TIED_FILES in code and docs.

## 2. Module Validation Implementation [IMPL-MODULE_VALIDATION] [ARCH-MODULE_VALIDATION] [REQ-MODULE_VALIDATION]

**Status**: Active

- **Decision**: For each logical module, implement unit tests with mocks for dependencies; add contract tests at module boundaries; run validation and document results before integration.
- **Rationale**: Fulfills [REQ-MODULE_VALIDATION] and [ARCH-MODULE_VALIDATION].
- **Implementation Approach**: Per-module test directory or suite; mock external deps; validation checklist in implementation-decisions or processes.
- **Token Coverage**: REQ-MODULE_VALIDATION, ARCH-MODULE_VALIDATION, IMPL-MODULE_VALIDATION.

## 3. Monolithic-to-TIED Conversion Tools [IMPL-MCP_CONVERSION] [ARCH-MCP_CONVERSION] [REQ-CONVERSION_TOOL]

**Status**: Implemented

- **Decision**: Implement conversion in mcp-server using parser (parser.ts), YAML generator (yaml-generator.ts), detail markdown generator (detail-generator.ts), and runner (runner.ts). Expose as MCP tools with file_path or content, output_base_path, dry_run, overwrite, token_format.
- **Rationale**: Single code path for CLI and MCP; supports both path and inline content.
- **Implementation Approach**: Tools read file or content, call convertMonolithicRequirements/Architecture/Implementation or convertMonolithicAll; write YAML index and detail .md under output_base_path.
- **Token Coverage**: REQ-CONVERSION_TOOL, ARCH-MCP_CONVERSION, IMPL-MCP_CONVERSION.
