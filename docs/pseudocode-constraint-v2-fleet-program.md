# Fleet constraint v2 — program (canonical)

**Purpose:** Methodology-side **policy and tooling** so every TIED **client** can reach **`fleet-migrated-client`** (grammar v2 + in-scope constraint gates). This repo holds **program** truth—not per-client migration history.

**Foundation:** [`pseudocode-grammar-v2-and-hygiene-plan.md`](pseudocode-grammar-v2-and-hygiene-plan.md) (Tracks A/C/B). **Grammar authoring:** [`tied/docs/pseudocode-grammar.v2.md`](../tied/docs/pseudocode-grammar.v2.md).

**TIED:** [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION](../tied/requirements/REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION.yaml) (orchestrator **closed**) · [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT](../tied/requirements/REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT.yaml) (G4 bootstrap) · [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE](../tied/architecture-decisions/ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE.yaml) · vocab [`pseudocode-and-citdp.md`](../tied/vocab/pseudocode-and-citdp.md) § fleet constraint v2 migration.

---

## Program status (rolling)

| Metric | Value | Source |
|--------|-------|--------|
| Enrolled + **fleet-migrated-client** | **5** (incl. stdd) | [`client-inventory-manifest.v1.yaml`](../working/fleet-constraint-v2/client-inventory-manifest.v1.yaml) |
| Not enrolled (Track B) | **18** | same |
| Gate stage (continuous) | **G4** | [`gate-promotion-stages.v1.yaml`](../working/fleet-constraint-v2/gate-promotion-stages.v1.yaml) |
| stdd orchestrator REQ | **Closed** — do not re-run close_out | TIED REQ status |

**Phases 1–5 (stdd methodology slice):** Policy, readiness, pilots, enrolled fleet waves, G4 CI/bootstrap, and FEAT envelope policy are **done** (`phase_5_program_exit: true`, gate **G4**). Narrative phase plans were **removed from the tree**; use git history if needed.

**Phase 5 complete ≠ fleet complete:** **18** manifest rows remain `not_enrolled_phase_4` / **header-only-v2**. G4 CI does **not** prove Track B migrated.

**Not done:** Track B tranche **NB-1** — blocked on sponsor [`od-p5-2-acceptance.v1.json`](../working/fleet-constraint-v2/od-p5-2-acceptance.v1.json) (template + schema in `working/fleet-constraint-v2/`). Executable detail: [`pseudocode-constraint-v2-fleet-nb1-plan.md`](pseudocode-constraint-v2-fleet-nb1-plan.md).

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

## Next batch — NB-1 (Track B tranche zero)

**Plan:** [`pseudocode-constraint-v2-fleet-nb1-plan.md`](pseudocode-constraint-v2-fleet-nb1-plan.md) · **Tracker:** `working/fleet-constraint-v2/NB-1-tranche-zero-agent-req-implementation-checklist.yaml`

**Blocked until** sponsor **`od-p5-2-acceptance.v1.json`** (`status: accepted`) — schema `od-p5-2-acceptance.v1.schema.json`, draft from `od-p5-2-acceptance.v1.template.json`.

| Step | Blocked | Action |
|------|---------|--------|
| NB-1-A | Yes | Sponsor signs OD-P5-2 acceptance (wave-1 client IDs, `orchestrator_reverify: false`) |
| NB-1-B | Yes | Optional Phase 5b doc only if tranche > 5 clients |
| NB-1-C..E | Yes | Client-owned `REQ-PSEUDOCODE_MIGRATION_*` + checklist per wave-1 client |
| NB-1-F | Yes | `/build-plan` → G3 via `run-harness.sh fleet-g3-wave` |
| NB-1-G | Yes | Manifest + dashboard + `program-status.v1.yaml` after receipts |

**Wave-1 recommendation (5 × 1 sidecar, not_enrolled):** `1786636023`, `1786637086`, `1786666674`, `1787503424`, `1789087315` — see NB-1 plan for alternates.

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
- “Phase 5 complete” read as “all clients migrated” → **invalid** (18 remain).
- stdd `working/` accumulates client migration archives → **avoid**; store in client clones.
