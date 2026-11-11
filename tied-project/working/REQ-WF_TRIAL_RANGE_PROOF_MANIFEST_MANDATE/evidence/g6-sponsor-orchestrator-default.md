# Sponsor checkpoint G6 — orchestrator default L3 gate

**Status:** Sponsor ack complete (2026-11-11)  
**REQ:** REQ-WF_TRIAL_RANGE_PROOF_MANIFEST_MANDATE

**Context:** WF-10 @ `1794369836-wf-agentstream-wf-10-claude-claudehaiku55low` exited orchestrator `0` with no `proof-facet-manifest.v1.json` because `WF_TRIAL_REQUIRE_PROOF_MANIFEST` was unset on a single-cell `workflow_trial_agentstream` run. Agents cited preload conditional text (“not required when unset”).

**Locked:**

- [x] **Default-on** — every `workflow-trial-agentstream` run (dry-run excepted) seeds scaffold and runs post–four-phase min-shape gate for **PROMPT-WF-01..12** (G5 Option B unchanged).
- [x] **Remove** `WF_TRIAL_REQUIRE_PROOF_MANIFEST` from shell, help, preload, and agent-facing docs (no deprecated alias).
- [x] **Keep** `WF_TRIAL_SKIP_PROOF_MANIFEST=1` as the sole operator escape hatch.
- [x] **Agent obligation** — unconditional preload + turn-3 four-phase goal to complete `files[]` during `@build-plan` (not keyed on env).

**Supersedes:** PLAN §1 row “Direct workflow_trial_agentstream — no mandate unless REQUIRE exported manually” (wave 1).
