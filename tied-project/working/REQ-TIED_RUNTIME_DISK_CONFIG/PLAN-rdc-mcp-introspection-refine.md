---
name: RDC MCP disk introspection
overview: Extend tied_config_get_base_path with disk-resolved store_root, mcp_dist_path, and config_sources under [REQ-TIED_RUNTIME_DISK_CONFIG] (deferred handoff E / NON-TIED plan item E).
todos:
  - id: refine-citdp-tracker
    content: CITDP-RDC-MCP-INTROSPECTION + Tracker; pre_implementation gate
    status: completed
  - id: red-introspection-tests
    content: RED — mcp-server tied-runtime-introspection.test.ts (expects new fields)
    status: completed
  - id: introspection-module
    content: tied-runtime-introspection.ts — bootstrap dynamic import + normalized snapshot
    status: completed
  - id: wire-mcp-tool
    content: Extend tied_config_get_base_path handler; keep backward-compatible keys
    status: completed
  - id: leap-req-sc
    content: LEAP REQ SC-RDC-MCP-INTROSPECTION; ARCH subset note; IMPL pseudo-code block
    status: completed
  - id: docs-readme
    content: mcp-server/README + tied-yaml SKILL tied_config_get_base_path field list
    status: completed
  - id: validate-close
    content: npm test slice; lint_yaml; tied_validate_consistency; verification gate
    status: completed
isProject: true
---

# [REQ-TIED_RUNTIME_DISK_CONFIG] — MCP disk introspection (refined)

**Refined:** 2026-11-03 (`refine-plan`)  
**Parent REQ:** [REQ-TIED_RUNTIME_DISK_CONFIG] — **Implemented**; this slice closes deferred **handoff item E**.  
**CITDP:** [CITDP-RDC-MCP-INTROSPECTION.yaml](./CITDP-RDC-MCP-INTROSPECTION.yaml)  
**Tracker:** [agent-req-implementation-checklist-mcp-introspection.yaml](./agent-req-implementation-checklist-mcp-introspection.yaml)  
**Prior context:** [NON-TIED-ON-DISK-RUNTIME-CONFIG/PLAN.md](../NON-TIED-ON-DISK-RUNTIME-CONFIG/PLAN.md) (introspection row), [session-handoff.md](./evidence/session-handoff.md)

**Depth / gates:** `profile_depth: minimal`, `gate_policy: advisory`, `depth_tier: minimal`  
**Pre-implementation gate:** run after Tracker/CITDP edits.

---

## Refine — selection and RESOLVE

| Deferred item | Drift risk | Selected? |
| --- | --- | --- |
| **MCP introspection** (handoff E) | **Medium** — agents/operators infer paths from env echo; mismatches disk after RDC | **Yes** |
| E2e metrics env LEAP (pass 4) | Test expectation drift only | No (separate slice) |

**Canonical terms**

- **Introspection snapshot** — read-only JSON fragment: `store_root`, `mcp_dist_path`, `config_sources[]` aligned with bootstrap `resolveTiedRuntimeConfig`.
- **config_sources** — ordered labels of which surfaces contributed (e.g. `mcp_json.args[0]`, `mcp_json.env.TIED_STORE_ROOT`, `store_yaml`, `store_local_yaml`, `derived_store_from_dist`); mirrors agentstream `sources` where possible.
- **Corpus path authority** — unchanged: `base_path` / YAML loader still from install-injected `TIED_CLIENT_PROJECT_PATH` (not replaced by introspection).

**Reversible choices (defaults for implement)**

- Add fields alongside existing response; do not rename or remove keys.
- Resolve disk snapshot from `getClientProjectRoot()` + current `process.env` (stdio child env from mcp.json).
- Prefer **dynamic import** of `tools/bootstrap/lib/tied-runtime-config.mjs` from resolved store root when file exists.
- When bootstrap module missing, set `runtime_introspection_status: "unavailable"` and leave new path fields `null` (document in README).

**Costly choice (sponsor accepted in CITDP)**

- MCP server depends on store-repo bootstrap module at runtime for authoritative paths — **accepted** to avoid a third TS duplicate of resolver rules; fixture parity already guards bootstrap vs agentstream.

**Open questions (defaults unless sponsor overrides)**

| Question | Default |
| --- | --- |
| New satisfaction criterion id? | **SC-RDC-MCP-INTROSPECTION** |
| Compare introspection to fixture catalog in tests? | **Yes** — one shared-case smoke via temp dir + tied-cli or in-process handler |
| Update ARCH “intentional subset” line? | **Yes** — LEAP to “MCP layout markers subset; runtime path introspection via SC-RDC-MCP-INTROSPECTION” |

