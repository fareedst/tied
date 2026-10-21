# HTOL pilot cohort runbook (Loop 3)

**Audience:** Sponsors and operators running a **real** HTOL pilot cohort (enroll → tag captures → pilot run → record outcome)—paste-friendly checklist with fill-in fields.

**Traceability:** [REQ-TIED_HTOL_PILOT_COHORT_RUNBOOK](../../tied-project/requirements/REQ-TIED_HTOL_PILOT_COHORT_RUNBOOK.yaml) · [REQ-TIED_HARNESS_TRACE_LEARNING_PILOT](../../tied-project/requirements/REQ-TIED_HARNESS_TRACE_LEARNING_PILOT.yaml) · [Harness trace learning experiment charter](harness-trace-learning-experiment-charter.md)

**Policy (do not duplicate here):** Bounds, stop criteria, and outcome caps live in the [charter](harness-trace-learning-experiment-charter.md). Loop 2 review procedure: [harness-trace-observation-loop.md](harness-trace-observation-loop.md).

**Invoke skill (captures):** `@harness-trace-review` (`surface_ref`: `harness-trace-review` on enrolled experiments).

---

## Proof boundary

| In scope | Out of scope |
| --- | --- |
| Operator **checklist** + copy-paste MCP/tool names for one cohort window | New gate MCP, checklist slugs, or automatic LEAP |
| Defaults: **3–30** cohort, **≤ 8 weeks**, **`operator_local`** | LangSmith keys or vendor bench as TIED effectiveness |
| **`context.denominator_fingerprint: htol-v1`** cohort tagging | **`improved`** / **`regressed`** without sponsor countermeasure |
| Outcomes **`not_measured`** or **`inconclusive`** until sponsor review | Replacing **`tied_checklist_gate_validate`** or **`tied_verify`** |

This runbook is **operator documentation**—not proof that HTOL improves outcomes.

---

## Before you start (fill in)

Copy [htol-pilot-cohort-runbook-instance.v1.example.yaml](../templates/htol-pilot-cohort-runbook-instance.v1.example.yaml) to `tied-project/working/{REQ-TOKEN}/` and replace bracketed values.

