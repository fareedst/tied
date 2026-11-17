# Traceable commit — REQ-WF_TRIAL_EVALUATION_GUIDE + reddit-wf-trials-corpus

**Date:** 2026-11-17  
**Scope:** `REQ-WF_TRIAL_EVALUATION_GUIDE`, outreach markdown under `reddit-wf-trials-corpus/`

**Pre-commit:**

```bash
node --test tools/bootstrap/lib/wf-trial-evaluation-guide-contract.test.mjs
# pass
```

**Excluded (intentional):** `.gitignore` local drift; untracked `.claude/`