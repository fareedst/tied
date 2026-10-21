# Harness improvement arc — wrap-up and resumption guide

**Audience:** Sponsor and operators returning to LangChain / Cursor / Traefik harness × TIED work.  
**Date:** 2026-10-21  
**Scope:** Doc-first **compose** (Loop 2 trace review + Loop 3 learning pilots + authority seam)—not vendor product adoption.

**When to resume:** After you want (a) committed Cursor comparison outreach, (b) a **real** HTOL cohort, (c) optional LangSmith live smoke, or (d) a scoped **Cursor Phase 2** Loop 3 experiment—not before.

---

## 1. What this project set out to do

Map external **harness engineering** narratives (LangChain trace/bench loop, Cursor production evals/telemetry, Traefik harness vs platform seam) onto TIED’s existing proof stack: checklist gates, MCP YAML, Kaizen capture, methodology learning experiments—**without** claiming vendor metrics as TIED effectiveness.

**Center of gravity shipped:** operators can run structured **`@harness-trace-review`** (and optional **`@harness-trace-analyzer`**, **`@harness-trace-langsmith-compose`**) → **`tied_feedback_capture_observation`**, and sponsors can run a bounded Loop 3 pilot via charter + [cohort runbook](../../../tied-bundle/docs/htol-pilot-cohort-runbook.md).

---

## 2. Shipped inventory (safe to treat as baseline)

