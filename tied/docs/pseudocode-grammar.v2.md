# Pseudo-code grammar v2 (`pseudocode-grammar.v2`)

**Status:** Specification — opt-in via sidecar header  
**Traceability:** [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE], [ARCH-PSEUDOCODE_GRAMMAR_V2], [IMPL-PSEUDOCODE_GRAMMAR_V2]  
**Predecessor:** [pseudocode-grammar.v1.md](pseudocode-grammar.v1.md), [pseudocode-grammar.v1-typed-flow-extension.md](pseudocode-grammar.v1-typed-flow-extension.md)  
**Migration:** [pseudocode-grammar-v2-migration.md](pseudocode-grammar-v2-migration.md)

Grammar v2 extends v1 and the v1 typed-flow extension with **refinement predicates**, **interprocedural summaries**, **alias policy**, and **immutability annotations**. Analysis uses the v2 parser path only when the sidecar declares an opt-in version boundary.

---

## Version boundary (binding — Q1)

Authors opt in by placing this line in the sidecar preamble (before the first procedure heading):

```text
Grammar-Version: v2
```

Rules:

- **Absent header** → parser uses v1 + optional typed-flow extension only.
- **Header present** → v2 parser; v1 constructs remain valid inside the document.
- **File extension alone** does not select v2 (rejected).
- **Production** reads the header; qualification harnesses may accept `grammar_version_override` for sweeps only.

`constraint_flow: false` → zero constraint diagnostics regardless of v2 header (CL-6).

---

## Design principles

1. **Tier-1 behavioral** — procedure structure, control flow, PRE/POST/EFFECTS prose remain authoritative.
2. **Tier-2 typed-flow** — optional `: type` clauses from the v1 typed-flow extension remain valid in v2 documents.
3. **Tier-3 constraints** — refinements, summaries, alias/mutation policy are optional evidence; unknown when absent or unprovable.
4. **D13 isolation** — v2 syntax is parsed on a v2 code path; avoid mutating `pseudocode-shared.ts` regex without Layer B regression.

---

## Refinement predicates

Refinement predicates attach to contract rows or inline type clauses:

```text
INPUT: items: list of Item where length(items) > 0
POST: result is not null AND count >= 0
DATA: buffer (immutable): bytes where size(buffer) <= max_size
```

Supported predicate subset (initial):

| Construct | Example |
|-----------|---------|
| Comparisons | `x > 0`, `len <= max` |
| Nullability | `x is not null` |
| Collection bounds | `length(items) > 0`, `size(set) <= n` |
| Field presence | `record.field is defined` |
| Quantifiers (bounded) | `forall i in 0..n-1: items[i] >= 0` |
| Boolean connectives | `AND`, `OR`, `NOT` |

Unsupported constructs → `unknowns[]` with cause `CONSTRAINT_UNSUPPORTED_SYNTAX` or `predicate_unsupported`; not silent success.

Case 12 (refinement predicate) is the primary unlock for this REQ.

---

## Procedure summaries (interprocedural)

Declare callee effects for CALL/RETURN propagation:

```text
procedure PROCESS_ITEMS:
  Contract:
    SUMMARY CALL:
      - mutates: items
      - aliases: output -> items
    SUMMARY RETURN:
      - ensures: count >= 0
      - return: Result | null
```

Summaries are compact objects consumed by the fixed-point solver. Missing summary at CALL site → unknown (CL-4), not silent pass.

---

## Alias policy (case 11)

Optional alias policy blocks declare reference equality and mutation visibility:

```text
  Contract:
    ALIAS POLICY:
      - output may alias input
      - temp does not alias output
```

When alias policy is **absent** → `unknowns[]` with cause `alias_policy_absent` (100% disclosure — CL-3).

---

## Immutability annotations (case 8)

On DATA rows:

```text
DATA: config (immutable): Config
DATA: scratch (mutable): Buffer
```

Proven mutation of `(immutable)` binding → `MUTATION_VIOLATION` when policy is declared and violation is provable within solver budgets.

---

## Predicate grammar notes

- Predicates use the same identifier lexeme as typed-flow expressions where possible.
- Function calls in predicates are limited to `length`, `size`, and documented builtins in the constraint corpus.
- Nesting depth bounded by `max_predicate_nodes` in `ConstraintAnalysisBudgets`.

---

## Layer B SHAPE-007 (optional)

When `Grammar-Version: v2` is declared, Layer B may apply optional **SHAPE-007** checks on v2 Active blocks (refinement/summary syntax well-formedness). v1 and v1+typed-flow sidecars without v2 header are unchanged (Q5).

---

## Analysis flags

| Flag | Requires | Effect |
|------|----------|--------|
| `typed_flow: true` | — | Typed-flow pass (predecessor REQ) |
| `constraint_flow: true` | `typed_flow: true` (Q7) | Constraint-language pass |
| `constraint_gate_errors: true` | phased 3a–3d | Severity promotion on constraint-annotated procedures |

Report: `sections.constraint_language` on `pseudocode-analysis-report.v1` without global schema bump (Q2).

---

## Proof boundary

Constraint-language claims are limited to:

- Refinement entailment where predicates are authored and within budget
- Summary propagation where summaries are declared
- Alias/mutation checks where policy is declared
- Explicit solver truncation disclosure

**Permanent non-claims:** runtime truth, complete path coverage, dynamic dispatch, host-language typing, behavioral proof.
