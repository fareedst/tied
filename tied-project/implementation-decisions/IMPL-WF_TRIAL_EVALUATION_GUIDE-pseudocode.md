# [IMPL-WF_TRIAL_EVALUATION_GUIDE] [ARCH-WF_TRIAL_EVALUATION_GUIDE] [REQ-WF_TRIAL_EVALUATION_GUIDE] — Public workflow trials guide and contract guard

Grammar-Version: v2

## PATH_CONSTANT

- [IMPL-WF_TRIAL_EVALUATION_GUIDE] [ARCH-WF_TRIAL_EVALUATION_GUIDE] [REQ-WF_TRIAL_EVALUATION_GUIDE] Export `AHE_WORKFLOW_TRIALS_GUIDE_REL` and `resolveAhePaths().workflowTrialsGuide` beside existing AHE layout constants.
- Contract:
  - INPUT: store repository root path
  - PRE: `AHE_ROOT_REL` unchanged
  - OUTPUT: absolute path to committed `workflow-trials-guide.md`
  - POST: path joins `storeRoot` + relative constant
  - EFFECTS: bootstrap consumers may resolve guide without string literals

## CONTRACT_TEST

- [IMPL-WF_TRIAL_EVALUATION_GUIDE] [REQ-WF_TRIAL_EVALUATION_GUIDE] `wf-trial-evaluation-guide-contract.test.mjs` asserts guide exists, H2 outline, guardrails, link allowlist, README index link.
- Contract:
  - INPUT: guide markdown body from disk
  - PRE: guide file present at `AHE_WORKFLOW_TRIALS_GUIDE_REL`
  - OUTPUT: test pass or assertion failure
  - POST: SC-WF-EG-01..05 satisfied when guide and README committed
  - FAILURE_MODES: missing H2 → fail; missing HMEP boundary prose → fail; broken allowlist target → fail

## GUIDE_AUTHORING

- [IMPL-WF_TRIAL_EVALUATION_GUIDE] [ARCH-WF_TRIAL_EVALUATION_GUIDE] [REQ-WF_TRIAL_EVALUATION_GUIDE] Human-maintained `workflow-trials-guide.md` synthesizes catalog/skills corpus; does not duplicate prompt tables.
- Contract:
  - INPUT: facilitator sources (catalog, record skill, publish skill, registry, cohort table)
  - PRE: forbidden leaderboard framing documented in Overview and Reddit skeleton
  - OUTPUT: ~1.2–1.8k word guide + mermaid flow + Reddit skeleton section
  - POST: README index row **Public guide** points to guide
  - TERMINATION: sponsor close-out updates CHANGELOG; optional demos README pointer not required