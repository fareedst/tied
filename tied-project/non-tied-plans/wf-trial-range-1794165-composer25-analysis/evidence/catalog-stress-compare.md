# Catalog stress — WF-01 through WF-05 (Composer 2.5 gold bounds)

Source: [Facilitator index](../../../docs/demos/catalog-traditional-workflow-trial-prompts.md#facilitator-index-maps-trial-prompt--stress--grading)

| ID | workflow_stress | proof_boundary | Primary LLM differentiator | Gold cell (cursor / composer25) | Batch 1794165* outcome |
| --- | --- | --- | --- | --- | --- |
| WF-01 | baseline four-phase | executable_behavior | PLAN-only discipline at add-feature | [1794048393](../../../docs/demos/trial-readout-PROMPT-WF-01-composer25-1794048393-wf-agentstream-wf-01-cursor-composer25.md) complete | **exit 0** |
| WF-02 | ambiguity deferral | human_decision + executable_behavior | Policy documented before code | (cohort; agentstream cells in registry) | **exit 0** |
| WF-03 | composition seam | executable_behavior | Wiring test before glue | [1793820250](../../../docs/demos/trial-readout-PROMPT-WF-03-composer25-1793820250-wf-agentstream-wf-03-cursor-composer25.md) complete | **exit 0** |
| WF-04 | traceability scan | traceability_structure | YAML/MCP discipline across phases | [1793851888](../../../docs/demos/trial-readout-PROMPT-WF-04-composer25-1793851888-wf-agentstream-wf-04-cursor-composer25.md) **8/8**, exit 0 | **exit 1** — split signal (11/11 on disk) |
| WF-05 | refine expands edges | executable_behavior | Empty-file AC before implementation | [1794049382](../../../docs/demos/trial-readout-PROMPT-WF-05-composer25-1794049382-wf-agentstream-wf-05-cursor-composer25.md) **6/6**, exit 0 | **exit 1** — refine only |

## Relative intrinsic load (prompt axis only)

When the harness completes four turns:

1. **WF-01** — smallest product surface (single lib + tests).
2. **WF-02** — moderate refine (ambiguity resolution in PLAN).
3. **WF-03** — multi-module + composition test (this batch succeeded **immediately before** WF-04 harness break).
4. **WF-04** — largest **build** in the set: tree walk, comment grammar, index file, compare partitions, CLI exit 0/1/2, optional JSON, hermetic fixture matrix.
5. **WF-05** — largest **refine** in the set: AC-ZERO-0..3 for empty/header-only CSV; build is a single parser once refine locks AC.

**Interpretation:** WF-04/05 are **catalog-harder** than WF-01/02 on paper, but **not harder than demonstrated gold** for the same model. Batch failures align with **harness axis** (truncated turns + WritableIterable on WF-04/05 only), not a new capability cliff.

## Prior incomplete WF-05 (harness pattern)

[1794042383](../../../docs/demos/trial-readout-PROMPT-WF-05-composer25-1794042383-wf-agentstream-wf-05-cursor-composer25.md) — refine on disk, orchestrator abort at turn-2 boundary (`expanded_batch` shell bug). Current **1794167900** — same **workflow incomplete** class with WritableIterable instead of shell unbound variable.
