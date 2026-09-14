# Fleet constraint v2 — program (canonical)

**Purpose:** Methodology-side **policy and tooling** so every TIED **client** can reach **`fleet-migrated-client`** (grammar v2 + in-scope constraint gates). This repo holds **program** truth—not per-client migration history.

**Foundation:** [`pseudocode-grammar-v2-and-hygiene-plan.md`](pseudocode-grammar-v2-and-hygiene-plan.md) (Tracks A/C/B). **Grammar authoring:** [`tied/docs/pseudocode-grammar.v2.md`](../tied/docs/pseudocode-grammar.v2.md).

**TIED:** [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION](../tied/requirements/REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION.yaml) (orchestrator **closed**) · [REQ-PSEUDOCODE_FLEET_G4_MAINTENANCE](../tied/requirements/REQ-PSEUDOCODE_FLEET_G4_MAINTENANCE.yaml) (continuous ops) · [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT](../tied/requirements/REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT.yaml) (G4 bootstrap) · [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE](../tied/architecture-decisions/ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE.yaml) · vocab [`pseudocode-and-citdp.md`](../tied/vocab/pseudocode-and-citdp.md) § fleet constraint v2 migration.

---

## Sponsor default-proceed policy

**Principle (majority of planned development):** Agents and operators **proceed on documented plan defaults** without a sponsor clarification round when the choice stays **reversible or cheap to unwind** and aligns with prior batch decisions and this program doc. **Supporting documentation produced by the work**—batch plans (NB-*), acceptance JSON + schema, CITDP modules, trackers, gate receipts, orchestration tests, manifest snapshots, and client-repo migration evidence—is **sufficient to reconsider and reimplement** if a decision is later reversed (amend acceptance, withdraw batch, re-run `/build-plan`, LEAP as needed).

**When to proceed on defaults (fleet Track B):**

- Sponsor acceptance fields, `wave_*_client_ids`, burden tier within plan §3, exclude/include `tied-win-diff`, tranche size 1–5 within schema, stdd RED tests, G3 **dry-run**, and draft manifest review **before** NB-*-G rollup.

**When to stop and ask the sponsor (irreversible or costly):**

- Client-repo **migration apply + close_out** (NB-*-D..E) without accepted acceptance JSON.
- Manifest or dashboard **fleet-migrated-client** without matching G3 receipts (falsification below).
- **Reopen** closed orchestrator REQ (`orchestrator_reverify: true`) or **tranche > 5** without schema/program amend.
- **Program waivers** or constraint relaxations that outlive one batch ([`migration-waiver-registry.v1.yaml`](../working/fleet-constraint-v2/migration-waiver-registry.v1.yaml)).
- Non-default roster that pulls **1787626480** (6 sidecars) or **tied-win-diff** into a batch when plan §3 deferred them—higher F11/tooling cost; confirm before `/build-plan` execution.

**Standing intent:** Continuing Track B after NB-1/NB-2 close-out uses each batch plan’s **“Default if silent”** roster and exclusion rules unless the sponsor explicitly defers the whole tranche. Plan table rows that say “no work if silent” for batch authorization are superseded for **ongoing program execution** by this policy when prior acceptance established Track B continuation.

**Cross-reference:** [`tied/docs/ai-principles.md`](../tied/docs/ai-principles.md) § Sponsor default-proceed (planned development).

---

## Program status (rolling)

| Metric | Value | Source |
|--------|-------|--------|
| Enrolled + **fleet-migrated-client** | **5** (incl. stdd) | [`client-inventory-manifest.v1.yaml`](../working/fleet-constraint-v2/client-inventory-manifest.v1.yaml) |
| Not enrolled (Track B) | **18** — all **fleet-migrated-client** (NB-1..NB-4 + post-NB-4 **`tied-win-diff`**) | same |
| Gate stage (continuous) | **G4** | [`gate-promotion-stages.v1.yaml`](../working/fleet-constraint-v2/gate-promotion-stages.v1.yaml) |
| stdd orchestrator REQ | **Closed** — do not re-run close_out | TIED REQ status |

**Phases 1–5 (stdd methodology slice):** Policy, readiness, pilots, enrolled fleet waves, G4 CI/bootstrap, and FEAT envelope policy are **done** (`phase_5_program_exit: true`, gate **G4**). Narrative phase plans were **removed from the tree**; use git history if needed.

**Track B (not enrolled):** **18/18** **fleet-migrated-client** as of 2026-09-13 (including **`tied-win-diff`** migrated post-NB-4 on sponsor request; wave `W-ext-tied-win-diff-1`). G4 CI validates stdd bootstrap and enrolled regression; per-client proof remains G3 receipts + client `working/REQ-PSEUDOCODE_MIGRATION/gates/`.

