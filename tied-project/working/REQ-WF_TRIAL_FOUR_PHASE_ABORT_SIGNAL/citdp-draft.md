# CITDP draft — REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL

**record_identity**

- **request_token:** `REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL`
- **profile_depth:** `minimal`
- **gate_policy:** `advisory`
- **change_type:** harness_orchestrator

**change_definition**

Improve operator and facilitator diagnosis when traditional four-phase agentstream aborts mid-batch (session limits, missing `session_id` after turn banner) so post-run [SC-WF-PHG-01] failures are not misread as handoff omission alone.

**Wave 1.5 (2026-11-12):** Salient stderr **session capacity highlight** (ERROR + provider reset line) before machine `incomplete_reason`; preflight fail-closed when Claude smoke already reports session limit (without `WF_TRIAL_STRICT_PREFLIGHT`); live agentstream highlight on Claude turn abort.

**risk_analysis**

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| False positive `claude_session_limit` on unrelated stdout | Low | Medium | Regex anchored to provider message; tests with negative fixtures |
| Manifest consumers break on new fields | Low | Low | Additive optional keys only |
| Wave 2 inter-turn gate scope creep | Med | High | Explicit deferral in PLAN R6; separate REQ token |

**adversarial_inquiry**

- **depth_tier:** `minimal`
- **gate_policy:** `advisory`
- **disposition:** not used (shell + bootstrap tests)

**test_strategy_ref**

[tied-project/working/REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL/test-strategy.md](./test-strategy.md)

**evidence**

- Incident: `1794504138-wf-agentstream-wf-10-claude-claudefable52low`
- Fixtures under `working/REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL/evidence/`
