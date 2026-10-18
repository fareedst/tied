# Context-adaptive engineering (CASE / EDSE layer) (canonical)

**Scope:** Domain vocabulary for the optional **context-adaptive practice layer** around TIED—not a replacement methodology. Aligns with research doc [context-adaptive-software-engineering.md](../../docs/methodologies/context-adaptive-software-engineering.md) (EDSE working name).

**Traceability:** `[REQ-TIED_CONTEXT_ADAPTIVE_ENGINEERING]` · `[ARCH-TIED_CONTEXT_ADAPTIVE_ENGINEERING]` · `IMPL-TIED_CONTEXT_ADAPTIVE_*` · `[PROC-CONTEXT_ADAPTIVE_PRACTICE]`

**Status:** RECORD plan-close-out (2026-10-18); VALIDATE before traceable commit.

**See also:** [`routing.md`](routing.md) (row **2g**) · [`easar-recovery.md`](easar-recovery.md) (first dogfood) · [`quality-assurance.md`](quality-assurance.md) (evaluation dimensions) · [`fidelity-research.md`](fidelity-research.md) (independent verification vs selector output)

---

## Terms

| Term | Definition | TIED preferred name |
| --- | --- | --- |
| **Practice contract** | Versioned YAML describing when a practice applies, prerequisites, TIED PROC/tool bindings, evidence obligations, compatibility edges, cost/stop criteria, limitations, and proof boundary. | `practice-contract.v1`; IDs `PRACTICE-*` (not semantic tokens unless later REQ extends registry) |
| **Context profile** | Normalized snapshot of objective, mandatory constraints, scope, and dimension ratings (`LOW` \| `MEDIUM` \| `HIGH` \| `UNKNOWN`) with observation refs and confidence. | `context-profile.v1` |
| **Deterministic practice selection** | Rule-ordered selector: hard constraints → applicability → prerequisites/compatibility → stable receipt; identical inputs → identical output. | `selection-receipt.v1` |
| **Checkpoint reassessment** | Compare immutable profile snapshots; emit selection delta and explicit action (`unchanged`, `revise_plan`, `loop_back`, `stop_for_review`); never silently rewrite prior receipts. | `reassessment-receipt.v1` |
| **Method-effectiveness readout** | Links conformance evidence to outcome observations via methodology-learning + pairing records; does **not** collapse product quality, evidence quality, appropriateness, and efficiency into one score. | Existing `[REQ-METHODOLOGY-CONFORMANCE-EFFECTIVENESS-PAIRING]` surface |
| **Dogfood (CASE pilot)** | Condition B (rule-selected) vs fixed-workflow baseline on comparable EASAR slices; no causal improvement claim from one run. | Working folder under `REQ-TIED_CONTEXT_ADAPTIVE_ENGINEERING` + `[REQ-TIED_EASAR_RECOVERY]` receipts |

### Context profile dimensions (v1)

Each dimension uses `LOW` | `MEDIUM` | `HIGH` | `UNKNOWN` with observation/evidence refs and confidence:

| Dimension | Selector use (summary) |
| --- | --- |
| **Uncertainty** | Favor discovery/characterization practices when HIGH or UNKNOWN |
| **Criticality** | UNKNOWN → conservative rigor (never map to LOW) |
| **Coupling** | Favor composition/module-validation depth when HIGH |
| **Concurrency** | Favor async-contract and stress practices when HIGH |
| **Observability** | Favor envelope/quality-evidence practices when LOW |
| **Reversibility** | Favor strict TDD vs pilot waivers when LOW reversibility |
| **Environmental** | Brownfield/OEE stress; may arm BFIE-related practices |
| **Rate of change** | Favor reassessment checkpoints when HIGH |
| **Security** | UNKNOWN → mandatory security-profile validation path or explicit waiver |

---

## Proof boundaries

- Selector output is **advisory** for checklist/gate authority in v1; it does not auto-activate checklist steps or change assurance profiles.
- `UNKNOWN` on criticality or security dimensions must not be treated as `LOW` in selector rules or tests.
- Composition matrix proof boundary applies: no ISO/CMMI certification, behavioral equivalence, or universal method superiority claims.
