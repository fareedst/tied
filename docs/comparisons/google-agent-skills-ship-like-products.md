# Behind the scenes, two months later: How we ship Google Agent Skills like products

| Field | Value |
| --- | --- |
| **Source** | [Google Cloud Blog](https://cloud.google.com/blog/topics/developers-practitioners/behind-the-scenes-two-months-later-how-we-ship-google-agent-skills-like-products) |
| **Authors** | Remigiusz Samborski (Lead Developer Relations Engineer) |
| **Published** | 2026-10-28 |
| **Purpose** | External reference index for Wave 2 comparison — **link + summary only**; does not mint REQ/ARCH/IMPL tokens and does **not** reproduce the article body. |
| **Captured** | 2026-11-07 |
| **Analysis (sibling)** | [google-agent-skills-vs-tied-agent-management.md](google-agent-skills-vs-tied-agent-management.md) |
| **Related analysis (sibling)** | [persante-sdd-skills-vs-tied-agent-management.md](persante-sdd-skills-vs-tied-agent-management.md) (product-repo skills); [google-egm-elephant-goldfish-vs-tied-agent-management.md](google-egm-elephant-goldfish-vs-tied-agent-management.md) (SDD plugin) |

---

## Why this file has no article body

The source was used to author the sibling analysis, but the **full text is not kept in-repo**. This stub retains metadata, **TL;DR**, and pointers. Read at the **Source** link; do not paste vendor prose back into this repository.

---

## TL;DR

- A **skill** steers an agent’s reasoning loop, tool selection, and execution path—not passive documentation; instruction edits are **behavioral changes**.
- Google ships every skill update like a **product release**: strict **semantic versioning**, **deterministic CI gates** before human/AI review, and **mandatory evaluation evidence** (with vs without skill, or vs previous version).
- Each skill PR passes **six automated gates** plus **human SME approval**: structural conformance, skill linters, semver, evaluation suite validation, link validation, **AI review agent** (a skill that reviews skills).
- **AI reviewer** enforces: deterministic-vs-probabilistic split (CLI in `scripts/`, not prose), **L1/L2/L3** progressive disclosure (`SKILL.md` &lt; 500 lines, flat `references/`, single-hop indirection), non-interactive scripts with JSON stdout.
- **Lessons:** scope CI checks narrowly; **atomic expectations** in eval suites; generate `index.json`/`README` catalogs; run cheap gates before expensive LLM checks.
- Scale (**Google-reported**): 21,000+ GitHub stars (up from 15,000), **170+** skills from teams across Google, multi-platform distribution.

---

## Notes for stdd readers

- Claims above are **summary-only** for comparison traceability (google-reported / target-repo-observed as labeled).
- Wave 2 sibling analysis holds the TIED mapping — **reference only**; effectiveness not_measured unless enrolled.
