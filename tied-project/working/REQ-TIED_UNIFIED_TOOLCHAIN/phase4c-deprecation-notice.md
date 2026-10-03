# Phase 4c — TypeScript default and Go deprecation window

| Field | Value |
| --- | --- |
| **REQ** | REQ-TIED_UNIFIED_TOOLCHAIN |
| **Slice** | phase-4c-default-flip |
| **Date** | 2026-09-23 |
| **Sponsor policy** | OQ-4-4 — **one tagged release** on `origin/main` with Go still present, TS default in **4c** |

## What changed

- **`tied agentstream`** and **`@tied/agentstream`** now default to **TypeScript** when `TIED_AGENTSTREAM_IMPL` is **unset** (same as explicit `ts`).
- Documented TIED operator flows (preview, dry-run, reconcile, live checklist / tracker mode per Phase **4a**) run TS-native without setting env.

## Go legacy opt-in (deprecation window — closed at 4d)

Phase **4d** (2026-09-23) **removed** the Go tree. `TIED_AGENTSTREAM_IMPL=go` now **fails** with a message pointing to [phase4d-go-oracle-freeze.json](./phase4d-go-oracle-freeze.json). Emergency fallback: **checkout `last_go_oracle_commit`** from that file (OQ-4-1). Operator stub: [tools/agentstream/README.md](../../tools/agentstream/README.md).

## Release / CHANGELOG

Record this flip in the **next tagged release** notes on `origin/main`, linking this file. Go removal (**4d**) must not ship in the same tag unless sponsor waives the one-cycle window.

## RISK-UNIFIED-004 (performance)

No critical TS vs Go subprocess regression observed blocking the default flip. Parity tests and existing executor fixtures remain the gate; optional micro-benchmark notes: [phase4c-risk-unified-004-benchmark-note.md](./phase4c-risk-unified-004-benchmark-note.md).

## Phase 4d completion

Go removal, fixture migration, and TS-only operator path: see [PLAN.md](./PLAN.md) delivery snapshot and [phase4d-go-oracle-freeze.json](./phase4d-go-oracle-freeze.json).
