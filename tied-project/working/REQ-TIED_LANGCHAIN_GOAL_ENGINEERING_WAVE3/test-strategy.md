# Test strategy — REQ-TIED_LANGCHAIN_GOAL_ENGINEERING_WAVE3

**depth_tier:** `minimal`  
**gate_policy:** `advisory`  
**Primary proof:** Doc contract tests + matrix row 20 test + `tied_validate_consistency` after R+A+I registration.

## refine-plan (planning artifacts)

| Check | Method | Expected |
| --- | --- | --- |
| PLAN slices A–H | Manual | G + H in scope; vocab Defer |
| CITDP wrapper key | YAML lint | `CITDP-REQ-TIED_LANGCHAIN_GOAL_ENGINEERING_WAVE3` top-level |
| IMPL draft token comments | Manual | Every block names REQ/ARCH/IMPL |
| pre_implementation gate | `tied_checklist_gate_validate` | **allowed:false** until author-requirement — [refine-pass2-gate-note.md](evidence/refine-pass2-gate-note.md) |
| Row 20 draft | PLAN Appendix A | Distinct label from row 15 harness |

## build-plan — Slice A contract test

**File:** `tools/bootstrap/lib/goal-engineering-feedback-scope-compose-doc.test.mjs`

**Required markers (minimum):**

- `REQ-TIED_LANGCHAIN_GOAL_ENGINEERING_WAVE3`
- `## Proof boundary`
- `## Scope slice`
- `## Feedback-batch analog table`
- `## Tacit-context catalog`
- `## Pair-read`
- `langchain-goal-engineering-vs-tied-agent-management.md`
- `langchain-harness-engineering-vs-tied-agent-management.md`
- `not_measured`
- `tied_checklist_gate_validate`
- `goal-aligned scope` (case-insensitive in guide or CITDP pointer)

## build-plan — Slice B

- Assert client-development-index Quick reads links compose guide + goal comparison.

## build-plan — Slice C

- Checklist exists; links HPS authority checklist and goal comparison; ≥6 rows.

## build-plan — Slice D

- `citdp-policy.md` or template contains `goal-aligned` or `tacit` near change-definition guidance.

## build-plan — Slice E

- Comparison phased table Phase 1 not **Defer**; metadata links REQ token and compose guide.

## build-plan — Slice G

**File:** `tools/bootstrap/lib/methodology-composition-matrix-goal-engineering-row.test.mjs`

- §2 **exactly 20** data rows
- Row 20 includes `LangChain goal engineering` and `REQ-TIED_LANGCHAIN_GOAL_ENGINEERING_WAVE3`
- `sponsor_notes` references pair **14–15** or **14–15** pattern
- `LangChain-reported` in sponsor_notes

## build-plan — Slice H (matrix test reconciliation)

| Check | Expected |
| --- | --- |
| Run full bootstrap doc tests touching `methodology-composition-matrix*.test.mjs` | All green |
| No two tests assert different §2 totals | goal-engineering test owns **20** |
| langchain-row test | Row **15** identity survives |

## build-plan — Slice F

| Check | Expected |
| --- | --- |
| `pseudocode_validate` IMPL gate_mode | Pass |
| `tied_validate_consistency` | Pass |
| Doc contract tests | Green |

## Regression boundaries

- No new MCP gate tools; no Actively/Hone integration.
- Row **15** harness content unchanged except optional cross-link to row 20 in sponsor_notes.
- Do not claim business-metric optimization as TIED proof.

## close-out

| Check | Expected |
| --- | --- |
| verification / close_out gates | Per minimal doc-only arc |
| Vocab VALIDATE | Defer RECORD unless sponsor expands |