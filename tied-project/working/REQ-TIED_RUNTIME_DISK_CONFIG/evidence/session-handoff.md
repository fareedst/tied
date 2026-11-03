# Session handoff — REQ-TIED_RUNTIME_DISK_CONFIG

**handoff_kind:** session  
**Date:** 2026-11-03  
**request_token:** REQ-TIED_RUNTIME_DISK_CONFIG  
**git:** `main` @ _(see traceable commit below)_ (ahead of origin)

## One line

**Paths (pass 2)** and **non-secret operator toggles (pass 3)** are on-disk: `.tied/store.yaml`, `.tied/operator.local.yaml`, and client `.cursor/mcp.json` after `./tied-install.sh --refresh`. Use [operator-shell-profile.md](./operator-shell-profile.md); secrets stay env-only.

## Plan spine

| Track | Status | SHAs | Plan / handoff |
| --- | --- | --- | --- |
| Pass 1 — RDC traceability + e2e | done | `eded7a37` | [PLAN-refine-pass2.md](../PLAN-refine-pass2.md) |
| Pass 2 — global path env cleanup | done | `eb9a0e17`, `8a16acec` | [PLAN-rdc-env-cleanup-pass2.md](../PLAN-rdc-env-cleanup-pass2.md) |
| Pass 3 — full runtime on disk (except secrets) | **closed** | `b2548e98` | [PLAN-rdc-full-runtime-disk-pass3.md](../PLAN-rdc-full-runtime-disk-pass3.md), [close-out-handoff.md](./close-out-handoff.md) |
| Follow-up — agentstream disk resolver | **closed** | _(this commit)_ | SC-RDC-CONSUMERS — `tied-runtime-config.ts` |

## Completion signals (pass 3)

| Signal | Status |
| --- | --- |
| **Machine close-out** | pass — [closeout-run-close-out-gates-pass3.json](./closeout-run-close-out-gates-pass3.json) |
| **Process contract** | pass — CITDP @ [tied-project/citdp/](../../../citdp/CITDP-REQ-TIED_RUNTIME_DISK_CONFIG.yaml); manifest + envelope synced |
| **Adherence ledger** | pass (B) — reconcile; advisory `evidence_stale` on legacy pass-2 gate receipts |
| **Traceable commit** | pass 3 **`b2548e98`**; follow-up _(this commit)_ — [traceable-commit-evidence.md](./traceable-commit-evidence.md) |

## Operator migration

```bash
./tied-install.sh --refresh .              # store
./tied-install.sh --refresh /path/client   # each linked client
```

Edit `.tied/operator.local.yaml` or `store.yaml` `operator:` for toggles; drop catalogued shell exports per operator profile.

Optional: `git push origin main`

## Deferred (unchanged)

- MCP introspection (`tied_config_get_base_path` store_root / config_sources) — NON-TIED handoff E  
- Shared JS/TS runtime fixture parity — NON-TIED handoff 4  

## Verify (pass 3 battery)

```bash
node --test tools/bootstrap/lib/tied-runtime-config.test.mjs \
  tools/bootstrap/lib/mcp-config.test.mjs \
  tools/bootstrap/lib/layers/mcp-layer.test.mjs \
  tools/bootstrap/lib/tied-cli-invoke.test.mjs

cd mcp-server && npx tsx --test \
  src/usage-metrics.test.ts \
  src/request-evidence-envelope/hooks.composition.test.ts

cd mcp-server/packages/agentstream && npm run build && npx tsx --test \
  src/tied-runtime-config.test.ts \
  src/jev-harness-shared.test.ts \
  src/jev-harness-preflight.test.ts
```

## Workspace

Cleared 2026-11-03 (**`bb06de0a`** gitignore); agentstream resolver follow-up committed separately.
