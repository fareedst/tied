# Harness trace observation loop

**Audience:** Operators reviewing agent sessions, transcripts, adherence notes, or harness traces after a TIED-tracked turn batch.

**Traceability:** [REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP](../../tied-project/requirements/REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP.yaml) · [ARCH-TIED_HARNESS_TRACE_OBSERVATION](../../tied-project/architecture-decisions/ARCH-TIED_HARNESS_TRACE_OBSERVATION.yaml) · [IMPL-TIED_HARNESS_TRACE_OBSERVATION](../../tied-project/implementation-decisions/IMPL-TIED_HARNESS_TRACE_OBSERVATION.yaml)

**Invoke skill:** `@harness-trace-review` (`tools/bundled-prompt-type-skills/harness-trace-review/SKILL.md`; installed under `.cursor/skills/harness-trace-review/`).

**Source studies:** [LangChain harness engineering × TIED](../../docs/comparisons/langchain-harness-engineering-vs-tied-agent-management.md) (trace/benchmark compose); [Cursor harness engineering × TIED](../../docs/comparisons/cursor-harness-engineering-vs-tied-agent-management.md) (online metrics / Keep Rate compose — **Cursor-reported** only).

---

## Proof boundary

| In scope | Out of scope |
| --- | --- |
| Structured review of **session / transcript / adherence** inputs → **operational observation** via **`tied_feedback_capture_observation`** | Vendor trace stores **as TIED core** (MCP gates, automatic YAML/LEAP) |
| Optional **client-side** LangSmith export → local JSON paths → **`@harness-trace-review`** / **`@harness-trace-analyzer`** ([REQ-TIED_HARNESS_LANGSMITH_COMPOSE](../../tied-project/requirements/REQ-TIED_HARNESS_LANGSMITH_COMPOSE.yaml)) | Harbor, Daytona, or other vendor adapters; LangSmith metrics as TIED effectiveness |
| Optional **Task** fan-out for failure-mode analysis (harness plane) | **`tied_checklist_gate_validate`**, **`tied_verify`**, or checklist waivers |
| **test-strategy executable matrix** wording in Tracker / test-strategy | Automatic REQ/ARCH/IMPL or LEAP from trace review |
| Compose with [pre-handoff verification charter](pre-handoff-verification-charter.md) | Terminal Bench or vendor benchmark scores as TIED effectiveness |

Trace review produces **Kaizen Loop 2** evidence. It does **not** prove implement-complete, merge-ready, or methodology rule changes.

---

## Procedure