| Field | Your value |
| --- | --- |
| **`experiment_id`** | e.g. `mle-htol-pilot-YYYYMMDD-001` (new row; do not reuse dogfood **`mle-htol-pilot-20261021-001`** for a real cohort unless sponsor extends bounds in CITDP) |
| **`cohort_id`** | e.g. `htol-pilot-local-001` |
| **`analysis_window.start` / `.end`** | ISO timestamps; default span **≤ 8 weeks** from first enrolled capture |
| **`working_folder`** | e.g. `tied-project/working/REQ-TIED_HTOL_PILOT_COHORT_RUNBOOK/` |
| **`hypothesis`** (one paragraph) | See charter [Hypothesis template](harness-trace-learning-experiment-charter.md#hypothesis-template) |
| **`TIED_BASE_PATH`** | Confirm via **`tied_config_get_base_path`** before any MCP write |

**Sponsor sign-off:** Hypothesis, bounds, and stop criteria acknowledged (charter § Pilot bounds).

---

## Runbook checklist

### 1. Declare hypothesis and baseline

- [ ] Finalize hypothesis text for **`methodology_hypothesis`**.
- [ ] Set **`methodology_baseline.snapshot_at`** to now (ISO).
- [ ] Set pre-charter metrics to **`not_measured`** when no prior count exists (charter § Baseline).

### 2. Upsert methodology learning experiment

- [ ] Build payload from [htol-methodology-learning-experiment.v1.example.yaml](../templates/htol-methodology-learning-experiment.v1.example.yaml) with your **`experiment_id`**, **`surface_ref: harness-trace-review`**, **`privacy_tier: operator_local`** (unless sponsor approved **`shareable_hashed`**).
- [ ] Call **`tied_methodology_learning_experiment_upsert`** (`schema_version: methodology-learning-experiment.v1`).
- [ ] Save upsert receipt under **`{working_folder}/evidence/`**.

### 3. Optional enrollment validate (read-only)

- [ ] **`tied_methodology_production_system_enrollment_validate`** — structural completeness only; not implement proof.

### 4. Run HTOL captures (Loop 2)

For each review batch in the pilot window:

- [ ] Scope inputs per [harness-trace-observation-loop.md](harness-trace-observation-loop.md) § Procedure.
- [ ] Invoke **`@harness-trace-review`** (or optional **`@harness-trace-analyzer`** for multi-failure batches).
- [ ] Call **`tied_feedback_capture_observation`** once per batch with a **stable idempotency key**.
- [ ] Include **`context.denominator_fingerprint: htol-v1`** on every pilot cohort capture ([feedback-to-tied.md](../../tied-project/vocab/feedback-to-tied.md)).
- [ ] Optional: **`@harness-trace-langsmith-compose`** only when **`LANGSMITH_API_KEY`** exists—export is **not** required for cohort.

**Stop checks (during capture):** Privacy leak → halt. Two consecutive captures without resolvable **`compatibility_key`** → halt per charter.

### 5. Optional Kaizen bridge (no auto LEAP)

- [ ] **`tied_methodology_kaizen_experiment_bridge`** — sponsor review only; no project YAML promotion from bridge output alone.

### 6. Pilot run (analysis evidence)

- [ ] Copy [htol-feedback-pilot-spec.v1.example.yaml](../templates/htol-feedback-pilot-spec.v1.example.yaml); set **`cohort_id`**, window, **`denominator_fingerprint: htol-v1`**, **`compatibility_key`**: `feedback-capture.v1|operator_local`.
- [ ] Call **`tied_feedback_pilot_run`** with the spec.
- [ ] Store **`feedback-pilot.v1`** report JSON under **`{working_folder}/evidence/`**.

### 7. Record outcome observation

- [ ] Update experiment row **`methodology_outcome_observation`** via **`tied_methodology_learning_experiment_upsert`** (or documented sponsor path).
- [ ] Use **`inconclusive`** when cohort &lt; min size (default **3** tagged captures).
- [ ] Use **`not_measured`** until sponsor confirms baseline + countermeasure.
- [ ] **Never** set **`improved`** / **`regressed`** without sponsor **costly choice** on charter § Outcome cap.

### 8. Promotion (if needed)

| Need | Next step |
| --- | --- |
| Harness doc/skill wording | Scoped doc fix or **`refine-plan`** |
| Methodology rule / REQ change | Sponsor **`add-feature`** / **`refine-plan`** on owning REQ |
| Implement-complete claim | **`tied_checklist_gate_validate`** verification + **`tied_verify`** when enabled |

Pilot JSON alone does **not** change methodology rules.

---

## Copy-paste pilot spec skeleton

Adjust dates and ids; pass to **`tied_feedback_pilot_run`**:

```yaml
spec:
  cohort_id: "htol-pilot-local-001"
  cohort:
    compatibility_key: "feedback-capture.v1|operator_local"
    denominator_fingerprint: "htol-v1"
    min_entries: 3
    max_entries: 30
  analysis_window:
    start: "2026-01-01T00:00:00Z"
    end: "2026-03-01T00:00:00Z"
  named_metrics:
    - "observations_captured"
    - "recurrence_groups"
    - "countermeasures_with_outcome"
    - "promotion_pending_rate"
  stop_criteria_policy:
    halt_on_trigger: false
    classification_ambiguity_threshold: 2
  transport_phase_status: "deferred_closed"
```

---

## Test-strategy executable matrix

For TIED-tracked **implement** passes on [REQ-TIED_HTOL_PILOT_COHORT_RUNBOOK](../../tied-project/requirements/REQ-TIED_HTOL_PILOT_COHORT_RUNBOOK.yaml):

| Field | Required content |
| --- | --- |
| **RED command(s)** | `node --test tools/bootstrap/lib/htol-pilot-cohort-runbook-doc.test.mjs` |
| **Green command(s)** | Same suite after runbook + links on disk (exit code 0) |
| **Verification gate** | `tied_checklist_gate_validate` with `phase: verification` and receipt under `tied-project/working/REQ-TIED_HTOL_PILOT_COHORT_RUNBOOK/gates/` |
| **Proof line** | Explicit: **model self-check is not sole proof** of runbook completeness or pilot run |

Compose with [harness-trace-learning-experiment-charter.md](harness-trace-learning-experiment-charter.md) **Test-strategy executable matrix**.

---

## Related documents

- [Harness trace learning experiment charter](harness-trace-learning-experiment-charter.md)
- [Harness trace observation loop](harness-trace-observation-loop.md)
- [Feedback to TIED (vocab)](../../tied-project/vocab/feedback-to-tied.md) — **`htol-v1`** fingerprint
- [LangChain harness × TIED — Phase 2](../../docs/comparisons/langchain-harness-engineering-vs-tied-agent-management.md#phased-recommendations-doc-first)

**Last updated:** 2026-10-21
