# [ARCH-TIED_STRUCTURE] TIED Directory Structure

**Cross-References**: [REQ-TIED_SETUP]
**Status**: Active
**Created**: 2026-02-16
**Last Updated**: 2026-02-16

---

## Decision

Use a `tied/` directory at project root containing requirements.yaml, architecture-decisions.yaml, implementation-decisions.yaml, semantic-tokens.yaml, and corresponding detail directories (requirements/, architecture-decisions/, implementation-decisions/).

## Rationale

Keeps all TIED artifacts in one place and scales via detail files.

## Alternatives Considered

Single monolithic .md files (rejected for scalability).

## Implementation Approach

Create tied/ and copy template indexes and guides; populate detail files per token.

## Token Coverage `[PROC-TOKEN_AUDIT]`

- [ ] Code and tests carry `[ARCH-TIED_STRUCTURE]` and related tokens

## Validation Evidence `[PROC-TOKEN_VALIDATION]`

| Date | Result | Notes |
|------|--------|-------|
| 2026-02-16 | Migrated | Converted from monolithic |

## Related Decisions

- Depends on: [REQ-TIED_SETUP]
- Informs: (see implementation decisions)
- See also: —



---

## Original section (from monolithic source)

<details>
<summary>Full section content from monolithic source</summary>

````
**Status**: Active

- **Decision**: Use a `tied/` directory at project root containing requirements.yaml, architecture-decisions.yaml, implementation-decisions.yaml, semantic-tokens.yaml, and corresponding detail directories (requirements/, architecture-decisions/, implementation-decisions/).
- **Rationale**: Keeps all TIED artifacts in one place and scales via detail files.
- **Alternatives Considered**: Single monolithic .md files (rejected for scalability).
- **Implementation Approach**: Create tied/ and copy template indexes and guides; populate detail files per token.
````

</details>


---

*Migrated from monolithic architecture-decisions.md on 2026-02-16. Full section content from monolithic source is included when structured fields were not extracted.*
