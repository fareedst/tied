# Implementation plan — Furmanov factory profile Wave 3 (harness compose)

| Field | Value |
| --- | --- |
| **request_token** | `REQ-TIED_FURMANOV_FACTORY_PROFILE_WAVE3` |
| **working_slug** | `REQ-TIED_FURMANOV_FACTORY_PROFILE_WAVE3` |
| **Primary source** | [afurmanov-harness-profiler-vs-tied-agent-management.md](../../../docs/comparisons/afurmanov-harness-profiler-vs-tied-agent-management.md) |
| **Stub capture** | [afurmanov-harness-profiler.md](../../../docs/comparisons/afurmanov-harness-profiler.md) |
| **DOC outreach** | [DOC-AFURMANOV-HARNESS-PROFILER-COMPARISON](../DOC-AFURMANOV-HARNESS-PROFILER-COMPARISON/PLAN-refine-pass1.md) |
| **CITDP** | [CITDP-REQ-TIED_FURMANOV_FACTORY_PROFILE_WAVE3.yaml](CITDP-REQ-TIED_FURMANOV_FACTORY_PROFILE_WAVE3.yaml) |
| **Tracker** | [checklist-tracker.yaml](checklist-tracker.yaml) |
| **Test strategy** | [test-strategy.md](test-strategy.md) |
| **IMPL draft (working)** | [IMPL-TIED_FURMANOV_FACTORY_PROFILE_WAVE3-pseudocode.md](IMPL-TIED_FURMANOV_FACTORY_PROFILE_WAVE3-pseudocode.md) |
| **depth_tier** | `minimal` |
| **gate_policy** | `advisory` |
| **methodology_surface_change_class** | `none` |
| **Operator interruption budget** | No default behavior flips; additive docs + checklist |
| **plan_phase** | `closed` |
| **program_phase** | `plan-refined` (refine-plan pass 2, 2026-11-17) |

---

## 1. Refine (Touchpoint 1 — RESOLVE)

### Intent authority

- **Sponsor intent:** Wave 3 from Furmanov harness-profiler × TIED: **factory profile literacy** — PASS lines vs **structural** waste, inline vs fork contexts, **check-trace** expectations vs **gates**; pair-read HTOL rows **14–15**.
- **add-feature resolution:** **Slice G (matrix §2 row)** **OutOfScope v1**; **Slice H (agentstream ↔ harness-profiler JSONL code bridge)** **Defer** → future REQ unless sponsor reopens in refine-plan.
- **Phase 1 HTOL source study:** **Already done** (2026-11-17); Slice F2 optional reinforcement only.

### RESOLVE table

| Furmanov / informal | TIED preferred term / surface | Notes |
| --- | --- | --- |
| **Software factory** | Skills + Task subagents + prompt-types | Compose literacy |
| **Context bar** | Subagent scope / conversation history | Not IMPL authority |
| **check-trace** | Harness expectation skill | ≠ `tied_checklist_gate_validate` |
| **Validator PASS** | Sub-skill / test verdict | ≠ `tied_verify` |
| **Duplicate validation children** | HTOL structural observation | Kaizen, not LEAP auto |
| **harness-profiler** | External Claude Code plugin | **Defer** product install |
| **Token / duration table** | **Furmanov-reported** only | **`not_measured`** |

**PRELOAD:** [feedback-to-tied.md](../../vocab/feedback-to-tied.md), [agentstream.md](../../vocab/agentstream.md), [sponsor-agent-relationship.md](../../vocab/sponsor-agent-relationship.md).

**Compose authority:** [REQ-TIED_EXTERNAL_SERVICE_COMPARISON](../../requirements/REQ-TIED_EXTERNAL_SERVICE_COMPARISON.yaml), [REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP](../../requirements/REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP.yaml), [REQ-TIED_HARNESS_PLATFORM_SEAM](../../requirements/REQ-TIED_HARNESS_PLATFORM_SEAM.yaml).

### Consequence ladder (plan phase)

| Decision | Classification |
| --- | --- |
| Slices A–F doc compose | **Reversible** |
| agentstream JSONL bridge (H) | **Costly** — **Defer** v1 |
| Matrix §2 row | **Costly** — **OutOfScope** v1 |
| Claude plugin in stdd | **Rejected** |
| Furmanov metrics as TIED proof | **Rejected** |

---

## 2. Compose-don't-replace contract

| Harness / outreach | Platform-adjacent authority |
| --- | --- |
| Factory profile + check-trace literacy | `tied_checklist_gate_validate`, `tied_verify` |
| HTOL / `tied_feedback_capture_observation` | Gate receipts for implement-complete |
| Optional agentstream trace mention | MCP YAML graph truth |

---

## 3. Phased slices (build-plan)

### Slice A — `furmanov-factory-profile-compose.md`

**Path:** `tied-bundle/docs/furmanov-factory-profile-compose.md`

**Required H2 sections (contract test markers):**

| Section | Content |
| --- | --- |
| `## Proof boundary` | In/out: profile literacy vs gates/KPI/plugin mandate |
| `## Scope slice` | Software factory vs single REQ-scoped delivery |
| `## Context and fork analog table` | Inline skill vs fork vs TIED Task/subagent |
| `## PASS vs structure catalog` | Duplicate children, PASS with waste (**Furmanov-reported** case) |
| `## check-trace vs gates table` | Expectation skills vs checklist |
| `## Pair-read` | Furmanov comparison, LangChain/Cursor harness siblings, HPS checklist, HTOL |
| `## CITDP prompt` | change_definition: factory invariants + proof boundary |
| `## Anti-patterns` | check-trace as gate; token bars as TIED proof; plugin as core |

### Slice B — Client development index

- Add **Quick reads** row: *Furmanov factory profile × TIED* → compose guide + comparisons.

