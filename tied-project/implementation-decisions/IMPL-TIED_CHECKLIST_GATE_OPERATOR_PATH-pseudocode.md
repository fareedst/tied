# [IMPL-TIED_CHECKLIST_GATE_OPERATOR_PATH] [ARCH-TIED_CHECKLIST_GATE_OPERATOR_PATH] [REQ-TIED_CHECKLIST_GATE_OPERATOR_PATH] — Operator path docs and composition test.

Grammar-Version: v2

## Skill operator section

- [IMPL-TIED_CHECKLIST_GATE_OPERATOR_PATH] [ARCH-TIED_CHECKLIST_GATE_OPERATOR_PATH] [REQ-TIED_CHECKLIST_GATE_OPERATOR_PATH] Add **Checklist gate operator path** section to bundled tied-yaml SKILL.md before Close-out recovery.
procedure SKILL_CHECKLIST_GATE_OPERATOR_SECTION:
  # [IMPL-TIED_CHECKLIST_GATE_OPERATOR_PATH] [ARCH-TIED_CHECKLIST_GATE_OPERATOR_PATH] [REQ-TIED_CHECKLIST_GATE_OPERATOR_PATH] How: prose + CLI/MCP examples; forbid pipe into tied_checklist_gate_validate.
  Contract:
    INPUT: bundled skill paths under tools/bundled-tied-yaml-skill/
    OUTPUT: SKILL.md and reference.md updated
    PRE: REQ stack on disk
    POST: skill contains anti-pattern string, tied_gate_check example with path args
    EFFECTS: file write
  - FORBID node -e require(yaml) piped into tied-cli tied_checklist_gate_validate
  - DOCUMENT tied gate check and MCP tied_gate_check with citdp_path, tracker_path, project_root
  - NOTE tied_checklist_gate_validate requires inline citdp record when called directly

## Composition test extension

- [IMPL-TIED_CHECKLIST_GATE_OPERATOR_PATH] [ARCH-TIED_CHECKLIST_GATE_OPERATOR_PATH] [REQ-TIED_CHECKLIST_GATE_OPERATOR_PATH] Extend gate-check composition tests to load working REQ CITDP paths.
procedure EXTEND_GATE_CHECK_COMPOSITION_TEST:
  # [IMPL-TIED_CHECKLIST_GATE_OPERATOR_PATH] [ARCH-TIED_CHECKLIST_GATE_OPERATOR_PATH] [REQ-TIED_CHECKLIST_GATE_OPERATOR_PATH] How: extend gate-check.test.ts paths.
  Contract:
    INPUT: working CITDP + tracker under tied-project/working/REQ-TIED_CHECKLIST_GATE_OPERATOR_PATH/
    OUTPUT: test case in mcp-server/packages/cli/src/gate-check.test.ts
    PRE: dist gate-check-composition built
    POST: mocked gate returns allowed; paths resolve from repo root
    EFFECTS: test IO
  - CALL runGateCheckComposition with REQ-TIED_CHECKLIST_GATE_OPERATOR_PATH paths
  - ASSERT exit_code 0 when mock allows

## Skill surface static test

procedure SKILL_SURFACE_STATIC_TEST:
  # [IMPL-TIED_CHECKLIST_GATE_OPERATOR_PATH] [REQ-TIED_CHECKLIST_GATE_OPERATOR_PATH] How: read SKILL.md; assert substrings.
  Contract:
    INPUT: tools/bundled-tied-yaml-skill/SKILL.md
    OUTPUT: passing node:test
    EFFECTS: read-only
  - ASSERT contains "tied_gate_check" and forbidden pipe pattern markers
