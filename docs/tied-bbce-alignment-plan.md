# TIED Behavior-Bounded Change Engineering Alignment Plan

**Status:** **Program closed (2026-09-27)** — W0–W4 executed at integrated/advisory pilot; traceable-commit `21ff5d4`; plan-close-out evidence `working/PLAN-TIED-BBCE-ALIGNMENT/evidence/close-out-gates-2026-09-27.json` (close_out gate allowed; envelope waiver). Strict/blocking enforcement and canonical `tied/citdp/` persistence remain deferred.

**Change ID:** `PLAN-TIED-BBCE-ALIGNMENT`

**Priority:** P1 (methodology integration — optional, change-locality discipline on TIED-specified codebases)

**Owner:** Canonical TIED source repository (`stdd`)

**Scope:** Methodology and planning — how TIED may integrate **Behavior-Bounded Change Engineering (BBCE)** as an optional **change-footprint and slice-ownership workflow** that feeds the canonical vocabulary → REQ → ARCH → IMPL → tests → code → quality evidence → LEAP chain. This is **not** a replacement for REQ authority and **not** a mandate for vertical-slice repository layout.

**Planning-artifact disclaimer:** W0 does **not** create project REQ/ARCH/IMPL tokens, does **not** change checklist gate behavior, and does **not** implement plumb audit schema v2 or new MCP tools. Each behavior-changing batch (W2+) must establish traceability before gate behavior changes.

**Related work:**

- [BBCE and TIED — tracked excerpt](bbce-and-tied-excerpt.md) — git-tracked summary; full synthesis local at `docs/comparisons/tied-vs-behavior-bounded-change-engineering.md` (gitignored)
- [bbce-mechanisms-for-tied-improvement.md](comparisons/bbce-mechanisms-for-tied-improvement.md) — Current/Partial/Gap + mechanisms A–D
- [Behavior-Bounded-Change-Engineering-BBCE.md](methodologies/Behavior-Bounded-Change-Engineering-BBCE.md) — in-repo BBCE source
- [tied/vocab/behavior-bounded-change-engineering.md](../tied/vocab/behavior-bounded-change-engineering.md) — provisional glossary (routing **5i**)
- [tied-residuality-analysis-plan.md](tied-residuality-analysis-plan.md) — wave/gate structure exemplar; residuality = stressor discovery vs BBCE = change locality
- **Working CITDP:** `working/PLAN-TIED-BBCE-ALIGNMENT/CITDP-PLAN-TIED-BBCE-ALIGNMENT.yaml`
- **Linked Cursor plan:** `bbce_to_tied_alignment_df9407d6.plan.md`

---

## 0. Refine outcomes

### Resolved sponsor terms

See linked Cursor plan §0 and `tied/vocab/behavior-bounded-change-engineering.md` — **behavioral slice**, **owning slice**, **public behavioral boundary**, **declared change surface**, **change locality**, **blast radius**, **boundary crossing**, **shared mechanism**, **agent context locality**.

### Authority integration (non-negotiable)

```text
BBCE LOCALITY LOOP (proposed)              TIED INTENT AND EVIDENCE LOOP (canonical)
identify behavior + owning slice           vocabulary → REQ → ARCH → IMPL
declare expected change surface            tests (unit → composition → justified E2E)
minimal sufficient context (PRELOAD)       quality evidence + proof boundaries
implement preferring local additive code   LEAP on confirmed divergence
compare planned vs actual diff footprint   verification-gate + plumb audit (optional)
record locality / blast-radius metrics     CITDP + working evidence until promoted
```

### Critical contrasts (do not conflate)

| BBCE term | TIED term | Distinction |
| --- | --- | --- |
| behavioral slice | module (`[REQ-MODULE_VALIDATION]`) | Module = validation boundary; slice = change-ownership (often REQ-scoped) |
| behavioral boundary test | composition test | Composition = binding; behavioral adds boundary stack — often integration |
| blast radius | impact-discovery | Pre-change inventory vs post-change propagation metric |
| change locality | plumb diff impact preview | Preview = tokens in diff; locality = declared surface + slice classification |
| boundary violation | traceability gap | Cross-slice undeclared edit vs missing token comments |

