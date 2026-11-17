# Test strategy — REQ-TIED_FURMANOV_FACTORY_PROFILE_WAVE3

**depth_tier:** `minimal`  
**gate_policy:** `advisory`  
**Primary proof:** Doc contract tests + `tied_validate_consistency` after R+A+I registration.

## refine-plan

| Check | Status |
| --- | --- |
| PLAN slices + staging map | pass 2 complete |
| `pseudocode_validate` gate_mode | **ok** (2026-11-17) |
| `pre_implementation` gate | deferred to build-plan (RED test first) |

## build-plan — Slice A contract test

**File:** `tools/bootstrap/lib/furmanov-factory-profile-compose-doc.test.mjs`

**Required markers (minimum):**

- `REQ-TIED_FURMANOV_FACTORY_PROFILE_WAVE3`
- `## Proof boundary`
- `## Scope slice`
- `## Context and fork analog table`
- `## PASS vs structure catalog`
- `## check-trace vs gates table`
- `## Pair-read`
- `afurmanov-harness-profiler-vs-tied-agent-management.md`
- `langchain-harness-engineering-vs-tied-agent-management.md`
- `cursor-harness-engineering-vs-tied-agent-management.md`
- `not_measured`
- `tied_checklist_gate_validate`
- `check-trace`

## build-plan — Slices B–E

| Slice | Assertion |
| --- | --- |
| B | client-development-index links compose guide + Furmanov comparison |
| C | `factory-profile-operator-checklist.md` exists; links HPS authority checklist |
| D | `citdp-policy.md` mentions factory profile or harness PASS literacy |
| E | Comparison phased table Phase 2 **Implemented** with REQ token |

## build-plan — Slice G/H

- Matrix row: **not run**
- JSONL bridge: **not run**

## Close

- `tied_validate_consistency`
- `pseudocode_validate` IMPL gate_mode before pre_implementation gate retry