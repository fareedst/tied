# Fleet constraint v2 — NB-3 (Track B tranche two)

**Scope:** Methodology-side **planning and sponsor gate** for the **third** non-enrolled client batch after **NB-2 tranche one** complete. **No migration execution** in this document.

**Canonical program:** [`pseudocode-constraint-v2-fleet-program.md`](pseudocode-constraint-v2-fleet-program.md) · **Prior batch:** [`pseudocode-constraint-v2-fleet-nb2-plan.md`](pseudocode-constraint-v2-fleet-nb2-plan.md) · **CITDP:** [`CITDP-REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION`](../tied/citdp/CITDP-REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION.yaml) `nb3_tranche_two_module` · **Tracker:** [`working/fleet-constraint-v2/NB-3-tranche-two-agent-req-implementation-checklist.yaml`](../working/fleet-constraint-v2/NB-3-tranche-two-agent-req-implementation-checklist.yaml)

**TIED batch REQ:** [REQ-PSEUDOCODE_FLEET_NB3_TRANCHE_TWO](../tied/requirements/REQ-PSEUDOCODE_FLEET_NB3_TRANCHE_TWO.yaml) (Draft) · **Orchestrator:** [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION](../tied/requirements/REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION.yaml) remains **closed** — do not re-run `close_out`.

### Artifact index (NB-3)

| Artifact | Path | Role |
|----------|------|------|
| Pre-implementation CITDP slice | [`working/fleet-constraint-v2/NB-3-citdp-pre-implementation.v1.yaml`](../working/fleet-constraint-v2/NB-3-citdp-pre-implementation.v1.yaml) | Gate input; links `nb3_tranche_two_module` |
| NB-3 acceptance schema | [`working/fleet-constraint-v2/od-nb3-acceptance.v1.schema.json`](../working/fleet-constraint-v2/od-nb3-acceptance.v1.schema.json) | Machine validation for sponsor JSON |
| NB-3 acceptance template | [`working/fleet-constraint-v2/od-nb3-acceptance.v1.template.json`](../working/fleet-constraint-v2/od-nb3-acceptance.v1.template.json) | Draft → copy to `od-nb3-acceptance.v1.json` |
| Pre-implementation gate receipt | `working/fleet-constraint-v2/NB-3/gates/pre_implementation-*.json` | `tied_checklist_gate_validate` evidence |
| NB-2 close-out (prerequisite) | [`working/fleet-constraint-v2/NB-2/gates/machine-close-out-2026-09-13.json`](../working/fleet-constraint-v2/NB-2/gates/machine-close-out-2026-09-13.json) | Referenced in acceptance `prior_batch_complete` |
| Inventory (program) | [`working/fleet-constraint-v2/client-inventory-manifest.v1.yaml`](../working/fleet-constraint-v2/client-inventory-manifest.v1.yaml) | Wave-3 selection + post-wave rollup |
| G3 harness design | [`working/fleet-constraint-v2/p4-d-g3-harness-design.v1.md`](../working/fleet-constraint-v2/p4-d-g3-harness-design.v1.md) | `fleet-g3-wave` CLI contract for `/build-plan` |
| Program status snapshot | [`working/fleet-constraint-v2/program-status.v1.yaml`](../working/fleet-constraint-v2/program-status.v1.yaml) | Rolling counts; update after NB-3-G |
| IMPL orchestration pseudo-code | [`IMPL-PSEUDOCODE_FLEET_MIGRATION_ORCHESTRATION`](../tied/implementation-decisions/IMPL-PSEUDOCODE_FLEET_MIGRATION_ORCHESTRATION-pseudocode.md) | `RECORD_NB3_ACCEPTANCE`, `SELECT_NB3_WAVE_THREE_CLIENTS` |
| NB-2 script parity (build-plan) | [`scripts/fleet-nb2-orchestration.test.mjs`](../scripts/fleet-nb2-orchestration.test.mjs), [`scripts/run-nb2-*`](../scripts/) | Extend pattern for `run-nb3-*`, `fleet-nb3-orchestration.test.mjs` |

**Traceability tokens:** [REQ-PSEUDOCODE_FLEET_NB3_TRANCHE_TWO](../tied/requirements/REQ-PSEUDOCODE_FLEET_NB3_TRANCHE_TWO.yaml) · [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE](../tied/architecture-decisions/ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE.yaml) · [IMPL-PSEUDOCODE_FLEET_MIGRATION_ORCHESTRATION](../tied/implementation-decisions/IMPL-PSEUDOCODE_FLEET_MIGRATION_ORCHESTRATION.yaml)

