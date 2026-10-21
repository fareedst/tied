# Harness trace learning experiment charter (Loop 3)

**Audience:** Sponsors and methodology operators running a **bounded** Loop 3 PDSA pilot on whether **@harness-trace-review** / HTOL observations improve harness outcomes.

**Traceability:** [REQ-TIED_HARNESS_TRACE_LEARNING_PILOT](../../tied-project/requirements/REQ-TIED_HARNESS_TRACE_LEARNING_PILOT.yaml) · [REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP](../../tied-project/requirements/REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP.yaml) · [harness-trace-observation-loop.md](harness-trace-observation-loop.md)

**Invoke skill (Loop 2 captures):** `@harness-trace-review` (`surface_ref`: `harness-trace-review` on enrolled experiments).

**Source study:** [LangChain harness engineering × TIED — Phase 2](../../docs/comparisons/langchain-harness-engineering-vs-tied-agent-management.md#phased-recommendations-doc-first)

---

## Proof boundary

| In scope | Out of scope |
| --- | --- |
| **Charter + templates** for sponsor-run **`methodology-learning-experiment.v1`** enrollment on HTOL | LangSmith, Harbor, or vendor trace automation |
| **`tied_methodology_learning_experiment_upsert`** + optional **`tied_feedback_pilot_run`** analysis evidence | **`tied_checklist_gate_validate`**, **`tied_verify`**, or checklist waivers |
| Explicit **stop criteria**, denominators, **`not_measured` / inconclusive** until a real cohort exists | Terminal Bench or **LangChain-reported** scores as TIED effectiveness |
| Compose with Phase 1 [harness trace observation loop](harness-trace-observation-loop.md) | Automatic LEAP or project YAML promotion from pilot metrics alone |

This charter is **operator documentation + enrollment compose**—not proof that HTOL improves outcomes.

---

## Hypothesis template

Fill before upsert (example—replace bracketed text):

> **Hypothesis:** Structured **`@harness-trace-review`** sessions increase **actionable** Kaizen captures (operational observations with clear harness response) versus ad hoc transcript review, **within** `[min_cohort]`–`[max_cohort]` compatible entries over `[follow_up_window]`, privacy tier default **`operator_local`**.

Record the finalized hypothesis on the experiment row **`methodology_hypothesis`** field.

---

## Baseline

| Field | Guidance |
| --- | --- |
| **`methodology_baseline.snapshot_at`** | ISO timestamp when hypothesis is declared |
| **Pre-HTOL rate** | Use **`not_measured`** when no pre-charter capture count exists |
| **HTOL-tagged cohort size** | Metric row e.g. `htol_tagged_capture_count: not_measured` until **`context.denominator_fingerprint: htol-v1`** captures exist |
| **Vendor benchmarks** | Label **LangChain-reported** or **`not_measured`** only—never TIED methodology effectiveness |

---

## Pilot bounds and stop criteria

| Bound | Default |
| --- | --- |
| **Cohort size** | **Min 3 / max 30** compatible feedback captures unless sponsor extends in CITDP |
| **Follow-up window** | **≤ 8 weeks** from first enrolled capture unless sponsor extends |
| **Privacy tier** | Default **`operator_local`**; **`shareable_hashed`** only after redaction review |
| **Denominator** | Every pilot metric names numerator **and** denominator population; empty cohort → document **`not_measured`**, not implement failure |
| **Stop — privacy** | Halt if a capture exposes secrets outside operator-local policy |
| **Stop — cohort** | Halt if **zero** compatible entries after **N weeks** (default **4**) and sponsor does not extend window |
| **Stop — classification** | Halt if two consecutive captures lack resolvable **`compatibility_key`** |
| **Stop — sponsor** | Sponsor **costly choice** halt or promotion deferral |
| **Outcome cap** | On implement pass, set **`methodology_outcome_observation`** to **`not_measured`** or **`inconclusive`** only—never **`improved`** / **`regressed`** without sponsor-confirmed countermeasure + baseline |

**Promotion:** Pilot **`feedback-pilot.v1`** reports are **analysis only**. Methodology rule changes require **`add-feature`** / **`refine-plan`** on owning REQ—not pilot JSON alone.

---

## Operator sequence

**Paste-friendly checklist:** [HTOL pilot cohort runbook](htol-pilot-cohort-runbook.md) ([REQ-TIED_HTOL_PILOT_COHORT_RUNBOOK](../../tied-project/requirements/REQ-TIED_HTOL_PILOT_COHORT_RUNBOOK.yaml)) — fill-in fields, MCP names, and pilot spec skeleton for a real cohort. Policy prose remains in this charter.

1. **Declare hypothesis** — Sponsor scopes question, bounds, and stop criteria (this charter).
2. **Upsert experiment** — **`tied_methodology_learning_experiment_upsert`** with `schema_version: methodology-learning-experiment.v1`, `production_system_surface: prompt_type_workflow`, `surface_ref: harness-trace-review`. Template: [htol-methodology-learning-experiment.v1.example.yaml](../templates/htol-methodology-learning-experiment.v1.example.yaml).
3. **Optional enrollment check** — Read-only **`tied_methodology_production_system_enrollment_validate`** (structural completeness only).
4. **Run HTOL captures** — **`@harness-trace-review`** → **`tied_feedback_capture_observation`** with stable idempotency key per batch; optional **`context.denominator_fingerprint: htol-v1`** for cohort tagging.
5. **Optional bridge review** — **`tied_methodology_kaizen_experiment_bridge`** draft for sponsor review (no auto LEAP).
6. **Pilot run** — **`tied_feedback_pilot_run`** with [htol-feedback-pilot-spec.v1.example.yaml](../templates/htol-feedback-pilot-spec.v1.example.yaml); default **`compatibility_key`**: `feedback-capture.v1|operator_local`.
7. **Record outcome** — Update **`methodology_outcome_observation`** with evidence refs; prefer **`inconclusive`** when cohort &lt; min size, else **`not_measured`** until sponsor confirms countermeasure.

**Explicit:** Pilot steps do **not** replace checklist gates; vendor metrics stay **LangChain-reported** / **Cursor-reported** only.

---

## Test-strategy executable matrix

For TIED-tracked **implement** passes on this REQ (`build-plan`, `add-feature` implement leg), the task **test-strategy** must name **commands**, not model self-check prose alone.

| Field | Required content |
| --- | --- |
| **RED command(s)** | `node --test tools/bootstrap/lib/harness-trace-learning-experiment-charter-doc.test.mjs` |
| **Green command(s)** | Same suite after charter + templates on disk (exit code 0) |
| **Verification gate** | `tied_checklist_gate_validate` with `phase: verification` and receipt under `tied-project/working/REQ-TIED_HARNESS_TRACE_LEARNING_PILOT/gates/` |
| **Proof line** | **Model self-check is not sole proof** of charter completeness, enrollment validate, or pilot run |

Compose with [harness-trace-observation-loop.md](harness-trace-observation-loop.md) **Test-strategy executable matrix**.

---

## Related documents

- [HTOL pilot cohort runbook](htol-pilot-cohort-runbook.md) (operator checklist for a real cohort)
- [Harness trace observation loop (Phase 1)](harness-trace-observation-loop.md)
- [Incident and revert evaluation corpus](incident-revert-evaluation-corpus.md) (pilot bounds pattern)
- [Feedback to TIED (vocab)](../../tied-project/vocab/feedback-to-tied.md)
- [Methodology surface enrollment (advisory)](../../tools/bundled-prompt-type-skills/prompt-shared/methodology-surface-enrollment-advisory.md)

**Last updated:** 2026-10-21
