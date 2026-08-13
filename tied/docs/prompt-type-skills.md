# Global Prompt-Type Skills

**Status:** Implemented  
**Scope:** Versioned Cursor Agent Skills for Prompt Composer workflows in TIED projects
**Canonical source:** [`tools/bundled-prompt-type-skills/`](../../tools/bundled-prompt-type-skills/)
**Vocabulary:** [`tied/vocab/prompt-composer.md`](../vocab/prompt-composer.md)  
**Recorded:** 2026-08-12

This is the canonical repository documentation for the prompt-type skills. It
records the vocabulary, requirement, architecture, implementation, boundaries,
distribution, and validation for the completed skill bundle.

The canonical skill files are tracked under
`tools/bundled-prompt-type-skills/`. `copy_files.sh` installs the managed bundle
into a client project’s `.cursor/skills/` directory. Personal files under
`~/.cursor/skills/` are an import source for development only, not a runtime
dependency or distribution source.

## Traceability

```text
[REQ-PROMPT_TYPE_GLOBAL_SKILLS]
    ↓
[ARCH-PROMPT_TYPE_GLOBAL_SKILLS]
    ↓
[IMPL-PROMPT_TYPE_GLOBAL_SKILLS]
    ↓
14 tracked SKILL.md files + shared references
    ↓
static contract checks + prompt-type scenario matrix
```

The corresponding project records are:

- Requirement: `tied/requirements/REQ-PROMPT_TYPE_GLOBAL_SKILLS.yaml`
- Architecture: `tied/architecture-decisions/ARCH-PROMPT_TYPE_GLOBAL_SKILLS.yaml`
- Implementation: `tied/implementation-decisions/IMPL-PROMPT_TYPE_GLOBAL_SKILLS.yaml`
- Semantic-token registry: `tied/semantic-tokens.yaml`

## Task subagent wrappers

The TIED repository contains one project-scoped Cursor Task wrapper per leaf
prompt type at `.cursor/agents/<prompt-type>.md`. Each wrapper is a foreground
Task subagent that delegates to its canonical leaf skill while making
clean-context gates, forbidden operations, and parent handoff evidence
explicit. Implementing and close-out wrappers are writable; `question` and
`other` are readonly. A fixed-sequence orchestrator at
`.cursor/agents/plan-refine-build.md` Task-launches `plan-new-feature`, then
`refine-plan`, then `build-plan`, and does not implement the feature in its
own context. `copy_files.sh` installs every `.cursor/agents/*.md` wrapper into
each client project's `.cursor/agents/` directory as managed bootstrap
artifacts alongside the canonical skill bundle. Managed copies use `cp -p`/`cp -pR`,
retain source content and non-time attributes, normalize only the client copy
to that source item's local-date midnight, and produce a warning before
refresh when an existing destination has a non-midnight mtime.

Traceability: [REQ-PROMPT_TYPE_SUBAGENT](../requirements/REQ-PROMPT_TYPE_SUBAGENT.yaml) · [ARCH-PROMPT_TYPE_SUBAGENT](../architecture-decisions/ARCH-PROMPT_TYPE_SUBAGENT.yaml) · [IMPL-PROMPT_TYPE_SUBAGENT](../implementation-decisions/IMPL-PROMPT_TYPE_SUBAGENT.yaml)

## Vocabulary

The canonical glossary is
[`tied/vocab/prompt-composer.md`](../vocab/prompt-composer.md). The following
terms were recorded for this skill implementation.

### Existing Prompt Composer terms

- **Prompt Composer** — the workflow taxonomy and composition contract for agent prompts.
- **suggested prompt** — the generated prompt payload.
- **clipboard preview** — a display-only preview of local pasteboard text.
- **prompt type** — one branch of the Prompt Composer workflow taxonomy.
- **Git condition** — caller-provided context describing staged, diff, or
  irrelevant Git state.

### Skill terms

- **global prompt skill** — a tracked leaf skill under
  `tools/bundled-prompt-type-skills/<prompt-type>/` implementing one Prompt
  Composer branch and installed under a client’s `.cursor/skills/`.
- **prompt-type router** — the explicit multi-type composer at
  `tools/bundled-prompt-type-skills/prompt-type-router/`.
- **prompt envelope** — optional `prompt-type:` and `git-condition:` fields on
  a generated prompt; not required for Cursor skill or agent invocation.
- **invocation remainder** — the text after the named skill or agent. For
  `plan-new-feature` this is the requirement.
- **linked plan** — the attached or in-message plan document. Primary payload
  for `refine-plan` and `build-plan`.
- **prompt-shared bundle** — one-level-deep Markdown references under
  `tools/bundled-prompt-type-skills/prompt-shared/`.
- **TIED applicability boundary** — TIED tracking is selected explicitly by
  prompt type; skills do not infer it from repository layout.
