# Behind the scenes, two months later: How we ship Google Agent Skills like products

| Field | Value |
| --- | --- |
| **Source** | [Google Cloud Blog](https://cloud.google.com/blog/topics/developers-practitioners/behind-the-scenes-two-months-later-how-we-ship-google-agent-skills-like-products) |
| **Authors** | Remigiusz Samborski (Lead Developer Relations Engineer) |
| **Published** | 2026-10-28 |
| **Purpose** | Read-only article capture for comparison and architecture reference — **external content**; this document does not mint REQ/ARCH/IMPL tokens. |
| **Captured** | 2026-11-07 |
| **Analysis (sibling)** | [google-agent-skills-vs-tied-agent-management.md](google-agent-skills-vs-tied-agent-management.md) |
| **Related analysis (sibling)** | [persante-sdd-skills-vs-tied-agent-management.md](persante-sdd-skills-vs-tied-agent-management.md) (product-repo skills); [google-egm-elephant-goldfish-vs-tied-agent-management.md](google-egm-elephant-goldfish-vs-tied-agent-management.md) (SDD plugin) |

## TLDR

- A **skill** steers an agent’s reasoning loop, tool selection, and execution path—not passive documentation; instruction edits are **behavioral changes**.
- Google ships every skill update like a **product release**: strict **semantic versioning**, **deterministic CI gates** before human/AI review, and **mandatory evaluation evidence** (with vs without skill, or vs previous version).
- Each skill PR passes **six automated gates** plus **human SME approval**: structural conformance, skill linters, semver, evaluation suite validation, link validation, **AI review agent** (a skill that reviews skills).
- **AI reviewer** enforces: deterministic-vs-probabilistic split (CLI in `scripts/`, not prose), **L1/L2/L3** progressive disclosure (`SKILL.md` &lt; 500 lines, flat `references/`, single-hop indirection), non-interactive scripts with JSON stdout.
- **Lessons:** scope CI checks narrowly; **atomic expectations** in eval suites; generate `index.json`/`README` catalogs; run cheap gates before expensive LLM checks.
- Scale (**Google-reported**): 21,000+ GitHub stars (up from 15,000), **170+** skills from teams across Google, multi-platform distribution.

---

## Core philosophy: Ship skills like products

Documentation explains concepts to a human reader. A **skill** steers an AI agent. A misplaced phrase can cause invalid flags, infinite loops, or wasted tokens—so every instruction edit is a behavioral change.

Three requirements:

1. **Strict semantic versioning** — behavioral change requires an explicit version bump.
2. **Deterministic automated validation** — linters and validators on every proposed change before review.
3. **Mandatory evaluation evidence** — report comparing skill to previous version, or new skill to agent without it.

---

## Automated conformance gates (PR pipeline)

Before export to GitHub, each change must pass **six automated gates** and **human approval**:

| Order | Gate |
| --- | --- |
| 1 | **Structural conformance** — directory layout, allowed files, taxonomy |
| 2 | **Skill linters** — frontmatter, folder naming, Markdown rules |
| 3 | **Semantic versioning** — version bump on behavioral change |
| 4 | **Evaluation suite** — valid suite + fresh eval report in PR description |
| 5 | **Link validation** — relative links on PR; weekly external link scan (lychee) |
| 6 | **AI review agent** — quality and design standards via dedicated review skill |
| — | **Human approval** — SME or Central Skills team |

### Structural conformance and skill linters

Examples (**Google-reported** / blog):

- Folder name and metadata `name` must match.
- `SKILL.md` and description length limits.
- Required frontmatter `metadata` fields.
- Curated allowlist of files under each skill directory.
- Markdown formatting rules.
- Root `README.md` and generated `index.json` registry up to date.

### Semantic versioning

`metadata.version` must be a **quoted string** (YAML parses `2.0` as number otherwise). New skills start at `1.0.0`. Instruction, script, or reference changes require bump or PR blocks. Version supports developer compare/pull workflows (e.g. `npx skills update`), not runtime model reads.

### Evaluation suite validation

Continuous evals compare agent performance with and without each skill. Validator checks:

- File-based prompts (`@file:…`) resolve and are non-empty.
- **Atomic expectations** — one criterion per expectation (compound expectations blocked).
- Duplicate prompts / conflicting expectations flagged.
- PR must link evaluation report; **staleness check** against latest commit.

### Link validation

PR checks for relative links; Mondays: GitHub Actions **lychee** on external links across public repo.

### AI review agent

Catches quality linters miss: confusing instructions, verbose references, tasks that should be scripts.

#### Skill suitability and the deterministic trap

Rigid numbered CLI sequences in Markdown invite hallucinations. Deterministic steps belong in `scripts/` under the skill; Markdown reserved for judgment tasks. Complements MCP-over-CLI guidance from prior Google post.

#### L1/L2/L3 modular architecture

- **L1:** Frontmatter `name`, `description` — discovery/routing.
- **L2:** `SKILL.md` body — compact (&lt; 500 lines), workflows, guardrails.
- **L3:** `references/` — APIs, schemas; **flat** directory; **single-hop** from `SKILL.md` (no chained reference chains).

#### Non-interactive script design

Scripts: flags/env inputs, `--help`, `--dry-run` or confirm for destructive ops; JSON on stdout, actionable errors on stderr.

### Human approval

After automated gates: SME approval; new skills also Central Skills team.

---

## Lessons learned from repository history

1. **Scope CI checks carefully** — overly broad patterns blocked typo fixes for missing tickets while missing deep paths.
2. **Atomic expectations** — compound eval expectations produced inconsistent LLM-judge ratings; split criteria fixed reliability.
3. **Documentation drift** — generate `README` / `index.json`; do not hand-edit (`index.json` warns generated).
4. **Gate expensive LLM checks behind fast deterministic ones** — structural/semver fail fast; optional `/run-evals` or threshold triggers for heavy suites.

---

## Conclusion (vendor)

Scalable Agent Skills need developer infrastructure: version, validate, evaluate every change; semver + atomic expectations; AI reviewer for anti-patterns; link checks on merge and schedule.

---

## Notes for stdd readers

| Label | Meaning |
| --- | --- |
| **Google-reported** | Star counts, skill count, gate list, and eval discipline from blog unless independently verified |
| **Proof boundary** | Skill **eval suite pass** ≠ TIED **confirmed defect** rate, `tied_verify`, or enrolled **comparable-arms** evidence |
| **Wave 2** | Compose via [google-agent-skills-vs-tied-agent-management.md](google-agent-skills-vs-tied-agent-management.md); evaluation charter Q1/Q4/Q5/Q6 **narrative control only** — [tied-methodology-evaluation-framework.md](../tied-methodology-evaluation-framework.md) |
| **Depth** | Wave 1–2 at **`depth_tier: minimal`** — operator-local comparisons; no REQ/ARCH/IMPL |