**NB-1 (tranche zero):** **Complete** (2026-09-13) — five wave-1 clients; machine close-out [`REQ-PSEUDOCODE_FLEET_NB1_TRANCHE_ZERO`](../tied/requirements/REQ-PSEUDOCODE_FLEET_NB1_TRANCHE_ZERO.yaml). Plan: [`pseudocode-constraint-v2-fleet-nb1-plan.md`](pseudocode-constraint-v2-fleet-nb1-plan.md).

**Next batch — NB-4 (Track B final tranche):** Complete — see **Completed batch — NB-4** below.

---

## Migration states (per client)

| State | Meaning |
|-------|---------|
| **legacy-v1** | No `Grammar-Version: v2` |
| **header-only-v2** | v2 header; minimal contracts |
| **constraint-ready-v2** | Layer B + Tier-3 per profile; `typed_flow` advisory |
| **constraint-enforced-v2** | + `constraint_flow` / gate errors on annotated procedures |
| **fleet-migrated-client** | All active sidecars enforced or **waiver**; client evidence complete |

**Proof:** `grammar_v2_header` ≠ fleet-migrated. G4 CI green ≠ all clients migrated.

---

## Where evidence lives

| Kind | Location |
|------|----------|
| Inventory, gates, waivers (program) | `working/fleet-constraint-v2/` — **schemas + manifest + dashboard + gate yaml only** (see `.gitignore`) |
| Client migration work | **Client repo** `working/{REQ}/` — not stdd |
| Program status snapshot | [`program-status.v1.yaml`](../working/fleet-constraint-v2/program-status.v1.yaml) |

---

## Continuous maintenance (always)

**Primary:** [G4 maintenance runbook](pseudocode-constraint-v2-fleet-g4-maintenance-runbook.md) · [REQ-PSEUDOCODE_FLEET_G4_MAINTENANCE](../tied/requirements/REQ-PSEUDOCODE_FLEET_G4_MAINTENANCE.yaml)

```bash
node scripts/run-fleet-g4-maintenance.mjs
```

Check-only (skip bundled unit tests):

```bash
node scripts/run-fleet-g4-maintenance.mjs --skip-tests
```

Low-level G4 report (no program-status refresh):

```bash
node scripts/run-fleet-g4-ci-checks.mjs
node --test scripts/fleet-g4-ci-checks.test.mjs scripts/fleet-g4-maintenance.test.mjs scripts/validate-feat-spawned-envelope-policy.test.mjs
working/PSEUDOCODE-CONSTRAINT-STUDY/qualification/scripts/run-harness.sh fleet-g4-ci
```

On success, updates [`program-status.v1.yaml`](../working/fleet-constraint-v2/program-status.v1.yaml) `last_g4_ci_*` and writes [`g4-maintenance/last-run.v1.json`](../working/fleet-constraint-v2/g4-maintenance/last-run.v1.json).

## New TIED clients (post–Track B)

**Primary:** [New client adherence runbook](pseudocode-new-client-tied-adherence-runbook.md) · [REQ-TIED_NEW_CLIENT_ADHERENCE](../tied/requirements/REQ-TIED_NEW_CLIENT_ADHERENCE.yaml) · [Program plan](pseudocode-new-client-tied-adherence-plan.md)

After `copy_files.sh` on a **new** client repo:

```bash
node scripts/run-tied-new-client-audit.mjs --client-root /path/to/client --json-out /path/to/client/working/tied-new-client-audit.v1.json
```

Disposable smoke (methodology repo): `node scripts/run-tied-new-client-audit.mjs --disposable`. **Onboarding-adherent** ≠ **fleet-migrated-client** (G3 receipts still required for manifest enrollment).

Checks: bootstrap enforcement, stale waivers, **enrolled_track_regression** (5 repos stay fleet-migrated). **Does not** re-prove full Track B manifest.

---

## Completed batch — NB-2 (Track B tranche one)

**Plan:** [`pseudocode-constraint-v2-fleet-nb2-plan.md`](pseudocode-constraint-v2-fleet-nb2-plan.md) · **Status:** complete (five wave-2 clients **fleet-migrated-client**; batch close-out `REQ-PSEUDOCODE_FLEET_NB2_TRANCHE_ONE`).

**Wave-2 executed (2026-09-13):** `1786637885`, `1786643714`, `1788547701`, `1787421852`, `1787461685` — G3 receipts under `working/fleet-constraint-v2/waves/{client_id}/receipts/`.

**Remaining Track B after NB-2:** **8** `header-only-v2` / `not_enrolled_phase_4` rows — **NB-3** then **NB-4**.

