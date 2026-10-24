# Prompt Composer (canonical)

**Scope:** Prompt-type skills, the explicit prompt-type router, shared workflow
references, prompt envelopes, and their distribution to TIED client projects.
This is vocabulary only; workflow algorithms remain in the bundled `SKILL.md`
files and the implementation pseudo-code.

**Traceability:** [REQ-PROMPT_TYPE_GLOBAL_SKILLS](../requirements/REQ-PROMPT_TYPE_GLOBAL_SKILLS.yaml) · [ARCH-PROMPT_TYPE_GLOBAL_SKILLS](../architecture-decisions/ARCH-PROMPT_TYPE_GLOBAL_SKILLS.yaml) · [IMPL-PROMPT_TYPE_GLOBAL_SKILLS](../implementation-decisions/IMPL-PROMPT_TYPE_GLOBAL_SKILLS.yaml)

**See also:** [`routing.md`](routing.md) · [`domain-references.md`](domain-references.md) · [`../docs/prompt-type-skills.md`](../../tied-bundle/docs/prompt-type-skills.md) · [`../../tools/bundled-prompt-type-skills/`](../../tools/bundled-prompt-type-skills/)

---

## Preferred terms vs synonyms

| Preferred | Avoid | Notes |
|-----------|-------|-------|
| **Prompt Composer** | prompt builder | Source workflow taxonomy and composition contract |
| **prompt type** | prompt mode | One branch of the Prompt Composer taxonomy |
| **global prompt skill** | personal skill copy | A versioned leaf skill distributed to client projects |
| **prompt-type subagent** | agent wrapper, skill include | A TIED-source Cursor Task wrapper for a prompt type; distinct from the global prompt skill. One wrapper exists per leaf prompt type at `.cursor/agents/<prompt-type>.md` for static contract validation. Implementing and close-out wrappers are writable; `question` and `other` are readonly. Not installed into client projects by `tied-install.sh`. |
| **prompt-type sequence subagent** | multi-agent wrapper, pipeline agent | A TIED-source Cursor Task orchestrator that launches leaf prompt-type subagents in a fixed order. Canonical: `add-refine-build` runs `add-feature`, then `refine-plan`, then `build-plan`. |
| **prompt-type router** | multi-prompt helper | Explicit ordered composition of prompt types |
| **prompt envelope** | prompt wrapper | Optional `prompt-type:` and `git-condition:` fields on a generated prompt; not required for Cursor skill or agent invocation |
| **invocation remainder** | ::: body, request after ::: | Text after the named skill or agent (or the Task prompt body). For `add-feature` this is the requirement, not a plan document. |
| **linked plan** | ::: plan body, in-document plan | The attached Cursor plan or an in-message plan. Primary payload for `refine-plan` and `build-plan`. |
| **close-out (traceable commit when gates allow)** | close-out commit deferred, merge later | `@close-out` runs unified close_out gates, git hygiene preview, CHANGELOG, and **traceable-commit** (`git add`/`git commit`) when gates allow; skips commit when blocked; must not `git push` unless sponsor asks. |
| **gitignore close-out hygiene** | git cleanup, ignore sweep | Advisory close-out review per `[PROC-GITIGNORE_CLOSE_OUT]`; classify ephemeral artifacts; propose or apply unstaged `.gitignore` patterns |
| **ephemeral artifact** | temp file, junk | Regenerable local-dev output not canonical TIED intent |
| **aggregate artifact** | summary file | Intentionally trackable rollup; may require `!` negation in `.gitignore` |
| **caller git context** | auto git | Pasted git preamble or untracked path list; **`git_preamble_plan_close_out`** for `@close-out`; read-only git and stage/commit only in traceable-commit phase after close_out allows |
| **advisory close-out step** | blocking gate | Required procedure with handoff evidence; explicit N/A when clean |
| **prompt-shared bundle** | shared skill docs | Direct one-level Markdown references used by leaf skills |
| **surface enrollment contract** | enrollment helper, PDSA hook | Normative when/how to open or update a Loop 3 methodology experiment for non-`checklist_step` production surfaces (prompt types, assurance profiles, experiment `gate_policy` category); MCP assist + advisory skill steps; gate-blocking only when implement CITDP declares link · [REQ-METHODOLOGY-PRODUCTION-SYSTEM-ENROLLMENT](../requirements/REQ-METHODOLOGY-PRODUCTION-SYSTEM-ENROLLMENT.yaml) |
| **surface_ref** | surface id, prompt surface id | Optional field on methodology learning experiment records identifying the enrolled surface (leaf **prompt type** id, assurance profile id, or CITDP id depending on `production_system_surface`); required by enrollment validator for `prompt_type_workflow`, `assurance_profile`, and `gate_policy` surfaces · [REQ-METHODOLOGY-PRODUCTION-SYSTEM-ENROLLMENT](../requirements/REQ-METHODOLOGY-PRODUCTION-SYSTEM-ENROLLMENT.yaml) |
| **harness profile** | agent mode, harness mode | Bounded turn orchestration for a leaf **prompt type** (IDE agent, Task subagent, or agentstream `--harness`); tune prompts/delegation here—not checklist gate authority · [fresh-client-prompt-activation-map §0](../../tied-bundle/docs/fresh-client-prompt-activation-map.md) |
| **TIED applicability boundary** | inferred TIED mode | Explicit **`full`** \| **`minimal`** \| **`none`** per leaf prompt type in the activation map; distinct from **harness profile** wording |
| **TIED-client-local development** | non-TIED project | Development that reads context but intentionally avoids TIED synchronization |
| **canonical bundle** | personal source | Git-tracked source under `tools/bundled-prompt-type-skills/` |
| **client installation** | global sync | Copy into a client’s `.cursor/skills/` by `tied-install.sh` |
| **source-only glossary** | client glossary | Canonical glossary retained in the TIED source repository and excluded from client bootstrap |

