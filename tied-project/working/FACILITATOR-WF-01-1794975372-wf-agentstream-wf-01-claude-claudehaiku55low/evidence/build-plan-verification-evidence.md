# Facilitator verification — `1794975372-wf-agentstream-wf-01-claude-claudehaiku55low`

**Recorded:** 2026-11-17 (store facilitator)

| Check | Result |
| --- | --- |
| Client root | `/Users/fareed/Documents/dev/test/1794975372-wf-agentstream-wf-01-claude-claudehaiku55low` |
| `git log -1` | `4daf4f8` (bootstrap only — **TIED 4.2.2**) |
| `npm test` | **31** pass, **0** fail |
| Product commit | **none** (untracked `src/`, `package.json`, `tied-project/working/`, etc.) |
| `tied_validate_consistency` | `ok: true` (client-scoped `TIED_BASE_PATH`; full JSON in `tied-validate-consistency.json`) |

```text
ℹ tests 31
ℹ pass 31
ℹ fail 0
```

**Notes:** Subject close_out not re-run. Live verification cell for interleaved four-phase driver + post-turn-1 slim tracker reconcile ([REQ-WF_TRIAL_INTERLEAVED_RESUME_CAPTURE], [REQ-WF_TRIAL_SLIM_TRACKER_INTER_TURN]). Orchestrator shell **`exit_code: 0`**; machine close_out still blocked.