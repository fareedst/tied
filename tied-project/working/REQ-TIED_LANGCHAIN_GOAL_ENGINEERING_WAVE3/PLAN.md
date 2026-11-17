# Implementation plan — LangChain Goal Engineering Wave 3 (feedback-scope compose)

| Field | Value |
| --- | --- |
| **request_token** | `REQ-TIED_LANGCHAIN_GOAL_ENGINEERING_WAVE3` |
| **working_slug** | `REQ-TIED_LANGCHAIN_GOAL_ENGINEERING_WAVE3` |
| **Primary source** | [langchain-goal-engineering-vs-tied-agent-management.md](../../../docs/comparisons/langchain-goal-engineering-vs-tied-agent-management.md) |
| **Stub capture** | [langchain-goal-engineering.md](../../../docs/comparisons/langchain-goal-engineering.md) (off-repo post) |
| **DOC outreach** | [DOC-LANGCHAIN-GOAL-ENGINEERING-COMPARISON](../DOC-LANGCHAIN-GOAL-ENGINEERING-COMPARISON/PLAN-refine-pass1.md) |
| **CITDP** | [CITDP-REQ-TIED_LANGCHAIN_GOAL_ENGINEERING_WAVE3.yaml](CITDP-REQ-TIED_LANGCHAIN_GOAL_ENGINEERING_WAVE3.yaml) |
| **Tracker** | [checklist-tracker.yaml](checklist-tracker.yaml) |
| **Test strategy** | [test-strategy.md](test-strategy.md) |
| **IMPL draft (working)** | [IMPL-TIED_LANGCHAIN_GOAL_ENGINEERING_WAVE3-pseudocode.md](IMPL-TIED_LANGCHAIN_GOAL_ENGINEERING_WAVE3-pseudocode.md) |
| **depth_tier** | `minimal` |
| **gate_policy** | `advisory` |
| **methodology_surface_change_class** | `none` |
| **Operator interruption budget** | No default behavior flips; additive docs + matrix row 20 + LEAP on MCM REQ |
| **plan_phase** | `post-build` |
| **program_phase** | `implemented` (build-plan, 2026-11-17) |

---

## 1. Refine (Touchpoint 1 — RESOLVE)

### Intent authority

- **Sponsor intent:** Wave 3 Phase 1 from LangChain Goal Engineering × TIED: **goal-aligned scope** and **feedback-batch** operator literacy for the software-delivery slice; **matrix §2 row 20** (sponsor confirmed).
- **refine-plan resolution:** Vocab RECORD (`goal-aligned scope` glossary) **Defer** v1; Hone/Actively/CRM **OutOfScope**.
- **Distinct from row 15:** Row **15** = empirical **harness trace** loop; row **20** = **goal scope + tacit feedback UX** compose (pair rows **14–15** in sponsor_notes only).

### RESOLVE table

| LangChain / informal | TIED preferred term / surface | Notes |
| --- | --- | --- |
| **Goal engineering** | **Goal-aligned scope** (CITDP + checklist slug batching) | Compose literacy |
| **Motion** | Prompt-type / **JTBD** batch per REQ item | Not CRM entity |
| **Tacit context** | Sponsor **charter/selection lanes**, `tied_feedback_*` | Gap until RECORD’d |
| **Review UX** | PLAN review, `tied_sponsor_questions` | ≠ gate pass |
| **Context-gathering agent** | PRELOAD, brownfield/scoped reads | vs implement agent |
| **Metric optimization** | Client KPI | **Defer** / **not_measured** |

**PRELOAD:** [sponsor-agent-relationship.md](../../vocab/sponsor-agent-relationship.md), [feedback-to-tied.md](../../vocab/feedback-to-tied.md), [harness-platform-taxonomy.md](../../vocab/harness-platform-taxonomy.md), [sponsor-two-lane-delivery.md](../../../tied-bundle/docs/sponsor-two-lane-delivery.md).

**Compose authority:** [REQ-TIED_EXTERNAL_SERVICE_COMPARISON](../../requirements/REQ-TIED_EXTERNAL_SERVICE_COMPARISON.yaml), [REQ-TIED_HARNESS_PLATFORM_SEAM](../../requirements/REQ-TIED_HARNESS_PLATFORM_SEAM.yaml), [REQ-TIED_SPONSOR_TWO_LANE_DELIVERY](../../requirements/REQ-TIED_SPONSOR_TWO_LANE_DELIVERY.yaml), [REQ-TIED_HARNESS_LANGCHAIN_PHASE3](../../requirements/REQ-TIED_HARNESS_LANGCHAIN_PHASE3.yaml).

### Consequence ladder (plan phase)

| Decision | Classification |
| --- | --- |
| Slices A–F doc compose | **Reversible** |
| Matrix 19→20 + MCM REQ LEAP | **Costly** — sponsor confirmed |
| Refactor matrix row-count tests (Slice H) | **Reversible** — same build-plan commit |
| Vocab RECORD goal-aligned scope | **Defer** |
| Actively/Hone product adoption | **Rejected** |

