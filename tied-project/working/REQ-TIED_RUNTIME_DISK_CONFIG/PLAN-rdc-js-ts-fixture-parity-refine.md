---
name: RDC JS/TS shared runtime fixture parity
overview: Prevent bootstrap vs agentstream resolver drift by committing a shared fixture catalog and a cross-runtime parity gate under [REQ-TIED_RUNTIME_DISK_CONFIG] (post-Implemented hygiene slice).
todos:
  - id: refine-citdp-tracker
    content: CITDP-RDC-FIXTURE-PARITY + Tracker; pre_implementation gate
    status: completed
  - id: red-fixture-manifest
    content: RED — manifest.json + cases/ + tied-runtime-cross-runtime-parity.test.mjs (fails until loader exists)
    status: completed
  - id: fixture-loader
    content: tied-runtime-fixture-loader.mjs — materialize case tmpdir from catalog
    status: completed
  - id: refactor-bootstrap-tests
    content: Migrate tied-runtime-config.test.mjs shared cases to catalog; tag bootstrap-only cases
    status: completed
  - id: refactor-agentstream-tests
    content: Migrate tied-runtime-config.test.ts shared cases to catalog via repo-root path
    status: completed
  - id: ts-probe
    content: tied-runtime-fixture-probe.ts (tsx) — JSON stdout for parity subprocess
    status: completed
  - id: leap-req-sc
    content: LEAP REQ satisfaction_criteria_append SC-RDC-FIXTURE-PARITY; IMPL cross-ref
    status: completed
  - id: validate-close
    content: command_seq green; lint_yaml; tied_validate_consistency; verification gate
    status: completed
isProject: true
---

# [REQ-TIED_RUNTIME_DISK_CONFIG] — JS/TS runtime fixture parity (refined)

**Refined:** 2026-11-03 (`refine-plan`)  
**Parent REQ:** [REQ-TIED_RUNTIME_DISK_CONFIG] — **Implemented**; this slice closes deferred **handoff item 4** (drift prevention).  
**CITDP:** [CITDP-RDC-FIXTURE-PARITY.yaml](./CITDP-RDC-FIXTURE-PARITY.yaml)  
**Tracker:** [agent-req-implementation-checklist-fixture-parity.yaml](./agent-req-implementation-checklist-fixture-parity.yaml)  
**Prior context:** [NON-TIED-ON-DISK-RUNTIME-CONFIG/PLAN.md](../NON-TIED-ON-DISK-RUNTIME-CONFIG/PLAN.md) (Phase 1 fixtures), [session-handoff.md](./evidence/session-handoff.md)

**Depth / gates:** `profile_depth: minimal`, `gate_policy: advisory`, `depth_tier: minimal`  
**Pre-implementation gate:** run after Tracker/CITDP edits; re-run if dispositions change.

---

## Refine — selection and RESOLVE

| Deferred item | Drift risk | Selected? |
| --- | --- | --- |
| **Shared JS/TS fixture parity** (handoff 4) | **High** — two resolvers, duplicated helpers, no shared contract | **Yes** |
| MCP introspection (handoff E) | Low for resolver correctness; observability only | No |
| E2e metrics env LEAP (pass 4) | Test expectation drift, not dual-runtime logic | No (separate slice) |

**Canonical terms**

- **Fixture catalog** — committed tree `tools/bootstrap/fixtures/tied-runtime/` with `manifest.json` and `cases/<id>/`.
- **Shared case set** — manifest entries with `"runtimes": ["bootstrap", "agentstream"]`; both must produce the same normalized resolve snapshot.
- **Bootstrap-only cases** — store yaml refresh, operator flags, fail-closed throws tagged `"runtimes": ["bootstrap"]` only.

**Reversible choices (defaults for implement)**

- Normalize paths in expected JSON with forward slashes + resolved absolute paths before compare.
- Resolve repo root from `import.meta.url` / `__dirname` in loader (not `process.cwd()`).
- Parity subprocess: `npx tsx tools/bootstrap/fixtures/tied-runtime/tied-runtime-fixture-probe.ts <caseId>` from store repo root.

**Costly choice (sponsor accepted in CITDP)**

- Agentstream tests depend on store-repo fixture path under `tools/bootstrap/` (cross-package coupling). Alternative — duplicate fixtures under agentstream — **rejected** because it recreates drift.

---

## Plan — CITDP summary

### Change definition

| | |
| --- | --- |
| **Current** | ~290 lines `.mjs` tests vs ~100 lines `.ts` tests; copy-pasted `seedTiedProject`, `writeFakeMcpDist`, MCP JSON builders; overlapping scenarios with subtle env/path differences. |
| **Desired** | One manifest; loader materializes disk; parity test fails on divergence; existing SCs stay green. |

### Impact

| Module | Change |
| --- | --- |
| `tools/bootstrap/fixtures/tied-runtime/**` | **New** catalog |
| `tools/bootstrap/lib/tied-runtime-fixture-loader.mjs` | **New** loader + normalizer |
| `tools/bootstrap/lib/tied-runtime-cross-runtime-parity.test.mjs` | **New** SC-RDC-FIXTURE-PARITY |
| `tools/bootstrap/lib/tied-runtime-config.test.mjs` | Refactor to catalog |
| `mcp-server/packages/agentstream/src/tied-runtime-config.test.ts` | Refactor shared cases |
| `tied-project/requirements/REQ-TIED_RUNTIME_DISK_CONFIG.yaml` | LEAP append **SC-RDC-FIXTURE-PARITY** |

