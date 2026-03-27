# TDD-State Agent Prompt

Use the configured TIED YAML MCP server `tied-yaml` and run `tdd_state_guide` in one uninterrupted sequence.

The state-guide contract: start with no `current_state`, then keep feeding back the returned state until `end` or `error`.

## Instructions

1. Set `const MAX = 20`.

2. Call `tdd_state_guide` with no arguments to start the sequence.

3. Each of the steps is part of a TDD sequence. Implement each step in order by generating tests and code.

4. Follow each record's tasks to achieve its goal and produce its outcomes.

5. After completing the tasks in the record, call `tdd_state_guide` for the next state.

6. If the tool returns `state: "end"` or `state: "error"`, the implementation is complete. Else, repeat until `MAX` iterations have completed.

7. On each iteration after the first, pass the previous returned state as `current_state`.

```js
const MAX = 20;
let currentState;

for (let iteration = 0; iteration < MAX; iteration += 1) {
  const args = currentState ? { current_state: currentState } : {};
  const result = await tdd_state_guide(args);
  print(result);

  if (result.state === "end" || result.state === "error") {
    break;
  }

  currentState = result.state;
}
```

8. Prefer the preload facts over filesystem discovery.
9. Do not search for MCP schema files, server metadata, project layout, or target file existence unless needed to resolve a contradiction.
10. Use the Shell tool to run the unit tests after each relevant code or test change.

## Example return for `tdd_state_guide`

This is likely the first step that you will receive. All records use the same keys.

```yaml
id: "S09.RED"
title: "Write Failing Test (Phase D)"
stage: "unit_tdd"
goals: "Map IMPL pseudo-code to a failing test."
tasks: [
  "Map one pseudo-code block or procedure to one test group.",
  "Name the test group after the procedure and include the REQ token.",
  "Carry the same REQ/ARCH/IMPL token comment as the pseudo-code block and state what the test validates.",
  "Write the failing test and confirm it fails for the expected reason.",
  "Verify each assertion corresponds to the pseudo-code output or effect.",
  "If no programmatic assertion can be written, mark the block `e2e_only` and document `e2e_only_reason`."
]
outcomes: "Failing test exists that matches pseudo-code; no production code written."
```

## Start State

MCP tdd_state_guide: omitting current_state (or calling with empty args) always returns the start state (S09.RED); to advance, pass arguments: { "current_state": "<previous tool response's state>" } exactly as in tools/tdd_state_guide.json.

Don’t assume the wrapper is broken if the state doesn’t advance—verify the payload includes current_state before digging into server files or package.json.

treat the following preload block as authoritative context. If a value is present in the preload block, do not spend tool calls rediscovering it unless a later tool result contradicts it.

```yaml
agent_preload:
  workflow:
    kind: tdd_state_machine
    mcp_server: tied-yaml
    tool: tdd_state_guide
    start_call: {}
    continue_call:
      current_state: "<previous returned state>"
    first_state: S09.RED
    terminal_states:
      - end
      - error
    max_iterations: 20
    state_sequence:
      - S09.RED
      - S09.GREEN
      - S09.REFACTOR
      - S09.SYNC
      - S10
      - S11
      - end
    operating_rules:
      - Do not pause between calls
      - Do not ask the user for confirmation during the sequence
      - Do not change any payload field except current_state
      - Treat non-terminal states as pass-through states
      - Stop immediately on end or error
      - Print each tool response exactly as received
```

## Operating Rules

* Do not pause between calls.
* Do not ask the user for confirmation during the sequence.
* Do not change any payload field except `current_state` on follow-up calls.
* Print each tool response exactly as received.
* Stop immediately when the tool returns `end` or `error`.
