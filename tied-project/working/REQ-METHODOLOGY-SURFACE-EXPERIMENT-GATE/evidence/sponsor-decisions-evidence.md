# sponsor-decisions — follow-on out-of-scope

**Request:** `REQ-METHODOLOGY-SURFACE-EXPERIMENT-GATE` (QMM follow-on **(a)** complete)  
**Session:** `/unblock` — 2026-10-10

## Recorded (sponsor)

| Out-of-scope track | Question | Answer | Unlocks |
| --- | --- | --- | --- |
| **(b) Kaizen Phase 3 transport** | Reopen upstream outbox/transport now (QMM W6 was waived; Kaizen program hinge still closed)? | **No — remain deferred** (sponsor: `/unblock with Kaizen Phase 3 deferred`) | Agents stop treating W6 waiver or follow-on **(a)** close-out as implicit Phase 3 authorization. Loop 3 local proof stays on append/export/MCP without transport. |
| **(c) `shareable_hashed` export** | Authorize cross-client **client cohort** export for **methodology learning experiments** at `shareable_hashed`? | **Yes — authorized** (2026-10-10). Authority: [`sponsor-authority-followon-c-shareable-hashed-20261010.md`](../../PLAN-TIED-QMM-METHODOLOGY-LEARNING/evidence/sponsor-authority-followon-c-shareable-hashed-20261010.md) | **`/plan-new-feature`** (or child plan + build) for follow-on **(c)**; implement CITDP must name redaction **owner** + **expiry** before production export paths. |

## Authority cross-links

- Kaizen program Phase 3 deferral: [`PLAN-TIED-KAIZEN-FEEDBACK-LOOP/evidence/sponsor-decisions-evidence.md`](../../PLAN-TIED-KAIZEN-FEEDBACK-LOOP/evidence/sponsor-decisions-evidence.md)
- QMM program closed / W6 waived: [`PLAN-TIED-QMM-METHODOLOGY-LEARNING/evidence/session-handoff.md`](../../PLAN-TIED-QMM-METHODOLOGY-LEARNING/evidence/session-handoff.md)
- Follow-on child plan: [`docs/tied-qmm-followon-a-methodology-surface-experiment-gate-plan.md`](../../../../docs/tied-qmm-followon-a-methodology-surface-experiment-gate-plan.md)

**Proof boundary:** decision record only; does not implement export runtime or mint follow-on **(c)** REQ/ARCH/IMPL until a gated implement pass.
