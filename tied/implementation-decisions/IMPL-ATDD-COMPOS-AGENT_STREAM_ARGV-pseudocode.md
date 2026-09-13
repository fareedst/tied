# [REQ-MODULE_VALIDATION] [ARCH-MODULE_VALIDATION] [IMPL-MODULE_VALIDATION] — thin argv composition; validated modules before integration
# [IMPL-ATDD-COMPOS-AGENT_STREAM_ARGV] [ARCH-ATDD-COMPOS-DELEGATE_TO_TDD_LOOP_PROMPTS] [REQ-ATDD-COMPOS-AGENT_STREAM_TDD_YAML]
# Summary: Build ordered turn list; for each --tdd-yaml file, append one turn per message from TddLoopPrompts (no duplicate YAML rules).

Grammar-Version: v2

procedure wire_tdd_yaml_turns_from_argv(argv):
  Contract:
    INPUT: argv: list where length(argv) >= 0
    PRE: argv parsed
    OUTPUT: ordered turn list for downstream agent_command
    POST:
      - success => one turn per TddLoopPrompts message per path in argv order
    FAILURE_MODES: TDD_YAML_DELEGATE_ERROR
    EFFECTS: pure

  # [IMPL-ATDD-COMPOS-AGENT_STREAM_ARGV] [ARCH-ATDD-COMPOS-DELEGATE_TO_TDD_LOOP_PROMPTS] [REQ-ATDD-COMPOS-AGENT_STREAM_TDD_YAML]
  # How: Scan argv for --tdd-yaml path tokens; preserve order — implements REQ turn ordering.
  parse argv into tdd_yaml_paths (among other flags)
  # [IMPL-ATDD-COMPOS-AGENT_STREAM_ARGV] [ARCH-ATDD-COMPOS-DELEGATE_TO_TDD_LOOP_PROMPTS] [REQ-ATDD-COMPOS-AGENT_STREAM_TDD_YAML]
  # How: Delegate message expansion to TddLoopPrompts only — satisfies ARCH single-parser decision.
  for each path in tdd_yaml_paths in order:
    for each message in TddLoopPrompts.messages_from_yaml(path):
      append turn [message] to the ordered turn list
  return ordered turn list for downstream agent_command / run_stream