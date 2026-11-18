# Implementation plan — Open Governance “Cannot Sense” Wave 3 (proof-boundary compose)

| Field | Value |
| --- | --- |
| **request_token** | `REQ-TIED_OPEN_GOVERNANCE_SENSING_WAVE3` |
| **working_slug** | `REQ-TIED_OPEN_GOVERNANCE_SENSING_WAVE3` |
| **Primary source** | [open-governance-cannot-sense-vs-tied-agent-management.md](../../../docs/comparisons/open-governance-cannot-sense-vs-tied-agent-management.md) |
| **Stub capture** | [open-governance-cannot-sense.md](../../../docs/comparisons/open-governance-cannot-sense.md) (off-repo essay) |
| **DOC outreach** | [DOC-OPEN-GOVERNANCE-CANNOT-SENSE-COMPARISON](../DOC-OPEN-GOVERNANCE-CANNOT-SENSE-COMPARISON/PLAN-refine-pass1.md) |
| **CITDP** | [CITDP-REQ-TIED_OPEN_GOVERNANCE_SENSING_WAVE3.yaml](CITDP-REQ-TIED_OPEN_GOVERNANCE_SENSING_WAVE3.yaml) |
| **Tracker** | [checklist-tracker.yaml](checklist-tracker.yaml) |
| **Test strategy** | [test-strategy.md](test-strategy.md) |
| **IMPL draft (working)** | [IMPL-TIED_OPEN_GOVERNANCE_SENSING_WAVE3-pseudocode.md](IMPL-TIED_OPEN_GOVERNANCE_SENSING_WAVE3-pseudocode.md) |
| **depth_tier** | `minimal` |
| **gate_policy** | `advisory` |
| **methodology_surface_change_class** | `none` |
| **Operator interruption budget** | No default behavior flips; additive docs + one checklist |
| **plan_phase** | `post-build` |
| **program_phase** | `plan-refined` (refine-plan pass 2, 2026-11-17) |

---

## 1. Refine (Touchpoint 1 — RESOLVE)

### Intent authority

- **Sponsor intent:** Wave 3 **Phase 1** from Open Governance × TIED: durable **proof-boundary** and **odourless-zone** operator literacy for the **software-delivery slice** only.
- **refine-plan resolution:** **Slice G (matrix row) remains OutOfScope for v1** — [methodology-composition-matrix.md](../../../docs/comparisons/methodology-composition-matrix.md) §2 row contract is **19 rows**; adding row 20 requires parent [REQ-TIED_METHODOLOGY_COMPOSITION_MATRIX](../../requirements/REQ-TIED_METHODOLOGY_COMPOSITION_MATRIX.yaml) **SC-MCM-DOC** LEAP (19→20) as separate costly sponsor action.
- **Vocab RECORD (`mercaptan`, `desurgence`):** **Defer** — use prose in bundle guide only unless sponsor expands in a later refine-plan.

### RESOLVE table

| Open Governance / informal | TIED preferred term / surface | Notes |
| --- | --- | --- |
| **Cannot sense / odourless harm** | **Proof boundary**, **`not_measured`**, odourless-zone catalog | Not org GRC |
| **Mercaptan** | Gate receipts, skipped visibility, diagnostics | Metaphor in guide table |
| **Green dashboard** | `tied_validate_consistency` ≠ product quality | Pair Ludanyi sibling |
| **Cropped frame** | PRELOAD routing; two-layer vocab | Not Palantír product |
| **Agent outsourced sensing** | HTOL Kaizen; gates authoritative | HPS checklist pair-read |
| **Six closing questions** | CITDP odourless prompt + checklist rows | Map to Fish prompts (reworded) |

**PRELOAD:** [sponsor-agent-relationship.md](../../vocab/sponsor-agent-relationship.md), [quality-assurance.md](../../vocab/quality-assurance.md), [feedback-to-tied.md](../../vocab/feedback-to-tied.md).

**Compose authority:** [REQ-TIED_EXTERNAL_SERVICE_COMPARISON](../../requirements/REQ-TIED_EXTERNAL_SERVICE_COMPARISON.yaml), [REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP](../../requirements/REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP.yaml), [REQ-TIED_HARNESS_PLATFORM_SEAM](../../requirements/REQ-TIED_HARNESS_PLATFORM_SEAM.yaml).

### Consequence ladder (plan phase)

