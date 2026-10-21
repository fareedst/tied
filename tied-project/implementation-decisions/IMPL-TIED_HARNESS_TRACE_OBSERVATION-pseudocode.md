# [IMPL-TIED_HARNESS_TRACE_OBSERVATION] [ARCH-TIED_HARNESS_TRACE_OBSERVATION] [REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP] — Doc-first harness trace observation loop (slices A–D).

Grammar-Version: v2

## SLICE_A_AUTHOR_METHODOLOGY_GUIDE

- [IMPL-TIED_HARNESS_TRACE_OBSERVATION] [ARCH-TIED_HARNESS_TRACE_OBSERVATION] [REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP] Specify methodology guide content and acceptance markers for bootstrap contract test.
- Contract:
  - INPUT: PLAN slice A outline; pre-handoff charter cross-link requirements
  - PRE: refine-plan pre_implementation gate allowed
  - OUTPUT: tied-bundle/docs/harness-trace-observation-loop.md draft | { error: missing_required_section }
  - POST: Doc includes proof boundary, procedure, failure-mode taxonomy, promotion path, test-strategy executable matrix
  - EFFECTS: No MCP or gate behavior change

## SLICE_B_INSTALL_BUNDLED_SKILL

- [IMPL-TIED_HARNESS_TRACE_OBSERVATION] [ARCH-TIED_HARNESS_TRACE_OBSERVATION] [REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP] Add explicit-only harness-trace-review skill that delegates to guide and documents single capture_observation per batch.
- Contract:
  - INPUT: Methodology guide path; REQ-PROMPT_TYPE_GLOBAL_SKILLS inventory rules
  - PRE: Slice A guide exists or draft stable enough for skill cross-link
  - OUTPUT: tools/bundled-prompt-type-skills/harness-trace-review/SKILL.md | { error: forbidden_gate_waiver_language }
  - POST: Skill forbids YAML writes and gate waivers; references tied_feedback_capture_observation
  - EFFECTS: tied-install copies skill to client .cursor/skills/

## SLICE_C_CROSS_LINKS

- [IMPL-TIED_HARNESS_TRACE_OBSERVATION] [ARCH-TIED_HARNESS_TRACE_OBSERVATION] [REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP] Additive cross-links in operator checklist, LangChain comparison Phase 1 row, pre-handoff charter, client-development-index, feedback vocab.
- Contract:
  - INPUT: Committed guide path; REQ token id
  - PRE: No authority-boundary regression vs REQ-TIED_HARNESS_PLATFORM_SEAM
  - OUTPUT: Updated markdown files with resolvable relative links
  - POST: LangChain Phase 1 marked Implemented with doc/REQ links when implement complete

## SLICE_D_DOC_CONTRACT_TEST

- [IMPL-TIED_HARNESS_TRACE_OBSERVATION] [ARCH-TIED_HARNESS_TRACE_OBSERVATION] [REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP] RED then GREEN bootstrap test locking required guide sections.
- Contract:
  - INPUT: REQUIRED_MARKERS list in harness-trace-observation-loop-doc.test.mjs
  - PRE: RED test committed and failing before guide body complete
  - OUTPUT: node --test pass | { error: missing_marker }
  - POST: Test references REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP token in describe title
