# Capability matrix — data-flow properties

**Study:** PSEUDOCODE-CONSTRAINT-STUDY  
**Legend:** ✓ = supported today (Layer C) · T = requires typed/constraint syntax · ✗ = outside proof boundary (permanent non-claim)

| Data-flow property | Currently possible (Layer C @ 7f3d5b0) | Requires typed/constraint syntax | Outside proof boundary |
|--------------------|----------------------------------------|----------------------------------|------------------------|
| Parse assignments/control flow into IR | ✓ (opaque strings) | — | — |
| Resolve internal CALL targets | ✓ (`UNRESOLVED_CALL` on failure) | — | — |
| Build procedure CFG + reachability | ✓ | — | — |
| Build pseudo-code call graph (CALL/RUN edges) | ✓ | — | — |
| Linear def tagging on assignment | ✓ (single env, no join) | T for join-correct def-use | — |
| Heuristic nullable tag (`null`, `?` in value) | ✓ (warning-level) | T for flow-sensitive proof | — |
| Deref/null-check obligations (string heuristic) | ✓ (warnings) | T for proven null deref | — |
| Read-before-write (substring heuristic) | ✓ (warning) | T for CFG-based proof | — |
| Branch fact merge at join | ✗ | T (bounded typed-flow minimum) | — |
| Loop invariant / carried dependency | ✗ (termination info only) | T (partial bounded / full for strong) | — |
| Assignment type compatibility | ✗ | T | — |
| Record/collection field shape checking | ✗ | T | — |
| CALL argument ↔ parameter flow | ✗ | T | — |
| RETURN ↔ OUTPUT type compatibility | ✗ | T | — |
| PRE/POST predicate satisfaction | ✗ | T (partial bounded / full for rich PRE/POST) | — |
| DATA_TRANSITION enforcement | ✗ | T | — |
| Immutability / mutation policy | ✗ | T (partial / full) | — |
| EFFECTS semantic verification | ✗ (presence warning only) | T (partial) | ✗ (runtime effects) |
| RUN/external input facts | ✗ | — | ✗ (unknown by policy) |
| Opaque natural-language conditions | ✗ | — | ✗ (unknown by policy) |
| Aliasing / pointer equality | ✗ | T (optional alias policy) | ✗ if unmodeled |
| Quantified / refinement predicates | ✗ | — | ✗ in bounded; T in full only |
| Interprocedural summary propagation | ✗ | T (full) or partial signatures (bounded) | — |
| Complete path coverage | ✗ | — | ✗ |
| Runtime / test truth | ✗ | — | ✗ |
| Behavioral correctness proof | ✗ | — | ✗ |
| Dynamic dispatch resolution | ✗ | — | ✗ |
| Host-language type system | ✗ | — | ✗ |

---

## Highlights

**Currently possible** is limited to syntactic/structural data-flow **characterization**: symbols, CFG, call graph, linear heuristics, obligations for tests — not reliable typed validation.

**Requires typed/constraint syntax** covers every check sponsors would label "data-flow validation" in the strict sense.

**Outside proof boundary** items must remain explicit unknowns or non-claims even after bounded or full investment.

---

## Primary question mapping

> Is reliable data-flow validation feasible with the current pseudo-code format and Layer C pipeline?

**No** for reliable typed validation. **Partial yes** for heuristic characterization already shipped. Feasibility of *reliable* validation requires at minimum bounded typed-flow extensions and CFG-based analysis consuming the existing CFG artifact.
