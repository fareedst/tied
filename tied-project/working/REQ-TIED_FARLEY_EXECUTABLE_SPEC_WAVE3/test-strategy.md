# Test strategy — REQ-TIED_FARLEY_EXECUTABLE_SPEC_WAVE3

**depth_tier:** `minimal`  
**gate_policy:** `advisory`  
**Primary proof:** Doc contract tests + MCM row test + `tied_validate_consistency` after R+A+I registration.

## refine-plan

| Check | Status |
| --- | --- |
| PLAN slices A–H + Appendix row 21 | complete (2026-11-17) |
| CITDP wrapper (working) | complete |
| IMPL working pseudo-code sidecar | complete |
| `pseudocode_validate` gate_mode | **ok** on working sidecar (2026-11-17); re-run after promotion to `implementation-decisions/` |
| `pre_implementation` gate | pending author-requirement (MCP mint) |

## build-plan — Slice A contract test

**File:** `tools/bootstrap/lib/farley-executable-spec-compose-doc.test.mjs`

**Required markers (minimum):**

- `REQ-TIED_FARLEY_EXECUTABLE_SPEC_WAVE3`
- `## Proof boundary`
- `## Scope slice`
- `## Executable acceptance vs IMP pseudo-code`
- `## Red-first and protected contract`
- `## Markdown SDD vs running examples`
- `## Pair-read`
- `## CITDP prompt`
- `## Anti-patterns`
- `dave-farley-spec-must-be-executable-vs-tied-agent-management.md`
- `ai-sdlc-atdd-software-factory-vs-tied.md`
- `persante-sdd-skills-vs-tied-agent-management.md`
- `not_measured`
- `tied_verify`
- `tied_checklist_gate_validate`

## build-plan — Slice G matrix test

**File:** `tools/bootstrap/lib/methodology-composition-matrix-farley-executable-spec-row.test.mjs`

- §2 exactly **21** data rows
- Row **21** label includes `Executable specification (Farley`
- Row references `REQ-TIED_FARLEY_EXECUTABLE_SPEC_WAVE3` and `farley-executable-spec-compose.md`
- Header inventory text **21** rows

## build-plan — Slice H

- Narrow `methodology-composition-matrix-goal-engineering-row.test.mjs` global count (ownership → Farley test)
- Legacy row identity tests unchanged except count reconciliation if any still assert 20 globally

## build-plan — Slices B–E

| Slice | Assertion |
| --- | --- |
| B | client-development-index links compose guide + Farley comparison + REQ token |
| C | `executable-spec-operator-checklist.md` exists; links pre-handoff charter |
| D | citdp-policy or template mentions executable behavioral contract |
| E | Comparison phased table Phase **1** **Implemented** with REQ token |

## Close

- `tied_validate_consistency`
- `pseudocode_validate` IMPL gate_mode before pre_implementation gate retry