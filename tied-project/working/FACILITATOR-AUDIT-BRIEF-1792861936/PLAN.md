# PLAN — Facilitator trial readout (custom audit brief → client `1792861936`)

**Prompt type:** refine-plan (pass 1 complete 2026-10-24)  
**Linked Cursor plan:** `gf_audit_brief_readout_b442db65.plan.md`  
**Subject client:** `/Users/fareed/Documents/dev/test/1792861936`  
**Subject REQ (client only):** `REQ-TIED_CLIENT_AUDIT_BRIEF`  
**Store deliverable:** [docs/demos/trial-readout-CUSTOM-AUDIT-BRIEF-1792861936.md](../../../docs/demos/trial-readout-CUSTOM-AUDIT-BRIEF-1792861936.md) *(build-plan complete 2026-10-24)*  
**Prompt type (build):** build-plan  
**CITDP (working):** [CITDP-FACILITATOR-AUDIT-BRIEF-1792861936.yaml](./CITDP-FACILITATOR-AUDIT-BRIEF-1792861936.yaml) — **skip persist** to `tied-project/citdp/`

This PLAN governs **documentation-only** work in the TIED store. It does **not** mint store `[REQ-*]` tokens or mutate the disposable client unless the sponsor later scopes repair.

---

## 1. Refine (Touchpoint 1 — RESOLVE)

**Stripped sponsor intent:** Grade and record performance of the as-built **custom** greenfield demo at `1792861936` relative to other GF benchmarks; publish facilitator trial readout with **TIED-DEMO-23** + Family B lens.