### Success criteria (new)

| ID | Criterion | Metric |
| --- | --- | --- |
| **SC-RDC-FIXTURE-PARITY** | Shared manifest cases produce identical normalized resolve output from bootstrap `.mjs` and agentstream `.ts` entrypoints | `node --test tools/bootstrap/lib/tied-runtime-cross-runtime-parity.test.mjs` |

Existing **SC-RDC-RESOLVE** / **SC-RDC-CONSUMERS** remain satisfied by refactored tests (same behavior, less duplication).

### Test strategy (RED first)

1. **RED** — Add `manifest.json` with 3 shared cases (`monolithic-mcp`, `linked-client`, `ignore-shell-path-env`) + parity test calling missing loader → fail.
2. **GREEN** — Implement loader + probe; wire parity test.
3. **REFactor** — Move duplicated setup from both test files into catalog; keep bootstrap-only cases inline or as bootstrap-tagged fixtures.
4. **Regression** — Run handoff verify battery + parity.

```bash
node --test tools/bootstrap/lib/tied-runtime-cross-runtime-parity.test.mjs
node --test tools/bootstrap/lib/tied-runtime-config.test.mjs
cd mcp-server/packages/agentstream && npx tsx --test src/tied-runtime-config.test.ts
```

### Fixture case shape (v1)

```
tools/bootstrap/fixtures/tied-runtime/
  manifest.json          # schema_version, cases[]
  cases/
    monolithic-mcp/
      mcp.json.template  # or .cursor/mcp.json relative layout
      env.json             # optional processEnv overlay
      expected.resolve.json  # normalized subset: storeRoot, mcpDistPath, clientProjectPath, ...
    linked-client/
      ...
  tied-runtime-fixture-probe.ts   # tsx entry: read caseId, print JSON
```

**manifest.json** case entry (illustrative):

```json
{
  "id": "linked-client",
  "runtimes": ["bootstrap", "agentstream"],
  "mode": "client",
  "layout": "linked-store"
}
```

Loader copies templates into temp dir, substitutes `{{STORE_ROOT}}` / `{{CLIENT_ROOT}}` tokens, writes fake `mcp-server/dist/index.js`.

### Security / scope

- Fixtures contain **no secrets**; only synthetic paths under `os.tmpdir()` materialization.
- Loader refuses paths outside case temp root when applying templates.

### Out of scope (unchanged non_goals)

- MCP introspection fields on `tied_config_get_base_path`.
- `bootstrap-and-load.test.ts` metrics env expectations (pass 4).

---

## Implement — execution order (when build-plan runs)

Follow [agent-req-implementation-checklist-fixture-parity.yaml](./agent-req-implementation-checklist-fixture-parity.yaml):

1. **author-implementation-records** — LEAP IMPL-TIED_RUNTIME_DISK_CONFIG sidecar note (fixture loader boundary); append REQ SC via MCP.
2. **red-tests** — manifest + parity test + failing loader stub.
3. **implementation** — loader, probe, refactor tests, docs pointer in `tools/bootstrap/README.md` (fixture catalog subsection).
4. **verification** — `tied_checklist_gate_validate` phase `verification`; `tied_verify` with manifest covering **SC-RDC-FIXTURE-PARITY** tokens.
5. **traceable-commit** — single focused commit message: `test(bootstrap): shared RDC fixture parity [REQ-TIED_RUNTIME_DISK_CONFIG]`.

### Parity algorithm (pseudo)

```
FOR each case IN manifest WHERE "bootstrap" AND "agentstream" IN runtimes:
  tmp := loader.materialize(case)
  mjsOut := normalize(resolveTiedRuntimeConfig({ cwd: tmp, ... }))
  tsOut := normalize(JSON.parse(execSync(tsx probe case)))
  ASSERT deepEqual(mjsOut, tsOut)
```

### BBCE slice ownership

| Slice | Owner |
| --- | --- |
| Fixture catalog + loader + parity test | bootstrap `tools/bootstrap/` |
| TS resolver consumer tests | agentstream package (read-only fixture path) |
| REQ/IMPL LEAP | `tied-project/` via tied-cli |

---

## Gate status

| Gate | When | Result |
| --- | --- | --- |
| `pre_implementation` | After refine (2026-11-03) | **allowed** — [pre_implementation-2026-11-03T18-31-27-035Z.json](../../../../tied-bundle/working/REQ-TIED_RUNTIME_DISK_CONFIG/gates/pre_implementation-2026-11-03T18-31-27-035Z.json) |
| `verification` | build-plan 2026-11-03 | **allowed** (minimal; command_seq green) |
| `close_out` | Optional for hygiene slice | pending |

---

## Session handoff hook

After implement: update [session-handoff.md](./evidence/session-handoff.md) — move fixture parity from **Deferred** to **done** with plan link and parity test command.
