# Grammar v2 migration guide (v1 → v2 opt-in)

**Traceability:** [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE], [ARCH-PSEUDOCODE_GRAMMAR_V2]  
**Related:** [pseudocode-grammar.v1.md](pseudocode-grammar.v1.md), [pseudocode-grammar.v1-typed-flow-extension.md](pseudocode-grammar.v1-typed-flow-extension.md), [pseudocode-grammar.v2.md](pseudocode-grammar.v2.md)

This guide documents the **opt-in** path from grammar v1 (with optional typed-flow extension) to grammar v2. **No mass migration is required** — v1 sidecars continue to parse and analyze unchanged.

---

## When to migrate

Migrate a sidecar to v2 when you need:

- Refinement predicates on types or contract rows (case 12)
- Interprocedural procedure summaries (DF-CALL-001, DF-RET-001)
- Alias policy or immutability enforcement (cases 11, 8)
- Constraint-language diagnostics via `constraint_flow: true`

If typed-flow alone suffices, stay on v1 + [typed-flow extension](pseudocode-grammar.v1-typed-flow-extension.md).

---

## Minimal migration steps

1. **Copy** the sidecar (do not mutate qualification client trees in place).
2. Add the version header as the **first non-comment line** in the preamble:

   ```text
   Grammar-Version: v2
   ```

3. **Retain** all existing v1 procedure headings, contract rows, and control flow.
4. **Add** Tier-2 typed annotations if not already present (`constraint_flow` requires `typed_flow`).
5. **Add** constraint constructs incrementally:
   - Refinement `where` clauses on typed INPUT/DATA/POST rows
   - `SUMMARY CALL` / `SUMMARY RETURN` blocks where interproc precision is needed
   - `(immutable)` / `(mutable)` on DATA rows
   - `ALIAS POLICY` when case 11 precision is required
6. Run **`pseudocode_validate`** on the sidecar, then **`pseudocode_analyze`** with `typed_flow: true` and `constraint_flow: true` on a copy.
7. Review `sections.constraint_language` diagnostics and `unknowns[]`; remediate or accept unknowns per proof boundary.

---

## What stays on v1 typed-flow extension

These remain valid **without** v2 header:

- Optional `: type` on contract rows
- Expression subset in assignments and IF guards
- Local CALL slot matching (no summaries)
- `sections.typed_flow` diagnostics

Typed-flow Phase 3 behavior (including `typed_gate_errors` rollout) is unchanged for v1 sidecars.

---

## Backward compatibility contract

| Scenario | Expected behavior |
|----------|-------------------|
| No v2 header, all constraint flags false | Identical to typed-flow Phase 3 close-out (`9438d1f` baseline) |
| No v2 header, `constraint_flow: true` | Zero constraint diagnostics (CL-6) |
| v2 header, `constraint_flow: false` | Parse v2 syntax; no constraint section emitted |
| v2 header, `constraint_flow: true`, `typed_flow: true` | Full constraint pass |

---

## Authoring burden (F11)

Before enabling production `constraint_gate_errors` (sub-phase 3d), complete the F11 retrofit study:

- **5–8 procedures** from real sidecars (copies only)
- **Median ≤15** annotation lines per procedure (stop if >15)
- **Median ≤25** authoring decisions per procedure
- **SP-1..SP-7** semantic preservation — any fail → REVISE

See `working/REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE/constraint-measurement-report.md` (Slice 8).

---

## Template note

`templates/impl-essence-pseudocode-template.md` notes v2 as **optional**; v1 remains the default for new IMPL sidecars unless constraint-language precision is required.
