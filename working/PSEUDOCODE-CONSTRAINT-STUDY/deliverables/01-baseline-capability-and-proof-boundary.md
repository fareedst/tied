# Baseline capability and proof boundary

**Study:** PSEUDOCODE-CONSTRAINT-STUDY  
**Anchor commit:** `7f3d5b0` (2026-09-09 — Layer C static analysis gate)  
**Current `main` HEAD:** `7f3d5b0` — **no delta** in analysis modules, grammar doc, static-analysis checklist, or REQ-PSEUDOCODE_STATIC_ANALYSIS since anchor.

---

## Executive summary

Layer C (`pseudocode_analyze`, schema `pseudocode-analysis-report.v1`) provides deterministic parse → symbols → CFG → call graph → bounded abstract analysis → obligations/traceability. Contract field values (`INPUT`, `PRE`, `POST`, etc.) and assignment/condition expressions are **opaque strings** in IR. Abstract analysis performs a **linear per-procedure statement walk** with heuristic nullability and def-use hints; it does **not** propagate facts along CFG edges or solve PRE/POST predicates. Reliable typed **data-flow validation** is therefore **not currently specified or implementable** without new syntax and analyzer semantics.

---

## Layer A / B / C proof split

| Layer | Tool / process | Proves | Does not prove |
|-------|----------------|--------|----------------|
| **Layer A** | `tied_validate_consistency` (default `include_pseudocode`) | TIED token comments, cross-references, repository traceability on merged essence | CFG, data-flow, runtime behavior |
| **Layer B** | `pseudocode_validate` + [pseudocode-validation-checklist.yaml](../../../tied/docs/pseudocode-validation-checklist.yaml) | Structural shape, contract presence (SHAPE-003..006), token linkage, symbol closure, dependency graph | CFG data-flow, runtime truth, complete path coverage |
| **Layer C** | `pseudocode_analyze` (`gate_mode: true` at pre-RED gate) + [pseudocode-static-analysis-checklist.yaml](../../../tied/docs/pseudocode-static-analysis-checklist.yaml) | Grammar-v1 parse, resolved internal CALLs, CFG/call-graph structure, bounded abstract heuristics, path/failure **characterization** obligations | Runtime execution, test execution, complete path coverage, typed constraint solving, interprocedural data-flow proof |

**Order (mandatory for changed Active IMPLs):** Layer A → Layer B → Layer C before RED tests.

---

## Analysis pass inventory

Orchestrator: `mcp-server/src/analysis/pseudocode-analyzer.ts`  
Default passes: `parse`, `symbols`, `cfg`, `call_graph`, `abstract`, `obligations`, `traceability`.

### 1. Parse (`pseudocode-parser.ts`)

**Proves:** Source conforms to closed subset `pseudocode-grammar.v1`; procedure headings, control flow, CALL/RUN, assignments recognized; token refs extracted; unsupported constructs recorded in `unsupported_syntax[]`.

**IR shape:** Assignments store `target` + **opaque** `value` string; `IF`/`WHILE` store **opaque** `condition` string; `CALL` stores callee name only (no argument AST).

**Limits:** Values and conditions are not parsed into expression trees. Contract fields are **field-name presence** only (`contract.fields: string[]`), not typed values. Budget: `max_parse_nodes`, `max_source_bytes` → `truncated_parse`.

### 2. Symbols (`pseudocode-symbols.ts`)

**Proves:** Unique procedure names; required contract fields present (`INPUT`, `OUTPUT`, `PRE`, `POST`, `EFFECTS`); internal CALL targets resolve (or `UNRESOLVED_CALL` error); optional `known_tokens` validation; coarse read-before-write warnings via substring match in assignment values.

**Limits:** No type environment; no formal parameter/argument model for CALL; PRE/POST **content not analyzed**.

### 3. CFG (`pseudocode-cfg.ts`)

**Proves:** Per-procedure entry/exit, branch merge nodes, loop back-edges, reachability; truncation disclosed (`TRUNCATED_CFG`).

