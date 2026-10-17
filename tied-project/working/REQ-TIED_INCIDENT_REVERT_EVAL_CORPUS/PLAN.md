# [REQ-TIED_INCIDENT_REVERT_EVAL_CORPUS] Phase 4 — plan-new-feature

**Source:** Claude comparison [Phase 4](../../../../docs/comparisons/claude-code-team-code-review-vs-tied.md#7-phased-approach-to-improving-tied-recommendations-only) · learning **#4 Incident/revert evaluation corpus** · upstream LEAP **`lp-2026-10-17T16-41-21-621Z-441a8fc5136b`** (**applied**) · feedback **`fb-mvclklsa-t5gzbo`**

## Refine (RESOLVE)

| Term | Meaning |
| --- | --- |
| **Incident/revert evaluation corpus** | Loop 3 **methodology guide** for adding **confirmed** post-merge incidents, reverts, and **review false positives** to bounded **`evaluation-corpus.v1`** rows—not auto-ingestion. |
| **Operational observation** | Kaizen capture for review noise before corpus promotion ([feedback-to-tied](../../vocab/feedback-to-tied.md)). |
| **Distinct from** | Closed QMM W6 reopen; new MCP eval gates; Phase 5 DevOps appendix. |
| **Proof boundary** | Documentation + example template + install refresh; **no** new gate authority. |

**depth_tier / profile_depth:** `minimal` · **gate_policy:** `advisory` · **eligibility_triggers_matched:** []

## TIED stack

| Layer | Token |
| --- | --- |
| REQ | **REQ-TIED_INCIDENT_REVERT_EVAL_CORPUS** |
| ARCH | **ARCH-TIED_INCIDENT_REVERT_EVAL_CORPUS** |
| IMPL | **IMPL-TIED_INCIDENT_REVERT_EVAL_CORPUS** |

## Satisfaction criteria (REQ)

| ID | Close when |
| --- | --- |
| **SC-GUIDE-DOC** | `incident-revert-evaluation-corpus.md` has proof boundary + case-kind + pilot sections |
| **SC-TEMPLATE-EXAMPLE** | Example rows template under `tied-bundle/templates/` |
| **SC-INDEX-LINK** | `client-development-index.md` Quick read row + Phase 3 cross-link |
| **SC-CLOSE-OUT** | Gates allowed; CITDP persisted; REQ/ARCH/IMPL **Implemented** |

## Deliverables

| # | Artifact | Status (2026-10-17) |
| --- | --- | --- |
| 1 | `tied-bundle/docs/incident-revert-evaluation-corpus.md` | **Done** |
| 2 | `tied-bundle/templates/evaluation-corpus-incident-revert-rows.v1.example.yaml` | **Done** |
| 3 | Client development index + review-convergence cross-link | **Done** |
| 4 | `tools/bootstrap/lib/incident-revert-eval-corpus-doc.test.mjs` | **Done** (green) |
| 5 | REQ/ARCH/IMPL + semantic tokens | **Done** |
| 6 | `tied-project/citdp/CITDP-REQ-TIED_INCIDENT_REVERT_EVAL_CORPUS.yaml` | **Done** |
| 7 | `CHANGELOG.md` Unreleased entry | **Done** |
| 8 | Git commit | **Open** (sponsor) |

## Non-goals

- Phase **5**, matrix row, automatic incident MCP, cohort export transport.
- Reopening QMM W6 or methodology YAML without new REQ.

## Test strategy

| Phase | Action |
| --- | --- |
| RED | Doc test fails until guide + template exist — **completed** |
| GREEN | Doc, template, index; test passes — **completed** |
| Gates | `tied_gate_check` + `run-close-out-gates.mjs` |
| Stack | `tied_validate_consistency`; statuses → **Implemented** at close-out |

## Tracker

[`checklist-tracker.yaml`](./checklist-tracker.yaml) · CITDP [`CITDP-REQ-TIED_INCIDENT_REVERT_EVAL_CORPUS.yaml`](./CITDP-REQ-TIED_INCIDENT_REVERT_EVAL_CORPUS.yaml)

**LEAP:** Composes **applied** bridge **`lp-2026-10-17T16-41-21-621Z-441a8fc5136b`**; do not re-mark proposal status.

## Close-out (2026-10-17)

**Done:** Guide + example template, index + Phase 3 cross-link, bootstrap test green; verification and close_out gates (`run_id=close-out-2026-10-17-incident-revert-corpus`, `merged_decision.allowed=true`, envelope `blocking_gap_count=0`); CITDP persisted; REQ/ARCH/IMPL **Implemented**.

**Deferred:** Phase **5**; git commit when sponsor requests.

**Evidence:** [session-handoff.md](./evidence/session-handoff.md), [request-evidence-envelope.v1.json](./evidence/request-evidence-envelope.v1.json).
