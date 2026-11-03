# Session handoff — REQ-TIED_RUNTIME_DISK_CONFIG

**handoff_kind:** session  
**Date:** 2026-11-03  
**request_token:** REQ-TIED_RUNTIME_DISK_CONFIG  
**git:** `main` @ **`8a16acec`** (ahead of origin by 6)

## One line

Global **path** config is on-disk (mcp.json + `.tied/store.yaml`); operator shell should drop `TIED_REPO_ROOT` / `TIED_MCP_BIN` exports per [operator-shell-profile.md](./operator-shell-profile.md). **Next program:** full non-secret env → disk — [pending-full-runtime-disk-handoff.md](./pending-full-runtime-disk-handoff.md).

## Plan spine

| Track | Status | SHAs | Plan |
| --- | --- | --- | --- |
| Pass 1 — RDC traceability + e2e | done | `eded7a37` | [PLAN-refine-pass2.md](../PLAN-refine-pass2.md) |
| Pass 2 — global path env cleanup | done | `eb9a0e17`, close-out `8a16acec` | [PLAN-rdc-env-cleanup-pass2.md](../PLAN-rdc-env-cleanup-pass2.md) |
| Pass 3 — full runtime on disk (except secrets) | **closed** (gates; commit deferred) | — | [close-out-handoff.md](./close-out-handoff.md) |

## Completion signals (pass 2)

| Signal | Status |
| --- | --- |
| Machine | `close-out-rdc-pass2-20261103` — `merged_decision.allowed: true`, blocking envelope gaps 0 ([receipt](./closeout-run-close-out-gates-pass2.json)) |
| Process | CITDP @ [tied-project/citdp/CITDP-REQ-TIED_RUNTIME_DISK_CONFIG.yaml](../../../citdp/CITDP-REQ-TIED_RUNTIME_DISK_CONFIG.yaml); [close-out-handoff.md](./close-out-handoff.md) |
| Ledger | `--reconcile` in close-out runner |
| `tied_verify` | blocked at verification gate (minimal advisory — non-blocking for pass 2 close_out) |

## Operator migration (you)

```bash
./tied-install.sh --refresh .          # store
./tied-install.sh --refresh /path/client   # each linked client
```

Trim dev shell per [operator-shell-profile.md](./operator-shell-profile.md). Optional push: `git push origin main`.

## Entry — next session

1. Read [pending-full-runtime-disk-handoff.md](./pending-full-runtime-disk-handoff.md).
2. `@add-feature` or `@refine-plan` for “full runtime disk except secrets” (extend REQ or new token in refine).
3. Deferred (unchanged): MCP introspection item E; TS/JS runtime fixture parity (NON-TIED handoff).

## Dirty tree (do not commit casually)

Unrelated local drift: mcp-server test fixture envelopes, source-graph/corpus index JSON, `tied-bundle/docs/agent-preload-contract-template.yaml`, evaluation envelope-gap report, checklist fixture manifest. Untracked: stray `tied-project/citdp/CITDP-REQ-{ACTIVATION,...}.yaml`, `.tied/`, duplicate `mcp-server/.../tied-runtime-config.ts` if not part of a deliberate slice.

## Verify

```bash
node --test tools/bootstrap/lib/tied-runtime-config.test.mjs \
  tools/bootstrap/lib/mcp-base-path.test.mjs tools/bootstrap/lib/mcp-layer.test.mjs \
  tools/bootstrap/lib/layout.test.mjs tools/bootstrap/lib/copy-managed.test.mjs \
  tools/bootstrap/lib/tied-cli-invoke.test.mjs

cd mcp-server && npx tsx --test \
  src/e2e/bootstrap-and-load.test.ts \
  packages/agentstream/src/jev-harness-preflight.test.ts \
  packages/agentstream/src/jev-harness-shared.test.ts \
  src/jev/plan-skills.test.ts
```
