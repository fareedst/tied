# Meta-hub EDPC engagement template (refine pass 1)

| Field | Value |
| --- | --- |
| **Working token** | `PLAN-EDPC-META-HUB-ENGAGEMENT` (methodology plan; **no REQ mint** in Implement pass) |
| **Refined** | 2026-10-31 |
| **Source** | [gap-planning-handoff.md § G4](../DOC-STDD-TIED-PROJECT-BROWNFIELD/evidence/gap-planning-handoff.md) · publish gap `methodology:meta_hub_edpc_template_deferred` |
| **Reference implementation** | [DOC-STDD-TIED-PROJECT-BROWNFIELD](../DOC-STDD-TIED-PROJECT-BROWNFIELD/) (first complete meta-hub dogfood) |
| **Execution workflow** | `@non-tied-plan` Implement (methodology docs + templates only) |
| **Tracker** | [checklist-tracker-refine.yaml](./checklist-tracker-refine.yaml) |
| **Test strategy** | [test-strategy.md](./test-strategy.md) |
| **MCP base path** | `/Users/fareed/Documents/dev/chatgpt/stdd/tied-project` (verified 2026-10-31) |

**Sponsor choices (locked for this plan):** Codify the DOC engagement pattern as reusable methodology; **do not** mint REQ or change MCP publish schema in the first Implement pass unless validation reveals a blocking defect.

---

## Refine (Touchpoint 1 — RESOLVE)

**PRELOAD:** [edpc-comprehension.md](../../vocab/edpc-comprehension.md), [working-artifact-placement.md](../../../tied-bundle/docs/working-artifact-placement.md), [tied-methodology.md](../../vocab/tied-methodology.md).

| Sponsor / plan term | TIED canonical term | Notes |
| --- | --- | --- |
| **Meta-hub engagement** | EDPC on a **full-repo target** with **`tied-project/` as traceability hub** | Distinct from bounded `mcp-server/src/edpc`-only dogfood under `[REQ-TIED_EDPC_COMPREHENSION]` |
| **Plan token** | Process working folder `PLAN-EDPC-META-HUB-ENGAGEMENT` | Not a REQ token until optional promote |
| **Template deferred gap** | Publish backlog row, not approved scope | Cleared when template + doc land and republish shows gap absent |
| **Second dogfood** | Promotion gate for `@citdp-promote` | One store slice (DOC) is insufficient to freeze v1 |

**Investigation question (charter for future engagements):** How should sponsors commission a **brownfield comprehension** engagement when normative TIED data lives under `tied-project/` but implementation spans the wider repository—and what minimum artifact set makes the next engagement repeatable without ad hoc folder layout?

**Ambiguity cleared:**

- **Process token vs REQ token:** Working folders may use `DOC-*`, `PLAN-*`, or `REQ-*`; template examples use placeholders; authority rules in corpus map still apply.
- **Workflows D / E:** Default **N/A** when `production_touch: none` and tier `< source_change` (same as DOC).
- **Vocab RECORD (`meta_hub_engagement`):** **Defer** in Implement; link-only in new methodology doc (costly per DOC refine).

**Adversarial / depth:** `profile_depth: **minimal**` · `gate_policy: **doc_comprehension_hygiene**` · `depth_tier: **minimal**` (methodology-surface doc/template change; no integrated inquiry).

**EDPC facet (Tracker metadata — informational for downstream dogfood):**

```yaml
brownfield_intent_elevation:
  mode: report_only
  engagement: edpc_full
edpc_engagement:
  evidence_access_tier: toolchain_readonly
  production_touch: none
  engagement_pattern: meta_hub
  hub_path: tied-project/
  bounded_paths_example:
    - "tied-project"
    - "mcp-server/src"
    - "tools/bootstrap"
  charter_template: tied-bundle/templates/edpc-meta-hub-engagement-charter.v1.example.yaml
  reference_working_root: tied-project/working/DOC-STDD-TIED-PROJECT-BROWNFIELD/
```

