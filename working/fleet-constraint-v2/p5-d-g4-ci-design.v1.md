# P5-D — G4 CI and cohort dimension design

**Schema:** `p5-d-g4-ci-design.v1`  
**Created:** 2026-09-13  
**Methodology pin:** `48d1fbb+`  
**Gate stage:** G4 ([`gate-promotion-stages.v1.yaml`](gate-promotion-stages.v1.yaml))  
**Parent:** [`docs/pseudocode-constraint-v2-fleet-migration-phase-5-plan.md`](../../docs/pseudocode-constraint-v2-fleet-migration-phase-5-plan.md) (P5-D)  
**CITDP:** `phase_5_module` run_id `fleet-migration-phase5-p5c-20260913`  
**Build owner:** P5-E → [`scripts/run-fleet-g4-ci-checks.mjs`](../../scripts/run-fleet-g4-ci-checks.mjs)

---

## Objective

Define how **G4 `ci_expectations`** from gate promotion stage **G4** map to **stdd-local continuous checks** without conflating:

- **Track A** (5 × `enrolled_phase_4` at `fleet-migrated-client`) — regression audit only  
- **Track B** (~18 × `not_enrolled_phase_4`) — unchanged until OD-P5-2 / Phase 5b  
- **Track C** (new-client bootstrap) — **P5-F** template/`copy_files.sh`; not proven by header-only audit alone  

---

## G3 vs G4 control mapping (pre-RED / verification / CI)

| Control | G3 (Phase 4 — done) | G4 (Phase 5 — P5-E+) |
|---------|---------------------|----------------------|
| `layer_c.constraint_flow` | **true** (fleet waves) | **true** (default policy) |
| `layer_c.typed_flow` | **true** | **true** |
| `constraint_gate_errors.pre_red` | advisory | **blocking_on_qualifying_paths** (OD-P5-3; MCP/checklist wiring incremental post–P5-E) |
| `constraint_gate_errors.verification` | blocking | blocking |
| `constraint_gate_errors.close_out` | blocking | blocking |
| CI wiring | harness + client migration REQ gates | **continuous** via G4 CI entrypoint |
| Waiver stale checks | wave close-out + registry script | **CI dimension** `stale_waiver_checks` |
| New-client bootstrap | header-only (Track A) | **constraint-enforced-v2** (P5-F; EX-P5-02) |
| `program_gate_policy` (orchestrator REQ) | advisory through M4 | remains **advisory** on closed orchestrator REQ; G4 CI is **orthogonal** |

Source: phase-4 plan Annex A; [`gate-promotion-stages.v1.yaml`](gate-promotion-stages.v1.yaml) stage `G4`.

---

## G4 `ci_expectations` → implementation

| Expectation ID | Purpose | P5-E implementation | P5-F follow-up |
|----------------|---------|---------------------|----------------|
| **`header_and_contract_defaults_for_new_clients`** | Cohort/bootstrap path cannot regress to silent header-only | Run [`runGrammarV2DefaultAudit`](../../scripts/lib/audit-grammar-v2-default.mjs) on **stdd** as reference client root (template + Layer B/C smoke). **Does not** yet require `constraint_flow: true` on smoke (bootstrap enforcement dimension deferred). | Extend audit with `AUDIT_CONSTRAINT_ENFORCED_BOOTSTRAP` / `constraint_flow_expectation: true` per IMPL pseudo-code. |
| **`stale_waiver_checks`** | Expired waivers must not pass continuous governance | Invoke [`run-fleet-waiver-registry-check.ts`](../../working/PSEUDOCODE-CONSTRAINT-STUDY/qualification/scripts/run-fleet-waiver-registry-check.ts) (exit 0 required). | Same; add CI job hook. |

### Additional continuous check (SC-FLEET-P5-001 / EX-P5-03)

| Check ID | Purpose | Implementation |
|----------|---------|----------------|
| **`enrolled_track_regression`** | 5 × OD-P4-3 remain `fleet-migrated-client` | Parse [`client-inventory-manifest.v1.yaml`](client-inventory-manifest.v1.yaml): every `phase_4_enrollment: enrolled_phase_4` row must have `aggregate_migration_state: fleet-migrated-client` and zero uncleared `header-only-v2` / `constraint-ready-v2` / `legacy-v1` unless waiver-backed (counts zero today). |

**Explicit non-claim:** Passing G4 CI does **not** prove Track B or full manifest (~23 rows) migration (EX-P5-07).

---

## Entry points and CI wiring

| Surface | Command | When |
|---------|---------|------|
| **G4 CI CLI** | `node scripts/run-fleet-g4-ci-checks.mjs [--json-out PATH]` | Local pre-push; CI job (P5-E) |
| **Harness alias** | `working/PSEUDOCODE-CONSTRAINT-STUDY/qualification/scripts/run-harness.sh fleet-g4-ci` | Same as CLI (builds mcp-server first) |
| **Grammar audit (existing)** | `node scripts/audit-grammar-v2-default.mjs` | Retained; G4 runner **composes** it for dimension 1 |
| **Waiver (existing)** | `node --experimental-strip-types …/run-fleet-waiver-registry-check.ts` | G4 runner composes for dimension 2 |

### Suggested CI job shape (documentation only until repo workflow exists)

```yaml
# Illustrative — wire in project CI when sponsor adds workflow file
steps:
  - run: npm run build --prefix mcp-server
  - run: node --test scripts/fleet-g4-ci-checks.test.mjs
  - run: node scripts/run-fleet-g4-ci-checks.mjs
```

Evidence artifact (P5-E): `working/fleet-constraint-v2/p5-e-g4-ci-build-report.v1.json`.

---

## Extension plan for `audit-grammar-v2-default.mjs`

| Phase | Change |
|-------|--------|
| **P5-E** | No change to audit dimensions; G4 runner **calls** existing audit with `constraintFlow: false` (Track A baseline). |
| **P5-F** | Add optional `gateStage: "G4"` / `bootstrapEnforcement: true` to audit lib; fail when smoke passes with header-only semantics only (`HeaderOnlyBootstrapFalsification`). |
| **P5-G** | FEAT envelope checks remain separate checklist gates. |

---

## OD-P5-3 program gate policy (scoped)

- **P5-E:** Wire **CI** checks; do **not** re-open orchestrator REQ verification/close_out.  
- **Post–P5-E:** Incrementally align stdd **pre-RED** MCP/checklist paths with `blocking_on_qualifying_paths` where IMPL specifies qualifying loci (separate build slice).  
- **Falsification:** Do not set `program_gate_policy: blocking` globally while G4 CI entrypoint is absent.

---

## Acceptance (P5-D complete when)

- [x] This design note exists and is linked from ARCH governance + tracker `p5-d-g4-ci-design`.  
- [x] G4 expectation → command mapping documented.  
- [x] G3 vs G4 table and Track A/B/C separation explicit.  
- [x] P5-E implements entrypoint + tests (build slice).  

**Next:** **`/build-plan` P5-F** — bootstrap enforcement dimension on grammar audit.
