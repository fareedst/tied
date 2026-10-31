# Git hygiene receipt — PLAN-EDPC-META-HUB-ENGAGEMENT

- **request_token:** `PLAN-EDPC-META-HUB-ENGAGEMENT`
- **context_mode:** `plan_close_out`
- **apply:** false
- **date:** 2026-10-31
- **remote baseline:** `origin/main` @ **`69e5f270`** (citdp-promote normative REQ)

## MCP preview (`tied_git_hygiene`)

| Signal | Value |
| --- | --- |
| **ok** | true |
| **committed_working_stage_candidates** | [] (promote + handoffs already on remote) |
| **plan-scoped dirty (before hygiene)** | working CITDP drift vs `tied-project/citdp/`; tracker YAML sort noise |
| **plan-scoped untracked (removed)** | `evidence/mcp-payload-*.json` (MCP tied-cli audit; regenerable) |

## Actions taken

| Action | Paths |
| --- | --- |
| **Sync working CITDP** | `CITDP-PLAN-EDPC-META-HUB-ENGAGEMENT.yaml` ← copy from [tied-project/citdp/](../../../citdp/CITDP-PLAN-EDPC-META-HUB-ENGAGEMENT.yaml) |
| **Tracker update** | [checklist-tracker-refine.yaml](../checklist-tracker-refine.yaml) — `citdp-promote` step + `69e5f270` |
| **Remove scratch** | `evidence/mcp-payload-{req,arch,impl,citdp-promote}.json` |
| **Restore unrelated drift** | fixtures, evaluation envelopes, intent-control-plane, corpus close-out trackers, DOC dogfood YAML key-order-only edits, `tied-bundle/reports/source-graph/*` |

## Do not commit

| Path | Reason |
| --- | --- |
| `project-identity.v1.yaml` (repo root) | Local Path 3 dogfood |
| `tied-bundle/project-identity.v1.yaml` | Same |
| `tied-project/citdp/CITDP-REQ-{ACTIVATION,NESTED,...}.yaml` | MCP gate test scratch |
| `DOC-STDD-.../corpus-graph-index.v1.json`, `source-graph-index.v1.json` | Regenerable graph indexes (~MB) |

## Optional commit (this hygiene pass)

- `tied-project/working/PLAN-EDPC-META-HUB-ENGAGEMENT/checklist-tracker-refine.yaml`
- `tied-project/working/PLAN-EDPC-META-HUB-ENGAGEMENT/CITDP-PLAN-EDPC-META-HUB-ENGAGEMENT.yaml` (mirror of persisted CITDP)
- This receipt

**Canonical CITDP:** [tied-project/citdp/CITDP-PLAN-EDPC-META-HUB-ENGAGEMENT.yaml](../../../citdp/CITDP-PLAN-EDPC-META-HUB-ENGAGEMENT.yaml) (already on `main`).
