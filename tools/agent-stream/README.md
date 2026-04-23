# Agent stream runner (vendored from ATDD)

Ruby harness for the Cursor `agent` CLI with `--print --output-format stream-json`, multi-turn `--resume` chaining, `--tdd-yaml`, and `--lead-checklist-yaml` (see [docs/run-agent-stream-tied.md](../../docs/run-agent-stream-tied.md)).

**Upstream:** [docs/run-agent-stream-upstream.md](../../docs/run-agent-stream-upstream.md)

**Requirements:** Ruby 3.x; `agent` on `PATH`.

**Run (from repo root):**

```bash
ruby tools/agent-stream/run_agent_stream.rb --workspace /path/to/project \
  --lead-checklist-yaml tied/docs/agent-req-implementation-checklist.yaml
```

```bash
ruby tools/agent-stream/run_agent_stream.rb --workspace /path/to/project \
  --tdd-yaml docs/tdd_development_loop.yaml
```

**Regenerate per-step markdown from the TDD loop YAML:**

```bash
ruby tools/agent-stream/export_tdd_prompts.rb
```
