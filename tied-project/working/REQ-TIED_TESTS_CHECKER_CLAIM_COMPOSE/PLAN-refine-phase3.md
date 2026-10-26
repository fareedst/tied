# REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE — refined plan (Wave 3 Phase 3)

| Field | Value |
| --- | --- |
| **REQ** | [REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE](../../../requirements/REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE.yaml) (LEAP extend — no new REQ mint) |
| **Linked Cursor plan** | `/Users/fareed/.cursor/plans/anthropic_fv_phase_3_ea79b24f.plan.md` |
| **Refined** | 2026-10-26 |
| **Source** | [session-handoff.md](./evidence/session-handoff.md) · [anthropic comparison Phase 3](../../../docs/comparisons/anthropic-llm-formal-verification-vs-tied-agent-management.md#phased-recommendations-doc-first) |
| **Prior pass** | Phase 2 [PLAN-refine-phase2.md](./PLAN-refine-phase2.md) (vocab RECORD — implemented, uncommitted) |
| **Tracker (implement)** | [checklist-tracker-phase3.yaml](./checklist-tracker-phase3.yaml) |
| **CITDP (draft for gates)** | [CITDP-REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE-phase3-draft.yaml](./CITDP-REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE-phase3-draft.yaml) |
| **Change class** | MCM doc row + **advisory** envelope `independent_proofs` compose — no gate authority |
| **profile_depth** | `minimal` |
| **gate_policy** | `advisory` (MCP validate extension; external metadata only) |

---

## Refine (Touchpoint 1 — RESOLVE)

**PRELOAD (session):** [quality-assurance.md](../../../vocab/quality-assurance.md), [tests-vs-checker-backed-claims.md](../../../tied-bundle/docs/tests-vs-checker-backed-claims.md), [ARCH-TIED_INDEPENDENT_PROOF_ENVELOPE](../../../architecture-decisions/ARCH-TIED_INDEPENDENT_PROOF_ENVELOPE.yaml).

| Anthropic / outreach term | TIED canonical term | Layer | Notes |
| --- | --- | --- | --- |
| External proof receipt (Rocq·Verus artifact) | **`independent_proofs[]`** with `proof_kind: checker_backed_claim` | Envelope v1 | Compose on [REQ-TIED_OPEN_ONTOLOGIES_WAVE3](../../../requirements/REQ-TIED_OPEN_ONTOLOGIES_WAVE3.yaml); **metadata-only** |
| Theorem text without discharge | `proof_kind: theorem_statement_metadata` (optional) | Envelope v1 | Links to **theorem statement** QA row; not a checker-backed claim |
| Formal verification / proof-checker loop | **§2 row 16** in [methodology-composition-matrix.md](../../../docs/comparisons/methodology-composition-matrix.md) | Outreach | LEAP [REQ-TIED_METHODOLOGY_COMPOSITION_MATRIX](../../../requirements/REQ-TIED_METHODOLOGY_COMPOSITION_MATRIX.yaml) **15 → 16** §2 rows |
| 36-task OSS-Fuzz-style bench | **Defer** | Research | Explicit non-goal; comparison Phase 3 row stays **Defer** for benchmark only |

**Sponsor decision (recorded):** Implement **MCM row + envelope advisory** only; **exclude** in-repo 36-task harness (Cursor plan `anthropic_fv_phase_3_ea79b24f.plan.md`).

**Ambiguity cleared:** Phase 3 scope is matrix row 16, guide envelope subsection, advisory validate gaps, comparison Phase 3 **Done** for matrix + envelope rows — not Rocq gates, not `fail_on_independent_proof_errors` (defer to future REQ).

**Adversarial / depth:** `depth_tier: minimal`; `eligibility_triggers_matched: mcp_tool_surface`; integrated inquiry **not_applicable** — advisory gaps only.

**Consequence ladder:**

| Decision | Class | Default |
| --- | --- | --- |
| LEAP same REQ + MCM row count | Reversible | Proceed at **build-plan** |
| New ARCH/IMPL checker envelope tokens | Reversible | Proceed |
| Mint new REQ for Phase 3 | Costly | **Decline** (same arc as Phase 2) |
| Machine close-out with envelope | Costly | **Defer** unless sponsor promotes at implement |
| 36-task benchmark | Costly | **Defer** |

**Distinct from Phase 2:** Phase 2 was vocab-only; Phase 3 adds **MCP advisory validation** and **matrix row 16** while preserving checklist/`tied_verify` authority.

### Gate (refine-plan)

`tied_checklist_gate_validate` → `phase: pre_implementation`, CITDP [phase3 draft](./CITDP-REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE-phase3-draft.yaml), tracker [checklist-tracker-phase3.yaml](./checklist-tracker-phase3.yaml).

Evidence: [refine-phase3-pre-implementation-gate.json](./evidence/refine-phase3-pre-implementation-gate.json)

| Result | Meaning |
| --- | --- |
| **`allowed: true`** | CITDP adversarial section valid; minimal/advisory; canonical tracker slugs (source validator 2026-10-26) |
| **Still pending at implement** | `gate-pseudocode-validation` until **IMPL-TIED_CHECKER_BACKED_ENVELOPE_PROOF** sidecar + `pseudocode_validate` |

**Note:** Re-run `tied_checklist_gate_validate` after `mcp-server` rebuild if IDE MCP dist lags source (stale dist may falsely report `invalid_slug:close_out`).

---

## Plan (CITDP)

**Impact:**

| Area | Blast radius |
| --- | --- |
| [methodology-composition-matrix.md](../../../docs/comparisons/methodology-composition-matrix.md) | §2 **row 16** — e.g. “LLM-scale formal verification / proof-checker compose (Anthropic FV)”; **Composable**; links to Anthropic comparison, guide, `independent_proofs`, rows 11/13/15; **Anthropic-reported** / **`not_measured`** in `sponsor_notes` |
| [anthropic comparison](../../../docs/comparisons/anthropic-llm-formal-verification-vs-tied-agent-management.md) | Phase **3** matrix + envelope rows → **Done** (benchmark row remains **Defer**) |
| [tests-vs-checker-backed-claims.md](../../../tied-bundle/docs/tests-vs-checker-backed-claims.md) | **Envelope compose** subsection + example JSON |
| [quality-assurance.md](../../../vocab/quality-assurance.md) | Cross-link `proof_kind` ↔ `CHECKER_BACKED_CLAIM` |
| `mcp-server/src/request-evidence-envelope/` | `proof-kinds.ts`, validate advisory hook, tests |
| [REQ-TIED_METHODOLOGY_COMPOSITION_MATRIX](../../../requirements/REQ-TIED_METHODOLOGY_COMPOSITION_MATRIX.yaml) | SC-MCM-DOC **15 → 16** |
| Project REQ/ARCH/IMPL | LEAP satisfaction criteria + **ARCH/IMPL-TIED_CHECKER_BACKED_ENVELOPE_PROOF** + sidecar `COMPOSE_CHECKER_ENVELOPE_PROOF` |
| [CITDP-REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE.yaml](../../../citdp/CITDP-REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE.yaml) | Persist after implement (merge phase3 draft) |

**Risk:**

| Risk | Mitigation |
| --- | --- |
| Envelope receipt implies **`tied_verify`** | Guide + QA non-implication; advisory gap codes; comparison proof boundary |
| **`verified_offline`** read as TIED proof | No auto-promotion; document person-branch / offline review only |
| MCM row claims methodology FV | **Composable** disposition; sponsor_notes **not_measured** |
| Duplicate envelope mechanism | Cross-ref **ARCH-TIED_INDEPENDENT_PROOF_ENVELOPE**; extend validate only |

**LEAP:** Extend [REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE](../../../requirements/REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE.yaml) — new criteria:

| ID | Criterion |
| --- | --- |
| `SC-MCM-ROW-16` | §2 row 16 + contract 16 rows; anthropic-fv matrix test green |
| `SC-ENVELOPE-CHECKER-PROOF-KIND` | Advisory validate for unknown/malformed checker-backed records |
| `SC-GUIDE-ENVELOPE-COMPOSE` | Guide documents patch flow + non-implication |

Retain Phase 1–2 criteria (`SC-GUIDE-DOC`, `SC-VOCAB-*`, `SC-COMPOSE-TEST`, etc.).

**Registry (implementation detail):**

| `proof_kind` | Meaning |
| --- | --- |
| `checker_backed_claim` | External proof engine discharge; requires non-empty `proof_boundary` |
| `theorem_statement_metadata` | Spec/theorem text metadata; optional `verifier_hint` |

Unknown kinds → **warn** gap `independent_proof_unknown_proof_kind` (advisory).

---

## Test strategy

1. **RED —** [methodology-composition-matrix-anthropic-fv-row.test.mjs](../../../tools/bootstrap/lib/methodology-composition-matrix-anthropic-fv-row.test.mjs) (16 rows, row 16 links).
2. **RED —** `mcp-server/src/request-evidence-envelope/checker-backed-envelope-proof.test.ts` (advisory gaps + valid record).
3. **RED —** extend [tests-checker-claim-compose-doc.test.mjs](../../../tools/bootstrap/lib/tests-checker-claim-compose-doc.test.mjs) (guide `## Envelope compose`, comparison Phase 3 Done for envelope row).
4. **TIED YAML** — tokens + pseudocode_validate before GREEN code.
5. **GREEN —** matrix, guide, vocab, validate implementation.
6. **Verify:**

```bash
node --test tools/bootstrap/lib/tests-checker-claim-compose-doc.test.mjs
node --test tools/bootstrap/lib/methodology-composition-matrix-anthropic-fv-row.test.mjs
cd mcp-server && npx tsx --test src/request-evidence-envelope/checker-backed-envelope-proof.test.ts
npx tsc -b
```

7. **`lint_yaml`** on changed project YAML; **`tied_validate_consistency`**.

**Composition:** No new MCP tool registration beyond validate behavior; patch tool unchanged except optional pre-check warnings if specified in IMPL.

---

## Implement (build-plan entry)

**Order:** Gate evidence → RED tests → TIED YAML + sidecar → envelope validate code → doc/matrix/guide → GREEN → validation.

```mermaid
flowchart LR
  red[RED_tests]
  yaml[TIED_LEAP_YAML]
  mcp[Envelope_advisory_validate]
  docs[MCM_guide_comparison]
  green[GREEN_tests]
  validate[tied_validate_consistency]
  red --> yaml --> mcp --> docs --> green --> validate
```

### Scoped commit paths (Phase 3 delta; merge with Phase 2 handoff as needed)

```
CHANGELOG.md
docs/comparisons/anthropic-llm-formal-verification-vs-tied-agent-management.md
docs/comparisons/methodology-composition-matrix.md
tied-bundle/docs/tests-vs-checker-backed-claims.md
tools/bootstrap/lib/tests-checker-claim-compose-doc.test.mjs
tools/bootstrap/lib/methodology-composition-matrix-anthropic-fv-row.test.mjs
mcp-server/src/request-evidence-envelope/proof-kinds.ts
mcp-server/src/request-evidence-envelope/validate.ts
mcp-server/src/request-evidence-envelope/checker-backed-envelope-proof.test.ts
tied-project/vocab/quality-assurance.md
tied-project/requirements.yaml
tied-project/requirements/REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE.yaml
tied-project/requirements/REQ-TIED_METHODOLOGY_COMPOSITION_MATRIX.yaml
tied-project/architecture-decisions.yaml
tied-project/architecture-decisions/ARCH-TIED_CHECKER_BACKED_ENVELOPE_PROOF.yaml
tied-project/architecture-decisions/ARCH-TIED_TESTS_CHECKER_CLAIM_COMPOSE.yaml
tied-project/implementation-decisions.yaml
tied-project/implementation-decisions/IMPL-TIED_CHECKER_BACKED_ENVELOPE_PROOF.yaml
tied-project/implementation-decisions/IMPL-TIED_CHECKER_BACKED_ENVELOPE_PROOF-pseudocode.md
tied-project/implementation-decisions/IMPL-TIED_TESTS_CHECKER_CLAIM_COMPOSE-pseudocode.md
tied-project/semantic-tokens.yaml
tied-project/citdp/CITDP-REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE.yaml
tied-project/working/REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE/
```

### Proof boundary

Phase 3 **indexes** external checker-backed metadata in envelopes and **documents** formal-methods **compose** in the matrix. It **does not** run proof checkers, reproduce Anthropic benchmarks, or imply **`tied_verify`** / checklist success from `independent_proofs[]`.

---

## Next after Phase 3

- Scoped **traceable-commit** (Phase 2 + Phase 3 or split per sponsor).
- Optional **`@close-out`** with built envelope if machine gates clear.
- **Defer:** 36-task benchmark; `fail_on_independent_proof_errors` on validate.
