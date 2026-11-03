---
name: RDC e2e pass-4 metrics alignment
overview: Align bootstrap-and-load e2e with pass 3 operator-disk precedence for metrics env; close optional deferral from session-handoff without changing bootstrap semantics.
todos:
  - id: refine-citdp-tracker
    content: CITDP-RDC-E2E-PASS4 + Tracker; pre_implementation gate
    status: completed
  - id: e2e-helper-operator-seed
    content: Add e2e helper to materialize .tied/store.yaml operator block per case (or isolated storeRoot)
    status: completed
  - id: metrics-test-rewrite
    content: Rewrite metrics + refresh cases to assert disk-first / brownfield rules explicitly
    status: completed
  - id: optional-red-template-store
    content: RED case — template collect_metrics false + shell 1 → no metrics until operator true (optional hardening)
    status: completed
  - id: leap-req-sc
    content: Append SC-RDC-E2E-METRICS-ALIGN to REQ-TIED_RUNTIME_DISK_CONFIG (light LEAP)
    status: completed
  - id: verify-e2e
    content: npx tsx --test src/e2e/bootstrap-and-load.test.ts + bootstrap unit slice
    status: completed
  - id: validate-close
    content: lint_yaml; tied_validate_consistency; verification gate when sponsor runs build-plan
    status: completed
isProject: true
---

# [REQ-TIED_RUNTIME_DISK_CONFIG] — E2e pass-4 metrics alignment (refined)

**Refined:** 2026-11-03 (`refine-plan` / invocation **e2e pass-4**)  
**Parent REQ:** [REQ-TIED_RUNTIME_DISK_CONFIG] — product scope **complete**; this slice closes the last **optional** deferral in [session-handoff.md](./evidence/session-handoff.md).  
**CITDP:** [CITDP-RDC-E2E-PASS4.yaml](./CITDP-RDC-E2E-PASS4.yaml)  
**Tracker:** [agent-req-implementation-checklist-e2e-pass4.yaml](./agent-req-implementation-checklist-e2e-pass4.yaml)  
**Prior analysis:** [spine-review-2026-11-03.md](./evidence/spine-review-2026-11-03.md) (E2E gap section)

**Depth / gates:** `profile_depth: minimal`, `gate_policy: advisory`, `depth_tier: minimal`  
**Pre-implementation gate:** run after Tracker/CITDP authoring (see Gate status below).

---

## Refine — RESOLVE

| Signal | Resolution |
| --- | --- |
| **Problem** | E2e encodes **legacy install-shell** metrics expectations; pass 3 **operator disk** wins when `operator.mcp.collect_metrics` is set in store yaml. |
| **Not in scope** | Resolver rewrite, new MCP tools, changing `writeExecWrapper`, or pass-3 consumer code. |
| **Sponsor intent (default)** | **Align tests** to documented precedence; make green/red **independent** of whether monorepo `.tied/store.yaml` includes an `operator:` block. |

**Canonical terms**

- **Operator disk** — merged `.tied/store.yaml` + `.tied/operator.local.yaml`; `resolveOperatorFlagsForInstall` disk-first for `collect_metrics`.
- **Brownfield mcp env** — existing `tied-yaml` entry env on refresh before operator sync.
- **Install shell fallback** — `processEnv.TIED_MCP_COLLECT_METRICS === "1"` only when operator and brownfield do not decide.

**Precedence (authoritative — already in bootstrap unit tests)**

```text
operator.mcp.collect_metrics (bool) → brownfield TIED_MCP_COLLECT_METRICS → shell TIED_MCP_COLLECT_METRICS=1 → default false
```

**Reversible choices (defaults for implement)**

| Choice | Default |
| --- | --- |
| E2e store shape | **Per-case seed** under temp client: write `.tied/store.yaml` with explicit `operator.mcp.collect_metrics` before `runBootstrap` |
| Metrics client label | Keep `resolveBootstrapMetricsClient` behavior; assert `TIED_MCP_METRICS_CLIENT` only when `collectMetrics` true |
| Refresh vocabulary test | Replace “honor install-time metrics env for new entries” with “honor **operator sync + brownfield** when adding tied-yaml entries on refresh” |
| New SC token | **SC-RDC-E2E-METRICS-ALIGN** appended to REQ satisfaction criteria |
| REQ `status` | Unchanged unless sponsor promotes parent REQ to **Implemented** after this slice |

**Costly choice (none for this slice)**

