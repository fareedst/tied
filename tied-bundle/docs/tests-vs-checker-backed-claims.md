# Tests vs checker-backed claims

**Audience:** Operators, agents, and sponsors interpreting verification outcomes after TDD, checklist gates, or external formal-verification research.

**Traceability:** [REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE](../../tied-project/requirements/REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE.yaml) · Anthropic comparison [Wave 3 Phase 1](../../docs/comparisons/anthropic-llm-formal-verification-vs-tied-agent-management.md#phased-recommendations-doc-first)

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

## Related documents

- [Anthropic LLM formal verification × TIED](../../docs/comparisons/anthropic-llm-formal-verification-vs-tied-agent-management.md)
- [Anthropic appendix capture (sibling)](../../docs/comparisons/anthropic-llm-formal-verification-appendix.md)
- [Writing and validating IMPL pseudo-code](pseudocode-writing-and-validation.md)
- [Pre-handoff verification charter](pre-handoff-verification-charter.md)
- [External service three-wave comparison template](external-service-three-wave-comparison-template.md)
- [Client development index](client-development-index.md)
