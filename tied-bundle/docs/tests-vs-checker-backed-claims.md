# Tests vs checker-backed claims

**Audience:** Operators, agents, and sponsors interpreting verification outcomes after TDD, checklist gates, or external formal-verification research.

**Traceability:** [REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE](../../tied-project/requirements/REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE.yaml) · Anthropic comparison [Wave 3](../../docs/comparisons/anthropic-llm-formal-verification-vs-tied-agent-management.md#phased-recommendations-doc-first) (Phase 1 guide, Phase 2 vocab)

---

## Proof boundary

| In scope | Out of scope |
| --- | --- |
| **Claim-class vocabulary** for handoffs, comparisons, and evidence manifests | Mandatory Rocq, Verus, or Z3 gates in TIED |
| Compose with **`pseudocode_validate`**, **`tied_verify`**, and **proof boundary** in [quality-assurance](../../tied-project/vocab/quality-assurance.md) | Replacing **`tied_checklist_gate_validate`** with an external proof checker |
| Honest use of vendor **Anthropic-reported** formal verification metrics | Treating vendor proof scale as **`tied_verify`** or stdd effectiveness (**`not_measured`**) |

This guide is **normative prose** for humans and agents. It does **not** add MCP gate authority.

---

## Claim classes

**Canonical vocab (Phase 2):** [`CHECKER_BACKED_CLAIM` and `THEOREM_STATEMENT`](../../tied-project/vocab/quality-assurance.md#formal-verification-compose-external) in [quality-assurance.md](../../tied-project/vocab/quality-assurance.md).

Use these labels in comparisons, gate receipts, and sponsor handoffs:

| Class | What it establishes | Typical sources | Does **not** imply |
| --- | --- | --- | --- |
| **Empirical test pass** | Observed behavior on executed examples | Unit/composition/E2E tests, CI | Exhaustive input space, binary crash-freeness, all branches unreachable |
| **Static IMPL check** | Pseudo-code shape and contract markers vs checklist | **`pseudocode_validate`**, analyze tools | Runtime correctness, SMT discharge, machine-checked theorems |
| **Checklist / gate receipt** | Process step allowed or blocked for a scoped change | **`tied_checklist_gate_validate`**, gate JSON | Product shipped, domain truth, formal equivalence of builds |
| **Consistency validation** | REQ/ARCH/IMPL index and detail graph coherent | **`tied_validate_consistency`** | Tests passed, proofs exist, sponsor intent satisfied |
| **Verification-gated status** | REQ/IMPL status derived from project verify policy | **`tied_verify`** when enrolled | External proof checker pass, fuzzing displacement |
| **Checker-backed claim** | Theorem discharged by an external proof engine | Rocq, Verus+Z3, vendor proof artifacts (**external**) | TIED checklist completion unless explicitly wired via scoped REQ |
| **Vendor-reported research** | Metrics from outreach captures | **Anthropic-reported** appendix figures | Independent reproduction in your workspace unless documented |

**Non-implication (Anthropic FV compose):** The injection study (**Anthropic-reported**: five of seven bugs survived random tests; seven of seven broke proofs) supports **tests ≠ checker-backed claims**. Passing TIED tests does **not** establish binary crash-freeness or ASan/normal equivalence theorems.

---

## TIED surfaces (reference)

| Question | TIED surface | Notes |
| --- | --- | --- |
| What did we prove in-repo? | Tests + gate receipts + envelopes | Cite **proof boundary** per evidence item |
| Did pseudo-code validate? | **`pseudocode_validate`** | Static/spec layer — not Rocq |
| Did the change meet REQ criteria? | **`tied_verify`** when verification-gated | Policy-derived status |
| Did an external paper prove crash-freeness? | Outreach only unless client integrates | Label **Checker-backed claim** / **Anthropic-reported**; **`not_measured`** for TIED adoption |
| Short spec before large agent mint? | REQ criteria + concise IMPL blocks | Compose with median ~110-line spec pattern (**Anthropic-reported** analogy) |

---

## Envelope compose

**Schema:** `request-evidence-envelope.v1` optional `independent_proofs[]` ([ARCH-TIED_INDEPENDENT_PROOF_ENVELOPE](../../tied-project/architecture-decisions/ARCH-TIED_INDEPENDENT_PROOF_ENVELOPE.yaml)). Metadata-only — TIED does **not** execute Rocq, Verus, or Z3 when patching or validating.

| `proof_kind` | Maps to vocab | Notes |
| --- | --- | --- |
| `checker_backed_claim` | **CHECKER_BACKED_CLAIM** | Requires non-empty **`proof_boundary`** on the record |
| `theorem_statement_metadata` | **THEOREM_STATEMENT** | Spec/theorem text metadata; optional `verifier_hint` |

**Patch flow:** use MCP **`request_evidence_envelope_independent_proof_patch`** with a scoped `request_token` and project root. **`validateRequestEvidenceEnvelope`** adds **advisory** warn gaps for unknown `proof_kind` or missing `proof_boundary` on checker-backed records — it **does not imply** **`tied_verify`** pass or **`tied_checklist_gate_validate`** completion.

Example record (illustrative):

```json
{
  "proof_id": "anthropic-fv-example-1",
  "role": "asserted",
  "proof_kind": "checker_backed_claim",
  "locator": { "uri": "vendor://proof-artifact/example" },
  "scope_limits": ["external", "Anthropic-reported"],
  "proof_boundary": "Vendor proof only; not stdd tied_verify or checklist gate",
  "review_status": "pending"
}
```

---

## Related documents

- [Quality assurance vocabulary (canonical)](../../tied-project/vocab/quality-assurance.md)
- [Anthropic LLM formal verification × TIED](../../docs/comparisons/anthropic-llm-formal-verification-vs-tied-agent-management.md)
- [Anthropic appendix capture (sibling)](../../docs/comparisons/anthropic-llm-formal-verification-appendix.md)
- [Writing and validating IMPL pseudo-code](pseudocode-writing-and-validation.md)
- [Pre-handoff verification charter](pre-handoff-verification-charter.md)
- [External service three-wave comparison template](external-service-three-wave-comparison-template.md)
- [Client development index](client-development-index.md)
