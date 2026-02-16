# [IMPL-TIED_FILES] TIED File Layout and Indexes

**Cross-References**: [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
**Status**: Implemented
**Created**: 2026-02-16
**Last Updated**: 2026-02-16

---

## Decision

Implement TIED structure with YAML index files at base path (requirements.yaml, architecture-decisions.yaml, implementation-decisions.yaml) and detail markdown under requirements/, architecture-decisions/, implementation-decisions/.

## Rationale

Matches [ARCH-TIED_STRUCTURE]; enables tooling and traceability.

## Implementation Approach

Use getBasePath() from TIED_BASE_PATH or default "tied"; resolve index and detail paths relative to base.



## Code Locations

- See traceability in `implementation-decisions.yaml`


## Token Coverage `[PROC-TOKEN_AUDIT]`

REQ-TIED_SETUP, ARCH-TIED_STRUCTURE, IMPL-TIED_FILES in code and docs.


## Related Decisions

- Depends on: [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
- Supersedes: —
- See also: —



---

## Original section (from monolithic source)

<details>
<summary>Full section content from monolithic source</summary>

````
**Status**: Implemented

- **Decision**: Implement TIED structure with YAML index files at base path (requirements.yaml, architecture-decisions.yaml, implementation-decisions.yaml) and detail markdown under requirements/, architecture-decisions/, implementation-decisions/.
- **Rationale**: Matches [ARCH-TIED_STRUCTURE]; enables tooling and traceability.
- **Implementation Approach**: Use getBasePath() from TIED_BASE_PATH or default "tied"; resolve index and detail paths relative to base.
- **Token Coverage**: REQ-TIED_SETUP, ARCH-TIED_STRUCTURE, IMPL-TIED_FILES in code and docs.
````

</details>


---

*Migrated from monolithic implementation-decisions.md on 2026-02-16. Full section content from monolithic source is included when structured fields were not extracted.*
