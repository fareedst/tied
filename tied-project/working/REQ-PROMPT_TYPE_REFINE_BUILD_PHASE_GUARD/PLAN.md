# PLAN — [REQ-PROMPT_TYPE_REFINE_BUILD_PHASE_GUARD]

**Trial context:** TIED methodology store (`/Users/fareed/Documents/dev/chatgpt/stdd`).

**Phase:** build-plan complete (methodology shipped; close-out deferred).

**Request token:** `REQ-PROMPT_TYPE_REFINE_BUILD_PHASE_GUARD`  
**Workflow:** `add-feature` (deferred → refined here) → `refine-plan` → `@build-plan` → `@close-out`

**Trigger:** Sponsor feedback **`fb-mw68y52s-ixqm8x`** on disposable client `1794045120` (`REQ-SEMVER_COMPARATOR`) — refine/build skill boundary collapse in Cursor IDE. Store cites client feedback only (no ingest).

---

## Problem statement (locked)

| Observation | Impact |
| --- | --- |
| **build-plan** implemented product code before sponsor **refine-plan** that should precede implementation | Violates plan-vs-agent execution mode |
| Post-build **refine-plan** omitted `@build-plan` (correct) but sponsor re-invoked **build-plan** and received silent **idempotent pass** | Sponsor cannot trust phase or “Do next” |
| Disk **Plan execution steps** showed build-plan completion without sponsor `@build-plan` between refine and implement | [REQ-TIED_PROMPT_SKILL_DISK_HANDOFF] insufficient for **phase + attribution** |

**Field evidence:** `/Users/fareed/Documents/dev/test/1794045120/tied-project/feedback.yaml` (`fb-mw68y52s-ixqm8x`); client handoff `tied-project/working/REQ-SEMVER_COMPARATOR/evidence/session-handoff.md`.

**Facilitator cross-ref (out of scope):** incomplete `workflow_trial_agentstream` cells ([REQ-WF_TRIAL_FOUR_PHASE_SHELL_EXIT](../REQ-WF_TRIAL_FOUR_PHASE_SHELL_EXIT/PLAN.md)) — harness/shell failures, not this REQ.

---

## Scope

| In | Out |
| --- | --- |
| New [`plan-build-sequence-guard.md`](../../../tools/bundled-prompt-type-skills/prompt-shared/plan-build-sequence-guard.md) | Agentstream orchestrator / WritableIterable |
| Updates to `session-handoff-structure.md`, `refine-plan`/`build-plan`/`add-feature` SKILLS | Blocking MCP gate on phase mismatch |
| [`prompt-type-skills.test.ts`](../../../mcp-server/src/e2e/prompt-type-skills.test.ts) contract assertions | `add-refine-build` Task auto-sequencing changes |
| Bootstrap handoff lint test under `tools/bootstrap/` | Store `feedback.yaml` ingest of `fb-mw68y52s-ixqm8x` |
| `evidence/field-case-fb-mw68y52s.md` acceptance narrative | Product `src/` in disposable clients |

---

## Locked decisions (refine-plan)

| ID | Decision | Rationale |
| --- | --- | --- |
| **D1** | Normative **`plan_phase`** in Plan spine: `pre-implementation` \| `post-build` \| `close-out-ready` | Single machine- and human-readable phase key (replaces informal “Phase:” prose only) |
| **D2** | When `plan_phase: pre-implementation`, **Do next** MUST include **`@build-plan`** as the primary required next skill; MUST NOT list only `@close-out` | Mirrors sponsor agency boundary for implementation |
| **D3** | When `plan_phase: post-build` or `close-out-ready`, refine-plan **Do next** is optional `@close-out`; MUST NOT recommend `@build-plan` unless scope reopened | Matches post-build refine semantics from field case |
| **D4** | **build-plan preflight** (before `tied-implement.md`): READ `evidence/session-handoff.md` Plan spine + Plan execution steps; if `pre-implementation` and any required slug is `[x]` without a changelog row whose `prompt_type` is `build-plan` or `close-out`, **STOP** with `DIAGNOSTIC: PLAN_BUILD_SEQUENCE_VIOLATION` | Prevents silent implement when disk says pre-build |
| **D5** | **Idempotent re-entry:** if product tree or test fixtures exist under REQ scope but handoff still `pre-implementation`, build-plan MUST NOT claim “already implemented / idempotent pass”; surface violation + optional `tied_feedback_capture_observation` guidance | Addresses sponsor turn 3 in fb-mw68y52s |
| **D6** | Sponsor note in guard doc: same chat thread must not run implementation without explicit **`@build-plan`** unless sponsor requests combined execution | Operator education; not enforceable in Cursor product |
| **D7** | **Changelog attribution:** only `build-plan` and `close-out` leaves may flip required step checkboxes to `[x]`; plan leaves append changelog rows only | Fixes “build before refine” attribution gap |
| **D8** | **Rejected:** mandatory `tied_checklist_gate_validate` block on phase mismatch at minimal depth | Costly hinge; advisory gates only in v1 |

**Build-plan tokens (mint in build-plan):** `ARCH-PROMPT_TYPE_REFINE_BUILD_PHASE_GUARD`, `IMPL-PROMPT_TYPE_REFINE_BUILD_PHASE_GUARD`.

---

## Proposed implementation (build-plan executes)

| Step | Slug | Change |
| --- | --- | --- |
| 1 | `author-plan-build-guard-doc` | Add `prompt-shared/plan-build-sequence-guard.md`; link from `prompt-skill-disk-handoff.md` |
| 2 | `session-handoff-structure-phase` | Document `plan_phase` + Do next matrix in `session-handoff-structure.md` |
| 3 | `skill-contract-refs` | Patch bundled `add-feature`, `refine-plan`, `build-plan` SKILL.md (+ stub copies via install path) |
| 4 | `red-skill-contract-tests` | Extend `prompt-type-skills.test.ts` (T-SKILL-CONTRACT-01) |
| 5 | `red-handoff-lint-test` | New `tools/bootstrap/lib/plan-build-sequence-handoff.test.mjs` (T-HANDOFF-LINT-01) |
| 6 | `field-case-doc` | `evidence/field-case-fb-mw68y52s.md` (T-VIOLATION-01 narrative) |
| 7 | `green-and-validate` | `npm run test` subset + `tied_validate_consistency` |

---

## Acceptance criteria mapping

| REQ criterion | Verification |
| --- | --- |
| Guard doc | File exists; linked from skills |
| Skill refs | e2e contract test |
| plan_phase in structure doc | `session-handoff-structure-doc.test.mjs` if sections change |
| Handoff lint | T-HANDOFF-LINT-01 |
| Field case | T-VIOLATION-01 doc + CITDP `current_behavior` quote |

---

## Risk

**depth_tier:** minimal · **gate_policy:** advisory

Counterexample: agents ignore new preflight prose; mitigation = static contracts + bootstrap lint on fixtures.

---

## Do next

**`@build-plan`** for `REQ-PROMPT_TYPE_REFINE_BUILD_PHASE_GUARD` (linked [`PLAN.md`](PLAN.md)).
