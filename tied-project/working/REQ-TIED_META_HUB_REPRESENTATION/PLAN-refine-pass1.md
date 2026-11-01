# Meta-hub tied-project representation (refine pass 1)

| Field | Value |
| --- | --- |
| **Request token** | `REQ-TIED_META_HUB_REPRESENTATION` |
| **Refined** | 2026-11-01 |
| **Source plan** | [meta-hub_representation_tooling_89796ae5.plan.md](/Users/fareed/.cursor/plans/meta-hub_representation_tooling_89796ae5.plan.md) |
| **Prior comprehension** | [DOC-STDD-TIED-PROJECT-BROWNFIELD](../DOC-STDD-TIED-PROJECT-BROWNFIELD/) (`944f0666`) |
| **Execution workflow** | `@add-feature` Implement after refine gate |
| **Tracker** | [checklist-tracker-refine.yaml](./checklist-tracker-refine.yaml) |
| **Test strategy** | [test-strategy.md](./test-strategy.md) |
| **MCP base path** | `/Users/fareed/Documents/dev/chatgpt/stdd/tied-project` (verified 2026-11-01) |

**Sponsor choices (locked):**

- Product **tooling + MCP parity** (not CLI-only).
- **Full reconcile** of **35** divergent working CITDP rows ([citdp-dedupe-log.md](../DOC-STDD-TIED-PROJECT-BROWNFIELD/evidence/reports/citdp-dedupe-log.md) § Kept).
- Meta-hub EDPC re-engagement on stdd at `toolchain_readonly`.

---

## Refine (Touchpoint 1 — RESOLVE)

**PRELOAD:** [edpc-comprehension.md](../../vocab/edpc-comprehension.md), [tied-methodology.md](../../vocab/tied-methodology.md), [project-operations-mcp.md](../../vocab/project-operations-mcp.md), [edpc-meta-hub-engagement.md](../../../tied-bundle/docs/edpc-meta-hub-engagement.md).

| Sponsor / plan term | TIED canonical term | Notes |
| --- | --- | --- |
| **Improve tied-project representation** | Meta-hub **operator tooling** + dogfood apply on store | Phase 1 DOC was navigation/hygiene only; this REQ adds **mutating citdp reconcile** under TIED gates |
| **Brownfield comprehension** | EDPC `edpc_full` on full-repo target | Reuse charter fields from DOC; new `request_token` on working Tracker |
| **35 divergent CITDPs** | Reconcile input set (closed list) | Not a re-run of identical dedupe (65 already removed) |
| **Comprehension vs TIED authority** | Claims **Unknown** for Implemented unless `tied_verify` | [edpc-comprehension.md](../../vocab/edpc-comprehension.md); backlog doc required |

**Investigation question (charter):** What automated reconcile and corpus-map pipeline keeps `tied-project/citdp/` aligned with close-out-quality working drafts and gives sponsors a refreshable meta-hub navigation surface?

**Semantic tokens (Implement Slice 0 — enrollment):**

| Layer | Token |
| --- | --- |
| REQ | `REQ-TIED_META_HUB_REPRESENTATION` |
| ARCH | `ARCH-TIED_META_HUB_REPRESENTATION_BOUNDARY` |
| IMPL | `IMPL-TIED_CITDP_RECONCILE`, `IMPL-TIED_CORPUS_MAP_BUILD`, `IMPL-TIED_META_HUB_MCP` |

**Ambiguity cleared:**

- **REQ-TIED_PROJECT_LINT** remains **Planned** — this REQ may **compose read-only** lint/consistency in corpus-map **Derived** counts only; no IMPL merge.
- **MCP tools are required** (sponsor tooling scope): `tied_citdp_reconcile_run`, `tied_corpus_map_build`.
- **Module layout:** Shared core in `mcp-server/src/meta-hub-representation/`; thin CLI in `tools/meta-hub/` calling compiled dist or shared entry (same pattern as evaluation manifest script).

**Adversarial / depth:** `profile_depth: minimal` · `gate_policy: advisory` · `depth_tier: minimal` (store tooling; no auth/network/persistence beyond citdp/working files).

**EDPC facet (Tracker metadata):**

