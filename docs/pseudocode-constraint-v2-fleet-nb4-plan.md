# Fleet constraint v2 — NB-4 (Track B final tranche)

**Scope:** Methodology-side **planning and sponsor gate** for the **fourth and final** non-enrolled client batch after **NB-3 tranche two** complete. **No migration execution** in this document until sponsor acceptance and `/build-plan`.

**Canonical program:** [`pseudocode-constraint-v2-fleet-program.md`](pseudocode-constraint-v2-fleet-program.md) · **Completion + grading:** [`pseudocode-constraint-v2-fleet-completion-plan.md`](pseudocode-constraint-v2-fleet-completion-plan.md) · **Prior batch:** [`pseudocode-constraint-v2-fleet-nb3-plan.md`](pseudocode-constraint-v2-fleet-nb3-plan.md) · **CITDP:** [`CITDP-REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION`](../tied/citdp/CITDP-REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION.yaml) `nb4_tranche_final_module` · **Tracker:** [`working/fleet-constraint-v2/NB-4-tranche-final-agent-req-implementation-checklist.yaml`](../working/fleet-constraint-v2/NB-4-tranche-final-agent-req-implementation-checklist.yaml)

**TIED batch REQ:** [REQ-PSEUDOCODE_FLEET_NB4_TRANCHE_FINAL](../tied/requirements/REQ-PSEUDOCODE_FLEET_NB4_TRANCHE_FINAL.yaml) (Draft) · **Orchestrator:** [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION](../tied/requirements/REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION.yaml) remains **closed** — do not re-run `close_out`.

### Artifact index (NB-4)

| Artifact | Path | Role |
|----------|------|------|
| Pre-implementation CITDP slice | [`working/fleet-constraint-v2/NB-4-citdp-pre-implementation.v1.yaml`](../working/fleet-constraint-v2/NB-4-citdp-pre-implementation.v1.yaml) | Gate input; links `nb4_tranche_final_module` |
| NB-4 acceptance schema | [`working/fleet-constraint-v2/od-nb4-acceptance.v1.schema.json`](../working/fleet-constraint-v2/od-nb4-acceptance.v1.schema.json) | Machine validation for sponsor JSON |
| NB-4 acceptance template | [`working/fleet-constraint-v2/od-nb4-acceptance.v1.template.json`](../working/fleet-constraint-v2/od-nb4-acceptance.v1.template.json) | Draft → copy to `od-nb4-acceptance.v1.json` |
| Pre-implementation gate receipt | `working/fleet-constraint-v2/NB-4/gates/pre_implementation-2026-09-13T21-43-07-918Z.json` | `tied_checklist_gate_validate` evidence |
| NB-3 close-out (prerequisite) | `working/fleet-constraint-v2/NB-3/gates/machine-close-out-2026-09-13.json` | Referenced in acceptance `prior_batch_complete` |
| Inventory (program) | [`client-inventory-manifest.v1.yaml`](../working/fleet-constraint-v2/client-inventory-manifest.v1.yaml) | Wave-4 selection + post-wave rollup |
| Tracker | [`working/fleet-constraint-v2/NB-4-tranche-final-agent-req-implementation-checklist.yaml`](../working/fleet-constraint-v2/NB-4-tranche-final-agent-req-implementation-checklist.yaml) | `/build-plan` hook |
| Per-request tracker | [`working/REQ-PSEUDOCODE_FLEET_NB4_TRANCHE_FINAL/agent-req-implementation-checklist.yaml`](../working/REQ-PSEUDOCODE_FLEET_NB4_TRANCHE_FINAL/agent-req-implementation-checklist.yaml) | Batch REQ envelope |
| G3 harness design | [`working/fleet-constraint-v2/p4-d-g3-harness-design.v1.md`](../working/fleet-constraint-v2/p4-d-g3-harness-design.v1.md) | `fleet-g3-wave` CLI contract |
| Program status snapshot | [`working/fleet-constraint-v2/program-status.v1.yaml`](../working/fleet-constraint-v2/program-status.v1.yaml) | Update after NB-4-G |
| IMPL orchestration pseudo-code | [`IMPL-PSEUDOCODE_FLEET_MIGRATION_ORCHESTRATION`](../tied/implementation-decisions/IMPL-PSEUDOCODE_FLEET_MIGRATION_ORCHESTRATION-pseudocode.md) | `RECORD_NB4_ACCEPTANCE`, `SELECT_NB4_WAVE_FOUR_CLIENTS` |
| NB-3 script parity (build-plan) | [`scripts/fleet-nb3-orchestration.test.mjs`](../scripts/fleet-nb3-orchestration.test.mjs), [`scripts/run-nb3-*`](../scripts/) | Extend to `run-nb4-*`, `fleet-nb4-orchestration.test.mjs` |

