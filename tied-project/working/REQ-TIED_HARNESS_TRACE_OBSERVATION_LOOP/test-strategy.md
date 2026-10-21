# Test strategy — REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP

**depth_tier:** `minimal`  
**gate_policy:** `advisory`

## refine-plan (planning artifacts)

| Check | Method | Expected |
| --- | --- | --- |
| CITDP + PLAN + Tracker | File presence | Complete through test-strategy |
| IMPL pseudo-code token comments | `pseudocode_validate` `gate_mode` on sidecar | Pass before pre_implementation |
| Plan gate | `tied_checklist_gate_validate` `pre_implementation` | `allowed: true` |

## add-feature / build-plan (Slices A–D)

### Mandatory order

1. **RED:** Add `tools/bootstrap/lib/harness-trace-observation-loop-doc.test.mjs` with required section markers (pattern: [pre-handoff-charter-doc.test.mjs](../../../tools/bootstrap/lib/pre-handoff-charter-doc.test.mjs)).
2. **Slice A:** Author `tied-bundle/docs/harness-trace-observation-loop.md` until doc test green.
3. **Slice B:** Add `harness-trace-review` bundled skill; update prompt-type inventory docs/tests per REQ-PROMPT_TYPE_GLOBAL_SKILLS.
4. **Slice C:** Cross-link audit (relative links from `docs/comparisons/` and `tied-bundle/docs/`).
5. **Slice D:** Optional bootstrap test: skill references guide path and forbids gate-waiver phrasing.

### test-strategy executable matrix (acceptance)

Guide must include a normative table requiring, for TIED-tracked implement passes:

| Field | Required content |
| --- | --- |
| RED command(s) | Concrete shell/test commands |
| Green command(s) | Same suite after implementation |
| Verification gate | `tied_checklist_gate_validate` phase + receipt path pattern |
| Proof line | Explicit rejection of model self-check as sole proof |

### Regression boundaries

- Do not add new checklist slugs or MCP write paths.
- **`tied_feedback_capture_observation`:** at most one capture per review batch idempotency key unless sponsor notes duplicate.
- Default agentstream preflight unchanged.

## verification gate

| Check | Method | Expected |
| --- | --- | --- |
| Doc contract | `node --test tools/bootstrap/lib/harness-trace-observation-loop-doc.test.mjs` | Pass |
| Prompt-type contract | Existing `prompt-type-skills` tests if inventory changed | Pass |
| TIED graph | `tied_validate_consistency` | Pass |
| Checklist | `tied_checklist_gate_validate` `verification` | `allowed: true` |

## close-out

Deferred until sponsor `/close-out` with envelope sync per completion-signals-handoff.
