# Monolithic Requirements (STDD 1.0.0 sample)

This file is a sample monolithic requirements document for MCP conversion to TIED.

## [REQ-TIED_SETUP] STDD Methodology Setup

**Priority**: P0 (Critical)
**Category**: Functional
**Status**: Implemented

- **Description**: The project must follow the Token-Integrated Engineering & Development (TIED) methodology, including a specific directory structure (tied/) and documentation files (requirements.yaml, architecture-decisions.yaml, etc.).
- **Rationale**: To ensure traceability of intent from requirements to code and to maintain a consistent development process.
- **Satisfaction Criteria**:
  - tied/ directory exists with proper structure
  - All required documentation files exist and are populated from templates
  - Base files properly configured (.cursorrules, AGENTS.md)
- **Validation Criteria**:
  - Manual verification of file existence
  - AI agent acknowledgment of rules
- **Traceability**: [ARCH-TIED_STRUCTURE] [IMPL-TIED_FILES]

## [REQ-MODULE_VALIDATION] Independent Module Validation Before Integration

**Priority**: P0 (Critical)
**Category**: Core Functional
**Status**: Active

- **Description**: Identify logical modules and their boundaries before implementation. Develop and validate each module independently (unit tests with mocks, contract tests, edge cases, error handling) before integration.
- **Rationale**: Ensures each module is correct in isolation and reduces integration failures.
- **Satisfaction Criteria**:
  - Modules identified and boundaries documented
  - Each module has unit tests and passes before integration
  - Integration only after validation passes
- **Validation Criteria**:
  - Unit test coverage per module
  - Documented validation results
- **Traceability**: [ARCH-MODULE_VALIDATION] [IMPL-MODULE_VALIDATION]

### [REQ-CONVERSION_TOOL] MCP Monolithic-to-TIED Conversion

**Priority**: P1 (Important)
**Category**: Functional
**Status**: Implemented

- **Description**: Provide MCP tools to convert STDD 1.0.0 monolithic requirements.md, architecture-decisions.md, and implementation-decisions.md to TIED v1.5.0+ YAML indexes and detail markdown files.
- **Rationale**: Enables migration of existing STDD projects to TIED without manual extraction.
- **Satisfaction Criteria**:
  - convert_monolithic_requirements, convert_monolithic_architecture, convert_monolithic_implementation available
  - convert_monolithic_all runs all three
  - Output: YAML index + detail .md per token
- **Validation Criteria**:
  - Dry run returns tokens and paths; real run writes files
- **Traceability**: [ARCH-TIED_STRUCTURE]
