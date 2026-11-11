# Plan: Reddit post — TIED vs waterfall/agile, application, and cohort size layers

**Slug:** `reddit-tied-cohort-methodology`  
**Track:** non-tied-plan → **non-tied-refine** (this revision) → `@non-tied-build` → optional `@non-tied-close`  
**Thread source:** Sponsor chat synthesizing methodology positioning, L1 application, predictable WF trials, and [comparison-table summary](../../non-tied-plans/project-size-batch-discover-compare/evidence/comparison-table.md) interpretation (aggregate only in post).

---

## Refined sponsor constraints (locked)

| Constraint | Value |
| --- | --- |
| Audience | Senior software engineers skeptical of methodology theater and agent hype |
| Tone | Direct, informative, structured; not cheerleading; not “you should adopt TIED” |
| Hook | **Combined:** philosophy (not waterfall/agile) → no-excuses L1 apply → repeatable trials + three size layers |
| Links | **One URL** in `REDDIT-POST.md` body: `https://github.com/fareedst/tied` |
| Optional | Second link allowed only in `REDDIT-COMMENT-SUMMARY.md` (e.g. size catalog path on same repo) |
| Length | Long form **≥ 2500 words** in `REDDIT-POST.md` |
| Evidence | **Aggregate cohort patterns only** — no per-row harness/model callouts, no leaderboard |
| Claims | Size table = **methodology fidelity structure**, not product quality or test pass/fail |

**Subreddit and posting account:** Out of scope; deliverable is markdown only.

---

## RESOLVE (Touchpoint 1)

| Sponsor term | Resolved meaning for this deliverable |
| --- | --- |
| **TIED** | Methodology: **Vocabulary** + **REQ** + **ARCH** + **IMPL** records, with step-wise implementation pseudo-code as logical contract; tests and code link back via stable ids — not a model or IDE product |
| **Waterfall / agile** | **Calendar/culture** labels; post contrasts them to **per-change resolver** (checklist + LEAP + test order), not as villains |
| **No excuses** | **L1:** one bounded change with falsifiable done (five yeses in post); no Scrum/SAFe sermon |
| **Predictable experimentation** | Disposable WF clients, fixed TS test stack, four-phase orchestration, **project-size snapshot** + batch comparison table — same column semantics every run |
| **Atoms / operational intent / proof facets** | Three **size layers** per [catalog-tied-size-and-trial-statistics.md](../../../docs/demos/catalog-tied-size-and-trial-statistics.md); **cross-layer** = proportionality ratios only |
| **Quality (in post)** | **Methodology fidelity** (artifact stack completeness), explicitly **not** correctness or REQ Implemented unless verify/readout cited (post does not cite specific trial grades) |
| **Cohort summary table** | Facilitator markdown from discover batch; **proof boundary:** descriptive evidence, not grades |

**Accepted ambiguity:** Whether sponsor later publishes to r/programming vs r/ExperiencedDevs — tone stays generic.

---

## Refinements applied (non-tied-refine, 2026-11-11)

1. **Single body link locked** to TIED store README entry point (`https://github.com/fareedst/tied`); size-layer detail deferred to comment summary or “Issues / docs” mention without second body URL.

2. **No Mermaid in `REDDIT-POST.md`.** One ASCII diagram max (optional): snapshot lanes **structure** vs **fidelity**.

3. **Opening voice sample** (build adapts):

   > This post is about a different axis than waterfall versus agile: how to run **one change** with written intent, tests in a fixed order, and repeatable trial snapshots — without claiming any model or harness “won.”

4. **Two-audience layering:** Bold one-line thesis under each `##`; tables for waterfall/agile/TIED and for three size layers.

5. **Honesty block (required):** **“What this write-up does not prove”** — **≥ 5 bullets** (snapshot ≠ pass, no leaderboard, structure ≠ correctness, one GitHub link ≠ production readiness, cohort ≠ universal agent truth, **no individual trial grades in post**).

6. **Allowed aggregate cohort fact (one sentence max):** Across a summarized disposable batch, **path-declared composition test cases were often zero** while **unit cases were common** — interpret as **facet-shape gap** in methodology footprint, not model ranking. Do not name wf-10 or Sonnet unless sponsor reopens constraint.