**Limits:** CFG is **built and reported** but the abstract pass does **not** use CFG join/transfer (see below).

### 4. Call graph (`pseudocode-call-graph.ts`)

**Proves:** CALL edges between defined procedures; RUN edges as external (`UNRESOLVED_RUN` info); unresolved CALL diagnostics.

**Limits:** No interprocedural summary, no arg/return flow, no effect propagation across procedures beyond warning when `EFFECTS` field missing at call site.

### 5. Abstract (`pseudocode-abstract-analysis.ts`)

**Proves (heuristic, intraprocedural, linear):**

- Def facts on assignment targets
- Nullable vs defined via substring (`null`, `?` in value string)
- Deref obligation warnings (`*`, `deref` in value)
- Path condition strings collected from `IF` conditions (budget-capped)
- Contradictory path heuristic (`false` and `true` in same condition string) — error only when `strict_paths: true`
- Loop termination marked unknown (`TERMINATION_UNKNOWN` info)
- Effect/failure gap warnings (missing `EFFECTS`, failure paths)

**Unknown policy:** Budget exceed → `unknowns[]` with `cause`, `proof_boundary` (e.g. fixed-point iteration, path budget).

**Hard limits:**

- **Linear walk** over `proc.statements` — **no CFG join**, no merge of branch facts, no loop invariant
- Single `env` map per procedure overwritten sequentially — branch arms do not fork/join
- `_cfg` parameter accepted but **unused**
- No type compatibility checking on assignments
- Nullability is string heuristic, not flow-sensitive null analysis

### 6. Obligations / traceability (`pseudocode-obligations.ts`)

**Proves:** Decision tables from IF/SWITCH; path characterization obligations (branch, failure, null-check from abstract facts); block-level token edges from comments.

**Limits:** Characterization for test authoring — **not** proof that PRE/POST hold or data-flow is sound.

---

## Report schema and proof boundary

From `pseudocode-ir.ts`:

```text
DEFAULT_PROOF_BOUNDARY =
  "Deterministic static analysis of essence_pseudocode within declared grammar and budgets;
   not runtime execution, not test execution, not complete behavioral verification."
```

Report fields: `proof_boundary`, `unknowns[]`, `truncated`, `unsupported_syntax`, section-scoped facts. Under `gate_mode: true`, any error-severity diagnostic or `truncated: true` fails `ok` (PSA-GATE-001..003).

**DEFAULT_BUDGETS:** `max_parse_nodes: 5000`, `max_procedures: 256`, `max_cfg_blocks_per_procedure: 512`, `max_call_graph_edges: 2048`, `max_fixed_point_iterations: 32`, `max_path_conditions: 64`, `max_report_diagnostics: 500`, `max_source_bytes: 512_000`.

---

## Grammar v1 and contract model

[pseudocode-grammar.v1.md](../../../tied/docs/pseudocode-grammar.v1.md) defines a **closed syntactic subset**. Contract rows (`PRE`, `POST`, `INPUT`, …) are scanned for **field names** via `CONTRACT_FIELD_PATTERN`; values remain prose in source and are **not** part of Layer C IR semantics today.

Layer B enforces SHAPE-003..006 (presence/shape of contract rows). Layer C adds control-flow structure and bounded heuristics — **not** constraint solving over PRE/POST text.

---

## Working hypothesis verification

| Hypothesis | Verdict |
|------------|---------|
| Format supplies enough structure for Layer A/B/C pipeline | **Confirmed** — parse, symbols, CFG, call graph, obligations operate on grammar v1 |
| Contract values are prose, not formal types/expressions | **Confirmed** — IR `ContractFields.fields` is string[]; assignment/condition values are opaque strings |
| Reliable typed data-flow validation not yet specified/implementable | **Confirmed** — no expression AST, no type env, abstract pass ignores CFG joins; PRE/POST not evaluated |

---

## Delta from anchor commit

**None.** Repository HEAD equals `7f3d5b0`. Study baseline matches live `main` for all listed source files.
