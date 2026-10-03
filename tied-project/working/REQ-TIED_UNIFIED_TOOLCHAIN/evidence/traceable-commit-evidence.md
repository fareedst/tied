# traceable-commit evidence — REQ-TIED_UNIFIED_TOOLCHAIN Phase 4 arc

- **Vocabulary Touchpoint 3 VALIDATE:** `oracle fixture freeze`, `Go tree removal`, TS-only **`@tied/agentstream`**, `deprecation window` — [tied/vocab/agentstream.md](../../../tied/vocab/agentstream.md), [tied/vocab/tied-methodology.md](../../../tied/vocab/tied-methodology.md).
- **Scope:** Local delivery of Phase **4a–4d** (live executor, Ruby/shell retirement, default **`TIED_AGENTSTREAM_IMPL=ts`**, Go tree removed; fixtures under `mcp-server/packages/agentstream/testdata/`).
- **Delivery commit SHA:** `72b7d9d197d456b4dce8a9d062b112f4155d9ce36` (2026-09-23) — `feat(tied): complete Phase 4 unified toolchain (TS default, Go/Ruby removal)`.
- **Process close-out hygiene SHA:** `c6c2949` (2026-09-23) — `chore(tied): close Phase 4 arc with CITDP and tracker evidence`; post-commit `close_out` replay `phase4-full-close-out-2026-09-23` → **`allowed: true`**, envelope blocking gaps **0**.
- **Tests:** `cd mcp-server && npm run build && npm test` — **991/991** pass (2026-09-23, no Go).
- **Gates:**
  - Verification: [gates/phase4d-verification-gate.json](../gates/phase4d-verification-gate.json)
  - Arc **`close_out`:** re-run via `run-phase4-arc-close-out-gate.mjs` after this evidence update (expect **`allowed: true`**).
  - **`tied_verify`:** promoted **REQ-TIED_UNIFIED_TOOLCHAIN** → **Implemented**, **IMPL-TIED_UNIFIED_TOOLCHAIN** → **Active** (2026-09-23; `run-phase4d-tied-verify.mjs` with authoritative `tracker_path`)
- **Tokens:** REQ-TIED_UNIFIED_TOOLCHAIN, ARCH-TIED_UNIFIED_TOOLCHAIN, IMPL-TIED_UNIFIED_TOOLCHAIN, CITDP-REQ-TIED_UNIFIED_TOOLCHAIN
- **Push policy:** Sponsor requested push after close-out commits succeed.
