# REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE — refined plan (Wave 3 Phase 2)

| Field | Value |
| --- | --- |
| **REQ** | [REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE](../../../requirements/REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE.yaml) (LEAP extend — no new REQ mint) |
| **Refined** | 2026-10-26 |
| **Source** | [session-handoff.md](./evidence/session-handoff.md) · [anthropic comparison Phase 2](../../../docs/comparisons/anthropic-llm-formal-verification-vs-tied-agent-management.md#phased-recommendations-doc-first) |
| **Prior pass** | Phase 1 [PLAN.md](./PLAN.md) — committed `146ba7ff` |
| **Tracker (implement)** | [checklist-tracker-phase2.yaml](./checklist-tracker-phase2.yaml) |
| **Change class** | Doc + project vocab RECORD — no MCP gate authority |
| **profile_depth** | `minimal` |
| **gate_policy** | `doc_only` |

---

## Refine (Touchpoint 1 — RESOLVE)

**PRELOAD (session):** [quality-assurance.md](../../../vocab/quality-assurance.md), [sponsor-agent-relationship.md](../../../vocab/sponsor-agent-relationship.md) (person-branch theorem acceptance), [tests-vs-checker-backed-claims.md](../../../tied-bundle/docs/tests-vs-checker-backed-claims.md) (Phase 1 guide).

| Anthropic / outreach term | TIED canonical term | Layer | Notes |
| --- | --- | --- | --- |
| Machine-checked proof / Rocq·Verus discharge | **checker-backed claim** | Evidence / claim class | External proof engine; cite **proof boundary**; does **not** imply **`tied_verify`**, checklist completion, or stdd effectiveness unless scoped integration REQ |
| Basic / equivalence / third theorem; median ~110-line **short spec** (**Anthropic-reported**) | **theorem statement** | Formal-methods compose (external) | Proposition or spec text **before** or **without** discharge; **≠** **checker-backed claim**; sponsor **person-branch** acceptance per comparison § RESOLVE table |
| “Proof passed”, “formally verified” (unqualified) | Demote — use class labels above | — | Pair with **Anthropic-reported** and **`not_measured`** |
| Passing TIED tests | **empirical test pass** (existing QA row) | — | **Non-implication:** 5/7 vs 7/7 injection story — tests **≠** checker-backed claims |
| **`pseudocode_validate`** | **Static IMPL check** (guide) / existing QA **proof boundary** | — | Static shape — not SMT or Rocq |

**Sponsor decision (recorded):** Canonical RECORD lives in **`quality-assurance.md`** + cross-topic note in **`domain-references.md`** (not a new glossary file; not split into sponsor-agent glossary).

**Ambiguity cleared:** Scope is **Phase 2 only** — project vocab RECORD + bidirectional guide links + comparison Phase 2 **Done**. **Out of scope:** methodology-composition-matrix formal-methods row, envelope external proof receipt type, 36-task benchmark (Phase 3 **Defer**).

**Adversarial / depth:** `profile_depth: **minimal**` — vocab/doc only; integrated inquiry **Defer**.

**Consequence ladder:**

| Decision | Class | Default |
| --- | --- | --- |
| RECORD two terms in QA + routing + cross-topic | Reversible | Proceed at **build-plan** / implement |
| LEAP extend same REQ/ARCH/IMPL stack | Reversible | Proceed |
| New REQ token for Phase 2 | Costly | **Decline** — same arc, new satisfaction criteria only |
| Phase 3 matrix / envelope / benchmark | Costly | **Defer** |

**Distinct from Phase 1:** Phase 1 shipped bundle guide + index; Phase 2 makes guide claim-class labels **RESOLVE/VALIDATE**-durable in **`tied-project/vocab/`** without changing MCP schemas.

### Gate (refine-plan)

`tied_checklist_gate_validate` → `phase: pre_implementation`, CITDP Phase 2 draft, tracker [checklist-tracker-phase2.yaml](./checklist-tracker-phase2.yaml):

| Result | Meaning |
| --- | --- |
| **`allowed: false`** | `malformed_citdp:adversarial_inquiry` — same honest limitation as Phase 1 and DOC outreach siblings |
| **Process** | Doc-only implement may proceed when RED tests + LEAP YAML + vocab RECORD complete; **not** machine **`close_out`** authorization without envelope |

Evidence: [refine-phase2-pre-implementation-gate.json](./evidence/refine-phase2-pre-implementation-gate.json)

**Do not** claim gate success; **do not** block implement on forcing integrated inquiry for two glossary rows.

---

## Plan (CITDP)

**Impact:**

| Area | Blast radius |
| --- | --- |
| `tied-project/vocab/quality-assurance.md` | +2 canonical rows (`CHECKER_BACKED_CLAIM`, `THEOREM_STATEMENT`); optional short “Formal verification compose (external)” subsection |
| `tied-project/vocab/domain-references.md` | Cross-topic note + alphabet index entries |
| `tied-project/vocab/routing.md` | Keywords on `quality-assurance.md` row |
| `tied-bundle/docs/tests-vs-checker-backed-claims.md` | Link to QA canonical definitions |
| `docs/comparisons/anthropic-llm-formal-verification-vs-tied-agent-management.md` | Phase **2** row → **Done** |
| `tied-project/requirements/` … `implementation-decisions/` | LEAP: new satisfaction criteria + IMPL sidecar block `RECORD_CHECKER_CLAIM_VOCAB` |
| `tied-project/citdp/CITDP-REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE.yaml` | Update `desired_behavior` for Phase 2 |
| `tools/bootstrap/lib/tests-checker-claim-compose-doc.test.mjs` | RED→GREEN vocab markers |
| `CHANGELOG.md` | [Unreleased] Phase 2 bullet |
| MCP schemas, envelope artifact kinds | **Unchanged** |

**Risk:**

| Risk | Mitigation |
| --- | --- |
| Vocab implies TIED runs Rocq/Verus | Non-implication rows; **proof boundary**; comparison **Explicit non-adoptions** |
| **`theorem statement`** confused with **`tied_verify`** | Naming bridge + link to **person-branch** / sponsor acceptance |
| Guide ↔ glossary drift | Contract test asserts bridges + bidirectional links |

**LEAP:** Extend [REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE](../../../requirements/REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE.yaml) — status **In Progress** during work, **Implemented** after verify. New criteria (ids):

- `SC-VOCAB-CHECKER-CLAIM` — QA row + bridge `CHECKER_BACKED_CLAIM`
- `SC-VOCAB-THEOREM-STATEMENT` — QA row + bridge `THEOREM_STATEMENT` + person-branch note
- `SC-VOCAB-GUIDE-BIDIRECTIONAL` — guide ↔ `quality-assurance.md`

**CITDP persist:** Update existing `CITDP-REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE.yaml` after implementation (same file, Phase 2 `desired_behavior`).

---

## Test strategy (doc + vocab)

1. **RED contract test** — extend `tests-checker-claim-compose-doc.test.mjs`:
   - `quality-assurance.md` contains `CHECKER_BACKED_CLAIM` and `THEOREM_STATEMENT` (or exact preferred-term row markers agreed in IMPL)
   - Non-implication text (e.g. does not imply **`tied_verify`** / checklist gate pass)
   - Guide links to `quality-assurance.md`
   - Comparison Phase 2 **Done** (after doc edit)
2. **Run:** `node --test tools/bootstrap/lib/tests-checker-claim-compose-doc.test.mjs`
3. **Pseudocode:** `pseudocode_validate` on updated IMPL sidecar before marking complete
4. **YAML:** `lint_yaml` on changed project YAML; **`tied_validate_consistency`**
5. **VALIDATE (vocab):** Touchpoint 3 — grep docs/tests for demoted synonyms; reconcile alphabet index in `domain-references.md`

No new MCP tools; no composition/E2E (doc-only).

---

## Implement (build-plan entry)

**Order:** Gate note recorded → RED tests → vocab RECORD → LEAP YAML + sidecar → guide + comparison links → GREEN tests → validation → traceable commit (scoped paths below).

```mermaid
flowchart LR
  red[RED_contract_test]
  vocab[RECORD_QA_glossary]
  leap[LEAP_REQ_ARCH_IMPL]
  docs[Guide_and_comparison]
  green[GREEN_tests]
  validate[tied_validate_consistency]
  red --> vocab --> leap --> docs --> green --> validate
```

### Scoped commit paths (exclude unrelated drift)

```
CHANGELOG.md
docs/comparisons/anthropic-llm-formal-verification-vs-tied-agent-management.md
tied-bundle/docs/tests-vs-checker-backed-claims.md
tools/bootstrap/lib/tests-checker-claim-compose-doc.test.mjs
tied-project/vocab/quality-assurance.md
tied-project/vocab/domain-references.md
tied-project/vocab/routing.md
tied-project/requirements.yaml
tied-project/requirements/REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE.yaml
tied-project/architecture-decisions.yaml
tied-project/architecture-decisions/ARCH-TIED_TESTS_CHECKER_CLAIM_COMPOSE.yaml
tied-project/implementation-decisions.yaml
tied-project/implementation-decisions/IMPL-TIED_TESTS_CHECKER_CLAIM_COMPOSE.yaml
tied-project/implementation-decisions/IMPL-TIED_TESTS_CHECKER_CLAIM_COMPOSE-pseudocode.md
tied-project/citdp/CITDP-REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE.yaml
tied-project/working/REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE/
```

### Proof boundary

Phase 2 **does not** implement external proof checkers, envelope receipt types, or formal-methods matrix rows. Vocab improves **RESOLVE/VALIDATE** only; TIED effectiveness vs Anthropic FV remains **`not_measured`**.

---

## Next after Phase 2

Phase 3 (**Defer**): methodology-composition-matrix row, request evidence envelope external proof receipt (**add-feature**), 36-task benchmark (research).