---

## 1. Refine disposition (2026-09-13)

### 1.1 NB-2 completion (baseline for NB-3)

**NB-2 tranche one is complete** when all of the following hold (evidence: [`program-status.v1.yaml`](../working/fleet-constraint-v2/program-status.v1.yaml), [`machine-close-out-2026-09-13.json`](../working/fleet-constraint-v2/NB-2/gates/machine-close-out-2026-09-13.json)):

| Claim | Proof boundary |
|-------|----------------|
| Five wave-2 clients **fleet-migrated-client** | Manifest rows + G3 receipts under `working/fleet-constraint-v2/waves/{client_id}/` |
| Batch REQ machine close-out | `REQ-PSEUDOCODE_FLEET_NB2_TRANCHE_ONE` Implemented |
| Orchestrator REQ | **Still closed** — no re-verify |
| **10** not_enrolled **fleet-migrated-client** total | Manifest rollup (NB-1 + NB-2) |

**NB-2 does not mean:** Track B complete — **8** header-only-v2 `not_enrolled_phase_4` rows remain (plus optional **NB-4** for 2–3 deferred IDs).

### 1.2 What remains

| Workstream | Status | Gate |
|------------|--------|------|
| **Continuous G4 maintenance** | Unblocked | Run G4 CI on cadence |
| **Track B — remaining 8 clients** | Not started (NB-3) | **OD-NB3-1** sponsor acceptance |
| **NB-3** (tranche two, up to 5 clients) | Plan ready; execution blocked | `od-nb3-acceptance.v1.json` → `/build-plan` |
| **NB-4** | After NB-3 | Final 2–3 rows incl. tooling decision |

### 1.3 NB-2 retrospective learnings (apply to NB-3)

| Learning | NB-3 implication |
|----------|------------------|
| **Sponsor JSON before G3** | New artifact `od-nb3-acceptance.v1.json`; `prior_batch_complete` points to NB-2 machine close-out |
| **Manifest honesty** | Reject `header-only-v2` candidates that are already `fleet-migrated-client` (NB-1/NB-2 IDs) |
| **Sidecar remediation** | Client **1788547701** required post-closeout sidecar work in NB-2 — budget operator time for wave-3 clients with larger sidecar counts |
| **Low sidecar burden first** | NB-2 exhausted 2–3 sidecar primaries; NB-3 primary tier is **3–4 sidecars**; defer **5–6** unless OD-NB3-3 |
| **Orchestration scripts** | [`scripts/lib/fleet-nb1-orchestration.mjs`](../scripts/lib/fleet-nb1-orchestration.mjs) already carries NB-2 exports; **build-plan** adds NB-3 (`recordNb3Acceptance`, `selectNb3WaveThreeClients`) mirroring [`scripts/fleet-nb2-orchestration.test.mjs`](../scripts/fleet-nb2-orchestration.test.mjs) and `run-nb2-*` |
| **Client-owned REQs** | Same NB-2-C..E pattern |
| **Machine close-out REQ per batch** | NB-3 scoped to `REQ-PSEUDOCODE_FLEET_NB3_TRANCHE_TWO` — do not reopen orchestrator REQ |
| **Default exclude tooling** | `tied-win-diff` excluded unless OD-NB3-2 override |
| **Acceptance schema date-time** | `decided_at` uses JSON Schema `format: date-time`; `allOf` requires non-null string when `status: accepted` (ajv parity with od-nb2) |
| **tied_verify / CITDP gate shape** | Batch close-out uses per-batch REQ envelope + machine receipt under `working/fleet-constraint-v2/NB-3/gates/` — not orchestrator re-verify |

### 1.4 Sponsor terms (RESOLVE)

| Term | Meaning |
|------|---------|
| **Track B tranche two (NB-3)** | Third sponsor-gated batch; max five remaining `not_enrolled_phase_4` **header-only-v2** clients |
| **OD-NB3-1** | Open decision: sponsor signs **NB-3-specific** acceptance JSON |
| **od-nb3-acceptance JSON** | Machine-readable record at `working/fleet-constraint-v2/od-nb3-acceptance.v1.json`; template [`od-nb3-acceptance.v1.template.json`](../working/fleet-constraint-v2/od-nb3-acceptance.v1.template.json) |
| **wave-3 client selection** | Manifest-driven; prefer lowest total active sidecars among remaining header-only rows |
| **Tranche index** | NB-1 tranche **zero**, NB-2 tranche **one**, NB-3 tranche **two** (program batch id NB-3) |
| **Client migration REQ** | Lives in **each client repo**; stdd holds inventory + policy only |

