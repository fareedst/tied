# LangWatch bounded operator recommendations — skim card

**Audience:** Operators after reading LangWatch Wave 2 analysis (may be **operator-local** / gitignored).  
**Traceability:** [REQ-TIED_LANGWATCH_AGENT_REFACTOR_WAVE3](../../requirements/REQ-TIED_LANGWATCH_AGENT_REFACTOR_WAVE3.yaml) · matrix §2 row **18**

| # | Recommendation | TIED surface (committed) |
| ---: | --- | --- |
| 1 | Pair LangChain for trace loops | Matrix row **18** + [HTOL LangWatch compose](../../../tied-bundle/docs/harness-trace-observation-loop.md#source-studies-langwatch-compose); pair rows **14–15** |
| 2 | Q5 cost denominators | [Evaluation framework — external narrative control](../../../docs/tied-methodology-evaluation-framework.md#external-narrative-control-q1--q5-literacy--compose-only) |
| 3 | Q1 post-ship misses | Same subsection + [incident-revert corpus](../../../tied-bundle/docs/incident-revert-evaluation-corpus.md) **`merge_miss`** |
| 4 | Owed-ports | [Port backlog](../../../tools/bundled-prompt-type-skills/prompt-shared/session-handoff-structure.md#port-backlog-optional--long-agent-branches) in session handoff |
| 5 | End-to-end trace | [Pre-handoff charter](../../../tied-bundle/docs/pre-handoff-verification-charter.md) **Composition path** row |
| 6 | Base path first | [Authority boundary checklist](../REQ-TIED_HARNESS_PLATFORM_SEAM/authority-boundary-operator-checklist.md) — **`tied_config_get_base_path`** before YAML |
| 7 | Local capture only | Sponsor policy — no comparison allowlist in this REQ |

**Proof boundary:** All LangWatch metrics **LangWatch-reported**; TIED **`not_measured`**. Port backlog ≠ gate waiver.