**Traceability tokens:** [REQ-PSEUDOCODE_FLEET_NB4_TRANCHE_FINAL](../tied/requirements/REQ-PSEUDOCODE_FLEET_NB4_TRANCHE_FINAL.yaml) · [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE](../tied/architecture-decisions/ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE.yaml) · [IMPL-PSEUDOCODE_FLEET_MIGRATION_ORCHESTRATION](../tied/implementation-decisions/IMPL-PSEUDOCODE_FLEET_MIGRATION_ORCHESTRATION.yaml)

---

## 1. Refine disposition (2026-09-13)

### 1.1 NB-3 completion (baseline for NB-4)

**NB-3 tranche two is complete** when all of the following hold (evidence: [`program-status.v1.yaml`](../working/fleet-constraint-v2/program-status.v1.yaml), NB-3 machine close-out receipt):

| Claim | Proof boundary |
|-------|----------------|
| Five wave-3 clients **fleet-migrated-client** | Manifest rows + G3 receipts under `working/fleet-constraint-v2/waves/{client_id}/` |
| Batch REQ machine close-out | `REQ-PSEUDOCODE_FLEET_NB3_TRANCHE_TWO` Implemented |
| Orchestrator REQ | **Still closed** — no re-verify |
| **15** not_enrolled **fleet-migrated-client** total | Manifest rollup (NB-1 + NB-2 + NB-3) |

**NB-3 does not mean:** Track B complete — **3** header-only-v2 `not_enrolled_phase_4` rows remain.

### 1.2 What remains

| Workstream | Status | Gate |
|------------|--------|------|
| **Continuous G4 maintenance / grading** | Unblocked | G4 CI on cadence |
| **Track B — final 3 clients** | NB-4 not started | **OD-NB4-1** sponsor acceptance |
| **NB-4** (final tranche, 1–3 clients) | Plan ready (this doc); artifacts WS-1 | `od-nb4-acceptance.v1.json` → `/build-plan` |
| **Track B program exit** | After NB-4-G | Zero header-only not_enrolled rows |

### 1.3 NB-3 retrospective learnings (apply to NB-4)

| Learning | NB-4 implication |
|----------|------------------|
| **Sponsor JSON before G3** | `od-nb4-acceptance.v1.json`; `prior_batch_complete` → NB-3 machine close-out |
| **High sidecar burden** | Default tranche is **1787691672** (5) + **1787626480** (6); budget remediation like NB-2 **1788547701** |
| **Tooling row** | `tied-win-diff` excluded unless OD-NB4-2 |
| **Orchestration scripts** | NB-3 `run-nb3-*` pattern → NB-4 exports in `fleet-nb1-orchestration.mjs` |
| **Machine close-out REQ per batch** | `REQ-PSEUDOCODE_FLEET_NB4_TRANCHE_FINAL` — do not reopen orchestrator REQ |
| **Last tranche** | After NB-4-G, **18/18** not_enrolled must be **fleet-migrated-client** |

### 1.4 Sponsor terms (RESOLVE)

| Term | Meaning |
|------|---------|
| **Track B tranche final (NB-4)** | Fourth sponsor-gated batch; **all remaining** `not_enrolled_phase_4` **header-only-v2** clients (max 3 today) |
| **OD-NB4-1** | Sponsor signs **NB-4-specific** acceptance JSON |
| **od-nb4-acceptance JSON** | Machine record at `working/fleet-constraint-v2/od-nb4-acceptance.v1.json` |
| **wave-4 client selection** | Manifest-driven; only header-only rows eligible; overrides via acceptance `wave_4_client_ids` |
| **Tranche index** | NB-4 = program batch id; tranche **three** in zero-based tranche index after NB-1..3 |

