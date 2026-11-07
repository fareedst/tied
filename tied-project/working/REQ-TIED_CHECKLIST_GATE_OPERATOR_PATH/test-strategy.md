# Test strategy — REQ-TIED_CHECKLIST_GATE_OPERATOR_PATH

**Depth:** minimal · **gate_policy:** advisory · **Refine passes:** 1–2 (2026-11-07)

## Proof boundary

| In scope | Out of scope |
| --- | --- |
| Composition test: `tied_gate_check` with `citdp_path` on working CITDP | E2E from broken `node -e` pipe (document only) |
| Static or contract test that skill files mention anti-pattern + `tied_gate_check` | Full agentstream turn replay |
| Optional unit test for CLI `recovery_hint` if implemented | Rewriting gate validator fixtures |

## Cases (RED in build-plan)

1. **Gate path composition** — Extend or mirror [REQ-TIED_DAE_INCORPORATION] coverage in `mcp-server/packages/cli/src/gate-check.test.ts`: invoke `runGateCheckComposition` / CLI spawn with:
   - `request_token`: `REQ-TIED_CHECKLIST_GATE_OPERATOR_PATH`
   - `phase`: `pre_implementation`
   - `citdp_path`: `tied-project/working/REQ-TIED_CHECKLIST_GATE_OPERATOR_PATH/CITDP-REQ-TIED_CHECKLIST_GATE_OPERATOR_PATH.yaml`
   - `project_root`: store root
   - Expect `allowed: true` at minimal depth after tracker/CITDP dispositions satisfy gate (may need checklist steps marked for build-plan).

2. **Skill surface** — Test or lint script asserts `tools/bundled-tied-yaml-skill/SKILL.md` and `reference.md` contain:
   - Explicit prohibition of piping into `tied_checklist_gate_validate`
   - At least one `tied_gate_check` or `tied gate check` example with path args

3. **Kaizen hygiene (manual/MCP)** — After Wave 0:
   - Export JSON lists reconciled `promotion_status` values
   - `lint_yaml` on `tied-project/feedback.yaml`

4. **Stretch — CLI hint** — If RED for hindrance messaging:
   - Simulate empty stdin to tied-cli gate tool call; stderr includes `recovery_hint` substring documented in IMPL

## Verification gate

- `tied_checklist_gate_validate` / `tied_gate_check` `phase: verification` with receipt under `working/REQ-TIED_CHECKLIST_GATE_OPERATOR_PATH/gates/`
- `tied_validate_consistency` after REQ/ARCH/IMPL indexes updated
- Existing MCP regression suites unaffected (`npm run test` scoped to touched tests first per [PROC-TIED_DEV_CYCLE])

## Security / data

No new persistence, network, or secrets. `feedback.yaml` edits are operator-reviewed status fields only.
