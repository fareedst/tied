# Test strategy — langchain-goal-engineering-vs-tied

**Scope:** Doc-only non-TIED track. No production tests required.

| Check | Method |
| --- | --- |
| Wave 2 section parity | Count 14 H2 sections per [external-service-comparison reference.md](../../../tools/bundled-prompt-type-skills/external-service-comparison/reference.md) |
| Capture ↔ analysis links | Mutual relative links between `langchain-goal-engineering.md` and `…-vs-tied-agent-management.md` |
| Claim labels | Executive tables use **LangChain-reported**, **TIED-existing**, **Recommendation-only**, **Defer**, **not_measured** where applicable |
| No REQ mint in comparison bodies | `rg 'reference only.*no REQ'` metadata; grep comparison bodies for unintended new token authoring claims |
| `.gitignore` allowlist | Two new `!docs/comparisons/langchain-goal-engineering*.md` lines present |
| Sibling backlink | `langchain-harness-engineering-vs-tied-agent-management.md` lists goal-engineering sibling under Distinct from / Related |

**RED tests:** None (plan/build doc-only).