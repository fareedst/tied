# Integrated activation evidence — checklist enforcement plan

**Status:** Refined execution plan (2026-08-23, refine-plan pass 2)  
**Audience:** TIED methodology maintainers, prompt-type skill authors, MCP/agentstream implementers  
**Motivation:** Client `1787503424` completed a full four-prompt pass (`plan-new-feature` → `refine-plan` → `build-plan` → `plan-close-out`) with strong **minimal** adversarial thinking (CITDP counterexamples, gate-enforced fields, adversarial unit tests) but **no integrated activation**. That result is valid because its CITDP selected `depth_tier: minimal`. This plan separates **Batch 1** (shipped shared gate + pairing when supplied) from **Batch 2** (operational integrated enforcement without caller hand-wiring).

**Related tokens:** `[REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]`, `[REQ-TIED_ADVERSARIAL_INQUIRY]`, `[PROC-AGENT_REQ_CHECKLIST]`, `[IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT]`, `[IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST]`

**Related docs:**

- [`integrated-activation-enforcement-operator-friction-plan.md`](integrated-activation-enforcement-operator-friction-plan.md) — pilot-derived fixes for enforcement holes and operator friction (client `1787507684`)
- [`adversarial-inquiry-activation-recommendation.md`](adversarial-inquiry-activation-recommendation.md) — maturity model and operating contract
- [`adversarial-inquiry-checklist-integration-plan.md`](adversarial-inquiry-checklist-integration-plan.md) — step mapping (Batches 5–6)
- [`adversarial-inquiry-checklist-integration-checklist.md`](adversarial-inquiry-checklist-integration-checklist.md) — Part H activation pilots (**H5 shipped** 2026-08-24, client `1787507684`)
- [`tied/vocab/fidelity-research.md`](../tied/vocab/fidelity-research.md) — **integrated activation evidence**, **activation artifact pairing**, **checklist evidence gate**, **prior depth tier**, **depth-change waiver**, **close-out inquiry waiver**, **phase-aware slug set**

**Working artifacts (Batch 2 planning):**

- Tracker: `working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT_batch2_tracker.yaml`
- CITDP draft: `working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/CITDP-REQ-TIED_CHECKLIST_GATE_ENFORCEMENT-batch2-draft.yaml` (**deferred persist** — `tied/citdp/` after Slice 1 implementation)
- Gate evidence: `working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/gate-pre-implementation.json` (must be raw `tied_checklist_gate_validate` output)

---

## 0. Refinement and planning gates

### Refine gate (RESOLVE)

Sponsor terms resolved to canonical vocabulary ([`fidelity-research.md`](../tied/vocab/fidelity-research.md), [`quality-assurance.md`](../tied/vocab/quality-assurance.md), [`prompt-composer.md`](../tied/vocab/prompt-composer.md)):

| Term | Resolution |
|------|------------|
| **checklist evidence gate** | Shared fail-closed `tied_checklist_gate_validate` boundary for Tracker dispositions, CITDP `depth_tier`, and optional activation evidence. |
| **integrated activation evidence** | Successful `tied_adversarial_inquiry_run` receipt paired with all four request-scoped artifacts; metric-only, checklist-marker-only, or `profile_depth` labels are insufficient. |
| **activation artifact pairing** | Identity and hash check joining receipt to `obligation-report.json`, `finding-ledger.jsonl`, `gate-result.json`, and `evidence-provenance.json`. |
| **Tracker disposition** | `pending`, `completed`, `not_applicable`, or `waived`; each non-pending value has its own evidence or approval contract. |
| **`depth_tier`** | Adversarial-inquiry choice: `minimal`, `integrated`, or `strict_candidate`. |
| **`profile_depth`** | Evidence-chain selector (`integrated` \| `human_research`) or `not_measured` when `evidence_chain_profile_generate` was not run. **Not** a synonym for `depth_tier`. |
| **prior depth tier** | Previous `depth_tier` on the same CITDP snapshot; null on first selection. |
| **depth-change waiver** | `integrated_waiver` or `depth_change_waiver` with owner, expiry, rationale, approval. |
| **close-out inquiry waiver** | Allows skipping a new close_out inquiry when findings are unchanged; does not authorize a verification receipt as close_out `activation`. |
| **phase-aware slug set** | Auto-required Tracker slugs derived inside the validator; caller slugs union only. |
| **linked plan** | This document; refined in place by refine-plan. |