### Accepted open items

1. Slice encoding — **W1 pilot:** working-folder `pilot/slice-map.yaml`; **recommend W2:** repo `tied/analysis/` slice map + CITDP declared surface refs (see `working/PLAN-TIED-BBCE-ALIGNMENT/pilot/limitations.md`).
2. Longitudinal JSONL — **W1 spike:** `working/.../change-locality/pilot-metrics.jsonl`; **recommend W2:** dual-write optional `locality_summary_ref` on plumb-audit v2 (do not overload v1).
3. Boundary rules: **W4 decision** — STDD keeps `tied/analysis/agentstream-slice-map.yaml` as **reference pilot**; clients **opt in** with project-owned `tied/analysis/*-slice-map.yaml` (no vertical-slice folder mandate).
4. BBCE has no external bibliography in source; treat as **proposed in-repo methodology** until sponsor adds provenance.

### Vocabulary RECORD/VALIDATE status

- **RECORD (W0):** `tied/vocab/behavior-bounded-change-engineering.md` + routing **5i**.
- **VALIDATE:** At sponsor `traceable-commit`; forbid conflating slice with module in glossary and docs.

### Adversarial inquiry (W0)

- **depth_tier:** `minimal` → `sub-adversarial-inquiry-pass`: **not_applicable**
- **gate_policy:** `advisory`
- W1+ mechanism batches re-select `integrated` when persistence or gates change.

---

## 1. Executive summary and dual-loop problem statement

TIED enforces **traceable intent** and **proof** through semantic tokens, IMPL pseudo-code, module validation, UI-free composition tests, scoped analysis, plumb impact preview, checklist gates, and quality evidence. BBCE addresses a complementary question: **does ordinary feature work stay local to the owning behavioral unit**, and is that locality **declared before** and **measured after** implementation?

The integration proposal is a **dual loop**:

```text
domain vocabulary (shared)
  ┌─────────────────────────────┐     ┌──────────────────────────────┐
  │ BBCE locality loop          │     │ TIED intent & evidence loop  │
  │ (optional, footprint pass)  │────▶│ (canonical)                  │
  └─────────────────────────────┘     └──────────────────────────────┘
         measures / constrains                 owns / proves
```

**Core boundary sentence:** BBCE **measures and constrains** change spread; TIED **owns**, formalizes, implements, and **proves** behavior only through the REQ stack and evidenced tests.

**Default recommendation (pre-pilot):** **Adopt (revise)** — optional declared surface + locality metrics feeding existing gates; **do not** mandate vertical-slice directories or treat `change_locality → 1.0` as correctness.

---

## 2. Goals and non-goals

### Goals

- Document principle-by-principle BBCE↔TIED mapping with disposition matrix (G/D/N/O).
- Specify mechanisms **A–D** with proof boundaries and W1–W4 authorization boundaries.
- Seed provisional vocabulary and routing without new REQ tokens in W0.
- Align with `[PROC-VOCABULARY_INDEX]`, `[PROC-CITDP]`, and existing plumb/DAE programs without duplicating gate receipts.

### Non-goals (W0 and guardrails)

- Implementing mechanisms A–D (MCP, checklist behavior, plumb schema v2).
- W1 pilot metrics inside W0 doc batch.
- Mandating folder-per-slice layout.
- Claiming BBCE metrics prove behavioral correctness.
- Editing `tied/methodology/` for client convenience.

---

## 3. Current state audit (post–W0 Batch A)

### What exists after W0 build-plan

- **Full comparison:** `docs/comparisons/tied-vs-behavior-bounded-change-engineering.md` (gitignored).
- **Mechanisms guide:** `docs/comparisons/bbce-mechanisms-for-tied-improvement.md` (gitignored).
- **This feature plan** and **tracked excerpt** `docs/bbce-and-tied-excerpt.md`.
- **Provisional vocabulary:** `tied/vocab/behavior-bounded-change-engineering.md` + routing **5i**.
- **Working CITDP:** `working/PLAN-TIED-BBCE-ALIGNMENT/CITDP-PLAN-TIED-BBCE-ALIGNMENT.yaml`.

