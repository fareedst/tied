# Brownfield comprehension — stdd `tied-project` representation (refine pass 1)

| Field | Value |
| --- | --- |
| **Working token** | `DOC-STDD-TIED-PROJECT-BROWNFIELD` (process evidence; **no REQ mint**) |
| **Refined** | 2026-10-31 |
| **Source plan** | [brownfield_tied-project_representation_4dda51ad.plan.md](/Users/fareed/.cursor/plans/brownfield_tied-project_representation_4dda51ad.plan.md) |
| **Execution workflow** | [non-tied-plan](../../../tools/bundled-prompt-type-skills/non-tied-plan/SKILL.md) Implement after refine |
| **Tracker** | [checklist-tracker-refine.yaml](./checklist-tracker-refine.yaml) |
| **Test strategy** | [test-strategy.md](./test-strategy.md) |
| **MCP base path** | `/Users/fareed/Documents/dev/chatgpt/stdd/tied-project` (verified 2026-10-31) |

**Sponsor choices (locked):** Full repo + `tied-project/` meta hub; deliver comprehension + hygiene without minting REQ tokens.

---

## Refine (Touchpoint 1 — RESOLVE)

**PRELOAD:** [edpc-comprehension.md](../../vocab/edpc-comprehension.md), [quality-assurance.md](../../vocab/quality-assurance.md), [tied-methodology.md](../../vocab/tied-methodology.md), [tied-yaml-mcp.md](../../vocab/tied-yaml-mcp.md), [working-artifact-placement.md](../../../tied-bundle/docs/working-artifact-placement.md) (methodology).

| Sponsor / plan term | TIED canonical term | Notes |
| --- | --- | --- |
| **Brownfield comprehension** | **EDPC engagement** (`edpc_full`) | `[PROC-EDPC_COMPREHENSION]`; SCM v1 shell + claims ledger |
| **Improve tied-project representation** | Sponsor navigation + SCM cross-check + hygiene | **Not** REQ/ARCH/IMPL index edits in this pass |
| **Meta hub** | Committed traceability under `tied-project/` | Distinct from `tied-bundle/` methodology (read-only in clients) |
| **Hygiene** | Working-root cleanup + corpus map | CITDP draft dedupe; no `tied-project/citdp/` writes |
| **Prior store dogfood** | [REQ-TIED_EDPC_COMPREHENSION](../REQ-TIED_EDPC_COMPREHENSION/) | Bounded `mcp-server/src/edpc` only — **this engagement supersedes scope**, not tokens |

**Investigation question (charter):** How does stdd (MCP, bootstrap, docs) relate to what `tied-project/` declares and evidences, and what hygiene/navigation closes the largest sponsor-facing gaps without changing REQ authority?

**Ambiguity cleared:** Matrix dispositions stay **`observed`** / **`unresolved`** only; no **`approved`** BFIE promotion. Optional `docs/stdd-workflows.md` is sponsor-facing; machine evidence stays under `working/`.

**Adversarial / depth:** `profile_depth: **minimal**` · `gate_policy: **doc_comprehension_hygiene**` · `depth_tier: **minimal**` (no integrated inquiry enrollment for DOC token). MCP/toolchain runs produce **Observed** claims only at `toolchain_readonly`.

**EDPC facet (Tracker metadata — informational):**

```yaml
brownfield_intent_elevation:
  mode: report_only
  engagement: edpc_full
edpc_engagement:
  evidence_access_tier: toolchain_readonly
  target_repository_root: "/Users/fareed/Documents/dev/chatgpt/stdd"
  production_touch: none
  bounded_paths:
    - "mcp-server/src"
    - "mcp-server/packages/agentstream"
    - "tools/bootstrap"
    - "tied-project"
  charter_path: tied-project/working/DOC-STDD-TIED-PROJECT-BROWNFIELD/evidence/edpc/engagement-charter.v1.yaml
```

**Consequence ladder:**

| Decision | Class | Default |
| --- | --- | --- |
| Publish SCM + corpus map + matrix (observed/unresolved) | Reversible | Proceed at build |
| Remove **65** byte-identical working CITDP copies | Reversible (git) | Proceed after sponsor ack in session |
| Keep **35** divergent working CITDP copies | Reversible | Proceed — ledger as unresolved |
| Regenerate `working/evaluation/envelope-gap-report.v1.yaml` | Reversible | Proceed (batch collect) |
| `docs/stdd-workflows.md` via `@workflow-visualization` | Reversible | **Proceed** (catalog B4 + I* meta-views) |
| Automate dedupe in `tools/` with tests | Costly | **Defer** unless manual pass painful |
| Mint REQ for TIED-corpus scoped analysis | Costly | **Defer** → publish `gaps[]` / LEAP note |
| Vocab RECORD (`meta_hub_engagement`, etc.) | Costly | **Defer** (link-only in corpus map) |

**Gate (refine-plan):** See [evidence/refine-pass1-gate-note.md](./evidence/refine-pass1-gate-note.md). Doc/comprehension pattern: `pre_implementation` may be **blocked** on sparse Tracker — **does not** block non-tied Implement when sponsor accepts honest gate note (sibling DOC outreach pattern).

---

## Plan (CITDP-lite)

**Change class:** EDPC comprehension artifacts + committed working evidence + optional sponsor doc + CITDP dedupe — **no** project index YAML mutation.

### Measured corpus signals (baseline for claims)

