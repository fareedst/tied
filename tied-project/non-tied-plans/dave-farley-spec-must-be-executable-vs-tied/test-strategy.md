# Test strategy — dave-farley-spec-must-be-executable-vs-tied

**Scope:** Doc-only non-TIED track. No production RED tests.

| Check | Method |
| --- | --- |
| Wave 2 section parity | Count 14 top-level sections per [external-service-comparison reference.md](../../../tools/bundled-prompt-type-skills/external-service-comparison/reference.md) |
| Capture ↔ analysis links | Mutual relative links between `dave-farley-spec-must-be-executable.md` and `…-vs-tied-agent-management.md` |
| Claim labels | **Farley-reported**, **TIED-existing**, **Recommendation-only**, **Defer**, **not_measured** |
| No REQ mint in bodies | Analysis metadata includes “reference only; this document does not mint REQ/ARCH/IMPL tokens” |
| No vendor dump | Wave 1 includes **Why this file has no article body**; grep for LinkedIn article prose or long pasted Gherkin |
| `.gitignore` allowlist | `!docs/comparisons/dave-farley-spec-must-be-executable.md` and `!…-vs-tied-agent-management.md` |
| Article stub policy | Wave 1 follows stub pattern in [reference.md](../../../tools/bundled-prompt-type-skills/external-service-comparison/reference.md) |
| Sibling backlinks | AI-SDLC factory, Persante, degree grid under Distinct from / Related |
| Anti-pattern row | Wave 2 includes pasting vendor article into repository paths |

**RED tests:** None (plan/build doc-only).