# Fleet constraint v2 — NB-1 (Track B tranche zero)

**Scope:** Methodology-side **planning and sponsor gate** for the first **non-enrolled** client batch. **No migration execution** in this document.

**Canonical program:** [`pseudocode-constraint-v2-fleet-program.md`](pseudocode-constraint-v2-fleet-program.md) · **Grand plan:** [`pseudocode-constraint-v2-fleet-migration-grand-plan.md`](pseudocode-constraint-v2-fleet-migration-grand-plan.md) (pointer only) · **CITDP:** [`CITDP-REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION`](../tied/citdp/CITDP-REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION.yaml) `nb1_tranche_zero_module` · **Tracker:** [`working/fleet-constraint-v2/NB-1-tranche-zero-agent-req-implementation-checklist.yaml`](../working/fleet-constraint-v2/NB-1-tranche-zero-agent-req-implementation-checklist.yaml)

**TIED orchestrator:** [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION](../tied/requirements/REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION.yaml) remains **closed** — do not re-run `close_out` or reopen without sponsor.

### Artifact index (NB-1)

| Artifact | Path | Role |
|----------|------|------|
| Pre-implementation CITDP slice | [`working/fleet-constraint-v2/NB-1-citdp-pre-implementation.v1.yaml`](../working/fleet-constraint-v2/NB-1-citdp-pre-implementation.v1.yaml) | Gate input; links `nb1_tranche_zero_module` |
| OD-P5-2 acceptance schema | [`working/fleet-constraint-v2/od-p5-2-acceptance.v1.schema.json`](../working/fleet-constraint-v2/od-p5-2-acceptance.v1.schema.json) | Machine validation for sponsor JSON |
| OD-P5-2 acceptance template | [`working/fleet-constraint-v2/od-p5-2-acceptance.v1.template.json`](../working/fleet-constraint-v2/od-p5-2-acceptance.v1.template.json) | Draft → copy to `od-p5-2-acceptance.v1.json` |
| Pre-implementation gate receipt | [`working/fleet-constraint-v2/NB-1/gates/pre_implementation-2026-09-13T17-31-22-743Z.json`](../working/fleet-constraint-v2/NB-1/gates/pre_implementation-2026-09-13T17-31-22-743Z.json) | `tied_checklist_gate_validate` evidence (refine v2) |
| Inventory (program) | [`working/fleet-constraint-v2/client-inventory-manifest.v1.yaml`](../working/fleet-constraint-v2/client-inventory-manifest.v1.yaml) | Wave selection + post-wave rollup source |
| G3 harness design | [`working/fleet-constraint-v2/p4-d-g3-harness-design.v1.md`](../working/fleet-constraint-v2/p4-d-g3-harness-design.v1.md) | `fleet-g3-wave` CLI contract for `/build-plan` |
| Program status snapshot | [`working/fleet-constraint-v2/program-status.v1.yaml`](../working/fleet-constraint-v2/program-status.v1.yaml) | Rolling counts; update after NB-1-G |
| IMPL orchestration pseudo-code | [`IMPL-PSEUDOCODE_FLEET_MIGRATION_ORCHESTRATION`](../tied/implementation-decisions/IMPL-PSEUDOCODE_FLEET_MIGRATION_ORCHESTRATION-pseudocode.md) | `RECORD_OD_P5_2_ACCEPTANCE`, `SELECT_NB1_WAVE_ONE_CLIENTS` |

**Traceability tokens:** [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION](../tied/requirements/REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION.yaml) · [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE](../tied/architecture-decisions/ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE.yaml) · [IMPL-PSEUDOCODE_FLEET_MIGRATION_ORCHESTRATION](../tied/implementation-decisions/IMPL-PSEUDOCODE_FLEET_MIGRATION_ORCHESTRATION.yaml)

---

## 1. Refine disposition (2026-09-13)

### 1.1 What “Phase 5 complete” means

**Phase 5 (stdd methodology slice) is complete** when all of the following hold (evidence: `working/fleet-constraint-v2/p5-h-phase-5-exit-report.v1.json`, `phase-5-exit-review.v1.json`):

