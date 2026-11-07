# PLAN — REQ-TIED_PROMPT_SKILL_DISK_HANDOFF

**Status:** build-plan complete · **Handoff:** `@close-out` (optional)

**Profile:** `depth_tier: minimal` · `gate_policy: advisory`

**Sponsor intent (locked):** **`evidence/session-handoff.md`** § **Plan execution steps** is the **primary** durable record for **required**, **optional**, and **recommendation** steps created or changed during plan skills—not chat or `.cursor/plans` alone. **`PLAN.md`** stays canonical for phased implementation work.

**Related TODO:** [`TODO.md`](../../../TODO.md) L1155 (skill handoff must persist to disk).

---

## Build summary (2026-11-07)

Phases **A–E** delivered: RED e2e contracts, `prompt-skill-disk-handoff.md`, structure doc + template, plan/build/close skills, six agent parent-handoff bullets, handoff skill cross-link, REQ/ARCH/IMPL tokens, citdp persist.

**Tests (green):**

```bash
npm test --prefix mcp-server -- src/e2e/prompt-type-subagent.test.ts src/e2e/prompt-type-skills.test.ts
node --test tools/bootstrap/lib/session-handoff-structure-doc.test.mjs
```

**Close-out:** deferred — verification gate and traceable commit not run this session.

---

## Refine summary (2026-11-07)

- **Section placement:** Insert **Plan execution steps** in [`session-handoff-structure.md`](../../../tools/bundled-prompt-type-skills/prompt-shared/session-handoff-structure.md) **after Authoritative refs** (new row in section-order table); bootstrap handoff may omit full section order but **must** include header + Plan execution steps when no rolling log exists.
- **Stable slugs:** Required rows use kebab-case slugs (`phase-a-red-contracts`, `phase-b-shared-docs`, …); same slug in handoff and build close-out checkboxes.
- **Stop rule:** Extend [`prompt-execution-mode.md`](../../../tools/bundled-prompt-type-skills/prompt-shared/prompt-execution-mode.md) **Plan mode → Stop rule** to link [`prompt-skill-disk-handoff.md`](../../../tools/bundled-prompt-type-skills/prompt-shared/prompt-skill-disk-handoff.md) (new) and forbid stop when PLAN phases changed without handoff update.
- **TDD order:** Phase A RED asserts **before** any bundled doc/skill edit (per `[PROC-TIED_DEV_CYCLE]`).
- **Agent surface:** **18** leaf `.cursor/agents/{prompt-type}.md` wrappers (`add-refine-build` is composite, out of scope); plan leaves + `build-plan` / `close-out` parent-handoff paragraphs name disk paths.
- **Pre-implementation gate:** Pass `tied_checklist_gate_validate` with the **unwrapped** inner CITDP body (not the `CITDP-REQ-*.yaml` top-level key). Advisory gate; blocking RED in plan mode remains expected until `@build-plan`.

---

## Problem

1. **Chat-only handoffs** — Plan-mode skills end with conversation text or [`.cursor/plans/`](../../../.cursor/plans) while [`tied-project/working/{REQ}/PLAN.md`](../../../tied-project/working) is missing or stale.
2. **Step drift** — Required vs optional vs recommendation lines appear in PLAN or chat but are not carried in one **durable execution ledger** across `@add-feature` → `@refine-plan` → `@build-plan`.
3. **Partial wiring** — [`@handoff`](../../../tools/bundled-session-handoff-skill/SKILL.md) persists [`evidence/session-handoff.md`](../../../tools/bundled-prompt-type-skills/prompt-shared/session-handoff-structure.md) but leaf prompt-type skills do not **update** **Plan execution steps** when plans change; structure doc has **Do next** but no normative step taxonomy yet.

---

## Locked decisions

| Topic | Decision |
|-------|----------|
| **Primary ledger for plan steps** | `tied-project/working/{REQ}/evidence/session-handoff.md` — § **Plan execution steps** is authoritative for required / optional / recommendations created or changed during plan work |
| **Canonical PLAN** | `tied-project/working/{REQ}/PLAN.md` — implementation phases live here; handoff **mirrors** step changes with stable slugs + changelog (chat lists paths only) |
| **Bootstrap safety** | Handoff path **must** use the same `{REQ}` folder as `PLAN.md`; minimal bootstrap = header fields + Plan execution steps only |
| **Full session log** | **`@handoff`** still owns first-class create/merge of full section order (environment, completion signals, pending prior requests, resume block) |
| **Plan skills must touch handoff** | **`add-feature`**, **`refine-plan`**, **`non-tied-plan`**, **`non-tied-refine`**: before stop, create/update **Plan execution steps** when PLAN step lists change |
| **Agent skills during build** | **`build-plan`**, **`close-out`**: when `session-handoff.md` exists, mark required steps done/deferred and append **Changelog** rows |
| **Chat** | Lists disk paths only; step detail lives in handoff |

### Plan execution steps (normative subsection)

Build-plan adds to [`session-handoff-structure.md`](../../../tools/bundled-prompt-type-skills/prompt-shared/session-handoff-structure.md) and [`session-handoff.v1.template.md`](../../../tied-bundle/templates/session-handoff.v1.template.md):

```markdown
## Plan execution steps

**Last updated:** {ISO date} · **prompt_type:** {add-feature|refine-plan|…} · **PLAN:** ../PLAN.md

### Required
- [ ] {stable-slug} — {one line; link evidence if any}

### Optional
- [ ] {stable-slug} — {one line}

### Recommendations
- {non-blocking advice; costly choices flagged}

### Changelog (this REQ)
- {date prompt_type}: {what changed in required/optional/recommendations}
```

**Rules:**

- Editing **`PLAN.md`** phases/todos that imply new required or optional work **must** update this subsection in the same turn.
- Recommendations discovered during refine go under **Recommendations**, not only in chat.
- **Changelog** append-only; do not delete prior rows.
- When the same slug appears in PLAN phase table and handoff, **handoff** holds disposition (`[ ]` / `[x]`); PLAN holds narrative.

---

## Tokens (implemented)

| Layer | Token |
|-------|-------|
| REQ | `[REQ-TIED_PROMPT_SKILL_DISK_HANDOFF]` |
| ARCH | `[ARCH-TIED_PROMPT_SKILL_DISK_HANDOFF]` |
| IMPL | `[IMPL-TIED_PROMPT_SKILL_DISK_HANDOFF]` |

---

## Implementation phases (@build-plan)

### Phase A — RED contract tests ✓

### Phase B — Shared docs + template ✓

### Phase C — Leaf skills ✓

### Phase D — Task subagent wrappers ✓

### Phase E — TIED stack + validation ✓

---

## Non-goals

- Replacing `PLAN.md` with handoff-only planning.
- MCP validator for handoff completeness (Wave 2).
- Merging DAE `handoffs/{phase}.yaml` into session log.

---

## Artifacts

- [`CITDP-REQ-TIED_PROMPT_SKILL_DISK_HANDOFF.yaml`](CITDP-REQ-TIED_PROMPT_SKILL_DISK_HANDOFF.yaml)
- [`test-strategy.md`](test-strategy.md)
- [`checklist-tracker.yaml`](checklist-tracker.yaml)
- [`evidence/session-handoff.md`](evidence/session-handoff.md)
