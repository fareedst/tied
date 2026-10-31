# Session handoff — DOC-STDD brownfield + gap sprint (2026-10-31)

**Program anchor:** `DOC-STDD-TIED-PROJECT-BROWNFIELD`  
**Baseline:** `cf321c96` · **Original close-out:** `944f0666`  
**Gap index:** [gap-planning-handoff.md](./gap-planning-handoff.md) · **Publish manifest:** [edpc-publish-manifest.v1.json](./edpc/edpc-publish-manifest.v1.json)

---

## Gap sprint — committed on `main` (not yet pushed)

| Gap | Plan | Traceable commit(s) | Notes |
| --- | --- | --- | --- |
| **G1** | publish minimum_fields | `dcabd545` | `request_token` hoist in publish build; G1 row removed from on-disk manifest |
| **G5** | `PLAN-EVALUATION-ENVELOPE-CORPUS-FULL` | `2fa173cc`, `b071447e` | 133-row [envelope-corpus-manifest.v1.yaml](../../evaluation/envelope-corpus-manifest.v1.yaml) + full gap report |
| **G7** | `PLAN-EDPC-VERIFY-STATUS-BOUNDARY` | `cb4c8b9f`, `91858026` | Sponsor docs + always-on publish/CAM verify boundary |
| **G4** | `PLAN-EDPC-META-HUB-ENGAGEMENT` | `9e2c4c2b`, `72c45cd2` (prior session; **on `origin/main`**) | Template + two dogfoods; optional `@citdp-promote` |

**Git:** `main` is **5 commits ahead** of `origin/main` (G1 + G5 + G7 pairs). Run **`git push`** when sponsor wants remote sync.

---

## Gap status vs publish manifest

Deliverables closed several gaps at the **process** layer; [edpc-publish-manifest.v1.json](./edpc/edpc-publish-manifest.v1.json) `gaps[]` is **stale** until republish via `tied_edpc_publish_build` (builder does not auto-clear backlog strings).

| Gap | Matrix (git) | Deliverable reality | Manifest row |
| --- | --- | --- | --- |
| G1 | Done | Done | Can drop on republish |
| G4 | Open in matrix | Done (methodology) | May drop by sponsor acceptance |
| G5 | Done | Done | May drop on republish |
| G6 | Open | Resolved (MCP rebuild); see [g6-gate-identity-debug.md](./g6-gate-identity-debug.md) | May drop on republish |
| G7 | Done | Done (+ auto gap in new publishes) | Stays until verify receipts attached |
| G2 | N/A | Charter `production_touch: none` | Keep or document N/A |
| G3 | Open | Partial product (`131f0011` corpus graph); full gap remains | Keep until `REQ-TIED_CORPUS_COMPREHENSION` complete |

---

## Sponsor-facing docs (refresh)

| Doc | Path |
| --- | --- |
| Corpus map (authority + verify boundary) | [tied-project-corpus-map.md](./reports/tied-project-corpus-map.md) |
| Workflow hub | [docs/stdd-workflows.md](../../../../docs/stdd-workflows.md) |
| Evaluation refresh | [evaluation/README.md](../../evaluation/README.md) |
| Meta-hub template | [edpc-meta-hub-engagement.md](../../../../tied-bundle/docs/edpc-meta-hub-engagement.md) |

---

## Uncommitted local (do not batch blindly)

| Kind | Examples |
| --- | --- |
| Handoff edits | `PLAN-EDPC-META-HUB-ENGAGEMENT/evidence/session-handoff.md`, `WORKSPACE-CLEAR-2026-10-31/…` |
| Regenerable indexes | `envelope-gap-report.v1.yaml`, source-graph / corpus-graph fixtures, JEV benchmark |
| Untracked test CITDP | `tied-project/citdp/CITDP-REQ-*.yaml` (likely test fixtures) |
| **Do not commit** | Repo-root `project-identity.v1.yaml` |

Discard, separate chore commit, or regenerate intentionally before push.

---

## Do next (ordered)

1. **`git push`** — publish G1/G5/G7 commits.
2. **Optional matrix sync** — commit G4/G6 “Done/Resolved” rows in [gap-planning-handoff.md](./gap-planning-handoff.md) (currently only G1/G5/G7 updated in git).
3. **Republish EDPC manifest** — optional `@non-tied-plan` slice: run `tied_edpc_publish_build` with DOC SCM shell + claims; align `gaps[]` with closed items.
4. **G3** — `@add-feature` / `build-plan` on [REQ-TIED_CORPUS_COMPREHENSION](../../REQ-TIED_CORPUS_COMPREHENSION/PLAN.md) if sponsor wants manifest gap cleared.
5. **G4 promote** — `@citdp-promote` only if normative REQ token is desired (not required for template use).
6. **Workflow G refresh** — after MCP/layout waves; triggers in original close-out handoff still apply.

---

## Per-plan handoffs

| Plan | Handoff |
| --- | --- |
| G4 meta-hub | [PLAN-EDPC-META-HUB-ENGAGEMENT/evidence/session-handoff.md](../../PLAN-EDPC-META-HUB-ENGAGEMENT/evidence/session-handoff.md) |
| G5 envelope corpus | [PLAN-EVALUATION-ENVELOPE-CORPUS-FULL/evidence/session-handoff.md](../../PLAN-EVALUATION-ENVELOPE-CORPUS-FULL/evidence/session-handoff.md) |
| G7 verify boundary | [PLAN-EDPC-VERIFY-STATUS-BOUNDARY/evidence/session-handoff.md](../../PLAN-EDPC-VERIFY-STATUS-BOUNDARY/evidence/session-handoff.md) |

**Original DOC close-out:** [close-out-handoff.md](./close-out-handoff.md) (`944f0666`).
