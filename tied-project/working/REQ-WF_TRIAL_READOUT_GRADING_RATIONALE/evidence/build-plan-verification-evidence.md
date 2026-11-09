# Build-plan verification — REQ-WF_TRIAL_READOUT_GRADING_RATIONALE

**Date:** 2026-11-09

```bash
node --test tools/bootstrap/lib/trial-readout-grading-rationale-contract.test.mjs
```

Result: **6/6 pass** (T-GR-REF-01 … T-GR-READOUTS-01).

Spot-check readouts (rationale shortened; bands unchanged):

- `trial-readout-PROMPT-WF-01-composer25-1794048393-wf-agentstream-wf-01-cursor-composer25.md` (reference style)
- `trial-readout-PROMPT-WF-01-composer25-1794205559-wf-agentstream-wf-01-cursor-composer25.md` (was all `—`)
- `trial-readout-PROMPT-WF-08-luna-low-1794100604-wf-agentstream-wf-08-cursor-lunalow.md`
- `trial-readout-PROMPT-WF-08-composer25-1794211741-wf-agentstream-wf-08-cursor-composer25.md`

SC-GR-05: registry bands manual — sample `1794205559` row `A/A−/A/A/A−/A/A−` unchanged.
