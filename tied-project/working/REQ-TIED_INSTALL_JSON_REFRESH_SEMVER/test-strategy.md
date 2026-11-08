# Test strategy — [REQ-TIED_INSTALL_JSON_REFRESH_SEMVER]

**Profile depth:** `minimal` · **Gate policy:** `advisory`  
**Build order:** TIED pseudo → bootstrap RED → MCP RED → GREEN full suite for touched areas.

---

## Unit — bootstrap

| ID | Module | RED assertion |
| --- | --- | --- |
| **T1a** | `store-methodology-version.mjs` | Returns semver from store `VERSION` file |
| **T1b** | same | Falls back to store `AGENTS.md` line when `VERSION` missing |
| **T1c** | same | Invalid/missing → `unknown` or throw per IMPL contract |
| **T2** | `writeInstallManifest` / `installTiedLayers` in temp dir | `install.json` has `store_methodology_version` === fixture store `VERSION` |
| **T3** | `refreshInstallFromManifest` | Pre-seed manifest with stale `tied_version`; post-refresh pins match **store** |

**Commands:**

```bash
node --test tools/bootstrap/lib/store-methodology-version.test.mjs
node --test tools/bootstrap/lib/layers/install-manifest.test.mjs
node --test tools/bootstrap/lib/install-layers-core.test.mjs
```

---

## Unit — MCP / CLI

| ID | Module | RED assertion |
| --- | --- | --- |
| **T4** | `tied-methodology-version.test.ts` | Client `VERSION` 4.0.0 + `install.json` `store_methodology_version` 4.2.1 → version **4.2.1**, source **`install_json`** |
| **T4b** | same | No manifest: existing VERSION-walk behavior unchanged |
| **T4c** | `read-tied-methodology-version.mjs` test (add if missing) or shared fixture | CLI order matches MCP |

**Commands:**

```bash
cd mcp-server && npm test -- tied-methodology-version.test.ts
```

---

## Integration / contract (optional GREEN)

| ID | Module | Assertion |
| --- | --- | --- |
| **T5** | `server-info.test.ts` or install integration | `server_info` extension version matches manifest pin on synthetic client layout |

---

## Regression batteries (build close)

```bash
node --test tools/bootstrap/lib/store-methodology-version.test.mjs
node --test tools/bootstrap/lib/install-layers-core.test.mjs
cd mcp-server && npm test -- tied-methodology-version.test.ts server-info.test.ts
```

---

## Security

No auth surface; read-only semver resolution. No new env secrets.

---

## Out of scope for tests

- Full `test-new-tied-client` pipeline smoke (optional manual spot after ship).
- Historical trial readout regeneration.
