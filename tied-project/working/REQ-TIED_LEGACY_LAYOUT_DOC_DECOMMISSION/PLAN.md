# PLAN — [REQ-TIED_LEGACY_LAYOUT_DOC_DECOMMISSION]

**Status:** Implemented (build-plan, 2026-10-19)  
**Profile depth:** `minimal` · **Gate policy:** standard checklist (no integrated adversarial inquiry)  
**Depends on:** [REQ-TIED_TWO_FOLDER_LAYOUT](../../requirements/REQ-TIED_TWO_FOLDER_LAYOUT.yaml), [REQ-TIED_STORE_README_OPERATOR_DELIVERY_SPINE](../../requirements/REQ-TIED_STORE_README_OPERATOR_DELIVERY_SPINE.yaml)

---

## 1. Change definition

| Field | Content |
| --- | --- |
| **Current** | Live operator/agent docs describe a **legacy top-level `tied/`** client layout and **`tied-install --migrate-layout`** as the brownfield entry path, implying external legacy clients exist. Checklist prose still says **`./tied/`** for project YAML. |
| **Desired** | **User-facing prose** (markdown + checklist YAML on live surfaces) assumes only **`tied-project/` + `tied-bundle/`** with **`TIED_BASE_PATH` → `tied-project/`**. No **`--migrate-layout`** in markdown; flag remains on **`tied-install --help`** only. |
| **Non-goals** | Remove CLI `--migrate-layout`; change MCP dual-read / `LEGACY_LAYOUT_DETECTED`; rewrite historical `tied-project/working/**` PLAN/CITDP archives; edit REQ satisfaction criteria that assert migrate **behavior** (e.g. [REQ-TIED_TWO_FOLDER_LAYOUT](../../requirements/REQ-TIED_TWO_FOLDER_LAYOUT.yaml)). |

**Sponsor constraints (locked):**

- No **`--migrate-layout`** in any **markdown** (including [tools/bootstrap/README.md](../../../tools/bootstrap/README.md)).
- No narrative that third-party / “in the wild” legacy **`tied/`** clients exist (sponsor-operated repos only).

---

## 2. CITDP (analysis — persist at close-out)

**Impact**

- **Docs:** README Band 1/3, AGENTS.md, tied-bundle Core seven corpus, vocab, bundled tied-yaml skill, mcp-server README, bootstrap README.
- **Tooling docs sync:** [render-install-resource-matrix.mjs](../../../tools/bootstrap/lib/render-install-resource-matrix.mjs) + [install-resource-matrix.md](../REQ-TIED_LAYERED_CLIENT_INSTALL/install-resource-matrix.md) (matrix is operator doc; sync check currently **requires** `--migrate-layout` in text — must LEAP).
- **Tests:** [lint-stale-layout.mjs](../../../tools/bootstrap/lib/lint-stale-layout.mjs), [store-readme-structure.test.ts](../../../mcp-server/src/store-readme-structure.test.ts), optional fixture test for new patterns.
- **LEAP:** [REQ-TIED_STORE_README_OPERATOR_DELIVERY_SPINE](../../requirements/REQ-TIED_STORE_README_OPERATOR_DELIVERY_SPINE.yaml) `SC-README-INSTALL-HELP` ( **`--refresh` + `--help`**, not migrate).

**Risks**

| ID | Risk | Ladder | Mitigation |
| --- | --- | --- | --- |
| R1 | New lint flags REQ YAML or `.mjs` CLI sources | Costly if wrong scope | Restrict **doc-decommission** patterns to **`.md` / `.yaml` / `.yml`** on prose roots; keep existing `STALE_LAYOUT_PATTERNS` for `.mjs`/`.ts`; allowlist `tied-project/requirements/**`, `citdp/**`, `architecture-decisions/**`, `implementation-decisions/**` for `--migrate-layout` **criteria text** only. |
| R2 | mcp-server README vs `feedback.yaml` path | Reversible | `feedback.ts` resolves `{TIED_BASE_PATH}/feedback.yaml` — document as **`tied-project/feedback.yaml`** (base path is project root). |
| R3 | Matrix generator drift | Reversible | Update `verifyInstallResourceMatrixDoc` required tokens: drop `--migrate-layout`; require `tied-project`, `tied-bundle`, `tied-install`, `--refresh` (or `--help`). Regenerate matrix body accordingly. |

**Test strategy**

