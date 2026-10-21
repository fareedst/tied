# Test strategy — REQ-TIED_HARNESS_PLATFORM_SEAM

**depth_tier:** `minimal`  
**gate_policy:** `advisory`  
**Primary proof:** Documentation audit + TIED consistency (no production behavior change required for add-feature planning gate).

## add-feature (planning artifacts)

| Check | Method | Expected |
| --- | --- | --- |
| IMPL pseudo-code token comments | `pseudocode_validate` gate_mode | Pass |
| REQ/ARCH/IMPL traceability | `tied_validate_consistency` | Pass |
| Plan gate | `tied_checklist_gate_validate` `pre_implementation` | `allowed` |

## build-plan (slices A–F)

### Slice A — Session bootstrap

- Manual: locate bootstrap steps in AGENTS.md / tied-yaml skill / agentstream README.
- Assert: comparison doc or checklist linked; `tied_config_get_base_path` named before YAML mutation.
- If code hook added: agentstream unit test for preflight flag documentation only (no default flip) OR README snapshot test if project has one.

### Slice B — Prompt activation map

- Manual: every leaf prompt type row has TIED applicability column.
- Assert: no phrase implying gate waiver for `non-tied-plan` / `question`.

### Slice C — Agentstream README

- Manual: "compose, don't replace" subsection present; cross-link to `tied_checklist_gate_validate`.

### Slice D — Operator checklist

- File exists: `authority-boundary-operator-checklist.md`
- Link check: comparison doc + sponsor-agent-relationship resolve.

### Slice E — Matrix row 13

- Manual: row 13 mechanism cells match concrete in-repo tools; no fleet TBAC claims.

### Slice F — Tool input cross-ref (executed with Slice A)

- Manual: Slice A bootstrap seam docs mention REQ-TIED_TOOL_INPUT_COMPATIBILITY / TIED_CLI_HINDRANCE once (no separate file pass).

## Regression boundaries

- Do not change default `AGENTSTREAM_TIED_MCP_PREFLIGHT` without explicit costly-choice CITDP update.
- MCP write isolation and gate semantics unchanged.

## Security / assurance

- **Assurance profile:** documentation-only (no `external-input-security` activation for minimal depth).
- If build-plan adds behavior-changing preflight defaults → re-run impact discovery at `integrated`.

## close-out (refine-plan pass 2)

| Check | Method | Expected |
| --- | --- | --- |
| Envelope | `run-close-out-gates.mjs --envelope-blocking --skip-manifest` | `blocking_gap_count=0` |
| Machine close-out | `tied_checklist_gate_validate` `phase: close_out` | `allowed: true` |
| Vocab | Touchpoint 3 VALIDATE before commit | Pass or documented deferral |
| REQ status | Optional `tied_verify` with update | **Planned → Implemented** only if sponsor wants promotion after gates |
| Tests | N/A (docs-only) | Manifest skipped; note **partial** process contract in handoff |
| Staging | Scoped map in PLAN close-out section | No unrelated EDPC/dogfood/local MCP paths |
