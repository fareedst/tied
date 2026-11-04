# Plan: Reddit post — TIED and WF-03 trial readout

**Slug:** `reddit-wf03-tied-agentic-readout`  
**Track:** non-tied-plan → **non-tied-refine** (this revision) → `@non-tied-build` → optional `@non-tied-close`  
**Source readout:** `docs/demos/trial-readout-PROMPT-WF-03-composer25-1793820250-wf-agentstream-wf-03-cursor-composer25.md`

---

## Refined sponsor constraints (locked)

| Constraint | Value |
| --- | --- |
| Audience | Software engineers interested in agentic coding, not yet convinced |
| Tone | Direct, informative, structured, spaced; not social, not inquisitive, not cheerleading |
| Links | **None** in published body (no URLs, no repo links) |
| Length | Long form **≥ 2500 words** |
| Claims | Session readout only; no methodology effectiveness, no model leaderboard |

---

## RESOLVE (Touchpoint 1)

| Sponsor term | Resolved meaning for this deliverable |
| --- | --- |
| **TIED** | Name of a methodology: parallel **requirements → architecture → implementation** records (with step-wise pseudo-code), stable IDs, tests/code comments that point back — not a model or IDE product |
| **Readout** | Facilitator-written summary of one controlled trial; grades are **this session only** |
| **Executable result** | Runnable TypeScript modules + passing automated test; not a deployed service |
| **TIED representation** | Everything in the disposable project repo besides (and including metadata around) the executable: YAML decision records, plan, glossary, gate JSON, evidence envelope, orchestrator logs, interaction inventory |
| **Agentic development** | Here: **four separate agent sessions** driven by an external script, each running a fixed phase skill — continuity via git + files, not one long chat |

**Accepted ambiguity:** Reddit subreddit and posting account are out of scope; deliverable is markdown only.

---

## Refinements applied (non-tied-refine)

1. **No Mermaid in `REDDIT-POST.md`.** Many Reddit clients strip or break diagrams. Use a **numbered four-phase list** and one **ASCII timeline** instead (build step).

2. **Opening voice sample** (build should adapt, not paste blindly):

   > This post summarizes one documented agent run: a small TypeScript feature built under a four-phase workflow with written requirements, design records, and machine-checked “done” gates. It is facilitator documentation from a methodology trial, not a benchmark win or a pitch to replace engineers.

3. **TIED naming:** Introduce **TIED** as a proper name on first use; optional parenthetical once: “structured requirements, architecture, and implementation records kept in sync with code.” Do **not** lead with acronyms or tool names (MCP, YAML paths as hype).

4. **Two-audience layering:**  
   - **Skimmers:** bold one-line thesis under each `##` heading.  
   - **Readers:** body paragraphs + tables below.

5. **Honesty block (required):** Dedicated subsection **“What this single run does not prove”** with ≥ 4 bullets from readout (one trial, reconcile not run, adherence tooling gap, cohort not ranked).

6. **Optional derivative:** `REDDIT-COMMENT-SUMMARY.md` (~400 words) for a top comment or cross-post teaser — same constraints (no links).

7. **Code in post:** At most **one** short illustrative pseudo-code block (push delivery via `emit` → consumer `receive`); no full module listings.

8. **Reddit formatting:** Use `##` / `###` only; horizontal rules `---` between major parts; avoid nested lists deeper than two levels.

---

## Deliverables

| File | Status |
| --- | --- |
| `PLAN.md` | This file |
| `JARGON-GLOSSARY.md` | Writer aid |
| `test-strategy.md` | QA checklist for build |
| `REDDIT-POST.md` | **@non-tied-build** |
| `TITLE-OPTIONS.md` | **@non-tied-build** |
| `REDDIT-COMMENT-SUMMARY.md` | **@non-tied-build** (optional but recommended) |
| `CITDP-reddit-wf03-tied-agentic-readout.yaml` | Optional; `tied_tokens_new: []` |

---

## Post outline (`REDDIT-POST.md`)

### Part A — Context

1. **What you are reading** — facilitator readout; disposable trial repo; Composer 2.5 via Cursor orchestration (~13 min, four sessions).
2. **What this is not** — replacement for engineers; proof TIED “works everywhere”; model superiority.

### Part B — The experiment

3. **The task (WF-03)** — producer, consumer, wiring, composition test, no GUI; why “composition seam” matters in real systems.
4. **The executable outcome** — three modules, one test, `npm test` pass on facilitator re-run; no CLI; git had no `src/` until the feature commit; RED failure output archived before green.

### Part C — Process

5. **Four phases in plain language** — Define (docs only) → Refine (terms + gates) → Build (RED then GREEN) → Close-out (envelope, commit). Include ASCII:

   ```text
   [Session 1: Define]     → REQ/ARCH/IMPL, plan — no src/
   [Session 2: Refine]     → glossary locked, pre-build gates (some churn)
   [Session 3: Build]      → failing test logged, then modules, verification gate
   [Session 4: Close-out]  → evidence pack, close gate, one traceable commit
   ```

6. **Friction worth reporting** — seven pre-implementation gate receipts; fresh session each turn; evidence SHA updated after commit (disclosed); adherence reconcile skipped (tooling).

### Part D — Beyond the executable

7. **What lived in the project besides code** — table by purpose (intent, design, language, process, audit, analysis); contrast “tests pass” vs “tests pass + requirement marked implemented + consistency check ok”.

8. **Behavior without the repo** — push delivery: producer `emit` synchronously delivers to wired consumer; test asserts message received without starting UI.

### Part E — Epistemology for skeptics

9. **What the readout supports (narrow)** — phase boundaries observable; traceability graded A; RED artifact kept.

10. **What it does not prove** — see refinement #5.

11. **Session grades (not a scoreboard)** — one sentence per dimension band from readout; note B+ on process (reconcile not run, evidence drift).

12. **Peer context, no ranking** — other WF-03 cells differ (incomplete close-out, no RED log, etc.); comparisons are experimental notes.

### Part F — Close

13. **Practical takeaways** — artifact boundaries; phased work; bundle vs diff; replicate before believing.

14. **Disclaimer** — TIED 4.0.0 dogfood; store documentation; not a catalog requirement token.

Optional footer: **Terms** — 6–8 lines from jargon glossary.

---

## Build handoff checklist

- [x] `REDDIT-POST.md` ≥ 2500 words; no URLs
- [x] No Mermaid; ASCII timeline present
- [x] ≥ 2 limitation paragraphs under “does not prove”
- [x] No CTA to adopt TIED
- [x] `TITLE-OPTIONS.md`: 3–5 neutral titles
- [x] `REDDIT-COMMENT-SUMMARY.md`
- [ ] Run checks in `test-strategy.md` (manual pass at publish time)

**Next step:** `@non-tied-close` if sponsor wants git commit
