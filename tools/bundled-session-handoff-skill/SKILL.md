---
name: handoff
description: "End-of-session handoff for a new chat—record completions, next steps, completion signals, and a paste-ready resume prompt. Use when the sponsor invokes /handoff or @handoff (legacy phrasing: session handoff). Persists evidence/session-handoff.md. Not for close-out commits or automatic git."
disable-model-invocation: true
---

# handoff

**Audience:** sponsor or operator ending a Cursor chat and continuing the same work in a **new conversation**.

**When:** Context limits, session reset, or intentional chat split—but the **linked plan**, **Tracker**, or **program PLAN** must stay coherent.

Explicit invocation only (`/handoff`, `@handoff`, legacy natural phrasing **“session handoff”**, or “hand off this session to a new chat”).

## Procedure

1. **Strip prefix** — Remove `/handoff` when present; remainder may name `request_token`, plan paths, or “this thread only.”

2. **Scope** — Collect authoritative sources (read-only unless sponsor named write paths):
   - conversation summary (decisions, not replay);
   - sponsor-named or inferred **`tied-project/working/{REQ}/PLAN.md`**, linked program plans, **checklist Tracker** YAML;
   - **CITDP** and gate/evidence paths if verification-gated work was in flight;
   - git status **only if sponsor pasted** git context (no automatic `git`).

3. **Mark completions** — List what **finished this session** with evidence pointers (tests run, files touched, TIED tokens minted). Distinguish **implementation done** vs **close-out deferred** ([completion-signals-handoff.md](../bundled-prompt-type-skills/prompt-shared/completion-signals-handoff.md)).

4. **Completion signals** (when TIED REQ work applies) — Emit the three signals per store doc `tools/bundled-prompt-type-skills/prompt-shared/completion-signals-handoff.md` (machine close-out | process contract | adherence ledger). Never label “complete” from tests alone when verification-gated or integrated depth applies.

5. **Next steps** — Ordered for **minimum pause** in the new chat:
   - recommended **prompt type** (`/build-plan`, `/refine-plan`, `/close-out`, `/clear-workspace`, etc.);
   - exact **paths** to attach (`@PLAN.md`, Tracker, CITDP);
   - **blockers** (gates, costly choices → suggest `/unblock` if sponsor decisions pending);
   - **defaults:** proceed on documented reversible choices; surface costly choices only.

6. **Persist session log** — When the working folder or `request_token` is known, create or update **`tied-project/working/{REQ}/evidence/session-handoff.md`** (filename **`session-handoff.md`**, not `handoff.md`) with date, completions, completion signals, and next steps.

7. **Update plan artifacts (optional)** — If sponsor included a working **PLAN.md**, append or edit a **Session handoff** section (do not rewrite entire plan).

8. **Deliver resume prompt** — Output a single fenced block the sponsor can paste as the **first message** in the new chat (see template below).

## Resume prompt template

```markdown
Continue TIED work from a prior session (handoff).

**Request / program:** {REQ-TOKEN or plan name}
**Linked plan:** @{absolute or repo-relative PLAN path}
**Tracker (if any):** @{checklist-tracker.yaml path}

## Done last session
- {bullet with evidence}

## Do next (no pause if possible)
1. {step — e.g. `/build-plan @...` or run pre_implementation gate}
2. {step}

## Completion signals (last session)
- Machine close-out: {not_run | …}
- Process contract: {partial | …}
- Adherence ledger: {not_run | …}

## Constraints
- {non-goals, branch, do-not-commit, etc.}

Invoke `@handoff` only if you need another handoff later.
```

## Boundaries

| Surface | Role |
|---------|------|
| **`/close-out`** | Staged LEAP close-out, CHANGELOG, proposed commit message |
| **`/handoff`** | **Conversation continuity** only; updates **`session-handoff.md`**; no commit |
| **`/clear-workspace`** | Hygiene + close-out chain toward commit-ready workspace |
| **`/unblock`** | Sponsor costly-choice decisions blocking progress |
| **`/build-plan`** | Execute a refined linked plan in the **same** or **new** chat after handoff |

## Related

- **Completion signals:** `tools/bundled-prompt-type-skills/prompt-shared/completion-signals-handoff.md`
- **[REQ-TIED_SESSION_HANDOFF_SKILL]** · **[REQ-TIED_CLIENT_BOOTSTRAP_SKILLS]** — install via `BUNDLED_STANDALONE_CLIENT_SKILLS` + `tied-install.sh`

## Checklist alignment

Maps to **traceable-commit** / close-out prep only as **documentation**; does not replace gates or `tied_verify`.
