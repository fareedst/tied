# Test strategy — [REQ-TIED_ENVIRONMENT_VARIABLE_POLICY]

**Refined:** 2026-11-04 (`refine-plan`)  
**Plan:** [PLAN-refine.md](./PLAN-refine.md)

---

## Manual (design test)

PR / env proposal checklist (copy into CONTRIBUTING or REQ detail):

1. Answer the four **design test** questions in [PRINCIPLE.md](./PRINCIPLE.md).
2. Add or update row in **env catalog** (`docs/tied-first-party-env-catalog.md` — path TBD at implement).
3. Add `env_key` to [env-allowlist.v1.yaml](./env-allowlist.v1.yaml) with `class` and `owner_req`.
4. If operator-facing: ensure **configure_via** appears in `tied-config-report` catalog or document gap.

---

## Automated — SC-EVPOL-INVENTORY (RED first)

**Module:** `tools/bootstrap/lib/tied-env-allowlist-inventory.mjs` (new)  
**Test:** `tools/bootstrap/lib/tied-env-allowlist-inventory.test.mjs`

### Behavior

1. Load `env-allowlist.v1.yaml` from repo (path constant or `TIED_REPO_ROOT` from script anchor only).
2. Walk `scan_roots` under store root; skip paths matching `scan_exclude_globs`.
3. Regex-match `process.env.<IDENT>` and `process.env['<IDENT>']` in file text (same as static inventory; no eval).
4. For each distinct env key referenced in production scan:
   - Must exist in allowlist **or** test fails with file:line listing.
5. Allowlist entries with `class: test_only` must not appear in non-excluded paths (inverse check optional v1.1).

### Fixtures

- **pass:** copy of one small file referencing only `TIED_ENVELOPE_HOOKS` with matching allowlist stub.
- **fail-new-env:** synthetic file with `process.env.TIED_NEW_UNDOCUMENTED`.

### command_seq (evidence)

```bash
node --test tools/bootstrap/lib/tied-env-allowlist-inventory.test.mjs
```

---

## Automated — SC-EVPOL-OBSERVE (mostly satisfied)

**Existing:** [REQ-TIED_CONFIG_REPORT](../../requirements/REQ-TIED_CONFIG_REPORT.yaml) — `tied-config-report.v1` provenance rows.

**v1 gap:** Parent REQ satisfaction cites CONFIG_REPORT metrics; optional LEAP adds cross-link in REQ detail only (no code unless catalog rows missing).

---

## Gap audit — SC-EVPOL-GAP-AUDIT (manual + follow-on)

Inventory MCP tools that mutate behavior based on env without a documented MCP/CLI equivalent (TODO 10-07):

1. Grep `process.env` in `mcp-server/src/tools/index.ts` handler paths (exclude test-only branches).
2. Produce `evidence/mcp-control-env-audit.md` with: tool name, env key, recommended explicit surface or allowlist rationale.
3. Defer code changes to follow-on REQs unless trivial doc-only.

---

## Out of scope (v1)

- Banning all shell `export` in operator docs.
- Scanning `scripts/` root (audit-only note in PLAN).
- Strict block on new env in CI without allowlist update (deferred **strict** tier).
