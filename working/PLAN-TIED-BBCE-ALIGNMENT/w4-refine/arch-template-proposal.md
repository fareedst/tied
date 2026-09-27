# ARCH template proposal — owning slice / shared mechanism (Mechanism D)

**Status:** Refine-only proposal for build-plan W4. **Not normative** until sponsor copies snippet into project ARCH detail or promotes template index.

## Recommended path

**Primary:** `templates/architecture-decisions/ARCH-BBCE_SLICE_OWNERSHIP_SNIPPET.yaml`

- Lives in TIED source `templates/` (same family as other ARCH samples).
- Build-plan W4 creates a **snippet** file with commented optional sections — not a registered project ARCH token unless sponsor LEAPs a dedicated `[ARCH-*]`.
- Clients receive structure only via methodology refresh rules; **project** ARCH detail remains under `tied/architecture-decisions/`.

**Alternate (guide-only):** `tied/docs/arch-bbce-slice-ownership-guide.md` — use if sponsor prefers docs without template index churn.

## Snippet sections (paste into ARCH detail YAML)

```yaml
# Optional BBCE-oriented sections (Mechanism D — advisory)
bbce_slice_ownership:
  owning_slice_req: REQ-EXAMPLE
  public_behavioral_boundaries:
    - description: CLI entry / HTTP handler / job trigger
      binding_ref: composition-coverage binding label
  shared_mechanisms_declared:
    - glob: mcp-server/packages/agentstream/src/paths.ts
      rationale: cross-binding path constants — mechanism not feature meaning
  anticipated_cross_slice_deps: []
  slice_map_ref: tied/analysis/agentstream-slice-map.yaml
  proof_boundary: Documents change-ownership intent; does not replace module validation or composition evidence.
```

## REQ decision (W4 refine)

**Default build-plan W4: no new REQ.** Snippet is optional documentation. Add `[REQ-*]` only if sponsor promotes snippet to **mandatory** methodology artifact or registers blocking MCP/checklist behavior.
