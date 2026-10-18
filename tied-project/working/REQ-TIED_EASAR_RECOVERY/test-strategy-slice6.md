# Test strategy — EASAR Slice 6 (Stage 9 portable export)

**REQ:** [REQ-TIED_EASAR_RECOVERY] · **Depth:** integrated · **Policy:** advisory  
**Authoritative E2E:** [evidence/slice6-e2e-plan.md](./evidence/slice6-e2e-plan.md) (refine pass 2 — 2026-10-18)  
**Refine receipt:** [evidence/refine-plan-slice6-pass2-2026-10-18.md](./evidence/refine-plan-slice6-pass2-2026-10-18.md)

## Matrix

| Kind | File | Asserts |
| --- | --- | --- |
| unit | `recovery-export-v1.test.ts` | Map schema, transform ids, stable manifest hash, gaps preserved |
| unit | `recovery-export-mcp.test.ts` | MCP writes manifest path under working evidence |
| composition | dogfood CLI/MCP | stdd map → `recovery-export-manifest.v1.json` with ≥5 entries |
| regression | `easar-receipts/*.test.ts` | Slices 1–5 receipts unchanged |

## Commands

```bash
npm test --prefix mcp-server -- recovery-export easar-receipts validation
npm run lint:ts --prefix mcp-server
```

## Proof boundaries

- No gate on full §6.2 tree completeness; `gaps[]` documents deferrals.
- Export must not mutate `tied-project/*.yaml` indexes.