**Vocabulary RECORD/VALIDATE:** Pass 2 RECORD added **prior depth tier**, **depth-change waiver**, **close-out inquiry waiver**, and **phase-aware slug set** to `tied/vocab/fidelity-research.md`. VALIDATE against this plan, Tracker, and CITDP draft (no commit this pass).

**Ambiguity accepted (unchanged):** Collector helper name (`tied_checklist_activation_collect`) remains provisional until MCP registration; manual assembly remains the supported path until Slice 2.

**Ambiguity accepted (existing checklist overload):** `sub-adversarial-inquiry-pass` preconditions still say `profile_depth (minimal|integrated|strict_candidate)`. That is a checklist-local overload of **`depth_tier`**. Slice 1 does not rename the checklist field; agents must keep **`profile_depth`** (evidence-chain) distinct in CITDP.

### Resolved policy decisions (open questions closed)

#### 1. `strict_candidate` vs integrated prerequisites

| Depth | Minimal counterexample fields | Integrated pairing (receipt + four artifacts) | Strict eligibility / blocking |
|-------|------------------------------|-----------------------------------------------|------------------------------|
| `minimal` | Required | Not required | Not applicable |
| `integrated` | Not required (pairing replaces) | Required at each gated phase | Advisory by default |
| `strict_candidate` | Required (Batch 1 today) | **Required at `verification` and `close_out`** (Batch 2 Slice 1) | Warn-only until human approval + strict eligibility recorded |

**Rule:** `strict_candidate` is not a shortcut past integrated activation. It adds strict-eligibility preparation on top of integrated pairing at late phases. At `pre_implementation`, `strict_candidate` may pass with counterexamples only (same as today); at `verification` and `close_out`, pairing is mandatory.

#### 2. One inquiry run for multiple phases

**A receipt satisfies exactly one gate phase.** `run_id` and `phase` are identity-bound. Passing a receipt whose `phase` differs from the gate `phase` fails with `receipt_identity_mismatch:phase`.

**`completion_criteria.activation` is a citation, not a reusable receipt.** At `close_out`, that field must name the verification `run_id` (and hashes). That citation does not make the verification receipt valid `activation` input at `close_out`.

**Close-out inquiry options (exactly one):**

1. New `tied_adversarial_inquiry_run` with `phase: close_out` and a **distinct** `run_id`, paired as `activation`; or
2. **close-out inquiry waiver** `{ owner, expiry, rationale, approval, referenced_verification_run_id }` when findings are unchanged.

Waiver path: pairing of a close_out receipt is not required; pairing of a verification receipt submitted as `activation` is still rejected.

#### 3. Depth downgrade policy

Downgrading `depth_tier` from `integrated` or `strict_candidate` to `minimal` mid-request:

1. CITDP must set **`prior_depth_tier`** to the previous value (null only on first selection).
2. Requires **depth-change waiver**: `risk_analysis.adversarial_inquiry.integrated_waiver` **or** `depth_change_waiver` with `{ owner, expiry, rationale, approval }`.
3. Invalidates downstream Tracker dispositions and gate evidence per `loop_back_invalidates_downstream_evidence`.
4. Gate diagnostic: `depth_downgrade_requires_waiver` when `prior_depth_tier` is `integrated` or `strict_candidate`, current `depth_tier` is `minimal`, and waiver is absent.

The validator is snapshot-pure: without `prior_depth_tier` it cannot infer history. Slice 1 therefore treats missing `prior_depth_tier` as “first selection” (no downgrade check). Tests must set `prior_depth_tier` explicitly. Optional gate input `prior_depth_tier` may override for fixtures.

Silent downgrade is forbidden. Upgrading minimal → integrated requires fresh inquiry evidence; prior minimal counterexamples alone do not satisfy pairing.

#### 4. Caller slug merge (was unspecified)

When depth is `integrated`, or `strict_candidate` at `verification`/`close_out`:

- Derive the **phase-aware slug set**.
- **Union** caller `required_step_slugs` with that set.
- Caller **cannot subtract** auto slugs. Omitting `required_step_slugs` still applies the auto set.

#### 5. Phased delivery order (Batch 2)

