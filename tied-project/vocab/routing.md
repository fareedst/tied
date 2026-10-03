# Vocab directory routing index (primary entry)

**Purpose:** Canonical TIED methodology routing index. In the TIED source repository it routes `tied-project/vocab/`; in clients, the snapshot lives under `tied-bundle/vocab/` and is dispatched by the client-owned `tied-project/vocab/routing.md` handoff. Read the client handoff first when working in a client project.

**Procedure:**
1. Read this file (once per session).
2. Match your task keywords to the routing table below.
3. PRELOAD only the matched methodology glossary file(s) under this tree (or the client snapshot at `tied-bundle/vocab/`).
4. If your task spans multiple glossaries, search `domain-references.md` for cross-topic notes (or the relevant glossary names).

---

## Glossary routing table

| Pri | File | Keywords / When to read |
|-----|------|------------------------|
| 1 | [tied-methodology.md](tied-methodology.md) | TIED layout, semantic tokens, registry atom, distributed facet, atomized traceability graph, three-way alignment, module validation, binding inventory, composition evidence, bootstrap, `tied-install`, layered install, install mode linked/full, methodology migration, client refresh, `merge-vocab`, methodology vs project YAML, vocabulary layer, agent-control layer, core seven, MCP config preservation, PROC-* process names, `tied-install.sh`, detail files, `yaml_tool`, `yaml_list_sorter`, sort map keys, `yaml_semantic_compare`, `compare_yaml_dirs`, canonical YAML profile, `tied-yaml-canonical-v1`, scalar style, wrapped, unwrapped, repository YAML style, `yaml_format`, diff-scoped change-risk report, DAE incorporation |
| 1b | [../../tied-bundle/docs/working-artifact-placement.md](../../tied-bundle/docs/working-artifact-placement.md) | working folder, committed working root, local working root, process evidence, ephemeral artifact, evidence envelope path, temporary files, tied-project/working, tied-bundle/working, gitignore close-out, tooling scratch |
| 2 | [tied-yaml-mcp.md](tied-yaml-mcp.md) | TIED YAML MCP, `tied-cli`, bundled skill, `TIED_BASE_PATH`, `TIED_MCP_PROJECT_ID`, validation, verify, cycles, backlog, scoped analysis, token rename, usage metrics, `args_signature`, `signature coverage`, configured project identity, path-fallback identity, `TIED_MCP_COLLECT_METRICS`, MCP config preservation, preserve existing `mcp.json`, `tied_yaml_format`, YAML canonicalization, scalar-style resolution, `TIED_YAML_STYLE`, `tied-project/config.yaml`, `yaml_format` |
| 2b | [feedback-to-tied.md](feedback-to-tied.md) | `feedback.yaml`, `tied_feedback_add`, `tied_feedback_export`, feature_request, bug_report, methodology_improvement |
| 3 | [leap-proposal-queue.md](leap-proposal-queue.md) | LEAP proposals, non-canonical proposal, pending/approved/rejected/applied, `tied_leap_proposal_*`, leap-proposals audit |
| 4 | [agentstream.md](agentstream.md) | **`tied agentstream`**, `@tied/agentstream`, run-feature-batch, pipeline, turns, checklist render, executor, HTML format, MCP preflight, feature-spec batch |
| 4b | [agent-stream-ruby.md](agent-stream-ruby.md) | **Historical** Ruby ATDD (removed Phase **4b**); `IMPL-ATDD-*` traceability, TddLoopPrompts, export_tdd_prompts, stream-json — not an operator path |
| 5 | [pseudocode-and-citdp.md](pseudocode-and-citdp.md) | Domain vocab vs IMPL grammar, contract precision, binding inventory, composition evidence, three-way alignment, UPPER_SNAKE blocks, CITDP record naming, essence_pseudocode, sub-vocabulary-sync, pseudo-code static analysis, Layer C, gate_mode, pre-psa-grammar |
| 5f | [async-methodology.md](async-methodology.md) | async, await, promise, concurrency, IPC, event listener, timeout, cancellation, retry, idempotency, shared DATA, open wait, async boundary, async seam, async contract, message delivery, await sequencing, pre-async-contract, ASYNC_BOUNDARY, MESSAGE_CONTRACT, SEQUENCING |
| 5b | [quality-assurance.md](quality-assurance.md) | Quality assurance, quality attributes, risk tiers, assurance profiles, evidence matrix, evidence provenance, residual risk, waivers, pilots, stop criteria, test adequacy, proof boundaries, evidence chain profile, evidence-chain-profile, profile depth, evidence chain statistics report, client cohort, report input manifest, evaluation charter, evaluation corpus, comparable arms, execution policy, privacy tiers, denominator subcohorts, fixture-grounded cohort reporting |
| 5c | [fidelity-research.md](fidelity-research.md) | Adversarial inquiry, obligation graph, gate policy, fidelity findings, specification state, origin layer, divergent edge, read-only research profile, finding lifecycle, evidence provenance, case reports, fidelity audit |
| 5h | [residuality.md](residuality.md) | Residuality Theory, stressor, residue, desirable residue, harmful residue, attractor, incidence matrix, naïve architecture, naive architecture, validation stressor, stressor-residue claim, residuality discovery loop, stressor-residue record, stressor_residue_record_validate, sub-residuality-analysis-pass, PLAN-TIED-RESIDUALITY-ANALYSIS |
| 5i | [behavior-bounded-change-engineering.md](behavior-bounded-change-engineering.md) | BBCE, Behavior-Bounded Change Engineering, behavioral slice, owning slice, change locality, blast radius, declared change surface, public behavioral boundary, boundary crossing, boundary violation, shared mechanism, agent context locality, change footprint, scope drift, PLAN-TIED-BBCE-ALIGNMENT |
| 5d | [prompt-composer.md](prompt-composer.md) | TIED-source-only Prompt Composer, prompt type, global prompt skill, prompt-type router, prompt envelope, invocation remainder, linked plan, prompt-shared bundle, client installation, canonical bundle; not installed into clients by `tied-install.sh` |
| 5e | [feature-orchestration.md](feature-orchestration.md) | Feature manifest, feature lifecycle, feature orchestration CLI, clarification record, project constitution, task graph, generated view, FEAT identifier, initial-specs migration, onboarding wrapper, bootstrap verification gate, client orchestration publication, migration preview, readiness diagnostic, `tied/features/` |
| 5g | [decision-copilot.md](decision-copilot.md) | Jev, Laya, laya-mlx, laya-serve, local decision provider, answer_confidence, System One, decision coprocessor, decision API, typesafe, noul gate, speculative fan-out, shadow routing, agent risk, context filter, fail-closed tool block, bounded semantic decision engine, semantic garbage collection, decision algebra, `JEV_API_KEY`, `TIED_JEV_DECISION_PROVIDER` |
| 5j | [sponsor-agent-relationship.md](sponsor-agent-relationship.md) | sponsor, agent, reviewer, delegated work envelope, instrument branch, person branch, agency boundary condition, hinge field, consequence ladder, reversible choice, costly choice, sponsor-vs-TIED disagreement, over-asking, instrumentalizing the sponsor, RESOLVE charter |
| — | [config-discovery.md](config-discovery.md) | Layered YAML config, project-local layer, exclude_patterns, `(proposed)` terms |

