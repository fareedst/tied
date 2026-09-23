# Run agent stream: CITDP, LEAP, and TIED in one session

> **Retired (Phase 4b, REQ-TIED_UNIFIED_TOOLCHAIN):** The vendored Ruby tree `tools/agent-stream/` was removed. Use **`tied agentstream`** or **`scripts/run-feature-batch-agentstream.sh`** (same flags as `scripts/run-feature-batch.sh`). Historical ATDD tokens (`REQ-ATDD-*`, `IMPL-ATDD-*`) and docs below describe the upstream design.

This repository previously vendored the **ATDD** Ruby harness (`run_agent_stream.rb`) for multi-turn `--resume` chaining. **Upstream:** [run-agent-stream-upstream.md](run-agent-stream-upstream.md)

## Role in the methodology

- **`[PROC-AGENT_REQ_CHECKLIST]`** — Pass [tied/docs/agent-req-implementation-checklist.yaml](../tied/docs/agent-req-implementation-checklist.yaml) (or a per-request copy) via `--lead-checklist-yaml` so each main step and sub-procedure becomes one agent turn in order.
- **`[PROC-TIED_DEV_CYCLE]`** — Pass [docs/tdd_development_loop.yaml](tdd_development_loop.yaml) via `--tdd-yaml` to run the six-step TDD loop (RED/GREEN/REFACTOR/SYNC) as sequential turns; that file includes **persist CITDP record** and LEAP micro-cycle reminders where applicable.
- **LEAP** — When the checklist or loop instructs updating IMPL/ARCH/REQ after code–test drift, apply the reverse stack update in the same work item; the runner only automates *turn delivery*, not LEAP logic itself.
- **Traceability** — Requirements and decisions for the harness use tokens `REQ-ATDD-*`, `ARCH-ATDD-*`, `IMPL-ATDD-*` (see [semantic-tokens.yaml](../semantic-tokens.yaml)).

## IMPL procedure docs

- [run-agent-stream-impl-e2e.md](run-agent-stream-impl-e2e.md) — subprocess stream-json harness (`IMPL-ATDD-E2E-AGENT_STREAM`)
- [run-agent-stream-impl-composition.md](run-agent-stream-impl-composition.md) — argv/YAML delegation and export (`IMPL-ATDD-COMPOS-*`)

## Go / TS `agentstream` (operator path)

**`tied agentstream`** (TypeScript default via `@tied/agentstream`; Go legacy via `TIED_AGENTSTREAM_IMPL=go`) covers feature-spec / lead-checklist / TDD YAML roles, **dynamic checklist control**, and optional MCP preflight. Prefer **`run-feature-batch-agentstream.sh`** or **`run-feature-batch.sh`** (delegates to agentstream). See [mcp-server/packages/agentstream/README.md](../mcp-server/packages/agentstream/README.md) and [tools/agentstream/README.md](../tools/agentstream/README.md) for flags and the control JSON schema.

## Quick start (from repo root)

```bash
scripts/run-feature-batch.sh \
  --workspace /path/to/project \
  --lead-checklist-yaml tied/docs/agent-req-implementation-checklist.yaml
```

```bash
TIED_AGENTSTREAM_IMPL=ts tied agentstream -w /path/to/project \
  --tdd-yaml docs/tdd_development_loop.yaml
```

Copy `session_id=…` from stderr to continue later with `--session-id`.

## Related scripts

- [scripts/run-feature-batch.sh](../scripts/run-feature-batch.sh) — delegates to `run-feature-batch-agentstream.sh`
- [scripts/run-feature-batch-agentstream.sh](../scripts/run-feature-batch-agentstream.sh) — Go / `tied agentstream` batch driver
