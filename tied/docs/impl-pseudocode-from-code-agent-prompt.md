# IMPL Pseudo-Code From Existing Code and Tests — Agent Prompt

**Process tokens:** `[PROC-IMPL_CODE_TEST_SYNC]`, `[PROC-IMPL_PSEUDOCODE_TOKENS]`, `[PROC-PSEUDOCODE_VALIDATION]`, `[PROC-LEAP]`, `[PROC-TIED_BOOTSTRAP_FROM_TESTS]` (when REQ/ARCH/IMPL indexes are still thin).

**When to use:** A TIED **client** project already has **production code and automated tests** that implement correct behavior, but **`essence_pseudocode` sidecars are missing, empty, or stale**. Your job is to **author or refresh IMPL pseudo-code so it describes the implemented behavior**, then **align test and production comments** so every logical block has the **same** block-lead entries in all three places.

**When not to use:** Greenfield REQ work (pseudo-code before tests) — follow [agent-req-implementation-checklist.md](agent-req-implementation-checklist.md) Track A and [pseudocode-writing-and-validation.md](pseudocode-writing-and-validation.md#track-a-new-feature-req). Implementing *new* behavior from an already-updated IMPL — follow [tied-first-implementation-procedure.md](tied-first-implementation-procedure.md).

**Canonical references:** [pseudocode-writing-and-validation.md](pseudocode-writing-and-validation.md) (definition, block leads, phases A–I, validation), [templates/impl-essence-pseudocode-template.md](../../templates/impl-essence-pseudocode-template.md), [pseudocode-validation-checklist.yaml](pseudocode-validation-checklist.yaml) (Layer B; full pass including **minimum_gating_rules** when executable tests exist).

---

## Copy-paste prompt (give this block to the agent)

```text
Observing AI principles!

You are retrofitting TIED IMPL essence_pseudocode for behavior that already exists in production code and tests. The code and tests are the behavioral evidence; IMPL pseudo-code is the language-agnostic specification you write to match them. After pseudo-code is correct, test and production **comments** must carry the same block-lead lines as the sidecar (literal copy; host comment syntax only).

## Preconditions

1. Call tied_config_get_base_path (or tied-cli equivalent) and confirm TIED_BASE_PATH points at this project's tied/ directory.
2. Read AGENTS.md obligations: [PROC-IMPL_PSEUDOCODE_TOKENS], MCP-first YAML for indexes/detail (not methodology/ under tied/methodology/), lint_yaml on touched IMPL YAML, tied_validate_consistency when done.
3. Load related REQ/ARCH/IMPL index and detail records for the scope (yaml_detail_read, traceability tools). If tokens are missing, run [PROC-TIED_BOOTSTRAP_FROM_TESTS] discovery first, then author missing REQ/ARCH/IMPL rows before pseudo-code.

## Mission

For each in-scope IMPL token, produce or update tied/implementation-decisions/IMPL-{TOKEN}-pseudocode.md so that:

- Every logical block (typically one Markdown ## section) describes the **same** control flow, branches, data contracts, and error paths that the **tests prove** and the **production code implements**.
- Every block has a **block lead** ([PROC-IMPL_PSEUDOCODE_TOKENS]): bracket tokens in order IMPL, ARCH, REQ when all three appear, plus how the block implements them.
- Pseudo-code is **language-agnostic** (INPUT/OUTPUT/DATA/CONTROL; PRE/POST/EFFECTS and applicable FAILURE_MODES/DATA_TRANSITION/TERMINATION for new/changed Active blocks; procedures, IF/ELSE, ON error). Do **not** paste host-language source into the sidecar. Unchanged legacy Active blocks may keep N/A `pre-contract-grammar` until next edit.
- The **same** block-lead text (verbatim) appears in the matching test locus and production locus. If comments exist but differ, update comments to match the sidecar after the sidecar is correct—not paraphrased.

Do **not** change product logic or test assertions unless you discover a definite bug; this task is documentation and traceability alignment, not a feature rewrite.

## Workflow (execute in order)

### 1. Discovery (Phase A)

- List IMPL tokens in scope (feature, module, or change request).
- For each IMPL: read IMPL-{TOKEN}.yaml (cross_references, traceability.code_locations, traceability.tests).
- Map each logical region in production source to tests (describe/it, test functions, fixtures). Grep [IMPL-*], [REQ-*], [ARCH-*] in code and tests.
- Build an inventory table (keep in your working notes):

  | IMPL | Sidecar status | Production file:region | Test file:region | Existing comment match? |

Stop discovery when every in-scope IMPL has mapped code and test loci.

### 2. Extract behavior into pseudo-code (Phase B–C)

For each IMPL, edit or create IMPL-{TOKEN}-pseudocode.md from templates/impl-essence-pseudocode-template.md:

- Start from **tests**: names, arrange/act/assert, mocks, expected OUTPUT/effects, edge cases, error expectations.
- Cross-check **production code**: branches, early returns, delegation to other IMPLs, shared DATA, ordering.
- One ## block per logical unit (function, workflow step, binding, or validation catalog section per project policy).
- Per block: block lead → Contract (INPUT/OUTPUT/DATA/CONTROL; PRE/POST/EFFECTS; FAILURE_MODES/DATA_TRANSITION/TERMINATION when applicable) → PROCEDURE steps (one action per line) → branches/errors.
- Sub-blocks with the same token set: comment **how** only. Different token set: full IMPL/ARCH/REQ list and how.
- If behavior implies missing ARCH or REQ scope, apply [PROC-LEAP]: update IMPL first, then ARCH, then REQ in the same work item.

### 3. Three-way comment alignment (Phase F)

For each ## block:

1. Finalize block lead in the sidecar.
2. Insert or fix the **identical** block lead at the primary test locus (first comment in describe/it/module).
3. Insert or fix the **identical** block lead at the production locus that implements the block.
4. If the project uses **full-block duplication** (see source-file-impl-traceability.md), copy the full H2 body into host block comments per policy.

Tests validate **what**; code comments state **how** at the locus—the **token line(s)** must still match the sidecar literally.

### 4. Metadata and validation (Phase I)

- Update IMPL detail YAML: traceability.tests, code_locations, metadata.last_updated (via tied-cli/MCP, not hand-edited invalid YAML).
- Run lint_yaml on changed YAML files ([PROC-YAML_EDIT_LOOP]).
- Run tied_validate_consistency (include_pseudocode default).
- Run Layer B checklist (full pass including minimum_gating_rules); fix gating rows.
- Run the project's test suite; failures mean pseudo-code or comments still diverge from behavior—reconcile (usually fix pseudo-code to match tests, then comments).

## Alignment rules (mandatory)

| Artifact | Content |
|----------|---------|
| IMPL sidecar | Language-agnostic logic + block leads |
| Test | Same block lead(s) as sidecar; assertions must match pseudo-code OUTPUT/effect |
| Production | Same block lead(s) as sidecar; code implements the described steps |

**Drift direction for this task:** existing **behavior** in tests/code → encode in IMPL → sync comments. After this task, ongoing changes follow LEAP: IMPL → test → code.

## Forbidden

- Pasting production or test source into essence_pseudocode.
- Paraphrasing block leads in tests or code.
- Editing tied/methodology/ (read-only).
- Skipping tied_validate_consistency.
- Treating stale pseudo-code as authoritative over passing tests.

## Done when

- Every in-scope IMPL has a complete IMPL-{TOKEN}-pseudocode.md.
- Inventory table shows code, test, and comment alignment for every block.
- tied_validate_consistency ok; Layer B minimum_gating_rules satisfied or waivers documented.
- Tests pass unchanged (unless you explicitly fixed a bug and documented LEAP).
```

---

## Operator notes (human or lead agent)

### Relationship to other tracks

| Track | Situation | Order |
|-------|-----------|--------|
| **A** — New REQ | No implementation yet | Pseudo-code → RED tests → code |
| **B** — Post-fix | Fix merged without IMPL update | IMPL (intended fix) → tests → code |
| **C** — This prompt | Code + tests exist; pseudo-code absent/stale | Read tests/code → IMPL → align comments |

Track C is **documentation-first retrofit**: you are **reverse-documenting** behavior, not re-implementing. The checklist step `three-way-alignment-unit` and `[PROC-IMPL_CODE_TEST_SYNC]` still apply; you are performing alignment with **evidence order** code/tests → IMPL → comments.

### Brownfield tests

If tests already pass, do **not** force artificial RED failures. Document baseline lock per [agent-req-implementation-checklist.yaml](agent-req-implementation-checklist.yaml) (`unit-test-red` brownfield note). Pseudo-code must still describe what those tests assert.

### Optional mechanical assist

Some repositories run `script/extract_test_pseudocode_to_impl_sidecars.py` (Rust) to seed sidecars from test comments. Treat output as a **draft**: normalize to TIED vocabulary, add ARCH/REQ block leads, reconcile with production code, then run validation. IMPL remains canonical after human/agent review.

### MCP and CLI

- Read/write sidecar: direct edit of `IMPL-*-pseudocode.md` or `impl_detail_set_essence_pseudocode` with `essence_pseudocode_path` ([pseudocode-writing-and-validation.md § Mechanics](pseudocode-writing-and-validation.md#mechanics-editing-the-sidecar-mcp-and-cli)).
- Index/detail fields: [tied-yaml skill](../../.cursor/skills/tied-yaml/SKILL.md) / [tied-yaml-agent-index.md](tied-yaml-agent-index.md).

### Suggested agentstream / session scope

Scope one **IMPL token set** or one **module boundary** per session to keep inventory tables accurate. Run the full test suite for touched areas before marking complete.

---

## Quick verification checklist

- [ ] `tied_config_get_base_path` matches this repo's `tied/`
- [ ] Each ## block has block lead with IMPL, ARCH, REQ and *how*
- [ ] No host-language snippets inside sidecars
- [ ] Test and production block leads match sidecar **verbatim**
- [ ] Assertions trace to pseudo-code OUTPUT or documented `e2e_only`
- [ ] `traceability.tests` and `code_locations` updated on IMPL detail records
- [ ] `lint_yaml` clean on touched YAML
- [ ] `tied_validate_consistency` → ok
- [ ] Project test command passes for in-scope areas