---

## Cross-topic lookup (on-demand only)

The full [`domain-references.md`](domain-references.md) contains **Cross-topic notes** that map concepts spanning multiple glossaries (e.g. agentstream vs agent-stream naming, domain vocab vs IMPL grammar, TIED base path / project vs methodology YAML).

**Do not read the full file at bootstrap.** When your task touches a cross-cutting concern, open the full index and search for the note, or PRELOAD the two glossaries named in the routing table.

Examples of cross-topic notes:
- **`tied agentstream`** (TypeScript default) vs historical **agent-stream** (Ruby, removed) vs **run-feature-batch** shell drivers
- Domain vocabulary vs IMPL grammar vocabulary (INPUT/OUTPUT/DATA/PRE/POST/EFFECTS)
- TIED base path / project YAML vs methodology YAML
- Non-canonical LEAP proposals never mutate project TIED YAML

---

## Authoring guides (not glossaries)

- [Vocabulary index analysis and standards](../../tied-bundle/docs/vocabulary-index-analysis-and-standards.md)
- [Vocabulary layer, TIED, LEAP, and CITDP (outreach)](../../tied-bundle/docs/vocabulary-layer-tied-leap-citdp.md)
- [TIED domain vocabulary research prompt](../../tied-bundle/docs/tied-domain-vocabulary-research-prompt.md)
- [Client development index](../../tied-bundle/docs/client-development-index.md)

---

## Authoring new glossaries

See [tied-domain-vocabulary-research-prompt.md](../../tied-bundle/docs/tied-domain-vocabulary-research-prompt.md) and [vocabulary-index-analysis-and-standards.md](../../tied-bundle/docs/vocabulary-index-analysis-and-standards.md).

---

## Full reference

For the complete index (authoring guides table, cross-topic notes, and all links): [`domain-references.md`](domain-references.md).
