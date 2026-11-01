# [REQ-TIED_SESSION_HANDOFF_SKILL] Handoff skill — linked plan

**Wave 1:** Refined 2026-10-18 · bootstrap + minimal procedure (program [PLAN-HANDOFF-CLEAR-WORKSPACE-SKILLS](../PLAN-HANDOFF-CLEAR-WORKSPACE-SKILLS/PLAN.md)).  
**Wave 2:** Refined 2026-11-01 · **structured session handoff** (this document). Evidence: [evidence/refine-plan-handoff-structure-20261101.md](evidence/refine-plan-handoff-structure-20261101.md).

**Canonical skill body:** [`tools/bundled-session-handoff-skill/SKILL.md`](../../../tools/bundled-session-handoff-skill/SKILL.md)

**Sponsor invoke name:** **`handoff`** (`/handoff`, `@handoff`).

**Evidence log (filename):** **`tied-project/working/{REQ}/evidence/session-handoff.md`** — do **not** use `handoff.md`.

**Legacy phrasing:** “session handoff” accepted in chat; install name remains **`handoff`**.

---

## Wave 2 — Intent

Operators need a **predictable, repeatable** handoff shape so a new chat preserves:

- the **high-level plan** (phase, waves, linked PLAN paths);
- **dependencies and environment** (REQ tokens, `TIED_BASE_PATH`, execution site);
- **pending prior requests** known to the current effort (carry-forward, not one-off bullets).

Wave 2 codifies that shape in **prompt-shared** + **templates**, wires **`@handoff`** procedure + resume prompt, and LEAPs TIED tokens to match.

---

## Proof boundaries

| In scope | Out of scope |
| --- | --- |
| Normative **`session-handoff-structure.md`** + **`session-handoff.v1.template.md`** | Renaming existing `*handoff*.md` across working trees |
| SKILL procedure: merge prior handoffs, advisory section check | Automatic `git` / MCP TIQ queue reads |
| Bootstrap doc test for template + SKILL cross-links | New MCP handoff validator |
| Optional **`session-handoff-context.v1.example.yaml`** (copy-paste) | Extending DAE **`handoffs/{phase}.yaml`** schema v1 (separate REQ) |
| LEAP REQ/ARCH/IMPL + pseudocode blocks for merge/persist | Replacing **`/close-out`** or **`/clear-workspace`** |

**Compose (do not duplicate authority):**

- [completion-signals-handoff.md](../../../tools/bundled-prompt-type-skills/prompt-shared/completion-signals-handoff.md)
- [pre-handoff-verification-charter.md](../../../tied-bundle/docs/pre-handoff-verification-charter.md)
- [client-pr-handoff-fields.v1.example.yaml](../../../tied-bundle/templates/client-pr-handoff-fields.v1.example.yaml) (PR fields — parallel pattern)
- DAE: `tied handoff validate` → `working/{REQ}/handoffs/{phase}.yaml` only ([client-development-index.md](../../../tied-bundle/docs/client-development-index.md))

**Gold exemplar (markdown):** [REQ-TIED_BOUNDED_COMPOSITION session-handoff.md](../REQ-TIED_BOUNDED_COMPOSITION/evidence/session-handoff.md)

---

## Normative section order (`session-handoff.md`)

| # | Section | Required (TIED REQ) | Required (non-TIED) |
| --- | --- | --- | --- |
| 1 | Header (`handoff_kind`, date, `request_token`, `prompt_type`) | yes | yes |
| 2 | Plan spine | yes | yes |
| 3 | Authoritative refs (Tracker, CITDP, gates/envelope paths) | yes | if present |
| 4 | Environment | yes | recommended |
| 5 | Requirements and dependencies | yes | if named |
| 6 | **Related and pending prior requests** (carry-forward table) | yes | recommended |
| 7 | Finished this session | yes | yes |
| 8 | Completion signals | yes | if claiming close-out readiness |
| 9 | Do next | yes | yes |
| 10 | Constraints | yes | yes |
| 11 | Repeatable verification | optional | optional |

**Pending prior requests table columns:** `id`, `kind` (`REQ` \| `PLAN` \| `sponsor_ask` \| `TIQ`), `status`, `owner`, `evidence_link`, `blocks_current` (`yes` \| `no`).

**Merge rule (@handoff):** Read prior `evidence/session-handoff.md` + newest `*handoff*.md` in the same `working/{token}/`; merge rows by `id`; append dated subsections for phase snapshots (do not delete history).

**Handoff kinds:** `@handoff` owns rolling **`session-handoff.md`**. Snapshots (`plan-close-out-handoff.md`, `*-build-plan-handoff.md`, refine handoffs) feed the merge step only.

