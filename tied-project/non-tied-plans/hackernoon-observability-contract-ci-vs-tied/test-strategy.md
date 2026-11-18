# Test strategy — hackernoon-observability-contract-ci-vs-tied

**Scope:** Doc-only non-TIED track. No production tests required.

| Check | Method |
| --- | --- |
| Wave 2 section parity | Count 14 H2 sections per [external-service-comparison reference.md](../../../tools/bundled-prompt-type-skills/external-service-comparison/reference.md) |
| Capture ↔ analysis links | Mutual relative links between `hackernoon-observability-contract-ci.md` and `…-vs-tied-agent-management.md` |
| Claim labels | Executive tables use **HackerNoon-reported**, **TIED-existing**, **Recommendation-only**, **Defer**, **not_measured** where applicable |
| No REQ mint in comparison bodies | Metadata includes **reference only; no REQ mint**; grep bodies for unintended token authoring |
| No article body | Wave 1 has “Why this file has no article body”; no Rego/YAML/workflow fences from source |
| `.gitignore` allowlist | Two new `!docs/comparisons/hackernoon-observability-contract-ci*.md` lines present |
| Sibling backlinks | At least Netflix + Open Governance + Traefik listed under Distinct from / Related |

**RED tests:** None (plan/build doc-only).