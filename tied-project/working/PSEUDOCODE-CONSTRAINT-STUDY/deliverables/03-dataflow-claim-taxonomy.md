# Data-flow claim taxonomy

**Study:** PSEUDOCODE-CONSTRAINT-STUDY  
**Scope:** Static, deterministic checks over pseudo-code IR within declared **proof boundary** — not runtime truth, not complete path coverage, not behavioral proof.

---

## Outcome taxonomy

| Outcome | Meaning | Report representation |
|---------|---------|------------------------|
| **Definite error** | Violation proven within proof boundary and budgets | `diagnostics[]`, severity `error`; fails `gate_mode` |
| **Conservative warning** | Likely issue or obligation; not proven violation | `diagnostics[]`, severity `warning` or `info` |
| **Unknown** | Analysis cannot decide; first-class disclosure | `unknowns[]` with `cause`, `proof_boundary`, span |
| **Non-claim** | Out of scope permanently | Absent from diagnostics; documented in proof boundary |

**Unknown policy:** Never implicit success. Distinct from warnings and definite errors.

---

## Candidate check catalog

| Check ID | Description | Today (Layer C) | With bounded typed-flow | With full constraints | Typical outcome class today |
|----------|-------------|-----------------|-------------------------|----------------------|----------------------------|
| DF-ASSIGN-001 | Assignment target/value type compatibility | No | Yes (structured expr) | Yes | Non-claim / unknown |
| DF-DECL-001 | Declaration before use (local symbols) | Partial (read-before-write heuristic) | Yes (def-use on CFG) | Yes | Warning (heuristic) |
| DF-NULL-001 | Nullable flow to non-null use | Partial (substring nullable tag) | Yes (nullable lattice + join) | Yes | Warning / unknown |
| DF-SHAPE-001 | Record field presence on use | No | Yes (optional shape tags) | Yes | Non-claim |
| DF-COLL-001 | Collection element shape compatibility | No | Yes (element type tag) | Yes | Non-claim |
| DF-BRANCH-001 | Branch join incompatible facts | No | Yes (join + ⊥/unknown) | Yes | Unknown (no join today) |
| DF-LOOP-001 | Loop carried dependency / invariant | No | Partial ( widen / unknown ) | Yes (invariants) | Unknown (`TERMINATION_UNKNOWN` info only) |
| DF-CALL-001 | CALL argument count/slot types | No | Yes (optional callee signature) | Yes | Non-claim |
| DF-RET-001 | RETURN value vs OUTPUT/POST | No | Partial (OUTPUT type tag) | Yes (refinement) | Non-claim |
| DF-PRE-001 | PRE satisfied at entry | No | Partial (simple predicates) | Yes | Non-claim |
| DF-POST-001 | POST satisfied at exit | No | Partial | Yes | Non-claim |
| DF-STATE-001 | DATA_TRANSITION consistency | No | Partial (tagged state fields) | Yes | Non-claim |
| DF-MUT-001 | Mutation vs declared immutability | No | Partial (mut flags) | Yes | Non-claim |
| DF-EFFECT-001 | EFFECTS vs CALL/RUN behavior | Partial (presence warning) | Partial | Yes | Warning |
| DF-EXT-001 | External/RUN input facts | N/A | Unknown by policy | Unknown by policy | Unknown / info (`UNRESOLVED_RUN`) |
| DF-OPAQUE-001 | Opaque string condition truth | No | Unknown | Unknown | Unknown |
| DF-ALIAS-001 | Pointer/alias equality | No | Unknown unless alias policy | Optional alias domain | Non-claim / unknown |

---

## Explicit exclusions (permanent non-claims)

| Exclusion | Rationale |
|-----------|-----------|
| Runtime input truth | Static analysis of sidecar text only |
| Arbitrary side effects | EFFECTS row is declarative; not verified against host language |
| Unmodeled aliasing | No alias graph in grammar v1 or current IR |
| Dynamic dispatch | CALL resolves to UPPER_SNAKE procedures only |
| Complete path coverage | Budgets truncate CFG/paths; loops marked unknown |
| Behavioral / test proof | proof boundary excludes test execution and runtime |
| TIED dependency graph correctness | Layer A/B concern, not data-flow |
| Host-language type checking | Out of scope for pseudo-code analyzer |

---

## Mapping to existing diagnostic codes

Current Layer C codes related to data-flow **characterization** (not typed proof):

- `READ_BEFORE_WRITE` — conservative warning
- `DEREF_OBLIGATION`, `NULL_CHECK_OBLIGATION` — conservative warning
- `CONTRADICTORY_PATH` — definite error only when `strict_paths: true`
- `EFFECT_MISMATCH`, `FAILURE_PROPAGATION_GAP` — conservative warning
- `TERMINATION_UNKNOWN` — info / unknown characterization
- Budget causes in `unknowns[]` — unknown

---

## Proof-boundary classification rule

For each candidate check:

1. If provable from grammar v1 opaque IR → classify current capability honestly (usually **non-claim** or **unknown**).
2. If requires structured expression/type syntax → **requires typed/constraint syntax**.
3. If requires runtime or full path enumeration → **outside proof boundary**.
