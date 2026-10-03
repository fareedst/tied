# Sponsor decisions — post-W5 wrap-up (2026-09-27)

| ID | Choice |
|----|--------|
| SD-POST-W5-COMMIT | **One close-out commit** — W5 tranche only, clear message (after envelope investigation) |
| SD-POST-W5-CITDP-POLICY | **Merge** — short residuality attach section into `tied/docs/citdp-policy.md` in same commit as W5 |
| SD-POST-W5-ENVELOPE | **Investigate/fix** envelope tooling for `PLAN-*` (or documented path) **before** next git commit |
| SD-POST-W5-PUSH | **Commit locally** — sponsor pushes later (no agent push) |
| SD-POST-W5-PILOT-DONE | Pilot **complete after W5 commit** — not “done” until git has W5 + policy |

## Execution order (agent)

1. Investigate `request_evidence_envelope_*` / `InvalidRequestToken` for `PLAN-TIED-RESIDUALITY-ANALYSIS`; fix or document minimal fix + re-validate if feasible.
2. Apply `citdp-policy.md` residuality attach section (from `w5-promotion/risk_analysis.residuality_analysis.proposed.yaml` pattern).
3. `/plan-close-out` — evidence + single W5 commit.
4. Sponsor reviews and pushes `main`.