| Slice | Phases | Rationale |
|-------|--------|-----------|
| **Slice 1 (first build-plan scope)** | **B** + **A2** — auto **phase-aware slug set**, `completion_criteria.activation` on gate read, **depth-change waiver** / `prior_depth_tier`, phase-bound `run_id`, `strict_candidate` late pairing; add waiver fields to `citdp-record-template.yaml` | Closes the core enforcement gap without new MCP surface |
| **Slice 2 (optional, parallel if staffed)** | **C** — `tied_checklist_activation_collect` MCP + CLI | Lowers agent friction; not a prerequisite for Slice 1 acceptance |
| **Slice 3 (adoption proof)** | **G** — H5 non-Ruby pilot | Proves end-to-end integrated branch; depends on Slice 1 |
| **Deferred** | **A3** high-risk minimal warn | Non-blocking diagnostic; after Slice 1 stabilizes |

Phases **D**, **E**, and **F** are **Batch 1 shipped baseline**. Batch 2 adds **automatic** integrated enforcement inside the validator rather than re-implementing those layers.

### This refine-plan pass — depth and gate policy (re-evaluated)

| Selector | Value | Why |
|----------|-------|-----|
| `depth_tier` | `minimal` | Plan-only refinement; no Slice 1 code; no `tied_adversarial_inquiry_run` |
| `gate_policy` | `advisory` | Default; no strict pilot |
| `profile_depth` | `not_measured` | No evidence-chain profile generated. Pass 1's `profile_depth: integrated` (measurement only) is **withdrawn** — that label is not measurement. |
| Integrated activation | **Not claimed** | Client `1787503424` remains valid **minimal** evidence only |

Pass 1 `gate-pre-implementation.json` is **invalidated**: it added `profile_depth` and `gate_policy` fields that `validateChecklistGate` does not emit, and it predates Tracker/CITDP refresh. Re-run the **checklist evidence gate** after this pass; persist only the tool JSON.

### CITDP Plan gate

- **Batch 1** canonical CITDP: `tied/citdp/CITDP-REQ-TIED_CHECKLIST_GATE_ENFORCEMENT.yaml` (complete).
- **Batch 2** draft CITDP: working path above. Persist to `tied/citdp/` is **deferred** until Slice 1 behavior-changing implementation (`persist-citdp-record` / [citdp-policy.md](../tied/docs/citdp-policy.md)).
- **Canonical TIED YAML:** no REQ/ARCH/IMPL mutation this refine-plan pass. Slice 1 build-plan LEAPs `[IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT]` pseudo-code first.
- **Pre-implementation gate:** see refreshed `gate-pre-implementation.json` (`allowed: true`, `depth: minimal`).

---

## 1. Problem statement

Integrated activation is defined but not yet **automatically enforced** end-to-end:

| Signal | Defined? | Enforced at gate today? | Observed on client `1787503424` |
|--------|----------|-------------------------|----------------------------------|
| CITDP `depth_tier` | Yes | Yes (invalid/missing depth fails) | `minimal` — valid |
| Minimal counterexamples / falsification | Yes | Yes (gate failed until filled) | Present |
| `tied_adversarial_inquiry_run` receipt | Yes | Only when `depth_tier: integrated` **and** caller passes `activation` | Absent (not required at minimal) |
| Four bounded artifacts under `working/{REQ}/adversarial-inquiry/` | Yes | Same — caller-supplied pairing only | Directory created, empty |
| Identity-bound pairing | Yes (`validateActivationPairing`) | Only when caller passes `activation` | Never submitted |
| Auto **phase-aware slug set** inside validator | Specified (Batch 2 Slice 1) | **No** — caller must pass `required_step_slugs` | Not attempted |
| Checklist `sub-adversarial-inquiry-pass` | Yes (canonical checklist) | Prose + optional caller slugs | Not recorded (minimal client) |
| Prompt-type skills sequence inquiry → gate | Yes (prose/contracts) | Gate authoritative when exercised | Not invoked (minimal client) |

**Core gap:** When a workflow selects integrated depth, agents can still pass gates by omitting `activation` and `required_step_slugs` unless they manually wire both. Batch 2 Slice 1 moves slug sets and pairing requirements inside `validateChecklistGate` for integrated depth.

---

## 2. Enforcement target

When `risk_analysis.adversarial_inquiry.depth_tier` is **`integrated`** (or **`strict_candidate`** at verification/close_out):