**Profile depth:** `minimal` for this refine pass. **Gate policy:** `advisory` on stdd pre-RED until NB-3 `/build-plan` scopes RED tests.

### 1.5 Open decisions (explicit)

| ID | Owner | Question | Default if silent |
|----|-------|----------|-------------------|
| OD-NB3-1 | Sponsor | Authorize NB-3 (1–5 clients) via `od-nb3-acceptance.v1.json`? | **No NB-3 work** — G4 maintenance only |
| OD-NB3-2 | Sponsor | Include `tied-win-diff` (1 sidecar tooling row)? | **Exclude** unless listed in acceptance JSON |
| OD-NB3-3 | Sponsor | Primary wave includes **1787691672** (5) or **1787626480** (6) or tranche > 5? | Use §3 table (3–4 sidecar primaries); max 5 per schema |
| OD-NB3-4 | Sponsor | Replace recommended `wave_3_client_ids`? | Use §3 table |

### 1.6 Sponsor default-proceed (this batch)

Apply [`pseudocode-constraint-v2-fleet-program.md`](pseudocode-constraint-v2-fleet-program.md) § **Sponsor default-proceed policy**. For NB-3, agents **proceed** on §1.5 defaults (authorize continuing Track B, exclude `tied-win-diff`, §3 five-client roster, max 5) without a sponsor Q&A round. **Ask the sponsor only** before `/build-plan` execution if the roster includes deferred **1787626480** / **tied-win-diff** or tranche >5. Acceptance JSON, this plan, and NB-2 close-out receipts are sufficient to reconsider and reimplement.

---

## 2. CITDP Plan — NB-3 tranche two

Persisted as **`nb3_tranche_two_module`** on the fleet CITDP. Pre-implementation gate slice: [`NB-3-citdp-pre-implementation.v1.yaml`](../working/fleet-constraint-v2/NB-3-citdp-pre-implementation.v1.yaml).

### 2.1 Change definition

| Field | Value |
|-------|-------|
| **current_behavior** | NB-2 complete (5 wave-2 fleet-migrated); 8 header-only-v2 `not_enrolled_phase_4`; no NB-3 acceptance |
| **desired_behavior** | Sponsor accepts NB-3; up to five next low-burden clients receive client-owned migration REQs + G3 waves; manifest updated **only after** wave receipts |
| **module_boundary** | stdd: acceptance schema, selection policy, harness invocation; **not** client IMPL bodies in stdd |

### 2.2 Falsification questions

1. Can manifest rows flip to **fleet-migrated-client** without G3 receipts under `working/fleet-constraint-v2/waves/{client_id}/`?
2. Can NB-3 select clients already migrated in NB-1 or NB-2?
3. Can NB-3 proceed without accepted `od-nb3-acceptance.v1.json`?
4. Can orchestrator `close_out` substitute for `REQ-PSEUDOCODE_FLEET_NB3_TRANCHE_TWO` verification?
5. Does G4 CI green imply NB-3 complete?

### 2.3 Risks

| ID | Risk | Mitigation |
|----|------|------------|
| RISK-NB3-REUSE | Reusing od-nb2 JSON for NB-3 without wave_3 fields | Separate schema `od-nb3-acceptance.v1`; IMPL `RECORD_NB3_ACCEPTANCE` |
| RISK-NB3-SELECTION | Selecting fleet-migrated NB-1/NB-2 IDs | `SELECT_NB3_WAVE_THREE_CLIENTS` requires `header-only-v2` |
| RISK-NB3-ORCH | Reopen closed orchestrator REQ | `orchestrator_reverify: false` const |
| RISK-NB3-BURDEN | Jump to 6-sidecar repo without sponsor ack | Document tier in §3; OD-NB3-3 |
| RISK-NB3-SCRIPT | NB-2-only test drift | Build-plan: `fleet-nb3-orchestration.test.mjs` + extend `fleet-nb1-orchestration.mjs` |

### 2.4 Test strategy (for `/build-plan`)

