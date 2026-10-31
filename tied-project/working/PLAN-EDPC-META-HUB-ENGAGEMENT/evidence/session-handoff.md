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

## Second dogfood (complete)

[DOC-STDD-META-HUB-TEMPLATE-DOGFOOD](../../DOC-STDD-META-HUB-TEMPLATE-DOGFOOD/) — charter copy-only; `tied_edpc_access_validate` + `tied_edpc_engagement_validate` (**pilot**) green. See [charter-copy-manifest.v1.yaml](../../DOC-STDD-META-HUB-TEMPLATE-DOGFOOD/evidence/charter-copy-manifest.v1.yaml).

**Promote:** optional `@citdp-promote` when sponsor accepts both dogfoods.

## Downstream

- [G3 YAML corpus graph](../DOC-STDD-TIED-PROJECT-BROWNFIELD/evidence/gap-planning-handoff.md) — stable hub layout documented in `edpc-meta-hub-engagement.md`.

## Traceable commit

**SHA:** `9e2c4c2b` — `docs(methodology): add meta-hub EDPC charter template and guide (G4)`

Evidence: [traceable-commit-evidence.md](./traceable-commit-evidence.md)