1. **`pre_implementation`:** inquiry pass with `phase: pre_implementation`, `blocking: false`, persisted artifacts, matching receipt, and `sub-adversarial-inquiry-pass` completed with evidence refs (or justified N/A only when depth is not integrated).
2. **`verification`:** inquiry pass with `phase: verification` (distinct `run_id`); `verification-gate` completed; pairing required; `completion_criteria.activation` populated from this run.
3. **`close_out`:** `completion_criteria.activation` cites the verification `run_id`; **either** a new close_out inquiry (distinct `run_id`) **or** a **close-out inquiry waiver**; then CHANGELOG/completion claims.
4. **Tracker:** at integrated depth, `sub-adversarial-inquiry-pass` is `completed` with evidence refs to four artifact paths and the inquiry metric line.

**Non-goal:** Force integrated depth on every REQ.

---

## 3. Batch 1 — shipped baseline (do not re-implement)

| Layer | Artifact | Role |
|-------|----------|------|
| REQ | `tied/requirements/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT.yaml` | Satisfaction criteria |
| IMPL | `IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT-pseudocode.md` | `VALIDATE_ACTIVATION_PAIRING`, `VALIDATE_CHECKLIST_GATE` |
| Validator | `mcp-server/src/checklist-validator.ts` | Pure functions; optional `requiredStepSlugs`; pairing when `activation` supplied |
| MCP | `tied_checklist_gate_validate` | Read-only gate tool |
| Inquiry | `checklist-integration.ts` | Persists four artifacts; returns receipt |
| MCP | `tied_adversarial_inquiry_run` | Identity-bound inquiry |
| Metrics | `analyze_tied_mcp_metrics.rb --project-root` | Offline artifact completeness |
| CITDP | `citdp-record-template.yaml`, `citdp-policy.md` | Depth tiers documented; `completion_criteria.activation` shape already in template |
| Checklist | `agent-req-implementation-checklist.yaml` | `sub-adversarial-inquiry-pass` + six callers |
| Prompt skills | bundled prompt-type skills | Prose: inquiry → gate at integrated depth |
| Wiring | `verify.ts`, `feature-orchestration/commands.ts`, `citdp-writer.ts` | Consume gate; validate activation on write |
| Tests | `checklist-validator.test.ts`, `checklist-gate-mcp.test.ts`, etc. | Minimal + pairing fixtures |

**Batch 1 close-out Tracker:** `working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT_tracker.yaml`

---

## 4. Batch 2 — remaining gaps

### 4.1 Validator auto-enforcement (Phase B + A2 — Slice 1) — **Shipped** (Batch 2 Slice 1, 2026-08-23)

- Built-in **phase-aware slug set** via `derivePhaseAwareSlugs` and `INTEGRATED_REQUIRED_SLUGS`.
- `completion_criteria.activation` validated on gate **read** at verification/close_out.
- `prior_depth_tier` / `depth_downgrade_requires_waiver` enforced.
- `receipt_identity_mismatch:phase` when reusing a run across phases.
- `strict_candidate` requires pairing at verification/close_out.
- Template includes `prior_depth_tier`, `integrated_waiver`, and `close_out_inquiry_waiver` fields.

Evidence: `mcp-server/src/checklist-validator.ts`, `checklist-validator.test.ts`, `tied/citdp/CITDP-REQ-TIED_CHECKLIST_GATE_ENFORCEMENT-batch2.yaml`.

### 4.2 Agent ergonomics (Phase C — Slice 2) — **Shipped**

- `tied_checklist_activation_collect` MCP/CLI helper assembles gate-ready activation from phase dirs.

Evidence: `mcp-server/src/tools/index.ts`, `checklist-activation-collect.test.ts`, `tied/citdp/CITDP-REQ-TIED_CHECKLIST_GATE_ENFORCEMENT-slice2.yaml`.

### 4.3 Adoption proof (Phase G — Slice 3 / H5) — **Shipped** (2026-08-24, client `1787507684`)

- H5 second non-Ruby pilot completed with paired metric and four artifacts.
- Client `1787503424` remains valid minimal evidence only.

Evidence: `working/client-1787507684-activation-audit/`, `CITDP-REQ-ROOTJOBS` client record.

### 4.4 Policy hardening (A3) — **Shipped** (Batch 2 Slice A3, 2026-08-24)

- Warn-only `minimal_depth_missing_waiver` when `eligibility_triggers_matched` is non-empty, `depth_tier` is `minimal`, and `integrated_waiver` is incomplete.
- Distinct from fail-closed `depth_downgrade_requires_waiver`; advisory `gate_policy` does not block on this diagnostic alone.

