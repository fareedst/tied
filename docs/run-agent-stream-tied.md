# Run agent stream: CITDP, LEAP, and TIED in one session

This repository vendors the **ATDD** Ruby harness (`run_agent_stream.rb`) so agents can drive the Cursor `agent` CLI in a **single session** with `--resume` chaining, without depending on an external checkout path.

**Upstream:** [run-agent-stream-upstream.md](run-agent-stream-upstream.md)  
**Vendored code:** [tools/agent-stream/README.md](../tools/agent-stream/README.md)

## Role in the methodology

- **`[PROC-AGENT_REQ_CHECKLIST]`** — Pass [docs/agent-req-implementation-checklist.yaml](agent-req-implementation-checklist.yaml) (or a per-request copy) via `--lead-checklist-yaml` so each main step and sub-procedure becomes one agent turn in order.
- **`[PROC-TIED_DEV_CYCLE]`** — Pass [docs/tdd_development_loop.yaml](tdd_development_loop.yaml) via `--tdd-yaml` to run the six-step TDD loop (RED/GREEN/REFACTOR/SYNC) as sequential turns; that file includes **persist CITDP record** and LEAP micro-cycle reminders where applicable.
- **LEAP** — When the checklist or loop instructs updating IMPL/ARCH/REQ after code–test drift, apply the reverse stack update in the same work item; the runner only automates *turn delivery*, not LEAP logic itself.
- **Traceability** — Requirements and decisions for the harness use tokens `REQ-ATDD-*`, `ARCH-ATDD-*`, `IMPL-ATDD-*` (see [semantic-tokens.yaml](../semantic-tokens.yaml)).

## IMPL procedure docs

- [run-agent-stream-impl-e2e.md](run-agent-stream-impl-e2e.md) — subprocess stream-json harness (`IMPL-ATDD-E2E-AGENT_STREAM`)
- [run-agent-stream-impl-composition.md](run-agent-stream-impl-composition.md) — argv/YAML delegation and export (`IMPL-ATDD-COMPOS-*`)

## Quick start (from repo root)

```bash
ruby tools/agent-stream/run_agent_stream.rb --workspace /path/to/project \
  --lead-checklist-yaml docs/agent-req-implementation-checklist.yaml
```

```bash
ruby tools/agent-stream/run_agent_stream.rb --workspace /path/to/project \
  --tdd-yaml docs/tdd_development_loop.yaml
```

Copy `session_id=…` from stderr to continue later with `--session-id`.

## Related scripts

- [scripts/run-feature-batch.sh](../scripts/run-feature-batch.sh) — default runner points at `tools/agent-stream/run_agent_stream.rb`