- No production behavior change; sponsor need not re-approve operator catalog.

**Environment note (2026-11-03 verify)**

- Full `bootstrap-and-load.test.ts` currently **5/5 pass** on this checkout because root `.tied/store.yaml` has **no** `operator:` block (shell fallback active). Pass-4 still required for **determinism** when template/store adopts `operator.mcp.collect_metrics: false` ([tools/bootstrap/templates/.tied/store.yaml](../../../tools/bootstrap/templates/.tied/store.yaml)).

---

## Plan — CITDP summary

### Change definition

| | |
| --- | --- |
| **Current** | Two tests in [`mcp-server/src/e2e/bootstrap-and-load.test.ts`](../../../mcp-server/src/e2e/bootstrap-and-load.test.ts) treat shell exports as authoritative for metrics env shape. |
| **Desired** | Same file documents and asserts **SC-RDC-OPERATOR-DISK** precedence with explicit operator seeding; refresh case matches `mapOperatorConfigToMcpEnv` / brownfield retention. |

### Impact

| Module | Change |
| --- | --- |
| `bootstrap-and-load.test.ts` | Helper + rewritten assertions (primary) |
| `REQ-TIED_RUNTIME_DISK_CONFIG.yaml` | Optional append **SC-RDC-E2E-METRICS-ALIGN** |
| `IMPL-TIED_LAYERED_CLIENT_INSTALL-pseudocode.md` | Optional one-line cross-ref to e2e contract |

### Success criteria

| ID | Criterion | Metric |
| --- | --- | --- |
| **SC-RDC-E2E-METRICS-ALIGN** (new) | E2e bootstrap-and-load metrics cases pass with template-equivalent store (`collect_metrics: false`) and with operator-seeded `true`, matching unit precedence | `npx tsx --test src/e2e/bootstrap-and-load.test.ts` |
| **SC-RDC-OPERATOR-DISK** | Unchanged — unit/integration battery remains green | Existing bootstrap + agentstream commands |

### Test strategy

1. **Helper** — `seedStoreOperatorYaml(targetOrStoreRoot, { collect_metrics })` (name illustrative) materializes `.tied/store.yaml` minimal schema + operator block; use same `repoRoot` store or copy template as needed per case.
2. **Metrics init test** — For `collect_metrics: true` cases, seed operator **true** then run bootstrap with shell `1`; for `non-one` case, seed **false** and assert metrics keys absent.
3. **Refresh test** — Seed operator + brownfield scenario: either (a) pre-seed operator `collect_metrics: true` and set brownfield/client metrics client via first bootstrap, or (b) assert refresh **does not** apply shell-only client label when operator disk says false — match [spine-review](./evidence/spine-review-2026-11-03.md) recommendation.
4. **Optional RED** — One subtest with template store (`collect_metrics: false`) + shell `1` without seed fix → documents failure mode before GREEN (can live in bootstrap unit test instead if e2e stays lean).
5. **Regression** — Run bootstrap unit slice (no duplicate precedence logic in e2e comments only).

```bash
cd mcp-server && npx tsx --test src/e2e/bootstrap-and-load.test.ts
node --test tools/bootstrap/lib/tied-runtime-config.test.mjs tools/bootstrap/lib/mcp-config.test.mjs
```

### Out of scope

- MCP introspection, fixture parity, agentstream resolver (closed tracks).
- Changing default template `collect_metrics: false` (product default stands).

---

## Implement — execution order (for `@build-plan`)

1. **e2e-helper-operator-seed** — shared helper in e2e test file or small colocated module under `mcp-server/src/e2e/`.
2. **metrics-test-rewrite** — update two tests; keep token comments naming [REQ-TIED_RUNTIME_DISK_CONFIG] [SC-RDC-OPERATOR-DISK] [REQ-MCP_USAGE_METRICS].
3. **optional-red-template-store** — if sponsor wants explicit regression subtest.
4. **leap-req-sc** — `yaml_detail_update` / tied-cli append SC; `tied_validate_consistency`.
5. **verify-e2e** — full file + unit slice above.
6. **close-out** — scoped commit; update [session-handoff.md](./evidence/session-handoff.md) deferred section when complete.

---

## Gate status

**pre_implementation:** **pass** (`allowed: true`, `depth: minimal`) — 2026-11-03 after CITDP/Tracker authoring.

Implement may proceed with test edits per todos above (`@build-plan` or manual TDD).