### Gaps vs desired hooks (post–W3)

- Optional `declared_change_surface` on checklist/CITDP — **shipped W2** (advisory); hard gate **out of scope W4 default**.
- Advisory locality in plumb audit v2 when `PLUMB_AUDIT_LOCALITY=1` (Mechanism **A**, W2) — operator path documented in W4 build-plan.
- `sub-shared-code-change-justification-pass` + B module — **W3 pilot** (advisory).
- `bbce-boundary-violation-report` — **W3 pilot** (advisory).
- Mechanism **D** bundled verification pass — **W4 build-plan shipped** (`sub-bbce-advisory-verification-pass`, Tracker `bbce_advisory_enforced`, advisory only).

---

## 4. Proposed waves (W0–W4)

| Wave | Goal | Depth | Authorization |
| --- | --- | --- | --- |
| **W0** | Comparison + feature plan + vocab + excerpt + working CITDP | minimal | **Batch A build-plan (2026-09-27)** |
| **W1** | Pilot locality metrics on agentstream bindings | integrated | Separate build-plan |
| **W2** | Mechanism A checklist + plumb audit schema spike | integrated | Separate build-plan; may need REQ if gate behavior changes |
| **W3** | Mechanisms B + C tooling/checklist (advisory pilot) | integrated | **Executed 2026-09-27** — see `evidence/build-plan-w3-outcomes-2026-09-27.md` |
| **W4** | Mechanism D promotion — checklist hook, merged CITDP attach, optional ARCH snippet | **integrated** (build-plan) | **Executed 2026-09-27** (verification receipt in working folder) |

### W0 — Documentation and vocabulary (executed)

- **Entry:** Refine-plan + `pre_implementation` allowed at minimal/advisory.
- **Deliverables:** Comparison, mechanisms doc, this plan, excerpt, vocab **5i**, updated working CITDP and gate receipts.
- **Exit evidence:** Files on disk; `tied_validate_consistency` pass; verification + close_out gates at minimal/advisory; **no git commit** unless sponsor requests.
- **TIED loop handoff:** Vocabulary only — no REQ/ARCH/IMPL writes.

### W1 — Pilot metrics (executed 2026-09-27)

- **Target:** Composition bindings in `tied/docs/composition-coverage.md` for `@tied/agentstream`.
- **Deliverables:** `mcp-server/src/analysis/change-locality-pilot.ts`, `working/PLAN-TIED-BBCE-ALIGNMENT/pilot/*`, `locality-run.json` (git replay scenarios).
- **Exit evidence:** Unit tests pass; integrated adversarial inquiry + verification gates at advisory; slice/JSONL recommendations in `pilot/limitations.md`.
- **Proof boundary:** Metrics only — not REQ satisfaction.

### W2 — Declared surface + plumb extension (executed 2026-09-27)

- Repo `tied/analysis/agentstream-slice-map.yaml` + README maintenance rule.
- `bbce-schemas` validators; checklist optional `declared_change_surface`; proposed CITDP attach under `w2-promotion/`.
- Plumb audit `plumb-audit-gate-log.v2` + `bbce-locality-event.v1` JSONL spike (default off; advisory).
- W1 scenarios re-run with repo slice map (`pilot/w2-locality-run.json`); integrated adversarial inquiry at advisory policy.

### W3 — Shared-code + boundary tooling (executed 2026-09-27)

**Goal:** Mechanisms **B** + **C** at **advisory** pilot — no CI hard fail, no auto-block LEAP.

**Build evidence:** `working/PLAN-TIED-BBCE-ALIGNMENT/evidence/build-plan-w3-outcomes-2026-09-27.md`; pilot JSON `pilot/w3-shared-code-justification.json`, `pilot/w3-boundary-violation-report.json`; runner `pilot/run-w3-bc-pilot.mjs`.