## Completed batch — NB-3 (Track B tranche two)

**Plan:** [`pseudocode-constraint-v2-fleet-nb3-plan.md`](pseudocode-constraint-v2-fleet-nb3-plan.md) · **Status:** complete (five wave-3 clients **fleet-migrated-client**; batch close-out `REQ-PSEUDOCODE_FLEET_NB3_TRANCHE_TWO`).

**Wave-3 executed (2026-09-13):** `1787495576`, `1787603099`, `1787416567`, `1787507684`, `1787638699` — G3 receipts under `working/fleet-constraint-v2/waves/{client_id}/receipts/`.

**Remaining Track B:** **3** `header-only-v2` / `not_enrolled_phase_4` rows (`1787626480`, `1787691672`, `tied-win-diff`) — **NB-4**.

## Completed batch — NB-4 (Track B final tranche)

**Plans:** [`pseudocode-constraint-v2-fleet-completion-plan.md`](pseudocode-constraint-v2-fleet-completion-plan.md) · [`pseudocode-constraint-v2-fleet-nb4-plan.md`](pseudocode-constraint-v2-fleet-nb4-plan.md) · **Status:** complete (2026-09-13) — wave-4 clients **fleet-migrated-client**; batch close-out `REQ-PSEUDOCODE_FLEET_NB4_TRANCHE_FINAL`.

**Wave-4 executed:** `1787691672`, `1787626480` — G3 receipts under `working/fleet-constraint-v2/waves/{client_id}/receipts/`.

**Post-NB-4 tooling row:** **`tied-win-diff`** — wave `W-ext-tied-win-diff-1`, G3 on `IMPL-TIED_FILES`, manifest **fleet-migrated-client**, client close-out gates under `working/REQ-PSEUDOCODE_MIGRATION/gates/` (sponsor request; outside OD-NB4-2 accepted roster).

**Track B:** **18/18** not_enrolled **fleet-migrated-client**.

**Maintenance:** G4 CI (`node scripts/run-fleet-g4-ci-checks.mjs`).

## Post-NB-4 — tied-win-diff (tooling row)

**Not critical for TIED development:** This clone is fleet **inventory / qualification coverage only**. stdd methodology, MCP, and analyzer work do **not** depend on tied-win-diff pseudo-code fidelity. Do not treat its sidecar as canonical `IMPL-TIED_FILES` essence.

**Fleet tied-win-diff bypass** (see [`pseudocode-and-citdp.md`](../tied/vocab/pseudocode-and-citdp.md) § tied-win-diff qualification client):

- Default excluded from NB-2..NB-4 batches; post-NB-4 one-off wave without orchestrator reopen.
- G3 uses a **v2 stub** sidecar; full pre-fleet body archived in the client repo only.
- Client close-out skips project-wide `tied_validate_consistency` (tooling-scope proof only).
- Not part of G4 **enrolled_track_regression** (five enrolled repos).

**Status:** **Complete** (2026-09-13) for fleet manifest purposes. No follow-up LEAP unless sponsor explicitly scopes tied-win-diff product work.

**Maintenance:** G4 CI (`node scripts/run-fleet-g4-ci-checks.mjs`) — unchanged; bypass does not add enrolled regression obligations.

## Completed batch — NB-1 (Track B tranche zero)

**Plan:** [`pseudocode-constraint-v2-fleet-nb1-plan.md`](pseudocode-constraint-v2-fleet-nb1-plan.md) · **Status:** complete (five wave-1 clients fleet-migrated-client).

**Wave mechanics:** Partition under `working/fleet-constraint-v2/waves/` (**local/ephemeral**, gitignored). Client migration evidence stays in **client repos**.

**v1 parser:** Removal deferred (OD-P5-1); quarantine policy in TIED ARCH/REQ notes.

---

## Document policy (stdd)

- **Keep:** This file, hygiene plan, pre-cohort grammar test runbook, TIED REQ/ARCH/IMPL/CITDP.
- **Removed:** Per-phase fleet plans, closeout ledgers, seq/exit JSON narratives, per-client migration stubs under `working/REQ-PSEUDOCODE_MIGRATION_*`.
- **Regenerate locally:** Wave receipts, dry-run snapshots, gate replay JSON, MCP args dumps.

---

## Falsification (program)

- Dashboard shows **fleet-migrated-client** for `not_enrolled_phase_4` rows without wave evidence → **invalid**.
- Claim **Track B complete** while any not_enrolled row lacks G3 receipt + client migration gates → **invalid**.
- stdd `working/` accumulates client migration archives → **avoid**; store in client clones.
