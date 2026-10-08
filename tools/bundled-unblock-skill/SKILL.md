---
name: unblock
description: Sponsor session to resolve known or planned decisions that block plan progress—ordered for maximum path cleared toward completion, plain options, completion-biased defaults, recorded answers. Use when the sponsor invokes /unblock or @unblock, or names a blocked costly choice from a plan/CITDP in this thread. Not for Touchpoint 1 naming (/xlate) or agent-initiated clarification fishing.
disable-model-invocation: true
---

# unblock

**Audience:** sponsor (human intent owner), not the agent opening new scope.

**When:** A **known or planned** question is already flagged (plan *Sponsor decisions*, CITDP hinge/costly choice, checklist note, or prior turn) and **progress is backing up** until it is answered.

Explicit invocation only (`/unblock` prefix, `@unblock`, or an clear “unblock this plan” request with named paths).

## Procedure

1. **Strip prefix** — Remove a leading `/unblock` (and surrounding whitespace); treat the remainder as sponsor context (which plan, which decision, optional answer hints).

2. **Collect blockers** — Gather **already-flagged** open decisions only, from:
   - this conversation;
   - sponsor-named paths (`PLAN.md`, CITDP YAML, checklist tracker, `docs/*plan*.md`);
   - optional read-only MCP `tied_sponsor_questions` when on-disk artifacts exist (`project_root`, `citdp`, `request_token`).

   Do **not** invent new costly choices. For **reversible choices**, state the documented default and treat sponsor silence in `/unblock` as consent to proceed unless they override ([REQ-TIED_SPONSOR_AGENT_RELATIONSHIP] — avoid **over-asking**).

3. **Order for path clearance** — Sort remaining **costly** items so answering **unlocks the most downstream work** first:
   - scope / non-goals before implementation details;
   - decisions that gate multiple REQs or checklist phases before local prefs;
   - merge questions when one sponsor answer resolves several blockers (say what each answer unlocks).

4. **Present** — For each batch (prefer one turn per batch):
   - **What is blocked** — one plain sentence, no token soup;
   - **Options** — 2–4 choices, minimal jargon; TIED terms only in parentheses when needed for the audit trail;
   - **Tradeoffs** — one line per option;
   - **Recommended default** — biased toward **finishing the scoped plan** with little useful work left deferred indefinitely, within the **delegated work envelope**;
   - **If you do nothing** — what the agent will do on the recommended default (reversible) or why work must stop (costly).

5. **Record** — After sponsor answers, write outcomes to the authoritative place for that plan (e.g. *Sponsor decisions (recorded)*, `evidence/sponsor-decisions-evidence.md`, CITDP fields). Include: choice, date, what downstream steps are now unblocked.

6. **Hand off** — List unlocked next steps (checklist slug or subagent) and confirm whether any **costly** blockers remain in scope.

## Boundaries

| Surface | Role |
|---------|------|
| **`/xlate`** | Touchpoint 1 — RESOLVE **names**, RESOLVE charter; minimum clarification before TIED/code. |
| **`tied_sponsor_questions`** | Read-only **extract** of costly-choice candidates from artifacts; no conversational loop. |
| **`/unblock`** | Sponsor-driven **decision session** — prioritize, explain, default, **record**, maximize path to completion. |

## Related MCP

- `tied_sponsor_questions` — seed the blocker list from CITDP/LEAP when files exist.
- `tied_project_lint` — optional sanity check before recording decisions that touch TIED YAML paths.

## Checklist alignment

Supports **risk-assessment** / plan refine steps where costly choices are already listed; does not replace **translate-sponsor-intent** ([PROC-VOCABULARY_INDEX] Touchpoint 1).