| Track | REQ / artifact | Status | Primary entry |
| --- | --- | --- | --- |
| **Traefik seam** | [REQ-TIED_HARNESS_PLATFORM_SEAM](../../requirements/REQ-TIED_HARNESS_PLATFORM_SEAM.yaml) | Implemented, close-out | [authority-boundary-operator-checklist.md](../REQ-TIED_HARNESS_PLATFORM_SEAM/authority-boundary-operator-checklist.md) |
| **LangChain Phase 1 — Loop 2** | [REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP](../../requirements/REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP.yaml) | Implemented | [harness-trace-observation-loop.md](../../../tied-bundle/docs/harness-trace-observation-loop.md), `@harness-trace-review` |
| **LangChain Phase 2 — Loop 3 charter** | [REQ-TIED_HARNESS_TRACE_LEARNING_PILOT](../../requirements/REQ-TIED_HARNESS_TRACE_LEARNING_PILOT.yaml) | Implemented | [harness-trace-learning-experiment-charter.md](../../../tied-bundle/docs/harness-trace-learning-experiment-charter.md) |
| **Cohort operator runbook** | [REQ-TIED_HTOL_PILOT_COHORT_RUNBOOK](../../requirements/REQ-TIED_HTOL_PILOT_COHORT_RUNBOOK.yaml) | Implemented | [htol-pilot-cohort-runbook.md](../../../tied-bundle/docs/htol-pilot-cohort-runbook.md) |
| **LangChain Phase 3** | [REQ-TIED_HARNESS_LANGCHAIN_PHASE3](../../requirements/REQ-TIED_HARNESS_LANGCHAIN_PHASE3.yaml) | Implemented | `@harness-trace-analyzer`, matrix §2 row 15 |
| **LangSmith compose (Phase 4)** | [REQ-TIED_HARNESS_LANGSMITH_COMPOSE](../../requirements/REQ-TIED_HARNESS_LANGSMITH_COMPOSE.yaml) | Implemented (no live API required) | `@harness-trace-langsmith-compose`, export script |
| **LangChain comparison phases 0–4** | (doc only) | **Implemented** in comparison table | [langchain-harness-engineering-vs-tied-agent-management.md](../../../docs/comparisons/langchain-harness-engineering-vs-tied-agent-management.md#phased-recommendations-doc-first) |

**Store dogfood row:** `mle-htol-pilot-20261021-001` in [methodology-experiments.yaml](../../methodology-experiments.yaml) — **`methodology_outcome_observation: inconclusive`** (structural enrollment + empty/zero tagged cohort; not a live pilot).

**Recent commits (harness-related):** `2b16e091` (cohort runbook), `d234ec00` (vocab link), `fc3845d4` (LangSmith compose), `d5c8e055` (Phase 3), earlier Phase 1/2/seam waves — see `git log --grep=htol`.

---

## 3. Loose ends in the working tree (not harness logic gaps)

These are **repo hygiene**, not missing REQ implement passes:

| Item | State | Suggested action when resuming |
| --- | --- | --- |
| [client-development-index.md](../../../tied-bundle/docs/client-development-index.md) — HTOL row folded (charter + runbook + both REQs) | Modified, **uncommitted** | Small doc commit or fold into next harness commit |
| [CHANGELOG.md](../../../CHANGELOG.md) | Modified (may include runbook entry; index line not updated) | Append index tweak if committing index |
| **Cursor comparison** docs (`cursor-harness-engineering-vs-tied-agent-management.md`, capture sibling) | **Untracked** (gitignore pattern on `docs/comparisons/*` except allowlist) | Sponsor: add gitignore exception + commit **or** keep local-only outreach |
| Other untracked `docs/comparisons/cursor-*`, tools/visuals | Unrelated or parallel tracks | Exclude from harness wrap-up unless sponsor expands scope |
| Miscellaneous dirty files (EDPC, source-graph, fixtures, `.gitignore`) | Unrelated workspace drift | Do not bundle into harness commits |

**No action required** to *use* shipped HTOL docs/skills in daily work; action only if you want a **clean git baseline** for the arc.

---

## 4. Pending work — outcomes, benefits, sponsor involvement

Involvement bands (for **this** sponsor-led store repo):

| Band | Meaning |
| --- | --- |
| **S0 — None** | Agent/doc/test only; sponsor not needed |
| **S1 — ~15–30 min** | Approve commit message, one policy yes/no, or read handoff |
| **S2 — ~1–2 hours** | Review hypothesis text, run one operator checklist, approve costly choice |
| **S3 — ~2–4 hours spread over 8 weeks** | Active cohort: enroll, periodic capture review, outcome cap decision |
| **S4 — ~1+ day + policy** | New REQ scope, gitignore/exceptions, keys, fleet ops, or client rollout |

### P1 — Repository hygiene (Cursor docs + index)

| Pending | Result / benefit after completion | Sponsor |
| --- | --- | --- |
| Commit folded **client-development-index** HTOL row | Operators discover charter + runbook from Core index in one row | **S1** |
| Publish **Cursor harness × TIED** comparison (+ optional capture) under allowed `docs/comparisons/` paths | Matrix §2 row 14 linked from git; Wave 2/3 outreach complete for Cursor article | **S1–S2** (S2 if editing gitignore allowlist) |

### P2 — Real HTOL effectiveness cohort (LangChain Loop 3 *execution*)

| Pending | Result / benefit after completion | Sponsor |
| --- | --- | --- |
| Run [htol-pilot-cohort-runbook.md](../../../tied-bundle/docs/htol-pilot-cohort-runbook.md): new **`experiment_id`**, ≥3 captures with **`context.denominator_fingerprint: htol-v1`**, **`tied_feedback_pilot_run`**, update **`methodology_outcome_observation`** | **Evidence** whether structured trace review improves actionable Kaizen captures in *your* harness (still bounded; may stay inconclusive); informs LEAP proposals, not auto rule changes | **S2** start (hypothesis + bounds); **S3** operator time (reviews); **S2** end (outcome cap—never **`improved`** without baseline + countermeasure) |
| Do **not** reuse dogfood `mle-htol-pilot-20261021-001` as the live cohort without explicit extension in CITDP | Avoids conflating structural proof with effectiveness proof | **S1** |

**Benefit if completed:** First honest Loop 3 datapoint for HTOL in this store; closes the gap called out in [Phase 2 close-out](../REQ-TIED_HARNESS_TRACE_LEARNING_PILOT/evidence/close-out-handoff.md) (empty cohort / inconclusive).

**Benefit if deferred:** Zero cost; charter + runbook still usable for ad hoc Loop 2 review.

### P3 — Optional LangSmith live export

| Pending | Result / benefit after completion | Sponsor |
| --- | --- | --- |
| Provision **`LANGSMITH_API_KEY`**; run `@harness-trace-langsmith-compose` export → hand off JSON to trace review | Richer failure-mode inputs for long LangGraph/LangSmith runs; still **not** TIED effectiveness | **S1** (key custody) + **S0** operator script run |

Documented deferral: [sponsor-decisions-evidence.md](../REQ-TIED_HARNESS_LANGSMITH_COMPOSE/evidence/sponsor-decisions-evidence.md).

### P4 — Cursor comparison Phase 2 (methodology learning — **not started**)

| Pending | Result / benefit after completion | Sponsor |
| --- | --- | --- |
| Scope hypothesis for Cursor-style ops (e.g. product-metric overclaim, context rot / tool errors) vs TIED harness outcomes | Dedicated Loop 3 experiment *narrative* for Cursor matrix row; comparison Phase 2 row moves **Defer → Implemented** | **S2–S4** (**S2** minimal doc-only charter extension; **S4** if claiming Keep Rate / online A/B compose—explicit **non-adoption** still required) |
| Optional: reuse HTOL MCP stack with new fingerprint / enrollment | Same machinery as P2; different hypothesis text | Same as P2 |

**Benefit if completed:** Clear proof boundary for **Cursor-reported** metrics; optional pilot that structured TIED harness ops reduce trace-review failure modes tied to Cursor article.

**Benefit if deferred:** Phase 1 already adds **product metric overclaim** to HTOL taxonomy; no duplicate charter required until hypothesis differs from HTOL.

### P5 — Client / fleet propagation

| Pending | Result / benefit after completion | Sponsor |
| --- | --- | --- |
| **`tied-install --refresh`** on downstream client repos | Fresh `tied-bundle/docs/*` harness guides and skills stubs | **S0** per repo or **S1** if many clients |
| Enrollment advisory **`ENROLLMENT_INVALID_PROMPT_TYPE`** for `harness-trace-review` (document-only in Phase 2 close-out) | Cleaner methodology surface enrollment UX if fixed in a future REQ | **S2** if promoting to implement |

### P6 — Explicit non-goals (remain deferred by design)

No sponsor work required unless policy changes:

- Terminal Bench / LangChain bench scores as TIED effectiveness (**LangChain-reported** only).
- CursorBench, Keep Rate, fleet **online A/B** as TIED core (**Cursor-reported** / client ops).
- Harbor, Daytona, LangSmith as TIED core (export compose only).
- Reasoning schedulers, mid-chat model switch behavior (IDE **Defer**).
- Automatic LEAP or YAML promotion from pilot JSON alone.

---

## 5. Recommended wrap-up posture (now)

1. **Treat LangChain comparison Phases 0–4 as complete** for methodology *documentation and compose*; effectiveness remains **`not_measured`** until P2.
2. **Treat Cursor comparison as outreach Phase 0–1 complete in prose** (if local docs exist); **Phase 2 pending** until P4.
3. **Park the arc** unless you choose P1 (git), P2 (cohort), P3 (LangSmith), or P4 (Cursor Loop 3).
4. **Optional single commit** before pause: index + CHANGELOG only (**S1**).

---

## 6. Resumption entry points

| Goal | Start here |
| --- | --- |
| Loop 2 after a session | [harness-trace-observation-loop.md](../../../tied-bundle/docs/harness-trace-observation-loop.md) → `@harness-trace-review` |
| Loop 3 pilot (real cohort) | [htol-pilot-cohort-runbook.md](../../../tied-bundle/docs/htol-pilot-cohort-runbook.md) |
| Policy / bounds | [harness-trace-learning-experiment-charter.md](../../../tied-bundle/docs/harness-trace-learning-experiment-charter.md) |
| LangChain phase map | [langchain comparison § Phased recommendations](../../../docs/comparisons/langchain-harness-engineering-vs-tied-agent-management.md#phased-recommendations-doc-first) |
| Cursor phase map | [cursor comparison § Phased recommendations](../../../docs/comparisons/cursor-harness-engineering-vs-tied-agent-management.md#phased-recommendations-doc-first) (local file if untracked) |
| Authority seam | [authority-boundary-operator-checklist.md](../REQ-TIED_HARNESS_PLATFORM_SEAM/authority-boundary-operator-checklist.md) |
| Program PLAN (runbook feature) | [PLAN-HTOL-PILOT-COHORT-RUNBOOK/PLAN.md](../PLAN-HTOL-PILOT-COHORT-RUNBOOK/PLAN.md) |

---

## 7. Sponsor involvement summary (all pending items)

| If you do… | Approx. sponsor time |
| --- | --- |
| **Nothing** (pause after agent wrap-up) | **0** |
| **P1 only** (index + optional Cursor doc commit) | **15–45 min** |
| **P1 + P2 minimal cohort** (3 captures, inconclusive outcome) | **~3–5 hours** over 2–8 weeks (mostly operator; sponsor at hypothesis + outcome) |
| **P1 + P2 + P3** | Add **15 min** for key policy |
| **P4 Cursor Phase 2 (doc-only experiment charter)** | **~2 hours** one session + optional P2-style cohort later |
| **Full arc including Cursor doc publish + real HTOL cohort + LangSmith smoke** | **~1 day** cumulative sponsor decisions spread over weeks |

---

## 8. Linked handoffs (per-REQ)

| REQ | Handoff |
| --- | --- |
| Platform seam | [plan-close-out-handoff.md](../REQ-TIED_HARNESS_PLATFORM_SEAM/evidence/plan-close-out-handoff.md) |
| HTOL Loop 2 | [session-handoff.md](../REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP/evidence/session-handoff.md) |
| HTOL Loop 3 charter | [close-out-handoff.md](../REQ-TIED_HARNESS_TRACE_LEARNING_PILOT/evidence/close-out-handoff.md) |
| Cohort runbook | [close-out-handoff.md](../REQ-TIED_HTOL_PILOT_COHORT_RUNBOOK/evidence/close-out-handoff.md) |
| LangChain Phase 3 | [close-out-handoff.md](../REQ-TIED_HARNESS_LANGCHAIN_PHASE3/evidence/close-out-handoff.md) |
| LangSmith compose | [close-out-handoff.md](../REQ-TIED_HARNESS_LANGSMITH_COMPOSE/evidence/close-out-handoff.md) |
| Runbook program | [session-handoff.md](../PLAN-HTOL-PILOT-COHORT-RUNBOOK/evidence/session-handoff.md) |

Some handoff bullets (e.g. “Phase 3 deferred”) may be **stale** relative to later commits—this document supersedes for arc-level status.

**Last updated:** 2026-10-21
