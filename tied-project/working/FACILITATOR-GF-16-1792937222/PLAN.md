# PLAN — Facilitator trial readout (PROMPT-GF-16 → client `1792937222`)

**Prompt type:** refine-plan (pass 1 complete 2026-10-25)  
**Linked Cursor plan:** `record_gf-16_trial_61a50949.plan.md`  
**Skill contract:** [`@record-gf-trial`](../../../tools/bundled-record-gf-trial-skill/SKILL.md)  
**Subject client:** `/Users/fareed/Documents/dev/test/1792937222-gf-16`  
**Subject REQ (client only):** `REQ-RECONCILIATION_ENGINE`  
**Store deliverable:** [docs/demos/trial-readout-PROMPT-GF-16-1792937222.md](../../../docs/demos/trial-readout-PROMPT-GF-16-1792937222.md) *(build-plan complete 2026-10-25)*  
**CITDP (working):** [CITDP-FACILITATOR-GF-16-1792937222.yaml](./CITDP-FACILITATOR-GF-16-1792937222.yaml) — **skip persist** to `tied-project/citdp/`

This PLAN governs **documentation-only** work in the TIED store. It does **not** mint store `[REQ-*]` tokens or mutate the disposable client unless the sponsor later scopes repair.

---

## 1. Refine (Touchpoint 1 — RESOLVE)

**Stripped sponsor intent:** Grade and record performance of the as-built TIED **4.0.0** greenfield demo at `1792937222` relative to other GF benchmarks; publish facilitator trial readout via **`@record-gf-trial`**.

