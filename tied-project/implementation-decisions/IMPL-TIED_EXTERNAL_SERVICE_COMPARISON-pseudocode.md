# [IMPL-TIED_EXTERNAL_SERVICE_COMPARISON] [ARCH-TIED_EXTERNAL_SERVICE_COMPARISON] [REQ-TIED_EXTERNAL_SERVICE_COMPARISON] — Bundled external service comparison skill (slices A–C).

Grammar-Version: v2

## SLICE_A_AUTHOR_SKILL_PACKAGE

- [IMPL-TIED_EXTERNAL_SERVICE_COMPARISON] [ARCH-TIED_EXTERNAL_SERVICE_COMPARISON] [REQ-TIED_EXTERNAL_SERVICE_COMPARISON] Author explicit-only skill trio referencing external-service-three-wave-comparison-template.md and forbidding gate/YAML authority claims.
- Contract:
  - INPUT: PLAN procedure; harness-trace-review skill pattern; claim label vocabulary
  - PRE: pre_implementation gate allowed; RED skill contract test committed and failing
  - OUTPUT: tools/bundled-prompt-type-skills/external-service-comparison/{SKILL.md,reference.md,examples.md} | { error: forbidden_gate_waiver_language }
  - POST: SKILL.md under 500 lines; disable-model-invocation true; mandatory DOC-{SLUG}-COMPARISON before comparison docs
  - EFFECTS: tied-install copies skill to client .cursor/skills/external-service-comparison/

## SLICE_B_WIRE_INVENTORY_AND_TESTS

- [IMPL-TIED_EXTERNAL_SERVICE_COMPARISON] [ARCH-TIED_EXTERNAL_SERVICE_COMPARISON] [REQ-TIED_EXTERNAL_SERVICE_COMPARISON] Extend METHODOLOGY_HARNESS_SKILLS, manifest PROMPT_TYPE_SKILL_DIRS, PROMPT_TYPE_LEAF_IDS, and bootstrap contract test.
- Contract:
  - INPUT: REQ-PROMPT_TYPE_GLOBAL_SKILLS inventory rules
  - PRE: Slice A skill paths stable
  - OUTPUT: Green node --test external-service-comparison-skill.test.mjs and prompt-type-skills e2e | { error: missing_skill_dir }
  - POST: Skill not in LEAF_SKILLS (13) or router dispatch
  - EFFECTS: Enrollment validator accepts surface_ref external-service-comparison

## SLICE_C_CROSS_LINKS

- [IMPL-TIED_EXTERNAL_SERVICE_COMPARISON] [ARCH-TIED_EXTERNAL_SERVICE_COMPARISON] [REQ-TIED_EXTERNAL_SERVICE_COMPARISON] Update template Wave table, prompt-type-skills.md, client-development-index, prompt-composer methodology harness list, bundled README inventory.
- Contract:
  - INPUT: Committed skill name external-service-comparison
  - PRE: No methodology YAML mutation in tied-bundle indexes
  - OUTPUT: Resolvable relative links to template and worked examples
  - POST: Wave 1 default prompt-type references @external-service-comparison
  - EFFECTS: RECORD external service comparison term in prompt-composer if absent
