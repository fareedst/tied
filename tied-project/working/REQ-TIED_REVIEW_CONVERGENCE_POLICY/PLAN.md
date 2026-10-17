# [REQ-TIED_REVIEW_CONVERGENCE_POLICY] Phase 3 — plan-new-feature

**Source:** Claude comparison [Phase 3](../../../../docs/comparisons/claude-code-team-code-review-vs-tied.md#7-phased-approach-to-improving-tied-recommendations-only) · learning **#5 Convergence policy** · upstream LEAP **`lp-2026-10-17T16-41-21-621Z-441a8fc5136b`** (**applied**) · feedback **`fb-mvclklsa-t5gzbo`**

## Refine (RESOLVE)

| Term | Meaning |
| --- | --- |
| **Review convergence policy** | Loop 2 **methodology doc** for **round cap**, **diff-only re-review**, **class-level fixes**, and **repeated-finding suppression**—not checklist MCP receipts. |
| **Operational observation** | Kaizen capture path for review fatigue / false-positive noise ([feedback-to-tied](../../vocab/feedback-to-tied.md)). |
| **Distinct from** | **[REQ-TIED_PRE_HANDOFF_VERIFICATION_CHARTER]** (Phase 1 executable pre-handoff checks); **[REQ-TIED_SPONSOR_RISK_TIER_PLAYBOOK]** (Phase 2 human attention map). |
| **Proof boundary** | Documentation + `tied-install` refresh; measure improvement via observations/outcomes; **no** new gate authority. |

**depth_tier / profile_depth:** `minimal` · **gate_policy:** `advisory` · **eligibility_triggers_matched:** []

### Operator compose (Phase 3 with Loop 1)

1. Set attention via Phase 2 playbook; run Phase 1 charter checks before handoff.
2. During review rounds, apply this policy (cap, diff-only, suppress duplicates, class fixes).
3. Capture recurring noise as **operational observation**; promote analysis via Kaizen tools when enabled.

## TIED stack

| Layer | Token |
| --- | --- |
| REQ | **REQ-TIED_REVIEW_CONVERGENCE_POLICY** |
| ARCH | **ARCH-TIED_REVIEW_CONVERGENCE_POLICY** |
| IMPL | **IMPL-TIED_REVIEW_CONVERGENCE_POLICY** |

## Satisfaction criteria (REQ)

| ID | Close when |
| --- | --- |
| **SC-POLICY-DOC** | `review-convergence-policy.md` has proof boundary + four policy sections |
| **SC-INDEX-LINK** | `client-development-index.md` Quick read row + Phase 1/2 cross-links |
| **SC-POLICY-TEST** | `review-convergence-policy-doc.test.mjs` green |
| **SC-CLOSE-OUT** | `verification` + `close_out` gates allowed; CITDP persisted; REQ/ARCH/IMPL **Implemented** |

## Deliverables

| # | Artifact | Status (2026-10-17) |
| --- | --- | --- |
| 1 | `tied-bundle/docs/review-convergence-policy.md` | **Done** |
| 2 | Client development index + charter/playbook cross-links | **Done** |
| 3 | `tools/bootstrap/lib/review-convergence-policy-doc.test.mjs` | **Done** (green) |
| 4 | REQ/ARCH/IMPL + semantic tokens | **Done** (**Implemented**) |
| 5 | `tied-project/citdp/CITDP-REQ-TIED_REVIEW_CONVERGENCE_POLICY.yaml` | **Done** |
| 6 | `CHANGELOG.md` Unreleased entry | **Done** |
| 7 | Git commit (sponsor-requested) | **Open** |

## Non-goals

- Phases **4–5**, matrix row, MCP round-cap receipts, mandatory Bugbot gates.
- Path-scoped **`REVIEW.md`** standard (comparison learning #2 — separate).
- Changing checklist gate algorithms or **`tied_verify`** defaults.

## Test strategy

| Phase | Action |
| --- | --- |
| RED | Policy test fails until doc + markers exist — **completed** |
| GREEN | Doc, index, cross-links; test passes — **completed** |
| Gates | `pre_implementation` via `tied_gate_check` — replay after tracker update |
| Close-out | `run-close-out-gates.mjs` — `verification` then `close_out` with `--envelope-blocking` |
| Stack | `tied_validate_consistency`; REQ/ARCH/IMPL → **Implemented** at close-out |

## Tracker

[`checklist-tracker.yaml`](./checklist-tracker.yaml) · CITDP [`CITDP-REQ-TIED_REVIEW_CONVERGENCE_POLICY.yaml`](./CITDP-REQ-TIED_REVIEW_CONVERGENCE_POLICY.yaml)

**LEAP:** Implements another slice of **applied** bridge **`lp-2026-10-17T16-41-21-621Z-441a8fc5136b`**; do not re-mark proposal status.

## Close-out (2026-10-17)

**Done:** Policy doc, index, Phase 1/2 cross-links, bootstrap test green; `request_evidence_envelope_backfill` + not-applicable receipt; verification and close_out gates (`run_id=close-out-2026-10-17-review-convergence`, `merged_decision.allowed=true`, envelope `blocking_gap_count=0`, reconcile band **B** / `thin_ledger`); CITDP persisted; REQ/ARCH/IMPL **Implemented**; CHANGELOG Unreleased entry.

**Deferred:** Phases 4–5 (separate plan-new-feature REQs); git commit when sponsor requests.

**Evidence:** [closeout-run-close-out-gates.json](./evidence/closeout-run-close-out-gates.json), [closeout-run-close-out-gates-verification.json](./evidence/closeout-run-close-out-gates-verification.json), [request-evidence-envelope.v1.json](./evidence/request-evidence-envelope.v1.json), [session-handoff.md](./evidence/session-handoff.md).
