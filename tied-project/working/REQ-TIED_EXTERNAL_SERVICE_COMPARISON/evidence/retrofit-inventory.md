# Retrofit inventory — stub capture policy

**Generated:** 2026-11-17 (refine-plan)  
**Policy:** External **article** captures → stub shell; repo observation summaries → keep unless verbatim README paste; sponsor/TIED-owned → exempt.

## Legend

| Status | Meaning |
| --- | --- |
| **stub** | Already has stub marker; verify line budget |
| **retrofit** | Remove reproduced body; add stub preamble; keep TL;DR |
| **exempt** | Do not force stub shell |
| **review** | Repo/methodology capture — trim only if article body detected |

## Wave 1 captures (`docs/comparisons/`)

| File | Lines | Status | Batch | Notes |
| --- | ---: | --- | --- | --- |
| `andras-ludanyi-illusion-of-measurement-judgment-cooperation.md` | 39 | stub | — | verify |
| `afurmanov-harness-profiler.md` | 45 | stub | — | verify |
| `langchain-goal-engineering.md` | 43 | stub | — | canonical pattern |
| `hackernoon-observability-contract-ci.md` | 41 | stub | — | verify |
| `open-governance-cannot-sense.md` | 40 | stub | — | verify |
| `veronika-heimsbakk-on-ai-generated-ontologies.md` | 41 | stub | — | verify |
| `arun-srinivasan-every-map-has-a-projection.md` | 86 | stub | — | verify length |
| `langchain-improving-deep-agents-harness-engineering.md` | 144 | retrofit | A | full article after TL;DR |
| `traefik-harness-engineering-vs-platform-engineering.md` | 180 | retrofit | A | Read-only article capture |
| `netflix-ontology-driven-observability.md` | 215 | retrofit | A | drop Local extract metadata |
| `cursor-continually-improving-agent-harness.md` | 122 | retrofit | A | |
| `google-agent-skills-ship-like-products.md` | 124 | retrofit | A | |
| `anthropic-llm-formal-verification-appendix.md` | 131 | retrofit | A | |
| `persante-sdd-skills.md` | 125 | retrofit | B | |
| `langwatch-rebuilding-langwatch-in-51-days.md` | 109 | retrofit | B | |
| `alibaba-open-code-review.md` | 124 | retrofit | B | |
| `open-specter-legal-workspace.md` | 110 | retrofit | B | |
| `onono-foundation-progressive-ai.md` | 45 | retrofit | B | cluster |
| `onono-essence-of-understanding-and-language.md` | 48 | retrofit | B | |
| `onono-core-manifesto-autonomous-subject.md` | 63 | retrofit | B | |
| `onono-mind-ontology-beyond-ai-memory.md` | 90 | retrofit | B | |
| `onono-beyond-the-model-continual-learning.md` | 104 | retrofit | B | |
| `onono-scientific-foundations-digital-mind.md` | 294 | retrofit | B | |
| `onono-world-models-time-journalistic-research.md` | 334 | retrofit | B | |
| `nvidia-auto-ontology.md` | 328 | review | B | methodology repo summary |
| `open-ontologies-repository.md` | 113 | review | — | paraphrase OK |
| `morluto-rea-reverse-engineering.md` | 147 | review | — | |
| `ndtp-ai-ontology-extension.md` | 116 | review | — | |
| `apache-ossie.md` | 111 | review | — | |
| `onono-research-capture-index.md` | 28 | exempt | — | index |
| `software-engineering-degree.md` | 1513 | exempt | — | sponsor-proposed |
| `system-one-jev-taxonomy-and-opportunities.md` | 733 | exempt | — | TIED reference (not in comparisons-only scan) |

## Stub marker grep (2026-11-17)

Files matching `Why this file has no article body` OR `does not reproduce the article body` in `docs/comparisons/*.md`:

- `andras-ludanyi-illusion-of-measurement-judgment-cooperation.md`
- `langchain-goal-engineering.md`
- `open-governance-cannot-sense.md`
- `veronika-heimsbakk-on-ai-generated-ontologies.md`

(Add hackernoon, afurmanov, arun on full-text search — wording variants.)

## Contract test exempt list (draft)

For `comparison-capture-stub-policy.test.mjs`:

- `software-engineering-degree.md`
- `system-one-jev-taxonomy-and-opportunities.md`
- `jev-for-tied-improvement.md`
- `onono-research-capture-index.md`
- `open-ontologies-repository.md`
- `morluto-rea-reverse-engineering.md`
- `ndtp-ai-ontology-extension.md`
- `apache-ossie.md`
- `ai-sdlc-atdd-software-factory-vs-tied.md` (Wave 2 only — not in capture list)

Line budget for **article captures** (non-exempt): suggest **max 120 lines** until stub marker present (tune in RED test).