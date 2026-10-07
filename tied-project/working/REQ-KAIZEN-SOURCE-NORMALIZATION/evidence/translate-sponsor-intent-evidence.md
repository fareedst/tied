# translate-sponsor-intent

Phase 2 maps **source normalization** onto:

| Sponsor / plan wording | Canonical term |
|---|---|
| incident, metric, test failure, user report adapters | **operational source** (`OperationalSource`) |
| Map user_report to feature_request (today) | **Replaced** by kind-based inference; friction stays **methodology_improvement** unless caller supplies **feedback entry type** |
| Kind beside three entry types | **observation kind** on adapter output and capture context |
| Workflow, workaround, baseline on adapters | Additive `context` / payload fields; not analysis facets |
| Caller type wins | Explicit `entry_type` on source or capture params overrides inference |

Intent authority unchanged: sponsor hinges from 2026-10-07; no transport in Phase 2.
