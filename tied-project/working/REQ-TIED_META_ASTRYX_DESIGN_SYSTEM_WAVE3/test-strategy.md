# Test strategy — REQ-TIED_META_ASTRYX_DESIGN_SYSTEM_WAVE3

**depth_tier:** `minimal`  
**gate_policy:** `advisory`  
**Primary proof:** Doc contract tests + `tied_validate_consistency` after R+A+I registration.

## refine-plan

| Check | Status |
| --- | --- |
| PLAN slices + staging map | pass 1 complete (2026-11-17) |
| CITDP wrapper (working) | complete |
| IMPL working pseudo-code sidecar | complete |
| `pseudocode_validate` gate_mode | **ok** (2026-11-17, working sidecar) |
| `pre_implementation` gate | deferred — author-requirement pending until MCP mint |

## build-plan — Slice A contract test

**File:** `tools/bootstrap/lib/meta-astryx-ds-agent-plane-compose-doc.test.mjs`

**Required markers (minimum):**

- `REQ-TIED_META_ASTRYX_DESIGN_SYSTEM_WAVE3`
- `## Proof boundary`
- `## Scope slice`
- `## AGENTS.md and init vs TIED install`
- `## Knowledge records vs token graph`
- `## Vibe tests vs gates`
- `## Pair-read`
- `## CITDP prompt`
- `## Anti-patterns`
- `meta-astryx-design-system-vs-tied-agent-management.md`
- `google-agent-skills-vs-tied-agent-management.md`
- `persante-sdd-skills-vs-tied-agent-management.md`
- `not_measured`
- `tied_verify`
- `tied_checklist_gate_validate`
- `current` (knowledge record authority)

## build-plan — Slices B–E

| Slice | Assertion |
| --- | --- |
| B | client-development-index links compose guide + Meta Astryx comparison + REQ token |
| C | `ds-agent-plane-operator-checklist.md` exists; links HPS authority checklist |
| D | `harness-platform-taxonomy.md` mentions design-system agent plane or links compose guide |
| E | Comparison phased table Phase **1** **Implemented** with REQ token; Phases 2–3 Defer |

## build-plan — Slice G/H

- Matrix §2 row: **not run** (OutOfScope v1)
- Vibe / agent-inject e2e: **not run** (Defer)

## Close

- `tied_validate_consistency`
- `pseudocode_validate` IMPL gate_mode before pre_implementation gate retry