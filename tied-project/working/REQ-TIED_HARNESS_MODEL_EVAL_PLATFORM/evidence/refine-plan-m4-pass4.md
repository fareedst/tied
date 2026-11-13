# refine-plan M4 — pass 4

**date:** 2026-11-13  
**prompt_type:** refine-plan  
**request_token:** REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM

## RESOLVE summary

- **F-15:** `harness-eval-baseline-v1` + integrity hash + `regression compare` (wf_id × harness bind).
- **F-16:** `harness-eval-replay-manifest-v1` + `replay batch` wrapping `importWfClient`.
- **SC-HMEP-M4-05** added: skip missing `client_root`, exit 0.
- Registry markdown **out of scope** — [LEAP](../leap-proposals/registry-replay-manifest-generator.md).

## Gate

- `tied_checklist_gate_validate` **pre_implementation**: **allowed** (`ok: true`, advisory, minimal).

## Sponsor next step

**`@build-plan` M4** per [PLAN.md](../PLAN.md) §7d.

Optional parallel: **`@close-out` M3**.
