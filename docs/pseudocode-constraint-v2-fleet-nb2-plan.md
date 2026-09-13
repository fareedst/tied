# Fleet constraint v2 — NB-2 (Track B tranche one)

**Scope:** Methodology-side **planning and sponsor gate** for the **second** non-enrolled client batch after **NB-1 tranche zero** complete. **No migration execution** in this document.

**Canonical program:** [`pseudocode-constraint-v2-fleet-program.md`](pseudocode-constraint-v2-fleet-program.md) · **Prior batch:** [`pseudocode-constraint-v2-fleet-nb1-plan.md`](pseudocode-constraint-v2-fleet-nb1-plan.md) · **CITDP:** [`CITDP-REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION`](../tied/citdp/CITDP-REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION.yaml) `nb2_tranche_one_module` · **Tracker:** [`working/fleet-constraint-v2/NB-2-tranche-one-agent-req-implementation-checklist.yaml`](../working/fleet-constraint-v2/NB-2-tranche-one-agent-req-implementation-checklist.yaml)

**TIED batch REQ:** [REQ-PSEUDOCODE_FLEET_NB2_TRANCHE_ONE](../tied/requirements/REQ-PSEUDOCODE_FLEET_NB2_TRANCHE_ONE.yaml) (Draft) · **Orchestrator:** [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION](../tied/requirements/REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION.yaml) remains **closed** — do not re-run `close_out`.

### Artifact index (NB-2)

| Artifact | Path | Role |
|----------|------|------|
| Pre-implementation CITDP slice | [`working/fleet-constraint-v2/NB-2-citdp-pre-implementation.v1.yaml`](../working/fleet-constraint-v2/NB-2-citdp-pre-implementation.v1.yaml) | Gate input; links `nb2_tranche_one_module` |
| NB-2 acceptance schema | [`working/fleet-constraint-v2/od-nb2-acceptance.v1.schema.json`](../working/fleet-constraint-v2/od-nb2-acceptance.v1.schema.json) | Machine validation for sponsor JSON |
| NB-2 acceptance template | [`working/fleet-constraint-v2/od-nb2-acceptance.v1.template.json`](../working/fleet-constraint-v2/od-nb2-acceptance.v1.template.json) | Draft → copy to `od-nb2-acceptance.v1.json` |
| Pre-implementation gate receipt | `working/fleet-constraint-v2/NB-2/gates/pre_implementation-*.json` | `tied_checklist_gate_validate` evidence |
| NB-1 close-out (prerequisite) | [`working/fleet-constraint-v2/NB-1/gates/machine-close-out-2026-09-13.json`](../working/fleet-constraint-v2/NB-1/gates/machine-close-out-2026-09-13.json) | Referenced in acceptance `prior_batch_complete` |
| Inventory (program) | [`working/fleet-constraint-v2/client-inventory-manifest.v1.yaml`](../working/fleet-constraint-v2/client-inventory-manifest.v1.yaml) | Wave-2 selection + post-wave rollup |
| G3 harness design | [`working/fleet-constraint-v2/p4-d-g3-harness-design.v1.md`](../working/fleet-constraint-v2/p4-d-g3-harness-design.v1.md) | `fleet-g3-wave` CLI contract for `/build-plan` |
| Program status snapshot | [`working/fleet-constraint-v2/program-status.v1.yaml`](../working/fleet-constraint-v2/program-status.v1.yaml) | Rolling counts; update after NB-2-G |
| IMPL orchestration pseudo-code | [`IMPL-PSEUDOCODE_FLEET_MIGRATION_ORCHESTRATION`](../tied/implementation-decisions/IMPL-PSEUDOCODE_FLEET_MIGRATION_ORCHESTRATION-pseudocode.md) | `RECORD_NB2_ACCEPTANCE`, `SELECT_NB2_WAVE_TWO_CLIENTS` |

