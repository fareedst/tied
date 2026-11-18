# Implementation plan — Meta Astryx design system Wave 3 (dual-plane compose)

| Field | Value |
| --- | --- |
| **request_token** | `REQ-TIED_META_ASTRYX_DESIGN_SYSTEM_WAVE3` |
| **working_slug** | `REQ-TIED_META_ASTRYX_DESIGN_SYSTEM_WAVE3` |
| **Primary source** | [meta-astryx-design-system-vs-tied-agent-management.md](../../../docs/comparisons/meta-astryx-design-system-vs-tied-agent-management.md) |
| **Repo capture** | [meta-astryx-design-system.md](../../../docs/comparisons/meta-astryx-design-system.md) |
| **DOC outreach** | [DOC-META-ASTRYX-DESIGN-SYSTEM-COMPARISON](../DOC-META-ASTRYX-DESIGN-SYSTEM-COMPARISON/PLAN-refine-pass1.md) |
| **Non-tied close** | Commit `0e422b84` on `main` (local; see non-tied `session-handoff.md`) |
| **CITDP** | [CITDP-REQ-TIED_META_ASTRYX_DESIGN_SYSTEM_WAVE3.yaml](CITDP-REQ-TIED_META_ASTRYX_DESIGN_SYSTEM_WAVE3.yaml) |
| **Tracker** | [checklist-tracker.yaml](checklist-tracker.yaml) |
| **Test strategy** | [test-strategy.md](test-strategy.md) |
| **IMPL draft (working)** | [IMPL-TIED_META_ASTRYX_DESIGN_SYSTEM_WAVE3-pseudocode.md](IMPL-TIED_META_ASTRYX_DESIGN_SYSTEM_WAVE3-pseudocode.md) |
| **depth_tier** | `minimal` |
| **gate_policy** | `advisory` |
| **methodology_surface_change_class** | `none` |
| **Operator interruption budget** | No default behavior flips; additive docs + checklist |
| **plan_phase** | `closed` |
| **program_phase** | `close-out-complete` (2026-11-17) |

---

## 1. Refine (Touchpoint 1 — RESOLVE)

### Intent authority

- **Sponsor intent:** Wave 3 from Meta Astryx × TIED: **dual-plane literacy** — product design-system **agent instruction** (`AGENTS.md`, `astryx init`, **`current`** knowledge records, vibe-tests) vs TIED **delivery intent** (REQ/ARCH/IMPL, gates, `tied_verify`).
- **refine-plan resolution:** **Slice G (matrix §2 row)** **OutOfScope v1**; **Slice H (vibe-style probes on bundled `AGENTS.md` / agent-inject)** **Defer** → future REQ unless sponsor reopens.
- **Comparison phased table:** Phases 1–3 currently **Defer** in analysis; **build-plan Slice E** sets Phase **1** (taxonomy cross-link) to **Implemented**; Phases **2–3** stay Defer/OutOfScope.

### RESOLVE table

| Astryx / informal | TIED preferred term / surface | Notes |
| --- | --- | --- |
| **Agent-ready DS** | Harness-adjacent **product** instruction plane | Not methodology core |
| **`astryx init` block** | Client skill / rules injection | ≠ `tied-install` gates |
| **`current` record** | REQ/ARCH/IMPL approved detail | **Tension** — authority order explicit |
| **Vibe test** | Instruction QA probe | ≠ `tied_verify` / checklist gates |
| **`pnpm specs:for`** | PRELOAD + impact discovery | Compose literacy |
| **13k+ apps** | **Meta-reported** | **`not_measured`** for TIED |

**PRELOAD:** [harness-platform-taxonomy.md](../../vocab/harness-platform-taxonomy.md), [tied-methodology.md](../../vocab/tied-methodology.md) (`agent-inject`), [sponsor-agent-relationship.md](../../vocab/sponsor-agent-relationship.md).

**Compose authority:** [REQ-TIED_EXTERNAL_SERVICE_COMPARISON](../../requirements/REQ-TIED_EXTERNAL_SERVICE_COMPARISON.yaml), [REQ-TIED_HARNESS_PLATFORM_SEAM](../../requirements/REQ-TIED_HARNESS_PLATFORM_SEAM.yaml).

