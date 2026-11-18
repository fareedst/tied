# Implementation plan — Farley executable spec Wave 3 (compose + MCM row 21)

| Field | Value |
| --- | --- |
| **request_token** | `REQ-TIED_FARLEY_EXECUTABLE_SPEC_WAVE3` |
| **working_slug** | `REQ-TIED_FARLEY_EXECUTABLE_SPEC_WAVE3` |
| **Primary source** | [dave-farley-spec-must-be-executable-vs-tied-agent-management.md](../../../docs/comparisons/dave-farley-spec-must-be-executable-vs-tied-agent-management.md) |
| **Stub capture** | [dave-farley-spec-must-be-executable.md](../../../docs/comparisons/dave-farley-spec-must-be-executable.md) |
| **DOC outreach** | [DOC-FARLEY-EXECUTABLE-SPEC-COMPARISON](../DOC-FARLEY-EXECUTABLE-SPEC-COMPARISON/PLAN-refine-pass1.md) |
| **Non-tied close** | Commit `91436421` (Waves 1–2) |
| **CITDP** | [CITDP-REQ-TIED_FARLEY_EXECUTABLE_SPEC_WAVE3.yaml](CITDP-REQ-TIED_FARLEY_EXECUTABLE_SPEC_WAVE3.yaml) |
| **Tracker** | [checklist-tracker.yaml](checklist-tracker.yaml) |
| **Test strategy** | [test-strategy.md](test-strategy.md) |
| **IMPL draft (working)** | [IMPL-TIED_FARLEY_EXECUTABLE_SPEC_WAVE3-pseudocode.md](IMPL-TIED_FARLEY_EXECUTABLE_SPEC_WAVE3-pseudocode.md) |
| **depth_tier** | `minimal` |
| **gate_policy** | `advisory` |
| **methodology_surface_change_class** | `none` |
| **Operator interruption budget** | Additive docs + matrix §2 row 21 + MCM LEAP 20→21; no Farley skill/course in stdd |
| **plan_phase** | `post-build` |
| **program_phase** | `build-plan-complete` (2026-11-17) |

---

## 1. Refine (Touchpoint 1 — RESOLVE)

### Intent authority

- **Sponsor intent:** Wave 3 Phase **1** from Farley × TIED: **executable behavioral contract** literacy (acceptance/BDD product plane vs TIED token + pseudo-code + gates); **methodology composition matrix §2 row 21** (sponsor confirmed — LangChain-goal pattern).
- **refine-plan resolution:** Vocab RECORD (`executable behavioral contract`) **Defer** v1; Farley commercial ATDD skill **OutOfScope**; protected-spec filesystem CI **Rejected** v1.
- **Distinct from §2 row 6:** Row **6** = ATDD **upstream heritage** + agentstream path; row **21** = **agent-era** Farley advocacy (markdown SDD insufficiency, red acceptance, protected tests) — pair row **5** (Spec Kit) and row **6** in sponsor_notes only.
- **Distinct from AI-SDLC factory comparison:** Essay pedagogy here; [factory comparison](../../../docs/comparisons/ai-sdlc-atdd-software-factory-vs-tied.md) owns protected `spec/` + run records — cross-link only.

### RESOLVE table

| Farley / informal | TIED preferred term / surface | Notes |
| --- | --- | --- |
| **Executable specification** | REQ criteria + RED tests + IMP **essence_pseudocode** | Compose literacy |
| **Markdown SDD** | Plan/wiki markdown without red | Anti-pattern catalog |
| **Four-layer ATDD** | Unit / composition / E2E justification | [PROC-TIED_DEV_CYCLE](../../../tied-bundle/docs/processes.md) |
| **Protected acceptance tests** | Sponsor **agency boundary**; AI-SDLC GUARD analog | **Composable** |
| **Red before agent** | RED TDD + [pre-handoff charter](../../../tied-bundle/docs/pre-handoff-verification-charter.md) | **Align** |
| **Gherkin as SoT** | Client product layer | **Defer** as methodology core |
| **Farley course / skill** | **Farley-reported** | **OutOfScope** |

**PRELOAD:** [quality-assurance.md](../../vocab/quality-assurance.md), [pseudocode-and-citdp.md](../../vocab/pseudocode-and-citdp.md), [sponsor-agent-relationship.md](../../vocab/sponsor-agent-relationship.md).

**Compose authority:** [REQ-TIED_EXTERNAL_SERVICE_COMPARISON](../../requirements/REQ-TIED_EXTERNAL_SERVICE_COMPARISON.yaml), [REQ-TIED_METHODOLOGY_COMPOSITION_MATRIX](../../requirements/REQ-TIED_METHODOLOGY_COMPOSITION_MATRIX.yaml), [REQ-TIED_PRE_HANDOFF_VERIFICATION_CHARTER](../../requirements/REQ-TIED_PRE_HANDOFF_VERIFICATION_CHARTER.yaml).

