# PLAN — [REQ-TIED_INSTALL_JSON_REFRESH_SEMVER]

**Request token:** `REQ-TIED_INSTALL_JSON_REFRESH_SEMVER`  
**Workflow:** `@add-feature` (Cursor plan) → `@refine-plan` (this pass) → `@build-plan`  
**`plan_phase`:** `pre-implementation`  
**Adversarial depth:** `minimal` · **Gate policy:** `advisory`  
**Execution site:** TIED store repo (bootstrap + MCP)

---

## Problem statement (locked)

After `./tied-install.sh --refresh`, clients inherit current methodology **content** but **`tied-bundle/install.json` often keeps a stale semver pin**. MCP **`server_info`** (`extensions.tied.methodology`) then disagrees with the store release operators expect—especially when:

1. **`writeInstallManifest`** sets **`tied_version`** from **`readTiedVersionFromAgents`**, which prefers **client `AGENTS.md`** over the store ([`install-layers-core.mjs`](../../../tools/bootstrap/lib/install-layers-core.mjs)).
2. The v2 schema field **`store_methodology_version`** ([TWO_FOLDER PLAN](tied-project/working/REQ-TIED_TWO_FOLDER_LAYOUT/PLAN.md) §4.2) is **never written** on install/refresh.
3. **`resolveTiedMethodologyVersion`** walks **client root `VERSION`** before **`install.json`**. Greenfield **`VERSION`** is **create-if-absent** ([`bootstrap.mjs`](../../../tools/bootstrap/lib/bootstrap.mjs)) and **must not** be overwritten on refresh ([REQ-TIED_CLIENT_OPERATOR_TOOLING](tied-project/working/REQ-TIED_CLIENT_OPERATOR_TOOLING/PLAN.md) §3).

**Sponsor choice (locked):** Refresh must **rewrite the install manifest pin from the store**; MCP must **prefer that pin** over a frozen client root **`VERSION`**.

**Related counterexample:** [CITDP-REQ-TRIAL_METHODOLOGY_VERSION_READOUT](tied-project/citdp/CITDP-REQ-TRIAL_METHODOLOGY_VERSION_READOUT.yaml) — *install.json pin disagrees with server_info session capture*.

---

## Scope

| In | Out |
| --- | --- |
| Bootstrap helper + manifest write on every `installTiedLayers` / `--refresh` | Changing client `VERSION` overwrite policy on refresh |
| MCP + CLI semver resolver order | Methodology release semver bump (orthogonal store release REQ) |
| LEAP parent REQ criteria + new REQ/ARCH/IMPL tokens | Trial readout backfill |
| Unit/integration tests (T1–T5) | `tied-project/config.yaml` `methodology.min_version` enforcement |

---

## Locked decisions (refine-plan)

| ID | Decision | Rationale |
| --- | --- | --- |
| **D-MANIFEST-SOURCE** | **`store_methodology_version`** = store root **`VERSION`**, else store **`AGENTS.md`** `**TIED Methodology Version**:`; never client `AGENTS.md` alone | Install witness reflects **store release**, not client prose |
| **D-MANIFEST-FIELDS** | On every successful layer install: set **`store_methodology_version`**, **`tied_version`** (same semver, backward compat), **`installer_version`** (same semver) | Readers use `tied_version` or `store_methodology_version`; v2 schema lists both |
| **D-RESOLVER-ORDER** | Per anchor root: **`install.json`** pin → ancestor **`VERSION`** → **`AGENTS.md`** | Aligns IMPL operator tooling with “what is installed here” |
| **D-CLI-PARITY** | Mirror order in [`scripts/lib/read-tied-methodology-version.mjs`](../../../scripts/lib/read-tied-methodology-version.mjs) | Close-out / agentstream helpers match MCP |
| **D-STORE-SELF** | Store self-refresh continues to write manifest when `installTiedLayers` completes (gitignored on store) | No behavior change for store **mode** without client manifest |
| **D-LEAP-PARENTS** | LEAP satisfaction criteria on **`REQ-TIED_LAYERED_CLIENT_INSTALL`**, **`REQ-TIED_CLIENT_OPERATOR_TOOLING`**, **`REQ-TIED_TWO_FOLDER_LAYOUT`** — do not duplicate full stacks | Single REQ narrative |

---

## Build phases (`@build-plan`)

```mermaid
flowchart LR
  P0[TIED stack REQ ARCH IMPL pseudo]
  P1[S1 bootstrap manifest]
  P2[S2 MCP resolver]
  P3[S3 tests LEAP CHANGELOG]
  P0 --> P1 --> P2 --> P3
```

### Phase 0 — TIED records (before RED)