1. **Unit:** Extend `lint-stale-layout.test.mjs` — planted `.md` with `legacy \`tied/\`` and `--migrate-layout` fails; `.mjs` with same strings passes; REQ detail yaml with criterion text passes via allowlist.
2. **Contract:** `store-readme-structure.test.ts` — forbid legacy layout + migrate substrings; require `--refresh` and `tied-install.sh --help`.
3. **Regression:** `node tools/bootstrap/lint-stale-layout.mjs` (full live surfaces, existing patterns).
4. **Integration (optional):** `render-install-resource-matrix.mjs` exit 0 after matrix edit.
5. **Close-out:** `tied_validate_consistency`.

**Gate:** Run `tied_checklist_gate_validate` `phase: pre_implementation` with Tracker + draft CITDP **before** RED tests.

---

## 3. Enforcement design (refined)

### 3.1 Two lint layers (avoid R1)

| Layer | Files | Patterns |
| --- | --- | --- |
| **A — existing** | Live roots, all scanned extensions | `copy_files`, `tied/docs`, etc. (unchanged) |
| **B — doc decommission (new)** | Same roots, **only** `.md`, `.yaml`, `.yml` | `legacy_tied_dir_narrative`, `migrate_layout_markdown` |

**Allowlist additions** ([stale-layout-allowlist.mjs](../../../tools/bootstrap/lib/stale-layout-allowlist.mjs)):

- `tied-project/requirements/**`, `tied-project/citdp/**`, `tied-project/architecture-decisions/**`, `tied-project/implementation-decisions/**` — pattern `migrate_layout_markdown` only (behavioral REQ/CITDP truth).
- `tied-project/working/**` — skipped already by `SKIP_PATH_RE`; no change.

**Do not** ban `--migrate-layout` inside `.mjs`/`.ts` (CLI, tests, `tied-install-help.mjs`).

### 3.2 README structure test

- Remove `--migrate-layout` from `REQUIRED_SUBSTRINGS`.
- Add `FORBIDDEN_DOC_PATTERNS` aligned with layer B (legacy `tied/` layout phrasing + `--migrate-layout`).

---

## 4. File manifest (live surfaces — implement in this order)

### 4.1 Store spine

- [README.md](../../../README.md) — Band 1 spine, Brownfield table (drop legacy row; keep EASAR/OEE/refresh), Getting started, Primary repo (delete **Brownfield layout** H3), MCP prose.

### 4.2 Agent + bootstrap

- [AGENTS.md](../../../AGENTS.md)
- [tools/bootstrap/README.md](../../../tools/bootstrap/README.md) — prose only; Windows smoke may say “layout migration integration step” without flag name.

### 4.3 Methodology corpus (`tied-bundle/docs`)

- [working-artifact-placement.md](../../../tied-bundle/docs/working-artifact-placement.md)
- [request-evidence-envelope.md](../../../tied-bundle/docs/request-evidence-envelope.md)
- [processes.md](../../../tied-bundle/docs/processes.md)
- [ai-principles.md](../../../tied-bundle/docs/ai-principles.md), [ai-agent-tied-mcp-usage.md](../../../tied-bundle/docs/ai-agent-tied-mcp-usage.md)
- [pseudocode-writing-and-validation.md](../../../tied-bundle/docs/pseudocode-writing-and-validation.md)
- [yaml-update-mcp-runbook.md](../../../tied-bundle/docs/yaml-update-mcp-runbook.md)
- [evidence-chain-profile.md](../../../tied-bundle/docs/evidence-chain-profile.md)
- [agent-req-implementation-checklist.yaml](../../../tied-bundle/docs/agent-req-implementation-checklist.yaml) — `./tied/` → `./tied-project/` (~37)
- [agent-req-implementation-checklist.md](../../../tied-bundle/docs/agent-req-implementation-checklist.md) — `./tied/` → `./tied-project/` (3)
- [templates/processes.md](../../../tied-bundle/templates/processes.md)

### 4.4 Skills + MCP readme

- [tools/bundled-tied-yaml-skill/SKILL.md](../../../tools/bundled-tied-yaml-skill/SKILL.md)
- [mcp-server/README.md](../../../mcp-server/README.md) — line 10 `tied/` → `tied-project/`; tool table paths; feedback under project base path.

### 4.5 Vocab (RECORD + VALIDATE at commit)

- [tied-project/vocab/tied-methodology.md](../../vocab/tied-methodology.md) — remove **layout migration** row; fix **install manifest** `tied/.tied-install.json` → **`tied-bundle/install.json`**; two-folder invariant without “after migrate”; primary repo without legacy `tied/`.
- [tied-project/vocab/tied-yaml-mcp.md](../../vocab/tied-yaml-mcp.md)

