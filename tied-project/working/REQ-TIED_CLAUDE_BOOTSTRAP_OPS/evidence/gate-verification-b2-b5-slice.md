# Gate evidence — verification (B2–B5 slice)

**REQ:** REQ-TIED_CLAUDE_BOOTSTRAP_OPS  
**Scope:** GATE_SYMLINK_ON_WINDOWS_PROOF, CONFIG_SKILLS_REROOT defer, SPIKE_CLAUDE_ADHERENCE_HOOKS N/A, REFRESH_COMPARISON_PLAN_DOC (not full REQ close-out)  
**Run id:** build-plan-b2-b5-2026-09-23  
**Result:** `allowed: true`, `blocking: false`, `depth: minimal`  
**Advisory:** `minimal_depth_missing_waiver`; `hydration_envelope_gaps_missing` (envelope not rebuilt for slice)

## Receipts

- `working/REQ-TIED_CLAUDE_BOOTSTRAP_OPS/gates/pre_implementation-2026-09-24T03-31-35-474Z.json`
- `working/REQ-TIED_CLAUDE_BOOTSTRAP_OPS/gates/verification-2026-09-24T03-31-35-701Z.json`

## Tests

- `node --test tools/bootstrap/lib/claude-harness.test.mjs` — **11 pass** (includes GATE_SYMLINK RED/GREEN)

## Pseudocode

- `pseudocode_validate` IMPL-TIED_CLAUDE_BOOTSTRAP_OPS — **ok=true**, 0 diagnostics (after LEAP symlink tied-yaml note)

## Consistency

- `tied_validate_consistency` — **ok=true**

## Close-out

**Deferred** — machine close-out requires `sub-close-out-evidence-sync` (envelope validate + disposition sync).

**LEAP note (2026-09-24, R2):** `windows_copy_proven_in_ci` is **true** globally ([`constants.mjs`](../../../tools/bootstrap/lib/constants.mjs); [`windows-claude-smoke-proof.md`](windows-claude-smoke-proof.md)). CONFIG_SKILLS_REROOT (B3) remains **deferred** by close-out disposition — see [`skills-reroot-deferred.md`](skills-reroot-deferred.md).