Evidence: `mcp-server/src/checklist-validator.ts`, `tied/citdp/CITDP-REQ-TIED_CHECKLIST_GATE_ENFORCEMENT-sliceA3.yaml`.

---

## 5. Design principles

1. **Fail closed on integrated depth only** — minimal unchanged.
2. **No second workflow** — extend `[PROC-AGENT_REQ_CHECKLIST]` and existing gate.
3. **Receipt + four artifacts or nothing** — activation artifact pairing.
4. **Identity binding** — request, project, run, phase, scope, scope_hash match.
5. **One receipt, one phase** — no cross-phase receipt reuse; close-out citation ≠ receipt.
6. **Proof boundaries preserved** — pre_implementation inquiry makes no runtime claim.
7. **LEAP on confirmed findings only.**
8. **Do not treat labels as activation** — `profile_depth`, checklist text, and inherited `execution_evidence` are not **integrated activation evidence**.

---

## 6. Phased implementation

### Phase A — Depth selection policy

| # | Deliverable | Status |
|---|-------------|--------|
| A1 | Integrated depth eligibility in `tied/docs/citdp-policy.md` | **Shipped** |
| A2 | CITDP template `prior_depth_tier`, `integrated_waiver`, `close_out_inquiry_waiver` | **Slice 1** (moved from “planned later”) |
| A3 | High-risk minimal warn in validator | **Shipped** (Slice A3, 2026-08-24) |
| A4 | Prompt-shared depth recording text | **Shipped** (verify on change) |

### Phase B — Register integrated depth in the checklist gate (Slice 1)

| # | Deliverable | Details |
|---|-------------|---------|
| B1 | `INTEGRATED_REQUIRED_SLUGS` map | See §13 phase table — not a single flat list applied at every phase |
| B2 | Phase-aware slug sets | Derived when `depth === 'integrated'`, or `strict_candidate` at verification/close_out; caller slugs **union** |
| B3 | `validateAdversarialContract` extension | Require `completion_criteria.activation` at `verification` and `close_out` for those depths |
| B4 | Diagnostics | `missing_sub_adversarial_step`, `missing_completion_activation`, `integrated_depth_requires_pairing`, `depth_downgrade_requires_waiver`, `receipt_identity_mismatch:phase` |
| B5 | Tests | Integrated pass/fail fixtures; VolumeStats layout; downgrade and phase-reuse failures |

**Acceptance (Slice 1 only):** RED tests first; integrated fixture passes; empty `adversarial-inquiry/` fails; omitted auto slugs fail; downgrade without waiver fails; verification receipt at close_out fails.

### Phase C — Activation payload collector (Slice 2, optional)

| # | Deliverable | Details |
|---|-------------|---------|
| C1 | `tied_checklist_activation_collect` MCP tool | Assemble `{ receipt, artifacts, expected }` from disk + optional metrics |
| C2 | `tied-cli.sh` wrapper | Offline parity |
| C3 | Composition test | inquiry → collect → gate → `allowed: true` |
| C4 | Runbook in `tied/vocab/tied-yaml-mcp.md` | Metrics + collect + validate sequence |

**Acceptance:** Same contract as manual assembly; mismatching `run_id` fails closed.

### Phase D — Checklist sub-procedure (Batch 1 baseline)

Sub-procedure, six callers, agentstream render tests — **shipped**. Regression-only for Batch 2.

### Phase E — Prompt-type skill enforcement (Batch 1 baseline + adoption)

Skills and e2e prose tests — **shipped**. Batch 2 adds static test updates if collector lands (Slice 2). H5 proves runtime adoption (Slice 3).

### Phase F — Verification and close-out wiring (Batch 1 baseline)

`verify.ts`, feature orchestration, citdp-writer — **shipped**. Batch 2 validator auto-slugs reduce caller burden on these paths.

### Phase G — Pilot and metrics H5 (Slice 3)

| Step | Action |
|------|--------|
| G1 | Clone client `1787503424` pattern with `depth_tier: integrated` + Mode A builder |
| G2 | Full prompt sequence; ≥1 inquiry metric per required phase (distinct `run_id`s) |
| G3 | Four artifacts populated; `analyze_tied_mcp_metrics.rb --project-root` → complete |
| G4 | Gate at each phase (collect helper if Slice 2 landed, else manual assembly) |
| G5 | Record in Part H5; update activation recommendation status |

