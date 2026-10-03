# Sponsor wrap-up decisions (2026-09-27)

**Change ID:** `PLAN-TIED-RESIDUALITY-ANALYSIS`

## Methodology (W5)

| ID | Choice |
|----|--------|
| SD-W5-RECOMMENDATION | **Adopt (revise)** — optional risk-triggered discovery; feeds TIED authority |
| SD-W5-CHECKLIST | **Yes** — merge optional `sub-residuality-analysis-pass` near impact-discovery |
| SD-W5-CITDP-POLICY | **Attach-first** — working CITDP examples; defer canonical `citdp-policy.md` merge |
| SD-W5-SCHEMA-LINT | **Defer** standalone lint (superseded by tooling REQ scope below) |
| SD-W5-TOOLING-REQ | **Open** dedicated REQ/ARCH/IMPL for validators/MCP/CLI (integrated depth for tooling batch) |
| SD-W5-P1-LEAP | **Done** — P1 batch 2 persisted 2026-09-27 |
| SD-W5-COMPARISON-GIT | **Excerpt** — short tracked excerpt/link; full comparison may stay gitignored |
| SD-W5-CLOSE-OUT | **Plan-close-out now** — commit current state; W5 may follow as second commit |

## Tests (post-P1)

| ID | Choice |
|----|--------|
| SD-P1-COMPOSITION | **Follow-up batch** — add composition/fault tests for P1 facets before or as gate to close-out |

**Execution order (recommended):** P1 composition build-plan → **plan-close-out** commit (sponsor chose close_now after composition work, not empty stack).

## Git

- **close_now:** run plan-close-out with evidence + commit when composition follow-up complete (or sponsor overrides to commit without composition).