**Traceability tokens:** [REQ-PSEUDOCODE_FLEET_NB2_TRANCHE_ONE](../tied/requirements/REQ-PSEUDOCODE_FLEET_NB2_TRANCHE_ONE.yaml) · [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE](../tied/architecture-decisions/ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE.yaml) · [IMPL-PSEUDOCODE_FLEET_MIGRATION_ORCHESTRATION](../tied/implementation-decisions/IMPL-PSEUDOCODE_FLEET_MIGRATION_ORCHESTRATION.yaml)

---

## 1. Refine disposition (2026-09-13)

### 1.1 NB-1 completion (baseline for NB-2)

**NB-1 tranche zero is complete** when all of the following hold (evidence: [`program-status.v1.yaml`](../working/fleet-constraint-v2/program-status.v1.yaml), [`machine-close-out-2026-09-13.json`](../working/fleet-constraint-v2/NB-1/gates/machine-close-out-2026-09-13.json)):

| Claim | Proof boundary |
|-------|----------------|
| Five wave-1 clients **fleet-migrated-client** | Manifest rows + G3 receipts under `working/fleet-constraint-v2/waves/{client_id}/` |
| Batch REQ machine close-out | `REQ-PSEUDOCODE_FLEET_NB1_TRANCHE_ZERO` envelope validated |
| Orchestrator REQ | **Still closed** — no re-verify |

**NB-1 does not mean:** remaining Track B complete (**13** header-only-v2 `not_enrolled_phase_4` rows remain).

### 1.2 What remains

| Workstream | Status | Gate |
|------------|--------|------|
| **Continuous G4 maintenance** | Unblocked | Run G4 CI on cadence |
| **Track B — remaining ~13 clients** | Not started (NB-2) | **OD-NB2-1** sponsor acceptance |
| **NB-2** (tranche one, up to 5 clients) | Plan ready; execution blocked | `od-nb2-acceptance.v1.json` → `/build-plan` |
| **NB-3+** | After NB-2 | Future batches |

### 1.3 NB-1 retrospective learnings (apply to NB-2)

| Learning | NB-2 implication |
|----------|------------------|
| **Sponsor JSON before G3** | New artifact `od-nb2-acceptance.v1.json` (not reuse of OD-P5-2 file); includes `prior_batch_complete` pointer to NB-1 close-out |
| **Manifest honesty** | Row flips only after receipts + client proof; NB-2 must reject `header-only-v2` candidates that are already `fleet-migrated-client` |
| **Low sidecar burden first** | NB-1 exhausted all **1-sidecar** rows; NB-2 primary tier is **2–3 sidecars** unless sponsor amends |
| **Orchestration scripts** | [`scripts/lib/fleet-nb1-orchestration.mjs`](../scripts/lib/fleet-nb1-orchestration.mjs) implements NB-1 blocks; **build-plan** should generalize or add NB-2 exports (`recordNb2Acceptance`, `selectNb2WaveTwoClients`) rather than duplicating policy |
| **Client-owned REQs** | Same NB-1-C..E pattern; stdd does not hold durable client migration archives |
| **Machine close-out REQ per batch** | NB-2 batch scoped to `REQ-PSEUDOCODE_FLEET_NB2_TRANCHE_ONE` — do not reopen orchestrator REQ |
| **Default exclude tooling** | `tied-win-diff` remains excluded unless OD-NB2-2 override (NB-1 OD-NB1-2 pattern) |

### 1.4 Sponsor terms (RESOLVE)

| Term | Meaning |
|------|---------|
| **Track B tranche one (NB-2)** | Second bounded G3 program on remaining `not_enrolled_phase_4` **header-only-v2** rows |
| **OD-NB2-1** | Open decision: sponsor signs **NB-2-specific** acceptance JSON |
| **od-nb2-acceptance JSON** | Machine-readable record at `working/fleet-constraint-v2/od-nb2-acceptance.v1.json`; template [`od-nb2-acceptance.v1.template.json`](../working/fleet-constraint-v2/od-nb2-acceptance.v1.template.json) |
| **wave-2 client selection** | Manifest-driven; prefer lowest total active sidecars among remaining header-only rows |
| **Client migration REQ** | Lives in **each client repo**; stdd holds inventory + policy only |