### Consequence ladder (plan phase)

| Decision | Classification |
| --- | --- |
| Slices A–F doc compose | **Reversible** |
| Matrix 20→21 + MCM REQ LEAP | **Costly** — sponsor confirmed |
| Refactor matrix row-count tests (Slice H) | **Reversible** — same build-plan commit |
| Client protected-acceptance playbook (Wave 2 Phase 2) | **Defer** |
| Farley ATDD skill install | **Rejected** |
| Matrix row without MCM LEAP | **Rejected** |

---

## 2. Compose-don't-replace contract

| Harness / outreach / acceptance literacy | Platform-adjacent authority |
| --- | --- |
| Running acceptance examples; red-first before agent | `tied_checklist_gate_validate`, `tied_verify` |
| Protected tests outside agent edit reach (literacy) | MCP **`tied-project/`** YAML graph |
| CITDP **executable behavioral contract** prompt | Gate receipts for implement-complete |
| Row 21 mechanism columns (outreach) | No **Farley-reported** course outcomes as TIED proof |

---

## 3. Phased slices (`@build-plan`)

### Slice A — `farley-executable-spec-compose.md`

**Path:** `tied-bundle/docs/farley-executable-spec-compose.md`

**Required H2 sections (contract test markers):**

| Section | Content |
| --- | --- |
| `## Proof boundary` | No Farley skill/course as core; no Gherkin replacing tokens |
| `## Scope slice` | Acceptance/BDD **product plane** vs TIED **token + pseudo-code + gates** |
| `## Executable acceptance vs IMP pseudo-code` | WHAT vs operational HOW; link [pseudocode-writing-and-validation.md](../../../tied-bundle/docs/pseudocode-writing-and-validation.md) |
| `## Red-first and protected contract` | PROC-TIED_DEV_CYCLE; sponsor ladder; pre-handoff charter |
| `## Markdown SDD vs running examples` | Spec Kit class; pair [Persante × TIED](../../../docs/comparisons/persante-sdd-skills-vs-tied-agent-management.md) |
| `## Pair-read` | AI-SDLC factory, HackerNoon intent/verify, tests-vs-checker-backed, MCM row **6** |
| `## CITDP prompt` | `change_definition`: external behavioral contract + markdown-only tacit zones |
| `## Anti-patterns` | Paste LinkedIn; agent-written tests as sole intent; acceptance green = `tied_verify` |

### Slice B — Client development index

Quick reads row: Farley executable spec × TIED → compose guide + comparison + pair row **6** / AI-SDLC factory. Do not reorder Core seven.

### Slice C — `executable-spec-operator-checklist.md`

**Path:** this working folder (committed with REQ).

**Minimum rows:**

1. Open CITDP — state **executable behavioral contract** beside markdown-only intent
2. Scope agent work — one **REQ** / checklist slug; red test before codegen
3. Protect verification artifacts — sponsor approval on contract test changes
4. Pair IMP pseudo-code — operational HOW before large agent runs
5. Before YAML write — `tied_config_get_base_path`
6. Implement-complete — gate receipt; not acceptance green alone

### Slice D — CITDP literacy pointer

One additive paragraph in [citdp-policy.md](../../../tied-bundle/docs/citdp-policy.md) **or** comment in `citdp-record-template.yaml` `change_definition` for **executable behavioral contract** (no new required keys v1).

### Slice E — Comparison reciprocals

- [dave-farley-spec-must-be-executable-vs-tied-agent-management.md](../../../docs/comparisons/dave-farley-spec-must-be-executable-vs-tied-agent-management.md): Phase **1** **Implemented**; **Executable follow-up** → `REQ-TIED_FARLEY_EXECUTABLE_SPEC_WAVE3`; link compose guide.
- [dave-farley-spec-must-be-executable.md](../../../docs/comparisons/dave-farley-spec-must-be-executable.md): Notes → compose guide.

### Slice F — Traceability + tests

1. Register **REQ/ARCH/IMPL** via TIED MCP (`tied_config_get_base_path` first).
2. `pseudocode_validate` on IMPL.
3. `tools/bootstrap/lib/farley-executable-spec-compose-doc.test.mjs`.
4. `tied_validate_consistency`.

### Slice G — Matrix §2 row **21** + MCM LEAP

