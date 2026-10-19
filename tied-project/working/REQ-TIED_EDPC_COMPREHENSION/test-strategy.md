# Test strategy — REQ-TIED_EDPC_COMPREHENSION

**depth_tier:** `integrated` · **gate_policy:** `advisory`  
**Authority:** CITDP + this outline; RED before GREEN per `[PROC-TIED_DEV_CYCLE]`.

## Module matrix (validate before MCP wiring)

| Module | IMPL token | RED focus |
| --- | --- | --- |
| Access matrix validator | `IMPL-TIED_EDPC_ACCESS` | Tier enum closed; forbidden flags per tier (`compile`, `test`, `execute`, `source_write`); `production_touch` only when tier ≥ toolchain; charter/matrix path consistency; UNKNOWN tier rejected |
| Engagement facet | `IMPL-TIED_EDPC_ENGAGEMENT_FACET` | `edpc_full` + `easar_full` same acceptance; `report_only` + full engagement rejected; invalid engagement string; deprecation diagnostic present for alias |
| Workflow router | `IMPL-TIED_EDPC_ORCHESTRATION` | Golden routes from EDPC §13 examples; tier strips D/E when `source_static`; deterministic JSON; unknown question class → safe default B→F |
| Publish builder | `IMPL-TIED_EDPC_PUBLISH` | §16 minimum field check; `gaps[]` when tier blocks Observed; nested EASAR receipt refs resolved or gap; stable sort order |

**Fixture roots:** `mcp-server/test/fixtures/edpc/` (charters, matrices, minimal scm shells).

## Composition tests

1. Register four MCP tools in `tools/index.ts` discovery test — EASAR tool names unchanged.  
2. `tied_edpc_engagement_validate` + existing checklist gate payload with `edpc_full` tracker snippet.  
3. End-to-end fixture: validate access → route → publish with stub `inventory.v1` path in scm shell.

## Regression (must stay green)

```bash
npm test --prefix mcp-server -- easar-receipts engagement-facet brownfield-intent-evidence checklist-validator
npm run lint:ts --prefix mcp-server
```

## Dogfood (Slice 6)

- **Target:** this repo (`stdd`)  
- **Tier:** `toolchain_readonly`  
- **Workflows:** A (charter + matrix) → B (inventory + graph via existing MCP) → F (publish manifest)  
- **Evidence:** `tied-project/working/REQ-TIED_EDPC_COMPREHENSION/evidence/` envelope + gate JSON  
- **Not in dogfood:** D prod ops, source_change edits on target, CASE overlay

## Pseudo-code gate

Layer C `pseudocode_validate` with `gate_mode: true` on:

- `tied-project/implementation-decisions/IMPL-TIED_EDPC_ACCESS-pseudocode.md`
- `IMPL-TIED_EDPC_ORCHESTRATION-pseudocode.md`
- `IMPL-TIED_EDPC_PUBLISH-pseudocode.md`
- `IMPL-TIED_EDPC_ENGAGEMENT_FACET-pseudocode.md`

Before first RED in `mcp-server/src/edpc/`.

## Integrated inquiry (when armed)

Structural `sub-adversarial-inquiry-pass` before Slice 1 RED if CITDP keeps `depth_tier: integrated` — identity-bound four artifacts under `tied-bundle/working/REQ-TIED_EDPC_COMPREHENSION/adversarial-inquiry/` per `[REQ-TIED_ADVERSARIAL_INQUIRY]`.