| Catalog | Value |
| --- | --- |
| Trial prompt | **Custom** — not a pasted [PROMPT-GF-*](../../../docs/demos/catalog-greenfield-plan-new-feature-prompts.md) block (sponsor chose custom vs PROMPT-GF-05) |
| TIED demo lens | **[TIED-DEMO-23](../../../docs/demos/catalog-tied-compact-tools.md#family-f--meta-tied-tooling-tied-demo-2324)** — disposable bootstrap / `tied-new-client-audit.v1` artifact (meta); product is **read-only brief printer**, not runbook replay |
| Family B grading | Process + traceability weights from [facilitator grading](../../../docs/demos/catalog-greenfield-plan-new-feature-prompts.md#facilitator-grading-readout) |
| Proof boundary (primary) | **`executable_behavior`** — CLI exit 0/1/2, stdout brief, `node --test` |
| Proof boundary (secondary) | **`traceability_structure`** — client R+A+I, CITDP, gates |
| Facilitator proof boundary | **`facilitator_session_reconstruction`** — paths, SHAs, command names; not chat transcripts |
| Touchpoint | Linked plan **`audit_brief_cli_1ab19872.plan.md`** + **build-plan** / close-out on client (see client [PLAN.md](file:///Users/fareed/Documents/dev/test/1792861936/tied-project/working/REQ-TIED_CLIENT_AUDIT_BRIEF/PLAN.md)) |

### Sponsor intent (reconstructed — custom greenfield)

```text
Add a read-only CLI in this repo that reads the existing tied-new-client-audit.v1 JSON under tied-project/working and prints a one-screen human-readable summary (gate, profile, grammar, two-folder checks). Support --quiet (ok/fail only). Exit 0 when report.ok is true, 1 when false, 2 on missing file, invalid JSON, or wrong schema_version. Cover behavior with node:test using fixtures and the live audit file. Do not generate the audit JSON in this feature.
```

### RESOLVE (subject client)

PRELOAD: [feedback-to-tied.md](../../vocab/feedback-to-tied.md), [quality-assurance.md](../../vocab/quality-assurance.md) (grading lens, completion signals, proof boundaries).

| Sponsor / prompt term | Resolved concept | Where recorded |
| --- | --- | --- |
| audit receipt | `tied-new-client-audit.v1` JSON at default `tied-project/working/tied-new-client-audit.v1.json` | client PLAN; `print-tied-new-client-audit.mjs` |
| brief | Human-readable stdout; **not** a second JSON report | `format-tied-new-client-audit.mjs` |
| exit semantics | Trust root `report.ok` for 0/1; schema/parse → **2** | client PLAN parsing rules |
| `--quiet` | Exactly `ok` or `fail` + newline; same exit codes | tests in `print-tied-new-client-audit.test.mjs` |
| nested grammar / layout | `grammar_audit` nesting variants; `two_folder_layout.skipped` | client PLAN § parsing rules |
| audit generation | **Out of scope** — store owns `run-tied-new-client-audit.mjs` | client CITDP non_goals |

**Store cross-links (do not re-ingest):**

- Subject handoff: `.../REQ-TIED_CLIENT_AUDIT_BRIEF/close-out-handoff.md`
- Peer TIED 4.0.0 readout: [trial-readout-PROMPT-GF-04-1792857852.md](../../../docs/demos/trial-readout-PROMPT-GF-04-1792857852.md)

### Depth and policy (two layers)

| Layer | `depth_tier` | `gate_policy` | Notes |
| --- | --- | --- | --- |
| **Subject build** (`REQ-TIED_CLIENT_AUDIT_BRIEF`) | **minimal** | **advisory** | Local FS read; adversarial inquiry **N/A** at minimal depth |
| **This facilitator publish session** | **minimal** | **advisory** | Store markdown + catalog links only |

### Costly choices (consequence ladder)

| Choice | Rung | Disposition |
| --- | --- | --- |
| Treat single trial as methodology effectiveness evidence | 3+ | **Costly misread** — future-test rule in readout |
| Label trial as PROMPT-GF-05 token auditor | 3+ | **Forbidden misread** — product differs; document custom + TIED-DEMO-23 lens |
| Repair subject client adherence / master tracker during readout | 2 | **Reversible** — **out of scope** unless sponsor asks |
| Collapse six dimensions to one score | 3+ | **Forbidden** per catalog grading |
| Publish readout + catalog rows | 1 | **Locked** for `@build-plan` |
| stdd traceable-commit | 2 | **Sponsor-only** at close-out |

### Refine gate (this session)

**`pre_implementation` (facilitator publish):** Run `tied_gate_check` with `request_token: FACILITATOR-AUDIT-BRIEF-1792861936` after Tracker/CITDP paths exist; if blocked for docs-only waiver, record in [evidence/refine-plan-pass1.md](./evidence/refine-plan-pass1.md) (GF-04 / GF-14 precedent).

**Subject client gates:** **Observed only** — do not re-run close_out during refine.

---

## 2. Plan (CITDP — facilitator publish)

### 2.1 Change definition

| | |
| --- | --- |
| **Current** | Custom audit-brief client built and closed out; **no** store trial readout; **no** README/catalog row for `1792861936` |
| **Desired** | GF-11/14-quality readout + README + greenfield **Recorded trials** row (custom / TIED-DEMO-23 lens) |
| **Non-goals** | Client repair; new store REQ tokens; PROMPT-GF-26 catalog addition; cohort leaderboard |
| **Success criteria** | Section contract §2.4; facilitator verification §2.3 captured; grading revised post-verify |

### 2.2 Impact

| Boundary | Paths |
| --- | --- |
| **New** | `docs/demos/trial-readout-CUSTOM-AUDIT-BRIEF-1792861936.md` |
| **Edit** | `docs/demos/README.md`, `docs/demos/catalog-greenfield-plan-new-feature-prompts.md`, `CHANGELOG.md` (Unreleased) |
| **Working** | `tied-project/working/FACILITATOR-AUDIT-BRIEF-1792861936/evidence/*` |
| **Read-only inspect** | Client root, `tied-project/working/REQ-TIED_CLIENT_AUDIT_BRIEF/**` |

### 2.3 Facilitator verification (before drafting readout bands)

Environment (client-scoped):

```bash
export TIED_BASE_PATH="/Users/fareed/Documents/dev/test/1792861936/tied-project"
export TIED_METHODOLOGY_BUNDLE_PATH="/Users/fareed/Documents/dev/test/1792861936/tied-bundle"
export TIED_STORE_ROOT="/Users/fareed/Documents/dev/chatgpt/stdd"
```

| Command | Purpose | Capture to |
| --- | --- | --- |
| `git log -1 --format=%H` (client root) | HEAD pin | readout metadata + [build-plan-verification-evidence.md](./evidence/build-plan-verification-evidence.md) |
| `node --test scripts/print-tied-new-client-audit.test.mjs` | Executable behavior | stdout/stderr artifacts |
| `.cursor/skills/tied-yaml/scripts/tied-cli.sh tied_validate_consistency` | Traceability | full JSON file (anti-truncation) |
| Optional: `tied_project_lint` | Aggregated lint | JSON summary |
| Optional: `tied_adherence_reconcile_run` | Adherence ledger | document pass/fail only |

**Git pins (verify at build-plan):** bootstrap `72a610a` (TIED 4.0.0), feature `b3a2ce4`, close-out docs `b6a0bb1`; **HEAD** expected `b6a0bb19ccc061cc8a268c92f5bc98dd40c175ce`.

**Subject completion signals to inspect (three-way — do not collapse):**

| Signal | Inspect |
| --- | --- |
| Machine close_out | `gates/close_out-2026-10-24T17-21-24-654Z.json` → `allowed`; envelope blocking gaps |
| Process contract | `checklist-tracker-build.yaml` (`traceable-commit`, verification-gate); master `checklist-tracker.yaml` still template-empty |
| Adherence ledger | Handoff **not_run**; thin `agent-adherence-event.v1.jsonl` |

### 2.4 Readout document contract (mirror GF-04 / GF-11 / GF-14)

1. Metadata table (recorded date, touchpoint, **custom + TIED-DEMO-23 lens**, client root, HEAD, outcome headline).
2. Sponsor intent (reconstructed block §1 — state **custom greenfield**).
3. RESOLVE table (subject client).
4. **What was built** — `scripts/` layout, **11** node tests / **4** suites, live audit integration, minimal CITDP (`leap_feedback: complete`), disturbance **L0–L1**.
5. **Outcome record** — implementation vs dimensioned grading summary line.
6. **Completion signals** — three-way table (refresh after §2.3).
7. **TIED db capture** (client paths); **GF cohort extras:** no client `feedback.yaml` (contrast GF-04).
8. **Session grading** — six dimensions; methodology learning **N/A** (redistribute narrative weight across other bands in prose only — do not invent a numeric composite).
9. **Cohort comparisons** — GF-04 (TIED 4.0.0, manifest HEAD vs stale pin), GF-25 (minimal node CLI), GF-11 (process hollow), GF-14 (gate trail, leap_feedback).
10. **TIED 4.0.0** — bootstrap parity with GF-04; no effectiveness claim.
11. **Facilitator follow-ups** — adherence reconcile, master vs build tracker split.
12. **Future-test rule**.

### 2.5 Preliminary grading hypotheses (revise after §2.3 re-verify)

| Dimension | Band (draft) | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Normative parsing rules in client PLAN; non-goals explicit |
| Traceability closure | **A** | Full R+A+I + sidecar; persisted CITDP complete; facilitator `tied_validate_consistency` **`ok: true`** |
| Test strategy | **B+** | 11 node tests incl. live audit; minimal tier; no mutation/L4+ |
| Algorithm / implementation | **A−** | Nested JSON edge cases; exit 0/1/2 contract |
| Process adherence | **B+** | Build tracker + close_out + manifest `commit: HEAD`; gaps: adherence **not_run**, master tracker template |
| Methodology learning readout | **N/A** | Not GF-19/20 |

### 2.6 Plan gate

Proceed to **Implement (`@build-plan`)** when §2.3 verification outputs are captured and §2.5 bands are revised against evidence.

---

## 3. Implement boundary

**Completed (build-plan 2026-10-24):**

| Phase | Action | Evidence |
| --- | --- | --- |
| 1 | Re-verify client (§2.3) | [evidence/build-plan-verification-evidence.md](./evidence/build-plan-verification-evidence.md) |
| 2 | Author trial readout (§2.4) | [docs/demos/trial-readout-CUSTOM-AUDIT-BRIEF-1792861936.md](../../../docs/demos/trial-readout-CUSTOM-AUDIT-BRIEF-1792861936.md) |
| 3 | Link catalogs (§2.2) | `docs/demos/README.md`, `catalog-greenfield-plan-new-feature-prompts.md` |
| 4 | CHANGELOG | `CHANGELOG.md` Unreleased Added row |

**Close-out (facilitator session):** **complete** — traceable-commit **`6d6abb5b`** (2026-10-24).

**Completion signals (this session):**

| Signal | Status |
| --- | --- |
| Machine deliverable | **pass** — readout + catalog links + CHANGELOG |
| Process contract | **pass** — PLAN phases 1–4 executed |
| Adherence ledger | **N/A** — minimal depth; no client mutation |

---

## Related

- Client PLAN: `/Users/fareed/Documents/dev/test/1792861936/tied-project/working/REQ-TIED_CLIENT_AUDIT_BRIEF/PLAN.md`
- Refine evidence: [evidence/refine-plan-pass1.md](./evidence/refine-plan-pass1.md)
- Tracker: [checklist-tracker.yaml](./checklist-tracker.yaml)
