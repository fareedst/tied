# [IMPL-GOAGENT-TDDLOOP] [ARCH-GOAGENT-YAML-STEPS] [REQ-GOAGENT-YAML-STEP-RENDER]
# Summary: Require root map with steps array; emit one markdown message per step — ChainFromPrevious true at LoadTurns.

# How: Contract I/O (same IMPL/ARCH/REQ). Cross-IMPL — callee of IMPL-GOAGENT-PIPELINE; message shape parity with Ruby TddLoopPrompts used in IMPL-ATDD-COMPOS-AGENT_STREAM_ARGV (no runtime call). Turn from IMPL-GOAGENT-LIB-TYPES.

# INPUT: path to TDD loop YAML.
# OUTPUT: messages or []Turn from LoadTurns with ChainFromPrevious true per step turn.


Grammar-Version: v2

procedure tddloop_messages(path):
  Contract:
    INPUT: path: string where length(path) > 0
    PRE: path readable
    OUTPUT: messages or []Turn from LoadTurns with ChainFromPrevious true per step
    POST:
      - success => one markdown message per steps[] entry
      - failure => error when root map or steps array invalid
    FAILURE_MODES: YAML_UNMARSHAL_ERROR, MISSING_STEPS
    EFFECTS: IO

  # [IMPL-GOAGENT-TDDLOOP] [ARCH-GOAGENT-YAML-STEPS] [REQ-GOAGENT-YAML-STEP-RENDER]
  # How: Unmarshal map; verify steps; format_step builds preamble, goals, tasks, outcomes, closing line.
  ON missing steps or unmarshal error: return error
  return messages