| Catalog | Value |
| --- | --- |
| Trial prompt | [PROMPT-GF-16](../../../docs/demos/catalog-greenfield-plan-new-feature-prompts.md#prompt-gf-16) |
| TIED demo | **TIED-DEMO-16** — reconciliation engine |
| Exercise bridge | **STATE-06** (desired vs observed; partial corrective actions) |
| Proof boundary (primary) | **`executable_behavior`** — Vitest on observe→diff→apply loop |
| Proof boundary (secondary) | **`traceability_structure`** — client R+A+I, CITDP, gates |
| Facilitator proof boundary | **`facilitator_session_reconstruction`** — paths, SHAs, command names; not chat transcripts |
| Touchpoint | **`@plan-new-feature`** / **`@build-plan`** on client linked plan (PROMPT-GF-16 header in client PLAN); record honestly in readout metadata |

### RESOLVE (subject client)

PRELOAD: [feedback-to-tied.md](../../vocab/feedback-to-tied.md), [quality-assurance.md](../../vocab/quality-assurance.md), [project-operations-mcp.md](../../vocab/project-operations-mcp.md) (`record-gf-trial` skill).

| Sponsor / prompt term | Resolved concept | Where recorded |
| --- | --- | --- |
| desired state vs observed state | `Map<resourceId, KV attributes>`; observed via `observe()` each iteration | client PLAN §1; `engine.ts` |
| corrective actions may fail or partially succeed | `ApplyResult` success / failed / partial with `applied` subset | client PLAN; tests |
| loop until converged or documented stop | `stopReason`: converged, max_iterations, stall | `runUntilStop()` |
| superseding desired state | `desiredGeneration` bump on `setDesired`; stale apply results ignored | client PLAN; integration tests |
| partial failures | Failed apply leaves drift; partial merges then re-observe | STATE-06 harness |
| tests include partial failures and superseding | Named Vitest cases in `reconciliation-engine.test.ts` | client PLAN §2.6 |

**Store cross-links:**

- **`record-gf-trial`** skill shipped: [PLAN-RECORD-GF-TRIAL-SKILL](../PLAN-RECORD-GF-TRIAL-SKILL/PLAN.md) (bootstrap complete).
- Subject handoff: `.../REQ-RECONCILIATION_ENGINE/evidence/close-out-handoff.md` (commit `60a9fc8`).

### Depth and policy (two layers)

| Layer | `depth_tier` | `gate_policy` | Notes |
| --- | --- | --- | --- |
| **Subject build** (`REQ-RECONCILIATION_ENGINE`) | **minimal** | **advisory** | In-memory reconcile; adversarial inquiry **N/A** per client CITDP |
| **This facilitator publish session** | **minimal** | **advisory** | Store markdown + catalog links only |

### Costly choices (consequence ladder)

| Choice | Rung | Disposition |
| --- | --- | --- |
| Treat single trial as methodology effectiveness evidence | 3+ | **Costly misread** — future-test rule in readout |
| Repair subject client tracker `close_out_evidence` during readout | 2 | **Reversible** — **out of scope** unless sponsor asks |
| Collapse six dimensions to one score | 3+ | **Forbidden** per catalog grading |
| Publish readout + catalog rows | 1 | **Locked** for `@build-plan` |
| stdd traceable-commit | 2 | **Sponsor-only** at close-out |
| Store MCP writes while **`TIED_BASE_PATH`** points at client tree | 3+ | **Costly** — confirm store base before any ingest |

### Refine gate (this session)

**`pre_implementation` (facilitator publish):** Run `tied_checklist_gate_validate` after Tracker/CITDP paths exist; if blocked for docs-only waiver, record in [evidence/refine-plan-pass1.md](./evidence/refine-plan-pass1.md) (GF-04 / GF-14 precedent).

**Subject client gates:** **Observed only** during refine — do not re-run close_out.

---

## 2. Plan (CITDP — facilitator publish)

### 2.1 Change definition

| | |
| --- | --- |
| **Current** | PROMPT-GF-16 mapped in client PLAN; **no** store trial readout; TIED-DEMO-16 catalog notes partial-success/convergence doc only |
| **Desired** | GF-15-quality readout + README + greenfield **Recorded trials** row; first **built instance** note for TIED-DEMO-16 |
| **Non-goals** | Client repair; new store REQ tokens; cohort leaderboard; feedback upstream (no client `feedback.yaml`) |
| **Success criteria** | Section contract §2.4; facilitator verification §2.3 captured; grading revised post-verify |

### 2.2 Impact

| Boundary | Paths |
| --- | --- |
| **New** | `docs/demos/trial-readout-PROMPT-GF-16-1792937222.md` |
| **Edit** | `docs/demos/README.md`, `docs/demos/catalog-greenfield-plan-new-feature-prompts.md`, `CHANGELOG.md` Unreleased |
| **Working** | `tied-project/working/FACILITATOR-GF-16-1792937222/evidence/*` |
| **Read-only inspect** | Client root, `tied-project/working/REQ-RECONCILIATION_ENGINE/**`, client TIED indexes |

### 2.3 Facilitator verification (before drafting readout bands)

Environment (client-scoped):

```bash
export TIED_BASE_PATH="/Users/fareed/Documents/dev/test/1792937222-gf-16/tied-project"
export TIED_METHODOLOGY_BUNDLE_PATH="/Users/fareed/Documents/dev/test/1792937222-gf-16/tied-bundle"
export TIED_STORE_ROOT="/Users/fareed/Documents/dev/chatgpt/stdd"
```

| Command | Purpose | Capture to |
| --- | --- | --- |
| `git log -1 --format=%H` (client root) | HEAD pin | readout metadata + [build-plan-verification-evidence.md](./evidence/build-plan-verification-evidence.md) |
| `npm test` | Executable behavior | stdout artifact |
| `npm run lint:ts` | Typecheck | stdout/stderr artifact |
| `.cursor/skills/tied-yaml/scripts/tied-cli.sh tied_validate_consistency` | Traceability | full JSON file (anti-truncation) |
| Optional: `tied_project_lint` | Aggregated lint | JSON summary |

**Git pins (verify at build-plan):** bootstrap `d6e4ef8` (TIED 4.0.0), feature + close-out `60a9fc8`; **HEAD** expected `60a9fc85ffeddb7cb7c8389faa5218b9bd914dea` unless sponsor rebases.

**Subject completion signals to inspect (three-way — do not collapse):**

| Signal | Inspect |
| --- | --- |
| Machine close_out | Latest `close_out-*.json` → `allowed: true` |
| Process contract | Tracker `execution_evidence.close_out_evidence` still **template-empty** (`date: null`) despite traceable commit — see [traceable-commit-evidence.md](file:///Users/fareed/Documents/dev/test/1792937222-gf-16/tied-project/working/REQ-RECONCILIATION_ENGINE/evidence/traceable-commit-evidence.md) |
| Adherence ledger | **Populated** — `gate_decided` + `tied_verify` status mutations in client `adherence-ledger.jsonl` (contrast GF-11 hollow ledger) |

**Field observation (traceability / process, not methodology failure):** Initial TIED YAML writes targeted wrong `TIED_BASE_PATH`; repair documented in client traceable-commit evidence.

### 2.4 Readout document contract (mirror [GF-15](../../../docs/demos/trial-readout-PROMPT-GF-15-1792863463.md) / [GF-04 §2.4](../FACILITATOR-GF-04-1792857852/PLAN.md))

1. Metadata table (recorded date, touchpoint **`@record-gf-trial`**, catalog map, client root, HEAD, outcome headline).
2. Sponsor intent (verbatim PROMPT-GF-16 block).
3. RESOLVE table (subject client).
4. **What was built** — `ReconciliationEngine`, diff/fingerprint modules, **11** Vitest tests, TIED stack paths, disturbance **L0/L2** (unit diff + integration loop).
5. **Outcome record** — implementation vs dimensioned grading summary line.
6. **Completion signals** table (§2.3 three-way).
7. **TIED db capture** (client paths); note absent `feedback.yaml`.
8. **Session grading vs catalog** — six dimensions + rationale.
9. **Cohort comparisons** — GF-15 (algorithm-primary sibling), GF-14 (gate trail), GF-04 (Family readout pattern), GF-11 (process hollow contrast); **first recorded PROMPT-GF-16**.
10. **TIED 4.0.0 / Wave 5 dogfood** — optional paragraph on wrong-base-path close-out lesson (not effectiveness claim).
11. **Facilitator follow-ups** — open vs done.
12. **Future-test rule**.

### 2.5 Preliminary grading hypotheses (revise after §2.3 re-verify)

| Dimension | Band (draft) | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Partial success, superseding desired, stop reasons, prune orphans locked in client PLAN |
| Traceability closure | **A−** | Full R+A+I + CITDP + vocab; minus for wrong-base-path episode (repaired) |
| Test strategy | **A−** | 11 Vitest cases on STATE-06 axes; no L4+ combined fault harness |
| Algorithm / implementation | **A** | One-action-per-iteration loop, generation stamp, fingerprint stall |
| Process adherence | **B+** | Machine close_out + populated adherence ledger + traceable commit; gap: tracker `close_out_evidence` not backfilled |
| Methodology learning readout | **B− (partial)** | No `feedback.yaml`; grade handoff/evidence observation quality only — not Loop 3 effectiveness |

### 2.6 Plan gate

Proceed to **Implement (`@build-plan`)** when §2.3 verification outputs are captured and §2.5 bands are revised against evidence.

---

## 3. Implement boundary

**Completed (build-plan 2026-10-25):**

| Phase | Action | Evidence |
| --- | --- | --- |
| 1 | Re-verify client (§2.3) | [evidence/build-plan-verification-evidence.md](./evidence/build-plan-verification-evidence.md) |
| 2 | Author trial readout (§2.4) | [docs/demos/trial-readout-PROMPT-GF-16-1792937222.md](../../../docs/demos/trial-readout-PROMPT-GF-16-1792937222.md) |
| 3 | Link catalogs (§2.2) | `docs/demos/README.md`, `catalog-greenfield-plan-new-feature-prompts.md` |
| 4 | CHANGELOG | [CHANGELOG.md](../../../CHANGELOG.md) Unreleased Added row |

**Close-out (facilitator session):** **complete** — traceable-commit **`baa1aa95`** (2026-10-25).

**Completion signals (this session):**

| Signal | Status |
| --- | --- |
| Machine deliverable | **pass** — readout + catalog links + CHANGELOG |
| Process contract | **pass** — PLAN phases 1–4 executed |
| Adherence ledger | **N/A** — minimal depth; no client mutation |

---

## Related

- Client PLAN: `/Users/fareed/Documents/dev/test/1792937222-gf-16/tied-project/working/REQ-RECONCILIATION_ENGINE/PLAN.md`
- Refine evidence: [evidence/refine-plan-pass1.md](./evidence/refine-plan-pass1.md)
- Tracker: [checklist-tracker.yaml](./checklist-tracker.yaml)