| Claim | Proof boundary |
|-------|----------------|
| **G4** continuous CI operational | `scripts/run-fleet-g4-ci-checks.mjs` + EX-P5-01..04 |
| **New-client bootstrap** cannot silently stay header-only at G4 | P5-F bootstrap enforcement report |
| **Enrolled Track A** (5 repos) stays **fleet-migrated-client** under regression | G4 `enrolled_track_regression` dimension |
| **FEAT-spawned** integrated envelope policy documented + validator | P5-G |
| **v1 parser** removal deferred; quarantine policy published | OD-P5-1 |
| **CITDP** `phase_5_module` persisted | EX-P5-08 |

**Phase 5 does not mean:** full qualification manifest migrated, Track B complete, v1 parser removed, or orchestrator REQ re-verified.

### 1.2 What remains

| Workstream | Status | Gate |
|------------|--------|------|
| **Continuous G4 maintenance** | Unblocked | Run G4 CI on cadence (program doc) |
| **Track B — 18 clients** | Not started | **OD-P5-2** sponsor acceptance |
| **NB-1** (tranche zero, 3–5 clients) | Plan ready; execution blocked | `od-p5-2-acceptance.v1.json` → `/build-plan` |
| **Optional Phase 5b doc** | Only if tranche > ~5 clients | Sponsor; else execute from this plan |
| **Remaining 13+ clients** | After NB-1 | Future batches NB-2+ |

### 1.3 Sponsor terms (RESOLVE)

| Term | Meaning |
|------|---------|
| **Track B tranche zero (NB-1)** | First bounded G3 program on `phase_4_enrollment: not_enrolled_phase_4` rows only |
| **OD-P5-2** | Open decision: Phase 5 deferred tranche → sponsor **amends** to authorize NB-1 scope |
| **OD-P5-2 acceptance JSON** | Machine-readable sponsor record at `working/fleet-constraint-v2/od-p5-2-acceptance.v1.json`; template [`od-p5-2-acceptance.v1.template.json`](../working/fleet-constraint-v2/od-p5-2-acceptance.v1.template.json) |
| **Client migration REQ** | Lives in **each client repo** (`REQ-PSEUDOCODE_MIGRATION_*` or project naming convention); stdd holds inventory + policy only |
| **fleet-migrated-client (proof)** | Client REQ verification + sidecar state rollups + receipts; **not** manifest edit alone |

**Profile depth:** `minimal` for this refine pass (documentation + CITDP + pre-implementation gate). **Gate policy:** `advisory` on stdd pre-RED until NB-1 `/build-plan` scopes RED tests.

**Hygiene plan cross-link:** The hygiene plan’s [pre-cohort client test runbook](pre-cohort-client-test-grammar-v2-and-evidence.md) targets **disposable bootstrap** before large cohorts. NB-1 **wave selection** uses [`client-inventory-manifest.v1.yaml`](../working/fleet-constraint-v2/client-inventory-manifest.v1.yaml) sidecar counts — **not** a stdd sidecar mass-apply. Optional: run pre-cohort on one disposable clone **after** OD-P5-2 if sponsor wants extra bootstrap confidence (out of NB-1 default scope).

### 1.4 Open decisions (explicit)

| ID | Owner | Question | Default if silent |
|----|-------|----------|-------------------|
| OD-P5-2 | Sponsor | Authorize NB-1 (3–5 clients) via acceptance JSON? | **No Track B work** — G4 maintenance only |
| OD-NB1-1 | Sponsor | Replace recommended `wave_1_client_ids` in acceptance JSON? | Use §3 table |
| OD-NB1-2 | Sponsor | Include `tied-win-diff` or other special tooling row? | **Exclude** unless override in acceptance JSON |
| OD-NB1-3 | Sponsor | Tranche size > 5 clients? | Requires NB-1-B Phase 5b short plan **or** sponsor amends `max_clients` in schema (currently capped at 5) |

---

## 2. CITDP Plan — NB-1 tranche zero

Persisted as **`nb1_tranche_zero_module`** on the fleet CITDP (orchestrator REQ unchanged). Pre-implementation gate slice: [`NB-1-citdp-pre-implementation.v1.yaml`](../working/fleet-constraint-v2/NB-1-citdp-pre-implementation.v1.yaml).