| Signal | Value (2026-10-31) |
| --- | --- |
| `requirements.yaml` lines | ~3860 |
| `semantic-tokens.yaml` lines | ~4985 |
| `tied-project/working/` top-level folders | ~250 |
| Persisted `tied-project/citdp/` files | ~213 |
| CITDP basename overlap (working ∩ citdp) | **96** |
| Working copies in overlap | **100** (some basenames duplicated under working) |
| Identical to persisted (safe dedupe) | **65** |
| Divergent from persisted (keep + ledger) | **35** |

### Impact

| Area | Blast radius |
| --- | --- |
| `tied-project/working/DOC-STDD-TIED-PROJECT-BROWNFIELD/**` | New EDPC shell, reports, envelope |
| `tied-project/working/**/CITDP-*.yaml` | Delete up to 65 identical drafts only |
| `tied-project/working/evaluation/envelope-gap-report.v1.yaml` | Regenerated snapshot |
| `docs/stdd-workflows.md` | Optional new sponsor doc |
| Index YAML, `tied-project/citdp/` persist, vocab | **Unchanged** |

### Risk (summary)

1. **Mis-read Implemented status** from static comprehension — mitigated by tier claim classes + `tied_verify` called out as authoritative in corpus map.
2. **Over-broad dedupe** — mitigated by SHA-256 equality only; divergent rows stay.
3. **Wrong MCP base path** — mitigated by `tied_config_get_base_path` at session start (stale `TIED_BASE_PATH=/.../tied` env noted; effective base is `tied-project/`).
4. **Sponsor confusion: SCM vs indexes** — mitigated by “TIED stronger than comprehension” section in publish gaps.

Detail: [evidence/risk-assessment-refine-pass1.md](./evidence/risk-assessment-refine-pass1.md).

**CITDP persist:** **Defer** — draft stays in `working/` until post-Implement close-out; **no** `citdp_record_write` in non-tied pass unless sponsor promotes to full TIED close-out.

---

## EDPC choreography (refined)

Working root: `tied-project/working/DOC-STDD-TIED-PROJECT-BROWNFIELD/`

| Phase | Refined actions | Outputs |
| --- | --- | --- |
| **A** | Charter: full-repo target, `bounded_paths` include `tied-project`; queues seeded from template | `evidence/edpc/*.yaml` |
| **B** | EASAR on `mcp-server/src`, `tools/bootstrap`; YAML inventory script or `yq`/Node one-off **read-only** counts on indexes | `evidence/inventory.v1.json`, `scm-snapshot-shell.v1.yaml` |
| **C** | `tied_source_graph_refresh` (repo root or mcp-server); trace: `yaml-loader`, `working-root`, `routeEdpcWorkflow`; `tied_scoped_analysis_run` on `mcp-server/src/tools/index.ts` + install entrypoints; **`tied_validate_consistency`** (read-only, capture top 20 themes) | `claims-ledger.v1.yaml`, `evidence/reports/code-to-token-map.md` |
| **F** | Matrix from template; `tied_edpc_publish_build`; `brownfield_intent_evidence_validate` report_only; envelope batch on **sample** REQ tokens (see test strategy) | `intent-elevation-matrix.md`, `edpc-publish-manifest.v1.json` |
| **G** | Document refresh triggers in `session-handoff.md` | Handoff |

Workflows **D** / **E**: N/A (`production_touch: none`, no `source_change`).

### Where `tied-project` beats comprehension (publish as gaps + backlog)

1. Normative REQ→ARCH→IMPL graph and IMPL pseudo-code token comments — comprehension **cross-checks**, does not replace.
2. **`tied_verify`**-gated status — no “Implemented” from static read alone.
3. Scale (~250 working trees) — batch envelope collect + git hygiene, not hand-written full ledger.
4. Two-folder invariant — committed vs `tied-bundle/working/` local tiers in every artifact path.
5. Vocab routing PRELOAD — corpus map **links** glossaries; no duplicate definitions (no vocab RECORD this pass).
6. CITDP canonical vs draft — hygiene models explicitly; methodology should add **meta-hub EDPC template** and **TIED corpus** scoped analysis (defer product work).

---

## Test strategy

See [test-strategy.md](./test-strategy.md).

---

## Implement (execution — non-tied-plan / build-plan)

**Gate:** Refine complete; sponsor accepts gate note if `pre_implementation` blocked.

1. **A** — Create charter artifacts; run `tied_edpc_access_validate`, `tied_edpc_engagement_validate`.
2. **B–C** — Tool runs; draft ledger + code↔token map; hub sample reads (intent control plane handoff, layered install, EDPC program folder).
3. **F** — Matrix + publish + validators; envelope gap refresh.
4. **Hygiene** — Dedupe log + deletes (65 identical); corpus map; optional `@workflow-visualization` → `docs/stdd-workflows.md`.
5. **Handoff** — `evidence/session-handoff.md` with gaps, refresh triggers, commit staging list (exclude repo-root `project-identity.v1.yaml` per [intent control plane handoff](../REQ-TIED_INTENT_CONTROL_PLANE/evidence/session-handoff.md)).

**Explicitly out of scope:** REQ mint; index/detail edits; `tied-project/citdp/` persist; vocab RECORD; **`approved`** matrix rows; EDPC workflow D.

**Follow-on:** `add-feature` / LEAP for TIED-corpus analysis and meta-hub EDPC template from publish `gaps[]`.