| Mechanism | Checklist / module | Output |
| --- | --- | --- |
| **B** | `sub-shared-code-change-justification-pass` | Working-folder `bbce-shared-code-justification.v1`; CITDP `shared_code_justification_ref` |
| **C** | Analysis module `bbce-boundary-violation-report` | `bbce-boundary-violation.v1` distinct from traceability gaps |

**Triggers (B):** `shared_mechanism_globs`; path outside declared surface; path outside IMPL `code_locations` for touched tokens.

**Inputs (C):** `tied/analysis/*.yaml` slice map, git diff paths, optional import heuristics (later).

**False-positive policy:** `working/PLAN-TIED-BBCE-ALIGNMENT/w3-refine/false-positive-policy.md` (tests, `paths.ts`, monorepo roots).

**Pilot dry-run:** Agentstream slice map + diff scenario touching `mcp-server/packages/agentstream/src/paths.ts`.

**depth_tier:** `integrated` · **gate_policy:** `advisory` (strict only after sponsor escalation post-calibration).

**Refine evidence:** `working/PLAN-TIED-BBCE-ALIGNMENT/evidence/refine-plan-w3-outcomes-2026-09-27.md`.

**REQ:** None for default W3 build-plan path (analysis + checklist docs only).

### W4 — Mechanism D promotion (executed 2026-09-27)

**Goal:** Promote advisory BBCE bundle to **named** checklist verification CALLs when sponsor sets **`bbce_advisory_enforced: true`** — still **not** CI hard fail unless separate REQ authorizes blocking.

**Refine deliverables:** `working/PLAN-TIED-BBCE-ALIGNMENT/w4-refine/` (promotion decisions, proposed sub-procedure, merged CITDP attach, ARCH template proposal).

**Sponsor promotion gate (summary):** W1 **0.60** locality baseline recorded; W3 false-positive policy reviewed against paths.ts dry-run; B/C pilot JSON validates; falsification questions dispositioned; authority boundary confirmed; no `tied/methodology/` edits.

**Tracker flag semantics:** `bbce_advisory_enforced: true` → at **verification-gate**, CALL declared-surface validate, locality compare (default off env), `sub-shared-code-change-justification-pass`, `bbce-boundary-violation-report`; attach refs on `risk_analysis.bbce_alignment`.

**Slice map:** STDD reference pilot only; client opt-in pattern in `tied/analysis/README.md` (build-plan).

**JSONL:** Document pilot path `working/{CHANGE-ID}/change-locality/` and optional `plumb-audit/audit-log.jsonl` v2 — remain optional; no CI mandate.

**depth_tier (build-plan):** `integrated` · **gate_policy:** `advisory` · **REQ:** none for default path.

**Build-plan evidence:** `evidence/build-plan-w4-outcomes-2026-09-27.md` · CITDP status `w4_promotion_complete`.

**Program close-out:** W4 build-plan verification receipt + updated docs; machine PLAN envelope sync **deferred** (same as W0–W3).

---

## 5. Mechanisms summary (reference)

See [bbce-mechanisms-for-tied-improvement.md](comparisons/bbce-mechanisms-for-tied-improvement.md):

| ID | Name | Waves |
| --- | --- | --- |
| **A** | Declared change surface + locality metrics | W1–W2 |
| **B** | Shared-code change justification | W2–W3 |
| **C** | Boundary violation detection | W3 |
| **D** | Advisory slice vocabulary (+ optional promotion) | W0 vocab; W4 process |

---

## 6. CITDP integration outline

### Now (working record)

- `working/PLAN-TIED-BBCE-ALIGNMENT/CITDP-PLAN-TIED-BBCE-ALIGNMENT.yaml` with `risk_analysis.bbce_alignment.applied: planned`.
- Canonical `tied/citdp/` persistence deferred until behavior-changing batch.

### Future attach field (candidate — not canonical in W0)

