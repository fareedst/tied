# PLAN — Facilitator trial readout (PROMPT-GF-04 → client `1792857852`)

**Prompt type:** refine-plan (pass 1 complete 2026-10-24)  
**Linked Cursor plan:** `gf-04_trial_readout_97ccc29c.plan.md`  
**Subject client:** `/Users/fareed/Documents/dev/test/1792857852`  
**Subject REQ (client only):** `REQ-GLOSSARY_RENAME_CHECK`  
**Store deliverable:** [docs/demos/trial-readout-PROMPT-GF-04-1792857852.md](../../../docs/demos/trial-readout-PROMPT-GF-04-1792857852.md) *(build-plan complete 2026-10-24)*  
**CITDP (working):** [CITDP-FACILITATOR-GF-04-1792857852.yaml](./CITDP-FACILITATOR-GF-04-1792857852.yaml) — **skip persist** to `tied-project/citdp/`

This PLAN governs **documentation-only** work in the TIED store. It does **not** mint store `[REQ-*]` tokens or mutate the disposable client unless the sponsor later scopes repair.

---

## 1. Refine (Touchpoint 1 — RESOLVE)

**Stripped sponsor intent:** Grade and record performance of the as-built TIED **4.0.0** greenfield demo at `1792857852` relative to other GF benchmarks; publish facilitator trial readout.

