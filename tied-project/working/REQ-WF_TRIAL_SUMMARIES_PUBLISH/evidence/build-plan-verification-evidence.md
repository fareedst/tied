# Build-plan verification — REQ-WF_TRIAL_SUMMARIES_PUBLISH

**Date:** 2026-11-13

```bash
node --test tools/bootstrap/lib/store-facilitator-skills.test.mjs
node --test tools/bootstrap/lib/wf-trial-summaries-publish-skill-contract.test.mjs
node --test tools/bootstrap/lib/wf-trial-registry-refresh.test.mjs
node tools/bootstrap/lib/build-wf-trial-comparison-matrix.mjs --check
node tools/bootstrap/lib/wf-trial-summaries-publish.mjs --check
```

All commands **exit 0** on build completion.

**Note:** Full `wf-trial-summaries-publish.mjs` (writes registry, matrix, size batch) is sponsor-run when disposable discover parent is available; default CI uses `--check` only.