---

## Governing decisions

| Decision | Value | Ladder |
| --- | --- | --- |
| **depth_tier** | minimal | Costly to raise → integrated inquiry |
| **gate_policy** | advisory | |
| **Section validation in SKILL** | **advisory** (WARN, still write) | Reversible — sponsor may request strict later |

---

## Satisfaction criteria (Wave 2)

| id | Criterion |
| --- | --- |
| `SC-STRUCTURE-DOC` | `session-handoff-structure.md` defines sections, merge rules, DAE boundary |
| `SC-TEMPLATE-SHIPS` | `tied-bundle/templates/session-handoff.v1.template.md` + optional context example YAML |
| `SC-SKILL-PROCEDURE` | SKILL.md: merge step, advisory validate, expanded resume template with Environment + Pending prior requests |
| `SC-BOOTSTRAP-TEST` | `session-handoff-structure-doc.test.mjs` green |
| `SC-PRE-HANDOFF-LINK` | Pre-handoff charter links session template / structure doc |
| `SC-TIED-LEAP` | REQ Implemented; ARCH/IMPL Active; pseudocode updated; `tied_validate_consistency` ok |

(Wave 1 criteria `skill-body`, `manifest`, `install`, `test` remain satisfied.)

---

## Declared change surface

| Path | Role |
| --- | --- |
| `tools/bundled-prompt-type-skills/prompt-shared/session-handoff-structure.md` | Normative section contract |
| `tied-bundle/templates/session-handoff.v1.template.md` | Copy-paste body |
| `tied-bundle/templates/session-handoff-context.v1.example.yaml` | Optional typed context |
| `tools/bundled-session-handoff-skill/SKILL.md` | Procedure + resume template |
| `tied-bundle/docs/pre-handoff-verification-charter.md` | Cross-link |
| `tied-bundle/docs/client-development-index.md` | Quick read row (session structure) |
| `tools/bootstrap/lib/session-handoff-structure-doc.test.mjs` | Regression |
| `tied-project/requirements/REQ-TIED_SESSION_HANDOFF_SKILL.yaml` | SC-* + status |
| `tied-project/architecture-decisions/ARCH-TIED_SESSION_HANDOFF_SKILL_BOUNDARY.yaml` | status Active |
| `tied-project/implementation-decisions/IMPL-TIED_SESSION_HANDOFF_SKILL.yaml` | summary |
| `tied-project/implementation-decisions/IMPL-TIED_SESSION_HANDOFF_SKILL-pseudocode.md` | HANDOFF_MERGE_PRIOR, HANDOFF_PERSIST_STRUCTURE blocks |
| `tied-project/working/REQ-TIED_SESSION_HANDOFF_SKILL/CITDP-REQ-TIED_SESSION_HANDOFF_SKILL.yaml` | Wave 2 change_definition |
| `tied-project/citdp/CITDP-REQ-TIED_SESSION_HANDOFF_SKILL.yaml` | Persist on close-out |

**Non-goals:** edits to xlate/unblock/clear-workspace sources except Related cross-link if needed.

---

## Test strategy (Wave 2)

See [test-strategy.md](./test-strategy.md).

**Gate before code:** `pre_implementation` allowed on updated Tracker + CITDP after refine (minimal / advisory).

---

## Implement (when plan approved — `@build-plan`)

1. Add structure doc + templates (markdown-first).
2. Update SKILL.md procedure and resume template.
3. Pre-handoff charter + client-development-index links.
4. RED: `session-handoff-structure-doc.test.mjs` → GREEN.
5. LEAP pseudocode → IMPL detail → REQ satisfaction criteria + statuses.
6. Update working CITDP `desired_behavior` / evidence commands; persist to `tied-project/citdp/` at close-out.
7. Run: `node --test tools/bootstrap/lib/client-skills-catalog.test.mjs`, new structure test, optional `client-bootstrap-skills` e2e if SKILL copy asserted.
8. `lint_yaml` on changed project YAML; **`tied_validate_consistency`**.

**Close-out:** Wave 2 may reuse pending tracker slugs (`traceable-commit`, etc.) from Wave 1 program or close in a dedicated pass — sponsor choice at `@close-out`.

---

## CITDP · Tracker · Tests

- **CITDP:** [CITDP-REQ-TIED_SESSION_HANDOFF_SKILL.yaml](./CITDP-REQ-TIED_SESSION_HANDOFF_SKILL.yaml)
- **Tracker:** [checklist-tracker.yaml](./checklist-tracker.yaml)
- **Tests:** [test-strategy.md](./test-strategy.md)
