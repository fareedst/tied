# Test strategy — PLAN-WF-TRIAL-COMPARISON-MATRIX

Doc-only facilitator deliverable. **No** automated unit tests in repo (optional one-off script self-check only).

## Verification (build-plan)

| Check | Method |
| --- | --- |
| Placement | `## Latest-run comparison matrix` appears above `## Footnotes`; master table byte-stable except footnote |
| Column count | **11** columns matching plan manifest |
| Row count | **01…NN** — one row per prompt index through max WF in master table (minimum **08**; includes **09+** when recorded) |
| Spot — WF-08 baseline Composer | `706s`, `3.57`, `trial-readout-PROMPT-WF-08-composer25-1794211741-…` |
| Spot — WF-01 effort medium Composer | `1125s`, `3.87`, `1794256930` readout (not baseline `1794246289`) |
| Spot — WF-03 effort high | `870s`, readout `1794264348` |
| Spot — grok column | WF-01…08 populated from `179418*`…`179420*` latest rows |
| Effort sparse | WF-04…08 effort columns mostly `—` (expected) |
| Forbidden content | No `maturity_score`, ranking, or CMMI language in new section |
| Links | Three random readout links resolve under `docs/demos/` |

## Optional script check

When `build-comparison-matrix.mjs` exists:

```bash
node tied-project/working/PLAN-WF-TRIAL-COMPARISON-MATRIX/evidence/build-comparison-matrix.mjs --check
```

Exits 0 when spot keys match hard-coded expectations (build-plan may add).

## Security

N/A — markdown only.
