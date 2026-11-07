# Test strategy — REQ-PROMPT_TYPE_REFINE_BUILD_PHASE_GUARD

**Mode:** refine-plan locked. **Gate policy:** advisory. **depth_tier:** minimal.

No RED files in this pass.

---

## Unit / contract

| ID | Target | Intent |
| --- | --- | --- |
| **T-SKILL-CONTRACT-01** | `mcp-server/src/e2e/prompt-type-skills.test.ts` | `add-feature`, `refine-plan`, `build-plan` bodies reference `plan-build-sequence-guard.md`; refine-plan mentions `@build-plan` when `pre-implementation`; build-plan mentions `PLAN_BUILD_SEQUENCE_VIOLATION` or preflight |
| **T-SKILL-CONTRACT-02** | Same file | `prompt-execution-mode.md` or `prompt-skill-disk-handoff.md` links guard doc after build |

## Bootstrap / composition

| ID | Target | Intent |
| --- | --- | --- |
| **T-HANDOFF-LINT-01** | `tools/bootstrap/lib/plan-build-sequence-handoff.test.mjs` (new) | Fixture markdown: `plan_phase: pre-implementation` + Do next only `@close-out` → lint fails |
| **T-HANDOFF-LINT-02** | Same | Valid fixture: `pre-implementation` + Do next `@build-plan` → pass |

## Manual / doc

| ID | Artifact | Intent |
| --- | --- | --- |
| **T-VIOLATION-01** | `evidence/field-case-fb-mw68y52s.md` | Step replay of client 1794045120 maps to D4–D5 expected agent stops |

## Verification gate (build-plan)

- `node --test tools/bootstrap/lib/plan-build-sequence-handoff.test.mjs`
- `npm run test` (or project script that includes `prompt-type-skills.test.ts`)
- `tied_validate_consistency`
