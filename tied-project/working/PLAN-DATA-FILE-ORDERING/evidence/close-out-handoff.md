# Close-out handoff — PLAN-DATA-FILE-ORDERING

Parent REQ: **REQ-TIED_YAML_CANONICALIZATION**

### Completion signals

- **Machine close-out:** pass — gate `close_out` `allowed=true`; envelope validate `fail_on_error_gaps=true` equivalent via `--envelope-blocking`; `blocking_gaps=0`; envelope path `tied-project/working/PLAN-DATA-FILE-ORDERING/evidence/request-evidence-envelope.v1.json`
- **Process contract:** pass — dual-write tracker + manifest present; PSA Layer C n/a (minimal); profile minimal/advisory
- **Adherence ledger:** pass — reconcile `process_grade` band **A** (100)

### Commits

- **Slice 1 (YAML + JSON slice 1):** `d293bba14c46002f85f5e59af011ad790e97d498` (not pushed)
- **Slice 2 (JSON marshalling):** `9243bb2a80820a88731f3feb6961890c581db46f` (not pushed) — [traceable-commit-evidence-slice2.md](./traceable-commit-evidence-slice2.md)

### Remaining risks

- JSON marshalling **slice 2** — **implemented 2026-10-23** (see [json-slice2-build-evidence.md](./json-slice2-build-evidence.md)); ~40 intentional `JSON.stringify` exclusions remain (internal/compare/wire/codegen).
- One-time JSON/YAML byte churn on hashed artifacts (documented RISK-JSON-HASH).
- Slice 2 **verification gate + machine close-out** deferred until sponsor confirms envelope refresh.