### 2.1 Change definition

| Field | Value |
|-------|-------|
| **current_behavior** | 18 manifest rows `not_enrolled_phase_4`, all **header-only-v2**; OD-P5-2 decision = defer tranche (2026-09-13); no G3 waves on Track B |
| **desired_behavior** | Sponsor accepts NB-1; 3–5 low-burden clients receive client-owned migration REQs + G3 waves; manifest/dashboard updated **only after** wave receipts; G4 maintenance unchanged |
| **module_boundary** | stdd: acceptance schema, inventory partition pointers, harness invocation policy; **not** sidecar edits in stdd for client IMPL bodies |

### 2.2 Falsification questions

1. Can manifest rows flip to **fleet-migrated-client** without G3 receipts under `working/fleet-constraint-v2/waves/{client_id}/` (and matching client-repo evidence)?
2. Does G4 CI green imply Track B complete?
3. Can NB-1 proceed without signed `od-p5-2-acceptance.v1.json` with `status: accepted`?
4. Can orchestrator `close_out` substitute for per-client migration REQ verification?
5. Can stdd `working/` accumulate durable client migration archives? (**Invalid** — client repos own history.)

### 2.3 Risks

| ID | Risk | Mitigation |
|----|------|------------|
| RISK-NB1-HEADER | Header-only mistaken for fleet-migrated | Require G3 receipts + sidecar state rollups before manifest aggregate update |
| RISK-NB1-SCOPE | stdd accumulates client migration archives | Doc policy + waves under gitignored `working/fleet-constraint-v2/waves/` only as local replay |
| RISK-NB1-ORCH | Reopen closed orchestrator REQ | Explicit `orchestrator_reverify: false` in acceptance JSON; IMPL `RECORD_OD_P5_2_ACCEPTANCE` rejects `true` |
| RISK-NB1-BURDEN | F11 stop on tiny repos | Pilot workflow + ≤10 sidecars per sub-wave (reuse Phase 3 policy) |
| RISK-NB1-PIN | Client clone on wrong methodology pin | Acceptance JSON `methodology_pin` must match manifest row; reject on mismatch at selection |

### 2.4 Test strategy (for `/build-plan`)

| Layer | Scope | Pass criterion (sketch) |
|-------|--------|-------------------------|
| **Unit** | Acceptance JSON schema + policy (`orchestrator_reverify`, `max_clients`, `status`) | RED tests mirror IMPL `RECORD_OD_P5_2_ACCEPTANCE` POST conditions |
| **Unit** | Wave selection vs manifest fixture | RED tests mirror IMPL `SELECT_NB1_WAVE_ONE_CLIENTS` enrollment filter |
| **Composition** | Harness CLI contract: `run-harness.sh fleet-g3-wave` args match partition file | No client-repo write in stdd tests; dry-run only |
| **Regression** | G4 CI suite unchanged | `node scripts/run-fleet-g4-ci-checks.mjs` green; enrolled five-repo dimension stays green |
| **E2E** | Not in stdd | Client repo migration verification only |
| **Proof boundary** | stdd tests prove orchestration **inputs** | **fleet-migrated-client** proof is client REQ + receipts + honest manifest rollup |

### 2.5 Module boundaries

```
stdd (NB-1 build-plan)
├── Sponsor gate: od-p5-2-acceptance.v1.json (validated before any G3 wave)
├── Inventory read: client-inventory-manifest.v1.yaml
├── Local partition: working/fleet-constraint-v2/waves/ (gitignored)
├── Partition spec: fleet-wave-partition.v1.yaml (per p4-d design)
└── Scripts: run-fleet-g3-wave.ts via run-harness.sh fleet-g3-wave; dashboard refresh

client repo (per wave-1 client)
├── REQ-PSEUDOCODE_MIGRATION_* (client-owned)
├── working/{REQ}/ checklist + receipts + envelope
└── Sidecar apply + tied_verify/close_out in client tied/
```

### 2.6 Acceptance criteria — refine pass (this document)

