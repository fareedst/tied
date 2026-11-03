---
name: TIED runtime disk config + tied-install IMPL LEAP
overview: Promote on-disk runtime configuration to [REQ-TIED_RUNTIME_DISK_CONFIG] and LEAP existing bootstrap IMPL pseudo-code so tied-install behavior (store refresh, legacy .tied/, linked DOCS_TO_COPY self-path) matches documentation. Production code already matches recent fixes; primary work is TIED stack + pseudo-code + validation.
todos:
  - id: citdp-tracker
    content: CITDP + Tracker hydrated; pre_implementation gate allowed (2026-11-03)
    status: completed
  - id: req-arch-impl-runtime
    content: MCP/tied-cli create REQ-TIED_RUNTIME_DISK_CONFIG, ARCH, IMPL sidecar; semantic-tokens; cross-links
    status: completed
  - id: leap-two-folder
    content: LEAP IMPL-TIED_TWO_FOLDER_LAYOUT — IS_STORE_RUNTIME_CONFIG_DIR + DETECT_LEGACY_LAYOUT .tied/ skip; REQ SC-TFL note
    status: completed
  - id: leap-layered
    content: LEAP IMPL-TIED_LAYERED_CLIENT_INSTALL — REFRESH_INSTALL_FROM_MANIFEST storeSelf + INSTALL_METHODOLOGY_LINKED same-path skip
    status: completed
  - id: leap-tied-files
    content: LEAP IMPL-TIED_FILES or bootstrap cross-platform — LINK_OR_MATERIALIZE_COPY same-path no-op
    status: completed
  - id: tests-integration
    content: Add store self-install methodology linked test for SC-LCI-STORE-DOCS if integration file lacks assertion
    status: completed
  - id: validate-close
    content: pseudocode_validate, lint_yaml, tied_validate_consistency, command_seq smoke; persist citdp; session-handoff link
    status: completed
isProject: true
---

# [REQ-TIED_RUNTIME_DISK_CONFIG] + tied-install IMPL alignment (refined pass 2)

**Refined:** 2026-11-03 (pass 2)  
**Prior:** [PLAN-refine-pass1.md](./PLAN-refine-pass1.md)  
**Working token:** `REQ-TIED_RUNTIME_DISK_CONFIG`  
**CITDP:** [CITDP-REQ-TIED_RUNTIME_DISK_CONFIG.yaml](./CITDP-REQ-TIED_RUNTIME_DISK_CONFIG.yaml)  
**Tracker:** [agent-req-implementation-checklist.yaml](./agent-req-implementation-checklist.yaml)

**Depth / gates:** `profile_depth: minimal`, `gate_policy: advisory`  
**Pre-implementation gate:** `allowed: true` (minimal depth; `sub-adversarial-inquiry-pass` not_applicable). Re-run after CITDP/Tracker dispositions change. **MCP note:** pass the **inner** CITDP record to `tied_checklist_gate_validate` (`risk_analysis.adversarial_inquiry` at top level), not only the `CITDP-REQ-*` wrapper key.

---

## Refine — pass 2 (delta from pass 1)

| Topic | Pass 1 | Pass 2 resolution |
| --- | --- | --- |
| **CITDP shape** | Draft missing `risk_analysis.adversarial_inquiry` | Hydrated per checklist gate schema; added `SC-RDC-FAIL-CLOSED`, `SC-RDC-INSTALL-WRITES`; session-handoff verify commands in `evidence.command_seq` |
| **Tracker** | `execution_evidence.completed` only | Authoritative `steps` with evidence_refs; `sub-adversarial-inquiry-pass` not_applicable |
| **LEAP targets** | Token names only | Explicit pseudo-code blocks (table below) tied to code anchors |
| **SC-LCI-STORE-DOCS** | “New integration test” | Prefer extend `install-layers.integration.test.mjs` with store-self + `methodology` layer; fall back to focused unit on `installMethodologyLinked` when `storeDoc === dest` |
| **Git scope** | Implied single PR | Stage runtime + TIED YAML only; exclude unrelated dirty paths per [session-handoff.md](../NON-TIED-ON-DISK-RUNTIME-CONFIG/session-handoff.md) |
| **Deferred** | MCP marker parity | Also defer MCP introspection (handoff E) and TS/JS fixture parity (handoff 4) — capture in `leap-proposals/` or working note if sponsor reopens |