1. LEAP [REQ-TIED_METHODOLOGY_COMPOSITION_MATRIX](../../requirements/REQ-TIED_METHODOLOGY_COMPOSITION_MATRIX.yaml): satisfaction criteria / description **20 → 21** rows; `last_updated` reason cites this REQ.
2. Update [methodology-composition-matrix.md](../../../docs/comparisons/methodology-composition-matrix.md): header **21** rows; sibling docs line; append row per [Appendix A](#appendix-a--matrix-row-21-draft).
3. `tools/bootstrap/lib/methodology-composition-matrix-farley-executable-spec-row.test.mjs` — canonical **21** §2 inventory + row **21** identity.
4. **Co-requirement:** same commit satisfies **SC-MCM-DOC** on MCM parent REQ.

### Slice H — Matrix row-count test reconciliation

| Test file | Action |
| --- | --- |
| `methodology-composition-matrix-farley-executable-spec-row.test.mjs` | **New** — owns global §2 count **21** + row 21 content |
| `methodology-composition-matrix-goal-engineering-row.test.mjs` | **Narrow** — row **20** identity only; remove global `length: 20` assert **or** update to **21** if still owning inventory (prefer narrow — see LangChain row 15 pattern) |
| `methodology-composition-matrix-langchain-row.test.mjs` | Row **15** identity only (no global count) |
| `methodology-composition-matrix-langwatch-row.test.mjs` | Row **18** identity |
| `methodology-composition-matrix-netflix-row.test.mjs` | Row **17** identity |
| `methodology-composition-matrix-anthropic-fv-row.test.mjs` | Row **16** identity |

---

## 4. Draft satisfaction criteria (author-requirement)

| ID | Criterion | Metric |
| --- | --- | --- |
| SC-FES-GUIDE | Compose guide + contract test | `farley-executable-spec-compose-doc.test.mjs` |
| SC-FES-INDEX | Client development index Quick reads | Contract test link |
| SC-FES-CHECKLIST | Executable-spec operator checklist | File + link audit |
| SC-FES-CITDP | CITDP policy/template pointer | Contract test marker |
| SC-FES-COMPOSE | Comparison Phase 1 + backlinks | Link audit |
| SC-FES-MATRIX | §2 row 21 + MCM LEAP | `methodology-composition-matrix-farley-executable-spec-row.test.mjs` |
| SC-FES-MATRIX-TESTS | Slice H reconciliation green | Bootstrap doc test battery |
| SC-FES-TRACE | `tied_validate_consistency` | MCP validate |

---

## 5. refine-plan / build-plan boundary

**Completed (refine-plan 2026-11-17):**

- PLAN (slices A–H), CITDP wrapper, IMPL working pseudo-code, test-strategy, tracker, session-handoff, [Appendix A](#appendix-a--matrix-row-21-draft)

**Do next:** **`@build-plan`** — MCP mint REQ/ARCH/IMPL; implement slices A–H; persist CITDP to `tied-project/citdp/`.

---

## Appendix A — Matrix row 21 draft

| # | Framework | Loop(s) | Disposition | TIED center of gravity | Evidence refs | vocabulary | intent_stack | change_analysis | implementation_proof | anti_drift | improvement_loop | sponsor_notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 21 | Executable specification (Farley / agent-era ATDD) | 1–2 | **Composable** | **Running behavioral contract** + protected acceptance vs platform-adjacent proof (REQ/ARCH/IMPL, pseudo-code, gates, **`tied_verify`**) | [Farley × TIED](../../../docs/comparisons/dave-farley-spec-must-be-executable-vs-tied-agent-management.md), [compose guide](../../../tied-bundle/docs/farley-executable-spec-compose.md) (Slice A), [AI-SDLC factory × TIED](../../../docs/comparisons/ai-sdlc-atdd-software-factory-vs-tied.md), [pre-handoff charter](../../../tied-bundle/docs/pre-handoff-verification-charter.md), [REQ-TIED_FARLEY_EXECUTABLE_SPEC_WAVE3](../../requirements/REQ-TIED_FARLEY_EXECUTABLE_SPEC_WAVE3.yaml), [REQ-TIED_EXTERNAL_SERVICE_COMPARISON](../../requirements/REQ-TIED_EXTERNAL_SERVICE_COMPARISON.yaml) | [pseudocode-and-citdp.md](../../vocab/pseudocode-and-citdp.md); [quality-assurance.md](../../vocab/quality-assurance.md); [sponsor-agent-relationship.md](../../vocab/sponsor-agent-relationship.md) | CITDP **executable behavioral contract**; RED before agent; one REQ-scoped checklist slice | `change_definition` markdown-only tacit zones; **Farley-reported metric overclaim** failure class | `tied_config_get_base_path`; protected tests literacy; composition/E2E when justified | Label **Farley-reported**; acceptance green ≠ gate receipts; course/skill **`not_measured`** | Kaizen Loop 2; LEAP when tests diverge from IMPL | **Composable:** pair **row 6** (ATDD heritage) and **row 5** (Spec Kit / SDD); distinct from **AI-SDLC factory** reference repo (cross-link only); pair [HackerNoon row intent/verify](../../../docs/comparisons/hackernoon-observability-contract-ci-vs-tied-agent-management.md) for green-without-signal vs green-without-red-tests |