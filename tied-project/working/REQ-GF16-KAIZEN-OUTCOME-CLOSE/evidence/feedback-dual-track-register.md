# Dual feedback track register — GF-16 cohort

**Arc coordinator:** `REQ-GF16-KAIZEN-OUTCOME-CLOSE` (dual-track close + Track B)  
**Track A countermeasure REQ:** **`REQ-TIED_CLIENT_FEEDBACK_CAPTURE`** (separate build-plan)  
**Client witness:** `/Users/fareed/Documents/dev/test/1792937222-gf-16`  
**Updated:** 2026-10-25 (coordinator build-plan complete; both feedback rows **`canonical_ready`**)

Both rows live in store `tied-project/feedback.yaml`. Each arc runs **observation → countermeasure → outcome observation** as TIED clients operate; evidence accumulates under this working folder and client paths.

| Track | Feedback id | Problem (operational observation) | Countermeasure / owning REQ | Completion signals | Outcome (Phase 6) |
| --- | --- | --- | --- | --- | --- |
| **A — Capture gap** | **`fb-mvnyr5n2-aaeg1j`** | Client session **did not submit** upstream feedback despite agent narrative; no receipt; facilitator ingest skipped | **`REQ-TIED_CLIENT_FEEDBACK_CAPTURE`** — [`PLAN.md`](../../REQ-TIED_CLIENT_FEEDBACK_CAPTURE/PLAN.md) | **Implemented (docs)** — close-out/skill/facilitator prose + contract tests (2026-10-25 build-plan); cohort receipt on **next** trial | **`not_measured`** (`oo-mvnytkgp-17p51v`) until next cohort shows receipt or N/A |
| **B — CLI base path** | **`fb-mvny01eb-my451g`** | **`tied-cli.sh`** depended on **unset shell env** / script-dir store root; wrong-tree YAML writes vs IDE MCP | **`REQ-TIED_CLI_MCP_JSON_BASE_PATH`** (+ resolver import LEAP) | Bootstrap tests green; GF-16 cwd smoke JSON | **`improved`** (`oo-mvnyuari-ma64j2`) |

**Cross-link:** Track A and B share the same GF-16 session but **must not merge** into one feedback row—different failure modes (process capture vs tooling config).

**Client-operating evidence (ongoing):**

- GF-16 smoke: `evidence/gf16-tied-cli-base-path-smoke.json` (Track B)
- Capture witness: client traceable-commit + optional client `tied/feedback.yaml` (Track A)
- Store trial readout: `docs/demos/trial-readout-PROMPT-GF-16-1792937222.md`
