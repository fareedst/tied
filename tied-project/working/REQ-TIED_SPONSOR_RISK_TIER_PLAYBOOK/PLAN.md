# [REQ-TIED_SPONSOR_RISK_TIER_PLAYBOOK] Phase 2 — plan-new-feature

**Source:** Claude comparison [Phase 2](../../../../../docs/comparisons/claude-code-team-code-review-vs-tied.md#7-phased-approach-to-improving-tied-recommendations-only) · learning **#3 Risk-scaled human touchpoints** · upstream LEAP **`lp-2026-10-17T16-41-21-621Z-441a8fc5136b`** (**applied**) · feedback **`fb-mvclklsa-t5gzbo`**

## Refine (RESOLVE)

| Term | Meaning |
| --- | --- |
| **Sponsor risk-tier playbook** | Methodology doc mapping **assurance profile**, CITDP **`depth_tier`**, and **`gate_policy`** to expected **sponsor/reviewer** attention—not a runtime classifier. |
| **Informative tier** | External **low / medium / high** review labels from outreach studies; translated to TIED selectors, not imported as merge policy. |
| **Distinct from** | **[REQ-TIED_PRE_HANDOFF_VERIFICATION_CHARTER]** (Phase 1 — *what executable checks* before handoff); **[REQ-TIED_DAE_VERIFICATION_CHARTER]** (opt-in verifier tooling); **[REQ-TIED_SPONSOR_AGENT_RELATIONSHIP]** (consequence ladder source of truth—playbook *composes*, does not redefine). |
| **Proof boundary** | Documentation + `tied-install` refresh; **no** auto-approve **costly choices**; **no** new MCP gate authority; **no** zero-human merge. |

**depth_tier / profile_depth:** `minimal` · **gate_policy:** `advisory` · **eligibility_triggers_matched:** []

### Operator compose (Phase 2 → Phase 1)

1. At **`risk-assessment`**, record CITDP **`depth_tier`**, **`gate_policy`**, and assurance profile; use the playbook **attention map** to set expected sponsor/reviewer involvement (informative tier → ladder rung).
2. Before PR/commit/handoff, run **[pre-handoff verification charter](../../../../tied-bundle/docs/pre-handoff-verification-charter.md)** executable checks for the *declared* depth (gates, lint, completion signals).
3. Escalate **costly choices** to the sponsor at end of turn—playbook **never** substitutes for rung **4** approval.

## TIED stack

| Layer | Token |
| --- | --- |
| REQ | **REQ-TIED_SPONSOR_RISK_TIER_PLAYBOOK** |
| ARCH | **ARCH-TIED_SPONSOR_RISK_TIER_PLAYBOOK** |
| IMPL | **IMPL-TIED_SPONSOR_RISK_TIER_PLAYBOOK** |

## Satisfaction criteria (REQ)

| ID | Close when |
| --- | --- |
| **SC-PLAYBOOK-DOC** | `tied-bundle/docs/sponsor-risk-tier-playbook.md` has proof boundary, attention map, hinge/costly-choice section |
| **SC-INDEX-LINK** | `client-development-index.md` Quick read row + Phase 1 cross-links |
| **SC-PLAYBOOK-TEST** | `sponsor-risk-tier-playbook-doc.test.mjs` green |
| **SC-CLOSE-OUT** | `verification` + `close_out` gates allowed; CITDP persisted; REQ/ARCH/IMPL **Implemented** |

## Deliverables

| # | Artifact | Status (2026-10-17) |
| --- | --- | --- |
| 1 | `tied-bundle/docs/sponsor-risk-tier-playbook.md` | **Done** |
| 2 | Client development index + charter cross-links | **Done** |
| 3 | `tools/bootstrap/lib/sponsor-risk-tier-playbook-doc.test.mjs` | **Done** (green) |
| 4 | REQ/ARCH/IMPL + semantic tokens | **Done** (`In Progress`) |
| 5 | `tied-project/citdp/CITDP-REQ-TIED_SPONSOR_RISK_TIER_PLAYBOOK.yaml` | **Close-out** |
| 6 | `CHANGELOG.md` Unreleased entry | **Close-out** |
| 7 | Git commit (sponsor-requested) | **Close-out** |

## Non-goals

- Phases **3–5**, automated risk-tier MCP, Jev shadow triage (future REQs).
- Path-scoped **`REVIEW.md`** standard (comparison learning #2 — separate).
- Changing checklist gate algorithms, **`tied_verify`** defaults, or DAE opt-in charter.

## Test strategy

| Phase | Action |
| --- | --- |
| RED | Playbook test fails until doc + markers exist — **completed** |
| GREEN | Doc, index, cross-links; test passes — **completed** |
| Gates | `pre_implementation` — **allowed** (`run_id=pre-impl-2026-10-17-sponsor-risk-tier`); replay after plan/CITDP refine |
| Close-out | `run-close-out-gates.mjs` — `verification` then `close_out` with `--envelope-blocking`; envelope backfill / `not_applicable_receipt` at minimal depth |
| Stack | `tied_validate_consistency` after YAML status → Implemented |

## Close-out wave (`/plan-close-out`)

1. Expand **checklist-tracker.yaml** with verification/close_out dispositions (mirror Phase 1 [REQ-TIED_PRE_HANDOFF_VERIFICATION_CHARTER](../REQ-TIED_PRE_HANDOFF_VERIFICATION_CHARTER/checklist-tracker.yaml)).
2. Save **`evidence/closeout-run-close-out-gates.json`** (`run_id=close-out-2026-10-17-sponsor-risk-tier` or successor).
3. **`citdp_record_write`** → `tied-project/citdp/CITDP-REQ-TIED_SPONSOR_RISK_TIER_PLAYBOOK.yaml` (matrix `result: pass`).
4. REQ/ARCH/IMPL index + detail → **Implemented**; **`tied_validate_consistency`**.
5. **Completion signals:** machine close-out + process contract + adherence ledger (minimal: advisory band; expect possible `thin_ledger`).

**LEAP:** No new proposal—Phase 2 implements an **applied** bridge slice; do not re-mark **`lp-2026-10-17T16-41-21-621Z-441a8fc5136b`**.

## Tracker

[`agent-req-implementation-checklist.yaml`](./agent-req-implementation-checklist.yaml) · CITDP [`CITDP-REQ-TIED_SPONSOR_RISK_TIER_PLAYBOOK.yaml`](./CITDP-REQ-TIED_SPONSOR_RISK_TIER_PLAYBOOK.yaml) · Evidence [`./evidence/`](./evidence/)

---

## Close-out (2026-10-17)

**Done:** Playbook, index, Phase 1 cross-links, bootstrap test green; verification and close_out gates (`run_id=close-out-2026-10-17-sponsor-risk-tier`, `merged_decision.allowed=true`, envelope `blocking_gap_count=0`, reconcile band **B** / `thin_ledger`); CITDP persisted; REQ/ARCH/IMPL **Implemented**; CHANGELOG Unreleased entry.

**Deferred:** Phases 3–5 (separate plan-new-feature REQs); git commit when sponsor requests.

**Evidence:** [closeout-run-close-out-gates.json](./evidence/closeout-run-close-out-gates.json), [closeout-run-close-out-gates-verification.json](./evidence/closeout-run-close-out-gates-verification.json), [request-evidence-envelope.v1.json](./evidence/request-evidence-envelope.v1.json).
