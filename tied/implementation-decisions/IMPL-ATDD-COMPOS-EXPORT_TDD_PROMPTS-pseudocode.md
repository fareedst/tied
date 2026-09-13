# [REQ-MODULE_VALIDATION] [ARCH-MODULE_VALIDATION] [IMPL-MODULE_VALIDATION] — export is testable without UI
# [IMPL-ATDD-COMPOS-EXPORT_TDD_PROMPTS] [ARCH-ATDD-COMPOS-DELEGATE_TO_TDD_LOOP_PROMPTS] [REQ-ATDD-COMPOS-EXPORT_TDD_PROMPTS_STEPS]
# Summary: Materialize each YAML step as one markdown file using the same entries as TddLoopPrompts.

Grammar-Version: v2

procedure export_step_entries_to_markdown(yaml_path, out_dir):
  Contract:
    INPUT: yaml_path: string where length(yaml_path) > 0; out_dir: string where length(out_dir) > 0
    PRE: yaml_path readable
    OUTPUT: count of markdown files written under out_dir
    POST:
      - success => one sanitized-id.md per step entry from TddLoopPrompts
      - failure => delegate parse error propagated
    FAILURE_MODES: YAML_DELEGATE_ERROR, OUTPUT_DIR_ERROR
    EFFECTS: IO

  # [IMPL-ATDD-COMPOS-EXPORT_TDD_PROMPTS] [ARCH-ATDD-COMPOS-DELEGATE_TO_TDD_LOOP_PROMPTS] [REQ-ATDD-COMPOS-EXPORT_TDD_PROMPTS_STEPS]
  # How: Single call to step_entries_from_yaml — delegates parsing to TddLoopPrompts per ARCH.
  entries = TddLoopPrompts.step_entries_from_yaml(yaml_path)
  # [IMPL-ATDD-COMPOS-EXPORT_TDD_PROMPTS] [ARCH-ATDD-COMPOS-DELEGATE_TO_TDD_LOOP_PROMPTS] [REQ-ATDD-COMPOS-EXPORT_TDD_PROMPTS_STEPS]
  # How: Ensure output tree exists — satisfies REQ file materialization.
  ensure out_dir exists
  # [IMPL-ATDD-COMPOS-EXPORT_TDD_PROMPTS] [ARCH-ATDD-COMPOS-DELEGATE_TO_TDD_LOOP_PROMPTS] [REQ-ATDD-COMPOS-EXPORT_TDD_PROMPTS_STEPS]
  # How: One file per entry with sanitized id and format_step body — REQ satisfaction criteria.
  for each entry in entries:
    write file (sanitized entry id).md with entry.message body
  return count of files written