**Costly choices (unchanged — confirm before deviating)**

- Full MCP `detectLegacyLayout` parity with `layout.mjs` (defer; document subset in ARCH/IMPL comment only)
- Separate REQ for store-self DOCS guard (rejected — fold into IMPL LEAP)

---

## Goal

1. **Traceability:** Operator global paths are **install-managed on disk** (`.tied/store.yaml`, `.tied/store.local.yaml`, client MCP JSON), captured in **[REQ-TIED_RUNTIME_DISK_CONFIG]**.
2. **Alignment:** [tied-install](../../../tied-install.sh) behavior in IMPL pseudo-code matches shipped bootstrap, including store refresh with committed `.tied/` and linked methodology docs at canonical paths.

---

## Code anchors (implement pass — read-only verification)

| Behavior | Module | Evidence |
| --- | --- | --- |
| Store `.tied/` not legacy | `isStoreRuntimeConfigDir`, `detectLegacyLayout` | `tools/bootstrap/lib/layout.mjs` |
| Store refresh self-install | `refreshInstallFromManifest` → `allowSelfInstall`, `skipVerify` | `tools/bootstrap/lib/install-layers-core.mjs` |
| DOCS_TO_COPY same-path skip | `installMethodologyLinked` loop | `tools/bootstrap/lib/layers/methodology.mjs` |
| Symlink/copy self-path no-op | `linkOrMaterializeCopy` | `tools/bootstrap/lib/copy-managed.mjs` |
| Resolver + install writer | `tied-runtime-config.mjs`, `layers/mcp.mjs` | Existing unit tests cited in CITDP |

---

## LEAP — pseudo-code blocks to add or amend

| IMPL token | Block | Must reflect |
| --- | --- | --- |
| **IMPL-TIED_TWO_FOLDER_LAYOUT** | `IS_STORE_RUNTIME_CONFIG_DIR` (new) | `schema: tied-store-config.v1` in `.tied/store.yaml` |
| **IMPL-TIED_TWO_FOLDER_LAYOUT** | `DETECT_LEGACY_LAYOUT` | Skip root `.tied/` when store runtime config dir |
| **IMPL-TIED_LAYERED_CLIENT_INSTALL** | `REFRESH_INSTALL_FROM_MANIFEST` (new) | `storeSelf` → `allowSelfInstall: true`, default `skipVerify` |
| **IMPL-TIED_LAYERED_CLIENT_INSTALL** | `INSTALL_METHODOLOGY_LINKED` (new or expand) | Skip `linkOrMaterializeCopy` when `storeDoc` resolves equal to `dest` |
| **IMPL-TIED_FILES** or **ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM** | `LINK_OR_MATERIALIZE_COPY` | Early return when `path.resolve(source) === path.resolve(dest)` |
| **IMPL-TIED_RUNTIME_DISK_CONFIG** | Resolver + install writer procedures | Map to `tied-runtime-config.mjs`, `refreshStoreRuntimeConfig`, MCP JSON env |

Every new/changed block: token comment per [PROC-IMPL_PSEUDOCODE_TOKENS]; Active blocks include PRE/POST/EFFECTS where applicable.

---

## Plan — CITDP summary

| Area | Change |
| --- | --- |
| **change_definition** | Shipped bootstrap; missing project REQ/ARCH/IMPL; IMPL drift on four behaviors above |
| **impact** | `tied-project/{requirements,architecture-decisions,implementation-decisions}/*`, optional `install-layers.integration.test.mjs` |
| **risk** | Low — YAML + pseudo-code + tests; code pre-verified |
| **test-strategy** | Unit battery + optional one integration case; bootstrap-and-load from handoff |

Full record: [CITDP-REQ-TIED_RUNTIME_DISK_CONFIG.yaml](./CITDP-REQ-TIED_RUNTIME_DISK_CONFIG.yaml).

---

## Test strategy (acceptance)

