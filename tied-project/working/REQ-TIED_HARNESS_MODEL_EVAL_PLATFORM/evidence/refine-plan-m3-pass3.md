# refine-plan M3/M4 — pass 3

**date:** 2026-11-13  
**prompt_type:** refine-plan  
**request_token:** REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM

## RESOLVE summary

- M3 **F-10** → file-backed **billing ledger** + **schema v3** + `report reconcile` (no live APIs).
- M4 **F-15/F-16** → **regression baselines** YAML + **`replay batch`** manifest driver.
- Milestone order: M3 then M4; separate build/close-out cycles.

## Gate

- `tied_checklist_gate_validate` **pre_implementation**: **allowed** (`ok: true`, `blocking: false`, depth minimal, advisory).

## M2 verification (unchanged)

```bash
cd mcp-server/packages/harness-eval && npm test
node --test mcp-server/contracts/harness-eval/*.test.mjs
```

## Sponsor next step

**`@build-plan` M3** per [PLAN.md](../PLAN.md) §7c.