| Criterion | Verification |
|-----------|--------------|
| NB-1 plan on disk with executable steps + falsification | This file |
| CITDP `nb1_tranche_zero_module` populated | `tied/citdp/CITDP-REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION.yaml` |
| Tracker copy with `execution_evidence.request: NB-1-TRACK-B-TRANCHE-ZERO` | `NB-1-tranche-zero-agent-req-implementation-checklist.yaml` |
| OD-P5-2 schema + template committed under `working/fleet-constraint-v2/` | Files exist; template validates against schema |
| IMPL blocks `RECORD_OD_P5_2_ACCEPTANCE`, `SELECT_NB1_WAVE_ONE_CLIENTS` with token comments | IMPL sidecar + `pseudocode_validate` |
| `pre_implementation` gate allowed | Latest receipt under `working/fleet-constraint-v2/NB-1/gates/pre_implementation-*.json` |

### 2.7 `/build-plan` entry checklist (after NB-1-A)

All must be true before linking `/build-plan` to this doc:

1. `working/fleet-constraint-v2/od-p5-2-acceptance.v1.json` exists with `status: accepted`, `decided_at`, and `sponsor_signoff` populated.
2. Every `wave_1_client_id` appears in `client-inventory-manifest.v1.yaml` with `phase_4_enrollment: not_enrolled_phase_4`.
3. `orchestrator_reverify` is **false** (schema const).
4. `length(wave_1_client_ids) <= tranche_scope.max_clients` (≤ 5).
5. G4 CI last run green (see `program-status.v1.yaml` `last_g4_ci_ok` or re-run maintenance command).
6. Tracker `nb1_tranche_zero.status` advanced from `pre_implementation` only after build-plan gate re-validation.

---

## 3. Wave-1 client selection (recommended)

**Criteria:** `not_enrolled_phase_4`; **header-only-v2** only; **total active sidecars ≤ 1** (lowest burden); `methodology_pin: 48d1fbb+`; exclude special tooling row **`tied-win-diff`** unless sponsor overrides (OD-NB1-2).

**Source:** [`client-inventory-manifest.v1.yaml`](../working/fleet-constraint-v2/client-inventory-manifest.v1.yaml) (2026-09-13). Selection logic is specified in IMPL `SELECT_NB1_WAVE_ONE_CLIENTS`; sponsor overrides via acceptance JSON `wave_1_client_ids` only.

| Priority | client_id | header-only sidecars | repository_root (operator) |
|----------|-----------|----------------------|----------------------------|
| 1 | `1786636023` | 1 | `/Users/fareed/Documents/dev/test/1786636023` |
| 2 | `1786637086` | 1 | `/Users/fareed/Documents/dev/test/1786637086` |
| 3 | `1786666674` | 1 | `/Users/fareed/Documents/dev/test/1786666674` |
| 4 | `1787503424` | 1 | `/Users/fareed/Documents/dev/test/1787503424` |
| 5 | `1789087315` | 1 | `/Users/fareed/Documents/dev/test/1789087315` |

**Alternates (2 sidecars):** `1786637885`, `1786643714`, `1788547701` — use if a primary repo is unavailable; document swap in acceptance JSON `notes`.

**Minimum tranche:** Schema allows 1–5 clients; sponsor may accept fewer than five IDs in `wave_1_client_ids` if burden or availability requires it.

---

## 4. Executable steps (blocked vs unblocked)

