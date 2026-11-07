# Disk handoff for prompt-type skills

[REQ-TIED_PROMPT_SKILL_DISK_HANDOFF] [ARCH-TIED_PROMPT_SKILL_DISK_HANDOFF] [IMPL-TIED_PROMPT_SKILL_DISK_HANDOFF]

Normative gate: **plan execution steps** live on disk before a plan or build leaf stops. Chat lists paths only.

**Traceability:** [REQ-PROMPT_TYPE_SKILL_EXECUTION_MODE](prompt-execution-mode.md) · [REQ-TIED_SESSION_HANDOFF_SKILL](../../../tied-project/requirements/REQ-TIED_SESSION_HANDOFF_SKILL.yaml) · [session-handoff-structure.md](session-handoff-structure.md) · [plan-build-sequence-guard.md](plan-build-sequence-guard.md)

---

## Paths

| Lane | Rolling log | Canonical plan |
| --- | --- | --- |
| TIED REQ | `tied-project/working/{REQ-TOKEN}/evidence/session-handoff.md` | `tied-project/working/{REQ-TOKEN}/PLAN.md` |
| Non-TIED | `tied-project/non-tied-plans/{slug}/evidence/session-handoff.md` | `tied-project/non-tied-plans/{slug}/PLAN.md` |

The `{REQ-TOKEN}` or `{slug}` **must** match the folder that contains the linked `PLAN.md`. Do not write handoff under a different token.

---

## Plan execution steps (subsection)

When required, optional, or recommendation **steps** are created or changed during a plan skill, update § **Plan execution steps** in `session-handoff.md` in the **same turn** as `PLAN.md` edits. Shape: [session-handoff-structure.md](session-handoff-structure.md).

- **Required** — blocking work with stable kebab-case slugs
- **Optional** — non-blocking follow-ons
- **Recommendations** — advice and costly choices (not chat-only)
- **Changelog (this REQ)** — append-only rows: `{date} {prompt_type}: {summary}`

---

## Who updates when

| Skill | Action before stop |
| --- | --- |
| `add-feature`, `refine-plan`, `non-tied-plan`, `non-tied-refine` | Create or update Plan execution steps when PLAN step lists change; bootstrap minimal header + subsection if file absent |
| `build-plan`, `close-out` | Mark step checkboxes done/deferred; append changelog |
| `@handoff` | Full section order, merge snapshots, resume prompt — does **not** replace plan-leaf obligation to update Plan execution steps |

---

## Bootstrap vs full handoff

- **Bootstrap (plan leaf):** Header fields (`handoff_kind`, `request_token`, `prompt_type`, date) + Plan execution steps only — not a substitute for full `@handoff`.
- **Full (`@handoff`):** Complete rolling log per structure doc section order.

---

## Stop rule (plan mode)

Do not stop when:

1. Linked `PLAN.md` phases or todos changed and Plan execution steps were not updated, or
2. Chat is the only record of new required/optional/recommendation lines.

Parent handoff and chat output: **paths only** (`PLAN.md`, `evidence/session-handoff.md`, Tracker, CITDP).