```yaml
# Candidate only — promotion after W2+ evidence
risk_analysis:
  bbce_alignment:
    applied: true|false|not_applicable
    declared_change_surface_ref: working/.../declared-change-surface.yaml
    locality_evidence_ref: working/.../locality-run.json
    proof_boundary: "Locality proves diff-scope discipline, not runtime behavior."
```

---

## 7. Gate status and depth policy

| Phase | W0 Batch A |
| --- | --- |
| **depth_tier** | `minimal` |
| **gate_policy** | `advisory` |
| **pre_implementation** | Allowed at refine-plan — receipt under `working/PLAN-TIED-BBCE-ALIGNMENT/gates/` |
| **verification** | Required at build-plan close — sparse tracker `gate-tracker-verification.yaml` |
| **close_out** | Required at minimal depth; machine envelope sync **deferred** (doc-only batch) |
| **tied_validate_consistency** | Required after vocab/routing edits |

**Tracker paths:**

- Pre-implementation (refine): `gate-tracker-pre-implementation.yaml`
- Verification (build-plan): `gate-tracker-verification.yaml`

---

## 8. Relationship to Residuality and DAE

| Program | BBCE overlap | Rule |
| --- | --- | --- |
| `PLAN-TIED-RESIDUALITY-ANALYSIS` | Both ask what survives vs where change stays local | Separate CITDP attach fields; optional both on stateful-reliability profile |
| `[REQ-TIED_DAE_INCORPORATION]` | Plumb audit / change-risk | Extend JSONL with locality; do not duplicate envelope receipts |
| Jev coprocessor | Agent context locality | W3+ shadow metrics only |

---

## 9. Recommendation and sponsor next steps

**Adopt (revise)** — optional BBCE advisory bundle at verification when `bbce_advisory_enforced: true`; proof boundary unchanged (locality/B/C records ≠ REQ satisfaction).

**Program status (2026-09-27):** W0–W4 **executed** and **committed** (`21ff5d4`); plan-close-out complete with advisory `close_out` allowed and envelope waiver (`evidence/close-out-gates-2026-09-27.json`). Latest linked-plan reconcile: `working/PLAN-TIED-BBCE-ALIGNMENT/evidence/refine-plan-bbce-reconciliation-2026-09-27.md`.

**Sponsor actions (post-close-out):**

1. **Push** `main` when ready (ahead of origin); no pending program commit.
2. **Future backlog (separate authorization):** draft **REQ for optional BBCE strict enforcement** (blocking locality/CI — sponsor backlog 2026-09-27); MCP B/C wrapper; Jev/agent context locality; esbuild tests in default npm test; strict CI on locality.
3. **Advisory bundle (approved, rule B):** Default **`bbce_advisory_enforced: true`** when the change adds a new REQ or updates any ARCH detail; default **`false`** for existing-REQ bug fixes with no ARCH changes. Canonical attach: `tied/citdp/CITDP-PLAN-TIED-BBCE-ALIGNMENT.yaml`. ARCH help: template + `tied/docs/arch-bbce-slice-ownership-guide.md`.
4. **Git:** Sponsor held push (2026-09-27) until evidence paths reviewed; then push when ready.

**Do not:** treat advisory hooks as blocking gates; mandate vertical-slice folders; commit gitignored full comparison synthesis without sponsor intent.

---

## 10. W0 exit checklist

- [x] `docs/comparisons/tied-vs-behavior-bounded-change-engineering.md`
- [x] `docs/comparisons/bbce-mechanisms-for-tied-improvement.md`
- [x] `docs/tied-bbce-alignment-plan.md`
- [x] `docs/bbce-and-tied-excerpt.md`
- [x] `tied/vocab/behavior-bounded-change-engineering.md` + routing **5i**
- [x] Working CITDP updated; gate receipts for verification (+ close_out at minimal)
- [x] `tied_validate_consistency` pass (record in build-plan handoff)

**Machine PLAN close-out:** Completed 2026-09-27 — `gate-tracker-close-out.yaml`; envelope validate waived per `evidence/request-evidence-envelope-waiver.v1.json` (PLAN-* schema class).
