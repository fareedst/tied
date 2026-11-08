# Test strategy — google-agent-skills-vs-tied

**Scope:** Doc-only non-TIED track. No production tests required.

| Check | Method |
| --- | --- |
| Relative links in committed charter | Manual read of new markdown links under `docs/` |
| Wave 1 ↔ Wave 2 sibling links | Paths resolve on disk (operator-local comparisons) |
| No REQ tokens in comparison body | Grep `REQ-[A-Z]` in new comparison files — expect references only, no minting claims |
| Optional | `@non-tied-close` may run link check on committed `tied-methodology-evaluation-framework.md` only |

**RED tests:** None (plan/build doc-only).