```yaml
brownfield_intent_elevation:
  mode: pilot
  engagement: edpc_full
edpc_engagement:
  evidence_access_tier: toolchain_readonly
  target_repository_root: "/Users/fareed/Documents/dev/chatgpt/stdd"
  production_touch: none
  engagement_pattern: meta_hub
  hub_path: tied-project/
  bounded_paths:
    - tied-project
    - mcp-server/src
    - tools/bootstrap
    - tools/meta-hub
  charter_path: tied-project/working/REQ-TIED_META_HUB_REPRESENTATION/evidence/edpc/engagement-charter.v1.yaml
  parent_comprehension: tied-project/working/DOC-STDD-TIED-PROJECT-BROWNFIELD/
```

**Consequence ladder:**

| Decision | Class | Default |
| --- | --- | --- |
| Mint REQ/ARCH/IMPL + pseudo-code | Reversible (TIED) | Proceed Slice 0 |
| MCP + CLI reconcile/corpus-map | Reversible | Proceed after RED |
| **`--apply` on 35 rows** | **Costly** | Proceed only after dry-run ledger + sponsor ack |
| Delete working CITDP after successful persist | Reversible (git) | Proceed per ledger |
| Overwrite canonical when `working_newer` | **Costly** | Default winner = **newer mtime**; tie → `structural_conflict` |
| Persist slice-only basenames to citdp | Costly | Policy table below |
| README link to `docs/stdd-workflows.md` | Reversible | Proceed in Slice 4 |
| LEAP proposal for token-level corpus graph | Costly | Defer to backlog doc |

---

## Where `tied-project/` is stronger than comprehension

Publish [evidence/reports/comprehension-gap-backlog.md](./evidence/reports/comprehension-gap-backlog.md) at close-out (methodology LEAP seeds, not REQ authority):

| Stronger surface | Comprehension lag | Comprehension should improve |
| --- | --- | --- |
| REQ→ARCH→IMPL + IMPL pseudo-code | DOC ran consistency with detail/pseudo checks off | Workflow **C**: sample `tied_project_lint` + `pseudocode_validate`; gap when skipped |
| `tied_verify` status | By design — EDPC cannot sign off Implemented | G7 may remain in publish manifest |
| ~247 working folders | Batch envelope advisory | Slice 4 refresh manifest + gap report receipt |
| Normative `tied-project/citdp/` | 35 drafts diverged | **This REQ** reconcile tooling |
| Semantic token registry | Corpus graph structural only | LEAP: token-level edges (follow-on) |
| Vocab PRELOAD | Corpus map links only | Optional vocab RECORD `meta_hub_navigation` at close-out |

---

## Plan (CITDP)

**Change class:** New store operator tooling + dogfood data migration (citdp/working) + EDPC refresh — **no** unrelated index edits.

### Reconcile policy (refined)

**Input set:** Paths listed in [citdp-dedupe-log.md](../DOC-STDD-TIED-PROJECT-BROWNFIELD/evidence/reports/citdp-dedupe-log.md) § **Kept (divergent)** (35 rows).

**Pairing:**

1. Same **basename** under `tied-project/working/**/` and `tied-project/citdp/{basename}` → compare SHA-256.
2. If SHA differs → classify using mtime (repo git mtime or filesystem): `working_newer` | `canonical_newer`.
3. Equal mtime + different content → `structural_conflict` (requires ledger `force_disposition: keep_canonical|take_working|skip`).

**Slice / alternate basename rows** (examples from dedupe log):

| Pattern | Example | Default disposition |
| --- | --- | --- |
| Working slice, canonical base exists | `CITDP-REQ-TIED_CHECKLIST_GATE_ENFORCEMENT-slice2.yaml` vs `citdp/...-slice0.yaml` | **Persist working to citdp under its full basename** if no citdp file; else `working_only` + queue |
| Working `-remediation` | checklist gate remediation | If canonical `CITDP-REQ-TIED_CHECKLIST_GATE_ENFORCEMENT.yaml` exists, **take_working** only when mtime newer; else conflict |
| `CITDP-DOC-JEV-COMPARISON.yaml` | working-only doc token | **keep_working** (no citdp persist) — document in ledger |
| PLAN-* divergent | e.g. `CITDP-PLAN-DATA-FILE-ORDERING.yaml` | **take_working** when newer than citdp (PLAN close-out should match citdp) |

**Apply side effects:**