| Step | ID | Depends on | Blocked? | Action | Done when (testable) |
|------|-----|------------|----------|--------|----------------------|
| G4 maintenance | M-G4 | — | **No** | `node scripts/run-fleet-g4-ci-checks.mjs` | Exit 0; enrolled regression dimension green |
| Refine NB-1 plan + CITDP + tracker | NB-1-R | — | **No** | This doc + working artifacts | §2.6 criteria met |
| Sponsor OD-P5-2 acceptance | NB-1-A | — | **Yes** | Fill template → `od-p5-2-acceptance.v1.json`; set `status: accepted` | JSON validates against schema; IMPL POST conditions satisfied |
| Optional Phase 5b short plan | NB-1-B | NB-1-A | **Yes** | Only if sponsor tranche > 5 clients (OD-NB1-3) | Separate doc or sponsor waiver recorded in acceptance `notes` |
| Client REQ + checklist spawn | NB-1-C | NB-1-A | **Yes** | Per client: create `REQ-PSEUDOCODE_MIGRATION_*`, copy agent checklist under `working/{REQ}/` | Client TIED indexes list migration REQ; checklist path exists |
| Client migration execute | NB-1-D | NB-1-C | **Yes** | Sidecar apply, verify, adversarial depth per client policy | Client `tied_verify` / tests green for migration scope |
| Client close_out + receipt export | NB-1-E | NB-1-D | **Yes** | Client close_out; export receipt summary to operator `waves/{client_id}/` | Receipt paths referenced by future manifest update |
| G3 wave harness (stdd) | NB-1-F | NB-1-A, NB-1-E per client | **Yes** | `/build-plan` — partition + `working/PSEUDOCODE-CONSTRAINT-STUDY/qualification/scripts/run-harness.sh fleet-g3-wave` | Harness dry-run/execute per p4-d; receipt batch validates |
| Manifest + dashboard refresh | NB-1-G | NB-1-F | **Yes** | Update manifest row only when receipts + client proof align; refresh dashboard + `program-status.v1.yaml` | Row `aggregate_migration_state` matches sidecar counts; falsification §2.2 Q1 fails if receipts missing |
| NB-2+ remaining clients | NB-2 | NB-1-G | **Yes** | Retrospective + sponsor batch | New plan or OD amend |

**Ordering note:** NB-1-F may interleave per client after NB-1-E for that client, but **NB-1-G must not run** until all accepted wave-1 clients have receipt evidence (local + client repo).

---

## 5. Implement gate (pre-implementation only)

**Completed in this refine pass:**

- NB-1 plan document (this file) — §2.6 acceptance criteria
- CITDP `nb1_tranche_zero_module` + pre-implementation slice YAML
- Tracker copy with `execution_evidence.request: NB-1-TRACK-B-TRANCHE-ZERO`
- OD-P5-2 acceptance JSON schema + template
- IMPL pseudo-code: `RECORD_OD_P5_2_ACCEPTANCE`, `SELECT_NB1_WAVE_ONE_CLIENTS` on [IMPL-PSEUDOCODE_FLEET_MIGRATION_ORCHESTRATION](../tied/implementation-decisions/IMPL-PSEUDOCODE_FLEET_MIGRATION_ORCHESTRATION-pseudocode.md)
- Pre-implementation gate receipt under `working/fleet-constraint-v2/NB-1/gates/`

**Operator checks (refine pass, no RED tests yet):**

```bash
# TIED MCP or tied-cli equivalent
tied_checklist_gate_validate phase=pre_implementation \
  tracker_path=working/fleet-constraint-v2/NB-1-tranche-zero-agent-req-implementation-checklist.yaml \
  citdp=working/fleet-constraint-v2/NB-1-citdp-pre-implementation.v1.yaml

pseudocode_validate on IMPL-PSEUDOCODE_FLEET_MIGRATION_ORCHESTRATION (NB-1 blocks)

tied_validate_consistency
```

**Deferred to `/build-plan` (after NB-1-A):**

- RED tests for acceptance validation and wave selection (§2.4)
- Any new stdd orchestration script bodies beyond existing G3 harness
- G3 wave execution against operator client clones
- Manifest row updates (NB-1-G)
- Client-repo TIED stacks (NB-1-C..E)

---

## 6. Recommended next command

| Situation | Command |
|-----------|---------|
| Sponsor has not signed OD-P5-2 | **Maintenance only** — G4 CI; sponsor meeting to fill acceptance JSON from template |
| Sponsor signed `od-p5-2-acceptance.v1.json` (`status: accepted`) | **`/build-plan`** linked to this doc + tracker path; satisfy §2.7 first |
| Sponsor declines Track B in 2026 | **Maintenance only** — G4 + honest manifest (18 not enrolled) |

**Suggested `/build-plan` link payload:** plan `docs/pseudocode-constraint-v2-fleet-nb1-plan.md`, tracker `working/fleet-constraint-v2/NB-1-tranche-zero-agent-req-implementation-checklist.yaml`, acceptance `working/fleet-constraint-v2/od-p5-2-acceptance.v1.json`.