**Profile depth:** `minimal` for refine pass. **Gate policy:** `advisory` on stdd pre-RED until NB-4 `/build-plan` scopes RED tests.

### 1.5 Open decisions (explicit)

| ID | Owner | Question | Default if silent |
|----|-------|----------|-------------------|
| OD-NB4-1 | Sponsor | Authorize NB-4 (1–3 clients) via `od-nb4-acceptance.v1.json`? | **No NB-4 work** — G4 maintenance only |
| OD-NB4-2 | Sponsor | Include `tied-win-diff`? | **Exclude** unless listed in acceptance JSON |
| OD-NB4-3 | Sponsor | Execute **1787626480** (6 sidecars) without explicit ack? | **Include** with **1787691672** per program default-proceed |
| OD-NB4-4 | Sponsor | Replace recommended `wave_4_client_ids`? | Use §3 table |

### 1.6 Sponsor default-proceed (this batch)

Apply [`pseudocode-constraint-v2-fleet-program.md`](pseudocode-constraint-v2-fleet-program.md) § **Sponsor default-proceed policy**. Proceed on §1.5 defaults without a sponsor Q&A round. **Ask the sponsor only** before `/build-plan` if acceptance includes `tied-win-diff` without OD-NB4-2 rationale, tranche > 5, or `orchestrator_reverify: true`.

---

## 2. CITDP Plan — NB-4 tranche final

Persist as **`nb4_tranche_final_module`** on the fleet CITDP (append in WS-1). Pre-implementation slice: `working/fleet-constraint-v2/NB-4-citdp-pre-implementation.v1.yaml`.

### 2.1 Change definition

| Field | Value |
|-------|-------|
| **current_behavior** | NB-3 complete (5 wave-3 fleet-migrated); **3** header-only-v2 `not_enrolled_phase_4`; no NB-4 acceptance |
| **desired_behavior** | Sponsor accepts NB-4; remaining header-only clients reach **fleet-migrated-client** via client REQs + G3; manifest shows **0** header-only not_enrolled; Track B exit |
| **module_boundary** | stdd: acceptance, selection, harness; **not** client IMPL bodies in stdd |

### 2.2 Falsification questions

1. Can the last manifest rows flip to **fleet-migrated-client** without G3 receipts?
2. Can NB-4 select clients already migrated in NB-1..NB-3?
3. Can NB-4 proceed without accepted `od-nb4-acceptance.v1.json`?
4. Can orchestrator `close_out` substitute for `REQ-PSEUDOCODE_FLEET_NB4_TRANCHE_FINAL` verification?
5. Does G4 CI green imply Track B complete?

### 2.3 Risks

| ID | Risk | Mitigation |
|----|------|------------|
| RISK-NB4-REUSE | Reusing od-nb3 JSON without wave_4 fields | Separate schema `od-nb4-acceptance.v1`; IMPL `RECORD_NB4_ACCEPTANCE` |
| RISK-NB4-SELECTION | Selecting fleet-migrated IDs | `SELECT_NB4_WAVE_FOUR_CLIENTS` requires `header-only-v2` |
| RISK-NB4-ORCH | Reopen closed orchestrator REQ | `orchestrator_reverify: false` const |
| RISK-NB4-BURDEN | 6-sidecar repo underestimated | OD-NB4-3 documented; operator time in completion plan |
| RISK-NB4-TOOLING | `tied-win-diff` F11/tooling cost | Default exclude; OD-NB4-2 |
| RISK-NB4-SCRIPT | NB-3-only test drift | `fleet-nb4-orchestration.test.mjs` in build-plan |

### 2.4 Test strategy (for `/build-plan`)

| Layer | Scope | Pass criterion (sketch) |
|-------|--------|-------------------------|
| **Unit** | `od-nb4-acceptance` schema + policy | RED tests mirror IMPL `RECORD_NB4_ACCEPTANCE` POST |
| **Unit** | Wave-4 selection vs post-NB-3 manifest fixture | RED tests mirror IMPL `SELECT_NB4_WAVE_FOUR_CLIENTS` |
| **Unit** | Reject NB-1..NB-3 migrated IDs in override | `already_migrated` failure mode |
| **Composition** | `run-harness.sh fleet-g3-wave` | Dry-run in stdd |
| **Regression** | G4 CI + NB-1..NB-3 orchestration tests | Existing suites green |
| **E2E** | Not in stdd | Client repo migration verification |
| **Proof boundary** | stdd tests prove orchestration **inputs** | **fleet-migrated-client** proof in client repos |

