# Trial readout: custom audit brief → client `1792861936`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-10-24 |
| **Touchpoint** | Linked plan **`audit_brief_cli_1ab19872.plan.md`** + **build-plan** / close-out on client + facilitator **build-plan** publish |
| **Trial prompt** | **Custom greenfield** — not a pasted [PROMPT-GF-*](catalog-greenfield-plan-new-feature-prompts.md) block (sponsor chose custom vs [PROMPT-GF-05](catalog-greenfield-plan-new-feature-prompts.md#prompt-gf-05) token auditor) |
| **Catalog map** | [TIED-DEMO-23](catalog-tied-compact-tools.md#family-f--meta-tied-tooling-tied-demo-2324) lens — bootstrap / `tied-new-client-audit.v1` meta; product is **read-only brief printer** |
| **Family B grading** | Process + traceability weights from [facilitator grading](catalog-greenfield-plan-new-feature-prompts.md#facilitator-grading-readout) |
| **Client root** | `/Users/fareed/Documents/dev/test/1792861936` |
| **Product REQ** | `REQ-TIED_CLIENT_AUDIT_BRIEF` (client `tied-project/`) |
| **Proof boundary (primary)** | `executable_behavior` — CLI exit 0/1/2, stdout brief, `node --test` |
| **Proof boundary (secondary)** | `traceability_structure` — client R+A+I, CITDP, gates |
| **Outcome** | **Successful product implementation; graded custom trial recorded; subject process contract pass on build tracker; no client methodology feedback file** |

This page is **documentation-only** in the TIED store; it does not register catalog `[REQ-*]` tokens.

---

## Sponsor intent (custom greenfield — reconstructed)

```text
Add a read-only CLI in this repo that reads the existing tied-new-client-audit.v1 JSON under tied-project/working and prints a one-screen human-readable summary (gate, profile, grammar, two-folder checks). Support --quiet (ok/fail only). Exit 0 when report.ok is true, 1 when false, 2 on missing file, invalid JSON, or wrong schema_version. Cover behavior with node:test using fixtures and the live audit file. Do not generate the audit JSON in this feature.
```

---

## RESOLVE (Touchpoint 1)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| audit receipt | `tied-new-client-audit.v1` JSON at default `tied-project/working/tied-new-client-audit.v1.json` | client PLAN; `print-tied-new-client-audit.mjs` |
| brief | Human-readable stdout; **not** a second JSON report | `format-tied-new-client-audit.mjs` |
| exit semantics | Trust root `report.ok` for 0/1; schema/parse → **2** | client PLAN parsing rules |
| `--quiet` | Exactly `ok` or `fail` + newline; same exit codes | `print-tied-new-client-audit.test.mjs` |
| nested grammar / layout | `grammar_audit` nesting variants; `two_folder_layout.skipped` | client PLAN § parsing rules |
| audit generation | **Out of scope** — store owns `run-tied-new-client-audit.mjs` | client CITDP non_goals |

**Costly choices (consequence ladder):** Labeling this trial as **PROMPT-GF-05** token coverage → **costly misread**. Treating **machine `close_out` allowed** without **adherence ledger** cross-check → **costly misread** (see completion signals). Single trial as methodology effectiveness → **costly misread**. Disposable client only → **reversible**.

---

## What was built (description)

- **Interface:** Node ESM CLI `node scripts/print-tied-new-client-audit.mjs [--file PATH] [--repo-root PATH] [--quiet]`; library `format-tied-new-client-audit.mjs` (`parseAuditReport`, `formatAuditBrief`, exit helpers).
- **Behavior:** Read-only format of onboarding audit JSON; verbose brief lists gate, profile, grammar layers, SC-TFL check ids; quiet mode prints `ok`/`fail` only; exit codes 0/1/2 per contract.
- **Layout:** `scripts/print-tied-new-client-audit.mjs`, `scripts/lib/format-tied-new-client-audit.mjs`, `scripts/print-tied-new-client-audit.test.mjs` (no root `package.json`).
- **TIED stack (client):** `REQ-TIED_CLIENT_AUDIT_BRIEF`, `ARCH-TIED_CLIENT_AUDIT_BRIEF`, `IMPL-TIED_CLIENT_AUDIT_BRIEF` with pseudo-code sidecar; CITDP `tied-project/citdp/CITDP-REQ-TIED_CLIENT_AUDIT_BRIEF.yaml` (**minimal**, **advisory**, **`leap_feedback: complete`**); working folder under `tied-project/working/REQ-TIED_CLIENT_AUDIT_BRIEF/`.
- **Bootstrap:** TIED **4.0.0** disposable client; git commits `72a610a` (bootstrap), `b3a2ce4` (feature), `b6a0bb1` (close-out docs). HEAD `b6a0bb19ccc061cc8a268c92f5bc98dd40c175ce`.
- **Verification (2026-10-24, facilitator re-run):** `node --test scripts/print-tied-new-client-audit.test.mjs` — **11 tests**, **4 suites**, all green; `tied_validate_consistency` on client `tied-project/` — **`ok: true`** (full JSON in store working evidence).

**Disturbance ladder used:** **L0** (minimal synthetic reports in unit tests), **L1** (live `tied-new-client-audit.v1.json` integration test). No mutation harness — appropriate for meta-adjacent **TIED-DEMO-23** lens with executable-primary proof.

---

## Outcome record

**Implementation outcome:** Successful. The client ships the audit brief printer, documents non-goals (no audit generation, no full JSON Schema validation against store schema), and records a strong client **PLAN.md** with normative parsing rules and exit semantics.

**Grading outcome:** Dimensioned readout — Requirement interpretation **A**, Traceability closure **A**, Test strategy **B+**, Algorithm / implementation **A−**, Process adherence **B+**, Methodology learning readout **N/A**. These bands describe this session and its proof boundaries; they are not a universal score or a methodology-effectiveness result.

**Subject completion signals (client REQ — as-built):**

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass (receipt)** | `close_out-2026-10-24T17-21-24-654Z.json` → `allowed: true`; envelope **`gaps: []`** per [close-out-handoff.md](/Users/fareed/Documents/dev/test/1792861936/tied-project/working/REQ-TIED_CLIENT_AUDIT_BRIEF/close-out-handoff.md) |
| **Process contract** | **pass (build tracker)** | `checklist-tracker-build.yaml` includes **`traceable-commit`**, **`verification-gate`**; verification manifest present. Master `checklist-tracker.yaml` remains **template-empty** (dual-track split — note for cohort) |
| **Adherence ledger** | **not_run** | `tied_adherence_reconcile_run` failed (**repo root not found**) per handoff; thin `agent-adherence-event.v1.jsonl` |
| **Evidence freshness** | **pass** | `verification-evidence-manifest.v1.json` uses **`commit: HEAD`** (contrast GF-04 stale bootstrap pin) |

**GF cohort extras:** No client **`feedback.yaml`** (contrast [GF-04](trial-readout-PROMPT-GF-04-1792857852.md) Wave 5 methodology_improvement capture). No `trial-prompt-interaction-inventory.v1.json`.

**Future-test rule:** A single successful trial must not be treated as evidence of methodology effectiveness; cohort claims need baseline, outcome observation, and pairing disposition.

---

## TIED db capture (client project database)

| Artifact | Location | Role |
| --- | --- | --- |
| **REQ / ARCH / IMPL** | `tied-project/requirements/REQ-TIED_CLIENT_AUDIT_BRIEF.yaml`, matching ARCH/IMPL paths | Audit brief traceability stack |
| **CITDP** | `tied-project/citdp/CITDP-REQ-TIED_CLIENT_AUDIT_BRIEF.yaml` | Minimal depth; leap_feedback complete |
| **PLAN** | `tied-project/working/REQ-TIED_CLIENT_AUDIT_BRIEF/PLAN.md` | Parsing rules + test strategy |
| **Request envelope** | `.../evidence/request-evidence-envelope.v1.json` | Registry; **`gaps: []`** at close-out |
| **Verification manifest** | `.../evidence/verification-evidence-manifest.v1.json` | node:test evidence; **`commit: HEAD`** |
| **Gate receipts (on disk)** | `.../gates/close_out-2026-10-24T17-21-24-654Z.json` | **`allowed: true`** |
| **Test stdout** | `.../evidence/unit-print-tied-new-client-audit.stdout.txt` | Client close-out command evidence (11 tests) |
| **Live audit fixture** | `tied-project/working/tied-new-client-audit.v1.json` | G4 linked bootstrap receipt (~94 lines) |
| **Feedback** | — | **Absent** on client |
| **Adversarial inquiry** | — | **N/A** at minimal depth |

**Proof boundary:** `facilitator_session_reconstruction` — paths and tool names for future cohort compilation, not full chat transcripts.

**Facilitator verification artifacts (store):** [tied-project/working/FACILITATOR-AUDIT-BRIEF-1792861936/evidence/build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-AUDIT-BRIEF-1792861936/evidence/build-plan-verification-evidence.md)

---

## Session grading vs [TIED compact demo catalog](catalog-tied-compact-tools.md)

Separate dimension readout (not a collapsed score). Weights from catalog defaults; methodology learning band **N/A** — narrative only, no numeric composite.

| Dimension | Weight | Band | Rationale |
| --- | --- | --- | --- |
| Requirement interpretation | 15% | **A** | Custom intent mapped to read-only brief, explicit exit 0/1/2, `--quiet`, and audit-generation non-goals in PLAN + CITDP — aligns with **TIED-DEMO-23** artifact consumption without claiming runbook replay. |
| Traceability closure | 20% | **A** | Full R+A+I + sidecar; CITDP persisted with complete leap_feedback; facilitator `tied_validate_consistency` **`ok: true`**. Manifest **`commit: HEAD`** (stronger freshness than GF-04 cohort pattern). |
| Test strategy | 20% | **B+** | RED/green on node:test; live audit integration; **L0–L1** only. No mutation/L4+; honest for minimal meta-adjacent CLI. |
| Algorithm / implementation | 20% | **A−** | Nested `grammar_audit` / skipped layout handling; stable exit contract; formatter separated from CLI I/O. |
| Process adherence | 15% | **B+** | Build tracker + close_out + **`traceable-commit`**; envelope clean. Weaker than ideal Wave 5: **adherence not_run**; master checklist template not populated (split from build tracker). |
| Methodology learning readout | 10% | **N/A** | Not GF-19/20; no client **`methodology_improvement`** file to grade. |

**Catalog disposition note:** **TIED-DEMO-23** remains catalog **`runbook`** in the store doc; this client is the **first recorded custom greenfield instance** with **TIED-DEMO-23 lens** in the greenfield recorded-trials table — product feature extends the bootstrap artifact with a human brief layer.

**TIED 4.0.0:** Same bootstrap generation as [GF-04 @ 1792857852](trial-readout-PROMPT-GF-04-1792857852.md); linkage documents **cohort timing**, not proof that 4.0.0 improves outcomes.

---

## Cohort comparisons (facilitator)

| Peer | Compare on |
| --- | --- |
| **GF-04** ([readout](trial-readout-PROMPT-GF-04-1792857852.md)) | Both **TIED 4.0.0**. GF-04 **vocab/traceability-primary** (PROMPT-GF-04); this trial **meta-bootstrap-adjacent** with **stronger manifest commit pin** and **no** client methodology feedback. GF-04 **partial** process contract (tracker gate path drift); this subject **pass** on build tracker with **master template empty**. |
| **GF-25** ([readout](trial-readout-PROMPT-GF-25-1791754135.md)) | Both **minimal** depth, small CLI, **node** tests (not Vitest). GF-25 pure semver library; this trial **onboarding audit formatting** with SC-TFL line items. |
| **GF-11** ([readout](trial-readout-PROMPT-GF-11-1792344147.md)) | This run **richer** process artifacts (build tracker, close_out receipt, verification manifest) vs GF-11 **hollow** tracker; similar **adherence not_run** theme. |
| **GF-14** ([readout](trial-readout-PROMPT-GF-14-1792479171.md)) | Both strong gate trails; this run **CITDP leap_feedback complete** and **manifest HEAD** vs GF-14 **stale commit pin**; GF-14 lacked **`traceable-commit`** in `completed` at readout time. |
| **PROMPT-GF-05 (not used)** | Token auditor prompt **not** pasted — do not compare product behavior to **TIED-DEMO-05** token coverage auditor; Family B **process** weights only. |

---

## Facilitator follow-ups

| # | Action | Status (2026-10-24) |
| --- | --- | --- |
| 1 | Publish store trial readout + catalog rows | **Done** — this document |
| 2 | Run **`tied_adherence_reconcile_run`** with correct **`project_root`** on client | **Open** — sponsor/client |
| 3 | Populate or trim master **`checklist-tracker.yaml`** vs build tracker (hygiene) | **Open** — sponsor/client |
| 4 | Optional: add custom prompt text to greenfield catalog if sponsor wants numbered PROMPT-GF | **Open** — sponsor |

---

## Related

- [Greenfield prompt catalog](catalog-greenfield-plan-new-feature-prompts.md)
- [TIED compact demo tool catalog](catalog-tied-compact-tools.md) — TIED-DEMO-23
- Client PLAN: `/Users/fareed/Documents/dev/test/1792861936/tied-project/working/REQ-TIED_CLIENT_AUDIT_BRIEF/PLAN.md`
- Client working folder: `/Users/fareed/Documents/dev/test/1792861936/tied-project/working/REQ-TIED_CLIENT_AUDIT_BRIEF/`
- Store build-plan evidence: `/Users/fareed/Documents/dev/chatgpt/stdd/tied-project/working/FACILITATOR-AUDIT-BRIEF-1792861936/`
