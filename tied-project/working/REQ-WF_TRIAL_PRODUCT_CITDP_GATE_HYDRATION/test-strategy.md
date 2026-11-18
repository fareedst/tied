# Test strategy — REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION

**profile_depth:** minimal · **gate_policy:** advisory  
**Surface:** `mcp-server/src/dae/` + `mcp-server/src/tools/` (not disposable product `src/`).

## Fixtures

| File | Use |
| --- | --- |
| [fixtures/product-citdp-1794984015.yaml](./fixtures/product-citdp-1794984015.yaml) | WF product `citdp.v1` without `adversarial_inquiry` (1794984015 class) |
| [fixtures/disposable-tracker-1794984015.yaml](./fixtures/disposable-tracker-1794984015.yaml) | Slim disposable tracker with `minimal-depth-no-inquiry` stub |

**Live reference (read-only):** `/Users/fareed/Documents/dev/test/1794984015-wf-agentstream-wf-01-claude-claudehaiku55low`

## RED → GREEN order (`@build-plan`)

| Order | Case | Expected | SC |
| --- | --- | --- | --- |
| 1 | `hydrateCitdpForChecklistGate` on 4015 product body | Adds `risk_analysis.adversarial_inquiry` with `depth_tier: minimal` | SC-CGH-01 (unit) |
| 2 | Hydrated product + 4015 tracker through **real** `validateChecklistGate` verification | `allowed: true`; no `malformed_citdp` | SC-CGH-01 |
| 3 | Same composition **close_out** phase | `allowed: true`; no four `missing_*` list codes (requires MPGW) | SC-CGH-02 |
| 4 | Checklist CITDP with existing `adversarial_inquiry` | Hydration returns equivalent adversarial subtree | SC-CGH-03 |
| 5 | Product fixture with `profile_depth: integrated`, no adversarial | Hydration returns unchanged; gate `malformed_citdp` | SC-CGH-04 |
| 6 | `runGateCheckComposition` mock gate returning `allowed: false` + diagnostics | Summary `reasons` includes diagnostic codes, not only `gate_blocked` | SC-CGH-05 |
| 7 | `tied_checklist_gate_validate` with `citdp_path` only (no inline body) | Loads file, hydrates, allows minimal disposable verification | R6 |
| 8 | Both `citdp` and `citdp_path` set | MCP error or explicit failure | R6 negative |

## Regression

- [REQ-WF_TRIAL_MINIMAL_PROGRESSION_GATE_WAIVER](../REQ-WF_TRIAL_MINIMAL_PROGRESSION_GATE_WAIVER/test-strategy.md) SC-MPGW-01..07 remain green.
- Non-disposable store CITDP paths unchanged when hydration predicate false.

## Commands (locked)

```bash
cd mcp-server && npx tsx --test src/dae/citdp-gate-hydration.test.ts src/tools/tied-gate-check-mcp.test.ts
```

## Verification evidence (build-plan complete)

| SC | Evidence |
| --- | --- |
| SC-CGH-01..05 | `citdp-gate-hydration.test.ts`, `tied-gate-check-mcp.test.ts` |
| SC-CGH-06 | [evidence/sc-cgh-06-live-replay.md](./evidence/sc-cgh-06-live-replay.md) (dist via [sc-cgh-06-replay.mjs](./evidence/sc-cgh-06-replay.mjs)) |

**Close-out optional:** Re-run live client `1794984015` `tied_gate_check` with paths from [fixture-live-gate-1794984015.md](./evidence/fixture-live-gate-1794984015.md) after sponsor requests matrix smoke (not gating methodology REQ).

## Commands (close-out)

```bash
cd mcp-server && npx tsx --test src/dae/citdp-gate-hydration.test.ts src/tools/tied-gate-check-mcp.test.ts
node tied-project/working/REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION/evidence/sc-cgh-06-replay.mjs
```