**Profile depth:** `minimal` for this refine pass. **Gate policy:** `advisory` on stdd pre-RED until NB-2 `/build-plan` scopes RED tests.

### 1.5 Open decisions (explicit)

| ID | Owner | Question | Default if silent |
|----|-------|----------|-------------------|
| OD-NB2-1 | Sponsor | Authorize NB-2 (1–5 clients) via `od-nb2-acceptance.v1.json`? | **No NB-2 work** — G4 maintenance only |
| OD-NB2-2 | Sponsor | Include `tied-win-diff` (1 sidecar tooling row)? | **Exclude** unless listed in acceptance JSON |
| OD-NB2-3 | Sponsor | Primary wave all **4+ sidecar** repos or tranche > 5? | Use §3 table (2–3 sidecar primaries); max 5 per schema |
| OD-NB2-4 | Sponsor | Replace recommended `wave_2_client_ids`? | Use §3 table |

---

## 2. CITDP Plan — NB-2 tranche one

Persisted as **`nb2_tranche_one_module`** on the fleet CITDP. Pre-implementation gate slice: [`NB-2-citdp-pre-implementation.v1.yaml`](../working/fleet-constraint-v2/NB-2-citdp-pre-implementation.v1.yaml).

### 2.1 Change definition

| Field | Value |
|-------|-------|
| **current_behavior** | NB-1 complete (5 fleet-migrated); 13 header-only-v2 `not_enrolled_phase_4`; no NB-2 acceptance |
| **desired_behavior** | Sponsor accepts NB-2; up to five next low-burden clients receive client-owned migration REQs + G3 waves; manifest updated **only after** wave receipts |
| **module_boundary** | stdd: acceptance schema, selection policy, harness invocation; **not** client IMPL bodies in stdd |

### 2.2 Falsification questions

1. Can manifest rows flip to **fleet-migrated-client** without G3 receipts under `working/fleet-constraint-v2/waves/{client_id}/`?
2. Can NB-2 select clients already migrated in NB-1?
3. Can NB-2 proceed without accepted `od-nb2-acceptance.v1.json`?
4. Can orchestrator `close_out` substitute for `REQ-PSEUDOCODE_FLEET_NB2_TRANCHE_ONE` verification?
5. Does G4 CI green imply NB-2 complete?

### 2.3 Risks

| ID | Risk | Mitigation |
|----|------|------------|
| RISK-NB2-REUSE | Reusing OD-P5-2 JSON for NB-2 without wave_2 fields | Separate schema `od-nb2-acceptance.v1`; IMPL `RECORD_NB2_ACCEPTANCE` |
| RISK-NB2-SELECTION | Selecting fleet-migrated NB-1 IDs | `SELECT_NB2_WAVE_TWO_CLIENTS` requires `header-only-v2` |
| RISK-NB2-ORCH | Reopen closed orchestrator REQ | `orchestrator_reverify: false` const |
| RISK-NB2-BURDEN | Jump to 6-sidecar repo without sponsor ack | Document tier in §3; OD-NB2-3 |
| RISK-NB2-SCRIPT | NB-1-only orchestration module drift | Build-plan: generalize `fleet-nb1-orchestration.mjs` or shared `fleet-batch-orchestration.mjs` |

### 2.4 Test strategy (for `/build-plan`)

| Layer | Scope | Pass criterion (sketch) |
|-------|--------|-------------------------|
| **Unit** | `od-nb2-acceptance` schema + policy | RED tests mirror IMPL `RECORD_NB2_ACCEPTANCE` POST |
| **Unit** | Wave-2 selection vs manifest fixture (post-NB-1 inventory) | RED tests mirror IMPL `SELECT_NB2_WAVE_TWO_CLIENTS` |
| **Unit** | Reject NB-1 migrated client IDs in wave-2 override | `already_migrated` failure mode |
| **Composition** | Harness CLI: `run-harness.sh fleet-g3-wave` | Dry-run only in stdd |
| **Regression** | G4 CI + NB-1 orchestration tests unchanged | Existing suites green |
| **E2E** | Not in stdd | Client repo migration verification |
| **Proof boundary** | stdd tests prove orchestration **inputs** | **fleet-migrated-client** proof in client repos |

