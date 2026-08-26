# Prompt Composer (canonical)

**Scope:** Prompt-type skills, the explicit prompt-type router, shared workflow
references, prompt envelopes, and their distribution to TIED client projects.
This is vocabulary only; workflow algorithms remain in the bundled `SKILL.md`
files and the implementation pseudo-code.

**Traceability:** [REQ-PROMPT_TYPE_GLOBAL_SKILLS](../requirements/REQ-PROMPT_TYPE_GLOBAL_SKILLS.yaml) · [ARCH-PROMPT_TYPE_GLOBAL_SKILLS](../architecture-decisions/ARCH-PROMPT_TYPE_GLOBAL_SKILLS.yaml) · [IMPL-PROMPT_TYPE_GLOBAL_SKILLS](../implementation-decisions/IMPL-PROMPT_TYPE_GLOBAL_SKILLS.yaml)

**See also:** [`routing.md`](routing.md) · [`domain-references.md`](domain-references.md) · [`../docs/prompt-type-skills.md`](../docs/prompt-type-skills.md) · [`../../tools/bundled-prompt-type-skills/`](../../tools/bundled-prompt-type-skills/)

---

## Preferred terms vs synonyms

| Preferred | Avoid | Notes |
|-----------|-------|-------|
| **Prompt Composer** | prompt builder | Source workflow taxonomy and composition contract |
| **prompt type** | prompt mode | One branch of the Prompt Composer taxonomy |
| **global prompt skill** | personal skill copy | A versioned leaf skill distributed to client projects |
| **prompt-type subagent** | agent wrapper, skill include | A TIED-source Cursor Task wrapper for a prompt type; distinct from the global prompt skill. One wrapper exists per leaf prompt type at `.cursor/agents/<prompt-type>.md` for static contract validation. Implementing and close-out wrappers are writable; `question` and `other` are readonly. Not installed into client projects by `copy_files.sh`. |
| **prompt-type sequence subagent** | multi-agent wrapper, pipeline agent | A TIED-source Cursor Task orchestrator that launches leaf prompt-type subagents in a fixed order. Canonical: `plan-refine-build` runs `plan-new-feature`, then `refine-plan`, then `build-plan`. |
| **prompt-type router** | multi-prompt helper | Explicit ordered composition of prompt types |
| **prompt envelope** | prompt wrapper | Optional `prompt-type:` and `git-condition:` fields on a generated prompt; not required for Cursor skill or agent invocation |
| **invocation remainder** | ::: body, request after ::: | Text after the named skill or agent (or the Task prompt body). For `plan-new-feature` this is the requirement, not a plan document. |
| **linked plan** | ::: plan body, in-document plan | The attached Cursor plan or an in-message plan. Primary payload for `refine-plan` and `build-plan`. |
| **plan-close-out (commit deferred)** | close-out commit, merge now | `plan-close-out` prepares Tracker, gates, CHANGELOG, and a proposed commit message; it must not `git add`, `git commit`, or `git push`. |
| **prompt-shared bundle** | shared skill docs | Direct one-level Markdown references used by leaf skills |
| **TIED applicability boundary** | inferred TIED mode | Explicit choice of full TIED, TIED-client-local, or minimal workflow |
| **TIED-client-local development** | non-TIED project | Development that reads context but intentionally avoids TIED synchronization |
| **canonical bundle** | personal source | Git-tracked source under `tools/bundled-prompt-type-skills/` |
| **client installation** | global sync | Copy into a client’s `.cursor/skills/` by `copy_files.sh` |
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
| Prompt-type sequence subagent | `.cursor/agents/plan-refine-build.md` (TIED source only) | [ARCH-PROMPT_TYPE_SUBAGENT](../architecture-decisions/ARCH-PROMPT_TYPE_SUBAGENT.yaml) · [IMPL-PROMPT_TYPE_SUBAGENT](../implementation-decisions/IMPL-PROMPT_TYPE_SUBAGENT.yaml) |
| Bootstrap installer | `copy_files.sh` (skills only) | [IMPL-TIED_FILES](../implementation-decisions/IMPL-TIED_FILES.yaml) |
| Explicit activation | `disable-model-invocation: true` | [REQ-PROMPT_TYPE_GLOBAL_SKILLS](../requirements/REQ-PROMPT_TYPE_GLOBAL_SKILLS.yaml) |

---

## Prompt-type taxonomy

The 13 leaf prompt types are:

- `plan-new-feature`, `refine-plan`, `build-plan`, `plan-close-out`, `debug`
- `question`, `use-skill`, `ammend-commit`
- `non-tied-plan`, `non-tied-debug`
- `leap-ad-hoc`, `leap-diff-promote`, `other`

The router is `prompt-type-router`. It accepts an explicit ordered list,
deduplicates adjacent duplicates, preserves first-seen order, and stops on
unknown or ambiguous input.

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
| canonical bundle | Preferred terms vs synonyms |
| client installation | Preferred terms vs synonyms |
| global prompt skill | Preferred terms vs synonyms |
| invocation remainder | Preferred terms vs synonyms |
| linked plan | Preferred terms vs synonyms |
| plan-close-out (commit deferred) | Preferred terms vs synonyms |
| prompt envelope | Preferred terms vs synonyms |
| Prompt Composer | Preferred terms vs synonyms |
| prompt-shared bundle | Preferred terms vs synonyms |
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