---

## Plan — CITDP summary

### Change definition

| | |
| --- | --- |
| **Current** | `store_root` echoes env; no `mcp_dist_path`; no `config_sources`. |
| **Desired** | Disk-aligned global path fields for debugging and session bootstrap; matches RDC resolver. |

### Impact

| Module | Change |
| --- | --- |
| `mcp-server/src/tied-runtime-introspection.ts` | **New** — resolve snapshot wrapper |
| `mcp-server/src/tied-runtime-introspection.test.ts` | **New** — RED/GREEN |
| `mcp-server/src/tools/index.ts` | Extend `tied_config_get_base_path` handler |
| `tied-project/requirements/REQ-TIED_RUNTIME_DISK_CONFIG.yaml` | Append **SC-RDC-MCP-INTROSPECTION** |
| `tied-project/architecture-decisions/ARCH-TIED_RUNTIME_DISK_CONFIG.yaml` | Narrow “no introspection” wording |
| `tied-project/implementation-decisions/IMPL-TIED_RUNTIME_DISK_CONFIG*` | Pseudo-code block for MCP tool |
| `mcp-server/README.md`, tied-yaml SKILL | Field documentation |

### Success criteria (new)

| ID | Criterion | Metric |
| --- | --- | --- |
| **SC-RDC-MCP-INTROSPECTION** | `tied_config_get_base_path` returns disk-resolved `store_root`, `mcp_dist_path`, and non-empty `config_sources` for monolithic + linked fixture layouts | `mcp-server` unit tests; optional `tied-cli.sh tied_config_get_base_path` smoke |

Existing **SC-RDC-RESOLVE** / **SC-RDC-CONSUMERS** remain satisfied; introspection is observability only.

### Test strategy (RED first)

1. **RED** — Test calls handler helper with materialized fixture tmpdir (reuse `tied-runtime-fixture-loader` via node test subprocess or duplicate minimal mcp.json seed in MCP test).
2. **GREEN** — Implement introspection module + wire tool.
3. **Contract** — Assert `mcp_dist_path` and `store_root` match bootstrap `normalizeResolveSnapshot` for at least one shared catalog case id (`monolithic-mcp`, `linked-client`).
4. **Regression** — Existing `yaml-loader.test.ts` / tool registry tests unchanged.

```bash
cd mcp-server && npm test -- --test-path-pattern=tied-runtime-introspection
tools/bundled-tied-yaml-skill/scripts/tied-cli.sh tied_config_get_base_path '{}'
```

### Response shape (illustrative)

```json
{
  "base_path": "/…/tied-project",
  "project_root": "/…/client",
  "store_root": "/…/store",
  "mcp_dist_path": "/…/mcp-server/dist/index.js",
  "config_sources": ["mcp_json", "mcp_json.env.TIED_STORE_ROOT"],
  "runtime_introspection_status": "ok",
  "env_TIED_STORE_ROOT": "/…/store"
}
```

`env_TIED_STORE_ROOT` and legacy keys remain for stdio debugging; document that **`store_root` / `mcp_dist_path` are disk-authoritative** when `runtime_introspection_status` is `ok`.

### Security / scope

- Read-only; no file writes.
- No operator.local.yaml or secret env keys in output.

### Out of scope

- New MCP tools; tied-layout.ts full parity; resolver semantic changes; e2e pass 4.

---

## Implement — execution order

1. **persist-implementation-records** — LEAP REQ/ARCH/IMPL before RED (SC append + pseudo-code comment block naming [REQ-TIED_RUNTIME_DISK_CONFIG] [ARCH-TIED_RUNTIME_DISK_CONFIG] [IMPL-TIED_RUNTIME_DISK_CONFIG]).
2. **unit-test-red** — failing introspection tests.
3. **unit-test-green** — module + handler.
4. **Docs** — README + SKILL field list.
5. **verification** — `tied_checklist_gate_validate` phase verification; `tied_validate_consistency`.
6. **close-out** — scoped commit under REQ working folder; `@close-out` when sponsor requests.

### Verify (full RDC battery + slice)

```bash
cd mcp-server && npm test -- --test-path-pattern=tied-runtime-introspection
node --test tools/bootstrap/lib/tied-runtime-cross-runtime-parity.test.mjs
```

---

## Gate status

**pre_implementation:** **pass** (`allowed: true`, `depth: minimal`) — 2026-11-03 after CITDP/Tracker authoring.

Implement may proceed with RED tests per todos above. Persist gate receipt under `tied-bundle/working/REQ-TIED_RUNTIME_DISK_CONFIG/gates/` during build-plan if required by close-out runner.
