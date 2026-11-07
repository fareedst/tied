# Test strategy — REQ-TIED_LANGWATCH_AGENT_REFACTOR_WAVE3

**depth_tier:** `minimal`  
**gate_policy:** `advisory`

## refine-plan (planning artifacts)

| Check | Method | Expected |
| --- | --- | --- |
| CITDP + PLAN + Tracker | File presence | Complete through test-strategy |
| IMPL pseudo-code token comments | `pseudocode_validate` `gate_mode` on sidecar | Pass before pre_implementation |
| Plan gate | `tied_checklist_gate_validate` / `tied_gate_check` `pre_implementation` | `allowed: true` |
| Matrix RED test file | Presence only | Test **fails** until slice A GREEN |

## build-plan / implement (Slices A–H)

### Mandatory order

1. **RED:** `node --test tools/bootstrap/lib/methodology-composition-matrix-langwatch-row.test.mjs` — fails on 17-row baseline until slice A.
2. **RED:** Extend `harness-trace-observation-loop-doc.test.mjs` — markers: `langwatch`, `REQ-TIED_LANGWATCH_AGENT_REFACTOR_WAVE3`, **LangWatch-reported**.
3. **RED:** Extend `incident-revert-eval-corpus-doc.test.mjs` — `merge_miss` case kind.
4. **RED:** Extend `session-handoff-structure-doc.test.mjs` — **Port backlog** section.
5. **GREEN:** Implement slices per PLAN; optional eval-framework substring test if no dedicated test exists.
6. **Verify:** `tied_validate_consistency`; verification gate receipt.

### Regression boundaries

- No new prompt-type skills; no default agentstream preflight flip.
- No edits to gitignored `docs/comparisons/langwatch-rebuilding-*.md` unless sponsor later allowlists.
- No comparable-arms scanner (evaluation charter Phase 3 defer).

### Verification commands (close-out)

```bash
node --test tools/bootstrap/lib/methodology-composition-matrix-langwatch-row.test.mjs
node --test tools/bootstrap/lib/harness-trace-observation-loop-doc.test.mjs
node --test tools/bootstrap/lib/incident-revert-eval-corpus-doc.test.mjs
node --test tools/bootstrap/lib/session-handoff-structure-doc.test.mjs
```
