# Test strategy — [REQ-TIED_AGENT_LOADER_REFRESH]

**Profile depth:** `minimal` · **Gate policy:** `advisory`  
**Build order:** TIED pseudo → bootstrap unit RED → integration RED → docs/LEAP GREEN.

---

## Unit — `agent-loader-sync.mjs`

| ID | Scenario | RED assertion |
| --- | --- | --- |
| **T1a** | No client `AGENTS.md` | `action: created`; dest matches store template bytes |
| **T1b** | Client **4.0.0**, store **4.2.1** | `action: updated`; version line **4.2.1** |
| **T1c** | Equal semver | `action: skipped`, reason `equal` |
| **T1d** | Client **4.3.0**, store **4.2.1** | `action: skipped`, reason `client_newer` |
| **T1e** | Client file exists, no version line | `action: updated` (default aggressive) |
| **T1f** | Same as T1b + `preserveAgentLoader: true` | `action: skipped`, dest unchanged |
| **T1g** | Store semver `unknown` | No throw; skip update + diagnostic reason |

Fixtures: temp dirs with minimal `AGENTS.md` bodies containing `**TIED Methodology Version**: X.Y.Z` and store root `VERSION` + `AGENTS.md`.

**Commands:**

```bash
node --test tools/bootstrap/lib/agent-loader-sync.test.mjs
```

---

## Integration — layered install

| ID | Scenario | RED assertion |
| --- | --- | --- |
| **T2a** | Temp client layout; seed stale `AGENTS.md`; `installTiedLayers` with refresh | File updated to store semver |
| **T2b** | Same + `--preserve-agent-loader` | Stale bytes preserved |
| **T2c** | Greenfield (no AGENTS) | Created once; second refresh idempotent |

**Commands:**

```bash
node --test tools/bootstrap/install-layers.integration.test.mjs
```

---

## Operator WARN — drift detection

| ID | Scenario | Assertion |
| --- | --- | --- |
| **T3** | Post-install: `AGENTS.md` 4.0.0 + `install.json` pin 4.2.1 (preserve path) | Bootstrap output includes WARN substring / structured hook test |

Implement via capturing `sayWarn` in unit test or integration stderr assert.

---

## Regression batteries (build close)

```bash
node --test tools/bootstrap/lib/agent-loader-sync.test.mjs
node --test tools/bootstrap/lib/store-methodology-version.test.mjs
node --test tools/bootstrap/install-layers.integration.test.mjs
node --test tools/bootstrap/lib/install-layers-core.test.mjs
```

---

## Security

Read-only store template read; writes only client install-managed `AGENTS.md`. No secrets.

---

## Out of scope for automated tests

- Live refresh of `hl7receiver` (manual operator spot in build optional step).
- `client-refresh-parity-report.json` schema extension (follow-up if needed beyond WARN).