**Consequence ladder:**

| Decision | Class | Default |
| --- | --- | --- |
| Add `edpc-meta-hub-engagement-charter.v1.example.yaml` | Reversible | Proceed at Implement |
| New `tied-bundle/docs/edpc-meta-hub-engagement.md` + pointer in EDPC main doc | Reversible | Proceed (prefer standalone + § link over large monolith edit) |
| Workflow A–F → agent checklist slug mapping table | Reversible | Proceed |
| Link corpus-map section template to DOC report | Reversible | Proceed |
| Extend `tied_edpc_engagement_validate` for `engagement_pattern` | Costly | **Defer** unless template fields fail validation |
| Mint `[REQ-TIED_META_HUB_EDPC]` (name TBD) | Costly | **Defer** → `@citdp-promote` after second dogfood |
| Vocab RECORD for **meta-hub engagement** | Costly | **Defer** |

**Gate (refine-plan):** [evidence/refine-pass1-gate-note.md](./evidence/refine-pass1-gate-note.md). Doc/hygiene pattern: sparse Tracker may yield `pre_implementation` **blocked**; does not block `@non-tied-plan` Implement when sponsor accepts honest gate note (sibling DOC pattern).

---

## Plan (CITDP-lite)

**Change class:** Methodology documentation + example template under `tied-bundle/` — **no** `tied-project/` index/detail mutation.

### Problem

Full-repo engagements with a **`tied-project/` hub** were ad hoc. [DOC-STDD-TIED-PROJECT-BROWNFIELD](../DOC-STDD-TIED-PROJECT-BROWNFIELD/) proves the choreography but leaves `methodology:meta_hub_edpc_template_deferred` in [edpc-publish-manifest.v1.json](../DOC-STDD-TIED-PROJECT-BROWNFIELD/evidence/edpc/edpc-publish-manifest.v1.json).

### Deliverables (Implement)

| # | Artifact | Purpose |
| --- | --- | --- |
| 1 | `tied-bundle/templates/edpc-meta-hub-engagement-charter.v1.example.yaml` | Copy-paste charter: `target_repository_root`, `bounded_path`, `hub_path`, `workflows_planned`, `investigation_question`, `request_token`, tier notes |
| 2 | `tied-bundle/docs/edpc-meta-hub-engagement.md` | When to use meta-hub pattern; bounded_paths guidance; artifact tree under `working/{TOKEN}/evidence/edpc/`; authority vs indexes |
| 3 | Pointer | Short subsection or “See also” in [EDPC_Methodology_and_Workflows.md](../../../tied-bundle/docs/EDPC_Methodology_and_Workflows.md) → (2) |
| 4 | **Workflow ↔ checklist mapping** | Table in (2): EDPC A–G vs `[PROC-AGENT_REQ_CHECKLIST]` slugs sponsors/agents run for **non-TIED** comprehension (see below) |
| 5 | **Corpus map stub** | Section template in (2) linking [tied-project-corpus-map.md](../DOC-STDD-TIED-PROJECT-BROWNFIELD/evidence/reports/tied-project-corpus-map.md) as reference |

### EDPC workflow ↔ agent checklist mapping (v1 draft)

For **meta-hub comprehension** (no REQ mint), map EDPC phases to checklist slugs agents already know:

| EDPC | Goal (short) | Primary checklist slugs | Typical outputs under `working/{TOKEN}/` |
| --- | --- | --- | --- |
| **A** | Commission | `translate-sponsor-intent`, `change-definition`, `session-bootstrap` | `evidence/edpc/engagement-charter.v1.yaml`, evidence-access matrix, queues |
| **B** | Baseline | `impact-discovery`, `test-strategy` (plan receipts) | `inventory.v1.json`, `scm-snapshot-shell.v1.yaml` |
| **C** | Deep slice | `impact-discovery`, `risk-assessment` | claims ledger, code↔token map, source-graph receipts |
| **D** | Failure / ops | — | **N/A** unless `production_touch` ≠ `none` |
| **E** | Change impact | — | **N/A** unless `evidence_access_tier: source_change` |
| **F** | Publish | `test-strategy`, verification doc gate | matrix, `edpc-publish-manifest.v1.json`, envelope sample |
| **G** | Refresh | handoff / `traceable-commit` prep | `session-handoff.md`, gap backlog |

