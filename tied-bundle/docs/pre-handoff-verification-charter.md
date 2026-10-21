# Pre-handoff verification charter

**Audience:** Operators and agents before **PR**, **commit**, or **session handoff** (Loop 1 — product quality).

**Traceability:** [REQ-TIED_PRE_HANDOFF_VERIFICATION_CHARTER](../../tied-project/requirements/REQ-TIED_PRE_HANDOFF_VERIFICATION_CHARTER.yaml) · Claude comparison [Phase 1](../../docs/comparisons/claude-code-team-code-review-vs-tied.md#7-phased-approach-to-improving-tied-recommendations-only)

---

## Proof boundary

| In scope | Out of scope |
| --- | --- |
| Documented **executable checks** and **evidence** to attach before handoff | New MCP gate authority or merge automation |
| Compose with **[PROC-AGENT_REQ_CHECKLIST]** and completion signals | Replacing **`tied_checklist_gate_validate`** or **`tied_verify`** |
| Optional **fresh-context** review (new chat / session handoff) | **[REQ-TIED_DAE_VERIFICATION_CHARTER]** opt-in tools (mutation cache, disjoint verifier, gauntlet)—separate program |

This charter is **normative prose** for humans and agents. It does **not** change checklist gate algorithms.

---

## Executable checks before handoff

Run what applies to the change; skip rows with proof **n/a** and say why in the handoff.

| Check | When | Pass signal |
| --- | --- | --- |
| **Scope** | Always | Non-goals honored; costly choices escalated, not silently merged |
| **Language lint** | Code/tests touched | Project lint commands green ([PROC-TIED_DEV_CYCLE]) |
| **Unit / composition tests** | Behavior changed | Relevant tests run; failures fixed or explicitly deferred with sponsor |
| **TIED consistency** | Project TIED YAML or tokens touched | `tied_validate_consistency` clean |
| **YAML lint** | Index/detail YAML edited | `lint_yaml` on changed files |
| **Checklist gate** | TIED-tracked REQ | `tied_gate_check` or validated `pre_implementation` / `verification` receipt for depth |
| **Completion signals** | Claiming “done” or “ready to commit” | Separate **machine close-out**, **process contract**, **adherence ledger** ([completion-signals-handoff](../../tools/bundled-prompt-type-skills/prompt-shared/completion-signals-handoff.md) in store; clients: prompt-shared after install) |

**Fresh-context review:** For large or high-risk diffs, prefer a **new session** (or `/session-handoff` when installed) so review is not only “same thread fatigue.”

---

## Evidence to attach

Prefer **typed refs** over prose alone:

- Command **exit code** and short **stdout/stderr** excerpt (or manifest path)
- **Gate receipt** path and `allowed` outcome
- **Tracker** slug dispositions for completed steps
- **Feedback / LEAP** ids when promotion path used (`fb-*`, `lp-*`)

Do **not** treat PR comment volume or bot scores as TIED authority.

---

## Related docs

- [Sponsor risk-tier playbook](sponsor-risk-tier-playbook.md) — Phase 2 advisory mapping (assurance profile, `depth_tier`, human attention)
- [Review convergence policy](review-convergence-policy.md) — Phase 3 multi-round review norms ([REQ-TIED_REVIEW_CONVERGENCE_POLICY](../../tied-project/requirements/REQ-TIED_REVIEW_CONVERGENCE_POLICY.yaml))
- [Path-scoped review guidance](path-scoped-review-guidance.md) — optional `REVIEW.md` / `tied-project/review/` client pattern ([REQ-TIED_PATH_SCOPED_REVIEW_GUIDANCE](../../tied-project/requirements/REQ-TIED_PATH_SCOPED_REVIEW_GUIDANCE.yaml))
- [Client development index](client-development-index.md) — core seven and scenario entry
- [Harness trace observation loop](harness-trace-observation-loop.md) — Loop 2 trace review → Kaizen capture ([REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP](../../tied-project/requirements/REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP.yaml))
- [Claude Code team code review × TIED](../../docs/comparisons/claude-code-team-code-review-vs-tied.md) — compose-don't-replace source study
- [Sponsor–agent relationship](../../tied-project/vocab/sponsor-agent-relationship.md) — consequence ladder

**Last updated:** 2026-10-17
