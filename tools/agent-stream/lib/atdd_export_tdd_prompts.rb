# frozen_string_literal: true

require 'fileutils'
require_relative 'tdd_loop_prompts'

# Process: [PROC-TIED_DEV_CYCLE]
# REQ: REQ-ATDD-COMPOS-EXPORT_TDD_PROMPTS_STEPS
# ARCH: ARCH-ATDD-COMPOS-DELEGATE_TO_TDD_LOOP_PROMPTS
# IMPL: IMPL-ATDD-COMPOS-EXPORT_TDD_PROMPTS
# Implements: procedure export_step_entries_to_markdown — delegates to step_entries_from_yaml then writes one .md per step id.
module AtddExportTddPrompts
  module_function

  def export_from_yaml(yaml_path, out_dir)
    entries = TddLoopPrompts.step_entries_from_yaml(yaml_path)
    FileUtils.mkdir_p(out_dir)
    entries.each do |e|
      safe = e[:id].to_s.gsub(/[^a-zA-Z0-9._-]+/, '_')
      File.write(File.join(out_dir, "#{safe}.md"), "#{e[:message]}\n")
    end
    entries.size
  end
end