---

## 2. Compose-don't-replace contract

| Harness / outreach | Platform-adjacent authority |
| --- | --- |
| Goal-aligned scope, feedback-batch literacy | `tied_checklist_gate_validate`, `tied_verify` |
| `tied_feedback_capture_observation` (Kaizen) | Gate receipts for implement-complete |
| CITDP tacit-context prompt in change-definition | MCP YAML graph truth |
| Row 20 mechanism columns (outreach) | No LangChain-reported KPI as TIED proof |

---

## 3. Phased slices (build-plan)

### Slice A — `goal-engineering-feedback-scope-compose.md`

**Path:** `tied-bundle/docs/goal-engineering-feedback-scope-compose.md`

**Required H2 sections (contract test markers):**

| Section | Content |
| --- | --- |
| `## Proof boundary` | In/out: feedback literacy vs gates/YAML/KPI |
| `## Scope slice` | Written intent vs tacit sponsor preference |
| `## Feedback-batch analog table` | “Motion” → REQ-scoped slug / prompt-type batch |
| `## Tacit-context catalog` | Charter/selection lanes, costly choice, feedback MCP |
| `## Pair-read` | Goal comparison, harness comparison (row 15), sponsor-two-lane, HPS checklist |
| `## CITDP prompt` | change_definition bullets: goal-aligned scope + tacit zones |
| `## Anti-patterns` | Chat approval, KPI green, per-file micro-agents |

**Cross-links:** [pre-handoff-verification-charter.md](../../../tied-bundle/docs/pre-handoff-verification-charter.md), [harness-trace-observation-loop.md](../../../tied-bundle/docs/harness-trace-observation-loop.md) (observations ≠ gate).

### Slice B — Client development index

- Add **Quick reads** row: *LangChain goal engineering × TIED feedback scope* → compose guide + comparison + row 15 pair-read.
- **Do not** reorder Core seven.

### Slice C — `goal-aligned-scope-operator-checklist.md`

**Path:** this working folder (committed with REQ).

**Minimum rows:**

1. Open CITDP — state **goal-aligned scope** + **tacit zones** beside in-scope proof
2. Scope new agent work — one **REQ** / checklist slug batch (motion analog); avoid per-file micro-scope
3. Tacit preference surfaces — sponsor lane or `tied_sponsor_questions`; not chat-only
4. Gather vs build — PRELOAD complete before implement; IMPL before RED
5. Before YAML write — `tied_config_get_base_path` (HPS checklist pair-read)
6. Implement-complete — gate receipt; not review throughput alone

### Slice D — CITDP literacy pointer

- One additive paragraph in [citdp-policy.md](../../../tied-bundle/docs/citdp-policy.md) **or** comment in [citdp-record-template.yaml](../../../tied-bundle/docs/citdp-record-template.yaml) `change_definition` for **goal-aligned scope** and **tacit context** (no new required keys v1).

### Slice E — Comparison reciprocals

- [langchain-goal-engineering-vs-tied-agent-management.md](../../../docs/comparisons/langchain-goal-engineering-vs-tied-agent-management.md): Phase 1 **Implemented**; **Executable follow-up** → `REQ-TIED_LANGCHAIN_GOAL_ENGINEERING_WAVE3`; link compose guide.
- [langchain-goal-engineering.md](../../../docs/comparisons/langchain-goal-engineering.md) Notes → compose guide.

### Slice F — Traceability + tests

1. Register **REQ/ARCH/IMPL** via TIED MCP (`tied_config_get_base_path` first); persist IMPL sidecar under `tied-project/implementation-decisions/`.
2. `pseudocode_validate` on IMPL.
3. `tools/bootstrap/lib/goal-engineering-feedback-scope-compose-doc.test.mjs` (pattern: governance-sensing compose test).
4. `tied_validate_consistency`.

### Slice G — Matrix §2 row 20 + MCM LEAP