### 2.5 Module boundaries

```
stdd (NB-2 build-plan)
├── Sponsor gate: od-nb2-acceptance.v1.json (validated before G3)
├── Prerequisite: NB-1 machine close-out receipt path in acceptance
├── Inventory read: client-inventory-manifest.v1.yaml
├── Local partition: working/fleet-constraint-v2/waves/ (gitignored)
└── Scripts: extend fleet-nb1-orchestration or shared batch module; G3 via run-harness.sh fleet-g3-wave

client repo (per wave-2 client)
├── REQ-PSEUDOCODE_MIGRATION_* (client-owned)
├── working/{REQ}/ checklist + receipts
└── Sidecar apply + tied_verify/close_out in client tied/
```

### 2.6 Acceptance criteria — refine pass (this document)

| Criterion | Verification |
|-----------|--------------|
| NB-2 plan on disk | This file |
| CITDP `nb2_tranche_one_module` populated | Fleet CITDP YAML |
| Tracker with `execution_evidence.request: REQ-PSEUDOCODE_FLEET_NB2_TRANCHE_ONE` | NB-2-tranche-one checklist |
| od-nb2 schema + template committed | Files under `working/fleet-constraint-v2/` |
| IMPL blocks `RECORD_NB2_ACCEPTANCE`, `SELECT_NB2_WAVE_TWO_CLIENTS` | Sidecar + `pseudocode_validate` |
| TIED REQ Draft | `REQ-PSEUDOCODE_FLEET_NB2_TRANCHE_ONE` |
| `pre_implementation` gate allowed | Receipt under `working/fleet-constraint-v2/NB-2/gates/` |

### 2.7 `/build-plan` entry checklist (after NB-2-A)

1. `working/fleet-constraint-v2/od-nb2-acceptance.v1.json` exists with `status: accepted`, `decided_at`, `sponsor_signoff`.
2. `prior_batch_complete.close_out_receipt_path` file exists and matches NB-1 machine close-out.
3. Every `wave_2_client_id` is `not_enrolled_phase_4` and **header-only-v2** in manifest.
4. `orchestrator_reverify` is **false**.
5. `length(wave_2_client_ids) <= tranche_scope.max_clients` (≤ 5).
6. G4 CI last run green (`program-status.v1.yaml` `last_g4_ci_ok` or re-run).
7. Tracker advanced from `pre_implementation` only after build-plan gate re-validation.

---

## 3. Wave-2 client selection (recommended)

**Criteria:** `not_enrolled_phase_4`; **header-only-v2** only (excludes NB-1 **fleet-migrated-client** rows); sort by **total active sidecars ascending**; `methodology_pin: 48d1fbb+`; exclude **`tied-win-diff`** unless OD-NB2-2 override.

**Source:** [`client-inventory-manifest.v1.yaml`](../working/fleet-constraint-v2/client-inventory-manifest.v1.yaml) (2026-09-13 post-NB-1). Logic specified in IMPL `SELECT_NB2_WAVE_TWO_CLIENTS`; sponsor overrides via acceptance JSON `wave_2_client_ids`.

**Note:** No **1-sidecar** candidates remain except `tied-win-diff` (excluded by default). NB-2 primary tier starts at **2 sidecars**.

| Priority | client_id | header-only sidecars | repository_root (operator) |
|----------|-----------|----------------------|----------------------------|
| 1 | `1786637885` | 2 | `/Users/fareed/Documents/dev/test/1786637885` |
| 2 | `1786643714` | 2 | `/Users/fareed/Documents/dev/test/1786643714` |
| 3 | `1788547701` | 2 | `/Users/fareed/Documents/dev/test/1788547701` |
| 4 | `1787421852` | 3 | `/Users/fareed/Documents/dev/test/1787421852` |
| 5 | `1787461685` | 3 | `/Users/fareed/Documents/dev/test/1787461685` |

**Alternates (3 sidecars):** `1787495576`, `1787603099`

**Alternates (4 sidecars):** `1787416567`, `1787507684`, `1787638699`

