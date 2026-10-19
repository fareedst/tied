# EDPC program comprehension (canonical)

**Scope:** Domain vocabulary for Evidence-Driven Program Comprehension (EDPC) orchestration in TIED clients. Terms **do not** replace REQ/ARCH/IMPL authority.

**Traceability:** `[REQ-TIED_EDPC_COMPREHENSION]` · `[ARCH-TIED_EDPC_ARTIFACT_MODEL]` · `[IMPL-TIED_EDPC_ACCESS]` · `[IMPL-TIED_EDPC_ORCHESTRATION]` · `[IMPL-TIED_EDPC_PUBLISH]` · `[IMPL-TIED_EDPC_ENGAGEMENT_FACET]` · `[PROC-EDPC_COMPREHENSION]` · methodology [EDPC_Methodology_and_Workflows.md](../../tied-bundle/docs/EDPC_Methodology_and_Workflows.md)

**Status:** Slice 0 enrollment (2026-10-19). Re-VALIDATE on glossary edits per `[PROC-VOCABULARY_INDEX]`.

**See also:** [`routing.md`](routing.md) (row **2i**) · [`easar-recovery.md`](easar-recovery.md) (workflow **B** baseline) · [`quality-assurance.md`](quality-assurance.md) (proof boundaries)

---

## Core terms

| Term | Definition | TIED preferred name |
| --- | --- | --- |
| **EDPC engagement** | Umbrella comprehension orchestration | Tracker `brownfield_intent_elevation.engagement: edpc_full` with `mode: pilot` or `strict` |
| **Evidence-access tier** | Hard cap on agent/tool actions against the **target** repo | `edpc_engagement.evidence_access_tier`: `source_static` \| `toolchain_readonly` \| `source_change` |
| **SCM (v1)** | File-based Software Comprehension Model shell | `scm-snapshot-shell.v1.yaml` + `claims-ledger.v1.yaml` + EASAR receipt pointers |
| **Target repository** | Codebase under investigation | `edpc_engagement.target_repository_root` (absolute path) |
| **Production touch** | Charter field for runtime/production evidence | `production_touch`: `none` \| `read_only` \| `approved_execute` (tier ≥ toolchain for non-none) |

---

## Workflows A–G (v1 choreography)

| Id | Name | TIED entry (reference only) |
| --- | --- | --- |
| **A** | Commission | Charter + access matrix; MCP access/engagement validate |
| **B** | Baseline | `[PROC-EASAR_RECOVERY]` inventory/graph receipts |
| **C** | Deep slice | Source graph, Track C, claims review |
| **D** | Failure / ops | **OFSM v1** (`operational-failure-state-bundle.v1.yaml` + health snapshot); `tied_edpc_failure_state_validate` / `_build` (Slice D); fidelity/adversarial when integrated; prod Observed only when `production_touch` allows |
| **E** | Change impact | Scoped analysis; edits only at `source_change` |
| **F** | Verify / publish | `tied_edpc_publish_build`, envelope, gates |
| **G** | Refresh | Stale-claim triggers; route reprioritize (no daemon in v1) |

---

## Artifacts (committed working root)

Path: `tied-project/working/{REQ-TOKEN}/evidence/edpc/`

| File | Role |
| --- | --- |
| `engagement-charter.v1.yaml` | Workflow A |
| `evidence-access-matrix.v1.yaml` | Tier + capability flags |
| `edpc-queues.v1.yaml` | Five investigation queues |
| `scm-snapshot-shell.v1.yaml` | SCM index + receipt refs |
| `claims-ledger.v1.yaml` | Investigation claims (not adversarial finding-ledger) |
| `edpc-publish-manifest.v1.json` | Workflow F freeze |
| `operational-failure-state-bundle.v1.yaml` | Workflow D index (Slice D) |
| `capability-health-snapshot.v1.yaml` | Workflow D present-state classifications |
| `observation-window.v1.yaml` | Time-bound ops conclusions (EDPC principle 7) |
| `failure-mode-register.v1.yaml` | Workflow D FMEA-style register |
| `edpc-queues.v1.yaml` | Five live queues (EDPC §5); template [edpc-queues.v1.example.yaml](../../tied-bundle/templates/edpc-queues.v1.example.yaml) |

---

## Engagement naming supersession

| Engagement | Status |
| --- | --- |
| `edpc_full` | Primary EDPC umbrella |
| `easar_full` | **Deprecated alias** — same validation path + `deprecated_engagement_alias:easar_full` diagnostic |

Receipt builders and `[PROC-EASAR_RECOVERY]` remain authoritative for Mode C baseline under workflow **B**.

---

## Alphabetical index

| Term | Section |
| --- | --- |
| Baseline | Workflows A–G (v1 choreography) |
| claims-ledger.v1.yaml | Artifacts (committed working root) |
| Commission | Workflows A–G (v1 choreography) |
| easar_full | Engagement naming supersession |
| EDPC engagement | Core terms |
| edpc_full | Engagement naming supersession |
| edpc-publish-manifest | Artifacts (committed working root) |
| edpc-queues.v1.yaml | Artifacts (committed working root) |
| engagement-charter.v1.yaml | Artifacts (committed working root) |
| evidence-access tier | Core terms |
| evidence-access-matrix.v1.yaml | Artifacts (committed working root) |
| production touch | Core terms |
| SCM (v1) | Core terms |
| scm-snapshot-shell.v1.yaml | Artifacts (committed working root) |
| target repository | Core terms |
| Verify / publish | Workflows A–G (v1 choreography) |
