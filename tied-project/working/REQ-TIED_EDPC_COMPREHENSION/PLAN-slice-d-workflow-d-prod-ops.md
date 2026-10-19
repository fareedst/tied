# Slice D — Workflow D (production / operational failure analysis)

**Refine-plan pass:** 2 · **2026-10-19**  
**Methodology anchor:** [EDPC §9 Workflow D](../../../../docs/methodologies/EDPC_Methodology_and_Workflows.md) (historical, current-state, prospective failure analysis)  
**Program:** [REQ-TIED_EDPC_COMPREHENSION](./PLAN.md) v1 close-out complete · this slice extends orchestration without reopening v1 SC-* closure semantics  
**Tracker (this pass):** [checklist-tracker-slice-d-refine.yaml](./checklist-tracker-slice-d-refine.yaml)  
**CITDP delta:** [CITDP-slice-d-workflow-d.yaml](./CITDP-slice-d-workflow-d.yaml)  
**Test strategy:** [test-strategy-slice-d.md](./test-strategy-slice-d.md)  
**Risk:** [evidence/risk-assessment-refine-pass2-workflow-d.md](./evidence/risk-assessment-refine-pass2-workflow-d.md)

---

## Refine (resolved terms)

| Term | Canonical meaning |
| --- | --- |
| **Workflow D (prod ops)** | EDPC workflow **D** — failure, degradation, masked failure, and time-bounded **current health**; not “liveness = healthy.” |
| **Operational Failure State Model (OFSM v1)** | File bundle satisfying EDPC §17 deliverable 4: incident/history index, present health snapshot, failure-mode register, observability gaps — linked from SCM shell, not a separate DB. |
| **Observation window** | Required `start`, `end`, `timezone`, and `environment` on every present-state classification (EDPC principle 7). |
| **Health classification** | One of `healthy_within_observed_scope`, `degraded`, `failing`, `masked_compensated`, `suspected`, `unknown` per critical capability (EDPC §9 step 8). |
| **Prod ops evidence (tier 2)** | At `toolchain_readonly`: Observed claims from **local/CI/staging** runs and static incident records; **not** production telemetry unless `production_touch` ≠ `none`. |
| **Prod ops evidence (prod read)** | At `production_touch: read_only`: Observed from approved read-only queries/logs/metrics within charter window; still no fault injection unless `approved_execute`. |

**RESOLVE charter:** Sponsor intent is **executable Workflow D choreography** in TIED (validate/build/publish gaps + route classes), aligned to the methodology doc — not certification of target-system health.

---

## Goal (Slice D)

Ship tier- and charter-bounded **Workflow D** support:

1. **Artifacts** — OFSM v1 files under `evidence/edpc/` with schema validation.
2. **MCP** — `tied_edpc_failure_state_validate` and `tied_edpc_failure_state_build` (names stable in v1.1); publish manifest and SCM shell include OFSM refs and explicit `gaps[]` when D is in route but evidence is insufficient.
3. **Routing** — Extend `tied_edpc_workflow_route` question classes from EDPC §13 ops examples.
4. **PROC / vocab** — `[PROC-EDPC_COMPREHENSION]` step 4 and `edpc-comprehension.md` updated after implementation (methodology doc §9 unchanged unless sponsor requests doc LEAP).
5. **Dogfood** — **D-lite** on `stdd`: history + local toolchain signals only (`production_touch: none`); no production health claims.

---

## EDPC §9 steps → TIED choreography

| §9 step | Intent | v1.1 artifact / queue | Enforcement |
| --- | --- | --- | --- |
| 1 | Correctness / outcomes | `engagement-charter.v1.yaml` → `critical_outcomes[]` | `tied_edpc_engagement_validate` extended or charter schema lint |
| 2 | History | `incident-history-index.v1.yaml` (refs to tickets/postmortems/commits) | Optional for dogfood; required when route includes D and sponsor lists incidents |
| 3 | Present baseline | `observation-window.v1.yaml` + `capability-health-snapshot.v1.yaml` | Window required; version/config ids from SCM shell `minimum_fields` |
| 4 | Masked / silent failure | `masked-failure-signals.v1.yaml` (checklist + evidence refs) | Findings → `edpc-queues.v1.yaml` finding / evidence_gap |
| 5 | Failure modes | `failure-mode-register.v1.yaml` (FMEA-style rows) | Validated fields: trigger, detectability, compensation |
| 6 | Competing causes | `edpc-queues.v1.yaml` hypothesis queue | No duplicate mega-checklist |
| 7 | Verify safely | `evidence-access-matrix.v1.yaml` + `production_touch` | `tied_edpc_access_validate` rejects prod Observed when touch forbidden |
| 8 | Classifications | Rows in health snapshot | **Fail-closed:** reject blanket `healthy` without linked evidence_ids |
| 9 | Consequence | Finding template fields in queues | Ranges/unknowns OK; no invented counts |
| 10 | New questions | finding + question queues | Route reprioritize via existing `tied_edpc_workflow_route` |

**Exit gate (methodology):** mirrored in validate — every **critical_outcome** has a classification or explicit `blind_spot:*` gap; publish must not emit “system healthy” summary without operational evidence class.

---

## Semantic tokens (Slice D extension)

