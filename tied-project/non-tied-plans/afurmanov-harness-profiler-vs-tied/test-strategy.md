# Test strategy — afurmanov-harness-profiler-vs-tied

**Scope:** Doc-only non-TIED track. No production RED tests.

| Check | Method |
| --- | --- |
| Wave 2 section parity | Count 14 top-level sections per [external-service-comparison reference.md](../../../tools/bundled-prompt-type-skills/external-service-comparison/reference.md) |
| Capture ↔ analysis links | Mutual relative links between `afurmanov-harness-profiler.md` and `…-vs-tied-agent-management.md` |
| Claim labels | **Furmanov-reported**, **target-repo-observed**, **TIED-existing**, **Recommendation-only**, **Defer**, **not_measured** |
| No REQ mint in bodies | Analysis metadata includes “reference only; this document does not mint REQ/ARCH/IMPL tokens” |
| `.gitignore` allowlist | `!docs/comparisons/afurmanov-harness-profiler.md` and `!…-vs-tied-agent-management.md` |
| Sibling backlink | LangChain/Cursor harness × TIED **Distinct from** or **Related** cites this bundle when built |
| Stub policy | Wave 1 has “Why this file has no article body” (or equivalent) per sponsor stub choice |

**RED tests:** None (plan/build doc-only).