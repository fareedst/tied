# Phase handoff — refine-plan (phase 2)

**REQ:** REQ-WF_TRIAL_MODEL_EFFORT  
**Skill:** refine-plan  
**plan_phase:** pre-implementation  
**Next:** `@build-plan`

## RESOLVE (closed)

- **Cursor model effort** → `--model` bracket `effort=` when `MODEL_EFFORT` / `--model-effort` set (always append; opt-out `AGENTSTREAM_CURSOR_MODEL_BRACKET_EFFORT=0`)
- **Cursor argv parity** → default `--approve-mcps`, `--add-dir` (store root); optional `--auto-review` / `--stream-partial-output` via env
- **Claude / shell** → unchanged from phase 1

## Gates

- `depth_tier`: minimal  
- `gate_policy`: advisory  
- Adversarial inquiry: N/A (minimal); see `sub-adversarial-inquiry-pass-na.md`

## Artifacts updated

| Path | Role |
| --- | --- |
| [PLAN.md](../PLAN.md) | Phase 2 sequence + locked decisions |
| [test-strategy.md](../test-strategy.md) | Bracket + cursor-agent-argv cases |
| [CITDP-REQ-WF_TRIAL_MODEL_EFFORT.draft.yaml](../CITDP-REQ-WF_TRIAL_MODEL_EFFORT.draft.yaml) | Phase 2 change definition |
| [session-handoff.md](./session-handoff.md) | Phase 2 required steps |

## Scope note

Reopens **same** REQ token via LEAP; does not change `workflow_trial_range` signature.
