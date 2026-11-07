---
name: handoff
description: "End-of-session handoff for a new chat—record completions, next steps, completion signals, pending prior requests, environment, and a paste-ready resume prompt. Use when the sponsor invokes /handoff or @handoff (legacy phrasing: session handoff). Persists evidence/session-handoff.md. Not for close-out commits or automatic git."
disable-model-invocation: true
---

# handoff

**Audience:** sponsor or operator ending a Cursor chat and continuing the same work in a **new conversation**.

**When:** Context limits, session reset, or intentional chat split—but the **linked plan**, **Tracker**, or **program PLAN** must stay coherent.

Explicit invocation only (`/handoff`, `@handoff`, legacy natural phrasing **“session handoff”**, or “hand off this session to a new chat”).

**Normative log shape:** [session-handoff-structure.md](../bundled-prompt-type-skills/prompt-shared/session-handoff-structure.md) · template [session-handoff.v1.template.md](../../tied-bundle/templates/session-handoff.v1.template.md) · plan execution ledger [prompt-skill-disk-handoff.md](../bundled-prompt-type-skills/prompt-shared/prompt-skill-disk-handoff.md)

## Procedure

1. **Strip prefix** — Remove `/handoff` when present; remainder may name `request_token`, plan paths, or “this thread only.”

2. **Scope** — Collect authoritative sources (read-only unless sponsor named write paths):
   - conversation summary (decisions, not replay);
   - sponsor-named or inferred **`tied-project/working/{REQ}/PLAN.md`**, linked program plans, **checklist Tracker** YAML;
   - **CITDP** and gate/evidence paths if verification-gated work was in flight;
   - git status **only if sponsor pasted** git context (no automatic `git`).

3. **Merge prior handoffs** — When `working/{token}/` is known:
   - read existing **`evidence/session-handoff.md`**;
   - read **`evidence/*handoff*.md`** and sibling snapshots in that folder (newest first for snapshot facts);
   - merge **Related and pending prior requests** rows by stable **`id`** (see structure doc);
   - preserve history — append dated subsections; do not delete prior sections.

4. **Mark completions** — List what **finished this session** with evidence pointers (tests run, files touched, TIED tokens minted). Distinguish **implementation done** vs **close-out deferred** ([completion-signals-handoff.md](../bundled-prompt-type-skills/prompt-shared/completion-signals-handoff.md)).

5. **Completion signals** (when TIED REQ work applies) — Emit the three signals per [completion-signals-handoff.md](../bundled-prompt-type-skills/prompt-shared/completion-signals-handoff.md) (machine close-out | process contract | adherence ledger). Never label “complete” from tests alone when verification-gated or integrated depth applies.

6. **Next steps** — Ordered for **minimum pause** in the new chat:
   - recommended **prompt type** (`/build-plan`, `/refine-plan`, `/close-out`, `/clear-workspace`, etc.);
   - exact **paths** to attach (`@PLAN.md`, Tracker, CITDP);
   - **blockers** (gates, costly choices → suggest `/unblock` if sponsor decisions pending);
   - **defaults:** proceed on documented reversible choices; surface costly choices only.

7. **Advisory section check** — Before persist, compare draft against [session-handoff-structure.md](../bundled-prompt-type-skills/prompt-shared/session-handoff-structure.md). If a **required** section for this thread type is empty, **WARN** in chat and still write the log (do not block handoff).

8. **Persist session log** — When the working folder or `request_token` is known, create or update **`tied-project/working/{REQ}/evidence/session-handoff.md`** (filename **`session-handoff.md`**, not `handoff.md`) using the section order in the structure doc (header, plan spine, refs, **Plan execution steps** when plan skills ran, environment, dependencies, pending prior requests, finished, completion signals, do next, constraints). Plan leaves still own updates to **Plan execution steps** when `PLAN.md` changes ([prompt-skill-disk-handoff.md](../bundled-prompt-type-skills/prompt-shared/prompt-skill-disk-handoff.md)).

9. **Update plan artifacts (optional)** — If sponsor included a working **PLAN.md**, append or edit a **Session handoff** section (do not rewrite entire plan).

10. **Deliver resume prompt** — Output a single fenced block the sponsor can paste as the **first message** in the new chat (see template below).

## Resume prompt template

```markdown
Continue TIED work from a prior session (handoff).

**Request / program:** {REQ-TOKEN or plan name}
**Linked plan:** @{absolute or repo-relative PLAN path}
**Tracker (if any):** @{checklist-tracker.yaml path}

## Plan spine
- Phase: {wave / slice}
- {optional program links}

## Environment
- workspace_root: {paste or n/a}
- TIED_BASE_PATH: {paste or n/a}
- execution_site: {store | client repo}
- git: {branch/SHA if sponsor pasted — no auto-git}

## Requirements and dependencies
- Primary: {REQ tokens}
- depth_tier / gate_policy: {if TIED-tracked}
- depends_on / blocks: {short list}

## Pending prior requests
| id | kind | status | blocks_current | evidence_link |
| --- | --- | --- | --- | --- |
| {row} | REQ | pending | no | {path} |

## Done last session
- {bullet with evidence}

## Do next (no pause if possible)
1. {step — e.g. `/build-plan @...` or run pre_implementation gate}
2. {step — attach @PLAN.md, Tracker}

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
| **`/workflow-visualization`** | Optional sponsor-facing `docs/<project>-workflows.md` after EDPC comprehension |
| **DAE `handoffs/{phase}.yaml`** | Criterion evidence only — **not** a substitute for **`session-handoff.md`** |

## Related

- **Structure:** `tools/bundled-prompt-type-skills/prompt-shared/session-handoff-structure.md`
- **Completion signals:** `tools/bundled-prompt-type-skills/prompt-shared/completion-signals-handoff.md`
- **Pre-handoff checks:** `tied-bundle/docs/pre-handoff-verification-charter.md`
- **TIQ queue (optional):** `tied-bundle/docs/tied-improvement-pending-work-queue.md`
- **[REQ-TIED_SESSION_HANDOFF_SKILL]** · **[REQ-TIED_CLIENT_BOOTSTRAP_SKILLS]** — install via `BUNDLED_STANDALONE_CLIENT_SKILLS` + `tied-install.sh`

## Checklist alignment

Maps to **traceable-commit** / close-out prep only as **documentation**; does not replace gates or `tied_verify`.
