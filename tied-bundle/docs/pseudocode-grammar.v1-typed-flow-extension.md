# Pseudo-code grammar v1 typed-flow extension

**Status:** Pilot extension — optional Tier-2 evidence on behavioral pseudocode  
**Traceability:** [REQ-PSEUDOCODE_TYPED_FLOW], [ARCH-PSEUDOCODE_TYPED_FLOW_PASS], [IMPL-PSEUDOCODE_TYPED_FLOW]  
**Base grammar:** [pseudocode-grammar.v1.md](pseudocode-grammar.v1.md)

This document defines **optional** typed-flow syntax compatible with grammar v1. Legacy sidecars without Tier-2 annotations parse unchanged. Typed-flow analysis runs only when `typed_flow: true` on `pseudocode_analyze` / `analyzeEssencePseudocode`.

---

## Design principles

1. **Tier 1 behavioral** — procedure structure, control flow, PRE/POST/EFFECTS prose remain authoritative.
2. **Tier 2 optional types** — type clauses are additive evidence on contract values and selected expressions.
3. **Keyword-colon preservation (EH-12 / D13)** — nest name/type **inside** the value after the keyword colon; do not change `CONTRACT_FIELD_PATTERN` in `pseudocode-shared.ts`.

---

## Contract row typed syntax

Existing form:

```text
INPUT: user identifier for the session
```

Typed extension (optional):

```text
INPUT: user_id: int
DATA: items (list of User)
OUTPUT: result: Result | null
```

Rules:

- Pattern: `KEYWORD: <name>: <type_clause>` or `KEYWORD: <description with optional (shape)>`  
- Mixed typed and prose rows in one contract block are all retained (F1b).  
- Prose-only rows remain valid; typed pass emits `unknowns[]` rather than errors.

Supported type clauses (pilot subset):

| Clause | Meaning |
|--------|---------|
| `int`, `string`, `bool` | Scalar tags |
| `T | null`, `nullable T` | Nullable lattice |
| `{ field: T, ... }` | Record shape (field presence) |
| `list of T` | Homogeneous collection |

---

## Expression subset (assignments and guards)

When typed checking is desired on assignments or `IF` conditions:

```text
count := count + 1
IF user is not null:
IF status = "active" AND count > 0:
item := items[0]
name := record.field
```

Unsupported in pilot (explicit unknowns):

- User-defined functions in expressions  
- Opaque prose conditions without structure  
- `RUN` targets  
- Alias/mutation beyond local env  

---

## CALL argument form

```text
CALL CALLEE( arg1, arg2 )
```

When callee contract declares typed `INPUT` slots, typed-flow matches arg expressions to slots (F6). Raw args are always captured in IR (`IrCall.args`).

---

## Report extension

Typed results appear under **`sections.typed_flow`** on **`pseudocode-analysis-report.v1`**. Schema version is unchanged during the pilot.

Diagnostic codes (warning by default; Phase 3 promotion when `typed_gate_errors: true`):

- `TYPE_MISMATCH`, `NULL_FLOW`, `SHAPE_MISMATCH`, `CALL_TYPE_MISMATCH`  
- `JOIN_INCOMPATIBLE`, `TYPED_OPAQUE_EXPR`, `TYPED_UNSUPPORTED_SYNTAX`

Phase 3 gate semantics: proven violations in `{ TYPE_MISMATCH, NULL_FLOW, SHAPE_MISMATCH, CALL_TYPE_MISMATCH, JOIN_INCOMPATIBLE }` promote to **error** on **annotated procedures only** when `gate_mode && typed_flow` and `typed_gate_errors` is not explicitly `false`. Default is **effective true** (sub-phase 3d, sponsor-approved 2026-09-10). Set `typed_gate_errors: false` for warnings-only typed diagnostics. Prose-only procedures and opaque/unsupported codes remain non-gating.

---

## Out of scope (pilot + Phase 3 pre-3d)

- Grammar v2 migration  
- Separate `Types:` block syntax  
- Default `typed_gate_errors: true` without sponsor approval (sub-phase 3d) — **enabled 2026-09-10**  
- Interprocedural summaries beyond local CALL slot matching  
- Edits to Layer B validator or `pseudocode-shared.ts` regex (D13)
