# Monolithic Architecture Decisions (STDD 1.0.0 sample)

Sample monolithic architecture-decisions.md for MCP conversion to TIED.

## 1. TIED Directory Structure [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]

**Status**: Active

- **Decision**: Use a `tied/` directory at project root containing requirements.yaml, architecture-decisions.yaml, implementation-decisions.yaml, semantic-tokens.yaml, and corresponding detail directories (requirements/, architecture-decisions/, implementation-decisions/).
- **Rationale**: Keeps all TIED artifacts in one place and scales via detail files.
- **Alternatives Considered**: Single monolithic .md files (rejected for scalability).
- **Implementation Approach**: Create tied/ and copy template indexes and guides; populate detail files per token.

## 2. Module Validation Before Integration [ARCH-MODULE_VALIDATION] [REQ-MODULE_VALIDATION]

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
