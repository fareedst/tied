# Test strategy — REQ-TIED_OPEN_GOVERNANCE_SENSING_WAVE3

**depth_tier:** `minimal`  
**gate_policy:** `advisory`  
**Primary proof:** Doc contract tests + `tied_validate_consistency` after R+A+I registration.

## refine-plan (planning artifacts)

| Check | Method | Expected |
| --- | --- | --- |
| PLAN slices A–G disposition | Manual | G OutOfScope; F2 optional |
| CITDP wrapper key | YAML lint | `CITDP-REQ-TIED_OPEN_GOVERNANCE_SENSING_WAVE3` top-level |
| IMPL draft token comments | Manual | Every block names REQ/ARCH/IMPL |
| pre_implementation gate | `tied_checklist_gate_validate` | **allowed:false** until author-requirement — see [refine-pass1-gate-note.md](evidence/refine-pass1-gate-note.md) |

## build-plan — Slice A contract test

**File:** `tools/bootstrap/lib/governance-sensing-proof-boundary-compose-doc.test.mjs`

**Required markers (minimum):**

- `REQ-TIED_OPEN_GOVERNANCE_SENSING_WAVE3`
- `## Proof boundary`
- `## Scope slice`
- `## Mercaptan analog table`
- `## Odourless-zone catalog`
- `## Pair-read`
- `open-governance-cannot-sense-vs-tied-agent-management.md`
- `andras-ludanyi-illusion-of-measurement-judgment-cooperation-vs-tied-agent-management.md`
- `not_measured`
- `tied_checklist_gate_validate`

**Run:** include in existing bootstrap doc test battery (same pattern as `harness-trace-observation-loop-doc.test.mjs`).

## build-plan — Slice B

- Assert new client-development-index substring links compose guide + both comparisons.

## build-plan — Slice C

- Checklist exists; links HPS authority checklist and Open Governance comparison.

## build-plan — Slice D

- `citdp-policy.md` or template contains `odourless` (case-insensitive) near change-definition guidance.

## build-plan — Slice E

- Comparison phased table Phase 1 not **Defer**; metadata links REQ token.

## build-plan — Slice F

| Check | Expected |
| --- | --- |
| `pseudocode_validate` IMPL gate_mode | Pass |
| `tied_validate_consistency` | Pass |
| Doc contract test | Green |

## build-plan — Slice F2 (optional)

- HTOL guide section `Open Governance` + extended marker in `harness-trace-observation-loop-doc.test.mjs`
- If skipped: evidence note `F2-not-run`

## Regression boundaries

- No new MCP gate tools; no default preflight flip.
- Do not claim organizational sensing as TIED scope.

## close-out

| Check | Expected |
| --- | --- |
| verification / close_out gates | Per minimal doc-only arc |
| Vocab VALIDATE | Defer RECORD unless sponsor added |