- Create **`REQ-TIED_INSTALL_JSON_REFRESH_SEMVER`**, **`ARCH-*`**, **`IMPL-*`**, **`semantic-tokens.yaml`** entries via TIED MCP / `tied-cli`.
- LEAP [`IMPL-TIED_LAYERED_CLIENT_INSTALL-pseudocode.md`](tied-project/implementation-decisions/IMPL-TIED_LAYERED_CLIENT_INSTALL-pseudocode.md) — add **`WRITE_INSTALL_MANIFEST`** block for store pin.
- LEAP [`IMPL-TIED_CLIENT_OPERATOR_TOOLING-pseudocode.md`](tied-project/implementation-decisions/IMPL-TIED_CLIENT_OPERATOR_TOOLING-pseudocode.md) — **`READ_METHODOLOGY_SEMVER`** order.
- Draft CITDP → persist under `tied-project/citdp/` at **`persist-citdp-record`** step only.

### Phase 1 — S1 Bootstrap (RED → GREEN)

| File | Change |
| --- | --- |
| **New** [`tools/bootstrap/lib/store-methodology-version.mjs`](../../../tools/bootstrap/lib/store-methodology-version.mjs) | `readStoreMethodologySemver(storeRoot)` |
| [`install-layers-core.mjs`](../../../tools/bootstrap/lib/install-layers-core.mjs) | Replace `readTiedVersionFromAgents` usage in manifest payload |
| **Tests** `store-methodology-version.test.mjs`, extend `install-manifest.test.mjs` / `install-layers-core.test.mjs` | T1, T2, T3 |

### Phase 2 — S2 MCP resolver (RED → GREEN)

| File | Change |
| --- | --- |
| [`mcp-server/src/tied-methodology-version.ts`](../../../mcp-server/src/tied-methodology-version.ts) | Reorder resolution; update `RESOLUTION_ERROR` text |
| [`scripts/lib/read-tied-methodology-version.mjs`](../../../scripts/lib/read-tied-methodology-version.mjs) | Same order |
| [`mcp-server/src/tied-methodology-version.test.ts`](../../../mcp-server/src/tied-methodology-version.test.ts) | T4 + adjust existing cases |

### Phase 3 — S3 Close loop

- Parent REQ criteria LEAP (YAML indexes + detail satisfaction_criteria).
- [`CHANGELOG.md`](../../../CHANGELOG.md) operator note.
- `tied_validate_consistency` · `lint_yaml` on changed project YAML.

---

## Satisfaction criteria (new REQ — draft for build)

| ID | Criterion | Metric |
| --- | --- | --- |
| **SC-IJRS-MANIFEST** | After `tied-install --refresh`, `tied-bundle/install.json` contains **`store_methodology_version`** equal to store **`VERSION`** | `node --test` install-layers / manifest tests |
| **SC-IJRS-RESOLVER** | When client root **`VERSION`** is older than manifest pin, **`resolveTiedMethodologyVersion`** returns manifest semver with **`source: install_json`** | `tied-methodology-version.test.ts` |
| **SC-IJRS-SERVER-INFO** | **`server_info`** `extensions.tied.methodology` matches manifest pin on fixture client | Optional T5 / extend `server-info.test.ts` |

**Parent LEAP (add criterion or extend existing):**

- **`REQ-TIED_LAYERED_CLIENT_INSTALL`** — refresh rewrites install manifest methodology pin from store.
- **`REQ-TIED_CLIENT_OPERATOR_TOOLING`** — resolver order: install.json before VERSION walk (update criterion text if present).
- **`REQ-TIED_TWO_FOLDER_LAYOUT`** — `store_methodology_version` populated on machine-written install config.

---

## Module boundaries

```text
tools/bootstrap/lib/store-methodology-version.mjs   # store semver read
tools/bootstrap/lib/install-layers-core.mjs         # manifest payload
mcp-server/src/tied-methodology-version.ts          # MCP + server_info
scripts/lib/read-tied-methodology-version.mjs       # CLI parity
```

---

## Risk assessment

| Risk | Tier | Mitigation |
| --- | --- | --- |
| Operators treated client root **`VERSION`** as live semver | Reversible | Document; **`install.json`** pin wins in MCP |
| **`tied_version`** meaning shifts from client AGENTS to store pin | Reversible | Set both pin fields; trial skills already label **`store_methodology_version`** |
| Store **`readStoreMethodologySemver`** returns **`unknown`** | Low | Fail manifest write with visible value or doctor hint in follow-up |
| Resolution order change breaks tests assuming VERSION-first | Reversible | Update tests in same PR |

---

## Verification (operator)

```bash
./tied-install.sh --refresh /path/to/client
jq '.store_methodology_version, .tied_version' /path/to/client/tied-bundle/install.json
# tied-cli server_info '{}' | jq '.structuredContent.extensions["tied.methodology"]'
```

---

## Plan-mode handoff

**Next:** `@build-plan` — Phase 0 TIED stack, then S1→S2 RED/GREEN per [test-strategy.md](./test-strategy.md).

**Disk:** [checklist-tracker.yaml](./checklist-tracker.yaml) · [CITDP draft](./CITDP-REQ-TIED_INSTALL_JSON_REFRESH_SEMVER.draft.yaml) · [evidence/session-handoff.md](./evidence/session-handoff.md)