- **TIED-client-local development** — development inside a TIED client that
  intentionally remains outside TIED synchronization.

## Requirement

### [REQ-PROMPT_TYPE_GLOBAL_SKILLS] Global prompt-type skills and explicit router

The TIED repository shall provide one explicit-only leaf skill for each Prompt
Composer prompt type and one explicit-only router for ordered multi-type
composition, then install that bundle into TIED client projects.

The skills shall:

1. Preserve each source workflow's header, section order, gates, and tail
   semantics.
2. Leave `git-condition:` as informational caller context; it shall not trigger
   repository inspection.
3. Avoid automatic clipboard access and automatic Git stage, commit, amend, or
   push operations.
4. Keep TIED workflows distinct from deliberate `non-tied-*`
   TIED-client-local workflows.
5. Document the complete bundle in this file.

### Acceptance criteria

- 13 leaf `SKILL.md` files exist with exact prompt-type names.
- One `prompt-type-router/SKILL.md` exists.
- All 14 skills have `disable-model-invocation: true`.
- Shared references resolve and each leaf remains below 500 lines.
- The router validates explicit ordered types, deduplicates adjacent duplicates,
  preserves first-seen order, and stops on unknown or ambiguous input.
- Non-TIED skills permit read-only domain context but prohibit TIED
  synchronization writes.

## Architecture

### [ARCH-PROMPT_TYPE_GLOBAL_SKILLS] Hybrid global prompt skill bundle

The bundle uses a hybrid architecture:

```text
tools/bundled-prompt-type-skills/
├── prompt-shared/       shared workflow references
├── <prompt-type>/       13 thin leaf skills
└── prompt-type-router/  explicit multi-type composer

client/.cursor/skills/
├── prompt-shared/       installed shared workflow references
├── <prompt-type>/       installed leaf skills
└── prompt-type-router/  installed explicit router
```

The architecture makes the following decisions:

- **Canonical storage:** skills are maintained under
  `tools/bundled-prompt-type-skills/` in the TIED repository and installed into
  each client’s `.cursor/skills/` directory by `copy_files.sh`.
- **Thin leaves:** each leaf contains its prompt-specific contract and links
  directly to shared references.
- **One-level disclosure:** leaf skills link directly to `prompt-shared/*.md`;
  reference chains do not continue through another skill.
- **Explicit activation:** every skill disables model invocation and activates
  only when named by the caller.
- **Hybrid TIED boundary:** TIED leaves use the full TIED/CITDP/LEAP workflow;
  `non-tied-*` leaves deliberately bypass TIED synchronization while allowing
  read-only domain inquiry.
- **Caller-owned Git context:** Git templates are text instructions supplied by
  the caller, not live commands.

### Router contract

The router accepts an ordered YAML list or comma-separated list of prompt
types. It:

1. Validates every type against the 13-type taxonomy.
2. Lists the taxonomy and stops for an unknown type.
3. Requests an explicit list instead of inferring composition from natural
   language.
4. Removes adjacent duplicates while preserving first-seen order.
5. Loads each matching leaf procedure in order.
6. Passes shared issue text through verbatim.
7. Applies later implementation gates only after earlier planning gates pass.

## Implementation

### [IMPL-PROMPT_TYPE_GLOBAL_SKILLS] Tracked prompt-type skill bundle and router

The completed implementation contains 14 tracked skills and 14 shared
references. The bootstrap process installs the same managed files into each
client project and installs every prompt-type Task wrapper under
`.cursor/agents/`, including the `plan-refine-build` sequence orchestrator.

### Leaf skills

| Skill | Workflow |
| --- | --- |
| `plan-new-feature` | Full TIED Refine → CITDP Plan → Implement |
| `refine-plan` | Improve a linked or in-message plan |
| `build-plan` | Execute a linked or in-message plan; omits Refine |
| `plan-close-out` | TIED/LEAP close-out with CHANGELOG and proposed message |
| `debug` | Refine → Capture Failure → Plan → Implement |
| `question` | Answer the invocation remainder; no TIED blocks |
| `use-skill` | Import/apply skills with full TIED gates |
| `ammend-commit` | Staged amend preparation; spelling intentionally preserved |
| `non-tied-plan` | Ordinary TIED-client-local development |
| `non-tied-debug` | Ordinary TIED-client-local debugging |
| `leap-ad-hoc` | Read and fortify caller-supplied staged ad-hoc work |
| `leap-diff-promote` | Promote caller-supplied diff patches onto TIED-complete stage |
| `other` | Process the invocation remainder; no TIED blocks |

Every leaf has:

- exact directory and frontmatter `name` matching the prompt type;
- third-person positive and negative activation description;
- `disable-model-invocation: true`;
- invocation-remainder and, where applicable, linked-plan inputs;
- applicable TIED or TIED-client-local boundary;
- source-faithful procedure, gates, outputs, and forbidden operations.

