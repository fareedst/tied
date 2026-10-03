# [REQ-MODULE_VALIDATION] [ARCH-MODULE_VALIDATION] [IMPL-MODULE_VALIDATION] — export is testable without UI
# [IMPL-ATDD-COMPOS-EXPORT_TDD_PROMPTS] [ARCH-ATDD-COMPOS-DELEGATE_TO_TDD_LOOP_PROMPTS] [REQ-ATDD-COMPOS-EXPORT_TDD_PROMPTS_STEPS]
# Summary: Materialize each YAML step as one markdown file using the same entries as TddLoopPrompts.
procedure export_step_entries_to_markdown(yaml_path, out_dir):
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