| ID | Criterion | Metric / file |
| --- | --- | --- |
| **SC-RDC-RESOLVE** | Client resolves MCP dist + corpus from MCP JSON | `tied-runtime-config.test.mjs`, `tied-cli-invoke.test.mjs` |
| **SC-RDC-STORE** | Store from `.tied/store.yaml` + local overlay | `tied-runtime-config.test.mjs` |
| **SC-RDC-REFRESH** | MCP refresh writes/updates `store.local.yaml` | `mcp-layer.test.mjs` |
| **SC-RDC-IGNORE-ENV** | Shell global path env ignored | `tied-runtime-config.test.mjs` |
| **SC-RDC-FAIL-CLOSED** | Missing config surfaces → diagnostic + non-zero | `tied-runtime-config.test.mjs` |
| **SC-RDC-INSTALL-WRITES** | Install refresh updates on-disk paths | `mcp-layer.test.mjs`, smoke `./tied-install.sh --refresh .` |
| **SC-TFL-STORE-TIED** | Store runtime `.tied/` not legacy | `layout.test.mjs` |
| **SC-LCI-STORE-DOCS** | Store self linked methodology does not delete canonical DOCS | **New/extended** integration test + `copy-managed.test.mjs` |
| **SC-LCI-REFRESH-SMOKE** | Store refresh exits 0 | CITDP `evidence.command_seq` |

**NON-TIED AC → SC map:** AC-RESOLVE → SC-RDC-RESOLVE; AC-STORE → SC-RDC-STORE; AC-IGNORE-ENV → SC-RDC-IGNORE-ENV; AC-FAIL-CLOSED → SC-RDC-FAIL-CLOSED; AC-INSTALL-WRITES → SC-RDC-INSTALL-WRITES.

---

## Implement — ordered checklist

Follow Tracker from **persist-requirement-records** onward (Refine + Plan steps complete in Tracker).

1. **persist-requirement-records** — `tied_token_create_with_detail` or MCP detail create for **[REQ-TIED_RUNTIME_DISK_CONFIG]**; satisfaction criteria from table above; `depends_on` / `related_to` as in pass 1.
2. **persist-architecture-records** — **[ARCH-TIED_RUNTIME_DISK_CONFIG]** (resolver surfaces, install writer, intentional MCP subset comment).
3. **persist-implementation-records** — **[IMPL-TIED_RUNTIME_DISK_CONFIG]** sidecar + LEAP edits to IMPL-TIED_TWO_FOLDER_LAYOUT, IMPL-TIED_LAYERED_CLIENT_INSTALL, IMPL-TIED_FILES; light ARCH yaml on affected tokens.
4. **gate-pseudocode-validation** — `pseudocode_validate` on all touched sidecars (after LEAP drafts).
5. **three-way-alignment-unit** — Extend integration test if SC-LCI-STORE-DOCS still unproven.
6. **sync-tied-stack** — `lint_yaml`; `tied_validate_consistency`.
7. **verification-gate** — Run CITDP `evidence.command_seq`; `tied_verify` if verification-gated.
8. **persist-citdp-record** — Copy to `tied-project/citdp/CITDP-REQ-TIED_RUNTIME_DISK_CONFIG.yaml` after green validation.
9. **traceable-commit** — Vocab VALIDATE; update [session-handoff.md](../NON-TIED-ON-DISK-RUNTIME-CONFIG/session-handoff.md) with REQ link.

**LEAP rule:** Code ≠ pseudo-code → update **IMPL first**, then tests, then ARCH/REQ if scope changes.

---

## REQ LEAP amendments (existing tokens)

- **[REQ-TIED_TWO_FOLDER_LAYOUT]:** Clarify **SC-TFL-NO-LEGACY-TIED-DIR** — exempt store runtime `.tied/` when `tied-store-config.v1` present.
- **[REQ-TIED_LAYERED_CLIENT_INSTALL]:** Add **SC-LCI-STORE-DOCS** (and optional **SC-LCI-STORE-REFRESH** wording) in same PR if sponsor accepts new SC IDs.

---

## Out of scope

- Re-implementing resolver/CLI/agentstream (shipped in NON-TIED pass).
- MCP `tied-layout.ts` full marker parity; MCP config introspection extension (handoff E).
- Unrelated workspace dirty files (fixtures drift, source-graph reports, etc.).

---

## Tracker / gate status

| Step | Disposition |
| --- | --- |
| change-definition, impact-discovery, risk-assessment, test-strategy | completed (evidence → this plan + CITDP) |
| sub-adversarial-inquiry-pass | not_applicable (minimal depth) |
| gate-pseudocode-validation | **pending** until LEAP sidecars drafted |
| Implement + verification | **pending** |

**Next workflow:** `build-plan` or direct implement using this plan link.
