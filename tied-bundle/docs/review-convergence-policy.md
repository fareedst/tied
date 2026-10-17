# Review convergence policy

**Audience:** Agents, sponsors, and reviewers running **multi-round** code review (Loop 2 — agent/skill norms before optional MCP receipts).

**Traceability:** [REQ-TIED_REVIEW_CONVERGENCE_POLICY](../../tied-project/requirements/REQ-TIED_REVIEW_CONVERGENCE_POLICY.yaml) · Claude comparison [Phase 3](../../docs/comparisons/claude-code-team-code-review-vs-tied.md#7-phased-approach-to-improving-tied-recommendations-only) · feedback **`fb-mvclklsa-t5gzbo`**

---

## Proof boundary

| In scope | Out of scope |
| --- | --- |
| **Documented norms** for review **round cap**, **diff-only re-review**, **class-level fixes**, and **repeated-finding suppression** | New **`tied_checklist_gate_validate`** receipts or mandatory PR-bot gates |
| Routing review fatigue to **operational observation** + Kaizen **feedback analysis** ([feedback-to-tied](../../tied-project/vocab/feedback-to-tied.md)) | Treating Anthropic article metrics or comment volume as TIED authority |
| Compose with [pre-handoff verification charter](pre-handoff-verification-charter.md) and [sponsor risk-tier playbook](sponsor-risk-tier-playbook.md) | Zero-human merge, finding-voter gates, or replacing LEAP/checklist with PR-only workflow |

This policy is **normative prose** for humans and agents. Future REQs may add **prompt-shared** adjuncts or MCP surfaces; this Phase 3 slice does **not** change checklist algorithms.

---

## Review round cap

| Norm | Guidance |
| --- | --- |
| **Default cap** | **Three** review rounds per change request unless sponsor extends with rationale in CITDP or handoff |
| **Stop condition** | After cap, escalate **costly choices** (architecture, security, irreversible defaults) to sponsor—do not loop on style-only nits |
| **Fresh context** | Round **2+** should prefer **diff-only** scope (below) or a **new session** for large deltas (compose with pre-handoff charter) |
| **Evidence** | Record round count and stop reason in Tracker handoff or PR description—not as a new MCP gate |

---

## Diff-only re-review

| Step | Action |
| --- | --- |
| 1 | After round 1, restrict reviewer/agent attention to **delta since last reviewed commit** (or explicit file list) |
| 2 | Mark prior-round findings **addressed**, **won't fix (sponsor)**, or **deferred** with token/ref—do not re-litigate closed items |
| 3 | Attach **command output** or gate receipts for fixes in the delta only when behavior changed |
| 4 | If delta is empty but findings remain open, treat as **process failure**—return to implementation, not another full-repo review |

**Distinct from** full-tree **Bugbot** or security passes: those may run on bounded diff when the skill says so; this policy does not mandate a specific vendor skill.

---

## Repeated-finding suppression

| Pattern | Response |
| --- | --- |
| Same finding text **twice** without new code change | Classify as **process** or **tooling** noise; capture **`methodology_improvement`** or **operational observation** via **`tied_feedback_capture_observation`** when Kaizen Phase 1+ is enabled |
| Bot + human duplicate on same hunk | Keep **one** canonical finding; link duplicates in handoff prose |
| “Nit” rounds after behavior is green | Stop at **round cap**; sponsor decides accept vs follow-up REQ |
| False positive from automated review | Route to Loop 3 **feedback analysis** / evaluation corpus (Phase 4 REQ)—do not patch code to silence reviewer |

---

## Class-level fixes

When a finding applies to a **class** of defects (null checks, error handling, token comments):

| Do | Don't |
| --- | --- |
| Fix **all instances in touched modules** in one commit when cost is bounded | Drive unbounded repo-wide sweeps without sponsor scope |
| Name the **class** in commit/PR body and link **[PROC-IMPL_PSEUDOCODE_TOKENS]** or REQ when methodology-related | Hide class fix behind unrelated refactors |
| Add or extend **tests** that lock the class rule for the module | Rely on reviewer memory in the next PR |

---

## Measuring convergence (Kaizen)

Improvement is measured with **operational observations** and **outcome baselines**, not comment counts:

1. Capture friction (round overload, repeated bot findings, diff-scope confusion) as **operational observation** with **observation kind** when appropriate.
2. Use **`tied_feedback_analysis_digest`** when sponsor promotes Loop 3 analysis—denominators and proof boundaries required.
3. Treat **baseline** as rounds-to-merge or repeated-finding rate **before** a countermeasure; record **outcome observation** after playbook edits or skill changes.

---

## Operator compose (Loop 2 with Loop 1)

1. Declare **`depth_tier`** and run [sponsor risk-tier playbook](sponsor-risk-tier-playbook.md) attention map ([REQ-TIED_SPONSOR_RISK_TIER_PLAYBOOK](../../tied-project/requirements/REQ-TIED_SPONSOR_RISK_TIER_PLAYBOOK.yaml)).
2. Before handoff, run [pre-handoff verification charter](pre-handoff-verification-charter.md) checks ([REQ-TIED_PRE_HANDOFF_VERIFICATION_CHARTER](../../tied-project/requirements/REQ-TIED_PRE_HANDOFF_VERIFICATION_CHARTER.yaml)).
3. Apply this policy during **review rounds**; stop at cap; escalate **costly choices** on the [consequence ladder](../../tied-project/vocab/sponsor-agent-relationship.md).

---

## Related docs

- [Claude Code team code review × TIED](../../docs/comparisons/claude-code-team-code-review-vs-tied.md) — Phase 3 source · learning **#5 Convergence policy**
- [Kaizen feedback loop plan](../../docs/tied-kaizen-feedback-loop-plan.md) — operational observation path
- [Client development index](client-development-index.md) — Quick read entry

**Last updated:** 2026-10-17