---

## Naming bridge

| Concept | Canonical path or value | TIED token |
|---------|-------------------------|------------|
| Canonical bundle | `tools/bundled-prompt-type-skills/` | [IMPL-PROMPT_TYPE_GLOBAL_SKILLS](../implementation-decisions/IMPL-PROMPT_TYPE_GLOBAL_SKILLS.yaml) |
| Client skill root | `.cursor/skills/` | [ARCH-PROMPT_TYPE_GLOBAL_SKILLS](../architecture-decisions/ARCH-PROMPT_TYPE_GLOBAL_SKILLS.yaml) |
| Leaf skill | `<prompt-type>/SKILL.md` | [REQ-PROMPT_TYPE_GLOBAL_SKILLS](../requirements/REQ-PROMPT_TYPE_GLOBAL_SKILLS.yaml) |
| Router | `prompt-type-router/SKILL.md` | [IMPL-PROMPT_TYPE_GLOBAL_SKILLS](../implementation-decisions/IMPL-PROMPT_TYPE_GLOBAL_SKILLS.yaml) |
| Shared reference | `prompt-shared/*.md` | [IMPL-PROMPT_TYPE_GLOBAL_SKILLS](../implementation-decisions/IMPL-PROMPT_TYPE_GLOBAL_SKILLS.yaml) |
| Prompt-type subagent | `.cursor/agents/<prompt-type>.md` (TIED source only) | [ARCH-PROMPT_TYPE_SUBAGENT](../architecture-decisions/ARCH-PROMPT_TYPE_SUBAGENT.yaml) · [IMPL-PROMPT_TYPE_SUBAGENT](../implementation-decisions/IMPL-PROMPT_TYPE_SUBAGENT.yaml) |
| Prompt-type sequence subagent | `.cursor/agents/add-refine-build.md` (TIED source only) | [ARCH-PROMPT_TYPE_SUBAGENT](../architecture-decisions/ARCH-PROMPT_TYPE_SUBAGENT.yaml) · [IMPL-PROMPT_TYPE_SUBAGENT](../implementation-decisions/IMPL-PROMPT_TYPE_SUBAGENT.yaml) |
| Bootstrap installer | `tied-install.sh` (skills only) | [IMPL-TIED_FILES](../implementation-decisions/IMPL-TIED_FILES.yaml) |
| Explicit activation | `disable-model-invocation: true` | [REQ-PROMPT_TYPE_GLOBAL_SKILLS](../requirements/REQ-PROMPT_TYPE_GLOBAL_SKILLS.yaml) |
| Gitignore close-out hygiene | `gitignore-close-out-hygiene.md` | [PROC-GITIGNORE_CLOSE_OUT](../../tied-bundle/docs/processes.md) |

---

## Prompt-type taxonomy

The 13 leaf prompt types are:

- `add-feature`, `refine-plan`, `build-plan`, `close-out`, `debug`
- `question`, `use-skill`, `ammend-commit`
- `non-tied-plan`, `non-tied-debug`
- `leap-ad-hoc`, `leap-diff-promote`, `other`

The router is `prompt-type-router`. It accepts an explicit ordered list,
deduplicates adjacent duplicates, preserves first-seen order, and stops on
unknown or ambiguous input.

**Methodology harness leaves (not prompt-type branches):**

