# [REQ-CONVERSION_TOOL] MCP Monolithic-to-TIED Conversion

**Category**: Functional
**Priority**: P1 (Important)
**Status**: ✅ Implemented
**Created**: 2026-02-16
**Last Updated**: 2026-02-16

---

## Description

Provide MCP tools to convert STDD 1.0.0 monolithic requirements.md, architecture-decisions.md, and implementation-decisions.md to TIED v1.5.0+ YAML indexes and detail markdown files.

## Rationale

Enables migration of existing STDD projects to TIED without manual extraction.

## Satisfaction Criteria

convert_monolithic_requirements, convert_monolithic_architecture, convert_monolithic_implementation available
convert_monolithic_all runs all three
Output: YAML index + detail .md per token

## Validation Criteria

Dry run returns tokens and paths; real run writes files
## Traceability

- **Architecture**: [ARCH-TIED_STRUCTURE] (see `architecture-decisions.yaml`)
- **Implementation**: — (see `implementation-decisions.yaml`)
- **Tests**: See validation criteria
- **Code**: Annotations `[REQ-CONVERSION_TOOL]`

## Related Requirements

- **Depends on**: None
- **Related to**: —
- **Supersedes**: —

## Other fields (from YAML)

### traceability

[ARCH-TIED_STRUCTURE]



---

## Original section (from monolithic source)

<details>
<summary>Full section content from monolithic source</summary>

````
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
````

</details>


---

*Migrated from monolithic requirements.md on 2026-02-16. Full section content from monolithic source is included when structured fields were not extracted.*
