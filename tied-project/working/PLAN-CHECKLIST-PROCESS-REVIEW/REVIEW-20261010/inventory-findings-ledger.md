# Inventory and findings ledger — REVIEW-CHECKLIST-PROCESS-20261010

**Program:** [PLAN-CHECKLIST-PROCESS-REVIEW](../PLAN.md) phase 2  
**Procedure:** [checklist-process-review-plan.md](../../../../docs/checklist-process-review-plan.md)  
**Revision:** `886b557f190ae20501c59943a496162ad114c602` (2026-10-10, uncommitted phase 1 tree included)  
**Scope:** Inventory + review only — **no deletes**, no `tied-bundle/` checklist edits.

---

## 1. Bootstrap boundary (pass 1)

| Field | Value |
| --- | --- |
| Review ID | `REVIEW-CHECKLIST-PROCESS-20261010` |
| Included roots | Canonical spine (`tied-bundle/docs/` checklist pair, `processes.md`, validation guides, placement doc); all `docs/*.md` (73 files); `tied-project/working/`; navigation (`AGENTS.md`, `README.md`, `tools/bootstrap/manifest.json`, `tied-project/vocab/routing.md`) |
| Excluded | Regenerable `tied-bundle/working/**`; one-off gate JSON unless cited as evidence |
| **Active** definition | Referenced by open Tracker/handoff, incomplete CITDP, or canonical methodology still installed via `tied-install` |
| TIED base path | `/Users/fareed/Documents/dev/chatgpt/stdd/tied-project` |
| Costly choices deferred | Canonical checklist rewrite (phase 4); bulk deletion (phase 3 batches) |

---

## 2. Inventory (pass 2)

### 2.1 Canonical process spine

| Path | Owner | Status | Authority role | Parent / child | Tokens |
| --- | --- | --- | --- | --- | --- |
| `tied-bundle/docs/agent-req-implementation-checklist.yaml` | TIED methodology | Active | **Machine step order** | MD mirror | [PROC-AGENT_REQ_CHECKLIST] |
| `tied-bundle/docs/agent-req-implementation-checklist.md` | TIED methodology | Active | Human mirror | YAML pair | [PROC-AGENT_REQ_CHECKLIST] |
| `tied-bundle/docs/processes.md` | TIED methodology | Active | PROC-* definitions | Indexes | Many PROC-* |
| `tied-bundle/docs/pseudocode-writing-and-validation.md` | TIED methodology | Active | IMPL pseudo-code lifecycle | Validation checklist YAML | [PROC-PSEUDOCODE_VALIDATION] |
| `tied-bundle/docs/pseudocode-validation-checklist.yaml` | TIED methodology | Active | Gate checklist | Writing guide | [PROC-PSEUDOCODE_VALIDATION] |
| `tied-bundle/docs/client-development-index.md` | TIED methodology | Active | Bootstrap map | AGENTS §1 | — |
| `tied-bundle/docs/tied-yaml-agent-index.md` | TIED methodology | Active | YAML MCP runbook | Skill | — |
| `tied-bundle/docs/working-artifact-placement.md` | TIED methodology | Active | Working root policy | REQ-TIED_WORKING_ARTIFACT_PLACEMENT | [PROC-WORKING_ARTIFACT_PLACEMENT] |
| `docs/checklist-process-review-plan.md` | Project | Active (phase 1) | Episodic review procedure | Worksheet | REQ-CHECKLIST-PROCESS-REVIEW |
| `docs/checklist-process-review-checklist.md` | Project | Active (phase 1) | Review worksheet A–J | Plan doc | REQ-CHECKLIST-PROCESS-REVIEW |

### 2.2 `docs/` plan corpus (cluster summary)

