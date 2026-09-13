# Fleet constraint v2 — program (canonical)

**Purpose:** Methodology-side **policy and tooling** so every TIED **client** can reach **`fleet-migrated-client`** (grammar v2 + in-scope constraint gates). This repo holds **program** truth—not per-client migration history.

**Foundation:** [`pseudocode-grammar-v2-and-hygiene-plan.md`](pseudocode-grammar-v2-and-hygiene-plan.md) (Tracks A/C/B). **Grammar authoring:** [`tied/docs/pseudocode-grammar.v2.md`](../tied/docs/pseudocode-grammar.v2.md).

**TIED:** [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION](../tied/requirements/REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION.yaml) (orchestrator **closed**) · [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT](../tied/requirements/REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT.yaml) (G4 bootstrap) · [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE](../tied/architecture-decisions/ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE.yaml) · vocab [`pseudocode-and-citdp.md`](../tied/vocab/pseudocode-and-citdp.md) § fleet constraint v2 migration.

---

## Program status (rolling)

| Metric | Value | Source |
|--------|-------|--------|
| Enrolled + **fleet-migrated-client** | **5** (incl. stdd) | [`client-inventory-manifest.v1.yaml`](../working/fleet-constraint-v2/client-inventory-manifest.v1.yaml) |
| Not enrolled (Track B) | **18** (5 fleet-migrated after NB-1; **13** header-only remain) | same |
| Gate stage (continuous) | **G4** | [`gate-promotion-stages.v1.yaml`](../working/fleet-constraint-v2/gate-promotion-stages.v1.yaml) |
| stdd orchestrator REQ | **Closed** — do not re-run close_out | TIED REQ status |

**Phases 1–5 (stdd methodology slice):** Policy, readiness, pilots, enrolled fleet waves, G4 CI/bootstrap, and FEAT envelope policy are **done** (`phase_5_program_exit: true`, gate **G4**). Narrative phase plans were **removed from the tree**; use git history if needed.

**Phase 5 complete ≠ fleet complete:** **13** manifest rows remain `not_enrolled_phase_4` / **header-only-v2** after NB-1 (five additional not_enrolled rows are **fleet-migrated-client**). G4 CI does **not** prove Track B complete.

**NB-1 (tranche zero):** **Complete** (2026-09-13) — five wave-1 clients; machine close-out [`REQ-PSEUDOCODE_FLEET_NB1_TRANCHE_ZERO`](../tied/requirements/REQ-PSEUDOCODE_FLEET_NB1_TRANCHE_ZERO.yaml). Plan: [`pseudocode-constraint-v2-fleet-nb1-plan.md`](pseudocode-constraint-v2-fleet-nb1-plan.md).

**Not done:** Track B tranche **NB-2** — blocked on sponsor [`od-nb2-acceptance.v1.json`](../working/fleet-constraint-v2/od-nb2-acceptance.v1.json) (template + schema in `working/fleet-constraint-v2/`). Executable detail: [`pseudocode-constraint-v2-fleet-nb2-plan.md`](pseudocode-constraint-v2-fleet-nb2-plan.md).

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

```bash
node scripts/run-fleet-g4-ci-checks.mjs
node --test scripts/fleet-g4-ci-checks.test.mjs scripts/validate-feat-spawned-envelope-policy.test.mjs
working/PSEUDOCODE-CONSTRAINT-STUDY/qualification/scripts/run-harness.sh fleet-g4-ci
```

Checks: bootstrap enforcement, stale waivers, **enrolled_track_regression** (5 repos stay fleet-migrated).

---

## Completed batch — NB-2 (Track B tranche one)

**Plan:** [`pseudocode-constraint-v2-fleet-nb2-plan.md`](pseudocode-constraint-v2-fleet-nb2-plan.md) · **Status:** complete (five wave-2 clients **fleet-migrated-client**; batch close-out `REQ-PSEUDOCODE_FLEET_NB2_TRANCHE_ONE`).

**Wave-2 executed (2026-09-13):** `1786637885`, `1786643714`, `1788547701`, `1787421852`, `1787461685` — G3 receipts under `working/fleet-constraint-v2/waves/{client_id}/receipts/`.

**Remaining Track B:** ~8 `header-only-v2` / `not_enrolled_phase_4` rows (NB-3+).

## Next batch — NB-3+

Blocked on sponsor plan and acceptance for the third Track B tranche. Maintenance: G4 CI (`node scripts/run-fleet-g4-ci-checks.mjs`).

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
- “Phase 5 complete” read as “all clients migrated” → **invalid** (13 header-only Track B remain after NB-1).
- stdd `working/` accumulates client migration archives → **avoid**; store in client clones.
