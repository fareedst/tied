# IMPL: composition bindings (agent stream + export)

**Source:** Imported from ATDD (`docs/impl_composition_atdd_bindings.md`) at commit `eb88236290009b78eb11ea561816f0854176bf12`. See [run-agent-stream-upstream.md](run-agent-stream-upstream.md).

## Procedure: `wire_tdd_yaml_turns_from_argv`

**Process:** `[PROC-TIED_DEV_CYCLE]`  
**REQ:** `REQ-ATDD-COMPOS-AGENT_STREAM_TDD_YAML`  
**ARCH:** `ARCH-ATDD-COMPOS-DELEGATE_TO_TDD_LOOP_PROMPTS`  
**IMPL:** `IMPL-ATDD-COMPOS-AGENT_STREAM_ARGV`

**Effect:** Entry-point argv parsing appends one agent turn per message produced by `TddLoopPrompts.messages_from_yaml` for each `--tdd-yaml` path (function wiring; no UI).

### Pseudo-code

```
procedure wire_tdd_yaml_turns_from_argv(argv):
  parse argv into tdd_yaml_paths (among other flags)
  for each path in tdd_yaml_paths:
    for each message in TddLoopPrompts.messages_from_yaml(path):
      append turn [message] to the ordered turn list
```

**Output:** Turn list includes the same messages, in the same order, as iterating `messages_from_yaml` for each path in argv order.

---

## Procedure: `export_step_entries_to_markdown`

**Process:** `[PROC-TIED_DEV_CYCLE]`  
**REQ:** `REQ-ATDD-COMPOS-EXPORT_TDD_PROMPTS_STEPS`  
**ARCH:** `ARCH-ATDD-COMPOS-DELEGATE_TO_TDD_LOOP_PROMPTS`  
**IMPL:** `IMPL-ATDD-COMPOS-EXPORT_TDD_PROMPTS`

**Effect:** Export pipeline turns each YAML step entry from `TddLoopPrompts.step_entries_from_yaml` into one `.md` file under an output directory (entry-point delegation; no UI).

### Pseudo-code

```
procedure export_step_entries_to_markdown(yaml_path, out_dir):
  entries = TddLoopPrompts.step_entries_from_yaml(yaml_path)
  ensure out_dir exists
  for each entry in entries:
    write file (sanitized entry id).md with entry.message body
```

**Output:** File count equals `entries.size`; each file content matches `format_step` output for that step.

**STDD:** Use `ruby tools/agent-stream/export_tdd_prompts.rb` with defaults pointing at [docs/tdd_development_loop.yaml](tdd_development_loop.yaml).