| Cluster | Representative paths | Count (approx.) | Authority role |
| --- | --- | ---: | --- |
| QMM / methodology learning | `tied-qmm-*.md`, `tied-qmm-methodology-learning-plan.md` | 12 | Program plans; link to `PLAN-TIED-QMM-*` / REQ handoffs |
| Pseudocode fleet / grammar v2 | `pseudocode-constraint-v2-fleet-*.md`, `pseudocode-grammar-v2-and-hygiene-plan.md` | 14 | Fleet orchestration; ties to `REQ-PSEUDOCODE_*` working trees |
| Adversarial inquiry | `adversarial-inquiry-*.md`, `tied-adversarial-inquiry-plan.md` | 6 | Integration plans; canonical behavior in methodology + REQ-TIED_ADVERSARIAL_INQUIRY |
| Checklist adherence / gates | `checklist-adherence-*.md`, `integrated-activation-*.md`, `process-adherence-evidence-grade-plan.md` | 8 | Improvement programs; must not override checklist YAML order without phase 4 |
| Agent stream runbooks | `run-agent-stream-*.md` | 4 | Operator runbooks | 
| BBCE / residuality / async | `tied-bbce-alignment-plan.md`, `tied-residuality-analysis-plan.md`, `tied-async-methodology-plan.md` | 3 | Open or recently closed programs — **non-delete default** |
| Bootstrap / layout | `methodology-detail-files-bootstrap-fix-plan.md`, `tied-project-alignment-recommendations.md` | 2 | Layout migration guidance |
| Outreach / comparisons | `comparisons/*.md`, `vocabulary-layer-tied-leap-citdp.md` | 5 | Non-authoritative outreach |
| Misc / close-out / hygiene | Remaining `docs/*.md` | ~19 | Mixed reference and historical |

Full file list: 73 paths under `docs/` (see `glob docs/**/*.md` at review revision).

### 2.3 `tied-project/working/` orchestrators (PLAN-*)

| Path | Status (header scan) | Non-delete default |
| --- | --- | --- |
| `PLAN-CHECKLIST-PROCESS-REVIEW/` | Phase 1 complete; phase 2 in progress | Yes |
| `PLAN-TIED-QMM-W2-CONFORMANCE-EFFECTIVENESS/` | Open program | **Yes** (async W2) |
| `PLAN-TIED-QMM-METHODOLOGY-LEARNING/` | Open / handoff | **Yes** (QMM follow-on) |
| `PLAN-TIED-QMM-FOLLOWON-A/`, `PLAN-TIED-QMM-FOLLOWON-C/` | Follow-on | **Yes** |
| `PLAN-TIED-QMM-W1-METHODOLOGY-PDSA/` … `W5-PROMPT-TYPE-GATE-ENROLLMENT/` | QMM waves | **Yes** until dispositioned |
| `PLAN-TIED-RESIDUALITY-ANALYSIS/` | Close-out evidence present | **Yes** (residuality) |
| `PLAN-TIED-BBCE-ALIGNMENT/` | Active alignment | **Yes** |
| `PLAN-TIED-KAIZEN-FEEDBACK-LOOP/` | Kaizen program | **Yes** |

REQ working folders: **80+** top-level entries under `tied-project/working/` (including fleet, pseudocode, Jev, Kaizen, Claude harness). Treat any folder with pending Tracker steps or recent gate receipts as **active handoff** until phase 3 disposition.

### 2.4 Navigation and install surfaces

| Path | Role |
| --- | --- |
| `AGENTS.md` | Agent bootstrap; points to checklist + MCP |
| `README.md` | Repo entry |
| `tied-project/vocab/routing.md` | Client vocab PRELOAD handoff |
| `tools/bootstrap/manifest.json` | Install manifest — validate against validation doc index when editing |

---

## 3. Contradictions (pass 5)

