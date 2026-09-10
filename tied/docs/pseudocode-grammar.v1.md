# Pseudo-code grammar v1 (`pseudocode-grammar.v1`)

**Status:** Author reference aligned with `mcp-server/src/analysis/pseudocode-parser.ts` and `pseudocode-shared.ts`  
**Traceability:** [REQ-PSEUDOCODE_STATIC_ANALYSIS], [REQ-PSEUDOCODE_PARSER_UNIFICATION], [IMPL-PSEUDOCODE_ANALYSIS_ENGINE]

This document is the closed subset accepted by Layer C static analysis (`pseudocode_analyze`). Layer B (`pseudocode_validate`) shares scan helpers via `pseudocode-shared.ts` but may accept additional legacy shapes.

---

## Scope

- **In scope:** Markdown sidecar text for Active IMPL `essence_pseudocode`; procedure-level CFG, call graph, bounded abstract analysis, obligations.
- **Out of scope:** Runtime execution, test execution, complete path coverage, TIED dependency graph validation (Layer A/B).

Constructs outside this grammar are recorded in `unsupported_syntax[]` on the analysis report. They do not silently pass under `gate_mode: true`.

---

## Supported syntax

### Procedure headings (required form)

Authors **must** use a parser-recognized heading — **not** list-item `PROCEDURE:`:

```text
procedure UPPER_SNAKE:
function UPPER_SNAKE:
block UPPER_SNAKE:
```

Pattern: `^\s*(procedure|function|block)\s+([A-Z][A-Z0-9_]*)\b`

### Contract block

Inside a procedure, an optional `Contract:` block with fields scanned by `CONTRACT_FIELD_PATTERN`:

| Field | Role |
|-------|------|
| `INPUT` / `OUTPUT` / `DATA` / `CONTROL` | I/O and environment |
| `PRE` / `POST` / `EFFECTS` | Active-block precision (Layer B SHAPE-003) |
| `FAILURE_MODES` / `DATA_TRANSITION` / `TERMINATION` | Extended contract rows |

### Control flow

| Construct | Form |
|-----------|------|
| `IF` | `IF condition:` |
| `ELSE` | `ELSE:` |
| `WHILE` | `WHILE condition:` |
| `FOR` | `FOR iterator:` |
| `SWITCH` | `SWITCH expression:` |
| `CASE` | `CASE label:` |

### Calls and external targets

| Construct | Form |
|-----------|------|
| `CALL` | `CALL UPPER_SNAKE(...)` — callee must resolve to a defined procedure for gate pass |
| `RUN` | `RUN external_target` — external target string; not resolved to internal procedures |

### Steps and assignment

| Construct | Form |
|-----------|------|
| Assignment | `target := value` |
| Return | `RETURN` or `RETURN value` |
| Error | `RAISE error …` / `RETURN error failure` (error step) |
| UPPER_SNAKE step | `STEP_NAME remainder` (treated as assignment-like when matched) |

### Comments and markdown

- `#` line comments and markdown headings are ignored by the parser except procedure headings.
- Token comments `[IMPL-*] [ARCH-*] [REQ-*]` are extracted for traceability sections.

---

## Unsupported → `unsupported_syntax[]`

List-item procedure forms (for example `- PROCEDURE: NAME`) are **not** recognized. Authors must remediate to `procedure NAME:`.

Other statement shapes that do not match the patterns above are recorded as `unsupported_statement` with source spans.

---

## Author patterns

1. **Named procedures:** One `procedure NAME:` block per logical unit; use `CALL OTHER(...)` only when `OTHER` is defined in the same sidecar (file-scoped gate).
2. **CALL / RUN:** `CALL` for internal pseudo-code procedures; `RUN` for documented external targets.
3. **Contracts:** New/changed Active blocks declare PRE/POST/EFFECTS per Layer B; unchanged legacy blocks may use N/A `pre-contract-grammar` until next edit (Layer B only — not inside a changed file submitted to Layer C).

Reference fixture: `mcp-server/src/analysis/fixtures/pseudocode-analysis/minimal-branches.pseudocode.md`.

---

## Budgets and truncation

Analysis honors `budgets` on `pseudocode_analyze` (defaults in `pseudocode-ir.ts`):

- `max_source_bytes`, `max_parse_nodes`, `max_cfg_blocks_per_procedure`, `max_call_graph_edges`, `max_report_diagnostics`, etc.

When a budget is exceeded, the report sets `truncated: true` (and may set procedure-level truncated flags). Under **`gate_mode: true`**, truncation fails `ok` unless an explicit waiver is documented on `gate-pseudocode-validation`.

---

## Reading reports

Reports use schema `pseudocode-analysis-report.v1`:

- `ok` — under default mode, only `CONTRADICTORY_PATH` (with `strict_paths`) and `INPUT_TOO_LARGE` fail; under **`gate_mode: true`**, any error-severity diagnostic or `truncated: true` fails `ok`.
- `gate_mode_applied` — present when the caller set `gate_mode: true`.
- `diagnostics` — stable sort by line, code, message.
- `proof_boundary` — explicit claim limit; mandatory on every report.

Persist gate evidence at `working/{REQ-TOKEN}/pseudocode-analysis/{IMPL-TOKEN}.v1.json`.

---

## Gate expectations

Mandatory Layer C at `gate-pseudocode-validation` for **changed in-scope Active IMPLs** (Tracker IMPL inventory):

1. Run `pseudocode_analyze` with `essence_pseudocode_path`, `gate_mode: true`, and `known_tokens` from scope.
2. Require `ok: true`, `gate_mode_applied: true`, stable `input_identity.hash`.
3. Follow [pseudocode-static-analysis-checklist.yaml](pseudocode-static-analysis-checklist.yaml).

See [pseudocode-writing-and-validation.md#layer-c-static-analysis-gate](pseudocode-writing-and-validation.md#layer-c-static-analysis-gate).