**Build-plan script targets:** `scripts/fleet-nb4-orchestration.test.mjs`, `scripts/run-nb4-client-spawn.py`, `scripts/run-nb4-partition-append.py`, `scripts/run-nb4-manifest-rollup.py`, `scripts/run-nb4-client-closeout.mjs`, `scripts/run-nb4-wave-ops.mjs`.

### 2.5 Module boundaries

```
stdd (NB-4 build-plan)
├── Sponsor gate: od-nb4-acceptance.v1.json
├── Prerequisite: NB-3 machine close-out receipt in acceptance
├── Inventory read: client-inventory-manifest.v1.yaml
├── Local partition: working/fleet-constraint-v2/waves/ (gitignored)
└── G3 via run-harness.sh fleet-g3-wave

client repo (per wave-4 client)
├── REQ-PSEUDOCODE_MIGRATION_* (client-owned)
├── working/{REQ}/ checklist + receipts
└── Sidecar apply + tied_verify/close_out
```

### 2.6 Acceptance criteria — refine pass (WS-1)

| Criterion | Verification |
|-----------|--------------|
| NB-4 plan on disk | This file |
| Completion plan on disk | [`pseudocode-constraint-v2-fleet-completion-plan.md`](pseudocode-constraint-v2-fleet-completion-plan.md) |
| CITDP `nb4_tranche_final_module` populated | Fleet CITDP YAML |
| Tracker with batch REQ | NB-4-tranche-final checklist |
| od-nb4 schema + template committed | `working/fleet-constraint-v2/` |
| IMPL blocks `RECORD_NB4_ACCEPTANCE`, `SELECT_NB4_WAVE_FOUR_CLIENTS` | Sidecar + `pseudocode_validate` |
| TIED REQ Draft | `REQ-PSEUDOCODE_FLEET_NB4_TRANCHE_FINAL` |
| `pre_implementation` gate allowed | Receipt under `working/fleet-constraint-v2/NB-4/gates/` |

### 2.7 `/build-plan` entry checklist (after NB-4-A)

1. `working/fleet-constraint-v2/od-nb4-acceptance.v1.json` with `status: accepted`, `decided_at`, `sponsor_signoff`.
2. `prior_batch_complete.close_out_receipt_path` exists and matches NB-3 machine close-out.
3. Every `wave_4_client_id` is `not_enrolled_phase_4` and **header-only-v2**.
4. `orchestrator_reverify` is **false**.
5. `length(wave_4_client_ids) <= tranche_scope.max_clients` (≤ 5).
6. G4 CI last run green or re-run before manifest rollup.
7. Tracker advanced from `pre_implementation` only after gate re-validation.

---

## 3. Wave-4 client selection (recommended)

**Criteria:** `not_enrolled_phase_4`; **header-only-v2** only; sort by total active sidecars ascending; `methodology_pin: 48d1fbb+`; default exclude **`tied-win-diff`** unless OD-NB4-2.

**Source:** [`client-inventory-manifest.v1.yaml`](../working/fleet-constraint-v2/client-inventory-manifest.v1.yaml) post-NB-3.

| Priority | client_id | header-only sidecars | repository_root (operator) |
|----------|-----------|----------------------|----------------------------|
| 1 | `tied-win-diff` | 1 | `/Users/fareed/Documents/dev/test/tied-win-diff` |
| 2 | `1787691672` | 5 | `/Users/fareed/Documents/dev/test/1787691672` |
| 3 | `1787626480` | 6 | `/Users/fareed/Documents/dev/test/1787626480` |

**Default tranche if silent (OD-NB4-2 exclude tooling):** `1787691672`, `1787626480` (2 clients).

**Full tranche if OD-NB4-2 accepts tooling:** all three IDs (still ≤ 5).

**Minimum tranche:** Schema allows 1–5; sponsor may accept one client only (not recommended for Track B exit unless others deferred with documented waiver—program waivers need sponsor gate).