### 4.6 Tooling sync (same PR)

- [render-install-resource-matrix.mjs](../../../tools/bootstrap/lib/render-install-resource-matrix.mjs) — `verifyInstallResourceMatrixDoc` required tokens.
- [install-resource-matrix.md](../REQ-TIED_LAYERED_CLIENT_INSTALL/install-resource-matrix.md) — drop migrate row/example; align with new verify.

### 4.7 Optional (not in stale-layout roots; sponsor asked “other documentation”)

- [docs/methodologies/evidence-assured-software-architecture-recovery.md](../../../docs/methodologies/evidence-assured-software-architecture-recovery.md) — one migrate sentence (~630): point to **`tied-project/working/`** only.
- **Skip:** `tied-project/working/**` archived PLANs, CITDP histories, CHANGELOG past entries (add new CHANGELOG bullet only).

### 4.8 MCP tool descriptions (if layer B scans `mcp-server/src`)

- [mcp-server/src/tools/index.ts](../../../mcp-server/src/tools/index.ts) — user-visible strings mentioning `tied/feedback.yaml` or `tied/features` → **`tied-project/`**-relative wording (verify feature path in code during implement).

---

## 5. Traceability stack (create before RED)

| Token | Role |
| --- | --- |
| **REQ-TIED_LEGACY_LAYOUT_DOC_DECOMMISSION** | Doc-only satisfaction: no legacy client narrative / no migrate in prose surfaces. |
| **ARCH-TIED_LEGACY_LAYOUT_DOC_DECOMMISSION** | Layer A+B lint + README test + LEAP spine REQ. |
| **IMPL-TIED_LEGACY_LAYOUT_DOC_DECOMMISSION** | Sidecar: `LINT_DOC_DECOMMISSION_PATTERNS`, checklist path rewrite, matrix verify LEAP. |

Cross-update **semantic-tokens.yaml** indexes.

---

## 6. Implement sequence (correct gate order)

1. Copy Tracker → `tied-project/working/REQ-TIED_LEGACY_LAYOUT_DOC_DECOMMISSION/checklist-tracker.yaml`.
2. Draft CITDP → gate **`pre_implementation`** (Tracker + CITDP).
3. Create REQ/ARCH/IMPL + sidecar (block token comments).
4. **RED:** lint B + README structure tests (+ matrix verify if changed).
5. **GREEN:** file manifest §4.
6. LEAP REQ-TIED_STORE_README_OPERATOR_DELIVERY_SPINE (+ detail if needed).
7. CHANGELOG entry (docs assume two-folder only).
8. Persist `tied-project/citdp/CITDP-REQ-TIED_LEGACY_LAYOUT_DOC_DECOMMISSION.yaml`; verification gate + `tied_validate_consistency`.

---

## 7. Verification commands

```bash
node tools/bootstrap/lint-stale-layout.mjs
node --import tsx --test mcp-server/src/store-readme-structure.test.ts
node --import tsx --test tools/bootstrap/lib/lint-stale-layout.test.mjs
node tools/bootstrap/lib/render-install-resource-matrix.mjs
.cursor/skills/tied-yaml/scripts/tied-cli.sh tied_validate_consistency
```

Manual prose sweep (markdown only):

```bash
rg '--migrate-layout|legacy `tied/|legacy \*\*`tied/' \
  README.md AGENTS.md tools/bootstrap/README.md tied-bundle/docs \
  tied-project/vocab tools/bundled-tied-yaml-skill/SKILL.md mcp-server/README.md
```

Expect **no matches** (REQ/CITDP detail paths excluded).

---

## 8. Brownfield table semantics (after edit)

Keep section for **existing product repos** adopting TIED without implying legacy layout:

| Situation | Start here |
| --- | --- |
| Methodology refresh | methodology-migration.md + `--refresh` |
| Architecture recovery | EASAR doc |
| External workflows | OEE doc |

Remove **Legacy `tied/` layout** row entirely.

---

## 9. Costly choice (sponsor — default proceed)

**Include matrix generator LEAP in the same change** (recommended): avoids `verifyInstallResourceMatrixDoc` failing after doc sweep. Alternative: defer matrix edit and allowlist matrix path temporarily — **not recommended** (split enforcement).

Default: **proceed with §4.6 in same PR.**
