# The Spec Must Be Executable (Dave Farley)

| Field | Value |
| --- | --- |
| **Source** | [LinkedIn — Dave Farley](https://www.linkedin.com/pulse/spec-must-executable-dave-farley-jrnxe/) — full article text is **not** stored in this repository |
| **Author** | Dave Farley (**Farley-reported**) |
| **Published** | 2026-10-25 (**Farley-reported**, page metadata) |
| **Purpose** | External reference index for Wave 2 comparison — **link + summary only**; does not mint REQ/ARCH/IMPL tokens and does **not** reproduce the article body. |
| **Captured** | 2026-11-17 (summary for analysis); full-text capture **withheld** per stub policy |
| **Analysis (sibling)** | [dave-farley-spec-must-be-executable-vs-tied-agent-management.md](dave-farley-spec-must-be-executable-vs-tied-agent-management.md) |
| **Plan (working)** | [PLAN-refine-pass1.md](../../tied-project/working/DOC-FARLEY-EXECUTABLE-SPEC-COMPARISON/PLAN-refine-pass1.md) |

---

## Why this file has no article body

An off-repo read was used to author the sibling analysis, but the **full post is not kept in-repo**. This stub retains metadata, **TL;DR**, and pointers. Read the essay at the **Source** link; do not paste the LinkedIn body or long Gherkin excerpts back into this repository.

**Off-repo read:** [The Spec Must Be Executable](https://www.linkedin.com/pulse/spec-must-executable-dave-farley-jrnxe/)

---

## TL;DR

Summarizes themes used in the sibling analysis (**Farley-reported**; read off-repo for wording; not independently verified here).

- **Convergence:** Practitioners independently argue that agent-era delivery needs **verifiable behavioral intent**—not vibes, not unexecutable markdown—before and after codegen.
- **Hard problems unchanged:** Specify precisely, verify you got it, take steps small enough to notice drift; AI only cheapens typing code (**Farley-reported**).
- **Verification bottleneck:** High-volume codegen outpaces human review; tests generated from code cannot recover lost intent (**Farley-reported**).
- **Markdown SDD gap:** Spec Kit–class tools diagnose intent-as-truth but prose specs do not go red when agents disobey (**Farley-reported** third-party critiques cited in post).
- **Executable specification:** Problem-language scenario that runs against the real system and fails until behavior exists; separates WHAT from HOW (**Farley-reported** ATDD canon).
- **Four-layer model:** Acceptance examples, DSL, protocol drivers, SUT—technical coupling at the bottom, specification at the top (**Farley-reported**).
- **Operator rules:** Write spec before the agent and watch it fail; protect acceptance tests from agent edits; one scenario per iteration (**Farley-reported**).
- **Commercial offer:** ATDD course and bundled agent “ATDD skill” promoted at end of post—**Farley-reported**; effectiveness **`not_measured`** in stdd.

---

## Notes for stdd readers

- Claims above are **summary-only** for comparison traceability. They are **not** independently verified in Wave 1–2 and must not be treated as TIED methodology proof.
- This essay is **practitioner advocacy**, not a TIED product spec. Wave 2 maps themes to TIED **agent-management proof boundaries**—**not** adoption of Farley’s course or Cucumber/Gherkin as TIED’s authoritative artifact.
- **Wave 2:** [dave-farley-spec-must-be-executable-vs-tied-agent-management.md](dave-farley-spec-must-be-executable-vs-tied-agent-management.md) — executable spec × TIED agent management (**reference only**).
- **Wave 3:** **Defer** — doc compose or scoped REQ via `add-feature` only.