---

## 7. Recommended depth policy

| Work class | Default `depth_tier` | Integrated activation required? |
|------------|----------------------|----------------------------------|
| Methodology/tooling change in TIED repo (Batch 2 **build-plan** implementation) | `integrated` for dogfooding | Yes, unless explicit **depth-change waiver** |
| This refine-plan pass | `minimal` | No |
| New client feature, behavior-changing | `minimal` unless eligibility triggers | Only if integrated selected |
| Read-only local CLI, no secrets/network | `minimal` with rationale | No |
| External input, auth, network, persistence, strict close-out | `integrated` | Yes |

Prompt skills surface the eligibility table at `risk-assessment` and require sponsor confirmation to stay on `minimal` when any trigger matches.

---

## 8. Agent execution checklist (integrated depth)

Copy into per-request Tracker `operator_evidence` when running integrated pilots (build-plan / H5 — **not** this refine-plan pass):

```text
1. risk-assessment: set depth_tier integrated; record gate_policy advisory (unless strict pilot).
2. Record prior_depth_tier (null on first selection).
3. Create working/{REQ-TOKEN}/adversarial-inquiry within the request working root.
4. pre_implementation:
   a. CALL tied_adversarial_inquiry_run with unique run_id, phase pre_implementation
   b. Confirm four artifacts written
   c. Assemble activation payload (or CALL tied_checklist_activation_collect when available)
   d. CALL tied_checklist_gate_validate phase=pre_implementation with activation
5. verification (before tied_verify):
   a. NEW run_id, phase verification — do not reuse pre_implementation run
   b. inquiry + pairing + gate
   c. Write completion_criteria.activation from this run
6. close_out:
   a. Keep completion_criteria.activation citing the verification run_id
   b. NEW close_out inquiry if findings changed; else close-out inquiry waiver
   c. Never pass the verification receipt as activation at close_out
   d. CALL tied_checklist_gate_validate phase=close_out
   e. Only then CHANGELOG / completion claims
7. Offline: ruby scripts/analyze_tied_mcp_metrics.rb --project-root $ROOT metrics.jsonl
```

---

## 9. Test matrix (RED-first, Batch 2)

| Test | Proves | Slice |
|------|--------|-------|
| `checklist-validator.test.ts` — integrated without activation | Fail closed | 1 |
| `checklist-validator.test.ts` — integrated without sub-adversarial slug (caller omits; auto set still required) | `missing_sub_adversarial_step` or `pending_required_step` / `missing_required_step` | 1 |
| `checklist-validator.test.ts` — caller slugs omit an auto slug | Fail closed (union, no subtract) | 1 |
| `checklist-validator.test.ts` — integrated with VolumeStats fixture | Pass | 1 |
| `checklist-validator.test.ts` — same run_id, different phase | `receipt_identity_mismatch:phase` | 1 |
| `checklist-validator.test.ts` — verification receipt at close_out even with citation | `receipt_identity_mismatch:phase` | 1 |
| `checklist-validator.test.ts` — integrated → minimal without waiver (`prior_depth_tier` set) | `depth_downgrade_requires_waiver` | 1 |
| `checklist-validator.test.ts` — missing `prior_depth_tier` | No downgrade diagnostic (first selection) | 1 |
| `checklist-validator.test.ts` — verification/close_out missing `completion_criteria.activation` | `missing_completion_activation` | 1 |
| `checklist-validator.test.ts` — strict_candidate at close_out without pairing | Fail closed | 1 |
| `checklist-gate-mcp.test.ts` — MCP wiring | Tool returns diagnostics | 1 |
| `checklist-integration.test.ts` — persist + receipt hashes | Artifact source (regression) | 1 if touched |
| Optional collect composition test | collect → gate | 2 |
| E2E pilot (G) — client 1787503424 replay at integrated | H5 human evidence | 3 |

---

## 10. Rollout and migration

1. **Batch 1 complete** — preserve regression tests; do not reopen unless tests fail.
2. **Batch 2 Slice 1 (B + A2)** — validator auto-enforcement; RED-first; LEAP IMPL pseudo-code if blocks added.
3. **Batch 2 Slice 2 (C)** — optional collector; separate MCP registration + composition test.
4. **Batch 2 Slice 3 (G)** — H5 pilot after Slice 1 merges.
5. **Refresh clients** — `copy_files.sh` updates checklist + skills; existing minimal CITDP records remain valid.
6. **No retroactive failure** — client `1787503424` remains valid minimal activation.

