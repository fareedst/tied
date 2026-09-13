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

**Phases 1–5 (stdd):** Policy, readiness, pilots, enrolled fleet waves, and G4 CI/bootstrap are **done**. Narrative phase plans were **removed from the tree**; use git history if needed.

**Not done:** Track B (**18** clients). Requires sponsor **OD-P5-2** then batch **NB-1** below.

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

**Blocked until** `working/fleet-constraint-v2/od-p5-2-acceptance.v1.json` (sponsor: tranche scope, wave-1 clients, CITDP home, no orchestrator re-verify).

| Step | Action |
|------|--------|
| NB-1-A | OD-P5-2 acceptance JSON |
| NB-1-B | Optional short 5b plan **only if** tranche is large; else execute from this section |
| NB-1-C..E | Pick 3–5 low sidecar-count clients from manifest; client-owned REQ + checklist in **client repo** |
| NB-1-F | G3 wave via `run-harness.sh fleet-g3-wave` (harness + qualification scripts; phase-4 plan was in git history pre-2026-09-13 doc prune) |
| NB-1-G | Update manifest + dashboard; refresh `program-status.v1.yaml` |

**Wave mechanics:** Reuse G3 tools from qualification harness; partition lists under `working/fleet-constraint-v2/waves/` (**local/ephemeral**, gitignored).

**v1 parser:** Removal deferred (OD-P5-1); quarantine policy text lives in TIED ARCH/REQ notes—not a standalone doc tree.

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
