# Trial readout: PROMPT-GF-05 → client `1792944114-gf-05`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-10-25 |
| **Touchpoint** | **`@record-gf-trial`** facilitator publish (subject build + close-out on client prior to ingest) |
| **Trial prompt** | [PROMPT-GF-05](catalog-greenfield-plan-new-feature-prompts.md#prompt-gf-05) |
| **Catalog map** | [TIED-DEMO-05](catalog-tied-compact-tools.md#family-b--traceability--documentation-first-tied-demo-0508) — token coverage auditor |
| **Exercise bridge** | — (traceability · process primary) |
| **Client root** | `/Users/fareed/Documents/dev/test/1792944114-gf-05` |
| **Product REQ** | `REQ-REQ_TOKEN_COVERAGE` (client `tied-project/`) |
| **Proof boundary (primary)** | `traceability_structure` — REQ ID scan vs project index |
| **Proof boundary (secondary)** | `executable_behavior` — Vitest on fixture tree + CLI exit codes |
| **Outcome** | **Successful token coverage CLI; first recorded PROMPT-GF-05 trial; close_out gate persist/verify friction repaired and documented** |

This page is **documentation-only** in the TIED store; it does not register catalog `[REQ-*]` tokens.

---

## Sponsor intent (PROMPT-GF-05 verbatim)

```text
Build a CLI that scans source and test files for requirement identifiers referenced in comments or names and compares them to requirement records in this project’s requirements index. Report missing, orphan, and matched IDs. Include tests with a tiny sample tree.
```

---

## RESOLVE (Touchpoint 1)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| requirement identifiers | Canonical **`REQ-[A-Z0-9_]+`** only (not ARCH/IMPL/PROC) | client PLAN § Refine |
| comments or names | Bracket `[REQ-…]` and bare tokens with boundaries; basename + text regex (no AST) | `extractReqIds.ts`; PLAN |
| requirements index | **Project-only** top-level keys in `tied-project/requirements.yaml` | `loadRequirementsIndex.ts` |
| missing / orphan / matched | Set diff: scan ∪ vs index keys | `compareCoverage.ts`; fixture expectations |
| human-readable report | `MATCHED` / `MISSING` / `ORPHAN` sections; exit **0** iff both lists empty | `formatReport.ts`; CLI |

**Costly choices (consequence ladder):** Comparing this trial to **custom audit brief** client `1792861936` (not PROMPT-GF-05) → **costly misread**. Treating **`run-close-out-gates.mjs` allowed** without **persisted `close_out-*.json` + `tied_verify` checklist_gate** → **costly misread** (field case **`fb-mvo18hye-i6x5fq`**). Single trial as methodology effectiveness → **costly misread**. Disposable client only → **reversible**.

---

## What was built (description)

- **Interface:** TypeScript ESM package `req-token-coverage@0.1.0`; bin `req-token-coverage` → `dist/cli.js`; library `runReqTokenCoverage`.
- **Behavior:** Recursive scan under `--scan-root` with default ext/dir filters; index loaded separately (index paths **not** scanned); `REQ_FOO` → `REQ-FOO` normalization; stdout report + exit code from missing/orphan counts.
- **Modules:** `src/` — `types`, `normalizeReqToken`, `extractReqIds`, `scanSourceFiles`, `loadRequirementsIndex`, `compareCoverage`, `formatReport`, `runReqTokenCoverage`, `cli`, `index`.
- **Tests:** `tests/req-token-coverage.test.ts` — **7** Vitest cases (unit + composition on **`fixtures/req-token-coverage/`** only).
- **TIED stack (client):** `REQ-REQ_TOKEN_COVERAGE`, `ARCH-REQ_TOKEN_COVERAGE`, `IMPL-REQ_TOKEN_COVERAGE` + pseudo-code sidecar; CITDP `tied-project/citdp/CITDP-REQ-REQ_TOKEN_COVERAGE.yaml` (**minimal**, **advisory**); working folder `tied-project/working/REQ-REQ_TOKEN_COVERAGE/`.
- **Vocab:** `tied-project/vocab/req-token-coverage.md` + routing row.
- **Bootstrap:** TIED **4.0.0** disposable client (`1792944114-gf-05`). HEAD **`d801126a7f08ac7cb04db4216058783a461ff225`**.
- **Verification (2026-10-25, facilitator re-run):** `npm test` — **7 tests**, all green; `npm run lint:ts` — exit 0; `tied_validate_consistency` on client `tied-project/` — **`ok: true`** (summary in store working evidence).

**Disturbance ladder used:** **L0** optional clean matched fixture; **L1** missing + orphan matrix on tiny fixture tree — appropriate for **traceability_structure**-primary **TIED-DEMO-05** scope.

---

## Outcome record

**Implementation outcome:** Successful. The client ships a REQ token coverage auditor with explicit v1 non-goals (no merged methodology index, no ARCH/IMPL audit, static regex limits documented).

**Grading outcome:** Dimensioned readout — Requirement interpretation **A**, Traceability closure **A**, Test strategy **A−**, Algorithm / implementation **A**, Process adherence **B**, Methodology learning readout **B (partial)**. These bands describe this session and its proof boundaries; they are not a universal score or a methodology-effectiveness result.

**Subject completion signals (client REQ — as-built):**

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass (receipt)** | `close_out-2026-10-25T16-16-27-148Z.json` → `allowed: true` after operator persist repair; envelope blocking gaps **0** |
| **Process contract** | **partial** | Full checklist **template** tracker; `close_out_evidence.date` still **null**; **`traceable-commit`** not listed in `completed` despite handoff + commit on disk |
| **Adherence ledger** | **pass (populated)** | Verification + close_out `gate_decided` lines in `gate-ledger.jsonl` |
| **Close-out friction** | **repaired + documented** | Initial in-memory close_out allowed without disk receipt → `missing_checklist_gate` on bare `tied_verify`; operator sequence in [close-out-handoff.md](/Users/fareed/Documents/dev/test/1792944114-gf-05/tied-project/working/REQ-REQ_TOKEN_COVERAGE/evidence/close-out-handoff.md) and store feedback **`fb-mvo18hye-i6x5fq`** |

**GF cohort extras:** No client **`feedback.yaml`**. No `trial-prompt-interaction-inventory.v1.json`. **Store proxy feedback (pre-readout):** **`fb-mvo18hye-i6x5fq`** — gate persist / `checklist_gate` verify sequence (facilitator ingest **N/A** this session — no duplicate row).

**Future-test rule:** A single successful trial must not be treated as evidence of methodology effectiveness; cohort claims need baseline, outcome observation, and pairing disposition.

---

## TIED db capture (client project database)

| Artifact | Location | Role |
| --- | --- | --- |
| **REQ / ARCH / IMPL** | `tied-project/requirements/REQ-REQ_TOKEN_COVERAGE.yaml`, matching ARCH/IMPL paths | Token coverage auditor stack |
| **CITDP** | `tied-project/citdp/CITDP-REQ-REQ_TOKEN_COVERAGE.yaml` | Minimal depth; static-scan counterexamples |
| **PLAN** | `tied-project/working/REQ-REQ_TOKEN_COVERAGE/PLAN.md` | Strong RESOLVE + fixture contract (PROMPT-GF-05) |
| **Request envelope** | `.../evidence/request-evidence-envelope.v1.json` | Rev 2 with `checklist_gate_receipt` |
| **Verification manifest** | `.../evidence/verification-evidence-manifest.v1.json` | npm test + lint:ts |
| **Gate receipts (on disk)** | `.../gates/verification-*.json`, `close_out-2026-10-25T16-16-27-148Z.json` | close_out **`allowed: true`** |
| **Traceable commit** | `.../evidence/traceable-commit-evidence.md` | Ship commit **`d801126`** |
| **Adversarial inquiry** | — | **N/A** at minimal depth |

**Proof boundary:** `facilitator_session_reconstruction` — paths and tool names for future cohort compilation, not full chat transcripts.

**Facilitator verification artifacts (store):** [tied-project/working/FACILITATOR-GF-05-1792944114/evidence/build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-GF-05-1792944114/evidence/build-plan-verification-evidence.md)

---

## Session grading vs [TIED compact demo catalog](catalog-tied-compact-tools.md)

Separate dimension readout (not a collapsed score). Weights from catalog defaults.

| Dimension | Weight | Band | Rationale |
| --- | --- | --- | --- |
| Requirement interpretation | 15% | **A** | PROMPT-GF-05 mapped to REQ-only audit, project index scope, index/scan separation, exit codes, and explicit static-scan limits — aligns with **TIED-DEMO-05** / traceability_structure. |
| Traceability closure | 20% | **A** | Full R+A+I + sidecar; client vocab; CITDP persisted; facilitator `tied_validate_consistency` **`ok: true`**. |
| Test strategy | 20% | **A−** | Fixture-locked matched/missing/orphan matrix; composition API without subprocess for core; **L1** primary. No live-repo scan in tests — honest scope. |
| Algorithm / implementation | 20% | **A** | Set diff reporting; normalization rule; recursive scan filters; structured `CoverageResult` for tests. |
| Process adherence | 15% | **B** | **Stronger** than GF-11 template-only drift: persisted close_out after repair, envelope patch, verify green, traceable commit. **Weaker:** master tracker `close_out_evidence` not backfilled; close-out required manual gate/verify sequence. |
| Methodology learning readout | 10% | **B (partial)** | Not PROMPT-GF-19/20; grade **proxy store feedback** quality (**`fb-mvo18hye-i6x5fq`**) on close_out persist + `checklist_gate` — not Loop 3 effectiveness. |

**Catalog disposition note:** **TIED-DEMO-05** remains catalog **`idea`** in the store doc; this client is the **first recorded built instance** via **PROMPT-GF-05** in the greenfield recorded-trials table.

**Exercise catalog lens:** Pass 1 (design) — strong PLAN + CITDP; Pass 2 (tests vs defects) — fixture matrix; Pass 3 (hidden disturbances) — not run.

**TIED 4.0.0:** Close-out gate/verify friction documents **Wave 5 field stress** for facilitators; linkage to **`fb-mvo18hye-i6x5fq`** / **`PLAN-GF-05-GATE-VERIFY-DUAL-TRACK`** is process observation, not proof that 4.0.0 improves outcomes.

---

## Cohort comparisons (facilitator)

| Peer | Compare on |
| --- | --- |
| **GF-04** ([readout](trial-readout-PROMPT-GF-04-1792857852.md)) | Both **Family B traceability-primary** Oct-2026 **TIED 4.0.0** CLIs. GF-04 **vocab rename** report; GF-05 **REQ index** audit. GF-04 **methodology_improvement** on client; GF-05 friction captured as **store proxy** row. |
| **Custom audit brief** ([readout](trial-readout-CUSTOM-AUDIT-BRIEF-1792861936.md)) | **Not** a PROMPT-GF-05 product peer — do not compare token-auditor behavior to **TIED-DEMO-23** lens trial. |
| **GF-16** ([readout](trial-readout-PROMPT-GF-16-1792937222.md)) | GF-05 **traceability-primary**; GF-16 **STATE-06 executable-primary**. **Shared:** template tracker vs on-disk close_out receipts; populated adherence ledger when operator persists gates. |
| **GF-11** ([readout](trial-readout-PROMPT-GF-11-1792344147.md)) | GF-05 **stronger** gate trail after repair; GF-11 **hollow** ledger contrast. |

---

## Facilitator follow-ups

| # | Action | Status (2026-10-25) |
| --- | --- | --- |
| 1 | Publish store trial readout + catalog rows | **Done** — this document |
| 2 | Trim master tracker; sync **`completed`** with close-out slugs including **`traceable-commit`** | **Open** — sponsor/client |
| 3 | Populate **`execution_evidence.close_out_evidence`** on subject tracker | **Open** — sponsor/client |
| 4 | Runner default: persist close_out receipts when verify/update follows (**`fb-mvo18hye-i6x5fq`** / LEAP track) | **Open** — store methodology |
| 5 | Duplicate **`tied_feedback_add`** for gate friction | **N/A** — proxy row **`fb-mvo18hye-i6x5fq`** already on store |

---

## Related

- [Greenfield prompt catalog](catalog-greenfield-plan-new-feature-prompts.md)
- [TIED compact demo tool catalog](catalog-tied-compact-tools.md) — TIED-DEMO-05
- Client vocab: `/Users/fareed/Documents/dev/test/1792944114-gf-05/tied-project/vocab/req-token-coverage.md`
- Client working folder: `/Users/fareed/Documents/dev/test/1792944114-gf-05/tied-project/working/REQ-REQ_TOKEN_COVERAGE/`
- Store facilitator working folder: `/Users/fareed/Documents/dev/chatgpt/stdd/tied-project/working/FACILITATOR-GF-05-1792944114/`
- Store proxy feedback: **`fb-mvo18hye-i6x5fq`** in `tied-project/feedback.yaml`
