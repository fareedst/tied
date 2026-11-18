# [REQ-TIED_AS_OPERATED_BASELINE] — refined plan (pre-implementation)

| Field | Value |
| --- | --- |
| **Token** | `REQ-TIED_AS_OPERATED_BASELINE` (proposed — not in indexes until `@build-plan`) |
| **Origin** | `@add-feature` → `@refine-plan` 2026-11-18 |
| **plan_phase** | `pre-implementation` |
| **CITDP** | [CITDP-REQ-TIED_AS_OPERATED_BASELINE.draft.yaml](./CITDP-REQ-TIED_AS_OPERATED_BASELINE.draft.yaml) |
| **Tracker** | [checklist-tracker.yaml](./checklist-tracker.yaml) |
| **Test strategy** | [test-strategy.md](./test-strategy.md) |
| **Vocab** | [as-operated-baseline.md](../../vocab/as-operated-baseline.md) |
| **Depth** | `profile_depth: minimal` · `gate_policy: advisory` · `depth_tier: minimal` |
| **Dogfood** | [DOC-TIED-RDB-ANALYSIS](../DOC-TIED-RDB-ANALYSIS/) @ `06178d55` |
| **Runbook** | [replacement-discovery-baseline-runbook.md](../../../docs/methodologies/replacement-discovery-baseline-runbook.md) |

**Refinement boundary:** PLAN, CITDP draft, vocab, tracker, test-strategy design, and enrollment **payload** JSON only. No project index writes, no RED tests, no checklist-validator code in this pass.

---

## Sponsor intent (RESOLVE)

| Term | Meaning |
| --- | --- |
| **VRAI** | Vocab + REQ + ARCH + IMPL in `tied-project/` — **design intent** and verification targets |
| **As-operated baseline (RDB 0–7)** | **Reality** at control boundaries: runbook phases **0–7**, artifacts **00–09**, `replacement-discovery/registry/*.yaml` — monitoring and evidence, **not** a replacement program |
| **Replacement phases 8–11** | Explicitly **out of scope** for REQ satisfaction and snapshot gates |

**Enrollment posture (locked @add-feature):** **Methodology-immediate** — `[PROC-TIED_AS_OPERATED_BASELINE]` + checklist facet in the **same** store program as dogfood analysis.

**Checklist binding (sponsor locked for store):** `as_operated_baseline.mode: active` with mandatory **snapshot gates** at checklist slugs **`composition-integration`** and immediately **before** **`verification-gate`** (step id: pre-snapshot at composition boundary + full baseline before verify).

---

## REQ satisfaction criteria (build-plan enrollment)

| ID | Criterion |
| --- | --- |
| **SC-AOB-ENROLL** | `REQ-TIED_AS_OPERATED_BASELINE`, `ARCH-TIED_AS_OPERATED_BASELINE`, `IMPL-TIED_AS_OPERATED_BASELINE`, `PROC-TIED_AS_OPERATED_BASELINE` enrolled in `tied-project/` with cross-links to runbook and `[REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]` |
| **SC-AOB-VRAI-BOUNDARY** | REQ detail states VRAI ≠ as-operated; RDB record prefixes are **not** semantic tokens; no automatic REQ promotion from RDB rows (BFIE `observed` / `report_only` unless sponsor elevates) |
| **SC-AOB-MODE** | Tracker facet `as_operated_baseline.mode` ∈ `{ follow_up_only, active }`; default **`follow_up_only`** for unspecified trackers; store methodology docs cite **`active`** as enrolled default |
| **SC-AOB-SNAPSHOT-COMPOSITION** | When `mode: active`, validator requires **Snapshot-A** minimums (below) before `composition-integration` may complete |
| **SC-AOB-SNAPSHOT-PREVERIFY** | When `mode: active`, validator requires **Snapshot-B** minimums before `verification-gate` may complete |
| **SC-AOB-NO-PHASE-8-11** | Satisfaction criteria and PROC **forbid** phases 8–11, artifacts 10–13, and replacement-readiness gates as completion requirements |
| **SC-AOB-RUNBOOK-LINK** | `[PROC-TIED_AS_OPERATED_BASELINE]` links generic runbook; runbook remains non-`[PROC-*]` until sponsor promotes runbook body separately |
| **SC-AOB-VALIDATOR** | Unit tests on `checklist-validator` cover `follow_up_only` (no snapshot block) and `active` (both snapshot slugs) |
| **SC-AOB-LAYOUT** | Working layout `tied-project/working/{REQ-TOKEN}/replacement-discovery/` mirrors dogfood registry **shapes** (LEAP names, no forked prefix semantics) |

---

## Snapshot registry minimums

Artifacts live under `tied-project/working/{request_token}/replacement-discovery/`. Registry YAML **shapes** inherit [DOC-TIED-RDB-ANALYSIS/registry](../DOC-TIED-RDB-ANALYSIS/replacement-discovery/registry/) (field names, `engagement`, `records[]`, evidence refs).

### Snapshot-A — `composition-integration` gate