| Layer | Token | Action |
| --- | --- | --- |
| REQ | `[REQ-TIED_EDPC_COMPREHENSION]` | Add satisfaction criteria **SC-EDPC-D-OFSM**, **SC-EDPC-D-ROUTE**, **SC-EDPC-D-NO-BLANKET-HEALTH** (LEAP at build-plan) |
| ARCH | `[ARCH-TIED_EDPC_ARTIFACT_MODEL]` | Document OFSM file set + merge into SCM shell / publish |
| IMPL | **`IMPL-TIED_EDPC_FAILURE_OPS`** (new) | Validate + build OFSM; pseudo-code sidecar before RED |
| IMPL | `[IMPL-TIED_EDPC_ORCHESTRATION]` | Route table additions |
| IMPL | `[IMPL-TIED_EDPC_PUBLISH]` | Merge OFSM refs + D-specific gaps |
| PROC | `[PROC-EDPC_COMPREHENSION]` | Replace “v1 dogfood defers full D” with D-lite + prod touch rules |

---

## Versioned artifacts (additions)

Path: `tied-project/working/{REQ-TOKEN}/evidence/edpc/`

| File | Role |
| --- | --- |
| `observation-window.v1.yaml` | Single active window for present-state claims |
| `incident-history-index.v1.yaml` | Workflow D step 2 |
| `capability-health-snapshot.v1.yaml` | Classifications + evidence_ids + confidence |
| `failure-mode-register.v1.yaml` | FMEA-style register |
| `masked-failure-signals.v1.yaml` | §9 step 4 signal checklist |
| `operational-failure-state-bundle.v1.yaml` | Index pointing at the above (OFSM entry) |

**SCM shell:** `receipt_refs.operational_failure_state` → bundle path.  
**Publish:** extend manifest with `operational_failure_state_gaps[]` or unified `gaps[]` prefix `ofsm:` / `health:`.

**Templates (build-plan):** `tied-bundle/templates/edpc-observation-window.v1.example.yaml`, `edpc-capability-health-snapshot.v1.example.yaml`, etc.

---

## MCP / CLI (v1.1)

| Tool | Module |
| --- | --- |
| `tied_edpc_failure_state_validate` | `mcp-server/src/edpc/failure-state-validate.ts` |
| `tied_edpc_failure_state_build` | `mcp-server/src/edpc/failure-state-build.ts` |

**Contracts (summary):**

- **INPUT:** charter, access matrix, OFSM bundle paths, optional claims-ledger rows for cross-check.
- **POST:** no Observed/Verified health claims when tier/`production_touch` forbids; every `critical_outcome` covered or gap recorded; no aggregate “healthy” flag without row-level evidence.
- **OUTPUT:** diagnostics + normalized bundle JSON for SCM attachment.

Read-only on project TIED YAML (same as existing EDPC tools).

---

## Workflow route extensions (EDPC §13)

| `question_class` | Workflows (before tier strip) | Source example |
| --- | --- | --- |
| `operational_health` | B, D, F | “Is the billing processor currently working?” (A optional via charter already done) |
| `billing_processor_health` | A, B, D, C, F | §13 explicit route |
| `resource_cost` | B, D, E, F | “Why is this system expensive?” |

Existing `source_static` strip of D/E unchanged.

---

## Implementation slices (after this refine-plan)

```mermaid
flowchart LR
  D0[D0_tokens_pseudocode]
  D1[D1_schemas_validate]
  D2[D2_build_publish_merge]
  D3[D3_route_classes]
  D4[D4_dogfood_d_lite]
  D0 --> D1
  D1 --> D2
  D2 --> D3
  D3 --> D4
```

| Sub-slice | Deliverable |
| --- | --- |
| D0 | IMPL token + sidecar; REQ SC-*; ARCH artifact section |
| D1 | RED tests for validate (tier, touch, classifications, blind spots) |
| D2 | Build merges OFSM into shell; publish gaps |
| D3 | Golden route tests for three question classes |
| D4 | Dogfood: npm test + git log as **local** Observed; manifest shows no prod touch |

**Out of scope (Slice D):** production `read_only` dogfood on real prod; fault injection; continuous G daemon; graph DB for failure propagation.

---

## Proof boundary

Slice D proves **inspectable OFSM artifacts and fail-closed validators** — not that `stdd` (or any target) is operationally healthy. EDPC §16 operational observability measures may be **sampled** in dogfood with explicit denominators.

---

## Sponsor choices (defaults for build-plan)

| Decision | Default | Ladder |
| --- | --- | --- |
| New IMPL token vs extend PUBLISH only | **New `IMPL-TIED_EDPC_FAILURE_OPS`** | reversible |
| Dogfood prod touch | **`none`** (D-lite local only) | reversible |
| `production_touch: read_only` in validator | **Implement rules in D1**; dogfood in follow-on charter | costly if skipped in code |
| Invalidate v1 close_out | **No** — Slice D is additive v1.1; new verification gate when code lands | costly |

---

## Implement gate (next: `@build-plan`)

1. Mint `IMPL-TIED_EDPC_FAILURE_OPS` + update REQ/ARCH via MCP.  
2. `pseudocode_validate` gate_mode on new sidecar.  
3. `tied_checklist_gate_validate` **`pre_implementation`** with Slice D tracker + CITDP delta + **new** integrated inquiry `run_id` (v1 close_out inquiry does not cover D1 RED).  
4. RED in `mcp-server/src/edpc/failure-state-*.test.ts` before GREEN.

See [test-strategy-slice-d.md](./test-strategy-slice-d.md).
