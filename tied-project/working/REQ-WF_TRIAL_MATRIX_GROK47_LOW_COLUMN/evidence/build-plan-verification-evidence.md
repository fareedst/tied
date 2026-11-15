# Build verification — REQ-WF_TRIAL_MATRIX_GROK47_LOW_COLUMN

**date:** 2026-11-13

| Command | Result |
| --- | --- |
| `node --test tools/bootstrap/lib/wf-trial-comparison-matrix.test.mjs` | **19/19** pass (SC-WF-CMX-11 → 10 cols; SC-WF-CMX-16…19) |
| `node tools/bootstrap/lib/build-wf-trial-comparison-matrix.mjs` | OK — matrix written |
| `node tools/bootstrap/lib/wf-trial-summaries-publish.mjs --check` | exit **0** |

**Spot:** WF-09 `cursor:grok47-low` → **12m**, **1794608051**; WF-09 `cursor:grok47-med` → **—**; WF-10 low/med split.