---

## 11. Success criteria

| Criterion | Status |
|-----------|--------|
| Shared gate validates minimal counterexamples and pairing when supplied (Batch 1) | Done |
| Integrated depth cannot pass verification/close_out **without caller wiring** today | **Shipped** (Batch 2 Slice 1) |
| Integrated depth cannot pass verification/close_out **without auto-enforced pairing** | **Shipped** (Batch 2 Slice 1) |
| `sub-adversarial-inquiry-pass` registered with render coverage (Batch 1) | Done |
| Optional MCP/CLI collect path | **Shipped** (Batch 2 Slice 2) |
| Prompt skills sequence inquiry → pairing → gate (Batch 1 prose) | Done |
| H5 pilot: second non-Ruby client with paired metric + four artifacts | **Shipped** (2026-08-24, client `1787507684`) |
| Minimal triggered depth without waiver emits machine-visible warn diagnostic (A3) | **Shipped** (Batch 2 Slice A3, 2026-08-24) |
| Canonical TIED YAML unchanged this refine-plan pass | Done (working artifacts + vocab + linked plan) |
| Vocabulary RECORD | Done — pass 2 terms recorded |

---

## 12. Out of scope

- Native Go project-input adapter (Mode B)
- Strict-approved blocking pilots (after integrated advisory stable)
- Universal integrated depth on all REQs
- Automated YAML/Markdown checklist parity (integration checklist F4)
- Slice 1 production/validator code in this refine-plan pass (`build-plan` owns that)
- Claiming **integrated activation evidence** for this refine-plan pass

---

## 13. Slice 1 executable contract (build-plan input)

This is the only scope a later `build-plan` may execute first.

### 13.1 Phase-aware slug set

| Gate phase | Auto-required slugs when `depth_tier` is `integrated` |
|------------|------------------------------------------------------|
| `pre_implementation` | `risk-assessment`, `sub-adversarial-inquiry-pass`, `gate-pseudocode-validation` |
| `verification` | `risk-assessment`, `sub-adversarial-inquiry-pass`, `verification-gate` |
| `close_out` | `risk-assessment`, `sub-adversarial-inquiry-pass`, `verification-gate`, `traceable-commit` |

For `strict_candidate`, apply the same auto set **only** at `verification` and `close_out`. At `pre_implementation`, Batch 1 counterexample rules apply (no auto slugs).

### 13.2 Files in Slice 1

- `tied/implementation-decisions/IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT-pseudocode.md` (LEAP first)
- `mcp-server/src/checklist-validator.ts` and `checklist-validator.test.ts`
- `mcp-server/src/tools/checklist-gate-mcp.test.ts` if diagnostics surface through MCP
- `tied/docs/citdp-record-template.yaml` (A2 fields)

Not Slice 1: new MCP collect tool, prompt-skill prose rewrites beyond a one-line diagnostic mention, H5 client replay.

### 13.3 Build-plan depth for Slice 1 implementation

When executing Slice 1 code, select `depth_tier: integrated` and `gate_policy: advisory` for dogfooding. Run `tied_adversarial_inquiry_run` at each gated phase with distinct `run_id`s. Persist four artifacts under `working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/adversarial-inquiry/` plus per-phase gate JSON. Do not fake activation with checklist text.

### 13.4 IMPL blocks to add (build-plan, not this pass)

Extend `[IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT]` with token-commented blocks:

- `DERIVE_PHASE_AWARE_SLUGS`
- `VALIDATE_DEPTH_DOWNGRADE`
- `VALIDATE_COMPLETION_ACTIVATION`
- `VALIDATE_RECEIPT_PHASE`

Each new Active block: PRE/POST/EFFECTS; then `[PROC-PSEUDOCODE_VALIDATION]` before RED.

---

**Next action (`build-plan`):** Execute Batch 2 Slice 1 (§13) against `[REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]` using `REQ-TIED_CHECKLIST_GATE_ENFORCEMENT_batch2_tracker.yaml`. Do not start RED until IMPL pseudo-code for §13.4 is complete. Persist Batch 2 CITDP after implementation. Slice 2 (collector) and Slice 3 (H5) follow after Slice 1 tests pass.