| Layer | Scope | Pass criterion (sketch) |
|-------|--------|-------------------------|
| **Unit** | `od-nb3-acceptance` schema + policy | RED tests mirror IMPL `RECORD_NB3_ACCEPTANCE` POST |
| **Unit** | Wave-3 selection vs manifest fixture (post-NB-2 inventory) | RED tests mirror IMPL `SELECT_NB3_WAVE_THREE_CLIENTS` |
| **Unit** | Reject NB-1/NB-2 migrated client IDs in wave-3 override | `already_migrated` failure mode |
| **Composition** | Harness CLI: `run-harness.sh fleet-g3-wave` | Dry-run only in stdd |
| **Regression** | G4 CI + NB-2 orchestration tests unchanged | Existing suites green |
| **E2E** | Not in stdd | Client repo migration verification |
| **Proof boundary** | stdd tests prove orchestration **inputs** | **fleet-migrated-client** proof in client repos |

**Build-plan script targets:** `scripts/fleet-nb3-orchestration.test.mjs` (new), `scripts/run-nb3-client-spawn.py`, `scripts/run-nb3-partition-append.py`, `scripts/run-nb3-manifest-rollup.py`, `scripts/run-nb3-client-closeout.mjs`, `scripts/run-nb3-wave-ops.mjs` — parity with NB-2 naming.

### 2.5 Module boundaries

```
stdd (NB-3 build-plan)
├── Sponsor gate: od-nb3-acceptance.v1.json (validated before G3)
├── Prerequisite: NB-2 machine close-out receipt path in acceptance
├── Inventory read: client-inventory-manifest.v1.yaml
├── Local partition: working/fleet-constraint-v2/waves/ (gitignored)
└── Scripts: extend fleet-nb1-orchestration.mjs; G3 via run-harness.sh fleet-g3-wave

client repo (per wave-3 client)
├── REQ-PSEUDOCODE_MIGRATION_* (client-owned)
├── working/{REQ}/ checklist + receipts
└── Sidecar apply + tied_verify/close_out in client tied/
```

### 2.6 Acceptance criteria — refine pass (this document)

| Criterion | Verification |
|-----------|--------------|
| NB-3 plan on disk | This file |
| CITDP `nb3_tranche_two_module` populated | Fleet CITDP YAML |
| Tracker with `execution_evidence.request: REQ-PSEUDOCODE_FLEET_NB3_TRANCHE_TWO` | NB-3-tranche-two checklist |
| od-nb3 schema + template committed | Files under `working/fleet-constraint-v2/` |
| IMPL blocks `RECORD_NB3_ACCEPTANCE`, `SELECT_NB3_WAVE_THREE_CLIENTS` | Sidecar + `pseudocode_validate` |
| TIED REQ Draft | `REQ-PSEUDOCODE_FLEET_NB3_TRANCHE_TWO` |
| `pre_implementation` gate allowed | Receipt under `working/fleet-constraint-v2/NB-3/gates/` |

### 2.7 `/build-plan` entry checklist (after NB-3-A)

1. `working/fleet-constraint-v2/od-nb3-acceptance.v1.json` exists with `status: accepted`, `decided_at`, `sponsor_signoff`.
2. `prior_batch_complete.close_out_receipt_path` file exists and matches NB-2 machine close-out.
3. Every `wave_3_client_id` is `not_enrolled_phase_4` and **header-only-v2** in manifest.
4. `orchestrator_reverify` is **false**.
5. `length(wave_3_client_ids) <= tranche_scope.max_clients` (≤ 5).
6. G4 CI last run green (`program-status.v1.yaml` `last_g4_ci_ok` or re-run).
7. Tracker advanced from `pre_implementation` only after build-plan gate re-validation.

---

## 3. Wave-3 client selection (recommended)

**Criteria:** `not_enrolled_phase_4`; **header-only-v2** only (excludes NB-1/NB-2 **fleet-migrated-client** rows); sort by **total active sidecars ascending**; `methodology_pin: 48d1fbb+`; exclude **`tied-win-diff`** unless OD-NB3-2 override.

**Source:** [`client-inventory-manifest.v1.yaml`](../working/fleet-constraint-v2/client-inventory-manifest.v1.yaml) (2026-09-13 post-NB-2). Logic specified in IMPL `SELECT_NB3_WAVE_THREE_CLIENTS`; sponsor overrides via acceptance JSON `wave_3_client_ids`.

| Priority | client_id | header-only sidecars | repository_root (operator) |
|----------|-----------|----------------------|----------------------------|
| 1 | `1787495576` | 3 | `/Users/fareed/Documents/dev/test/1787495576` |
| 2 | `1787603099` | 3 | `/Users/fareed/Documents/dev/test/1787603099` |
| 3 | `1787416567` | 4 | `/Users/fareed/Documents/dev/test/1787416567` |
| 4 | `1787507684` | 4 | `/Users/fareed/Documents/dev/test/1787507684` |
| 5 | `1787638699` | 4 | `/Users/fareed/Documents/dev/test/1787638699` |

