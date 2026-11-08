# Implementation plan — Bundled skill product release gates (Google Agent Skills Wave 3)

| Field | Value |
| --- | --- |
| **request_token** | `REQ-TIED_BUNDLED_SKILL_PRODUCT_RELEASE` |
| **working_slug** | `REQ-TIED_BUNDLED_SKILL_PRODUCT_RELEASE` |
| **Primary source** | [google-agent-skills-vs-tied-agent-management.md](../../../docs/comparisons/google-agent-skills-vs-tied-agent-management.md) (Wave 3 phases 3–5) |
| **Non-tied handoff** | [PLAN.md](../../non-tied-plans/google-agent-skills-vs-tied/PLAN.md) |
| **Linked Cursor plan** | `/Users/fareed/.cursor/plans/bundled_skill_wave_3_a48fb38f.plan.md` |
| **CITDP** | [CITDP-REQ-TIED_BUNDLED_SKILL_PRODUCT_RELEASE.yaml](../../citdp/CITDP-REQ-TIED_BUNDLED_SKILL_PRODUCT_RELEASE.yaml) |
| **Tracker** | [checklist-tracker.yaml](checklist-tracker.yaml) |
| **Test strategy** | [test-strategy.md](test-strategy.md) |
| **depth_tier** | `minimal` (implementation breadth large; adversarial inquiry not integrated) |
| **gate_policy** | `advisory` (plan); verification via RED e2e + bootstrap tests |
| **profile_depth** | `not_measured` |
| **methodology_surface_change_class** | `prompt_type_workflow` + bootstrap manifest catalog |
| **plan_phase** | `pre-implementation` |

---

## 1. Refine (Touchpoint 1 — RESOLVE)

### Intent authority

- **Sponsor intent:** Ship Google Agent Skills **skill-as-product** discipline on TIED store **bundled** packages: per-skill semver, eval scaffold + staleness receipts, staged CI with optional `/run-evals` — **without** replacing checklist/MCP gate authority.
- **RESOLVE charter:** Catalog field names and slice order may change; intent authority stays compose-don’t-replace.

### RESOLVE table

| External / informal | TIED preferred term / surface | Notes |
| --- | --- | --- |
| Skill semver gate | **Bundled skill product release** harness | `metadata.version` quoted string |
| Eval report on PR | `evals/reports/latest.json` + content hash | Q1 literacy only |
| Six Google gates | Partial overlap with e2e + new validator | No REQ gate replacement |
| `/run-evals` | Optional GitHub workflow | Non-blocking default |

**PRELOAD:** [quality-assurance.md](../../vocab/quality-assurance.md), [prompt-composer.md](../../vocab/prompt-composer.md), [sponsor-agent-relationship.md](../../vocab/sponsor-agent-relationship.md).

### Consequence ladder

| Decision | Ladder | Default |
| --- | --- | --- |
| Baseline `1.0.0` on all bundled skills | Reversible | **Do** |
| Diff-aware semver blocking CI | Costly | **Do** (narrow behavioral globs) |
| Checked-in eval stubs | Reversible | **Do** |
| GH `/run-evals` workflow | Costly | **Do** optional/non-blocking |
| Mandatory LLM eval every PR | Costly | **Do not** |
| Matrix §2 row | Costly | **Defer** |

---

## 2. CITDP

**Record:** [CITDP-REQ-TIED_BUNDLED_SKILL_PRODUCT_RELEASE.yaml](../../citdp/CITDP-REQ-TIED_BUNDLED_SKILL_PRODUCT_RELEASE.yaml)

---

## 3. Compose-don’t-replace contract

| Harness (tune here) | Platform-adjacent authority (do not replace) |
| --- | --- |
| Semver + eval manifest/report staleness on skill paths | Project REQ/ARCH/IMPL via TIED MCP |
| `skill-product-release-validate.mjs` + e2e | `tied_checklist_gate_validate` on REQ tracks |
| Optional heavy eval workflow | `tied_verify`, sponsor consequence ladder |
| Methodology doc `bundled-skill-product-release.md` | LEAP without scoped promotion |

**Non-adoptions:** Google eval pass as Q1 proof; six gates replacing checklist; blocking AI reviewer; 170-skill catalog import; matrix row (separate REQ).

---

## 4. Phased slices (`@build-plan`)

| Order | Slice | Primary deliverable |
| ---: | --- | --- |
| 1 | **A** | [bundled-skill-product-release.md](../../../tied-bundle/docs/bundled-skill-product-release.md); `BUNDLED_SKILL_RELEASE_CATALOG` in [manifest.json](../../../tools/bootstrap/manifest.json) |
| 2 | **B** | RED: `tools/bootstrap/lib/skill-product-release-validate.mjs` + tests; `mcp-server/src/e2e/bundled-skill-product-release.test.ts` |
| 3 | **C** | `metadata.version` + `evals/` stubs on all `tools/bundled-*` skills (~31 roots: prompt-type dirs + standalone + facilitator + tied-yaml) |
| 4 | **D** | PR diff semver script; [.github/workflows/bundled-skill-run-evals.yml](../../../.github/workflows/bundled-skill-run-evals.yml) (`workflow_dispatch` + `/run-evals` comment) |
| 5 | **E** | Update Wave 2 phased table (operator-local comparison); charter cross-link if needed |
| 6 | **F** | `tied_validate_consistency`; vocab RECORD; verification + close-out gates |

**Catalog sources (single manifest key):**

- `PROMPT_TYPE_SKILL_DIRS` → `tools/bundled-prompt-type-skills/<dir>/`
- `BUNDLED_STANDALONE_CLIENT_SKILLS` + `STORE_FACILITATOR_SKILLS` → manifest `storeDir`
- `tools/bundled-tied-yaml-skill/` (explicit entry)

---

## 5. Test strategy

See [test-strategy.md](test-strategy.md). **RED first:** failing bundled-skill-product-release tests before Slice C baselines.

---

## 6. Implement handoff

**Do next:** `@build-plan` on this PLAN after `pre_implementation` gate allowed.

**refine-plan (2026-11-07):** PLAN + CITDP + Tracker + REQ/ARCH/IMPL stubs + IMPL pseudo-code → pre_implementation receipt under `gates/`. No skill body or RED test file edits in refine pass.

**`pre_implementation` gate (2026-11-08):** `tied_checklist_gate_validate` → **`allowed: true`**, `depth: minimal`, `gate_policy: advisory`. Receipt: [pre_implementation-2026-11-08T01-06-54-129Z.json](gates/pre_implementation-2026-11-08T01-06-54-129Z.json).

---

## Plan execution steps (mirror)

1. [ ] Slice A — methodology doc + manifest catalog
2. [ ] Slice B — RED validators and e2e
3. [ ] Slice C — semver + eval tree baselines
4. [ ] Slice D — CI diff gate + optional workflow
5. [ ] Slice E — LEAP compose links (no matrix row)
6. [ ] Slice F — consistency + close-out