| Catalog | Value |
| --- | --- |
| Trial prompt | [PROMPT-GF-04](../../../docs/demos/catalog-greenfield-plan-new-feature-prompts.md#prompt-gf-04) |
| TIED demo | **TIED-DEMO-04** — vocabulary rename consistency checker |
| Exercise bridge | **L1 rename drift** (Family A; no exercise-catalog bridge ID) |
| Proof boundary (primary) | **`traceability_structure`** — `[PROC-VOCABULARY_INDEX]` VALIDATE subset, R+A+I, vocab |
| Proof boundary (secondary) | **`executable_behavior`** — Vitest on `fixtures/glossary-rename/` only |
| Facilitator proof boundary | **`facilitator_session_reconstruction`** — paths, SHAs, command names; not chat transcripts |
| Touchpoint | **`@add-feature`** / linked plan flow (client PLAN header); **not** `/xlate` — record honestly in readout metadata |

### RESOLVE (subject client)

PRELOAD: [feedback-to-tied.md](../../vocab/feedback-to-tied.md), [quality-assurance.md](../../vocab/quality-assurance.md) (grading lens, completion signals, proof boundaries).

| Sponsor / prompt term | Resolved concept | Where recorded |
| --- | --- | --- |
| markdown glossary files | `*.md` under `--root`; skip index files when `--exclude-index` | client PLAN; `scanGlossaryFiles.ts` |
| simulated bulk rename | In-memory whole-file word-boundary replace; **no disk write** | `applyRename.ts`; PLAN refine table |
| preferred-term inconsistencies | Four **finding** codes after rename simulation | `analyzeConsistency.ts`; fixtures |
| fixture tree | `fixtures/glossary-rename/`; tests **only** this root | Vitest config; PROMPT-GF-04 constraint |
| human-readable report | stdout sections + exit 0/1 | `formatReport.ts`; README |

**Store cross-links (do not re-ingest):**

- Wave 5 field feedback already upstream: [PLAN-CLOSE-OUT-W5-FIELD-FEEDBACK](../PLAN-CLOSE-OUT-W5-FIELD-FEEDBACK/PLAN.md) (`fb-mvmlz1rk-tavn9z` → store `fb-mvmmb3lp-723euw`).
- Subject handoff: `.../REQ-GLOSSARY_RENAME_CHECK/evidence/close-out-handoff.md`.

### Depth and policy (two layers)

| Layer | `depth_tier` | `gate_policy` | Notes |
| --- | --- | --- | --- |
| **Subject build** (`REQ-GLOSSARY_RENAME_CHECK`) | **minimal** | **advisory** | Local FS read; adversarial inquiry **N/A** per client CITDP |
| **This facilitator publish session** | **minimal** | **advisory** | Store markdown + catalog links only |

### Costly choices (consequence ladder)

| Choice | Rung | Disposition |
| --- | --- | --- |
| Treat single trial as methodology effectiveness evidence | 3+ | **Costly misread** — future-test rule in readout |
| Repair subject client tracker / `tied_adherence_reconcile_run` during readout | 2 | **Reversible** — **out of scope** unless sponsor asks |
| Collapse six dimensions to one score | 3+ | **Forbidden** per catalog grading |
| Publish readout + catalog rows | 1 | **Locked** for `@build-plan` |
| stdd traceable-commit | 2 | **Sponsor-only** at close-out |

### Refine gate (this session)

**`pre_implementation` (facilitator publish):** Run `tied_gate_check` with `request_token: FACILITATOR-GF-04-1792857852` after Tracker/CITDP paths exist; if blocked for docs-only waiver, record in [evidence/refine-plan-pass1.md](./evidence/refine-plan-pass1.md) (GF-14 precedent: waive when no store REQ lifecycle).

**Subject client gates:** **Observed only** — do not re-run close_out during refine.

---

## 2. Plan (CITDP — facilitator publish)

### 2.1 Change definition

| | |
| --- | --- |
| **Current** | PROMPT-GF-04 mapped in client PLAN; **no** store trial readout; TIED-DEMO-04 still catalog `idea` in store doc |
| **Desired** | GF-11/14-quality readout + README + greenfield **Recorded trials** row |
| **Non-goals** | Client repair; Wave 5 tooling; new store REQ tokens; cohort leaderboard |
| **Success criteria** | Section contract §2.4; facilitator verification §2.3 captured; grading revised post-verify |

### 2.2 Impact

| Boundary | Paths |
| --- | --- |
| **New** | `docs/demos/trial-readout-PROMPT-GF-04-1792857852.md` |
| **Edit** | `docs/demos/README.md`, `docs/demos/catalog-greenfield-plan-new-feature-prompts.md` |
| **Working** | `tied-project/working/FACILITATOR-GF-04-1792857852/evidence/*` |
| **Read-only inspect** | Client root, `tied-project/working/REQ-GLOSSARY_RENAME_CHECK/**`, client `feedback.yaml` |

### 2.3 Facilitator verification (before drafting readout bands)

Environment (client-scoped):

```bash
export TIED_BASE_PATH="/Users/fareed/Documents/dev/test/1792857852/tied-project"
export TIED_METHODOLOGY_BUNDLE_PATH="/Users/fareed/Documents/dev/test/1792857852/tied-bundle"
export TIED_STORE_ROOT="/Users/fareed/Documents/dev/chatgpt/stdd"
```

| Command | Purpose | Capture to |
| --- | --- | --- |
| `git log -1 --format=%H` (client root) | HEAD pin | readout metadata + [build-plan-verification-evidence.md](./evidence/build-plan-verification-evidence.md) |
| `npm test` | Executable behavior | stdout artifact |
| `npm run lint:ts` or `npx tsc -b` | Typecheck | stdout/stderr artifact |
| `.cursor/skills/tied-yaml/scripts/tied-cli.sh tied_validate_consistency` | Traceability | full JSON file (anti-truncation) |
| Optional: `tied_project_lint` | Aggregated lint | JSON summary |

**Git pins (verify at build-plan):** bootstrap `ea51f52` (TIED 4.0.0), feature `dae9ff2`, close-out/docs `890049f`, `af5beca`; **HEAD** expected `af5becabb5ccbf3eb3444df2de37d9310c29fa03`.

**Subject completion signals to inspect (three-way — do not collapse):**

| Signal | Inspect |
| --- | --- |
| Machine close_out | Latest `close_out-*.json` → `allowed`; envelope blocking gaps |
| Process contract | Tracker `execution_evidence.close_out_evidence` populated; `completed` includes **`traceable-commit`**; early vs late gate path drift per handoff |
| Adherence ledger | **`not_run`** on subject — `tied_adherence_reconcile_run` repo root failure documented in handoff |

### 2.4 Readout document contract (mirror [GF-11](../../../docs/demos/trial-readout-PROMPT-GF-11-1792344147.md) / [GF-14](../../../docs/demos/trial-readout-PROMPT-GF-14-1792479171.md))

1. Metadata table (recorded date, touchpoint, catalog map, client root, HEAD, outcome headline).
2. Sponsor intent (verbatim PROMPT-GF-04 block).
3. RESOLVE table (subject client).
4. **What was built** — CLI/library modules, four finding kinds, **8** Vitest tests, fixtures tree, TIED stack paths, disturbance **L1** rename drift.
5. **Outcome record** — implementation vs dimensioned grading summary line.
6. **Completion signals** table (§2.3 three-way).
7. **TIED db capture** (client paths) + **GF cohort extras** (`feedback.yaml` methodology_improvement — unlike GF-11).
8. **Session grading vs catalog** — weighted six-dimension table with rationale.
9. **Cohort comparisons** — GF-11 (process hollow), GF-14 (gate trail + envelope freshness), GF-02/GF-25 (traceability hybrids), **Family A first recorded GF-04**; note GF-03 readout in catalog but not README table.
10. **TIED 4.0.0 / Wave 5 dogfood** — optional short paragraph linking partial close-out to store W5 PLAN (not effectiveness claim).
11. **Facilitator follow-ups** — open vs done.
12. **Future-test rule**.

### 2.5 Preliminary grading hypotheses (revise after §2.3 re-verify)

| Dimension | Band (draft) | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Whole-file rename simulation, fixture-only tests, report + exit codes locked in PLAN |
| Traceability closure | **A** | Vocab + routing; R+A+I + sidecar; CITDP persisted on client; first **built instance** note for TIED-DEMO-04 |
| Test strategy | **B+** | L1 appropriate for catalog; 8 fixture tests; no mutation/L4+ |
| Algorithm / implementation | **A−** | Word-boundary simulation; composition API `runGlossaryRenameCheck` |
| Process adherence | **B+** | Richer than GF-11: populated `close_out_evidence`, three gate paths, `traceable-commit` in `completed`; gap: adherence ledger **not_run**, retargeted master tracker |
| Methodology learning readout | **B− (partial)** | Not GF-19/20; grade **field observation quality** of client `methodology_improvement` + three-signal split — not Loop 3 effectiveness |

### 2.6 Plan gate

Proceed to **Implement (`@build-plan`)** when §2.3 verification outputs are captured and §2.5 bands are revised against evidence.

---

## 3. Implement boundary

**Completed (build-plan 2026-10-24):**

| Phase | Action | Evidence |
| --- | --- | --- |
| 1 | Re-verify client (§2.3) | [evidence/build-plan-verification-evidence.md](./evidence/build-plan-verification-evidence.md) |
| 2 | Author trial readout (§2.4) | [docs/demos/trial-readout-PROMPT-GF-04-1792857852.md](../../../docs/demos/trial-readout-PROMPT-GF-04-1792857852.md) |
| 3 | Link catalogs (§2.2) | `docs/demos/README.md`, `catalog-greenfield-plan-new-feature-prompts.md` |
| 4 | CHANGELOG | [CHANGELOG.md](../../../CHANGELOG.md) Unreleased Added row |

**Close-out (facilitator session):** **complete** — traceable-commit **`9ebcaa5d`** (2026-10-24).

**Completion signals (this session):**

| Signal | Status |
| --- | --- |
| Machine deliverable | **pass** — readout + catalog links + CHANGELOG |
| Process contract | **pass** — PLAN phases 1–4 executed |
| Adherence ledger | **N/A** — minimal depth; no client mutation |

---

## Related

- Client PLAN: `/Users/fareed/Documents/dev/test/1792857852/tied-project/working/REQ-GLOSSARY_RENAME_CHECK/PLAN.md`
- Refine evidence: [evidence/refine-plan-pass1.md](./evidence/refine-plan-pass1.md)
- Tracker: [checklist-tracker.yaml](./checklist-tracker.yaml)