- Update `tied-project/citdp/` via existing writer (canonical YAML profile).
- Remove working copy when ledger action is `delete_working_after_persist`.
- Never touch REQ/ARCH/IMPL indexes in reconcile module.

### Implementation slices

| Slice | Deliverable |
| --- | --- |
| **0** | TIED enrollment (REQ/ARCH/IMPL + sidecars); copy EDPC charter from template; working CITDP draft |
| **1** | `citdp-reconcile` core + RED fixtures + ledger schema v1 |
| **2** | `corpus-map-build` + section tests |
| **3** | MCP `tied_citdp_reconcile_run`, `tied_corpus_map_build` + registration tests |
| **4** | Dogfood: dry-run → sponsor ack → apply; envelope batch; corpus graph receipt; EDPC publish; update [tied-project-corpus-map.md](../DOC-STDD-TIED-PROJECT-BROWNFIELD/evidence/reports/tied-project-corpus-map.md) or successor under this REQ |
| **5** | Close-out: persist CITDP, envelope, `tied_verify`, CHANGELOG |

### Dependencies

- [REQ-TIED_EDPC_META_HUB_ENGAGEMENT](../../../requirements/REQ-TIED_EDPC_META_HUB_ENGAGEMENT.yaml)
- [REQ-TIED_CORPUS_COMPREHENSION](../../../requirements/REQ-TIED_CORPUS_COMPREHENSION.yaml)
- [REQ-TIED_WORKING_ARTIFACT_PLACEMENT](../../../requirements/REQ-TIED_WORKING_ARTIFACT_PLACEMENT.yaml)
- DOC [CITDP-DOC-STDD-TIED-PROJECT-BROWNFIELD.yaml](../DOC-STDD-TIED-PROJECT-BROWNFIELD/CITDP-DOC-STDD-TIED-PROJECT-BROWNFIELD.yaml)

### Risk summary

Detail: [evidence/risk-assessment-refine-pass1.md](./evidence/risk-assessment-refine-pass1.md).

1. **Historical CITDP overwrite** — dry-run + git commit; conflicts fail closed.
2. **Checklist gate slice family** — explicit basename policy (table above).
3. **Store-wide validate_consistency debt** — scoped verify; note in handoff.

**CITDP persist:** Defer to Slice 5 close-out (`citdp_record_write`).

---

## EDPC choreography (Slice 4 refresh)

| Phase | Actions | Outputs |
| --- | --- | --- |
| **A** | Charter under `evidence/edpc/`; access + engagement validate | `engagement-charter.v1.yaml`, matrix |
| **B** | Inventory counts post-reconcile | `inventory.v1.json` |
| **C** | `tied_corpus_graph_*`; optional `tied_project_lint` sample | receipts, updated code↔token map |
| **F** | `tied_edpc_publish_build`; envelope batch | manifest, gap report refresh |
| **G** | `session-handoff.md`, comprehension-gap-backlog | handoff |

Workflows **D/E:** N/A.

---

## Implement (build-plan — after gate)

**Gate:** `pre_implementation` allowed; Slice 0 enrollment complete; RED tests failing before production code.

1. Slice 0 — MCP/`tied-cli` token create; pseudo-code sidecar; EDPC charter copy.
2. Slices 1–3 — TDD core + MCP.
3. Slice 4 — **Stop** for sponsor review between dry-run and `--apply`.
4. Slice 5 — Close-out gates per [REQ-TIED_CLIENT_OPERATOR_TOOLING](../REQ-TIED_CLIENT_OPERATOR_TOOLING/plan-close-out-handoff.md) pattern.

**Explicitly out of scope:** BFIE `approved`; auto full-corpus verify; semantic YAML merge of conflicts.

---

## Satisfaction criteria (REQ draft)

- **SC-MHR-RECONCILE** — 35-row ledger; fail closed on unresolved `structural_conflict`.
- **SC-MHR-MCP** — MCP tools mirror CLI semantics.
- **SC-MHR-CORPUS-MAP** — Meta-hub §4 sections present.
- **SC-MHR-EDPC** — Publish manifest + EDPC artifacts under this working root.
- **SC-MHR-NO-INDEX** — Index writes only for new tokens.
- **SC-MHR-TESTS** — New tests green; scoped consistency clean.