- `harness-trace-review` — explicit-only Loop 2 trace/session review into **`tied_feedback_capture_observation`** ([REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP](../requirements/REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP.yaml)).
- `harness-trace-analyzer` — explicit-only outer-loop compose with normative **Task** fan-out and synthesis proposals ([REQ-TIED_HARNESS_LANGCHAIN_PHASE3](../requirements/REQ-TIED_HARNESS_LANGCHAIN_PHASE3.yaml)).
- `harness-trace-langsmith-compose` — explicit-only optional LangSmith run export into local JSON, then hand off to the review/analyzer skills ([REQ-TIED_HARNESS_LANGSMITH_COMPOSE](../requirements/REQ-TIED_HARNESS_LANGSMITH_COMPOSE.yaml)); **client-side**, not TIED core.
- `external-service-comparison` — explicit-only **external service comparison** (Wave 1 capture + Wave 2 TIED analysis + Wave 3 handoff-only); mandatory `DOC-{SLUG}-COMPARISON` working folder ([REQ-TIED_EXTERNAL_SERVICE_COMPARISON](../requirements/REQ-TIED_EXTERNAL_SERVICE_COMPARISON.yaml)).

Guide: `tied-bundle/docs/harness-trace-observation-loop.md` (Procedure + **Outer loop (LangChain compose)** + **Optional LangSmith client compose**). Comparison template: `tied-bundle/docs/external-service-three-wave-comparison-template.md`.

---

## Pseudo-code block names

| Preferred term | UPPER_SNAKE block | Owning IMPL |
|----------------|-------------------|-------------|
| prompt skill inventory | `INVENTORY_PROMPT_TYPE_SKILLS` | [IMPL-PROMPT_TYPE_GLOBAL_SKILLS](../implementation-decisions/IMPL-PROMPT_TYPE_GLOBAL_SKILLS.yaml) |
| prompt skill installation | `INSTALL_PROMPT_TYPE_SKILLS` | [IMPL-PROMPT_TYPE_GLOBAL_SKILLS](../implementation-decisions/IMPL-PROMPT_TYPE_GLOBAL_SKILLS.yaml) |
| prompt skill contract validation | `VALIDATE_PROMPT_TYPE_SKILL_CONTRACT` | [IMPL-PROMPT_TYPE_GLOBAL_SKILLS](../implementation-decisions/IMPL-PROMPT_TYPE_GLOBAL_SKILLS.yaml) |
| prompt-type subagent contract validation | `VALIDATE_PROMPT_TYPE_SUBAGENT_CONTRACT` | [IMPL-PROMPT_TYPE_SUBAGENT](../implementation-decisions/IMPL-PROMPT_TYPE_SUBAGENT.yaml) |
| prompt-type subagent parent handoff | `REPORT_PROMPT_TYPE_SUBAGENT_RESULT` | [IMPL-PROMPT_TYPE_SUBAGENT](../implementation-decisions/IMPL-PROMPT_TYPE_SUBAGENT.yaml) |
| prompt-type sequence dispatch | `DISPATCH_PROMPT_TYPE_SEQUENCE` | [IMPL-PROMPT_TYPE_SUBAGENT](../implementation-decisions/IMPL-PROMPT_TYPE_SUBAGENT.yaml) |

---

## Alphabetical index

| Term | Section |
|------|---------|
| advisory close-out step | Preferred terms vs synonyms |
| aggregate artifact | Preferred terms vs synonyms |
| caller git context | Preferred terms vs synonyms |
| canonical bundle | Preferred terms vs synonyms |
| ephemeral artifact | Preferred terms vs synonyms |
| gitignore close-out hygiene | Preferred terms vs synonyms |
| client installation | Preferred terms vs synonyms |
| global prompt skill | Preferred terms vs synonyms |
| invocation remainder | Preferred terms vs synonyms |
| linked plan | Preferred terms vs synonyms |
| close-out (traceable commit when gates allow) | Preferred terms vs synonyms |
| prompt envelope | Preferred terms vs synonyms |
| Prompt Composer | Preferred terms vs synonyms |
| prompt-shared bundle | Preferred terms vs synonyms |
| surface enrollment contract | Preferred terms vs synonyms |
| surface_ref | Preferred terms vs synonyms |
| prompt type | Preferred terms vs synonyms |
| prompt-type sequence dispatch | Pseudo-code block names |
| prompt-type sequence subagent | Preferred terms vs synonyms |
| prompt-type subagent | Preferred terms vs synonyms |
| prompt-type subagent contract validation | Pseudo-code block names |
| prompt-type subagent parent handoff | Pseudo-code block names |
| prompt-type router | Preferred terms vs synonyms |
| source-only glossary | Preferred terms vs synonyms |
| TIED applicability boundary | Preferred terms vs synonyms |
| TIED-client-local development | Preferred terms vs synonyms |