| ID | Sources | Expected authority | Impact | Disposition | LEAP / sponsor |
| --- | --- | --- | --- | --- | --- |
| CPR-F01 | 36× `docs/*.md` with `tied/docs/…` links (e.g. `tied-project-alignment-recommendations.md` ×18, `tied-async-methodology-plan.md` ×16) | `tied-bundle/docs/` or `tied-project/` paths per [REQ-TIED_TWO_FOLDER_LAYOUT] | Broken links for operators using two-folder layout | **update** (phase 3 batch) | Reversible path rewrite |
| CPR-F02 | Repo-root `working/` duplicates many names under `tied-project/working/` | Committed root is `tied-project/working/` per placement doc | Edits land in wrong tree | **update** — add navigation callouts; consider mirror deprecation batch | Costly if deleting mirror without sweep |
| CPR-F03 | `docs/layerb-sidecar-fix-close-out.md` cites `/stdd/tied/` base path | `tied-project/` | Stale close-out instructions | **update** | — |
| CPR-F04 | `tied-project/citdp/*.yaml` and historical Trackers still embed `tied/docs` in evidence_refs | Current paths | CITDP/traceability drift | **update** when those records are touched | Do not bulk-edit without scoped CITDP |

Historical context: Pre–two-folder layout aliases are **not** live contradictions with canonical checklist **semantics**; they are path drift (fixture CPR-F01 in operator plan).

---

## 4. Efficiency (pass 6)

| Metric | Finding |
| --- | --- |
| Duplicate instruction clusters | TDD / composition / E2E order repeated across `processes.md`, agent checklist MD, and multiple `docs/*-plan.md` files |
| Redundant bootstrap reads | AGENTS §1 long read list overlaps `client-development-index.md` |
| Repeated validation | `tied_validate_consistency` + `lint_yaml` documented in many plans with slightly different wording |
| Optional vs mandatory | Risk of treating episodic review worksheet as mandatory per-REQ — mitigated in phase 1 non-replacement text |
| Risk-triggered steps | Integrated activation docs vs minimal CITDP defaults — operators must set `depth_tier` independently (see integrated-activation plan) |

---

## 5. Reconcile — dispositions (pass 7)

| Finding | Disposition | Severity | Evidence | Sponsor approval |
| --- | --- | --- | --- | --- |
| Canonical checklist MD/YAML pair | **keep** | — | `tied-bundle/docs/agent-req-implementation-checklist.*` | — |
| Phase 1 operator docs | **keep** | — | `docs/checklist-process-review-*.md` | — |
| Legacy `tied/docs` in `docs/` | **update** | Medium | `rg -c 'tied/docs' docs/*.md` → 36 files | Phase 3 batch |
| Dual `working/` roots | **update** | Medium | Directory listing parity | Phase 3 batch |
| Open QMM / async / fidelity / residuality / bootstrap handoffs | **keep** (non-delete) | — | Plan § active work default | — |
| Superseded fleet close-out plans | **ambiguous** | Low | Needs per-plan gate receipt vs header | No delete until classified |

**Delete-candidate count:** **0** (no inbound reference sweeps attached in phase 2).

---

## 6. Default non-delete register (plan § active work)

Until individually dispositioned in phase 3, **do not delete** artifacts referenced by:

- `PLAN-TIED-QMM-W2-CONFORMANCE-EFFECTIVENESS` (async W2)
- `docs/methodology-detail-files-bootstrap-fix-plan.md` / `REQ-TIED_BOOTSTRAP_DETAIL_INTEGRITY` handoffs
- Fidelity pilot / `REQ-TIED_FIDELITY_RESEARCH` working material
- `PLAN-TIED-RESIDUALITY-ANALYSIS` close-out and handoffs
- QMM follow-on handoffs (`PLAN-TIED-QMM-FOLLOWON-*`, methodology learning cohort export, surface experiment gate)

---

## 7. Phase 2 close-out

| Check | Result |
| --- | --- |
| Phase 3 cleanup | **Doc batches complete** — F01–F03 + `../tied/*` rewrite; evidence [`evidence/phase-3-batch-tied-project-link-rewrite.md`](evidence/phase-3-batch-tied-project-link-rewrite.md) |
| Phase 4 methodology surface | **Not started** (by design) |
| `next_review_date` | Manual — after first phase 3 batch or major `tied-install` refresh |
