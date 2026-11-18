# LEAP proposal — MCP npm audit / `glob` migration

**Wave:** `REQ-TIED_MCP_NPM_AUDIT_GLOB`  
**Target stack:** `REQ-TIED_NODE_TOOLCHAIN_DEFAULT` → `ARCH-TIED_NODE_TOOLCHAIN_DEFAULT` → `IMPL-TIED_NODE_TOOLCHAIN_DEFAULT`  
**Apply during:** `@build-plan` Phase 0 (before verification evidence)

---

## Reverse order (LEAP)

### 1. IMPL — `IMPL-TIED_NODE_TOOLCHAIN_DEFAULT`

**Index:** `tied-project/implementation-decisions.yaml`  
**Detail:** `tied-project/implementation-decisions/IMPL-TIED_NODE_TOOLCHAIN_DEFAULT.yaml`

| Field | Proposed change |
| --- | --- |
| `implementation_approach.details` | Add bullet: **`MCP_FILE_GLOB: mcp-server uses glob@^14.0.6 (not fast-glob) for workspace file discovery; call sites use glob/globSync with nodir: true`** |
| `status` | Bump toward `Implemented` only after **T-NPM-TEST-01** + audit witness (verification-gated if enabled) |

**Sidecar:** `tied-project/implementation-decisions/IMPL-TIED_NODE_TOOLCHAIN_DEFAULT-pseudocode.md`

Add block (token comments per [PROC-IMPL_PSEUDOCODE_TOKENS]):

```text
# [IMPL-TIED_NODE_TOOLCHAIN_DEFAULT] [ARCH-TIED_NODE_TOOLCHAIN_DEFAULT] [REQ-TIED_NODE_TOOLCHAIN_DEFAULT]
# MCP_DEPENDENCY_GLOB — replace fast-glob when npm audit flags picomatch chain; keep Node-only test runner unchanged.

PROCEDURE MCP_DEPENDENCY_GLOB
  PRE: mcp-server depends on fast-glob; npm audit reports high picomatch advisories with no non-breaking fix
  DATA: package.json direct dependencies; TypeScript glob call sites; package-lock.json
  CONTROL:
    RUN npm audit fix for hono transitive fixes
    REPLACE fast-glob with glob@^14.0.6 in package.json
    FOR EACH call site: MAP onlyFiles -> nodir; fg.sync -> globSync; await fg -> await glob
  POST: npm audit reports zero vulnerabilities; npm test and tsc pass
  EFFECTS: lockfile updated; bun.lock synced if still published
  FAILURE_MODES: audit fix --force attempted -> ABORT (breaking fast-glob downgrade)
END PROCEDURE
```

Run **`pseudocode_validate`** before tests if block is non-trivial.

---

### 2. ARCH — `ARCH-TIED_NODE_TOOLCHAIN_DEFAULT`

**Optional** — add one-line decision under existing Node-only runner architecture:

- **Decision:** MCP workspace dependency policy prefers **audit-clean** direct deps; accept `glob` as canonical file enumerator until `fast-glob` chain is patched.

Skip if sponsor wants minimal ARCH churn.

---

### 3. REQ — `REQ-TIED_NODE_TOOLCHAIN_DEFAULT`

**Index + detail** `tied-project/requirements/REQ-TIED_NODE_TOOLCHAIN_DEFAULT.yaml`

Append satisfaction criterion:

```yaml
- criterion: "mcp-server npm audit reports no known vulnerabilities at default severity"
  id: SC-NODE-MCP-AUDIT-CLEAN
  metric: "cd mcp-server && npm audit exits 0 with found 0 vulnerabilities"
```

**Related docs LEAP (text only, no frozen evidence edits):**

| Path | Change |
| --- | --- |
| `CHANGELOG.md` | New entry for glob + hono; **edit** recent bullet that still says 3 high `fast-glob` advisories remain |
| `mcp-server/bun.lock` | Align with `glob` if lockfile stays in repo |

---

## CITDP persist (build-plan)

Draft record body for `tied-project/citdp/CITDP-REQ-TIED_MCP_NPM_AUDIT_GLOB.yaml`:

- **change_request_id:** `REQ-TIED_MCP_NPM_AUDIT_GLOB`
- **related_requirements:** `REQ-TIED_NODE_TOOLCHAIN_DEFAULT`
- **verification:** pointers to `evidence/npm-test-audit-witness.md`

---

## Out of scope for LEAP

- New top-level `REQ-TIED_MCP_DEPENDENCY_*` token (unless sponsor promotes audit hygiene to its own REQ)
- Methodology `tied-bundle/` edits
- Bumping `mcp-server` `engines.node` to `>=20` for `@hono/node-server` — flag as **costly choice** in close-out if Node 18 CI still required