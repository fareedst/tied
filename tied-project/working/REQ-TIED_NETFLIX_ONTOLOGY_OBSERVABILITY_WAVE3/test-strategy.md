# Test strategy — REQ-TIED_NETFLIX_ONTOLOGY_OBSERVABILITY_WAVE3

**depth_tier:** `minimal`  
**gate_policy:** `advisory`

## refine-plan (planning artifacts)

| Check | Method | Expected |
| --- | --- | --- |
| CITDP + PLAN + Tracker | File presence | Complete through test-strategy |
| IMPL pseudo-code token comments | `pseudocode_validate` `gate_mode` on sidecar | Pass before pre_implementation |
| Plan gate | `tied_checklist_gate_validate` `pre_implementation` | `allowed: true` |

## build-plan / implement (Slices A–E)

### Mandatory order

1. **RED:** `tools/bootstrap/lib/methodology-composition-matrix-netflix-row.test.mjs` — mirror LangChain row test structure; before GREEN must fail on:
   - matrix status `§2 **16** rows` / 16 data rows (current repo baseline)
   - after GREEN: `§2 **17** rows`, `exactly **17** data rows`, `deepEqual` row ids `1..17`
   - row 17 table line: framework label, `netflix-ontology-driven-observability-vs-tied-agent-management.md`, **`Netflix-reported`** in `sponsor_notes`, rows **14–15** pairing in `sponsor_notes`
   - evidence cells: `vocabulary-layer-tied-leap-citdp.md`, `harness-trace-observation-loop.md` (path substrings)
2. **RED:** Extend `tools/bootstrap/lib/harness-trace-observation-loop-doc.test.mjs` — append markers: `netflix-ontology-driven-observability-vs-tied-agent-management.md`, `REQ-TIED_NETFLIX_ONTOLOGY_OBSERVABILITY_WAVE3` (and optional `## Source studies (Netflix compose)` heading if added).
3. **Slice A GREEN:** Matrix row 17 + Netflix comparison phased table **Implemented** + LEAP SC-MCM-DOC on [REQ-TIED_METHODOLOGY_COMPOSITION_MATRIX](../../requirements/REQ-TIED_METHODOLOGY_COMPOSITION_MATRIX.yaml).
4. **Slice B GREEN:** [vocabulary-layer-tied-leap-citdp.md](../../../tied-bundle/docs/vocabulary-layer-tied-leap-citdp.md) operational-identity subsection; [harness-trace-observation-loop.md](../../../tied-bundle/docs/harness-trace-observation-loop.md) Netflix source study.
5. **Slice C GREEN:** Sibling backlinks (langchain, anthropic FV, tied-vs-well-known; confirm ontology siblings).
6. **Slice D GREEN:** [external-service-three-wave-comparison-template.md](../../../tied-bundle/docs/external-service-three-wave-comparison-template.md) worked example; [client-development-index.md](../../../tied-bundle/docs/client-development-index.md) cross-ref.
7. **Slice 0 (optional):** Stage Wave 1–2 paths from non-tied handoff if sponsor wants single commit.

### test-strategy executable matrix (acceptance)

| Field | Required content |
| --- | --- |
| RED command(s) | `node --test tools/bootstrap/lib/methodology-composition-matrix-netflix-row.test.mjs` and HTOL doc test before GREEN |
| Green command(s) | Same suite after implementation |
| Verification gate | `tied_checklist_gate_validate` `verification` + receipt under `gates/` |
| Proof line | Matrix row and doc changes do not claim Netflix RCA or SEV metrics as TIED effectiveness |

### Regression boundaries

- No new prompt-type skills; no `PROMPT_TYPE_LEAF_IDS` changes.
- No MCP gate tools; no SPARQL/QuipuDB product code.
- Default agentstream preflight unchanged.
- Comparison markdown bodies do not mint new REQ tokens.

### Verification commands (close-out)

```bash
node --test tools/bootstrap/lib/methodology-composition-matrix-netflix-row.test.mjs
node --test tools/bootstrap/lib/harness-trace-observation-loop-doc.test.mjs
.cursor/skills/tied-yaml/scripts/tied-cli.sh tied_validate_consistency '{}'
```
