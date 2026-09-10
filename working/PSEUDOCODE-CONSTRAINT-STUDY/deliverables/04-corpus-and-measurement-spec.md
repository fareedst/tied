# Corpus and measurement specification (design only)

**Study:** PSEUDOCODE-CONSTRAINT-STUDY  
**Status:** Design specification — **no repo fixtures** in this study.

---

## Measurement definitions (future implementation)

| Metric | Definition | Collection method (future) |
|--------|------------|----------------------------|
| **Precision** | TP / (TP + FP) on labeled definite-error cases | Run analyzer on corpus; compare to expected outcome class |
| **Recall** | TP / (TP + FN) on labeled violation cases | Same |
| **Unknown rate** | \|unknowns\| / \|checks attempted\| or per-category unknown fraction | Aggregate report `unknowns[]` |
| **Authoring overhead proxy** | Annotation lines added / procedure count | Diff sidecars before/after typed-flow pilot |
| **Parse compatibility** | % legacy v1 sidecars passing parse unchanged | Batch `pseudocode_analyze` parse pass |
| **Deterministic serialization** | Byte-stable JSON for fixed input | Snapshot test (existing pattern) |
| **Runtime / memory vs budgets** | Wall time and peak memory vs `DEFAULT_BUDGETS` | Benchmark harness on corpus |
| **Layer B/C regression** | Gate pass rate on existing fixtures + new corpus | CI matrix with `gate_mode: true` |

---

## Labeled case categories (12)

Each case: **input snippet** (illustrative), **expected outcome class**, **rationale**.

### 1. Scalar type mismatch (assignment)

```text
procedure EXAMPLE:
  Contract:
    INPUT x: int
  x := "hello"
```

- **Expected:** Definite error (with typed-flow) / Unknown or non-claim (today)
- **Rationale:** Requires expression typing; today value is opaque string

### 2. Nullable dereference / flow to non-null

```text
procedure EXAMPLE:
  y := maybe_null()
  IF y is not null:
    z := deref(y)
```

- **Expected:** Definite error on null arm without guard; unknown if `maybe_null()` opaque (today: heuristic nullable warning)
- **Rationale:** Flow-sensitive null analysis needs structured conditions + join

### 3. Collection element shape mismatch

```text
procedure EXAMPLE:
  DATA items: list of User
  item := items[0]
  id := item.accountId   # User has userId not accountId
```

- **Expected:** Definite error with shape tags / non-claim today
- **Rationale:** Field names in prose insufficient for proof

### 4. Record field presence/shape mismatch

```text
procedure EXAMPLE:
  record := { name: "a" }
  age := record.age
```

- **Expected:** Definite error with shape / unknown without annotation
- **Rationale:** Requires record type in IR

### 5. Branch join incompatible facts

```text
procedure EXAMPLE:
  IF flag:
    x := 1
  ELSE:
    x := "two"
  y := x + 1
```

- **Expected:** Definite error after join (incompatible types) / unknown today (linear env overwrites)
- **Rationale:** CFG join must merge incompatible facts to ⊥ or error

### 6. Loop carried dependency / unknown iteration

```text
procedure EXAMPLE:
  WHILE items not empty:
    process(items)
```

- **Expected:** Unknown (iteration count, mutation of items)
- **Rationale:** Loop invariant or widen; termination already `TERMINATION_UNKNOWN`

### 7. Local CALL argument/return compatibility

```text
procedure CALLEE:
  Contract:
    INPUT n: int
    OUTPUT r: int

procedure CALLER:
  CALL CALLEE( "bad" )
```

- **Expected:** Definite error with signatures / non-claim today (no arg model)
- **Rationale:** CALL IR lacks argument AST

### 8. Mutation vs declared immutability

```text
procedure EXAMPLE:
  Contract:
    DATA config: Config (immutable)
  config.timeout := 30
```

- **Expected:** Definite error with mut policy / non-claim today
- **Rationale:** Immutability not in grammar v1

### 9. External/RUN input (must → unknown)

```text
procedure EXAMPLE:
  RUN fetch_user_input
  x := result
```

- **Expected:** Unknown (external provenance)
- **Rationale:** **Unknown policy** — `UNRESOLVED_RUN` info today

### 10. Opaque string condition (must → unknown)

```text
procedure EXAMPLE:
  IF user is authorized for this resource and quota ok:
    grant()
```

- **Expected:** Unknown for predicate truth; obligations may characterize branch
- **Rationale:** Condition string not in expression algebra

### 11. Aliasing not in model (must → unknown)

```text
procedure EXAMPLE:
  a := ref(x)
  b := ref(x)
  mutate(a)
  use(b)
```

- **Expected:** Unknown unless alias policy added
- **Rationale:** Non-claim / unknown per exclusion DF-ALIAS-001

### 12. Intentionally unsupported refinement predicate

```text
procedure EXAMPLE:
  Contract:
    PRE length(items) > 0 && forall i in items: i.valid
```

- **Expected:** Unknown or conservative warning in bounded design; solvable only in full constraint-language
- **Rationale:** Quantifiers outside bounded typed-flow scope

---

## Corpus coverage matrix (design)

| Category | Scalar | Nullable | Shape | Branch | Loop | Call | Mutation | External | Opaque | Alias | Refinement |
|----------|--------|----------|-------|--------|------|------|----------|----------|--------|-------|------------|
| Case # | 1 | 2 | 3,4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |

All 12 categories specified. Future fixture naming: `corpus-df-{NN}-{slug}.pseudocode.md` under `mcp-server/src/analysis/fixtures/` (not created in this study).

---

## Pilot measurement protocol (recommended follow-on)

1. Implement bounded typed-flow prototype behind analyzer flag (not in this study).
2. Encode 12+ cases as labeled JSON expectations (outcome class + optional diagnostic code).
3. Measure precision/recall/unknown-rate on bounded design only.
4. Compare gate pass rate on existing `minimal-branches` and production sidecar sample (N≥10).
5. Document authoring delta for 3 real IMPL sidecars retrofitted with optional types.
