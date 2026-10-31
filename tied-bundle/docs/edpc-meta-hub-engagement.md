# Meta-hub EDPC engagements

**Status:** Methodology guidance (v1) · **Process:** `[PROC-EDPC_COMPREHENSION]` · **Placement:** `[PROC-WORKING_ARTIFACT_PLACEMENT]`

**When to use:** The target is a **full repository**, but normative TIED traceability (indexes, detail files, vocab, working evidence) lives under **`tied-project/`**. The engagement treats that folder as the **traceability hub** while bounded code/tool slices supply implementation evidence.

**When not to use:** Bounded product dogfood on a single module (for example `mcp-server/src/edpc` only) without hub navigation — use a standard EDPC charter without `engagement_pattern: meta_hub`.

**Reference dogfood (TIED store):**

| Token | Role |
| --- | --- |
| [DOC-STDD-TIED-PROJECT-BROWNFIELD](../../tied-project/working/DOC-STDD-TIED-PROJECT-BROWNFIELD/) | First full meta-hub comprehension + corpus map |
| [DOC-STDD-META-HUB-TEMPLATE-DOGFOOD](../../tied-project/working/DOC-STDD-META-HUB-TEMPLATE-DOGFOOD/) | Second dogfood — copy-only charter from [template](../templates/edpc-meta-hub-engagement-charter.v1.example.yaml) |

Corpus map example: [tied-project-corpus-map.md](../../tied-project/working/DOC-STDD-TIED-PROJECT-BROWNFIELD/evidence/reports/tied-project-corpus-map.md)

---

## 1. Charter and template

Copy [edpc-meta-hub-engagement-charter.v1.example.yaml](../templates/edpc-meta-hub-engagement-charter.v1.example.yaml) into:

`tied-project/working/{REQUEST_TOKEN}/evidence/edpc/engagement-charter.v1.yaml`

| Field | Requirement |
| --- | --- |
| `engagement_pattern` | `meta_hub` |
| `hub_path` | `tied-project/` (trailing slash optional in docs; use repo-relative hub root) |
| `bounded_path` | Comma-separated repo-relative roots; **must include `tied-project`** plus code/tool slices (for example `mcp-server/src`, `tools/bootstrap`) |
| `target_repository_root` | Absolute path to repository root |
| `workflows_planned` | Typical meta-hub pass: `A`, `B`, `C`, `F`, `G` — omit **D** / **E** when `production_touch: none` and tier is below `source_change` |
| `request_token` | Working token: `DOC-*`, `PLAN-*`, or `REQ-*` (not approved REQ scope until `@add-feature`) |

Pair with `evidence-access-matrix.v1.yaml`, `edpc-queues.v1.yaml`, and other EDPC artifacts under the same `evidence/edpc/` tree (see [edpc-comprehension.md](../../tied-project/vocab/edpc-comprehension.md)).

---

## 2. Working folder layout

Committed evidence root (per [working-artifact-placement.md](./working-artifact-placement.md)):

```text
tied-project/working/{REQUEST_TOKEN}/
  PLAN.md                          # optional index
  checklist-tracker-refine.yaml    # or feature Tracker copy
  evidence/
    edpc/                          # charter, matrix, SCM shell, ledger, publish manifest
    reports/                       # corpus map, code↔token map, matrix markdown
    session-handoff.md             # refresh triggers, gap backlog
```

Local-only gate receipts may live under `tied-bundle/working/{REQ-TOKEN}/` on clients; the store may commit selected receipts under `tied-project/working/.../evidence/receipts/`.

---

## 3. EDPC workflows ↔ agent checklist (comprehension-only)

For **comprehension without REQ mint**, map EDPC phases to checklist slugs from `[PROC-AGENT_REQ_CHECKLIST]`:

| EDPC | Goal (short) | Primary checklist slugs | Typical outputs |
| --- | --- | --- | --- |
| **A** | Commission | `translate-sponsor-intent`, `change-definition`, `session-bootstrap` | Charter, evidence-access matrix, queues |
| **B** | Baseline | `impact-discovery`, `test-strategy` | `inventory.v1.json`, `scm-snapshot-shell.v1.yaml` |
| **C** | Deep slice | `impact-discovery`, `risk-assessment` | Claims ledger, code↔token map, source-graph receipts |
| **D** | Failure / ops | — | **N/A** unless `production_touch` ≠ `none` |
| **E** | Change impact | — | **N/A** unless `evidence_access_tier: source_change` |
| **F** | Publish | `test-strategy`, doc verification gate | Intent matrix, `edpc-publish-manifest.v1.json`, envelope sample |
| **G** | Refresh | Handoff / `traceable-commit` prep | `session-handoff.md`, gap planning handoff |

Full TIED feature work still runs the **complete** Tracker (IMPL pseudo-code, RED tests, MCP YAML writes). This table is for **EDPC comprehension and hygiene** engagements only.

---

## 4. Corpus map (sponsor navigation)

Each meta-hub engagement should publish a **corpus map** markdown under `evidence/reports/` so sponsors and agents can onboard without reading every working folder.

**Section template (copy and fill):**

```markdown
# {Repository name} — tied-project corpus map

## Layers
| Layer | Path | Role |
| Indexes | tied-project/requirements.yaml, … | Normative REQ→ARCH→IMPL |
| Detail files | tied-project/requirements/, … | Token bodies + IMPL sidecars |
| Working (committed) | tied-project/working/{TOKEN}/ | PLAN, EDPC, envelopes |
| CITDP (canonical) | tied-project/citdp/ | Persisted change analysis after close-out |
| Vocab | tied-project/vocab/ | PRELOAD routing |
| Methodology (client) | tied-bundle/ | Read-only in clients; refresh via tied-install |

## Agent entry points
1. AGENTS.md
2. tied-bundle/docs/client-development-index.md
3. tied-project/vocab/routing.md

## Authority rules (comprehension vs TIED)
- Indexes + tied_verify decide obligation status — EDPC SCM is investigative.
- CITDP: prefer tied-project/citdp/ over duplicate drafts in working/.
```

**Filled example:** [tied-project-corpus-map.md](../../tied-project/working/DOC-STDD-TIED-PROJECT-BROWNFIELD/evidence/reports/tied-project-corpus-map.md)

Optional sponsor workflow hub: `@workflow-visualization` → `docs/{project}-workflows.md` (machine evidence stays under `working/`).

---

## 5. Authority and gaps

- EDPC claims remain **Declared**, **Derived**, **Observed**, or **Unknown** — not implementation sign-off.
- **`tied_verify`** and project indexes decide REQ/IMPL status; comprehension must not imply **Implemented** without verify receipts.
- Publish `gaps[]` in `edpc-publish-manifest.v1.json` records backlog (methodology, process, product) until a follow-on `@add-feature` / `@refine-plan` locks scope.

---

## 6. Promotion

After a **second** meta-hub engagement copies this template without ad hoc charter edits, consider `@citdp-promote` or `@add-feature` to attach normative REQ tokens if the pattern must be machine-enforced.

**Plan token (store):** [PLAN-EDPC-META-HUB-ENGAGEMENT](../../tied-project/working/PLAN-EDPC-META-HUB-ENGAGEMENT/PLAN.md)