1. LEAP [REQ-TIED_METHODOLOGY_COMPOSITION_MATRIX](../../requirements/REQ-TIED_METHODOLOGY_COMPOSITION_MATRIX.yaml): `SC-MCM-DOC` and description **19 → 20** rows; index metadata `last_updated` reason cites this REQ.
2. Update [methodology-composition-matrix.md](../../../docs/comparisons/methodology-composition-matrix.md): header §2 inventory **20**; add row **20** from [Appendix A](#appendix-a-matrix-row-20-draft).
3. `tools/bootstrap/lib/methodology-composition-matrix-goal-engineering-row.test.mjs` — asserts **20** rows + row **20** identity strings.

**Co-requirement:** Same build-plan commit must satisfy **SC-MCM-DOC** on MCM REQ (build-plan may use existing `REQ-TIED_METHODOLOGY_COMPOSITION_MATRIX` working PLAN or inline LEAP).

### Slice H — Matrix row-count test reconciliation (refine-plan)

**Problem:** `methodology-composition-matrix-langchain-row.test.mjs` and `methodology-composition-matrix-langwatch-row.test.mjs` pin obsolete §2 totals (17 / 18).

**Resolution (build-plan):**

| Test file | Action |
| --- | --- |
| `methodology-composition-matrix-goal-engineering-row.test.mjs` | **New** — canonical **20-row** inventory + row 20 content |
| `methodology-composition-matrix-langchain-row.test.mjs` | Change to **row 15 identity** asserts only; drop `exactly 17` global count OR update count to **20** if still maintaining global inventory in one test |
| `methodology-composition-matrix-langwatch-row.test.mjs` | Same — row **18** identity; update global count to **20** or remove global assert |
| `methodology-composition-matrix-netflix-row.test.mjs` | Row **17** identity; reconcile count |
| `methodology-composition-matrix-anthropic-fv-row.test.mjs` | Row **16** identity; reconcile count |

**Preferred pattern:** One test (`goal-engineering-row`) owns **§2 row inventory count**; legacy row tests assert **framework label + REQ link on their row line** only.

---

## 4. Draft satisfaction criteria (author-requirement)

| ID | Criterion | Metric |
| --- | --- | --- |
| SC-LGE-GUIDE | Compose guide + contract test | `goal-engineering-feedback-scope-compose-doc.test.mjs` |
| SC-LGE-INDEX | Client development index Quick reads | Contract test link |
| SC-LGE-CHECKLIST | Goal-aligned scope checklist | File + link audit |
| SC-LGE-CITDP | CITDP policy/template pointer | Contract test marker |
| SC-LGE-COMPOSE | Comparison Phase 1 + backlinks | Link audit |
| SC-LGE-MATRIX | §2 row 20 + MCM LEAP | `methodology-composition-matrix-goal-engineering-row.test.mjs` |
| SC-LGE-MATRIX-TESTS | Slice H reconciliation green | Full bootstrap doc test battery |
| SC-LGE-TRACE | `tied_validate_consistency` | MCP validate |

---

## 5. refine-plan / build-plan boundary

**Completed (add-feature intent + refine-plan pass 2):**

- PLAN (slices A–H), CITDP wrapper, IMPL working pseudo-code, test-strategy, tracker, session-handoff, refine gate note
- **Completed (build-plan 2026-11-17):** REQ/ARCH/IMPL registered; slices A–H; CITDP persisted; contract tests green; matrix §2 row **20**; MCM `SC-MCM-DOC` → **20** rows.

**Do next:** optional `@close-out` for traceable commit.

---

## Appendix A — Matrix row 20 draft

| # | Framework | Loop(s) | Disposition | TIED center of gravity | Evidence refs | vocabulary | intent_stack | change_analysis | implementation_proof | anti_drift | improvement_loop | sponsor_notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 20 | LangChain goal engineering (feedback-aligned scope) | 1–2 | **Composable** | **Goal scope + review UX** for tacit expert feedback vs platform-adjacent proof (gates, MCP YAML, **`tied_verify`**) | [LangChain goal × TIED](../../../docs/comparisons/langchain-goal-engineering-vs-tied-agent-management.md), [compose guide](../../../tied-bundle/docs/goal-engineering-feedback-scope-compose.md) (Slice A), [sponsor-two-lane-delivery](../../../tied-bundle/docs/sponsor-two-lane-delivery.md), [Traefik row 13 seam](traefik-harness-platform-vs-tied-agent-management.md), [REQ-TIED_LANGCHAIN_GOAL_ENGINEERING_WAVE3](../../requirements/REQ-TIED_LANGCHAIN_GOAL_ENGINEERING_WAVE3.yaml), [REQ-TIED_HARNESS_LANGCHAIN_PHASE3](../../requirements/REQ-TIED_HARNESS_LANGCHAIN_PHASE3.yaml) | [sponsor-agent-relationship.md](../../vocab/sponsor-agent-relationship.md); [feedback-to-tied.md](../../vocab/feedback-to-tied.md) | Prompt-type **Task** profiles; CITDP **goal-aligned scope**; one REQ-scoped checklist item | CITDP `change_definition` tacit zones; **LangChain-reported metric overclaim** failure class | `tied_config_get_base_path`; sponsor lanes; **`tied_sponsor_questions`** | Label **LangChain-reported**; chat review ≠ gate receipts; KPI loops **`not_measured`** | `tied_feedback_capture_observation`; Kaizen Loop 2 | **Composable:** pair **rows 14–15** (Cursor/LangChain **harness** trace) vs row **20** (goal/feedback scope); distinct from row **15** subject; Hone/Actively UI **Defer** |