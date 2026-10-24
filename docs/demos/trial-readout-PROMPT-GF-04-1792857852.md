# Trial readout: PROMPT-GF-04 → client `1792857852`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-10-24 |
| **Touchpoint** | **`@add-feature`** (client PLAN header) + facilitator inspection (post build) + **build-plan** publish |
| **Trial prompt** | [PROMPT-GF-04](catalog-greenfield-plan-new-feature-prompts.md#prompt-gf-04) |
| **Catalog map** | [TIED-DEMO-04](catalog-tied-compact-tools.md) — Vocabulary rename consistency checker |
| **Exercise bridge** | **L1 rename drift** (Family A; no exercise-catalog bridge ID) |
| **Client root** | `/Users/fareed/Documents/dev/test/1792857852` |
| **Product REQ** | `REQ-GLOSSARY_RENAME_CHECK` (client `tied-project/`) |
| **Proof boundary (primary)** | `traceability_structure` — `[PROC-VOCABULARY_INDEX]` VALIDATE subset, R+A+I, client vocab |
| **Proof boundary (secondary)** | `executable_behavior` — Vitest on `fixtures/glossary-rename/` only |
| **Outcome** | **Successful product implementation; graded trial recorded; process contract partial (Wave 5 dogfood); rich methodology_improvement feedback on client** |

This page is **documentation-only** in the TIED store; it does not register catalog `[REQ-*]` tokens.

---

## Sponsor intent (PROMPT-GF-04 verbatim)

```text
Build a CLI that scans markdown glossary files under this project and reports preferred-term inconsistencies after a simulated bulk rename (provide a small fixture tree in the repo for the tool to check). Output a human-readable report; tests use the fixture tree only.
```

---

## RESOLVE (Touchpoint 1)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| markdown glossary files | Recursive `*.md` under **`--root`**; optional skip of `routing.md` / `domain-references.md` | `scanGlossaryFiles.ts`; client PLAN |
| simulated bulk rename | In-memory **whole-file** word-boundary replace; **never writes disk** | `applyRename.ts`; `[ARCH-GLOSSARY_RENAME_CHECK]` |
| preferred-term inconsistencies | Four **finding** codes after rename simulation | `analyzeConsistency.ts`; `types.ts` |
| fixture tree | `fixtures/glossary-rename/` (four files); tests **only** this root | Vitest; PROMPT-GF-04 constraint |
| human-readable report | stdout sections + **exit 0** if zero findings else **1** | `formatReport.ts`; README |

**Costly choices (consequence ladder):** Writing renamed content back to disk → **costly** (new REQ; v1 non-goals). Full parity with store `validate_vocab_index.rb` → **costly**. Treating **machine `close_out` allowed** without **adherence ledger** and tracker path cross-check → **costly** misread (see completion signals). Disposable client only → **reversible**.

---

## What was built (description)

- **Interface:** TypeScript ESM CLI (`glossary-rename-check`), library entry `runGlossaryRenameCheck`, Vitest at repo root.
- **Behavior:** Scan `--root`; apply ordered `--rename from=to` pairs in memory; parse preferred-term tables and alphabetical lists; emit findings with stable codes: `preferred_avoid_collision`, `duplicate_preferred`, `alphabetical_undefined`, `rename_survivor`.
- **Modules:** `src/` — `runGlossaryRenameCheck`, `scanGlossaryFiles`, `parseGlossaryMarkdown`, `applyRename`, `analyzeConsistency`, `formatReport`, `normalizeTerm`, `types`; CLI wiring in package scripts / bin.
- **Fixtures:** `fixtures/glossary-rename/` — `clean-widget.md`, `collision-gadget.md`, `stale-index.md`, `survivor-hyphen.md`.
- **TIED stack (client):** `REQ-GLOSSARY_RENAME_CHECK`, `ARCH-GLOSSARY_RENAME_CHECK`, `IMPL-GLOSSARY_RENAME_CHECK` with pseudo-code sidecar; CITDP `tied-project/citdp/CITDP-REQ-GLOSSARY_RENAME_CHECK.yaml` (**minimal** depth, **advisory** gate policy); checklist tracker, envelope, gate receipts under `tied-project/working/REQ-GLOSSARY_RENAME_CHECK/`.
- **Vocab:** `tied-project/vocab/glossary-rename-check.md` + routing row.
- **Bootstrap:** TIED **4.0.0** disposable client; git commits `ea51f52` (bootstrap), `dae9ff2` (feature), close-out/docs through `af5beca`. HEAD `af5becabb5ccbf3eb3444df2de37d9310c29fa03`.
- **Verification (2026-10-24, facilitator re-run):** `npm test` — **8 tests**, **1 file**, all green; `npm run lint:ts` — exit 0; `tied_validate_consistency` on client `tied-project/` — **`ok: true`** (full JSON in store working evidence).

**Disturbance ladder used:** **L0** (clean fixture baseline), **L1** (rename drift / stale index / collision scenarios in committed fixtures). No mutation harness or L4+ combined faults — appropriate for **TIED-DEMO-04** traceability-primary catalog stress.

---

## Outcome record

**Implementation outcome:** Successful. The client ships the glossary rename consistency CLI, documents non-goals (no disk write, no full vocab-index parity), exercises preferred-term VALIDATE-style checks on fixtures, and records a strong client **PLAN.md** (PROMPT-GF-04 header, refine table, acceptance criteria).

**Grading outcome:** Dimensioned readout — Requirement interpretation **A**, Traceability closure **A**, Test strategy **B+**, Algorithm / implementation **A−**, Process adherence **B**, Methodology learning readout **B− (partial)**. These bands describe this session and its proof boundaries; they are not a universal score or a methodology-effectiveness result.

**Subject completion signals (client REQ — as-built):**

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass (receipt)** | `close_out-2026-10-24T16-15-19-764Z.json` → `allowed: true`; envelope validate **blocking_gaps=0** per [close-out-handoff.md](/Users/fareed/Documents/dev/test/1792857852/tied-project/working/REQ-GLOSSARY_RENAME_CHECK/evidence/close-out-handoff.md) |
| **Process contract** | **partial** | Tracker **`close_out_evidence`** populated (date, envelope, gate map); **`traceable-commit`** in `completed`; tracker references **pre_implementation** / **verification** / **close_out** receipt paths at `17-50-*` **not present on disk** (only three earlier `16-15-*` close_out receipts exist) — dual-write drift |
| **Adherence ledger** | **not_run** | `tied_adherence_reconcile_run` failed (**repo root not found**) per handoff |
| **Evidence freshness** | **gap** | `verification-evidence-manifest.v1.json` **`commit`** pin **`ea51f52`** (bootstrap) vs HEAD `af5beca` |

**GF cohort extras:** Client **`feedback.yaml`** contains full **`methodology_improvement`** body (Wave 5 close-out completion pass) — upstream in store as `fb-mvmmb3lp-723euw` via [PLAN-CLOSE-OUT-W5-FIELD-FEEDBACK](../../tied-project/working/PLAN-CLOSE-OUT-W5-FIELD-FEEDBACK/PLAN.md). No `trial-prompt-interaction-inventory.v1.json`.

**Future-test rule:** A single successful trial must not be treated as evidence of methodology effectiveness; cohort claims need baseline, outcome observation, and pairing disposition.

---

## TIED db capture (client project database)

| Artifact | Location | Role |
| --- | --- | --- |
| **REQ / ARCH / IMPL** | `tied-project/requirements/REQ-GLOSSARY_RENAME_CHECK.yaml`, matching ARCH/IMPL paths | Glossary rename check traceability stack |
| **CITDP** | `tied-project/citdp/CITDP-REQ-GLOSSARY_RENAME_CHECK.yaml` | Minimal depth; counterexamples |
| **PLAN** | `tied-project/working/REQ-GLOSSARY_RENAME_CHECK/PLAN.md` | Strong RESOLVE + acceptance criteria (PROMPT-GF-04) |
| **Request envelope** | `tied-project/working/REQ-GLOSSARY_RENAME_CHECK/evidence/request-evidence-envelope.v1.json` | Registry; blocking gaps cleared at close-out |
| **Verification manifest** | `.../evidence/verification-evidence-manifest.v1.json` | npm test evidence; stale **`commit`** pin |
| **Gate receipts (on disk)** | `.../gates/close_out-2026-10-24T16-15-*.json` (3 files) | All **`allowed: true`** |
| **Gate receipts (tracker refs)** | Paths under `17-50-*` in tracker | **Missing on disk** at facilitator inspect time |
| **Test stdout** | `.../evidence/vitest.stdout.txt` | Command evidence (8 tests) |
| **Feedback** | `tied-project/feedback.yaml` | Methodology improvement — close-out three-signal split |
| **Adversarial inquiry** | — | **N/A** at minimal depth |

**Proof boundary:** `facilitator_session_reconstruction` — paths and tool names for future cohort compilation, not full chat transcripts.

**Facilitator verification artifacts (store):** [tied-project/working/FACILITATOR-GF-04-1792857852/evidence/build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-GF-04-1792857852/evidence/build-plan-verification-evidence.md)

---

## Session grading vs [TIED compact demo catalog](catalog-tied-compact-tools.md)

Separate dimension readout (not a collapsed score). Weights from catalog defaults.

| Dimension | Weight | Band | Rationale |
| --- | --- | --- | --- |
| Requirement interpretation | 15% | **A** | PROMPT-GF-04 mapped to whole-file simulated rename, fixture-only tests, report + exit codes, and explicit v1 non-goals in PLAN + CITDP — aligns with **TIED-DEMO-04** / `[PROC-VOCABULARY_INDEX]` VALIDATE emphasis. |
| Traceability closure | 20% | **A** | Full R+A+I + sidecar; client vocab + routing; CITDP persisted; facilitator `tied_validate_consistency` **`ok: true`**. Gap: manifest commit stale (shared GF cohort pattern). |
| Test strategy | 20% | **B+** | RED/green chain on fixtures; four finding kinds covered; **L1** rename drift target. No mutation harness; scope honest for traceability-primary demo. |
| Algorithm / implementation | 20% | **A−** | Ordered rename pairs; word-boundary simulation; composition API without subprocess; four stable finding codes. |
| Process adherence | 15% | **B** | Stronger than **GF-11**: populated **`close_out_evidence`**, long **`completed`** list including **`traceable-commit`**. Weaker than ideal Wave 5: **adherence ledger not_run**; tracker gate paths **drift** from on-disk receipts; retargeted master tracker noted in handoff. |
| Methodology learning readout | 10% | **B− (partial)** | Not PROMPT-GF-19/20; grade **field observation quality** of client **`methodology_improvement`** (Wave 5 completion pass request) — **not** Loop 3 effectiveness. |

**Catalog disposition note:** **TIED-DEMO-04** remains catalog `idea` in the store doc; this client is the **first recorded built instance** via **PROMPT-GF-04** in the greenfield recorded-trials table.

**Exercise catalog lens:** Pass 1 (design) — strong PLAN + vocab; Pass 2 (tests vs defects) — fixture-based, no mutation; Pass 3 (hidden disturbances) — not run.

**TIED 4.0.0 / Wave 5 dogfood:** This trial exercised **TIED 4.0.0** bootstrap and produced store-actionable close-out field feedback (ingested separately). That linkage documents **process stress**, not proof that 4.0.0 improves outcomes.

---

## Cohort comparisons (facilitator)

| Peer | Compare on |
| --- | --- |
| **GF-11** ([readout](trial-readout-PROMPT-GF-11-1792344147.md)) | GF-04 **stronger process artifacts** (`close_out_evidence` populated, `traceable-commit` in `completed`, multiple gate receipts). GF-11 **hollower** tracker and missing pre/verification files on disk. |
| **GF-14** ([readout](trial-readout-PROMPT-GF-14-1792479171.md)) | Similar **manifest commit stale** and **close_out vs tracker** themes. GF-04 adds **TIED 4.0.0**, **`traceable-commit` in completed**, and **client methodology_improvement** feedback. GF-14 lacked **`traceable-commit`** slug in `completed`. |
| **GF-02 / GF-25** | Executable + traceability hybrids; GF-04 **more vocab-native**, lighter algorithmic disturbance ladder. |
| **Family A (GF-01–03)** | **First Family A prompt recorded** in the GF readout cohort; GF-03 readout exists in [catalog recorded trials](catalog-greenfield-plan-new-feature-prompts.md#recorded-trials-facilitator) but not in [README](README.md) table — asymmetry noted for facilitators curating indexes. |

---

## Facilitator follow-ups

| # | Action | Status (2026-10-24) |
| --- | --- | --- |
| 1 | Publish store trial readout + catalog rows | **Done** — this document |
| 2 | Align tracker gate receipt paths with files on disk | **Open** — sponsor/client |
| 3 | Run **`tied_adherence_reconcile_run`** with correct **`project_root`** | **Open** — sponsor/client |
| 4 | Refresh verification manifest **commit** to HEAD `af5beca` | **Open** — sponsor/client |
| 5 | Replace retargeted master tracker with minimal per-REQ copy (optional hygiene) | **Open** — noted in handoff |

---

## Related

- [Greenfield prompt catalog](catalog-greenfield-plan-new-feature-prompts.md)
- [TIED compact demo tool catalog](catalog-tied-compact-tools.md) — TIED-DEMO-04
- Client vocab: `/Users/fareed/Documents/dev/test/1792857852/tied-project/vocab/glossary-rename-check.md`
- Client working folder: `/Users/fareed/Documents/dev/test/1792857852/tied-project/working/REQ-GLOSSARY_RENAME_CHECK/`
- Store build-plan evidence: `/Users/fareed/Documents/dev/chatgpt/stdd/tied-project/working/FACILITATOR-GF-04-1792857852/`
- Store Wave 5 ingest: [PLAN-CLOSE-OUT-W5-FIELD-FEEDBACK](../../tied-project/working/PLAN-CLOSE-OUT-W5-FIELD-FEEDBACK/PLAN.md)