**Deferred (higher burden — OD-NB3-3):** `1787691672` (5), `1787626480` (6)

**Special (1 sidecar, tooling):** `tied-win-diff` — OD-NB3-2 only

**NB-4 remainder (after default NB-3 tranche):** `1787691672`, `1787626480`, and **`tied-win-diff`** unless folded into NB-3 via OD-NB3-2.

**Minimum tranche:** Schema allows 1–5 clients; sponsor may accept fewer than five IDs.

---

## 4. Executable steps (blocked vs unblocked)

| Step | ID | Depends on | Blocked? | Action | Done when (testable) |
|------|-----|------------|----------|--------|----------------------|
| G4 maintenance | M-G4 | — | **No** | `node scripts/run-fleet-g4-ci-checks.mjs` | Exit 0 |
| Refine NB-3 plan + CITDP + tracker | NB-3-R | NB-2 complete | **No** | This doc + working artifacts | §2.6 criteria met |
| Sponsor NB-3 acceptance | NB-3-A | — | **Yes** | Template → `od-nb3-acceptance.v1.json`; `status: accepted` | JSON validates; IMPL POST satisfied |
| Client REQ + checklist spawn | NB-3-C | NB-3-A | **Yes** | Per client: `REQ-PSEUDOCODE_MIGRATION_*` | Client TIED indexes list migration REQ |
| Client migration execute | NB-3-D | NB-3-C | **Yes** | Sidecar apply, verify per client policy | Client tests/verify green |
| Client close_out + receipt export | NB-3-E | NB-3-D | **Yes** | Client close_out; export to `waves/{client_id}/` | Receipt paths for manifest update |
| G3 wave harness (stdd) | NB-3-F | NB-3-A, NB-3-E per client | **Yes** | `/build-plan` — `run-harness.sh fleet-g3-wave` | Harness receipts validate |
| Manifest + dashboard refresh | NB-3-G | NB-3-F | **Yes** | Update manifest only with receipts | Honest aggregate states |
| NB-4 final tranche | NB-4 | NB-3-G | **Yes** | Retrospective + sponsor batch | New plan |

**Ordering:** NB-3-F may interleave per client after NB-3-E; **NB-3-G must not run** until all accepted wave-3 clients have receipt evidence.

---

## 5. Implement gate (pre-implementation only)

**Completed in this refine pass:**

- NB-3 plan document (this file)
- CITDP `nb3_tranche_two_module` + pre-implementation slice
- Tracker copy with `execution_evidence.request: REQ-PSEUDOCODE_FLEET_NB3_TRANCHE_TWO`
- od-nb3 acceptance schema + template
- IMPL pseudo-code: `RECORD_NB3_ACCEPTANCE`, `SELECT_NB3_WAVE_THREE_CLIENTS`
- TIED REQ `REQ-PSEUDOCODE_FLEET_NB3_TRANCHE_TWO` (Draft)
- Pre-implementation gate receipt under `working/fleet-constraint-v2/NB-3/gates/`

**Deferred to `/build-plan` (after NB-3-A):**

- RED tests for NB-3 acceptance and wave-3 selection (§2.4)
- Extend `fleet-nb1-orchestration.mjs` / `run-nb3-*` closeout runners
- G3 wave execution and manifest updates (NB-3-F..G)
- Client-repo TIED stacks (NB-3-C..E)

---

## 6. Recommended next command

| Situation | Command |
|-----------|---------|
| Sponsor has not signed NB-3 acceptance | **Maintenance only** — G4 CI; fill template → sponsor review |
| Sponsor signed `od-nb3-acceptance.v1.json` (`status: accepted`) | **`/build-plan`** linked to this doc + tracker; satisfy §2.7 first |
| Sponsor declines further Track B | **Maintenance only** — G4 + honest manifest (8 header-only remain) |

**Suggested `/build-plan` link payload:** plan `docs/pseudocode-constraint-v2-fleet-nb3-plan.md`, tracker `working/fleet-constraint-v2/NB-3-tranche-two-agent-req-implementation-checklist.yaml`, acceptance `working/fleet-constraint-v2/od-nb3-acceptance.v1.json`, batch REQ `REQ-PSEUDOCODE_FLEET_NB3_TRANCHE_TWO`, CITDP module `nb3_tranche_two_module`, prerequisite receipt `working/fleet-constraint-v2/NB-2/gates/machine-close-out-2026-09-13.json`.
