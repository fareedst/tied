# Sponsor lens — WF-09 composition vs unit-only trials

**Context:** Six Claude WF-09 runs were already published via `@record-wf-trial` (readouts + registry). Test strategy bands are mostly **B** / **B−** / **C+** with rationales citing **`composition_tests: 0`**.

This document explains **which interpretive lens** to treat as **primary** when reading [composition-subcheck-grading.md](./composition-subcheck-grading.md) and the cohort question: *Is unit-only OK because of the chosen architecture?*

---

## Lens A — WF-09…12 facilitator contract (composition cohort)

**Question it answers:** Did the agent produce **evidence of module binding** expected for prompts 09–12?

**Rules:**

- Catalog [Composition contract](../../../docs/demos/catalog-traditional-workflow-trial-prompts.md#composition-contract-normative-for-prompts-09-12): unit tests per module **plus** at least one binding test; god-module unit-only is **insufficient**.
- Goal-first paste does not tell agents to split modules; **grading** still uses PLAN + test files ([REQ-WF_TRIAL_COMPOSITION_GOAL_PROMPTS](../../../tied-project/requirements/REQ-WF_TRIAL_COMPOSITION_GOAL_PROMPTS.yaml)).

**Verdict for this batch:** **Composition evidence = Fail (6/6).** Product can be correct; **cohort rubric** is not met. Matches existing readout Test strategy **B** style (not **A**).

**Use when:** Comparing models/harnesses on whether **traditional four-phase + TIED** yields layered tests **without** architect-in-paste.

---

## Lens B — Product / executable behavior

**Question it answers:** Is the **ordered concurrent map** correctly tested for sponsor-visible behavior?

**Rules:**

- Monolithic `src/*.ts` is a valid architecture for this problem.
- [PROC-TIED_DEV_CYCLE](../../../tied-bundle/docs/processes.md): composition tests apply to **bindings between units** — if PLAN commits to one module, no binding ⇒ no mandatory composition tranche.
- Mock-timer tests that prove completion order ≠ output order satisfy the **paste** (“deterministic delays”, ordered results).

**Verdict for this batch:** **Pass** on behavior; **Composition evidence sub-check N/A** under this lens (or explicit **Pass** if you map “composition” only to inter-module wiring).

**Use when:** Reporting “did the library work?” not “did the composition experiment succeed?”

---

## Lens C — TIED-DEMO-10 / CON-03 (GF-10 reference)

**Question it answers:** Does the build resemble the **ordering-seam** reference demo?

**Rules:**

- [TIED-DEMO-10](../../../docs/demos/catalog-tied-compact-tools.md): “Composition test for ordering seam.”
- [GF-10 readout](../../../docs/demos/trial-readout-PROMPT-GF-10-1792950723-gf-10.md): separate **parallel dispatch** vs **index buffer** modules; **integration** tests for completion reorder + peak concurrency.

**Verdict for this batch:** **Fail (6/6)** — no multi-module seam, no integration/binding test file named in PLAN. Unit tests may replicate GF-10 *assertions* inside one module.

**Use when:** Aligning traditional WF-09 with greenfield **PROMPT-GF-10** / CON-03 expectations.

---

## How the three lenses relate (same facts, different “OK”)

| Lens | Monolithic + strong unit tests | Typical Test strategy under that lens |
| --- | --- | --- |
| **A — WF cohort** | Not OK for composition sub-check | **B** range (what readouts already use) |
| **B — Product** | OK | **A** possible on tests alone |
| **C — CON-03 / GF-10** | Not OK vs reference seam | **B** or lower (same as A in practice here) |

**@record-wf-trial implicit choice:** Lens **A** (and **C**) — readouts penalize missing composition facet while crediting unit coverage.

---

## Sponsor decision (record here after choice)

| Field | Value |
| --- | --- |
| **Primary lens** | **A — WF-09…12 facilitator contract** (`wf-cohort`) |
| **Recorded by** | Sponsor (Cursor session, composition gap follow-up) |
| **Date** | 2026-11-11 |
| **LEAP readout revision requested?** | **no** — published Test strategy **B** / **B−** / **C+** bands already reflect this lens |

**Implication:** Unit-only monolithic builds are **not OK** for the composition cohort sub-check, even when behavior is fully tested. Separate lens B (product-only) remains documented above for behavior-only reporting.
