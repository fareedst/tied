# Refine-plan pass 1 — REQ-WF_TRIAL_SUMMARIES_PUBLISH

**Date:** 2026-11-13  
**prompt_type:** refine-plan

## RESOLVE (sponsor → canonical)

| Sponsor term | Resolution |
| --- | --- |
| publish-wf-trial-summaries | Store-only facilitator skill; `STORE_FACILITATOR_SKILLS` |
| no inputs | No positional remainder; full cohort refresh default |
| readout analysis | Parse existing `docs/demos/trial-readout-PROMPT-WF-*.md`; no client re-verify |
| comparison-table | `project-size-batch-compare.mjs` regen |
| catalog | Protocol cross-link; **v1 does not rewrite Recorded trials rows** |

## Refine gate

- Ambiguity cleared on catalog vs registry scope (**D-CATALOG-BODY** locked out of v1).
- Registry schema aligned to **current** 9-column master table on disk.

## Advisory checklist

`pre_implementation` — `tied_checklist_gate_validate` returned **`allowed: false`** (`malformed_citdp:adversarial_inquiry` on draft shape). Expected in refine-plan before CITDP persists to `tied-project/citdp/`; **re-run at `@build-plan`** after formal CITDP YAML matches schema.

## Output artifacts

- [PLAN.md](../PLAN.md)
- [test-strategy.md](../test-strategy.md)
- [CITDP draft](../CITDP-REQ-WF_TRIAL_SUMMARIES_PUBLISH.draft.yaml)
- [session-handoff.md](./session-handoff.md)
