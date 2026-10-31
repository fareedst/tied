# Session handoff — PLAN-EDPC-META-HUB-ENGAGEMENT (Implement)

**Date:** 2026-10-31  
**Prompt type:** `@non-tied-plan` (methodology only; no index YAML)

## Files touched

| Path | Change |
| --- | --- |
| `tied-bundle/templates/edpc-meta-hub-engagement-charter.v1.example.yaml` | New example charter |
| `tied-bundle/docs/edpc-meta-hub-engagement.md` | New methodology guide (mapping + corpus-map template) |
| `tied-bundle/docs/EDPC_Methodology_and_Workflows.md` | §1.1 pointer to meta-hub doc |

## Validation

| Tool | Result |
| --- | --- |
| `tied_edpc_access_validate` (DOC matrix) | **ok: true** |
| `tied_edpc_engagement_validate` (DOC Tracker, `mode: report_only`) | **ok: false** — `full_engagement_requires_pilot_or_strict_mode` (pre-existing DOC facet; not introduced by template) |

## Publish gap G4

Gap `methodology:meta_hub_edpc_template_deferred` in [DOC publish manifest](../DOC-STDD-TIED-PROJECT-BROWNFIELD/evidence/edpc/edpc-publish-manifest.v1.json) is **not** auto-cleared by this pass: `tied_edpc_publish_build` does not key off template filesystem presence. Sponsor options:

1. **Accept backlog closure by methodology deliverable** (this handoff + committed template/doc).
2. **Republish** DOC SCM after sponsor request and edit manifest `gaps[]` if still listed.
3. **Second dogfood** on another repo slice using the template without charter ad hoc edits.

## Promote criteria

- Second meta-hub engagement completes with template copy-only charter.
- Then optional `@citdp-promote` or `@add-feature` for normative REQ if needed.

## Suggested second dogfood

- Any **client** brownfield with committed `tied-project/` and multi-root code, or
- Store slice under `tied-project/working/` with a new `DOC-*` token copying the example charter.

## Downstream

- [G3 YAML corpus graph](../DOC-STDD-TIED-PROJECT-BROWNFIELD/evidence/gap-planning-handoff.md) — stable hub layout documented in `edpc-meta-hub-engagement.md`.

## Commit staging (sponsor)

Methodology paths only; exclude unrelated working edits.
