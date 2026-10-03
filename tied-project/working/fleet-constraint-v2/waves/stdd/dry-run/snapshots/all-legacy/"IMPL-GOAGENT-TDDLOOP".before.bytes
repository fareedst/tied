# [IMPL-GOAGENT-TDDLOOP] [ARCH-GOAGENT-YAML-STEPS] [REQ-GOAGENT-YAML-STEP-RENDER]
# Summary: Require root map with steps array; emit one markdown message per step — ChainFromPrevious true at LoadTurns.

# How: Contract I/O (same IMPL/ARCH/REQ). Cross-IMPL — callee of IMPL-GOAGENT-PIPELINE; message shape parity with Ruby TddLoopPrompts used in IMPL-ATDD-COMPOS-AGENT_STREAM_ARGV (no runtime call). Turn from IMPL-GOAGENT-LIB-TYPES.

# INPUT: path to TDD loop YAML.
# OUTPUT: messages or []Turn from LoadTurns with ChainFromPrevious true per step turn.

procedure tddloop_messages(path):
  # [IMPL-GOAGENT-TDDLOOP] [ARCH-GOAGENT-YAML-STEPS] [REQ-GOAGENT-YAML-STEP-RENDER]
  # How: Unmarshal map; verify steps; format_step builds preamble, goals, tasks, outcomes, closing line.
  ON missing steps or unmarshal error: return error
  return messages