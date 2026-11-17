# PLAN — [REQ-WF_TRIAL_EVALUATION_GUIDE]

**Trial context:** TIED methodology **store** repo — public narrative for **traditional workflow trials** (WF) under `docs/agent-harness-evaluation/`, adaptable to a Reddit progress post.

| Field | Value |
| --- | --- |
| **Request token** | `REQ-WF_TRIAL_EVALUATION_GUIDE` |
| **`plan_phase`** | `close-out-ready` |
| **Workflow** | `@add-feature` → **`@refine-plan` (this pass)** → `@build-plan` → `@close-out` |
| **Linked Cursor plan** | `wf_trials_public_guide_d77262fe.plan.md` |
| **Tracker** | [checklist-tracker.yaml](./checklist-tracker.yaml) |
| **Test strategy** | [test-strategy.md](./test-strategy.md) |
| **CITDP (draft)** | [CITDP-REQ-WF_TRIAL_EVALUATION_GUIDE.draft.yaml](../../citdp/CITDP-REQ-WF_TRIAL_EVALUATION_GUIDE.draft.yaml) |

**Sponsor outcome (locked):** Anyone (sponsor, Reddit reader, new facilitator) can read **`docs/agent-harness-evaluation/workflow-trials-guide.md`** and understand how WF trials are **run**, **inspected**, **graded**, and **summarized** across the committed corpus—without opening every catalog section or skill reference first.

---

## Problem statement

| Surface | Current | Desired |
| --- | --- | --- |
| Public / sponsor narrative | [README.md](../../../docs/agent-harness-evaluation/README.md) is a short facilitator index; methodology is scattered across catalog, skills, registry, cohort tables | One **synthesis guide** with proof boundaries and “what exists now” inventory |
| Reddit adaptation | No committed outline tied to repo truth | Appendix **Reddit post skeleton** inside the guide (no separate marketing file in v1) |
| Drift guard | Grading contract covers readouts, not the guide | Bootstrap contract test on guide headings, guardrails, and resolvable internal links |

**Contrast:** [catalog-traditional-workflow-trial-prompts.md](../../../docs/agent-harness-evaluation/catalogs/catalog-traditional-workflow-trial-prompts.md) stays normative for prompts and facilitator protocol; the guide **links** and **explains**, it does not fork prompt tables.

---

## Locked decisions (refine-plan 2026-11-17)

| ID | Decision |
| --- | --- |
| **D-PATH** | Primary artifact: `docs/agent-harness-evaluation/workflow-trials-guide.md` |
| **D-INDEX** | Add **Public guide** row to [README.md](../../../docs/agent-harness-evaluation/README.md) (required for close-out) |
| **D-DEMOS-POINTER** | Optional one-line pointer in [docs/demos/README.md](../../../docs/demos/README.md) — only if facilitator paragraph lacks “how trials work”; not an acceptance criterion |
| **D-EXEMPLAR** | Teaching readout: [trial-readout WF-09 Haiku low @ 1794880253](../../../docs/agent-harness-evaluation/readouts/trial-readout-PROMPT-WF-09-claudehaiku55low-1794880253-wf-agentstream-wf-09-claude-claudehaiku55low.md) (split signals: orchestrator pass vs blocked close-out) |
| **D-CORPUS-SIZE** | Guide prose cites **~130+** committed `trial-readout-PROMPT-WF-*.md` files (re-measure at build-plan; do not hard-code exact count in contract test) |
| **D-FORBIDDEN** | Same as catalog: no `maturity_score`, no leaderboard / “best model” framing, no ranking wall-clock as winner proxy |
| **D-HMEP-BOUNDARY** | One short paragraph: HMEP stream metrics ≠ `@record-wf-trial` session grades → [harness-eval/README.md](../../../docs/agent-harness-evaluation/harness-eval/README.md) |
| **D-GF-CONTRAST** | At most one paragraph contrasting [greenfield catalog](../../../docs/demos/catalog-greenfield-plan-new-feature-prompts.md) (six dimensions, no workflow choreography weight) |
| **D-PATH-MODULE** | At `@build-plan`, add `AHE_WORKFLOW_TRIALS_GUIDE_REL` to [agent-harness-eval-docs-paths.mjs](../../../tools/bootstrap/lib/agent-harness-eval-docs-paths.mjs); contract test resolves guide via module |
| **D-TOKENS-DEFER** | `REQ/ARCH/IMPL-WF_TRIAL_EVALUATION_GUIDE` + `semantic-tokens.yaml` at **`@build-plan`** (not refine-plan) |
| **D-REDDIT-APPENDIX** | Skeleton lives **only** as final H2 `## Reddit post skeleton` inside the guide; sponsor edits voice before posting |

**profile_depth:** `minimal` · **gate_policy:** `advisory` · **depth_tier:** `minimal` · **methodology_surface_change_class:** `documentation` (store corpus)

---

## Guide outline (normative H2 headings for SC-WF-EG-02)

Target length: **~1,200–1,800 words** body (excluding skeleton). Plain language; define facilitator terms on first use.