| Decision | Classification |
| --- | --- |
| Slices A–F doc compose | **Reversible** |
| Optional HTOL marker (F2) | **Reversible** — skip with evidence note |
| Matrix §2 row 20 | **Costly** — **OutOfScope v1** |
| Vocab RECORD mercaptan/desurgence | **Costly** — **Defer** |
| Effectiveness claims vs essay | **Rejected** |

---

## 2. Compose-don't-replace contract

| Harness / outreach | Platform-adjacent authority |
| --- | --- |
| Odourless-zone literacy, mercaptan metaphor | `tied_checklist_gate_validate`, `tied_verify` |
| HTOL source-study cite | Gate receipts for implement-complete |
| CITDP odourless prompt in change-definition | MCP YAML graph truth |

---

## 3. Phased slices (build-plan)

### Slice A — `governance-sensing-proof-boundary-compose.md`

**Path:** `tied-bundle/docs/governance-sensing-proof-boundary-compose.md`

**Required H2 sections (contract test markers):**

| Section | Content |
| --- | --- |
| `## Proof boundary` | In/out scope table (mirror [tests-vs-checker-backed-claims.md](../../../tied-bundle/docs/tests-vs-checker-backed-claims.md) pattern) |
| `## Scope slice` | TIED senses: REQ→code, gates, tests; does **not** sense: vendor weights, HR, prod traffic, board comfort |
| `## Mercaptan analog table` | Invisible harm → deliberate TIED smell (validate output, gate JSON, skipped/not-run, `TIED_BASE_PATH` check) |
| `## Odourless-zone catalog` | Bulleted catalog with **`not_measured`** where applicable |
| `## Pair-read` | Links: Open Governance analysis, Ludanyi comparison, HPS authority checklist |
| `## CITDP prompt` | Sponsor-facing bullets mapped from essay closing questions (paraphrase; no essay body) |
| `## Anti-patterns` | Green chat, token coverage alone, agent-as-sensor for implement-complete |

**Cross-links:** [pre-handoff-verification-charter.md](../../../tied-bundle/docs/pre-handoff-verification-charter.md), [harness-trace-observation-loop.md](../../../tied-bundle/docs/harness-trace-observation-loop.md).

**Out of slice:** Matrix row, vocab RECORD, essay reproduction.

### Slice B — Client development index

- Add **Quick reads** row: *Open Governance sensing × TIED proof boundary* → compose guide + comparison + Ludanyi.
- **Do not** reorder Core seven table.

### Slice C — `odourless-zones-operator-checklist.md`

**Path:** this working folder (committed with REQ).

**Table columns:** `When` | `Signal (OpenGovernance-reported literacy)` | `TIED action` | `Proof artifact`

**Minimum rows:**

1. Start CITDP / change-definition — list **odourless zones** beside in-scope proof
2. Before implement-complete claim — gate receipt; not chat calm
3. After harness batch — HTOL observation optional; not gate pass
4. Sponsor comfort (many green turns) — revisit costly choices; not success metric
5. Before YAML write — `tied_config_get_base_path` (link HPS checklist)

**Reference line:** Open Governance comparison + HPS [authority-boundary-operator-checklist.md](../REQ-TIED_HARNESS_PLATFORM_SEAM/authority-boundary-operator-checklist.md).

### Slice D — CITDP literacy pointer

- **One** additive paragraph in [citdp-policy.md](../../../tied-bundle/docs/citdp-policy.md) **or** comment block in [citdp-record-template.yaml](../../../tied-bundle/docs/citdp-record-template.yaml) `change_definition` urging sponsors to record **odourless zones** (harms with no signal in current reporting).
- **No** new required YAML keys in v1.

### Slice E — Comparison reciprocals

- [open-governance-cannot-sense-vs-tied-agent-management.md](../../../docs/comparisons/open-governance-cannot-sense-vs-tied-agent-management.md): Phase 1 **Implemented**; **Executable follow-up** names `REQ-TIED_OPEN_GOVERNANCE_SENSING_WAVE3`.
- Stub capture **Notes** link to compose guide after Slice A.

### Slice F — Traceability + tests

1. Register **REQ/ARCH/IMPL** via TIED MCP; copy pseudo-code from working draft to `tied-project/implementation-decisions/`.
2. `pseudocode_validate` gate_mode on IMPL.
3. Add `tools/bootstrap/lib/governance-sensing-proof-boundary-compose-doc.test.mjs` (pattern: `harness-trace-observation-loop-doc.test.mjs`).
4. `tied_validate_consistency`.

