# Plan: Google Agent Skills × TIED — ship-like-products (Wave 1–2)

**Slug:** `google-agent-skills-vs-tied`  
**Track:** `non-tied-refine` (this revision) → `@non-tied-build` → optional `@non-tied-close`  
**Source:** [Behind the scenes: How we ship Google Agent Skills like products](https://cloud.google.com/blog/topics/developers-practitioners/behind-the-scenes-two-months-later-how-we-ship-google-agent-skills-like-products) (2026-10-28, Remigiusz Samborski)  
**Template:** [external-service-three-wave-comparison-template.md](../../../tied-bundle/docs/external-service-three-wave-comparison-template.md) Wave 1 + Wave 2 (14 sections)  
**Evaluation charter:** [tied-methodology-evaluation-framework.md](../../../docs/tied-methodology-evaluation-framework.md) — Q1/Q4/Q5/Q6 literacy; **not** comparable-arms proof without cohort data

---

## Scope

Doc-only **Wave 1 capture + Wave 2 comparison**: map Google’s **skill-as-product** PR pipeline (structural linters, semver, eval suites, staged CI, AI review skill, human SME) to TIED **bundled skills**, **checklist gates**, and **evaluation charter** in this repo—not adopting Google’s internal skills catalog or eval harness as TIED core.

| Boundary | Choice |
| --- | --- |
| Wave 1 | `docs/comparisons/google-agent-skills-ship-like-products.md` |
| Wave 2 | `docs/comparisons/google-agent-skills-vs-tied-agent-management.md` |
| Publish | **Operator-local** — `docs/comparisons/*` gitignored (no allowlist) |
| Committed edits | `docs/tied-methodology-evaluation-framework.md` § external narrative + relationship table + revision log |
| Wave 3 | **Defer** — per-skill semver, mandatory eval reports on PR, `/run-evals` triggers |

---

## Refine outcomes (Touchpoint 1 — RESOLVE)

**PRELOAD (read-only):** [quality-assurance.md](../../vocab/quality-assurance.md), [fidelity-research.md](../../vocab/fidelity-research.md), [sponsor-agent-relationship.md](../../vocab/sponsor-agent-relationship.md). **No vocab RECORD** on non-tied track.

| Term | Resolved meaning |
| --- | --- |
| **Skill-as-product** | Google treats every `SKILL.md` instruction edit as **behavioral change**; semver + eval evidence required on PR |
| **Harness-adjacent quality** | Skill linters, L1/L2/L3 layout, scripts vs prose — tunes agent routing; does not replace TIED YAML gate authority |
| **Skill eval pass rate** | With/without-skill or vs-previous-version suite — **Google-reported** process; ≠ Q1 **confirmed finding** or **historical defect proxy** arms |
| **Staged CI** | Deterministic gates before LLM eval/AI reviewer — literacy for Q5 **cost** pairing with MCP metrics + checklist wall time |
| **Compose-don’t-replace** | Borrow gate **ideas** for bundled skills; keep checklist, MCP writes, `tied_verify`, LEAP on platform plane |

**Gate:** Slug, local-only publish, and charter cross-edits confirmed; distinct from EGM/Persante/Cursor siblings.

---

## Deliverables (`@non-tied-build`)

| Artifact | Path | Required |
| --- | --- | --- |
| Wave 1 capture | `docs/comparisons/google-agent-skills-ship-like-products.md` | Yes |
| Wave 2 analysis | `docs/comparisons/google-agent-skills-vs-tied-agent-management.md` | Yes |
| Charter literacy | `docs/tied-methodology-evaluation-framework.md` | Yes |
| Plan folder | `tied-project/non-tied-plans/google-agent-skills-vs-tied/` | Yes |
| Matrix §2 row | `docs/comparisons/methodology-composition-matrix.md` | **Defer** |

---

## Distinct from

| Sibling | Owns | This plan owns |
| --- | --- | --- |
| [Google EGM × TIED](../../../docs/comparisons/google-egm-elephant-goldfish-vs-tied-agent-management.md) | SDD Elephant/Goldfish rubrics | **Catalog-scale skill CI** and eval suite discipline |
| [Persante SDD × TIED](../../../docs/comparisons/persante-sdd-skills-vs-tied-agent-management.md) | Wiki spec DAG in product repos | Google **multi-team skill registry** at 170+ skills |
| [Alibaba OCR × TIED](../../../docs/comparisons/alibaba-open-code-review-vs-tied-agent-management.md) | Diff review bench Q1/Q5 | **Skill change** gates, not code review |
| [Cursor harness × TIED](../../../docs/comparisons/cursor-harness-engineering-vs-tied-agent-management.md) | Live harness telemetry | Skill **product release** semver + eval reports |

---

## Forbidden

- Project REQ/ARCH/IMPL YAML mutations
- Methodology composition matrix row without scoped REQ
- `.gitignore` allowlist (sponsor chose operator-local)
- Claiming Google skill eval results as TIED cohort evidence

---

## Plan execution steps

1. [x] Refine PLAN + CITDP + test-strategy (non-tied-refine)
2. [x] Author Wave 1 capture (blog normalized + TLDR)
3. [x] Author Wave 2 analysis (14 template sections)
4. [x] Update evaluation charter external narrative + revision log
5. [x] Record session-handoff; hand off paths to sponsor

**Recorded depth:** `depth_tier: minimal`, `gate_policy: advisory`, `profile_depth: not_measured`, CITDP **skipped** per [citdp-policy.md](../../../tied-bundle/docs/citdp-policy.md) for non-executable documentation track (draft CITDP retained for traceability only).
