# Session handoff — REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE (Anthropic FV Wave 3)

**Date:** 2026-10-26  
**REQ:** [REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE](../../../../requirements/REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE.yaml)  
**Current plan:** [PLAN-refine-phase3.md](../PLAN-refine-phase3.md) · **Tracker:** [checklist-tracker-phase3.yaml](../checklist-tracker-phase3.yaml)

---

## Arc (context)

| Stage | Status | Evidence |
| --- | --- | --- |
| Waves 1–2 comparison | **Committed** `ff242d5b` (+ handoff sync `688d9141`) | [DOC-ANTHROPIC-FORMAL-VERIFICATION-COMPARISON/evidence/close-out-handoff.md](../../DOC-ANTHROPIC-FORMAL-VERIFICATION-COMPARISON/evidence/close-out-handoff.md) |
| Wave 3 Phase 1 (guide + tokens) | **Committed** `146ba7ff` | [close-out-handoff.md](./close-out-handoff.md) |
| Wave 3 Phase 2 (vocab RECORD) | **Implemented, uncommitted** | [build-plan-phase2-handoff.md](./build-plan-phase2-handoff.md) |
| Wave 3 Phase 3 (MCM row + envelope advisory) | **Refine-plan complete** — **not implemented** | [refine-phase3-pre-implementation-gate.json](./refine-phase3-pre-implementation-gate.json) |

---

## Done — Phase 1 (committed)

- Guide [tests-vs-checker-backed-claims.md](../../../../tied-bundle/docs/tests-vs-checker-backed-claims.md), index/cross-links, comparison Phase 1 **Done**
- Tokens `REQ/ARCH/IMPL-TIED_TESTS_CHECKER_CLAIM_COMPOSE`; contract test green at close-out

---

## Done — Phase 2 (workspace, not committed)

- **Vocab:** [quality-assurance.md](../../../../vocab/quality-assurance.md) — `CHECKER_BACKED_CLAIM`, `THEOREM_STATEMENT`; [domain-references.md](../../../../vocab/domain-references.md), [routing.md](../../../../vocab/routing.md)
- **Guide:** bidirectional links in [tests-vs-checker-backed-claims.md](../../../../tied-bundle/docs/tests-vs-checker-backed-claims.md)
- **Comparison:** Phase 2 row → **Done** in [anthropic comparison](../../../../docs/comparisons/anthropic-llm-formal-verification-vs-tied-agent-management.md)
- **LEAP:** REQ satisfaction criteria + IMPL sidecar `RECORD_CHECKER_CLAIM_VOCAB`; CITDP updated for Phase 2
- **Verify:** `node --test tools/bootstrap/lib/tests-checker-claim-compose-doc.test.mjs` — **pass** (6/6); `pseudocode_validate IMPL-TIED_TESTS_CHECKER_CLAIM_COMPOSE` — ok (per [build-plan-phase2-handoff.md](./build-plan-phase2-handoff.md))

---

## Done — Phase 3 (refine only)

| Artifact | Purpose |
| --- | --- |
| [PLAN-refine-phase3.md](../PLAN-refine-phase3.md) | MCM §2 row **16**, envelope `proof_kind` advisory, test strategy, implement order |
| [CITDP-REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE-phase3-draft.yaml](../CITDP-REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE-phase3-draft.yaml) | CITDP for gates; persist to `citdp/` after implement |
| [test-strategy-phase3.md](../test-strategy-phase3.md) | RED/GREEN command battery |
| [refine-phase3-pre-implementation-gate.json](./refine-phase3-pre-implementation-gate.json) | `pre_implementation` **allowed: true** (source `validateChecklistGate`; rebuild MCP if CLI dist stale) |

**Sponsor scope (locked):** MCM formal-methods row + envelope checker-backed compose — **exclude** in-repo 36-task benchmark.

**Not started:** RED tests, new ARCH/IMPL tokens, matrix row 16, `mcp-server` validate hooks, comparison Phase 3 **Done** rows.

---

## Completion signals (overall REQ arc)

| Signal | Phase 1 | Phase 2 | Phase 3 (when built) |
| --- | --- | --- | --- |
| Machine close-out (gate + envelope) | Not run | Not run / blocked (no envelope) | Optional defer; advisory MCP only |
| Process contract | Pass | Pass (doc test) | Pending implement |
| Adherence ledger | not_run | not_run | not_run |

---

## Resume (recommended order)

1. **`@build-plan`** from [PLAN-refine-phase3.md](../PLAN-refine-phase3.md): RED → TIED YAML (`ARCH/IMPL-TIED_CHECKER_BACKED_ENVELOPE_PROOF`, LEAP REQ + MCM 16 rows) → code/docs → GREEN.
2. **Commit strategy:** Either one scoped commit **Phase 2 + Phase 3** or **Phase 2 first** (paths below), then Phase 3 delta from PLAN-refine-phase3 scoped list.
3. **Before verification gate:** complete `gate-pseudocode-validation` on new IMPL sidecar; run full test battery in [test-strategy-phase3.md](../test-strategy-phase3.md).
4. **Defer:** 36-task Anthropic FV benchmark; `fail_on_independent_proof_errors` on validate.

---

## Staging map (Phase 2 + working folder — merge with Phase 1 list as needed)

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

**Phase 3 implement adds** (see PLAN-refine-phase3): `methodology-composition-matrix.md`, new bootstrap matrix test, `mcp-server/.../request-evidence-envelope/*`, new ARCH/IMPL checker envelope YAML, optional LEAP on `REQ-TIED_METHODOLOGY_COMPOSITION_MATRIX`.

---

## Proof boundary

Passing TIED tests, checklist gates, or **`tied_verify`** does **not** imply checker-backed / formal-verification outcomes (**`not_measured`** vs Anthropic-reported metrics). Phase 3 envelope slots are **metadata-only** compose on [REQ-TIED_OPEN_ONTOLOGIES_WAVE3](../../../../requirements/REQ-TIED_OPEN_ONTOLOGIES_WAVE3.yaml) — no Rocq/Verus execution or gate wiring.

---

## Feedback

**N/A** — no upstream feedback ingest for this compose arc.
