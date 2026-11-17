# Comment summary (~400 words, optional top comment)

**TL;DR:** **TIED** keeps vocabulary + REQ/ARCH/IMPL + pseudo-code beside the product, runs agents through a **four-phase workflow** (define → refine → build → close-out), and publishes **graded readouts** plus **cohort tables** (~195 WF cells)—not a model leaderboard, but **inspectable** progress on whether workflows actually finish.

We grade **seven dimensions**, including **workflow choreography** (plan-before-code boundaries). Readouts record **split signals** when the orchestrator exits clean but close-out is blocked—honesty over greenwashing.

**What’s on disk:**

- Per-run **trial readouts** (session grades + rationales)
- **Runs registry** + **Latest-run comparison matrix** (image in post: WF-07…10 × Haiku/Sonnet/Composer crop — see `assets/`)
- **Project-size cohort table** (atoms / pseudo-code mass / test facets + wall clock)
- **workflow-trials-guide** — how it all fits together

**Links:**

- TIED store: https://github.com/fareedst/tied
- Workflow trials guide: https://github.com/fareedst/tied/blob/main/docs/agent-harness-evaluation/workflow-trials-guide.md
- Agent harness evaluation index: https://github.com/fareedst/tied/blob/main/docs/agent-harness-evaluation/README.md

Happy to point at a concrete readout (split-signal example) or explain **composition** vs **unit** facets in the size table.