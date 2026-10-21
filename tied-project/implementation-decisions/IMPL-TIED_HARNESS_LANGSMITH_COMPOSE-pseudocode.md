# [IMPL-TIED_HARNESS_LANGSMITH_COMPOSE] [ARCH-TIED_HARNESS_LANGSMITH_COMPOSE] [REQ-TIED_HARNESS_LANGSMITH_COMPOSE] — Optional LangSmith export compose for HTOL inputs.

Grammar-Version: v2

## SLICE_A_MINT_TIED_STACK

- [IMPL-TIED_HARNESS_LANGSMITH_COMPOSE] [ARCH-TIED_HARNESS_LANGSMITH_COMPOSE] [REQ-TIED_HARNESS_LANGSMITH_COMPOSE] Register REQ/ARCH/IMPL and semantic tokens; pseudo-code before RED.
- Contract:
  - INPUT: PLAN refine; profile_depth minimal
  - PRE: tied_config_get_base_path confirms stdd tied-project
  - OUTPUT: Project YAML indexes + detail stubs | { error: token_collision }
  - POST: depends_on Phase 1–3 harness REQs and PROMPT_TYPE_GLOBAL_SKILLS

## SLICE_B_RED_TESTS

- [IMPL-TIED_HARNESS_LANGSMITH_COMPOSE] [ARCH-TIED_HARNESS_LANGSMITH_COMPOSE] [REQ-TIED_HARNESS_LANGSMITH_COMPOSE] RED skill + export script contract tests before GREEN artifacts.
- Contract:
  - INPUT: Forbidden gate-waiver patterns from harness-trace-analyzer-skill.test.mjs
  - PRE: pre_implementation gate allowed
  - OUTPUT: bootstrap test files | { error: test_passed_prematurely }
  - POST: Requires @harness-trace-review and @harness-trace-analyzer handoff, LANGSMITH_API_KEY env doc, not TIED core

## SLICE_C_GREEN_SKILL_AND_SCRIPT

- [IMPL-TIED_HARNESS_LANGSMITH_COMPOSE] [ARCH-TIED_HARNESS_LANGSMITH_COMPOSE] [REQ-TIED_HARNESS_LANGSMITH_COMPOSE] Ship explicit-only harness-trace-langsmith-compose skill and optional export-langsmith-traces.mjs.
- Contract:
  - INPUT: LangSmith run ids or project query; --out directory under working folder
  - PRE: Slice B RED failing
  - OUTPUT: SKILL.md + scripts/export-langsmith-traces.mjs | { error: forbidden_gate_waiver_language }
  - POST: Procedure ends with handoff paths for harness-trace-review/analyzer; no MCP YAML writes from skill
  - FAILURE_MODES: Missing API key → exit 2; network errors → exit 1 with DIAGNOSTIC prefix

## SLICE_D_GUIDE_AND_COMPARISON

- [IMPL-TIED_HARNESS_LANGSMITH_COMPOSE] [ARCH-TIED_HARNESS_LANGSMITH_COMPOSE] [REQ-TIED_HARNESS_LANGSMITH_COMPOSE] HTOL guide optional LangSmith compose subsection; LangChain comparison Phase 4 row; explicit non-adoption clarifies client tooling vs core.
- Contract:
  - INPUT: Proof boundary dual plane (core out / optional client compose in)
  - PRE: Guide contract test markers updated RED-first
  - OUTPUT: Updated harness-trace-observation-loop.md + langchain comparison phased table | { error: missing_marker }
  - POST: Vendor metrics remain LangChain-reported only

## SLICE_E_ENROLLMENT

- [IMPL-TIED_HARNESS_LANGSMITH_COMPOSE] [ARCH-TIED_HARNESS_LANGSMITH_COMPOSE] [REQ-TIED_HARNESS_LANGSMITH_COMPOSE] Extend PROMPT_TYPE_LEAF_IDS and METHODOLOGY_HARNESS_SKILLS for harness-trace-langsmith-compose surface_ref.
- Contract:
  - INPUT: mcp-server enrollment constants + e2e prompt-type-skills.test.ts
  - PRE: RED enrollment expects new leaf id valid
  - OUTPUT: GREEN constants + tests | { error: ENROLLMENT_INVALID_PROMPT_TYPE }
  - POST: Does not prove HTOL effectiveness

## SLICE_F_VERIFY

- [IMPL-TIED_HARNESS_LANGSMITH_COMPOSE] [ARCH-TIED_HARNESS_LANGSMITH_COMPOSE] [REQ-TIED_HARNESS_LANGSMITH_COMPOSE] Run test suite, verification gate, tied_validate_consistency; set REQ status Implemented when green.
- Contract:
  - INPUT: Checklist Tracker completion evidence
  - PRE: All slices green
  - OUTPUT: Gate receipt + consistency pass | { error: gate_blocked }
  - TERMINATION: Handoff to parent; no automatic git commit
