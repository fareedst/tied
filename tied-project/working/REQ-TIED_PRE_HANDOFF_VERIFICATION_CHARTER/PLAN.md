# [REQ-TIED_PRE_HANDOFF_VERIFICATION_CHARTER] Phase 1 — plan-new-feature

**Source:** Claude Code comparison [Phase 1](../../../../../docs/comparisons/claude-code-team-code-review-vs-tied.md#7-phased-approach-to-improving-tied-recommendations-only) · LEAP **`lp-2026-10-17T16-41-21-621Z-441a8fc5136b`** (approved) · feedback **`fb-mvclklsa-t5gzbo`**

## Refine (RESOLVE)

| Term | Meaning |
| --- | --- |
| **Pre-handoff verification charter** | Short **methodology doc** listing executable checks and evidence operators should run **before** PR/commit/agent handoff—not new MCP authority. |
| **Distinct from** | **[REQ-TIED_DAE_VERIFICATION_CHARTER]** (opt-in mutation cache, disjoint verifier, gauntlet)—already **Implemented**; Phase 1 does not extend those tools. |
| **Proof boundary** | Documentation + install refresh; **no** new gates, **no** auto-merge, **no** PR-bot authority. |

**depth_tier / profile_depth:** `minimal` · **gate_policy:** `advisory` · **eligibility_triggers_matched:** []

## TIED stack

| Layer | Token |
| --- | --- |
| REQ | **REQ-TIED_PRE_HANDOFF_VERIFICATION_CHARTER** |
| ARCH | **ARCH-TIED_PRE_HANDOFF_VERIFICATION_CHARTER** |
| IMPL | **IMPL-TIED_PRE_HANDOFF_VERIFICATION_CHARTER** |

## Deliverables

1. **`tied-bundle/docs/pre-handoff-verification-charter.md`** — canonical charter (shipped on `tied-install.sh` refresh).
2. **Client development index** — Quick read row + scenario pointer.
3. **Bootstrap test** — charter file presence + required section markers.
4. **CITDP** — `tied-project/citdp/CITDP-REQ-TIED_PRE_HANDOFF_VERIFICATION_CHARTER.yaml` at close-out.

## Non-goals

- Phase 2–5, matrix row, review convergence MCP, path-scoped `REVIEW.md` standard (later REQs).
- Changing checklist gate algorithms or `tied_verify` defaults.

## Test strategy

- RED: `pre-handoff-charter-doc.test.mjs` fails until charter exists with marker headings.
- GREEN: add charter + index link; test passes.
- `tied_validate_consistency` after YAML mint.

## Tracker

[`agent-req-implementation-checklist.yaml`](./agent-req-implementation-checklist.yaml) · CITDP [`CITDP-REQ-TIED_PRE_HANDOFF_VERIFICATION_CHARTER.yaml`](./CITDP-REQ-TIED_PRE_HANDOFF_VERIFICATION_CHARTER.yaml)

---

## Close-out (2026-10-17)

**Done:** Charter doc + index link + bootstrap test green; verification and close_out gates (`run_id=close-out-2026-10-17-pre-handoff`, `merged_decision.allowed=true`, envelope `blocking_gap_count=0`); CITDP persisted; REQ/ARCH/IMPL **Implemented**; LEAP **`lp-2026-10-17T16-41-21-621Z-441a8fc5136b`** → `applied` (`project_root`: `tied-project/`).

**Deferred:** Phases 2–5 (separate plan-new-feature REQs).

**Evidence:** [closeout-run-close-out-gates.json](./evidence/closeout-run-close-out-gates.json), [request-evidence-envelope.v1.json](./evidence/request-evidence-envelope.v1.json).