### Shared reference bundle

`prompt-shared/` contains:

- `tied-refine.md`
- `tied-plan-citdp.md`
- `tied-plan-citdp-build.md`
- `tied-plan-ad-hoc.md`
- `tied-implement.md`
- `tied-capture-failure.md`
- `tied-read-ad-hoc.md`
- `tied-close-out-process.md`
- `non-tied-refine.md`
- `non-tied-plan.md`
- `git-context-templates.md`
- `tied-boundary.md`
- `non-tied-boundary.md`
- `guiding-vocab.md`

### Safety boundaries

#### TIED workflows

TIED leaves require explicit selection. They may perform the full documented
TIED/CITDP/LEAP workflow, including Tracker use, pseudo-code alignment, TIED
updates, validation, and verification when the workflow requires it.

#### TIED-client-local workflows

`non-tied-plan` and `non-tied-debug` may read TIED YAML, IMPL pseudo-code,
CITDP, and vocabulary files for domain understanding. They must not:

- write TIED requirements, architecture, implementation, or semantic-token YAML;
- edit IMPL pseudo-code sidecars;
- create or edit CITDP records;
- record vocabulary changes;
- create or edit LEAP proposals;
- invoke mutating TIED verification;
- copy a TIED Tracker for synchronization work.

#### Git and clipboard

All skills must leave caller-supplied Git state untouched unless the caller
explicitly authorizes a required operation. The skills do not run Git commands,
inspect the repository automatically, or access `pbpaste`/`pbcopy`.

## Validation

The static and bootstrap validation covers the acceptance contract:

- 14 canonical `SKILL.md` files exist and are installed into a temporary client.
- Frontmatter `name` matches each directory, including
  `ammend-commit`.
- Every skill has `disable-model-invocation: true`.
- Every `SKILL.md` is below 500 lines; the largest is 64 lines.
- All direct `../prompt-shared/*.md` links resolve in both source and installed layouts.
- Forbidden clipboard commands appear only in explicit forbidden-operation
  statements.
- `build-plan` contains guiding vocabulary and omits Refine.
- `refine-plan` and `build-plan` name a linked plan and stop if none is present.
- `debug` includes Capture Failure.
- Both `non-tied-*` skills link the no-record boundary.

### Scenario matrix

The scenario matrix covers:

1. Each of the 13 leaf prompt types.
2. Missing and unknown router types.
3. Explicit `refine-plan` plus `build-plan` composition.
4. Ambiguous multi-intent requests.
5. `ammend-commit` with caller-pasted staged context.
6. `leap-ad-hoc` without staged context.
7. `non-tied-plan` and `non-tied-debug` in a repository containing `tied/`.
8. Minimal `question` and `other` workflows.
9. Negative activation for neighboring prompt types.

No production application code was changed for this deliverable. The
implementation is Markdown skill content plus bootstrap/static contract tests;
the validation is therefore the source/installation contract and scenario
matrix rather than runtime application behavior.

## Source-to-artifact mapping

The skill bundle preserves the Prompt Composer workflow decomposition:

| Source section | Shared reference |
| --- | --- |
| `section_refine` | `tied-refine.md` |
| `section_refine_debug` | `tied-refine.md` debug variant |
| `section_refine_ad_hoc` | `tied-refine.md` ad-hoc variant |
| `section_refine_simple` | `non-tied-refine.md` |
| `section_plan_citdp` | `tied-plan-citdp.md` |
| `section_plan_citdp_build` | `tied-plan-citdp-build.md` |
| `section_plan_ad_hoc` | `tied-plan-ad-hoc.md` |
| `section_plan_simple*` | `non-tied-plan.md` |
| `section_implement` | `tied-implement.md` |
| `section_capture_failure` | `tied-capture-failure.md` |
| `section_read_ad_hoc` | `tied-read-ad-hoc.md` |
| `section_process` / `section_prologue` | `tied-close-out-process.md` |
| `git_preamble_*` / `git_note_for_planning` | `git-context-templates.md` |

## Maintenance rules

When the Prompt Composer taxonomy or workflow changes:

1. Update `tied/vocab/prompt-composer.md` for new or renamed concepts.
2. Update the matching REQ/ARCH/IMPL records through the TIED YAML tooling.
3. Update the canonical bundle under `tools/bundled-prompt-type-skills/`.
4. Update the affected shared reference and leaf skill.
5. Update this document's inventory and source-to-artifact mapping.
6. Re-run the static contract checks and bootstrap scenario matrix.
7. Run `copy_files.sh` against representative clients, verify the managed
   wrappers' source-date midnight timestamps and modification warning, and
   `tied_validate_consistency` before marking the TIED records complete.

The canonical workflow artifact is the tracked bundle; this document is the
canonical TIED record of its prompt-type implementation and distribution.