**Receipt:** `tied-project/working/{REQ-TOKEN}/evidence/rdb-snapshot-composition-integration-receipt.v1.json`

| Artifact / registry | Minimum |
| --- | --- |
| `00-mission-boundary-and-assumptions.md` | Git revision, explicit **phases 8–11 deferred**, scope boundary table |
| `registry/actors.yaml` | ≥1 **ACT** |
| `registry/capabilities.yaml` | ≥3 **CAP** naming composition/integration surfaces for this REQ (bindings, MCP registration, prompt wiring, etc.) |
| `registry/contracts.yaml` | ≥5 **CON** with `status` and intended vs observed where applicable |
| `registry/integrations.yaml` | ≥2 **INT** at external boundaries under test |
| `registry/topology.yaml` | As-built path for deploy/test relevant to composition slice |
| `registry/evidence.yaml` | ≥3 **EV** citing revision + path for composition claims |
| **Mini gates** | **G-0** met; **G-2** partial (≥3 CAP); **G-4** partial (DAT stub + INT coverage) |

### Snapshot-B — pre `verification-gate`

**Receipt:** `tied-project/working/{REQ-TOKEN}/evidence/rdb-snapshot-pre-verification-gate-receipt.v1.json`

Adopt **Analysis completion gates G-0–G-7 and G-9** from [replacement-discovery-baseline/PLAN.md](../../non-tied-plans/replacement-discovery-baseline/PLAN.md) (full counts: ≥3 ACT, ≥5 OUT, ≥10 CAP, ≥15 CON, DAT/INT two-folder, as-built narrative, FAIL/GAP risks, VER per critical CAP, `09-evidence-uncertainties-and-questions.md`).

| Package | Minimum |
| --- | --- |
| Artifacts `00`–`09` | All present or explicit waiver rows in `registry/gaps.yaml` |
| Registries | Full set under `replacement-discovery/registry/*.yaml` per runbook §4 |
| Phase evidence | Optional `evidence/phase-{0..7}-report.md` for methodology store; **not** gating for client `follow_up_only` |

---

## ARCH sketch (build-plan)

| Decision | Choice |
| --- | --- |
| Layout | `working/{REQ}/replacement-discovery/` + `evidence/rdb-snapshot-*.v1.json` receipts |
| EDPC / BFIE | **Compose** — reuse claims ledger paths when EDPC engagement active; RDB snapshots remain `observed`; do not duplicate BFIE matrix inside every registry file |
| Checklist facet | Top-level tracker key `as_operated_baseline: { mode, snapshot_gates[], working_root, receipts[] }` |
| Validator seam | Extend `mcp-server/src/checklist-validator.ts` (mirror `brownfield_intent_elevation` / EDPC facet pattern) |
| Authority | Snapshots are **evidence** for gates; they do **not** mutate `tied-project/*.yaml` indexes |

---

## IMPL sketch (build-plan)

| Slice | Role |
| --- | --- |
| `IMPL-TIED_AS_OPERATED_BASELINE` | Facet reader, snapshot minimum checker, receipt schema `rdb-snapshot-receipt.v1` |
| Checklist hooks | On `composition-integration` and `verification-gate` step validation when `mode: active` |
| Pseudo-code | [IMPL-TIED_AS_OPERATED_BASELINE-pseudocode.md](./IMPL-TIED_AS_OPERATED_BASELINE-pseudocode.md) |

**Non-goals v1:** Dedicated RDB MCP writers; automated phase 0–7 authoring; phase 8–11 tooling; WF trial CI matrix.

---

## Test strategy

See [test-strategy.md](./test-strategy.md). RED targets: `checklist-validator.test.ts` matrix for `as_operated_baseline` facet; fixture trees under `mcp-server/test/fixtures/as-operated-baseline/`.

---

## Costly choices (sponsor)

| # | Choice | Refine default | Store enrollment |
| --- | --- | --- | --- |
| C1 | Default tracker `mode` | **`follow_up_only`** (reversible; clients opt in to `active`) | Sponsor locked **`active`** for methodology immediate + dual snapshot gates |
| C2 | Methodology-immediate PROC | Same program as dogfood | **Accepted** |
| C3 | Phase 8–11 | Forbidden in REQ SC | **Accepted** |
| C4 | BFIE disposition on RDB rows | `observed` / `report_only` only | **Accepted** |

---

## Gate record (refine-plan)

| Phase | Result | Notes |
| --- | --- | --- |
| `pre_implementation` | **`allowed: true`** | `tied_gate_check` 2026-11-18; [phase-handoff-refine-plan.md](./evidence/phase-handoff-refine-plan.md) |

---

## TIED enrollment payloads (build-plan)

| File | Purpose |
| --- | --- |
| [payload-req-create.json](./payload-req-create.json) | MCP/CLI REQ create |
| [payload-arch-create.json](./payload-arch-create.json) | ARCH create |
| [payload-tokens.json](./payload-tokens.json) | Semantic token batch |

---

## Do next

**`@build-plan`** — MCP enroll R+A+I+PROC; implement facet + RED tests; link `processes.md`; persist CITDP to `tied-project/citdp/`.