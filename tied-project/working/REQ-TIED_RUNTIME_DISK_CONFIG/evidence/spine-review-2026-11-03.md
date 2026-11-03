# Plan spine review — REQ-TIED_RUNTIME_DISK_CONFIG

**Date:** 2026-11-03  
**Reviewer:** agent session (post follow-up **`d7c46e7f`**)

## Spine vs outcome

| Track | Plan | Intent | Outcome |
| --- | --- | --- | --- |
| Pass 1 | [PLAN-refine-pass2.md](../PLAN-refine-pass2.md), [PLAN-e2e-exec-followthrough-pass1.md](../PLAN-e2e-exec-followthrough-pass1.md) | Promote NON-TIED resolver to REQ; IMPL LEAP; SC map | **Done** — tokens, CITDP, sidecars, e2e exec path (`eded7a37` chain) |
| Pass 2 | [PLAN-rdc-env-cleanup-pass2.md](../PLAN-rdc-env-cleanup-pass2.md) | Drop global path env from consumers; SC-RDC-CONSUMERS | **Done** — harness tests + scripts; closed `8a16acec` |
| Pass 3 | [PLAN-rdc-full-runtime-disk-pass3.md](../PLAN-rdc-full-runtime-disk-pass3.md) | Operator toggles on disk; SC-RDC-OPERATOR-DISK | **Done** — bootstrap refresh + tests; closed `b2548e98` |
| Follow-up | (handoff) | Ship missing `tied-runtime-config.ts` at HEAD | **Done** — `d7c46e7f`; 18/18 agentstream tests |

Historical plan todos marked **pending** in pass 1 refine docs are **superseded** by later passes and close-out; no open implement gate for RDC core.

## Success criteria matrix

| ID | Metric (REQ/CITDP) | Run 2026-11-03 | Result |
| --- | --- | --- | --- |
| SC-RDC-RESOLVE | `tied-runtime-config.test.mjs`, `tied-cli-invoke.test.mjs` | bootstrap battery | **pass** (48 tests) |
| SC-RDC-STORE | `tied-runtime-config.test.mjs` | included above | **pass** |
| SC-RDC-REFRESH | `mcp-layer.test.mjs` | included above | **pass** |
| SC-RDC-INSTALL-WRITES | mcp-layer + refresh smoke | included + `./tied-install.sh --refresh .` | **pass** (exit 0) |
| SC-RDC-IGNORE-ENV | `tied-runtime-config.test.mjs` | included above | **pass** |
| SC-RDC-FAIL-CLOSED | `tied-runtime-config.test.mjs` | included above | **pass** |
| SC-RDC-CONSUMERS | `jev-harness-shared.test.ts` (+ `tied-runtime-config.test.ts`) | agentstream | **pass** (18/18) |
| SC-RDC-OPERATOR-DISK | runtime-config + mcp-config + mcp-layer | included in bootstrap battery | **pass** |
| SC-TFL-STORE-TIED | `layout.test.mjs` | included above | **pass** |
| SC-LCI-STORE-DOCS | `install-layers.integration.test.mjs`, `copy-managed.test.mjs` | integration | **pass** (store self DOCS case) |
| SC-LCI-REFRESH-SMOKE | `./tied-install.sh --refresh .` | store refresh | **pass** |
| CITDP CLI contract | `bootstrap-and-load.test.ts` | `npx tsx --test src/e2e/bootstrap-and-load.test.ts` | **partial** — **2/5 fail** |

### E2E gap (pass-4 candidate, not RDC resolver core)

Failures assume **install-time shell** `TIED_MCP_COLLECT_METRICS` / `TIED_MCP_METRICS_CLIENT` shape refresh output. Pass 3 **disk-first operator** sync overrides that path:

- `initializes opt-in MCP metrics fields…` — metrics client basename undefined vs expected tag
- `refreshes layered vocabulary…` — expects `TIED_MCP_METRICS_CLIENT: should-not-rewrite` after refresh; operator yaml / refresh now wins

**Recommendation:** Small **test + LEAP** slice (update e2e to set operator disk or expect operator-driven mcp.json), or explicit SC note that metrics **client id** remains env/brownfield while **collect** is operator-disk. **Not** a pass-4 resolver rewrite.

## CITDP / REQ hygiene notes

| Item | Status |
| --- | --- |
| `SC-RDC-OPERATOR-DISK` in CITDP `success_criteria` root list | Only in `pass3_extension.success_criteria_add` — optional merge into root list for auditors |
| REQ `status` | Still **Draft** — sponsor may set **Implemented** after e2e alignment or accept advisory gap |
| Pass 3 close_out gate | **pass** (prior); no re-run required for follow-up commit |
| `change_definition.current_behavior` in CITDP | Stale (pre-promotion wording) — optional LEAP one-liner |

## Deferred (confirmed out of scope)

Per CITDP `non_goals` and session handoff — **no pass-4** unless sponsor opens new REQ:

1. **MCP introspection** — `tied_config_get_base_path` store_root / config_sources (NON-TIED handoff E)
2. **Shared JS/TS runtime fixture parity** — single module tested in bootstrap + agentstream separately (handoff 4)

## Sign-off recommendation

| Verdict | Detail |
| --- | --- |
| **RDC product intent** | **Complete** for paths, install surfaces, operator toggle catalog, agentstream linked-client resolution |
| **Traceability** | **Complete** for passes 1–3 + follow-up commits |
| **Verification gate** | **Complete** at unit/integration layer; **open** at `bootstrap-and-load.test.ts` (2 cases) |
| **Pass 4** | **Optional** — e2e LEAP for operator-disk vs legacy metrics env expectations only |
| **Push** | 11 commits local; push when sponsor accepts sign-off |

## Commands (green subset)

```bash
node --test tools/bootstrap/lib/tied-runtime-config.test.mjs \
  tools/bootstrap/lib/mcp-base-path.test.mjs \
  tools/bootstrap/lib/mcp-layer.test.mjs \
  tools/bootstrap/lib/layout.test.mjs \
  tools/bootstrap/lib/copy-managed.test.mjs \
  tools/bootstrap/lib/tied-cli-invoke.test.mjs \
  tools/bootstrap/lib/mcp-config.test.mjs

node --test tools/bootstrap/install-layers.integration.test.mjs

cd mcp-server/packages/agentstream && npm run build && npx tsx --test \
  src/tied-runtime-config.test.ts \
  src/jev-harness-shared.test.ts \
  src/jev-harness-preflight.test.ts

./tied-install.sh --refresh .
```
