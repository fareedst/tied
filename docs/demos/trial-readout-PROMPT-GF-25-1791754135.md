# Trial readout: PROMPT-GF-25 → client `1791754135`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-10-11 |
| **Touchpoint** | **build-plan** (facilitator grading) + **plan-close-out** (store readout) |
| **Trial prompt** | [PROMPT-GF-25](catalog-greenfield-plan-new-feature-prompts.md#prompt-gf-25) |
| **Catalog map** | GF-25 greenfield instance (Loop 1 TDD/composition); bootstrap via [TIED-DEMO-23](../pseudocode-new-client-tied-adherence-runbook.md) new-client runbook |
| **Exercise bridge** | Parse/range **executable_behavior** only (no catalog exercise ID primary) |
| **Client root** | `/Users/fareed/Documents/dev/test/1791754135` |
| **Product REQ** | `REQ-PKG_SEMVER_SATISFIES` (client `tied-project/`) |
| **Proof boundary (primary)** | `executable_behavior` — strict parse, compare, documented range subset + Vitest |
| **Proof boundary (secondary)** | `traceability_structure` — PKG R+A+I, minimal checklist, gates, envelope |
| **Outcome** | **Successful implementation and graded trial recorded** |

This page is **documentation-only** in the TIED store; it does not register catalog `[REQ-*]` tokens.

---

## Sponsor intent (PROMPT-GF-25)

Build one publishable library package in this repo (TypeScript or Python—pick one and stay consistent) with a clear public API, README usage section, and a single command to run all tests. Scope one feature only; no unrelated modules.

---

## RESOLVE (Touchpoint 1 recap)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| publishable library | TypeScript npm workspace **`semver-satisfies-lite`** with exports map | Client `packages/semver-satisfies/`; `ARCH-PKG_SEMVER_LAYOUT` |
| clear public API | `parseSemVer`, `compareSemVer`, `satisfies`, `SemVer` type at entry only | `REQ-PKG_SEMVER_SATISFIES` satisfaction_criteria; package-boundary test |
| README usage | Supported range subset table | `packages/semver-satisfies/README.md` |
| single test command | Root `npm test` | Captured stdout under client working evidence |
| one feature | Strict semver parse/compare/range subset; no CLI, no full SemVer 2.0 metadata | CITDP non_goals |

**Costly choices (consequence ladder):** Treating this disposable client as **methodology effectiveness** evidence → **costly** (needs cohort baseline, outcome observation, pairing disposition). Committing this readout in **stdd** → **reversible**.

---

## What was built (description)

- **Interface:** TypeScript ESM library `semver-satisfies-lite@1.0.0`, Vitest, no UI.
- **Behavior:** Strict `MAJOR.MINOR.PATCH` parse (`null` on invalid), tuple compare, `satisfies` for documented range forms (exact, `=`, comparators, caret, tilde, hyphen); unsupported `||`, wildcards, prerelease rejected in tests.
- **Modules:** Internal `parse-version`, `compare-version`, `parse-range`; public `index.ts` orchestration.
- **TIED stack (client):** `REQ-PKG_SEMVER_SATISFIES`, `ARCH-PKG_SEMVER_LAYOUT`, `IMPL-PKG_SEMVER_API` with grammar-v2 pseudo-code sidecar; CITDP `tied-project/citdp/CITDP-PKG_SEMVER_SATISFIES.yaml` (**minimal** / **advisory**); checklist tracker, verification + close_out gate receipts, request evidence envelope under `tied-project/working/REQ-PKG_SEMVER_SATISFIES/`.
- **Bootstrap:** Linked disposable client (`test-new-tied-client` pattern); git commits `25c6f5c` (TIED 3.0.0), `5bc4c74` (feature + close-out artifacts). Bootstrap audit **G4** with **`with_consistency: false`** at onboarding.
- **Verification (2026-10-11):** `npm test` — 10 tests, 4 files, all green (manifest + stdout). Facilitator `tied_validate_consistency` on client `tied-project/` — **`ok: true`** (session run; **not** persisted under client evidence).

---

## Outcome record

**Implementation outcome:** Successful. The client shipped the semver library, README range contract, module-level Vitest coverage, and a **minimal-depth** TIED working folder for `REQ-PKG_SEMVER_SATISFIES`.

**Grading outcome:** Dimensioned readout — Requirement interpretation **A**, Traceability closure **B+**, Test strategy **B**, Algorithm / implementation **A−**, Process adherence **B−**, Methodology learning readout **N/A**. These bands describe this session and its proof boundaries; they are not a universal score or a methodology-effectiveness result.

**GF-01 cohort extras:** This trial did **not** add `feedback.yaml` or `trial-prompt-interaction-inventory.v1.json`.

**Future-test rule:** A single successful trial must not be treated as evidence of methodology effectiveness; cohort claims need baseline, outcome observation, and pairing disposition.

---

## TIED db capture (client project database)

| Artifact | Location | Role |
| --- | --- | --- |
| **REQ / ARCH / IMPL** | `tied-project/requirements/REQ-PKG_SEMVER_SATISFIES.yaml`, matching ARCH/IMPL paths | PKG traceability stack |
| **CITDP** | `tied-project/citdp/CITDP-PKG_SEMVER_SATISFIES.yaml` | minimal depth, advisory gate policy, composition N/A |
| **Request envelope** | `tied-project/working/REQ-PKG_SEMVER_SATISFIES/evidence/request-evidence-envelope.v1.json` | `gaps: []`; N/A adversarial receipt backfilled |
| **Verification manifest** | `.../evidence/verification-evidence-manifest.v1.json` | npm test evidence (**note:** manifest `commit` pins bootstrap SHA `25c6f5c`) |
| **Gate receipts** | `.../gates/verification-*.json`, `.../gates/close_out-*.json` | **No** `pre_implementation` receipt file in `gates/` |
| **Bootstrap audit** | `tied-project/working/tied-new-client-audit.v1.json` | G4 linked install; consistency skipped at bootstrap |
| **Test stdout** | `.../evidence/npm-test-root/npm-test-root.stdout.txt` | 10/10 passed |
| **Adherence events** | `.../evidence/agent-adherence-event.v1.jsonl` | Thin ledger; commit notes reconcile **not_run** |

**Proof boundary:** `facilitator_session_reconstruction` — paths and tool names for future cohort compilation, not full chat transcripts.

---

## Session grading vs [TIED compact demo catalog](catalog-tied-compact-tools.md)

Separate dimension readout (not a collapsed score). Weights from catalog defaults.

| Dimension | Weight | Band | Rationale |
| --- | --- | --- | --- |
| Requirement interpretation | 15% | **A** | PROMPT-GF-25 maps to REQ satisfaction criteria, README range table, and CITDP non-goals (single package, no full SemVer 2.0). |
| Traceability closure | 20% | **B+** | Grammar-v2 pseudo-code with block leads; token comments in entry + tests; PKG detail files present. Gaps: bootstrap skipped consistency; no client-persisted validate summary; manifest commit SHA vs feature commit. |
| Test strategy | 20% | **B** | Four test files, 10 cases; **L0–L1** parse/range boundaries; composition N/A per CITDP. No mutation, reference oracle, or L3+ faults. |
| Algorithm / implementation | 20% | **A−** | Strict parse, caret zero rules, hyphen reversed-bounds false; internal module boundaries match ARCH. Residual: limited comparator edge coverage in tests. |
| Process adherence | 15% | **B−** | Minimal tracker, verification + close_out gates allowed, envelope without blocking gaps. Missing pre_implementation receipt; adherence reconcile not_run per feature commit message. |
| Methodology learning readout | 10% | **N/A** | Loop 3 not in scope for PROMPT-GF-25. |

**Catalog disposition note:** No dedicated **TIED-DEMO-NN** row for GF-25; this client is a **built instance** of **PROMPT-GF-25** with **TIED-DEMO-23** bootstrap signal.

**Exercise catalog lens ([§9 three-pass model](catalog-compact-programming-exercises.md#9-a-more-revealing-grading-experiment)):** Pass 1 (design) — IMPL sidecar contracts; Pass 2 (tests vs defects) — no mutation harness; Pass 3 (hidden disturbances) — not run.

**Disturbance ladder used:** **L0** (nominal parse, caret/tilde/hyphen happy paths), **L1** (empty/whitespace, leading zeros, bad segments, unsupported `||`/`*`, reversed hyphen). Not L3–L6.

**GF-02 comparison (facilitator):** GF-25 shows **lower process depth** (minimal CITDP, no integrated inquiry artifacts, no pre_implementation gate file) versus GF-02’s integrated folder; **similar** test disturbance cap (**L0–L1**). Product scope is narrower (pure local semver vs config merge).

---

## Facilitator follow-ups

| # | Action | Status (2026-10-11) |
| --- | --- | --- |
| 1 | Persist `tied_validate_consistency` summary on client | **Open** — facilitator run `ok: true`, not written to client tree |
| 2 | Capture **pre_implementation** gate receipt | **Open** — if promoting process band |
| 3 | Run **`tied_adherence_reconcile_run`** | **Open** — feature commit notes **not_run** |
| 4 | Re-collect verification manifest at feature SHA `5bc4c74` | **Open** |
| 5 | L2+ parse/range disturbances or mutation testing | **Open** — separate session |
| 6 | Store readout committed in **stdd** | **Done** — this page (plan-close-out) |

---

## Deferred (separate trial)

- **PROMPT-GF-19** / **PROMPT-GF-20** — Kaizen / methodology learning on a fresh client when Loop 2–3 is in scope.
- Integrated-depth greenfield (compare process bands to GF-02) — **new** disposable client recommended.

---

## Related

- [Greenfield prompt catalog](catalog-greenfield-plan-new-feature-prompts.md)
- [TIED compact demo tool catalog](catalog-tied-compact-tools.md)
- [Agent resilience exercise catalog](catalog-compact-programming-exercises.md)
- Client product README: `/Users/fareed/Documents/dev/test/1791754135/packages/semver-satisfies/README.md`
