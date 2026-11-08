# Test strategy — PLAN-WF-TRIAL-RUNS-REGISTRY

Doc-only facilitator deliverable. **No** automated unit tests.

## Verification (build-plan)

| Check | Method |
| --- | --- |
| Row count | Master table has **57** data rows matching Recorded trials |
| Cohort rows | Exactly **2** rows with `tag_era=cohort-summary` and grades `—` |
| Readout links | Every non-cohort row links to an existing `docs/demos/trial-readout-*.md` or comparison doc |
| Grades present | All single-client rows with a readout include non-empty compact grades or documented `—` + reason in footnote |
| Latest flag | Duplicate groups in PLAN § **Known duplicate groups**: exactly one `yes` each |
| Forbidden content | Registry contains no `maturity_score`, no weighted rollup, no CMMI language |
| Cross-links | Catalog Recorded trials section and `docs/demos/README.md` link to registry |
| Relative links | Markdown links resolve under `docs/demos/` (spot-check 3 random readout links) |

## Security

N/A — no executable code, no secret paths beyond published client roots already in catalog.