### Slice C — `factory-profile-operator-checklist.md`

**Path:** this working folder (committed with REQ).

**Columns:** `When` | `Signal (Furmanov-reported literacy)` | `TIED action` | `Proof artifact`

**Minimum rows:**

1. Open CITDP / **change_definition** — list **factory invariants** (order, fork rules) beside gate proof
2. After multi-skill session — optional profile / HTOL review; not implement-complete
3. Sub-skill reports **PASS** — confirm **`tied_verify`** / gate receipts for shipped behavior
4. Duplicate validator children in profile — **`tied_feedback_capture_observation`**; not auto LEAP
5. Before YAML write — **`tied_config_get_base_path`** (pair HPS checklist)

**Reference line:** [afurmanov-harness-profiler-vs-tied-agent-management.md](../../../docs/comparisons/afurmanov-harness-profiler-vs-tied-agent-management.md) · [authority-boundary-operator-checklist.md](../REQ-TIED_HARNESS_PLATFORM_SEAM/authority-boundary-operator-checklist.md).

### Slice D — `citdp-policy.md` pointer

- One bullet: factory-profile / harness PASS vs structural proof in change-definition literacy.

### Slice E — Comparison reciprocals

- [afurmanov-harness-profiler-vs-tied-agent-management.md](../../../docs/comparisons/afurmanov-harness-profiler-vs-tied-agent-management.md): Phase **2** and doc-only Phase **3** → **Implemented**; **Executable follow-up** → `REQ-TIED_FURMANOV_FACTORY_PROFILE_WAVE3`; JSONL bridge phase stays **Defer**.
- [afurmanov-harness-profiler.md](../../../docs/comparisons/afurmanov-harness-profiler.md): **Notes** link to compose guide after Slice A.

### Slice F — Traceability + tests

1. Copy pseudo-code sidecar to `tied-project/implementation-decisions/` at build-plan.
2. `pseudocode_validate` gate_mode — **pass** (refine-plan 2026-11-17).
3. RED `tools/bootstrap/lib/furmanov-factory-profile-compose-doc.test.mjs` (pattern: `goal-engineering-feedback-scope-compose-doc.test.mjs`).
4. `tied_validate_consistency` for FFP graph.

### Slice F2 — DOC bounded skim (optional)

- `tied-project/working/DOC-AFURMANOV-HARNESS-PROFILER-COMPARISON/furmanov-bounded-operator-skim.md` — one-page operator skim.

### Slice G — Matrix §2 row

**OutOfScope v1** — parent MCM LEAP required.

### Slice H — agentstream JSONL bridge

**Defer** — behavior-changing; separate REQ if sponsored.

---

## 4. Draft satisfaction criteria (REQ index)

| ID | Criterion | Metric |
| --- | --- | --- |
| SC-FFP-GUIDE | Compose guide + contract test | `furmanov-factory-profile-compose-doc.test.mjs` |
| SC-FFP-INDEX | Index Quick reads row | Contract test |
| SC-FFP-CHECKLIST | Factory profile checklist | File + link audit |
| SC-FFP-CITDP | citdp-policy pointer | Marker in test |
| SC-FFP-COMPOSE | Comparison phased + backlinks | Link audit |
| SC-FFP-TRACE | Consistency after implement | `tied_validate_consistency` |

---

## 5. refine-plan / build-plan boundary

**Completed (add-feature + refine-plan pass 2):**

- PLAN slices A–F, F2 optional, G/H deferred; CITDP wrapper; test-strategy; tracker; `pseudocode_validate` **ok**

**build-plan owns:** RED contract test, slices A–F(+F2), persist CITDP to `tied-project/citdp/`, comparison reciprocals, `pre_implementation` gate retry, verification close-out.

---

## 6. Build-plan staging map

| Path | Slice |
| --- | --- |
| `tied-bundle/docs/furmanov-factory-profile-compose.md` | A |
| `tied-bundle/docs/client-development-index.md` | B |
| `tied-project/working/REQ-TIED_FURMANOV_FACTORY_PROFILE_WAVE3/factory-profile-operator-checklist.md` | C |
| `tied-bundle/docs/citdp-policy.md` | D |
| `docs/comparisons/afurmanov-harness-profiler*.md` | E |
| `tools/bootstrap/lib/furmanov-factory-profile-compose-doc.test.mjs` | F |
| `tied-project/implementation-decisions/IMPL-*-pseudocode.md` | F |

---

## Appendix A — Deferred matrix §2 row (draft)

*Do not implement without REQ-TIED_METHODOLOGY_COMPOSITION_MATRIX row-contract LEAP.*

| # | Framework | Loop(s) | Disposition | TIED COG (draft) |
| --- | --- | --- | --- | --- |
| 21 | Furmanov factory profile (context sequence / check-trace compose) | 1–2 | **Composable** | Factory JSONL literacy vs gates/`tied_verify`; pair rows **14–15** |

---

## 7. Test strategy summary

**File:** [test-strategy.md](test-strategy.md)  
**Contract test:** `tools/bootstrap/lib/furmanov-factory-profile-compose-doc.test.mjs`  
**Close:** `tied_validate_consistency` after R+A+I + index updates.

---

## Plan execution steps

1. [x] `add-feature` — PLAN, CITDP draft, tracker seed, R+A+I registration, IMPL pseudo-code draft
2. [x] `@refine-plan` — pass 2 slices, checklist rows, staging map, pseudocode_validate ok
3. [x] `@build-plan` — RED contract test → doc slices A–F GREEN (2026-11-17)
4. [x] `@close-out` — commit **`9c274148`** (2026-11-17)

**Do next:** none for this REQ; matrix row **21** / JSONL via future REQ if sponsored.