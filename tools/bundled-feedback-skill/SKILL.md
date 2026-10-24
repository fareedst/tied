---
name: feedback
description: Sponsor-witnessed agent error or friction report to TIED as an operational observation (Kaizen Phase 1). Captures to client feedback.yaml via tied_feedback_capture_observation and returns a local receipt. Use when the sponsor invokes /feedback or @feedback with a witness report. Not Touchpoint 1 naming (/xlate), costly-choice sessions (/unblock), or LEAP promotion unless explicitly requested.
disable-model-invocation: true
---

# feedback

**Audience:** sponsor as **witness** (human intent owner); the agent is intake instrument only ([REQ-TIED_SPONSOR_AGENT_RELATIONSHIP]).

**When:** The sponsor witnessed an agent or client error, failure response, or operational friction and wants it recorded for TIED self-improvement processes—not translated into canonical REQ/ARCH/IMPL in this turn.

Explicit invocation only (`/feedback`, `@feedback`, or an unambiguous “record this witness feedback” request in this thread).

## Sponsor witness contract (verbatim)

When the sponsor supplies this contract text, preserve it in the capture body (verbatim or clearly marked redaction):

> i am the sponsor and i witnessed this call from a TIED client that received an error response. treat this report as feedback to the TIED system that must be treated as a trigger for self-improvement by quality-maturity measures. existing TIED processes will ingest this reported event and continue on their initiative.

This wording triggers existing Kaizen and quality-maturity **processes**; it is **not** authorization to implement changes, auto-promote LEAP, or skip review gates.

## Procedure

1. **Strip prefix** — Remove a leading `/feedback` or `@feedback` (and surrounding whitespace); treat the remainder as sponsor context.

2. **Witness role** — Sponsor = witness; agent = intake instrument only. Do not infer missing error text, client identity, or destination.

3. **Intake gate (required before any MCP write)** — Collect at minimum:
   - what was attempted;
   - verbatim or redacted error / failure response;
   - which TIED **client** (repo or project) witnessed;
   - sponsor confirmation of **capture destination** (`tied-project/` tree);
   - sponsor recounting of what they saw.

   If the invocation contains **no incident details** (contract-only or empty), ask the interactive sponsor for the minimum report. Do **not** call MCP capture until the gate passes.

4. **Optional fields** — workaround used, session or trace id, evidence file paths, `occurred_at`, redaction notes.

5. **Classify** — **Feedback entry type:** `bug_report` | `methodology_improvement` | `feature_request`. Set **observation kind** per [REQ-FEEDBACK_TO_TIED]. Use **`user_report`** only for the operational adapter path.

6. **Witness report sections** — Structure narrative as: **Observation**, **Failure**, **Sponsor intent**, **Workaround**, **Redaction** (see operator baseline patterns under Kaizen capture).

7. **Destination** — Call `tied_config_get_base_path`. Present resolved path to the sponsor; require explicit confirm before write. Optional `base_path` override **only** after sponsor confirms (wrong destination is a **costly choice**).

8. **Capture** — Prefer `tied_feedback_capture_observation` with `privacy_tier: operator_local`, a stable `idempotency_key`, and concrete `evidence_refs`. Fallback order: `tied_feedback_operational_add`, then `tied_feedback_add`, then manual workflow in [using-tied-without-mcp.md](../../tied-bundle/docs/using-tied-without-mcp.md) when MCP is unavailable.

9. **Receipt** — Return the capture **receipt** from the tool. State clearly: receipt ≠ notification ≠ countermeasure ≠ canonical YAML change ≠ LEAP promotion authorization.

10. **On request** — `tied_feedback_export` for sponsor review. Do **not** call `tied_feedback_promote` unless the sponsor explicitly asks for **reviewed** promotion.

## Boundaries

| Surface | Role |
| --- | --- |
| **`/feedback`** | Sponsor witness intake → local `feedback.yaml` capture + receipt |
| **`/xlate`** | Touchpoint 1 RESOLVE names (unchanged skill) |
| **`/unblock`** | Costly-choice decision sessions (unchanged skill) |
| **`tied_feedback_*` MCP** | Persistence and downstream Kaizen tools; skill does not replace them |

## Related MCP

- `tied_config_get_base_path` — confirm destination before write.
- `tied_feedback_capture_observation` — primary Kaizen Phase 1 capture.
- `tied_feedback_operational_add` / `tied_feedback_add` — fallbacks.
- `tied_feedback_export` — sponsor-requested export.
- `tied_feedback_promote` — only on explicit sponsor request after review path.

## Checklist alignment

Supports operational observation capture aligned with [REQ-FEEDBACK_TO_TIED] and Kaizen Phase 1 vocabulary—not **translate-sponsor-intent** unless the sponsor separately invokes `/xlate`.