---

## 4. Executable steps

| Step | ID | Depends on | Blocked? | Action | Done when |
|------|-----|------------|----------|--------|-----------|
| G4 maintenance | M-G4 | — | **No** | G4 CI | Exit 0 |
| Refine NB-4 + CITDP + tracker | NB-4-R | NB-3 complete | **No** | WS-1 artifacts | §2.6 met |
| Sponsor NB-4 acceptance | NB-4-A | NB-4-R | **Yes** | Template → accepted JSON | Schema + IMPL POST ok |
| Orchestration RED/GREEN | NB-4-B | NB-4-A | **Yes** | `/build-plan` tests + scripts | Tests green |
| Client REQ spawn | NB-4-C | NB-4-A | **Yes** | Per client migration REQ | Client indexes |
| Client migration | NB-4-D | NB-4-C | **Yes** | Sidecar grading to enforced | Client verify green |
| Client close_out + receipts | NB-4-E | NB-4-D | **Yes** | Export to `waves/{id}/` | Receipt paths exist |
| G3 wave harness | NB-4-F | NB-4-A, NB-4-E | **Yes** | `fleet-g3-wave` | Harness validates |
| Manifest + dashboard + status | NB-4-G | NB-4-F | **Yes** | Rollup with receipts | 0 header-only not_enrolled |
| Batch machine close-out | NB-4-H | NB-4-G | **Yes** | Batch REQ verify | Receipt in `NB-4/gates/` |
| Track B program exit doc | NB-4-X | NB-4-H | **Yes** | Update program + completion plan | `next_batch: none` |

**Ordering:** NB-4-G must not run until every accepted wave-4 client has receipt evidence.

---

## 5. Implement gate

**Completed in refine pass (2026-09-13):**

- NB-4 plan document (this file) + completion plan cross-link
- CITDP `nb4_tranche_final_module` + pre-implementation slice [`NB-4-citdp-pre-implementation.v1.yaml`](../working/fleet-constraint-v2/NB-4-citdp-pre-implementation.v1.yaml)
- Tracker copies with `execution_evidence.request: REQ-PSEUDOCODE_FLEET_NB4_TRANCHE_FINAL`
- od-nb4 acceptance schema + template
- IMPL pseudo-code: `RECORD_NB4_ACCEPTANCE`, `SELECT_NB4_WAVE_FOUR_CLIENTS` (`pseudocode_validate` ok)
- TIED REQ `REQ-PSEUDOCODE_FLEET_NB4_TRANCHE_FINAL` (Draft)
- Pre-implementation gate receipt: `working/fleet-constraint-v2/NB-4/gates/pre_implementation-2026-09-13T21-43-07-918Z.json`

**Deferred to `/build-plan` (after NB-4-A):**

- RED tests for NB-4 acceptance and wave-4 selection (§2.4)
- Extend `fleet-nb1-orchestration.mjs` / `run-nb4-*` closeout runners
- G3 wave execution and manifest updates (NB-4-F..G)
- Client-repo TIED stacks (NB-4-C..E)

---

## 6. Recommended next command

| Situation | Command |
|-----------|---------|
| Specification only | Execute WS-1 in [`pseudocode-constraint-v2-fleet-completion-plan.md`](pseudocode-constraint-v2-fleet-completion-plan.md) |
| Sponsor signed acceptance | **`/build-plan`** — plan this doc, tracker, `od-nb4-acceptance.v1.json`, `REQ-PSEUDOCODE_FLEET_NB4_TRANCHE_FINAL`, prerequisite NB-3 close-out receipt |
| Sponsor declines Track B finish | **G4 maintenance** — honest manifest (3 header-only remain) |

**Suggested `/build-plan` link payload:** plan `docs/pseudocode-constraint-v2-fleet-nb4-plan.md`, completion `docs/pseudocode-constraint-v2-fleet-completion-plan.md`, acceptance `working/fleet-constraint-v2/od-nb4-acceptance.v1.json`, batch REQ `REQ-PSEUDOCODE_FLEET_NB4_TRANCHE_FINAL`, CITDP `nb4_tranche_final_module`, prerequisite `working/fleet-constraint-v2/NB-3/gates/machine-close-out-2026-09-13.json`.
