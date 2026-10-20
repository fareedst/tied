# PLAN — Facilitator trial readout (PROMPT-GF-14 → client `1792479171`)

**Prompt type:** refine-plan (pass 1)  
**Linked Cursor plan:** `gf-14_client_xlate_readout_c2aac689.plan.md`  
**Subject client:** `/Users/fareed/Documents/dev/test/1792479171`  
**Subject REQ (client only):** `REQ-BATCH_PROCESSOR`  
**Store deliverable:** [docs/demos/trial-readout-PROMPT-GF-14-1792479171.md](../../../docs/demos/trial-readout-PROMPT-GF-14-1792479171.md)  
**Last refined:** 2026-10-20 · **build-plan completed:** 2026-10-20

This PLAN governs **documentation-only** work in the TIED store. It does **not** mint store `[REQ-*]` tokens or mutate the disposable client unless the sponsor later scopes repair.

---

## 1. Refine (Touchpoint 1 — RESOLVE)

**Stripped sponsor intent:** Analyze and report on the new TIED client at `1792479171` after `/xlate`; publish a facilitator trial readout linked from demo catalogs.

| Catalog | Value |
| --- | --- |
| Trial prompt | [PROMPT-GF-14](../../../docs/demos/catalog-greenfield-plan-new-feature-prompts.md#prompt-gf-14) |
| TIED demo | **TIED-DEMO-14** — crash-resumable batch processor |
| Exercise bridge | **STATE-01** |
| Proof boundary (primary) | **`executable_behavior`** — Vitest crash-matrix + independent oracle |
| Proof boundary (secondary) | **`traceability_structure`** — client R+A+I, CITDP, PLAN, gates, envelope |
| Facilitator proof boundary | **`facilitator_session_reconstruction`** — paths, command names, artifact hashes; not chat transcripts |

### RESOLVE (subject client)

PRELOAD: client [`batch-processor.md`](/Users/fareed/Documents/dev/test/1792479171/tied-project/vocab/batch-processor.md); methodology routing for bootstrap / trial-readout terms ([`feedback-to-tied`](../../vocab/feedback-to-tied.md), [`quality-assurance`](../../vocab/quality-assurance.md) grading lens).

| Sponsor / prompt term | Resolved concept | Where recorded |
| --- | --- | --- |
| CLI batch processor | **`batch_cli`** + **`batch_core`** | `src/batch-cli/*`, `src/batch-core/*` |
| reads records from a file | JSONL **Record**; unique `id` | `validate-input.ts`, README |
| checkpoints progress | **`checkpoint.v1`**, monotonic **`nextLineIndex`** | `checkpoint-store.ts` |
| simulated crashes | **`SimulatedCrashError`** at **CrashPoint** enum | `fault-injector.ts`, `crash-matrix.test.ts` |
| configurable crash points | 4 points × matrix (13 crash-matrix cases + supporting suites) | PLAN §2.5–2.8 |
| no silent loss | **Silent loss** forbidden; **`tests/oracle.ts`** | README guarantee table |
| documented guarantee | Re-execution window + idempotent merge by `id` | PLAN sponsor decisions; CITDP non-goals |

### Depth and policy (two layers)

| Layer | `depth_tier` | `gate_policy` | Notes |
| --- | --- | --- | --- |
| **Subject build** (client `REQ-BATCH_PROCESSOR`) | **minimal** (waiver from integrated eligibility) | **advisory** | Persistence + file I/O; adversarial inquiry **N/A** per client waiver evidence |
| **This facilitator publish session** | **minimal** | **advisory** | Store markdown + catalog links only |

### Costly choices (consequence ladder)

| Choice | Rung | Disposition |
| --- | --- | --- |
| Promote batch processor to durable / multi-worker / exactly-once | 3+ | **Costly** — new client REQ scope |
| Treat **`close_out` allowed** without tracker **`execution_evidence`** cross-check | 3+ | **Costly misread** — document three completion signals separately |
| Repair client tracker/manifest drift during readout | 2 | **Reversible** — **out of scope** unless sponsor asks |
| Publish store readout + catalog row | 1 | **Locked** for implement |

### Refine gate (this session)

**`pre_implementation` checklist gate:** **N/A (waived)** for store-only documentation — no store Tracker/CITDP `[REQ-*]` lifecycle; subject client gates are **observed**, not re-run. Remediation: record waiver in [evidence/refine-plan-pass1.md](./evidence/refine-plan-pass1.md).

---

## 2. Plan (CITDP — facilitator publish)

### 2.1 Change definition

| | |
| --- | --- |
| **Current** | PROMPT-GF-14 mapped in client PLAN; no store trial readout row |
| **Desired** | GF-11–quality trial readout under `docs/demos/` + README + greenfield catalog link |
| **Non-goals** | Cohort feedback.yaml; client tracker repair; methodology `[REQ-*]` tokens for product |
| **Success criteria** | Readout matches GF-11 section contract; facilitator re-verification commands captured; grading table with proof-boundary disclaimers |

### 2.2 Impact

| Boundary | Paths |
| --- | --- |
| **New** | `docs/demos/trial-readout-PROMPT-GF-14-1792479171.md` |
| **Edit** | `docs/demos/README.md`, `docs/demos/catalog-greenfield-plan-new-feature-prompts.md` |
| **Read-only inspect** | Client root, `tied-project/working/REQ-BATCH_PROCESSOR/**` |

### 2.3 Facilitator verification (before drafting readout)

Environment (client-scoped):

```bash
export TIED_BASE_PATH="/Users/fareed/Documents/dev/test/1792479171/tied-project"
export TIED_METHODOLOGY_BUNDLE_PATH="/Users/fareed/Documents/dev/test/1792479171/tied-bundle"
export TIED_STORE_ROOT="/Users/fareed/Documents/dev/chatgpt/stdd"
```

| Command | Purpose | Capture to readout |
| --- | --- | --- |
| `npm test` (client root) | Executable behavior | Counts vs evidence stdout |
| `npx tsc -b` (client root) | CITDP listed command | Pass/fail |
| `tied-cli.sh tied_validate_consistency` | Traceability | Parse **`ok`** / index validity (full JSON to file, avoid truncated logs) |
| `tied-cli.sh tied_project_lint` | Aggregated lint | Summarize diagnostics |

**Git pins:** bootstrap `51b3c5b`, feature `5dc7899987a726f41c9ddb2fb3c83706f8487983` (verify at implement time).

### 2.4 Readout document contract (mirror [GF-11](../../../docs/demos/trial-readout-PROMPT-GF-11-1792344147.md))

1. Metadata table (recorded date, touchpoint `/xlate` + facilitator inspection, catalog map, client root, HEAD, outcome headline).
2. Sponsor intent (verbatim PROMPT-GF-14 block).
3. RESOLVE table (subject client).
4. **What was built** — modules, guarantee table, disturbance ladder (**L0–L1** unit suites, **L2–L3** crash matrix, **L5** if seeded random present in PLAN).
5. **Outcome record** — implementation vs dimensioned grading ([catalog grading model](../../../docs/demos/catalog-tied-compact-tools.md)).
6. **Completion signals** (three-way):

| Signal | Inspect |
| --- | --- |
| Machine close_out | Latest `close_out-*.json` → `allowed` |
| Process contract | Tracker `execution_evidence.completed`; missing **`traceable-commit`** slug |
| Evidence freshness | Manifest `commit` vs HEAD; empty `close_out_evidence` block |

7. **TIED db capture** table (client paths).
8. **Session grading vs catalog** — weighted dimension table with rationale column.
9. **GF-11 comparison** — subject has richer gates/tracker than GF-11 hollow case; similar manifest freshness risk.
10. **Facilitator follow-ups** — open vs done rows.
11. **Future-test rule** — single trial ≠ methodology effectiveness.

### 2.5 Preliminary grading hypotheses (revise after re-verify)

| Dimension | Band | Rationale (draft) |
| --- | --- | --- |
| Requirement interpretation | **A** | PLAN refine + locked idempotent merge / input hash / non-goals |
| Traceability closure | **A−** | Full R+A+I; CITDP `leap_feedback` draft; manifest commit drift |
| Test strategy | **A** | RED/green chain, crash matrix, oracle |
| Algorithm / implementation | **A** | STATE-01 persistence boundaries |
| Process adherence | **B** | Gates on disk + long `completed`; tracker close_out block empty; no `traceable-commit` slug |
| Methodology learning readout | **N/A** | Loop-1 disposable |

### 2.6 Plan gate

Proceed to **Implement** when verification commands have been run and outputs are captured for the readout body.

---

## 3. Implement boundary

**Completed (build-plan 2026-10-20):**

| Phase | Action | Evidence |
| --- | --- | --- |
| 1 | Re-verify client (§2.3) | [evidence/build-plan-verification-evidence.md](./evidence/build-plan-verification-evidence.md) |
| 2 | Author trial readout (§2.4) | [docs/demos/trial-readout-PROMPT-GF-14-1792479171.md](../../../docs/demos/trial-readout-PROMPT-GF-14-1792479171.md) |
| 3 | Link catalogs (§2.2) | `docs/demos/README.md`, `catalog-greenfield-plan-new-feature-prompts.md` |

**Close-out (facilitator session):** **deferred** — store docs only; no git commit unless sponsor requests.

**Completion signals (this session):**

| Signal | Status |
| --- | --- |
| Machine deliverable | **pass** — readout + catalog links on disk |
| Process contract | **pass** — PLAN phases 1–3 executed per linked refine |
| Adherence ledger | **N/A** — no integrated depth / no client code mutation |

---

## Related

- Client PLAN: `/Users/fareed/Documents/dev/test/1792479171/tied-project/working/REQ-BATCH_PROCESSOR/PLAN.md`
- Refine evidence: [evidence/refine-plan-pass1.md](./evidence/refine-plan-pass1.md)