| § H2 | Content |
| --- | --- |
| **Overview** | Four-skill workflow on disposable TIED clients; Cursor vs Claude Agentstream harness; not a single maturity score |
| **What a workflow trial is and is not** | Product-scoped paste vs methodology instructions; fair comparison cell; forbidden leaderboard language |
| **How a run is conducted** | Manual four `@` turns vs `workflow_trial_agentstream` / `workflow_trial_range`; `wf-trial-ts-node-test-v1`; link catalog § Automated agentstream path |
| **What facilitators analyze** | `@record-wf-trial` evidence: git phases, tests, gates, inventory JSON, orchestrator logs, three completion signals; split-signal exemplar |
| **How grading works** | Seven weighted dimensions; **Workflow choreography 15%**; bands A–F; rationale rules (link grading rationale REQ); registry compact `mean · Req/Tr/Ts/Al/Pr/Ch/Ml` |
| **Cohort summaries available now** | Readouts dir, runs registry, comparison matrix, [comparison-table.md](../../../docs/agent-harness-evaluation/cohort/comparison-table.md), `@publish-wf-trial-summaries` pipeline |
| **End-to-end flow** | Mermaid diagram (store → orchestrator → client → record → readout → publish → tables) |
| **How to explore this corpus** | 5 entry links (README → guide → exemplar → registry → cohort table) |
| **Reddit post skeleton** | Hook, bullets, published artifacts, limitations, link list (no absolute host paths) |

**Canonical citations (link, don’t duplicate):** catalog facilitator grading, [record-wf-trial reference § Session grading rationale](../../../tools/bundled-record-wf-trial-skill/reference.md#session-grading-rationale), [read-trial-readout-session-grading.mjs](../../../tools/bootstrap/lib/read-trial-readout-session-grading.mjs).

---

## Module boundaries

```text
docs/agent-harness-evaluation/workflow-trials-guide.md     # new — primary deliverable
docs/agent-harness-evaluation/README.md                    # index row
docs/demos/README.md                                       # optional one-liner
tools/bootstrap/lib/agent-harness-eval-docs-paths.mjs        # +AHE_WORKFLOW_TRIALS_GUIDE_REL
tools/bootstrap/lib/wf-trial-evaluation-guide-contract.test.mjs  # new
tied-project/requirements|architecture|implementation-decisions/  # @build-plan
tied-project/vocab/harness-platform-taxonomy.md            # RECORD public guide row
tied-project/CHANGELOG.md                                    # close-out bullet
```

**LEAP satisfaction (parents, no index edits in refine-plan):** [REQ-AGENT_HARNESS_EVALUATION_DOCS](../REQ-AGENT_HARNESS_EVALUATION_DOCS/PLAN.md), [REQ-WF_TRIAL_READOUT_GRADING_RATIONALE](../REQ-WF_TRIAL_READOUT_GRADING_RATIONALE/PLAN.md), [REQ-WF_TRIAL_SUMMARIES_PUBLISH](../REQ-WF_TRIAL_SUMMARIES_PUBLISH/PLAN.md).

---

## Acceptance criteria (`@build-plan`)

| ID | Criterion | Verification |
| --- | --- | --- |
| **SC-WF-EG-01** | Guide file exists at path from `AHE_WORKFLOW_TRIALS_GUIDE_REL` | contract test + path module |
| **SC-WF-EG-02** | Required H2 sections present (table § Guide outline) | `wf-trial-evaluation-guide-contract.test.mjs` |
| **SC-WF-EG-03** | Forbidden framing absent (`maturity_score`, leaderboard-as-ranking); HMEP boundary paragraph present | contract test regex |
| **SC-WF-EG-04** | Key relative links resolve from guide (catalog, registry, cohort table, exemplar readout, record skill) | contract test `fs.existsSync` via store root |
| **SC-WF-EG-05** | AHE README links to workflow-trials-guide | contract test or manual spot-check |
| **SC-WF-EG-06** | `tied_validate_consistency` clean after REQ/ARCH/IMPL mint | MCP |

---

## Implementation phases (`@build-plan`)

1. **RED** — `wf-trial-evaluation-guide-contract.test.mjs` (fails until guide + path constant exist).
2. **TIED stack** — `tied_token_create_with_detail` for REQ/ARCH/IMPL; IMPL pseudo-code sidecar; `lint_yaml`; `tied_validate_consistency`.
3. **Path module** — `AHE_WORKFLOW_TRIALS_GUIDE_REL`.
4. **Author guide** — Full prose per outline; mermaid; Reddit skeleton.
5. **Index** — README row; optional demos README line.
6. **Vocab RECORD** — harness-platform-taxonomy (or project-operations-mcp if better fit).
7. **GREEN** — contract test + existing bootstrap suite unaffected.
8. **CITDP persist** — promote draft to `tied-project/citdp/CITDP-REQ-WF_TRIAL_EVALUATION_GUIDE.yaml`.
9. **Close-out** — CHANGELOG; sponsor commit.

---

## Explicit non-goals (v1)

- Rewriting catalog, readouts, or operator cheatsheet.
- Publishing the Reddit post or adding r/ subreddit-specific copy beyond skeleton.
- Greenfield trial narrative beyond one contrast paragraph.
- Changing grading weights, parsers, or publish orchestrator behavior.

---

## Risk / consequence ladder

| Item | Class |
| --- | --- |
| New REQ token | Reversible |
| Reddit skeleton naming models | **Costly** if read as winners — repeat guardrails in Overview and skeleton limitations |
| Link rot under `docs/agent-harness-evaluation/` | Mitigate SC-WF-EG-04 + path module |

---

## Do next

**`@build-plan`** — linked [PLAN.md](./PLAN.md); tracker at [checklist-tracker.yaml](./checklist-tracker.yaml).