**Slice F2 (optional):** Extend HTOL guide with `## Source studies (Open Governance compose)` + one test marker in `harness-trace-observation-loop-doc.test.mjs`. Skip if timeboxed — record in build-plan evidence.

### Slice G — Matrix row 20

**Status:** **OutOfScope v1** (row contract 19). Draft retained in [Appendix A](#appendix-a-deferred-matrix-row-20-draft) for future MCM promotion only.

---

## 4. Draft satisfaction criteria (author-requirement)

| ID | Criterion | Metric |
| --- | --- | --- |
| SC-OGS-GUIDE | Compose guide + contract test | `governance-sensing-proof-boundary-compose-doc.test.mjs` |
| SC-OGS-INDEX | Index Quick reads row | Link / test marker |
| SC-OGS-CHECKLIST | Odourless zones checklist | File + link audit |
| SC-OGS-CITDP-POINTER | CITDP policy/template pointer | Manual / marker in test |
| SC-OGS-COMPOSE | Comparison phased + backlinks | Link audit |
| SC-OGS-HTOL | Optional HTOL source study | HTOL test markers if F2 run |
| SC-OGS-TRACE | REQ/ARCH/IMPL + consistency | `tied_validate_consistency` |

---

## 5. refine-plan / add-feature boundary

**Completed (add-feature + refine-plan):**

- PLAN (slices A–F, F2 optional, G deferred), CITDP wrapper, IMPL working pseudo-code, test-strategy, tracker, session-handoff, refine gate note
- **Not yet:** REQ/ARCH/IMPL index rows, pseudocode_validate pass, `pre_implementation` gate **allowed**

**build-plan owns:** author-requirement/architecture/implementation, slices A–F(+F2), persist CITDP to `tied-project/citdp/`, verification gate, close-out deferral.

---

## 6. Build-plan staging map (preview)

| Path | Slice |
| --- | --- |
| `tied-bundle/docs/governance-sensing-proof-boundary-compose.md` | A |
| `tied-bundle/docs/client-development-index.md` | B |
| `tied-project/working/REQ-TIED_OPEN_GOVERNANCE_SENSING_WAVE3/odourless-zones-operator-checklist.md` | C |
| `tied-bundle/docs/citdp-policy.md` or `citdp-record-template.yaml` | D |
| `docs/comparisons/open-governance-cannot-sense*.md` | E |
| `tools/bootstrap/lib/governance-sensing-proof-boundary-compose-doc.test.mjs` | F |
| `tied-project/requirements*.yaml`, architecture, implementation | F |
| `tied-bundle/docs/harness-trace-observation-loop.md` (optional) | F2 |

---

## Appendix A — Deferred matrix row 20 (draft)

*Do not implement without REQ-TIED_METHODOLOGY_COMPOSITION_MATRIX row-contract update.*

| # | Framework | Loop(s) | Disposition | TIED COG (draft) |
| --- | --- | --- | --- | --- |
| 20 | Open Governance sensing literacy (odourless harm / proof boundary) | 1–2 | **Composable** | Deliberate observability for **software-delivery** proof vs org/board sensing **Defer** |

Mechanism cells would cite: compose guide, odourless checklist, HPS row 13, Ludanyi pair-read, `not_measured` discipline — **build-plan must not paste this row until parent MCM REQ scoped**.

---

## Plan execution steps

**Last updated:** 2026-11-17 · **prompt_type:** handoff · **PLAN:** this file

### Required (build-plan)

- [x] `author-requirement` — REQ/ARCH/IMPL via TIED MCP
- [x] `pseudocode_validate` — IMPL sidecar
- [x] `implement-slices-a-f` — §3 (Slice A compose guide added this session)
- [x] `persist-citdp-record` — `tied-project/citdp/`
- [x] `tied_validate_consistency` — REQ graph clean; store-wide WF_TRIAL gaps pre-existing
- [x] `pre_implementation` gate — `tied_gate_check` **allowed: true**
- [x] `verification` gate + `tied_verify` — manifest `evidence/verification-evidence-manifest.v1.json`

### Optional

- [ ] `slice-f2-htol` — skipped (timebox); HTOL markers deferred per PLAN F2
- [ ] `matrix-row-20` — **Costly**; separate from this REQ unless sponsor reopens

### Recommendation-only

- [ ] `vocab-record` — mercaptan / desurgence