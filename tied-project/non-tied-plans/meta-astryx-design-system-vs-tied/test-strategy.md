# Test strategy — meta-astryx-design-system-vs-tied

**Scope:** Doc-only non-TIED track. No production RED tests.

| Check | Method |
| --- | --- |
| Wave 2 section parity | Count 14 top-level sections per [external-service-comparison reference.md](../../../tools/bundled-prompt-type-skills/external-service-comparison/reference.md) |
| Capture ↔ analysis links | Mutual relative links between `meta-astryx-design-system.md` and `…-vs-tied-agent-management.md` |
| Claim labels | **Meta-reported**, **target-repo-observed**, **TIED-existing**, **Recommendation-only**, **Defer**, **not_measured** |
| No REQ mint in bodies | Analysis metadata includes “reference only; this document does not mint REQ/ARCH/IMPL tokens” |
| No vendor dump | Wave 1 has no pasted README/`AGENTS.md`; grep for `@astryxdesign` install blocks or long Meta prose fences |
| `.gitignore` allowlist | `!docs/comparisons/meta-astryx-design-system.md` and `!…-vs-tied-agent-management.md` |
| Repo capture policy | Wave 1 follows [open-ontologies-repository.md](../../../docs/comparisons/open-ontologies-repository.md) repo pattern (not article stub marker) |
| Sibling backlinks | Google Agent Skills, Persante, harness siblings listed under Distinct from / Related |

**RED tests:** None (plan/build doc-only).