1. **Scope inputs** — Collect the minimum review set: agent transcript excerpt, Tracker slug dispositions, gate receipt paths (if any), adherence notes, or harness working-folder artifacts under `tied-bundle/working/` (regenerable) vs committed rationale under `tied-project/working/`.
2. **Classify failure modes** — Map findings to the taxonomy below; avoid naming vendor “Trace Analyzer” as a shipped TIED product class.
3. **Compose, don’t replace** — Tune harness knobs (skills, PRELOAD, prompt-type choice); do **not** describe observations as gate outcomes ([authority boundary operator checklist](../../tied-project/working/REQ-TIED_HARNESS_PLATFORM_SEAM/authority-boundary-operator-checklist.md)).
4. **Capture once per batch** — Call **`tied_feedback_capture_observation`** with a stable **idempotency key** for the review batch (at most one capture per batch unless sponsor documents duplicate intent). See [feedback-to-tied.md](../../tied-project/vocab/feedback-to-tied.md).
5. **Optional Task fan-out** — For deep failure analysis, delegate to a foreground Task with explicit scope; Task output remains advisory until checklist-owned promotion (`add-feature`, `refine-plan`, `build-plan`, `close-out`).
6. **Promotion path** — Follow [Promotion path](#promotion-path); never mint project YAML from trace review alone.

---

## Failure-mode taxonomy

| Class | Symptom | Default harness response | Platform-adjacent note |
| --- | --- | --- | --- |
| **Context discovery** | Wrong repo, stale `TIED_BASE_PATH`, missing PRELOAD | Record observation; fix session bootstrap on next turn | **`tied_config_get_base_path`** before MCP writes |
| **Self-verify drift** | Chat claims tests passed without command evidence | Record observation; cite [test-strategy executable matrix](#test-strategy-executable-matrix) | **`tied_verify`** + gate receipts for implement claims |
| **Gate confusion** | Skill/hook language waives or replaces checklist gates | Record observation; fix harness prose | Gate authority unchanged |
| **YAML bypass** | Trace loop suggested direct index edits | Record observation; route via TIED MCP / **`tied-cli.sh`** | **`tied_validate_consistency`** after mutations |
| **Benchmark overclaim** | Vendor Terminal Bench % cited as TIED success | Record observation; label **LangChain-reported** / **`not_measured`** | No methodology effectiveness claim |
| **Product metric overclaim** | Keep Rate, CursorBench, or online A/B outcomes cited as TIED success | Record observation; label **Cursor-reported** / **`not_measured`** | No methodology effectiveness claim |
| **Promotion skip** | Observation treated as LEAP or REQ mint | Record observation; open **`add-feature`** or sponsor queue | LEAP via reviewed paths only |

---

## Promotion path

| Observation severity | Next step | Authority |
| --- | --- | --- |
| Harness wording / PRELOAD / skill clarity | Kaizen **operational observation** + optional doc fix via scoped plan | Harness |
| Methodology rule or checklist slug change | Sponsor **`add-feature`** or **`refine-plan`** on owning REQ | Checklist + TIED stack |
| Production-system countermeasure | Kaizen digest → **review bridge** → LEAP queue when approved | Sponsor ladder |
| Implement-complete claim | **`tied_checklist_gate_validate`** `verification` receipt + **`tied_verify`** when enabled | Platform-adjacent |

Observations stay **`promotion_pending`** until an owning workflow confirms.

---

## Outer loop (LangChain compose)

LangChain’s empirical **Trace Analyzer** pattern (fetch traces → parallel failure analysis → synthesize harness edits) is **not** shipped as a vendor product in TIED. This section maps the **compose** pattern to explicit skills:

| Step (external analog) | TIED surface | Authority |
| --- | --- | --- |
| Fetch traces | Caller-supplied transcript / working-folder paths; optional **`@harness-trace-langsmith-compose`** export to local JSON (**client-side**, not TIED core) | Automatic LangSmith fetch inside TIED MCP or gate tools |
| Parallel error analysis | Foreground **Task** fan-out with readonly scope (`@harness-trace-analyzer`) | Advisory until checklist-owned promotion |
| Synthesize harness edits | Proposal list (prompt / tools / middleware **analogs**) | **`add-feature`** / **`refine-plan`** / sponsor — not auto YAML |
| Record learning | **`tied_feedback_capture_observation`** once per batch | Kaizen Loop 2 |

**Invoke skills:**

- **`@harness-trace-review`** — lightweight Loop 2 review after a session batch ([REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP](../../tied-project/requirements/REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP.yaml)).
- **`@harness-trace-analyzer`** — multi-failure batches needing normative Task fan-out before synthesis ([REQ-TIED_HARNESS_LANGCHAIN_PHASE3](../../tied-project/requirements/REQ-TIED_HARNESS_LANGCHAIN_PHASE3.yaml)).
- **`@harness-trace-langsmith-compose`** — optional LangSmith run export into local JSON before the skills above ([REQ-TIED_HARNESS_LANGSMITH_COMPOSE](../../tied-project/requirements/REQ-TIED_HARNESS_LANGSMITH_COMPOSE.yaml)).

Vendor benchmark scores remain **LangChain-reported** / **`not_measured`** for TIED effectiveness.

---

## Optional LangSmith client compose

When the operator already uses LangSmith, **`@harness-trace-langsmith-compose`** documents an **opt-in** export path:

1. Set **`LANGSMITH_API_KEY`** in the operator environment (never commit).
2. Run the bundled script `export-langsmith-traces.mjs` with `--out` under `tied-project/working/{REQ-TOKEN}/` (or another caller-owned directory).
3. Hand off exported excerpts to **`@harness-trace-review`** or **`@harness-trace-analyzer`**.

This compose path does **not** grant gate authority, does **not** write project YAML, and does **not** prove methodology effectiveness.

---

## Test-strategy executable matrix

For TIED-tracked **implement** passes (`build-plan`, `add-feature` implement leg), the task **test-strategy** (or Tracker `test-strategy` step) must name **commands**, not model self-check prose alone.

| Field | Required content |
| --- | --- |
| **RED command(s)** | Concrete shell/test commands run before production/doc finalization (example: `node --test tools/bootstrap/lib/harness-trace-observation-loop-doc.test.mjs`) |
| **Green command(s)** | Same suite after implementation (exit code 0) |
| **Verification gate** | `tied_checklist_gate_validate` with `phase: verification` and receipt under `tied-project/working/{REQ-TOKEN}/gates/` |
| **Proof line** | Explicit statement that **model self-check is not sole proof** of test pass or gate allow |

Compose with [pre-handoff verification charter](pre-handoff-verification-charter.md) **Executable checks before handoff** table.

---

## Loop 3 pilot (optional)

When a sponsor scopes **HTOL effectiveness** (not just Loop 2 capture), use the Loop 3 charter and enrollment path—**does not** replace this guide or checklist gates:

- [HTOL pilot cohort runbook](htol-pilot-cohort-runbook.md) ([REQ-TIED_HTOL_PILOT_COHORT_RUNBOOK](../../tied-project/requirements/REQ-TIED_HTOL_PILOT_COHORT_RUNBOOK.yaml)) — enroll → tag captures → **`tied_feedback_pilot_run`** checklist
- [Harness trace learning experiment charter](harness-trace-learning-experiment-charter.md) ([REQ-TIED_HARNESS_TRACE_LEARNING_PILOT](../../tied-project/requirements/REQ-TIED_HARNESS_TRACE_LEARNING_PILOT.yaml))
- Templates: [htol-methodology-learning-experiment.v1.example.yaml](../templates/htol-methodology-learning-experiment.v1.example.yaml), [htol-feedback-pilot-spec.v1.example.yaml](../templates/htol-feedback-pilot-spec.v1.example.yaml), [htol-pilot-cohort-runbook-instance.v1.example.yaml](../templates/htol-pilot-cohort-runbook-instance.v1.example.yaml)

---

## Related documents

- [LangChain harness engineering × TIED — Phases 1–3](../../docs/comparisons/langchain-harness-engineering-vs-tied-agent-management.md#phased-recommendations-doc-first)
- [Cursor harness engineering × TIED](../../docs/comparisons/cursor-harness-engineering-vs-tied-agent-management.md)
- [Traefik harness/platform × TIED](../../docs/comparisons/traefik-harness-platform-vs-tied-agent-management.md)
- [Client development index](client-development-index.md)
- [Feedback to TIED (vocab)](../../tied-project/vocab/feedback-to-tied.md)
- [Agentstream README](../../mcp-server/packages/agentstream/README.md)

**Last updated:** 2026-10-21
