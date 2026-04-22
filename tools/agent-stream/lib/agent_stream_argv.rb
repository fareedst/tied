# frozen_string_literal: true

require_relative 'tdd_loop_prompts'
require_relative 'feature_spec_batch_prompts'
require_relative 'lead_checklist_prompts'

# Process: [PROC-TIED_DEV_CYCLE] / [PROC-AGENT_REQ_CHECKLIST]
# REQ: REQ-ATDD-COMPOS-AGENT_STREAM_TDD_YAML
# ARCH: ARCH-ATDD-COMPOS-DELEGATE_TO_TDD_LOOP_PROMPTS
# IMPL: IMPL-ATDD-COMPOS-AGENT_STREAM_ARGV
# Implements: argv layer delegates --tdd-yaml to TddLoopPrompts; --feature-spec-batch-yaml to
# FeatureSpecBatchPrompts; --lead-checklist-yaml to LeadChecklistPrompts.
module AgentStreamArgv
  VERIFY_SESSION_PROMPT = 'what was the most recent prompt?'

  module_function

  def usage(program_name = $PROGRAM_NAME)
    warn <<~MSG
      Usage: #{program_name} [options] [--] [PROMPT_WORD]...

      Options:
        --session-id UUID     Resume this session for turn 1 (passed to agent as --resume)
        --workspace PATH      Pass --workspace to agent
        --prompt-file PATH    Session prefix: each file is prepended on every new agent session (not a separate turn); repeat for multiple argv parts in prepend order
        --prompts-file PATH   Multiple turns from one file, blocks separated by a line containing only ---
        --tdd-yaml PATH       Append one turn per step from docs/tdd_development_loop.yaml-style file
        --feature-spec-batch-yaml PATH   Append one turn per feature record (order, feature_name, goal, …)
        --feature-spec-batch-order ARG     With --feature-spec-batch-yaml: only records whose order matches ARG (single N or inclusive N-M)
        --preview-feature-spec-batch-yaml PATH   Print rendered prompts to stdout and exit (no agent; run_agent_stream.rb only)
        --lead-checklist-yaml PATH   Append one turn per main step (+ sub-procedures) from agent-req checklist YAML
        --lead-checklist-skip-sub    With --lead-checklist-yaml: omit sub_procedures turns (main steps only)
        --checklist-var KEY=VALUE    Repeatable; expands {{KEY}} in lead checklist YAML (synonym: --lead-checklist-var)
        --checklist-var-strict       Error if any {{NAME}} remains (env: AGENTSTREAM_CHECKLIST_VAR_STRICT=1)
        --verify-session      After all other turns, run a final turn with the session smoke prompt
        --dry-run             Print each turn's prompts and agent argv; do not run agent

      Turn order:
        1) Words from argv after -- (if any), as separate arguments to agent (same as shell word-splitting)
        2) Each block from each --prompts-file in order
        3) Each message generated from --tdd-yaml
        4) Each message generated from each --feature-spec-batch-yaml
        5) Each message generated from each --lead-checklist-yaml (steps, then sub_procedures unless --lead-checklist-skip-sub)
        6) If --verify-session: final smoke prompt

      Each --prompt-file body is prepended (in order, one argv part per file) before any turn that
      starts without --resume (including after a --feature-spec-batch-yaml record).

      At least one turn is required (argv words and/or files and/or --tdd-yaml and/or --feature-spec-batch-yaml and/or --lead-checklist-yaml).

      Streamed assistant/thinking text is printed to stdout. session_id=... is printed on stderr
      after each turn. Each --feature-spec-batch-yaml record starts a new agent session (no --resume
      from the prior turn). Lead checklist steps with agentstream_new_session: true start a new
      session; other consecutive turns use --resume with the previous session id.
    MSG
  end

  def split_prompts_file(path)
    text = File.read(path, encoding: 'UTF-8')
    text.split(/\r?\n---\s*\r?\n/).map(&:strip).reject(&:empty?).map { |block| [block] }
  end

  # chain_between[i] means turn i+1 uses --resume with the session after turn i.
  def append_turn(turns, chain_between, prompt_parts, chain_from_previous: true)
    chain_between << chain_from_previous if turns.any?

    turns << prompt_parts
  end

  def parse_argv(argv)
    session_id = nil
    workspace = nil
    dry_run = false
    verify_session = false
    prompt_file_paths = []
    prompts_file_paths = []
    tdd_yaml_paths = []
    feature_spec_batch_yaml_paths = []
    lead_checklist_yaml_paths = []
    lead_checklist_skip_sub = false
    checklist_vars = {}
    checklist_var_strict = ENV['AGENTSTREAM_CHECKLIST_VAR_STRICT'] == '1'
    feature_spec_batch_order_filter = nil
    rest = argv.dup

    while rest.any?
      case rest.first
      when '--session-id'
        rest.shift
        raise ArgumentError, 'missing value for --session-id' if rest.empty?

        session_id = rest.shift
      when '--workspace'
        rest.shift
        raise ArgumentError, 'missing value for --workspace' if rest.empty?

        workspace = rest.shift
      when '--prompt-file'
        rest.shift
        raise ArgumentError, 'missing value for --prompt-file' if rest.empty?

        prompt_file_paths << rest.shift
      when '--prompts-file'
        rest.shift
        raise ArgumentError, 'missing value for --prompts-file' if rest.empty?

        prompts_file_paths << rest.shift
      when '--tdd-yaml'
        rest.shift
        raise ArgumentError, 'missing value for --tdd-yaml' if rest.empty?

        tdd_yaml_paths << rest.shift
      when '--feature-spec-batch-yaml'
        rest.shift
        raise ArgumentError, 'missing value for --feature-spec-batch-yaml' if rest.empty?

        feature_spec_batch_yaml_paths << rest.shift
      when '--feature-spec-batch-order'
        rest.shift
        raise ArgumentError, 'missing value for --feature-spec-batch-order' if rest.empty?

        feature_spec_batch_order_filter = FeatureSpecBatchPrompts.order_filter_from_arg(rest.shift)
      when '--lead-checklist-yaml'
        rest.shift
        raise ArgumentError, 'missing value for --lead-checklist-yaml' if rest.empty?

        lead_checklist_yaml_paths << rest.shift
      when '--lead-checklist-skip-sub'
        rest.shift
        lead_checklist_skip_sub = true
      when '--checklist-var', '--lead-checklist-var'
        rest.shift
        raise ArgumentError, 'missing value for --checklist-var' if rest.empty?

        pair = rest.shift
        key, val = pair.split('=', 2)
        raise ArgumentError, '--checklist-var requires KEY=VALUE' if key.nil? || key.strip.empty?

        checklist_vars[key.strip] = val
      when '--checklist-var-strict'
        rest.shift
        checklist_var_strict = true
      when '--verify-session'
        rest.shift
        verify_session = true
      when '--dry-run'
        rest.shift
        dry_run = true
      when '--help', '-h'
        usage
        exit 0
      when '--'
        rest.shift
        break
      else
        break
      end
    end

    if feature_spec_batch_order_filter && feature_spec_batch_yaml_paths.empty?
      raise ArgumentError,
            '--feature-spec-batch-order requires at least one --feature-spec-batch-yaml PATH'
    end

    turns = []
    chain_between = []

    append_turn(turns, chain_between, rest, chain_from_previous: true) unless rest.empty?

    preload_parts = prompt_file_paths.map do |p|
      raise ArgumentError, "not a file: #{p}" unless File.file?(p)

      File.read(p, encoding: 'UTF-8').strip
    end

    prompts_file_paths.each do |p|
      raise ArgumentError, "not a file: #{p}" unless File.file?(p)

      split_prompts_file(p).each do |block_turn|
        append_turn(turns, chain_between, block_turn, chain_from_previous: true)
      end
    end

    tdd_yaml_paths.each do |p|
      raise ArgumentError, "not a file: #{p}" unless File.file?(p)

      TddLoopPrompts.messages_from_yaml(p).each do |msg|
        append_turn(turns, chain_between, [msg], chain_from_previous: true)
      end
    end

    feature_spec_batch_yaml_paths.each do |p|
      raise ArgumentError, "not a file: #{p}" unless File.file?(p)

      FeatureSpecBatchPrompts.messages_from_yaml(p, order_filter: feature_spec_batch_order_filter).each do |msg|
        append_turn(turns, chain_between, [msg], chain_from_previous: false)
      end
    end

    lead_checklist_yaml_paths.each do |p|
      raise ArgumentError, "not a file: #{p}" unless File.file?(p)

      LeadChecklistPrompts.step_entries_from_yaml(p, include_sub_procedures: !lead_checklist_skip_sub,
                                                       checklist_vars: checklist_vars,
                                                       checklist_var_strict: checklist_var_strict).each do |e|
        append_turn(turns, chain_between, [e[:message]], chain_from_previous: e.fetch(:chain_from_previous, true))
      end
    end

    append_turn(turns, chain_between, [VERIFY_SESSION_PROMPT], chain_from_previous: true) if verify_session

    raise ArgumentError, 'no prompts: provide argv words, --prompt-file, --prompts-file, --tdd-yaml, --feature-spec-batch-yaml, and/or --lead-checklist-yaml' if turns.empty?

    [session_id, workspace, turns, dry_run, chain_between, preload_parts]
  end
end
