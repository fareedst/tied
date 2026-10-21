# Test strategy — REQ-TIED_HARNESS_LANGCHAIN_PHASE3

**depth_tier:** `minimal`  
**gate_policy:** `advisory`

## refine-plan (planning artifacts)

| Check | Method | Expected |
| --- | --- | --- |
| CITDP + PLAN + Tracker | File presence | Complete through test-strategy |
| IMPL pseudo-code token comments | `pseudocode_validate` `gate_mode` on sidecar | Pass before pre_implementation |
| Plan gate | `tied_checklist_gate_validate` `pre_implementation` | `allowed: true` |

## build-plan / add-feature implement (Slices B–E)

### Mandatory order

1. **RED:** `tools/bootstrap/lib/methodology-composition-matrix-langchain-row.test.mjs` — §2 row count **15**, row 15 anchors.
2. **RED:** `tools/bootstrap/lib/harness-trace-analyzer-skill.test.mjs` — skill contract.
3. **RED:** Extend `tools/bootstrap/lib/harness-trace-observation-loop-doc.test.mjs` — `## Outer loop (LangChain compose)`, `@harness-trace-analyzer`.
4. **RED:** Extend `mcp-server/src/methodology-production-system-enrollment/methodology-production-system-enrollment.test.ts` — both harness `surface_ref` values valid.
5. **Slice B GREEN:** Matrix row 15 + LangChain comparison Phase 3 **Implemented** + LEAP SC-MCM-DOC on [REQ-TIED_METHODOLOGY_COMPOSITION_MATRIX](../../requirements/REQ-TIED_METHODOLOGY_COMPOSITION_MATRIX.yaml).
6. **Slice C GREEN:** `harness-trace-analyzer/SKILL.md`, guide outer-loop section, prompt-type inventory (README, manifest, e2e, prompt-type-skills.md, prompt-composer.md if required).
7. **Slice D GREEN:** `PROMPT_TYPE_LEAF_IDS` append `harness-trace-review`, `harness-trace-analyzer`.
8. **Slice E:** Cross-links (client-development-index; optional cursor comparison one-liner).

### test-strategy executable matrix (acceptance)

| Field | Required content |
| --- | --- |
| RED command(s) | `node --test tools/bootstrap/lib/methodology-composition-matrix-langchain-row.test.mjs` (and analyzer-skill, observation-loop-doc tests) before GREEN |
| Green command(s) | Same suite after implementation |
| Verification gate | `tied_checklist_gate_validate` `verification` + receipt under `gates/` |
| Proof line | Matrix row and skill changes do not claim Terminal Bench or LangChain % as TIED effectiveness |

### Regression boundaries

- No LangSmith adapters; no new checklist slugs or gate MCP tools.
- No new Loop 3 experiment enrollment (Phase 2 `mle-htol-pilot-20261021-001` remains authoritative).
- Default agentstream preflight unchanged.
- **`tied_feedback_capture_observation`:** at most one capture per analyzer batch idempotency key unless sponsor documents duplicate.

### Verification commands (close-out)

```bash
node --test tools/bootstrap/lib/methodology-composition-matrix-langchain-row.test.mjs
node --test tools/bootstrap/lib/harness-trace-analyzer-skill.test.mjs
node --test tools/bootstrap/lib/harness-trace-observation-loop-doc.test.mjs
node --test mcp-server/src/methodology-production-system-enrollment/methodology-production-system-enrollment.test.ts
npm test --prefix mcp-server -- prompt-type-skills.test.ts
.cursor/skills/tied-yaml/scripts/tied-cli.sh tied_validate_consistency '{}'
```