7. **Code in post:** At most **one** short illustrative pseudo-code fragment (generic PRE/POST style); no module dumps.

8. **Reddit formatting:** `##` / `###` only; `---` between major parts; max two-level lists.

9. **Differentiate from [reddit-wf03](../../non-tied-plans/reddit-wf03-tied-agentic-readout/REDDIT-POST.md):** WF-03 post = **one readout narrative**; this post = **methodology + measurement frame** with **no single trial protagonist**.

10. **`test-strategy.md`** written at refine (QA checklist for build/close).

---

## Deliverables

| File | Status |
| --- | --- |
| `PLAN.md` | This file |
| `test-strategy.md` | Done at refine |
| `JARGON-GLOSSARY.md` | Done |
| `REDDIT-POST.md` | Done (≥ 2500 words) |
| `TITLE-OPTIONS.md` | Done |
| `REDDIT-COMMENT-SUMMARY.md` | Done |
| `CITDP-reddit-tied-cohort-methodology.yaml` | Draft at refine |
| `evidence/session-handoff.md` | Plan execution steps |

**Out of scope:** Product code; project REQ/ARCH/IMPL YAML; mutating comparison-table or receipts.

---

## Post outline (`REDDIT-POST.md`)

### Part A — Context and thesis

1. What you are reading — operator/facilitator perspective; agent-era drift problem (inferred intent from diffs).
2. What this is not — replace engineers; benchmark win; methodology religion.

### Part B — Neither waterfall nor agile

1. False dichotomy (phase calendar vs **token-scoped change**).
2. Comparison table: unit of work, source of truth, when tests run, definition of done.
3. **TIED** in plain language: V+R+A+I, pseudo-code elevation, **LEAP** (one plain sentence).
4. Strategy demotion: checklist per change vs deck of practices.

### Part C — How to apply (L1, no excuses)

1. L0→L3 ladder (paragraph); **L1** = one REQ-scoped change this week.
2. ~8 numbered steps (change-definition → impact → R/A/I → gated pseudo-code → RED → composition → consistency close-out).
3. Short PR merge-reject rubric.
4. Reversible vs costly sponsor choices (one paragraph).

### Part D — Repeatable trials

1. Disposable client, fixed implementation stack, four phases (plain words).
2. **Two lanes:** size snapshot / batch table (**structure**) vs consistency, verify, readouts (**fidelity**).

### Part E — Three layers (read the summary table)

1. **Atoms** — agreement footprint.
2. **Operational intent** — applied pseudo-code mass.
3. **Proof facets** — unit / composition / E2E **case counts**.
4. **Cross-layer** — `oi/atom`, `pf/atom`; anti-pattern: high tests, zero intent on disk.
5. **`wall_clock`** — cost, not quality.
6. One allowed aggregate sentence on composition facet sparsity (see refinement 6).

### Part F — Close

1. Honesty block (≥ 5 bullets).
2. 7-day L1 challenge (3 sentences).
3. Single link: `https://github.com/fareedst/tied`

---

## Authoritative sources (build pre-read)

| Topic | Path |
| --- | --- |
| Size layers + proof boundary | `docs/demos/catalog-tied-size-and-trial-statistics.md` |
| Column definitions | `tied-project/non-tied-plans/project-size-batch-discover-compare/evidence/comparison-table.md` |
| Metrics registry | `tied-project/config/project-size-metrics.registry.yaml` |
| LEAP summary | `tied-bundle/docs/LEAP.md` |
| Checklist spine | `tied-bundle/docs/client-development-index.md` |
| Voice precedent | `tied-project/non-tied-plans/reddit-wf03-tied-agentic-readout/REDDIT-POST.md` |

---

## Handoff

Next: **`@non-tied-build`** — produce `JARGON-GLOSSARY.md`, `REDDIT-POST.md`, `TITLE-OPTIONS.md`, `REDDIT-COMMENT-SUMMARY.md`; self-check against `test-strategy.md`.
