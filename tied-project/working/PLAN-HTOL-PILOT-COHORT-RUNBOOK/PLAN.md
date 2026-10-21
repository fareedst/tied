# PLAN — HTOL pilot cohort runbook (app-feature)

**Program:** Operator-facing **cohort runbook** (checklist + fill-in fields) composing existing Loop 3 charter—not a replacement for gates or a new MCP surface.

**Parent stack:** [REQ-TIED_HARNESS_TRACE_LEARNING_PILOT](../../requirements/REQ-TIED_HARNESS_TRACE_LEARNING_PILOT.yaml) · [harness-trace-learning-experiment-charter.md](../../../tied-bundle/docs/harness-trace-learning-experiment-charter.md) · [harness-trace-observation-loop.md](../../../tied-bundle/docs/harness-trace-observation-loop.md)

**Suggested REQ (if promoted):** `REQ-TIED_HTOL_PILOT_COHORT_RUNBOOK` or extend Phase 2 REQ via LEAP—resolve at `/add-feature`.

---

## Sponsor intent

Give sponsors and operators a **single paste-friendly runbook** to run a **real** HTOL pilot cohort (enroll → tag captures → pilot run → record outcome), distinct from the charter’s policy prose and from store dogfood row `mle-htol-pilot-20261021-001` (**inconclusive**, structural only).

---

## Deliverable (target)

| Artifact | Path |
| --- | --- |
| **Primary** | `tied-bundle/docs/htol-pilot-cohort-runbook.md` |
| **Cross-links** | Charter § Operator sequence; HTOL guide § Loop 3 pilot; [feedback-to-tied.md](../../vocab/feedback-to-tied.md) (`htol-v1` fingerprint) |
| **Optional template** | `tied-bundle/templates/htol-pilot-cohort-runbook-instance.v1.example.yaml` (experiment id, window, cohort_id, stop overrides) |
| **Contract test** | Extend or add bootstrap test asserting required sections (mirror charter-doc test pattern) |

---

## Scope in vs out

| In | Out |
| --- | --- |
| Step checklist, MCP tool names, copy-paste spec fragments | New gate MCP or checklist slugs |
| Defaults (3–30 cohort, 8-week window, `operator_local`) | LangSmith / vendor bench as TIED effectiveness |
| Link to `@harness-trace-review`, optional analyzer / LangSmith compose | Automatic LEAP from pilot metrics |
| **`not_measured` / `inconclusive`** outcome guidance | **`improved`** without sponsor countermeasure |

---

## Context from prior sessions (2026-10-21)

- LangChain harness Phases 1–4 shipped (review, pilot charter, analyzer, optional LangSmith compose **`fc3845d4`**).
- Sponsor **`/unblock`:** no `LANGSMITH_API_KEY`; live export deferred; contract tests suffice.
- Dogfood experiment **`mle-htol-pilot-20261021-001`** remains **inconclusive** until a real tagged cohort exists.

---

## Recommended next workflow

1. **`/add-feature`** on this PLAN (mint REQ/ARCH/IMPL if new token) or **`/refine-plan`** if doc-only under existing Phase 2 REQ.
2. **`/build-plan`** — author runbook + test + charter link.
3. **`/close-out`** — traceable commit when sponsor requests.

---

## profile_depth

`minimal` — documentation + bootstrap test; no integrated adversarial inquiry unless sponsor raises depth.