**Note:** Full TIED feature work still uses the complete Tracker; this table is for **comprehension-only** engagements.

### Template field sketch (charter v1)

Derived from [DOC engagement-charter.v1.yaml](../DOC-STDD-TIED-PROJECT-BROWNFIELD/evidence/edpc/engagement-charter.v1.yaml):

```yaml
schema_version: engagement-charter.v1
engagement_pattern: meta_hub
hub_path: tied-project/
target_repository_root: "<absolute path>"
bounded_path: "<comma-separated repo-relative roots>"
investigation_question: "<charter question>"
request_token: "<DOC-* | PLAN-* | REQ-*>"
workflows_planned: ["A", "B", "C", "F", "G"]
sponsor_note: "<optional>"
# Tracker should mirror: edpc_engagement.evidence_access_tier, production_touch
```

### Impact

| Area | Blast radius |
| --- | --- |
| `tied-bundle/templates/edpc-meta-hub-engagement-charter.v1.example.yaml` | New |
| `tied-bundle/docs/edpc-meta-hub-engagement.md` | New |
| `tied-bundle/docs/EDPC_Methodology_and_Workflows.md` | Small link-only edit |
| `tied-project/` indexes, MCP `edpc/` | **Unchanged** in pass 1 |

### Risk (summary)

1. **Template drift from MCP validators** — mitigated by running `tied_edpc_access_validate` / `tied_edpc_engagement_validate` against a copy of DOC charter paths in test strategy.
2. **Sponsors treat template as certification** — mitigated by restating index + `tied_verify` authority (reuse corpus-map language).
3. **Over-specifying bounded_paths** — mitigated by documenting “hub + code slices” pattern, not one fixed list.

Detail: [evidence/risk-assessment-refine-pass1.md](./evidence/risk-assessment-refine-pass1.md).

**CITDP persist:** **Defer** — draft in `working/` until post-Implement; optional `@citdp-promote` after second meta-hub dogfood on another repo slice.

**Republish acceptance (optional smoke):** Re-run `tied_edpc_publish_build` on DOC SCM shell after methodology merge; gap `methodology:meta_hub_edpc_template_deferred` should be **absent** only if publish builder keys off filesystem template presence—if not, treat gap closure as **manual manifest edit + sponsor ack** (document in session-handoff).

---

## Test strategy

See [test-strategy.md](./test-strategy.md).

---

## Implement (execution — `@non-tied-plan`)

**Gate:** Refine complete; sponsor accepts gate note if `pre_implementation` blocked.

1. Author template (1) from DOC charter + facet block above; run EDPC validators on DOC paths (regression).
2. Author methodology doc (2) with mapping table (4) and corpus-map stub (5).
3. Add EDPC main-doc pointer (3).
4. **Handoff** — `evidence/session-handoff.md`: files touched, promote criteria, suggested second dogfood target (client brownfield or store slice).
5. **Traceable commit** — methodology paths only; no index YAML.

**Explicitly out of scope:** REQ mint; MCP schema changes; `tied-project/vocab` RECORD; republish DOC manifest unless sponsor requests gap closure smoke.

**Promote when:** Second engagement copies template without PLAN ad hoc edits → `@citdp-promote` or `@add-feature` to attach normative REQ if needed.

**Downstream:** [G3 corpus graph](../DOC-STDD-TIED-PROJECT-BROWNFIELD/evidence/gap-planning-handoff.md) benefits from stable meta-hub folder layout documented here.