**Higher burden (sponsor review):** `1787691672` (5), `1787626480` (6)

**Special (1 sidecar, tooling):** `tied-win-diff` — OD-NB2-2 only

**Minimum tranche:** Schema allows 1–5 clients; sponsor may accept fewer than five IDs.

---

## 4. Executable steps (blocked vs unblocked)

| Step | ID | Depends on | Blocked? | Action | Done when (testable) |
|------|-----|------------|----------|--------|----------------------|
| G4 maintenance | M-G4 | — | **No** | `node scripts/run-fleet-g4-ci-checks.mjs` | Exit 0 |
| Refine NB-2 plan + CITDP + tracker | NB-2-R | NB-1 complete | **No** | This doc + working artifacts | §2.6 criteria met |
| Sponsor NB-2 acceptance | NB-2-A | — | **Yes** | Template → `od-nb2-acceptance.v1.json`; `status: accepted` | JSON validates; IMPL POST satisfied |
| Client REQ + checklist spawn | NB-2-C | NB-2-A | **Yes** | Per client: `REQ-PSEUDOCODE_MIGRATION_*` | Client TIED indexes list migration REQ |
| Client migration execute | NB-2-D | NB-2-C | **Yes** | Sidecar apply, verify per client policy | Client tests/verify green |
| Client close_out + receipt export | NB-2-E | NB-2-D | **Yes** | Client close_out; export to `waves/{client_id}/` | Receipt paths for manifest update |
| G3 wave harness (stdd) | NB-2-F | NB-2-A, NB-2-E per client | **Yes** | `/build-plan` — `run-harness.sh fleet-g3-wave` | Harness receipts validate |
| Manifest + dashboard refresh | NB-2-G | NB-2-F | **Yes** | Update manifest only with receipts | Honest aggregate states |
| NB-3+ remaining | NB-3 | NB-2-G | **Yes** | Retrospective + sponsor batch | New plan |

**Ordering:** NB-2-F may interleave per client after NB-2-E; **NB-2-G must not run** until all accepted wave-2 clients have receipt evidence.

---

## 5. Implement gate (pre-implementation only)

**Completed in this refine pass:**

- NB-2 plan document (this file)
- CITDP `nb2_tranche_one_module` + pre-implementation slice
- Tracker copy with `execution_evidence.request: REQ-PSEUDOCODE_FLEET_NB2_TRANCHE_ONE`
- od-nb2 acceptance schema + template
- IMPL pseudo-code: `RECORD_NB2_ACCEPTANCE`, `SELECT_NB2_WAVE_TWO_CLIENTS`
- TIED REQ `REQ-PSEUDOCODE_FLEET_NB2_TRANCHE_ONE` (Draft)
- Pre-implementation gate receipt under `working/fleet-constraint-v2/NB-2/gates/`

**Deferred to `/build-plan` (after NB-2-A):**

- RED tests for NB-2 acceptance and wave-2 selection (§2.4)
- Generalize or extend `fleet-nb1-orchestration.mjs` / closeout runners for NB-2
- G3 wave execution and manifest updates (NB-2-F..G)
- Client-repo TIED stacks (NB-2-C..E)

---

## 6. Recommended next command

| Situation | Command |
|-----------|---------|
| Sponsor has not signed NB-2 acceptance | **Maintenance only** — G4 CI; fill template → sponsor review |
| Sponsor signed `od-nb2-acceptance.v1.json` (`status: accepted`) | **`/build-plan`** linked to this doc + tracker; satisfy §2.7 first |
| Sponsor declines further Track B | **Maintenance only** — G4 + honest manifest (13 header-only remain) |

**Suggested `/build-plan` link payload:** plan `docs/pseudocode-constraint-v2-fleet-nb2-plan.md`, tracker `working/fleet-constraint-v2/NB-2-tranche-one-agent-req-implementation-checklist.yaml`, acceptance `working/fleet-constraint-v2/od-nb2-acceptance.v1.json`, batch REQ `REQ-PSEUDOCODE_FLEET_NB2_TRANCHE_ONE`.