### Consequence ladder (plan phase)

| Decision | Classification |
| --- | --- |
| Slices A–F doc compose | **Reversible** |
| Matrix §2 row (G) | **Costly** — **OutOfScope v1** |
| Vibe probes / agent-inject e2e (H) | **Costly** — **Defer** |
| `@astryxdesign/*` in stdd core | **Rejected** |

---

## 2. Sponsor intent (Wave 2 → Wave 3)

Wave 3 promotes **dual-plane literacy** from [comparison § Phased recommendations](../../../docs/comparisons/meta-astryx-design-system-vs-tied-agent-management.md#phased-recommendations-doc-first):

| Phase | Outreach action | v1 default |
| --- | --- | --- |
| **1** | `harness-platform-taxonomy.md` cross-link (design-system agent plane) | **In scope** (Slice D; reciprocal Slice E) |
| **2** | Methodology composition matrix §2 row | **OutOfScope** (Slice G — MCM LEAP) |
| **3** | Vibe-style probes for bundled `AGENTS.md` / `agent-inject` | **Defer** (Slice H) |

**Compose-don’t-replace:** Astryx **`current` records** and **vibe-tests** tune **UI product** instruction quality; TIED **gates** and **project YAML** remain authority for delivery intent.

---

## 3. Phased slices (`@build-plan`)

### Slice A — `meta-astryx-ds-agent-plane-compose.md`

**Path:** `tied-bundle/docs/meta-astryx-ds-agent-plane-compose.md`

Mirror [furmanov-factory-profile-compose.md](../../../tied-bundle/docs/furmanov-factory-profile-compose.md):

- Proof boundary (UI DS vs TIED token plane)
- Scope slice table
- `## AGENTS.md and init vs TIED install`
- `## Knowledge records vs token graph`
- `## Vibe tests vs gates`
- Pair-read siblings (Google Agent Skills, Persante, harness docs)
- CITDP `change_definition` prompt stub
- Anti-patterns (vibe pass as verify; records replace YAML)

### Slice B — Client development index

Quick reads row → compose guide + Wave 2 comparison + REQ token.

### Slice C — `ds-agent-plane-operator-checklist.md`

Working folder → committed with REQ; columns: When | Astryx signal | TIED action | Proof artifact.

### Slice D — `harness-platform-taxonomy.md`

Short subsection or cross-link: design-system **product** agent plane vs harness/platform seam; link compose guide + [REQ-TIED_HARNESS_PLATFORM_SEAM](../../requirements/REQ-TIED_HARNESS_PLATFORM_SEAM.yaml).

### Slice E — Comparison reciprocals

- [meta-astryx-design-system-vs-tied-agent-management.md](../../../docs/comparisons/meta-astryx-design-system-vs-tied-agent-management.md): Phase **1** → **Implemented** + `REQ-TIED_META_ASTRYX_DESIGN_SYSTEM_WAVE3` back-link; Phases **2–3** unchanged (Defer).
- Optional: [meta-astryx-design-system.md](../../../docs/comparisons/meta-astryx-design-system.md) **Notes** → compose guide.

### Slice F — Traceability + tests

1. Copy pseudo-code sidecar to `tied-project/implementation-decisions/` at build-plan.
2. `pseudocode_validate` gate_mode — after REQ/ARCH/IMPL on disk.
3. RED `tools/bootstrap/lib/meta-astryx-ds-agent-plane-compose-doc.test.mjs` (pattern: `furmanov-factory-profile-compose-doc.test.mjs`).
4. Mint REQ/ARCH/IMPL via MCP if not done in add-feature; `tied_validate_consistency` for MAA graph.

### Slice G — Matrix §2 row

**OutOfScope v1** — parent MCM LEAP required. Draft in [Appendix A](#appendix-a-deferred-matrix-row-draft).

### Slice H — Vibe-style probes

**Defer** — behavior-changing; separate REQ if sponsored.

---

## 4. Draft satisfaction criteria (author-requirement)

| ID | Criterion | Metric |
| --- | --- | --- |
| SC-MAA-GUIDE | Compose guide + contract test | `meta-astryx-ds-agent-plane-compose-doc.test.mjs` |
| SC-MAA-INDEX | Index Quick reads row | Contract test |
| SC-MAA-CHECKLIST | ds-agent-plane checklist | File + link audit |
| SC-MAA-TAXONOMY | Harness taxonomy cross-link | Marker in test |
| SC-MAA-COMPOSE | Comparison Phase 1 Implemented + backlinks | Link audit |
| SC-MAA-TRACE | Consistency after implement | `tied_validate_consistency` |

---

## 5. refine-plan / build-plan boundary

**Completed (refine-plan pass 1):**

- PLAN slices A–F, G/H disposition, SC-MAA-* table, staging map
- CITDP wrapper (working), IMPL pseudo-code sidecar, test-strategy, tracker through test-strategy
- Slice G **OutOfScope**; Slice H **Defer** locked

**Not yet:**

- REQ/ARCH/IMPL index + detail on disk (mint at build-plan start)
- `pre_implementation` gate **allowed** (depends on author-*; working `pseudocode_validate` **ok** 2026-11-17)

**build-plan owns:** MCP mint, RED contract test, slices A–F, persist CITDP to `tied-project/citdp/`, verification gate, close-out.

---

## 6. Build-plan staging map

| Path | Slice |
| --- | --- |
| `tied-bundle/docs/meta-astryx-ds-agent-plane-compose.md` | A |
| `tied-bundle/docs/client-development-index.md` | B |
| `tied-project/working/REQ-TIED_META_ASTRYX_DESIGN_SYSTEM_WAVE3/ds-agent-plane-operator-checklist.md` | C |
| `tied-project/vocab/harness-platform-taxonomy.md` | D |
| `docs/comparisons/meta-astryx-design-system*.md` | E |
| `tools/bootstrap/lib/meta-astryx-ds-agent-plane-compose-doc.test.mjs` | F |
| `tied-project/requirements*.yaml`, architecture, implementation, semantic-tokens | F |
| `tied-project/implementation-decisions/IMPL-*-pseudocode.md` | F |

---

## Appendix A — Deferred matrix §2 row (draft)

*Do not implement without REQ-TIED_METHODOLOGY_COMPOSITION_MATRIX row-contract LEAP.*

| # | Framework | Loop(s) | Disposition | TIED COG (draft) |
| --- | --- | --- | --- | --- |
| TBD | Meta Astryx agent-ready DS (AGENTS.md / records / vibe compose) | 1–2 | **Composable** | UI instruction plane vs gates/`tied_verify`; pair Google Agent Skills + Persante rows |

---

## 7. Test strategy summary

**File:** [test-strategy.md](test-strategy.md)  
**Contract test:** `tools/bootstrap/lib/meta-astryx-ds-agent-plane-compose-doc.test.mjs`  
**Close:** `tied_validate_consistency` after R+A+I + index updates.

---

## Plan execution steps

**Last updated:** 2026-11-17 · **prompt_type:** refine-plan · **PLAN:** this file

### Required (`@build-plan`)

- [x] `author-requirement` — REQ/ARCH/IMPL via TIED MCP
- [x] `pseudocode_validate` — IMPL sidecar gate_mode
- [x] `implement-slices-a-f` — §3 ([build-plan-handoff.md](evidence/build-plan-handoff.md))
- [x] `persist-citdp-record` — `tied-project/citdp/`
- [x] `tied_validate_consistency` — MAA graph clean; store-wide WF_TRIAL gaps pre-existing
- [ ] `verification-gate` — retry at `@close-out`

### Deferred

- [ ] Slice G — matrix §2 row
- [ ] Slice H — vibe probes

### Do next

**`@close-out`** — verification gate, CHANGELOG, traceable commit when sponsor requests.

---

## Session handoff

See [evidence/session-handoff.md](evidence/session-handoff.md).